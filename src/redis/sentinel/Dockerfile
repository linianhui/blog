# https://hub.docker.com/_/redis/
# https://github.com/docker-library/redis/blob/master/6.2/Dockerfile
FROM redis:6.2

COPY --chown=redis:redis sentinel.conf /etc/redis/sentinel.conf

EXPOSE 26379