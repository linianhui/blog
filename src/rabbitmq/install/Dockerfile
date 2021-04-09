# https://hub.docker.com/_/rabbitmq/
# https://github.com/docker-library/rabbitmq/blob/master/3.8/ubuntu/management/Dockerfile
FROM rabbitmq:3.8-management

ENV RABBITMQ_DEFAULT_USER=guest
ENV RABBITMQ_DEFAULT_PASS=guest
ENV RABBITMQ_DEFAULT_VHOST=dvh


# 4369 epmd
# 5671 AMQP 0-9-1 with TLS
# 5672 AMQP 0-9-1 without TLS
# 15672 management plugin(default username and password : guest)
# 25672 Erlang distribution
EXPOSE 4369 5671 5672 15691 15692 25672
