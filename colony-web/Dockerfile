# Stage 1 - Build React App
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2 - Serve with nginx
FROM nginx:stable-alpine

# Create non-root user/group 1001
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

# Create log directory and set permissions
RUN mkdir -p /opt/logs && \
    chown -R 1001:1001 /opt/logs

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy build files from Vite (dist folder)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set permissions for nginx folders
RUN chown -R 1001:1001 /usr/share/nginx/html && \
    chown -R 1001:1001 /var/cache/nginx && \
    chown -R 1001:1001 /var/run && \
    chown -R 1001:1001 /etc/nginx/conf.d

# Create nginx pid location
RUN touch /var/run/nginx.pid && \
    chown -R 1001:1001 /var/run/nginx.pid

USER 1001

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
