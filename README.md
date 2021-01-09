# Simple firebase auth reverse proxy

This project is for easily implementing authentication and authorization using firebase session cookies.

It creates en express server that serves as authentication middleware and reverse proxy authenticated and authorized requests to the intended application.

## Requirements

* Firebase account
    * Service account private key json file - [Read more](https://firebase.google.com/docs/admin/setup#initialize-sdk)
    * Firebase config object as json file - [Read more](https://firebase.google.com/docs/web/setup#config-object)
    * Enable google in sign-in providers
    * Add your domain to authorized domains
* node and npm OR docker and docker-compose

## How to use

1. Create .env file from .env.template file and provide the required fields in it
2. Copy service account private key json file into config directory
3. Create firebase web client config object to json file and copy into config directory
4. Run
    * Node ```npm run start``` OR
    * Docker ```docker-compose up --build -d``` (also supported with ```npm run start:docker```)
5. Stop
    * Node: ctrl + c
    * Docker: ```docker-compose down``` (also supported with ```npm run stop:docker```) 