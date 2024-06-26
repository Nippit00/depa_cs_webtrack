# Use the official Node.js image from the Docker Hub
FROM node:14

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

COPY .dockerignore package*.json ./

# Copy the rest of the application code to the working directory
COPY . .

# Rebuild native modules like bcrypt
RUN npm rebuild bcrypt --build-from-source

# Expose the port the app runs on
EXPOSE 8888

# Define the command to run the application
CMD ["node", "app.js"]