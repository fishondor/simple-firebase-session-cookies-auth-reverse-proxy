FROM node:latest

COPY . /var/www/firebase-auth-proxy
WORKDIR /var/www/firebase-auth-proxy
RUN npm install

EXPOSE 80