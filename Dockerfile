FROM lnhcode/hugo AS builder

COPY . /src
WORKDIR /src

RUN hugo --config .hogo.yml


FROM nginx:alpine

COPY --from=builder /src/.www /usr/share/nginx/html

EXPOSE 80