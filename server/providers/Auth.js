const admin = require("firebase-admin");

const Logger = require('./Logger');
const {
    getEnvVar
} = require('./Environment');

const serviceAccountFileName = getEnvVar('SERVICE_ACCONT_FILE_NAME');
const firebseConfigFileName = getEnvVar('FIREBASE_CONFIG_FILE_NAME');
const serviceAccount = require(`${process.cwd()}/config/${serviceAccountFileName}`);
const firebaseConfig = require(`${process.cwd()}/config/${firebseConfigFileName}`);
const logger = new Logger("Auth service");

const expiresIn = parseInt(getEnvVar('COOKIE_EXPIRATION'));
const cookieDomain = getEnvVar('COOKIE_DOMAIN');
const cookieName = getEnvVar('COOKIE_NAME');
const cookieOptions = {maxAge: expiresIn, httpOnly: true, secure: false, domain: cookieDomain};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const validateToken = async (idToken) => {
    try{
        let decodedToken = await admin.auth().verifyIdToken(idToken);
        if(!decodedToken){
            logger.warn('Invalid token', decodedToken);
            return false;
        }
        return decodedToken;
    }catch(error){
        logger.error('Error fetching user data:', error);
        return false;
    }
}

const getUserById = async (id) => {
    try{
        let userRecord = await admin.auth().getUser(id);
        if(!userRecord){
            logger.warn('Cannot get user', userRecord);
            return false;
        }
        return userRecord;
    }catch(error){
        logger.error('Error getting user', error);
        return false;
    }
}

const isAuthorized = (user) => {
    let authorizedEmailDomain = getEnvVar('AUTHORIZED_EMAIL_DOMAIN');
    if(!authorizedEmailDomain)
        return true;
    return user.email.endsWith(authorizedEmailDomain);
}

const getSessionCookie = async (idToken) => {
    try{
        let sessionCookie = await admin.auth().createSessionCookie(idToken,{expiresIn});
        return sessionCookie
    }catch(error){
        logger.error("Could not create session cookie", error);
        return false;
    }
}

const checkCookie = (req,res,next) => {

	const sessionCookie = req.cookies[cookieName] || '';
	admin.auth().verifySessionCookie(
		sessionCookie, true).then((decodedClaims) => {
			req.decodedClaims = decodedClaims;
			next();
		})
		.catch(error => {
            logger.error("Could not validate session cookie", error);
			res.redirect('/login');
		});

}

const api = {
    saveCookie: async (req, res) => {
        let idToken = req.body.idToken;
        let authenticatedUser = await validateToken(idToken);
        if(!authenticatedUser){
            res.status(401).send();
            return;
        }
        let user = await getUserById(authenticatedUser.uid);
        if(!authenticatedUser){
            res.status(500).send();
            return;
        }
        let authorized = await isAuthorized(user);
        if(!authorized){
            res.status(401).send();
            return;
        }
        let sessionCookie = await getSessionCookie(idToken);
        if(!sessionCookie){
            res.status(401).send();
            return;
        }
        res.cookie(cookieName, sessionCookie, cookieOptions).redirect('/');
    }
}

module.exports = {
    checkCookie,
    cookieOptions,
    firebaseConfig,
    api
}