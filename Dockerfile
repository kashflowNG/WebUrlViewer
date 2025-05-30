# Use the official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S urlviewer -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R urlviewer:nodejs /app
USER urlviewer

# Expose the port the app runs on
EXPOSE 10000

# Define the command to run the application
CMD ["npm", "start"]