# api-gateway/Dockerfile

# Use Node.js LTS version
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install --production

# Bundle app source
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose port
EXPOSE ${API_GATEWAY_PORT}

# Start the application
CMD ["npm", "start"]

