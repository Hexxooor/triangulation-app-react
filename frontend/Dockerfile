# 🚀 Triangulation App Frontend - Production Dockerfile
# Multi-stage build für optimale Performance

# Stage 1: Build Environment
FROM node:18-alpine as build

LABEL maintainer="Hexxooor"
LABEL description="Triangulation App Frontend - React"

WORKDIR /app

# Copy package files für besseres Caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Set environment for production build
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_API_URL=/api

# Build optimized app
RUN npm run build

# Stage 2: Production Environment
FROM nginx:alpine

# Install bash für bessere Container-Verwaltung
RUN apk add --no-cache bash

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create nginx user directories
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]