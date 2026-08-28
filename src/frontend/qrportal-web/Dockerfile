FROM node:24-alpine AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY src/frontend/qrportal-web/package.json src/frontend/qrportal-web/package.json
RUN pnpm install --frozen-lockfile
COPY src/frontend/qrportal-web src/frontend/qrportal-web
RUN pnpm --dir src/frontend/qrportal-web build

FROM nginx:1.29-alpine
COPY src/frontend/qrportal-web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/src/frontend/qrportal-web/dist/qrportal-web/browser /usr/share/nginx/html
EXPOSE 80
