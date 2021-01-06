const express = require("express");
const admin = require("firebase-admin");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const http = require('http');
const fs = require('fs');
const httpProxy = require('http-proxy');
//const cors = require('cors');

const {
    getEnvVar
} = require("./providers/Environment");

const apiProxy = httpProxy.createProxyServer();

require('dotenv').config({ path: `${__dirname}/.env` });
const endpoint = getEnvVar('ENDPOINT');
const port = getEnvVar('PORT');
const serviceAccount = require(`${process.cwd()}/${getEnvVar('SERVICE_ACCONT_FILE_NAME')}`);
const expiresIn = 60 * 60 * 24 *1000;
const cookieOptions = {maxAge: expiresIn, httpOnly: true, secure: false, domain: getEnvVar('COOKIE_DOMAIN')};

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
//app.use(cors());

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

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

isAuthorizedUser = async (idToken) => {
    try{
        let decodedToken = await admin.auth().verifyIdToken(idToken);
        if(!decodedToken){
            console.log('Invalid decoded token', decodedToken);
            return false;
        }
        let userRecord = await admin.auth().getUser(decodedToken.uid);
        if(!userRecord){
            console.log('Invalid user record', userRecord);
            return false;
        }
        return userRecord.email.startsWith(getEnvVar('AUTHORIZED_EMAIL_DOMAIN'));
    }catch(error){
        console.log('Error fetching user data:', error);
        return false;
    }
}

//saving cookies and verify cookies
// Reference : https://firebase.google.com/docs/auth/admin/manage-cookies

getSessionCookie = async (idToken) => {
    try{
        let sessionCookie = await admin.auth().createSessionCookie(idToken,{expiresIn});
        return sessionCookie
    }catch(error){
        console.log("Could not create session cookie", error);
        return false;
    }
}

function checkCookie(req,res,next){

	const sessionCookie = req.cookies.__session || '';
	admin.auth().verifySessionCookie(
		sessionCookie, true).then((decodedClaims) => {
			req.decodedClaims = decodedClaims;
			next();
		})
		.catch(error => {
			// Session cookie is unavailable or invalid. Force user to login.
			res.redirect('/login');
		});

}

http.createServer({
    key: fs.readFileSync(`${process.cwd()}/certs/server.key`),
    cert: fs.readFileSync(`${process.cwd()}/certs/server.cert`)
}, app)
.listen(port, function () {
    console.log(`Firebase auth proxy is listening on port ${port} with target: ${endpoint}`);
});