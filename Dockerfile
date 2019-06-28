FROM node:10-alpine AS builder

COPY . /build
WORKDIR /build

RUN npm install -g hexo-cli --registry=https://registry.npm.taobao.org
RUN npm install --registry=https://registry.npm.taobao.org
RUN npm run pack


FROM nginx:1.17-alpine

COPY --from=builder /build/www /usr/share/nginx/html

EXPOSE 80