FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN echo $'#!/bin/sh\nsed -i "s/listen 80;/listen ${PORT:-80};/" /etc/nginx/conf.d/default.conf\nexec nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh
EXPOSE 80
CMD ["/start.sh"]
