const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const http = require('http');
const httpProxy = require('http-proxy');
const exphbs  = require('express-handlebars');

const {
    getEnvVar
} = require("./providers/Environment");
const Auth = require("./providers/Auth");

const apiProxy = httpProxy.createProxyServer();

const host = getEnvVar('HOST') || 'localhost';
const proxyTarget = `http://${host}:${getEnvVar('REVERSE_PROXY_TARGET_PORT')}`;
const port = getEnvVar('PORT');

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const handleBarsOptions = {
    firebaseConfig: Auth.firebaseConfig,
    helpers: {
        json: context => JSON.stringify(context)
    }
}

app.get('/login', (req,res) => {
    res.render('login', handleBarsOptions);
});

app.get('/logout', (req,res) => {
    res.clearCookie('__session', Auth.cookieOptions);
    res.render('login', handleBarsOptions);
});

app.post('/savecookie', async (req, res) => {
    const idToken = req.body.idToken;
    let authenticatedUser = await Auth.validateToken(idToken);
    if(!authenticatedUser){
        res.status(401).send();
        return;
    }
    let user = await Auth.getUserById(authenticatedUser.uid);
    if(!authenticatedUser){
        res.status(500).send();
        return;
    }
    let authorized = await Auth.isAuthorized(user);
    if(!authorized){
        res.status(401).send();
        return;
    }
    let sessionCookie = await Auth.getSessionCookie(idToken);
    if(!sessionCookie){
        res.status(401).send();
        return;
    }
    res.cookie('__session', sessionCookie, Auth.cookieOptions).redirect('/');
});

app.get('/*', Auth.checkCookie, function(req, res) {
    apiProxy.web(req, res, {target: proxyTarget});
});

app.put('/*', Auth.checkCookie, function(req, res) {
    apiProxy.web(req, res, {target: proxyTarget});
});

app.post('/*', Auth.checkCookie, function(req, res) {
    apiProxy.web(req, res, {target: proxyTarget});
});

app.delete('/*', Auth.checkCookie, function(req, res) {
    apiProxy.web(req, res, {target: proxyTarget});
});

http.createServer(app)
.listen(port, function () {
    console.log(`Firebase auth proxy is listening on port ${port}. Target: ${proxyTarget}`);
});