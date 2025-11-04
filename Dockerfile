# ================================
# Stage 1 — Build
# ================================
FROM oven/bun:1.3-alpine AS build

WORKDIR /app

# Copy dependency files first (layer caching)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Optional: pass build hash or commit info
ARG BUILD_HASH
ENV VITE_BUILD_HASH=${BUILD_HASH}
ENV NODE_ENV=production

# Build the app
RUN bun run build-only --mode production


# ================================
# Stage 2 — Serve (Nginx)
# ================================
FROM nginx:stable-alpine-slim AS production

# Create non-root user
RUN adduser -D -H -u 1001 statio

# Create necessary writable directories for Nginx
RUN mkdir -p /var/cache/nginx/client_temp /var/log/nginx && \
    chown -R statio:statio /var/cache/nginx /var/log/nginx /usr/share/nginx/html

# Copy compiled assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx config
COPY default.conf /etc/nginx/conf.d/default.conf

# Use non-root user
USER statio

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
