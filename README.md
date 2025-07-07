# TTRPG Companion

A card-based TTRPG companion app built with React and Express.

## Deployment

### Prerequisites
- Node.js 14.0.0 or higher
- npm or yarn
- Docker
- Docker Compose

### Production Deployment

1. Configure environment variables:
   ```bash
   # Create .env file in root directory
   PORT=8080
   FRONTEND_URL=https://your-frontend-domain.com
   NODE_ENV=production
   ```

2. Build and deploy:
   ```bash
   # Build frontend
   cd client
   npm run build
   cd ..

   # Build and run Docker containers
   docker-compose up --build
   ```

### Local Development

1. Install dependencies:
   ```bash
   # Install server dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

2. Start development servers:
   ```bash
   # Start server
   npm run dev

   # In a new terminal, start client
   cd client
   npm start
   ```

## Environment Variables

- `PORT`: Server port (default: 8080)
- `FRONTEND_URL`: URL of the frontend application
- `NODE_ENV`: Environment (development/production)

## Security

The application uses:
- CORS for secure cross-origin requests
- Security headers for production
- Environment variables for sensitive data
