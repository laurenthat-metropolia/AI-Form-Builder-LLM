FROM node:hydrogen-alpine as build
WORKDIR /app

RUN apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY prisma prisma
RUN npm install
RUN npx prisma generate
COPY . .
RUN npm run build
CMD ["run", "app/main.ts"]


FROM node:hydrogen-alpine as final
WORKDIR /app

RUN apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/package-lock.json /app/package-lock.json
COPY --from=build /app/prisma /app/prisma
RUN npm install
RUN npx prisma generate
COPY --from=build /app/dist/ /app/
COPY app/templates /app/app/templates
CMD ["app/main.js"]
