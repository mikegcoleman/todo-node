# -------- Stage 1: Builder --------
    FROM alpine:3.20 AS builder

    # Install Node.js 20 and npm
    RUN apk add --no-cache nodejs-current npm
    
    WORKDIR /app
    
    # Copy package files and install dependencies
    COPY package*.json ./
    RUN npm install && npm cache clean --force
    
    # Copy source code
    COPY . .
    
    # -------- Stage 2: Runtime --------
    FROM alpine:3.20 AS runtime
    
    # Install only Node.js (no npm)
    RUN apk add --no-cache nodejs-current
    
    WORKDIR /app
    
    # Copy app and dependencies from builder
    COPY --from=builder /app /app
    
    EXPOSE 3000
    CMD ["node", "app.js"]