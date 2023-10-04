FROM node:20-alpine AS build
COPY . ./app
WORKDIR /app
RUN npm i -g npm@latest
RUN npm i
RUN npm run build

FROM nginx:1.25.2
COPY --from=build /app/dist/sakai-ng/assets/nginx.default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/sakai-ng/ /usr/share/nginx/html
EXPOSE 80
