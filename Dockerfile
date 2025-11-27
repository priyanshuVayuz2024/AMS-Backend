# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your project files
COPY . .

# Expose the port your Express app runs on
EXPOSE 5000

# Start the app
CMD ["node", "index.js"]
