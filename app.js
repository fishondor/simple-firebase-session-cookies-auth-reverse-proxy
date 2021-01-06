const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const http = require('http');
const fs = require('fs');
const httpProxy = require('http-proxy');
//const cors = require('cors');

const {
    getEnvVar
} = require("./providers/Environment");
const {
    isAuthorizedUser,
    getSessionCookie,
    checkCookie,
    cookieOptions
} = require("./providers/Auth");

const apiProxy = httpProxy.createProxyServer();

const endpoint = getEnvVar('ENDPOINT');
const port = getEnvVar('PORT');

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
//app.use(cors());

app.get('/login', (req,res)=>{
    res.sendFile(__dirname +'/login.html');
});

app.get('/logout',(req,res)=>{
    res.clearCookie('__session', cookieOptions);
    res.sendFile(__dirname +'/login.html');
});

app.post('/savecookie', async (req, res) => {
    const idToken = req.body.idToken;
    let authorized = await isAuthorizedUser(idToken);
    if(!authorized){
        res.status(403).send();
        return;
    }
    let sessionCookie = await getSessionCookie(idToken);
    if(!sessionCookie){
        res.status(401).send();
        return;
    }
    res.cookie('__session', sessionCookie, cookieOptions).redirect('/');
});

app.get('/*', checkCookie, function(req, res) {
    apiProxy.web(req, res, {target: endpoint});
});

app.put('/*', checkCookie, function(req, res) {
    apiProxy.web(req, res, {target: endpoint});
});

app.post('/*', checkCookie, function(req, res) {
    apiProxy.web(req, res, {target: endpoint});
});

app.delete('/*', checkCookie, function(req, res) {
    apiProxy.web(req, res, {target: endpoint});
});

http.createServer(app)
.listen(port, function () {
    console.log(`Firebase auth proxy is listening on port ${port} with target: ${endpoint}`);
});