FROM lnhcode/hugo:0.65.3 AS builder

COPY . /src
WORKDIR /src

RUN hugo version
RUN hugo --config .hugo.yml


FROM nginx:alpine

COPY --from=builder /src/.www /usr/share/nginx/html

EXPOSE 80
