# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install only production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy all static files
COPY . .

# Expose port
EXPOSE 6969

# Use http-server to serve static files on port 6969 with 1 week cache
CMD ["npx", "http-server", ".", "-p", "6969", "-c7d"]
