const express = require('express');
const cors = require('cors');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Configure CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'https://ttrpg-companion-frontend.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something broke!',
        error: err.message
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// In-memory storage for characters
let characters = [];
let nextId = 1;

// Simple character model
const Character = {
    create: (data) => {
        const character = { ...data, id: nextId++ };
        characters.push(character);
        return character;
    },
    findById: (id) => characters.find(c => c.id === parseInt(id)),
    updateById: (id, data) => {
        const index = characters.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
            characters[index] = { ...characters[index], ...data };
            return characters[index];
        }
        return null;
    },
    deleteById: (id) => {
        const index = characters.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
            return characters.splice(index, 1)[0];
        }
        return null;
    },
    findAll: () => [...characters]
};

console.log('Starting server on port:', port);

// Initialize Socket.IO
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Environment Variables:');
    console.log('PORT:', port);
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
});

const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'https://ttrpg-companion-frontend.onrender.com',
        methods: ['GET', 'POST']
    }
});

// Socket.IO handlers
io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Handle character creation event
    socket.on('characterCreated', (character) => {
        socket.broadcast.emit('characterCreated', character);
    });

    // Handle character update event
    socket.on('characterUpdated', (character) => {
        socket.broadcast.emit('characterUpdated', character);
    });

    // Handle character deletion event
    socket.on('characterDeleted', (characterId) => {
        socket.broadcast.emit('characterDeleted', characterId);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Routes
app.get('/api/characters', (req, res) => {
    res.json(Character.findAll());
});

app.get('/api/characters/:id', (req, res) => {
    const character = Character.findById(req.params.id);
    if (!character) {
        return res.status(404).json({ message: 'Character not found' });
    }
    res.json(character);
});

app.post('/api/characters', (req, res) => {
    try {
        console.log('Creating character with data:', req.body);
        
        // Validate request body
        if (!req.body || !req.body.name || !req.body.race || !req.body.class) {
            return res.status(400).json({
                message: 'Missing required fields',
                details: 'name, race, and class are required'
            });
        }

        // Create character with basic data
        const character = Character.create({
            name: req.body.name,
            race: req.body.race,
            class: req.body.class,
            suitRoles: req.body.suitRoles || [],
            level: 1,
            attributes: {
                clubs: 0,
                diamonds: 0,
                hearts: 0,
                spades: 0
            },
            unspentPoints: 10
        });

        // Initialize attributes based on suit roles
        if (character.suitRoles && character.suitRoles.length > 0) {
            character.suitRoles.forEach(suit => {
                character.attributes[suit] = 2;
            });
            
            // Calculate remaining points
            const usedPoints = character.suitRoles.length * 2;
            character.unspentPoints = 10 - usedPoints;
        }
        
        // Emit the event
        io.emit('characterCreated', character);
        
        res.status(201).json(character);
    } catch (error) {
        console.error('Error in POST /api/characters:', error);
        res.status(400).json({ 
            message: error.message,
            details: error 
        });
    }
});

app.put('/api/characters/:id', (req, res) => {
    const character = Character.updateById(req.params.id, req.body);
    if (!character) {
        return res.status(404).json({ message: 'Character not found' });
    }
    io.emit('characterUpdated', character);
    res.json(character);
});

app.delete('/api/characters/:id', (req, res) => {
    try {
        const character = Character.findById(req.params.id);
        if (!character) {
            return res.status(404).json({ message: 'Character not found' });
        }

        // Delete character
        const deletedCharacter = Character.deleteById(req.params.id);
        
        if (!deletedCharacter) {
            return res.status(404).json({ message: 'Character not found' });
        }

        // Emit the event
        io.emit('characterDeleted', deletedCharacter.id);
        
        res.json(deletedCharacter);
    } catch (error) {
        console.error('Error deleting character:', error);
        res.status(500).json({ message: 'Failed to delete character' });
    }
});

// Point spending endpoint
app.put('/api/characters/:id/spend', (req, res) => {
    try {
        const { suit, points } = req.body;
        const character = Character.findById(req.params.id);
        
        if (!character) {
            return res.status(404).json({ message: 'Character not found' });
        }

        // Validate input
        if (!['clubs', 'diamonds', 'hearts', 'spades'].includes(suit)) {
            throw new Error('Invalid suit');
        }
        if (points <= 0) {
            throw new Error('Points must be positive');
        }
        if (points > character.unspentPoints) {
            throw new Error('Not enough unspent points');
        }

        // Calculate new value and check max
        const newAttributeValue = character.attributes[suit] + points;
        
        // Base max value is 3
        let maxSuitValue = 3;
        
        // If character has this suit as a role, max is 4
        if (character.suitRoles.includes(suit)) {
            maxSuitValue = 4;
        }
        
        // If level is 4 or higher, max is 5
        if (character.level >= 4) {
            maxSuitValue = 5;
        }
        
        if (newAttributeValue > maxSuitValue) {
            throw new Error(`Suit value cannot exceed ${maxSuitValue}`);
        }

        // Update attributes and unspent points
        character.attributes[suit] += points;
        character.unspentPoints -= points;
        
        // Update character
        Character.updateById(req.params.id, character);
        
        io.emit('characterUpdated', character);
        res.json(character);
    } catch (error) {
        console.error('Error in PUT /api/characters/:id/spend:', error);
        res.status(400).json({ message: error.message });
    }
});

// Level up endpoint
app.put('/api/characters/:id/levelup', (req, res) => {
    try {
        // Find character
        const character = Character.findById(req.params.id);
        if (!character) {
            return res.status(404).json({ message: 'Character not found' });
        }

        // Validate level up
        if (character.level >= 5) {
            throw new Error('Maximum level reached');
        }

        // Update character
        const updatedCharacter = Character.updateById(req.params.id, {
            ...character,
            level: character.level + 1,
            unspentPoints: character.level === 1 ? character.unspentPoints + 10 : character.unspentPoints + 5
        });

        if (!updatedCharacter) {
            return res.status(404).json({ message: 'Character not found' });
        }

        // Emit the event
        io.emit('characterUpdated', updatedCharacter);
        
        res.json(updatedCharacter);
    } catch (error) {
        console.error('Error in PUT /api/characters/:id/levelup:', error);
        res.status(400).json({ message: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something broke!',
        error: err.message
    });
});