# Stage 1 - Build React App
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm config set strict-ssl false && npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2 - Serve with a simple Node server (no nginx)
FROM node:20-alpine

WORKDIR /app

# Install 'serve' package globally to avoid downloading it at runtime
RUN npm config set strict-ssl false && npm install -g serve

# Create non-root user/group 1001
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

# Create log directory and set permissions
RUN mkdir -p /opt/logs && \
    chown -R 1001:1001 /opt/logs && \
    chmod 755 /opt/logs

# Set up serving directory
# We create a structure where the app lives under the subpath /colonyconnect
RUN mkdir -p /app/public/colonyconnect

# Copy build files from builder stage into the subpath folder
COPY --from=builder /app/dist /app/public/colonyconnect

# Create a root-level index.html for SPA fallback to work correctly with 'serve -s'
RUN cp /app/public/colonyconnect/index.html /app/public/index.html

# Set permissions for all app folders to 1001
RUN chown -R 1001:1001 /app && \
    chmod -R 755 /app

# Switch to non-root user
USER 1001

# Expose the port (matches k8s targetPort)
EXPOSE 8080

# Start serving the application
# -s flag enables SPA routing (falls back to index.html)
# -l 8080 specifies the port
CMD ["serve", "-s", "public", "-l", "8080"]
