FROM alpine:3.14@sha256:eb3e4e175ba6d212ba1d6e04fc0782916c08e1c9d7b45892e9796141b1d379ae

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install && \
    npm cache clean --force && \
    npm uninstall -g npm && \
    rm -rf /root/.npm

# Copy the rest of the app
COPY . .

# Expose port and define default command
EXPOSE 3000
CMD ["node", "app.js"]
