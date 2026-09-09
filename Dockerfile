# Multi-stage образ фронтенда my-budget.
# Стадия build: npm ci + rsbuild build → dist/ (статика с хешами в именах).
# Стадия runtime: nginx раздаёт статику как SPA и проксирует /api/ на бэкенд
# (конфиг docker/nginx.conf). Секретов в образе нет: API вызывается
# same-origin '/api/v1', доступ — JWT из localStorage пользователя.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
# Заменяем дефолтный site-конфиг: SPA try_files + /api/ reverse proxy
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
