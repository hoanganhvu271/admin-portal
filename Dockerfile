# --- Build Stage ---
FROM node:24-bullseye-slim AS build

WORKDIR /app

COPY package*.json ./

# Cài vite global để chắc chắn có quyền execute
RUN npm install -g vite

# Cài các dependencies khác
RUN npm install

COPY . .

# Build bằng vite (global)
RUN vite build

# --- Production Stage ---
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
