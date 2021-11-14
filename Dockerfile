# install latest node
# https://hub.docker.com/_/node/
FROM node:latest

ENV MONGODB_URI mongodb://mongolib
ENV NODE_ENV=development

# create and set app directory
RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/

# install app dependencies
# this is done before the following COPY command to take advantage of layer caching
COPY package.json .
RUN npm i

# copy app source to destination container
COPY . .
EXPOSE 80
CMD [ "npm", "start" ]

# FROM nginx:1.17-alpine
# RUN apk --no-cache add curl
# RUN curl -L https://github.com/a8m/envsubst/releases/download/v1.1.0/envsubst-`uname -s`-`uname -m` -o envsubst && \
#     chmod +x envsubst && \
#     mv envsubst /usr/local/bin
# COPY ./nginx.config /etc/nginx/nginx.template
# CMD ["/bin/sh", "-c", "envsubst < /etc/nginx/nginx.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]



