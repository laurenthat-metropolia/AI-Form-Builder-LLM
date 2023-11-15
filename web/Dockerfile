FROM nginx:1.21.4
WORKDIR /usr/share/nginx/html

ARG APP_BUILD_VERSION=local-development
ENV APP_BUILD_VERSION=$APP_BUILD_VERSION

COPY build .

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

COPY default.conf.template /etc/nginx/templates/default.conf.template

RUN echo $APP_BUILD_VERSION > version

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 8443
