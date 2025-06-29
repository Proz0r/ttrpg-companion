const express = require('express');
const cors = require('cors');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Add CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// Add root route handler
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Add catch-all route for React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Handle preflight requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for characters
let characters = [];
let nextId = 1;

// Simple character model
const Character = {
    create: (data) => {
        const character = {
            ...data,
            id: nextId++,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        characters.push(character);
        return character;
    },
    findById: (id) => characters.find(c => c.id === parseInt(id)),
    updateById: (id, data) => {
        const character = characters.find(c => c.id === parseInt(id));
        if (!character) return null;
        Object.assign(character, data);
        character.updatedAt = new Date();
        return character;
    },
    deleteById: (id) => {
        const index = characters.findIndex(c => c.id === parseInt(id));
        if (index === -1) return null;
        return characters.splice(index, 1)[0];
    },
    findAll: () => [...characters]
};

console.log('Starting server...');

// Initialize Socket.IO
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const io = socketIo(server, {
    cors: {
        origin: "*",  // Allow all origins for now
        methods: ["GET", "POST", "PUT", "DELETE"]
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