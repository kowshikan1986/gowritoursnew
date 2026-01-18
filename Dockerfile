# Node.js 20 LTS for production
FROM node:20-alpine

# Set working directory to the app folder
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_OPTIONS=--max-old-space-size=2048

# Copy package files from luxury-travel-agency
COPY luxury-travel-agency/package*.json ./

# Install all dependencies (including dev for build)
RUN npm install --legacy-peer-deps

# Copy source files from luxury-travel-agency
COPY luxury-travel-agency/ ./

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Create data directory for database
RUN mkdir -p /app/data /app/logs /app/public/uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "server-json.js"]
