FROM node:14-alpine as base
WORKDIR /usr/src/app

FROM base as build
COPY package*.json ./
RUN npm install
RUN npm install -g typescript 
COPY src/ /usr/src/app/src/
COPY ./tsconfig.json .
RUN npm run build

FROM base as publish
COPY --from=build /usr/src/app/build ./build
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/src/tenants*.json ./
RUN npm install --only=prod

EXPOSE 8080
CMD [ "node", "build/index.js" ]
