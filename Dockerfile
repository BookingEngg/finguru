# Use the official Node.js LTS image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Install dependencies early to leverage Docker cache
COPY package*.json tsconfig.json ./
RUN npm install

# Copy the entire application source code
COPY . .

# Install Git and dos2unix (for line-ending conversion)
RUN apk add --no-cache git bash dos2unix

# Copy the fetch-config script to the container and give it execute permissions
COPY fetch-config.sh /fetch-config.sh

# Copy nginx conf to shared directory
RUN mkdir shared
COPY nginx.conf shared/nginx.conf

# Convert Windows line endings to Unix line endings
RUN dos2unix /fetch-config.sh

# Make the script executable
RUN chmod +x /fetch-config.sh

# Run the fetch-config script (use full path and bash explicitly)
ARG GITHUB_PAT
RUN GITHUB_PAT=${GITHUB_PAT} /bin/bash /fetch-config.sh

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 8080

# Set the command to run the application
CMD ["npm", "run", "prod"]

# Build Container :: docker-compose build --build-arg GITHUB_PAT="github-secret-repo-pat"
# Run Docker Container :: docker-compose up
