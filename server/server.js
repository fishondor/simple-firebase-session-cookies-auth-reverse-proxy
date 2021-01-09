const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const http = require('http');
const exphbs  = require('express-handlebars');

const {
    getEnvVar
} = require("./providers/Environment");
const {
    router,
    proxyTarget
} = require("./providers/router");

const port = getEnvVar('PORT');

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(router);

http.createServer(app).listen(port, function () {
    console.log(`Firebase auth proxy is listening on port ${port}. Target: ${proxyTarget}`);
});