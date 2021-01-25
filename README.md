# Simple firebase auth reverse proxy

This project is for easily implementing authentication and authorization using firebase session cookies.

It creates express server that serves as authentication middleware and reverse proxy authenticated and authorized requests to the intended application.

## Requirements

* Firebase account
    * Service account private key json file - [Read more](https://firebase.google.com/docs/admin/setup#initialize-sdk)
    * Firebase config object as json file - [Read more](https://firebase.google.com/docs/web/setup#config-object)
    * Enable google in sign-in providers
    * Add your domain to authorized domains
* node and npm OR docker and docker-compose

## How to use

### Configuration
1. Configuration options can be defined by creating .env file in the root folder. Use *.env.template* file for reference.
Available options are specified [here](#options-table)
    * Using the .env file is optional for running directly with node. When running with docker-compose the file must exists and the value **PORT** must be defined there, the rest are optional
3. Copy service account private key json file into config directory
2. Create firebase web client config object in a json file and copy into config directory

### Run with node
* ```npm run start```
* Stop with ctrl+c

### Run with docker-compose
* ```docker-compose up --build -d``` (also supported with ```npm run start:docker```)
* Stop with ```docker-compose down``` (also supported with ```npm run stop:docker```)

### Run directly from docker image
* ```docker run -p [HOST PORT:CONTAINER PORT] -v ${PWD}/config:/var/www/firebase-auth-proxy/config fishondor/firebase-auth-reverse-proxy```
* Set environment variables with -e flag. Ex: ```docker run -p 80:80 -v ${PWD}/config:/var/www/firebase-auth-proxy/config -e "AUTHORIZED_EMAIL_DOMAIN=[VAR VALUE]" -e "COOKIE_NAME=[VAR VALUE]" fishondor/firebase-auth-reverse-proxy```

### <a name="options-table"></a>Configuration options
| Name                      | Description                                                                                                                                                          | Default value          |
|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|
| PORT                      | Port the server will listen on                                                                                                                                       | 80                     |
| REVERSE_PROXY_TARGET_PORT | Port of the service that requests will be forwarded to (in localhost)                                                                                                | 8080                   |
| SERVICE_ACCONT_FILE_NAME  | Name of the service account private key file                                                                                                                         | service-account.json   |
| FIREBASE_CONFIG_FILE_NAME | Name of the json file created with web client firebase configuration                                                                                                 | firebase-config.json   |
| COOKIE_DOMAIN             | Domain for registering session cookie (default null will set it to current domain) [Read more](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes) | null                   |
| COOKIE_MAX_AGE            | Expiration time for session cookie in miliseconds [Read more](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes)  | 86400000               |
| COOKIE_NAME               | Name of session cookie [Read more](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes)                                            | __reverse_proxy_session |
| AUTHORIZED_EMAIL_DOMAIN   | Domain to use for authorizing user by email (some_user@domin.com). Default value of false means authorizing everybody                                               | false                  |
| SAVE_COOKIE_ENDPOINT      | The name of the route for creating and saving session cookie                                                                                                         | savecookie             |

Inspired by these resources: 
* [Firebase login using cookie sessions](https://www.geeksforgeeks.org/firebase-sign-in-with-google-authentication-in-node-js-using-firebase-ui-and-cookie-sessions/)
* [fire-guard-proxy](https://github.com/saadzafar/fire-guard-proxy/blob/master/proxy.js)
