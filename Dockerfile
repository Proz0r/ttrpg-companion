FROM node:16.20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json ./
COPY .env ./

# Install dependencies in production mode
RUN npm ci --production

# Copy the rest of the application
COPY . .

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["node", "server/index.js"]
