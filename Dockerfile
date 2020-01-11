FROM lnhcode/hugo:0.62.0 AS builder

COPY . /src
WORKDIR /src

RUN hugo version
RUN hugo


FROM nginx:alpine

COPY --from=builder /src/.www /usr/share/nginx/html

EXPOSE 80
