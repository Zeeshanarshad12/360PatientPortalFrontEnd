# Stage 1: Build the app
FROM node:20.18.0 AS builder

WORKDIR /ehr_frontend

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build:prod

# Stage 2: Production image
FROM node:20.18.0-alpine

WORKDIR /ehr_frontend

# Install sharp dependencies for Alpine
RUN apk add --no-cache libc6-compat

# Copy only necessary files from builder
COPY --from=builder /ehr_frontend/package*.json ./
COPY --from=builder /ehr_frontend/server*.js ./
COPY --from=builder /ehr_frontend/node_modules ./node_modules
COPY --from=builder /ehr_frontend/.next ./.next
COPY --from=builder /ehr_frontend/public ./public
COPY --from=builder /ehr_frontend/next.config.js ./next.config.js

# Expose port
EXPOSE 3000

# Run in production mode
CMD ["npm", "run", "start"]