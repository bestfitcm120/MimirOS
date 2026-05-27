# ═══════════════════════════════════════════════════════════
#  AIOS Frontend Dockerfile
#  Stage 1: build React app with Node
#  Stage 2: serve with nginx
# ═══════════════════════════════════════════════════════════

# ── Stage 1: build ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first (better layer caching)
COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm ci --prefer-offline

# Copy source code
COPY . .

# Build the production bundle
# VITE_API_BASE is empty — all /api calls go through nginx proxy
ENV VITE_API_BASE=""
RUN npm run build

# ── Stage 2: serve with nginx ─────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built React app from stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
    CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
