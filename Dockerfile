
# Multi-stage build for React application

# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps

# Copy all source files needed for build
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY src ./src

# ARG для переменных окружения во время сборки (опционально)
# Timeweb APP Platform может передавать переменные через build args или напрямую в ENV
# Если переменные передаются через build args, используйте: docker build --build-arg VITE_API_URL=...
ARG VITE_API_URL
ARG VITE_API_BASE_URL

# Устанавливаем переменные окружения для сборки
# Vite автоматически подхватит переменные с префиксом VITE_ из окружения во время сборки
# Если ARG не передан, переменная будет пустой, но если она есть в ENV контейнера - будет использована
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY src/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
