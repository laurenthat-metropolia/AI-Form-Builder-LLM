FROM node:hydrogen as final
WORKDIR /app

ARG APP_BUILD_VERSION=local-development
ENV APP_BUILD_VERSION=$APP_BUILD_VERSION

RUN apt update -y && apt install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev -y

COPY package.json       package.json
COPY package-lock.json  package-lock.json
COPY prisma             prisma
RUN npm install

COPY dist/              ./
COPY app/templates app/templates
CMD ["app/main.js"]
