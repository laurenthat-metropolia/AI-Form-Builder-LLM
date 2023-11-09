FROM node:hydrogen-alpine as build
WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY . .
RUN npm run build
CMD ["run", "app/main.ts"]


FROM node:hydrogen-alpine as final
WORKDIR /app

COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/package-lock.json /app/package-lock.json
RUN npm install
COPY --from=build /app/dist/ /app/
CMD ["app/main.js"]
