FROM node:16

RUN mkdir -p /app

#/usr/src/app
COPY package.json /app

WORKDIR /app
RUN yarn install

COPY . /app
