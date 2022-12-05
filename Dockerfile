FROM node:latest as builder

WORKDIR /app

COPY package.json

RUN yarn install

COPY . .

RUN yarn build

FROM nginx:latest

COPY nginx.conf /etc/nginx

COPY --from=builder /app/dist  /usr/share/nginx/html
