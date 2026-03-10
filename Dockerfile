# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
RUN chmod -R a+r /usr/share/nginx/html
ENV PREDICT_API_UPSTREAM=host.docker.internal:18801
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 18828
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:18828/ || exit 1
