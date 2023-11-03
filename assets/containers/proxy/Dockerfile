FROM nginx:1.21.4

WORKDIR /usr/share/nginx/html

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY conf/nginx.conf.nginx                  /etc/nginx/nginx.conf
COPY conf/default.conf.template.nginx       /etc/nginx/templates/default.conf.template

# Fargate network is localhost
# Docker network is host.docker.internal and `- host.docker.internal:host-gateway` should be passed as extra_hosts parameter
ARG PROXY_PASS_HOSTNAME=localhost
ENV PROXY_PASS_HOSTNAME=$PROXY_PASS_HOSTNAME
ENV APP_PORT=8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80
