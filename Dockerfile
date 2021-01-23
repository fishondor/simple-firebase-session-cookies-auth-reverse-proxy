FROM node:latest

COPY . /var/www/firebase-auth-proxy
WORKDIR /var/www/firebase-auth-proxy
RUN npm install

ARG HOST=host.docker.internal
ENV HOST ${HOST}

VOLUME [ "/var/www/firebase-auth-proxy/config" ]

EXPOSE 80

ENTRYPOINT ["npm", "run", "start"]