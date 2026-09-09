# Multi-stage образ фронтенда my-budget.
# Стадия build: npm ci + rsbuild build → dist/ (статика с хешами в именах).
# Стадия runtime: nginx раздаёт статику как SPA и проксирует /api/ на бэкенд
# (конфиг docker/nginx.conf). Секретов в образе нет: ключи Supabase
# инлайнятся в бандл из build-аргументов (публичные anon-ключи), адрес API —
# same-origin '/api/v1'.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# На переходный период (пока клиент не переписан под этот сервер, этап 3)
# бандл собирается с адресом прежнего Supabase-бэкенда; без ключей сайт
# нерабочий, но /api через nginx обслуживается в любом случае.
ARG SUPABASE_URL=""
ARG SUPABASE_ANON_KEY=""
RUN printf 'SUPABASE_URL=%s\nSUPABASE_ANON_KEY=%s\n' "$SUPABASE_URL" "$SUPABASE_ANON_KEY" > .env \
  && npm run build

FROM nginx:1.27-alpine
# Заменяем дефолтный site-конфиг: SPA try_files + /api/ reverse proxy
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
