FROM node:16-alpine

RUN mkdir -p /app

#/usr/src/app
COPY package.json /app

WORKDIR /app
COPY . /app
RUN yarn install
RUN yarn build

CMD ["yarn", "start"]
