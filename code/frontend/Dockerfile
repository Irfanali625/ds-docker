# ---------- BUILD STAGE ----------
    FROM node:18 AS builder
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci --legacy-peer-deps
    
    COPY . .
    ARG NEXT_PUBLIC_API_URL
    ARG NEXT_PUBLIC_MINIO_BUCKET
    ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
        NEXT_PUBLIC_MINIO_BUCKET=$NEXT_PUBLIC_MINIO_BUCKET
    RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build
    
    # ---------- RUN STAGE ----------
    FROM node:18 AS production
    WORKDIR /app
    
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/next.config.js ./
    
    RUN npm ci --only=production --legacy-peer-deps
    
    EXPOSE 3000
    CMD ["npm", "start"]
    