# Фронтенд: build (npm ci + rsbuild) → nginx раздаёт SPA и проксирует /api/.
# Секретов нет: API same-origin '/api/v1', доступ — JWT из localStorage.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
# SPA try_files + /api/ reverse proxy вместо дефолтного site-конфига
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
