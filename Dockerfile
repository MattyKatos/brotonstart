# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install only production deps
COPY package*.json ./
RUN npm install --production

# Copy all static files
COPY . .

# Expose port
EXPOSE 6969

# Run Express server
CMD ["node", "server.js"]
