const express = require('express');
const cors = require('cors');
const socketIo = require('socket.io');
const path = require('path');

// Load environment variables only in development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();
const port = process.env.PORT || 8080;

// Configure CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'https://ttrpg-companion-frontend.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    next();
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Production error handling
if (process.env.NODE_ENV === 'production') {
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({
            message: 'An error occurred. Please try again later.'
        });
    });
}

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
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        port: port,
        env: process.env.NODE_ENV || 'production'
    });
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
try {
    // Set up error handlers first
    process.on('uncaughtException', (error) => {
        console.error('Uncaught exception:', error);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled rejection:', reason);
        process.exit(1);
    });

    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`Server is running on port ${port}`);
        console.log('Environment Variables:');
        console.log('PORT:', port);
        console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
        console.log('Node version:', process.version);
        console.log('Process environment:', process.env.NODE_ENV);
    });

    // Set up server error handler after server is created
    server.on('error', (error) => {
        console.error('Server error:', error);
        process.exit(1);
    });

    // Initialize Socket.IO
    const io = socketIo(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'https://ttrpg-companion-frontend.onrender.com',
            methods: ['GET', 'POST']
        }
    });

    // Socket.IO event handlers
    io.on('connection', (socket) => {
        console.log('Client connected');
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

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
    });

} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}

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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all route to serve index.html for React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something broke!',
        error: err.message
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'TTRPG Companion API is running',
        endpoints: {
            health: '/health',
            characters: {
                create: '/api/characters',
                read: '/api/characters/:id',
                update: '/api/characters/:id',
                delete: '/api/characters/:id',
                list: '/api/characters'
            }
        }
    });
});