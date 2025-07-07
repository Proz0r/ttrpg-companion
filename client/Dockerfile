FROM node:16.20-alpine as build

WORKDIR /app
COPY package*.json ./
COPY .env ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/.env /usr/share/nginx/html/.env
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
