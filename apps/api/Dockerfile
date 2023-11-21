FROM node:hydrogen as final
WORKDIR /app

ARG APP_BUILD_VERSION=local-development
ENV APP_BUILD_VERSION=$APP_BUILD_VERSION

COPY dist/apps/api/package.json         package.json
COPY dist/apps/api/package-lock.json    package-lock.json
COPY apps/api/prisma                    prisma
RUN npm install
RUN npm install prisma-class-generator
RUN npx prisma generate

COPY dist/apps/api                      ./
CMD ["main.js"]
