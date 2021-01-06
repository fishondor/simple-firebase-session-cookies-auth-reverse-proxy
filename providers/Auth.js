const admin = require("firebase-admin");

const Logger = require('./Logger');
const {
    getEnvVar
} = require('./Environment');

const serviceAccount = require(getEnvVar('SERVICE_ACCONT_FILE_PATH'));
const logger = new Logger("Auth service");

const expiresIn = parseInt(getEnvVar('COOKIE_EXPIRATION'));
const cookieOptions = {maxAge: expiresIn, httpOnly: true, secure: false, domain: getEnvVar('COOKIE_DOMAIN')};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const isAuthorizedUser = async (idToken) => {
    try{
        let decodedToken = await admin.auth().verifyIdToken(idToken);
        if(!decodedToken){
            logger.warn('Invalid decoded token', decodedToken);
            return false;
        }
        let userRecord = await admin.auth().getUser(decodedToken.uid);
        if(!userRecord){
            logger.warn('Invalid user record', userRecord);
            return false;
        }
        return userRecord.email.startsWith(getEnvVar('AUTHORIZED_EMAIL_DOMAIN'));
    }catch(error){
        logger.error('Error fetching user data:', error);
        return false;
    }
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

	const sessionCookie = req.cookies.__session || '';
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

module.exports = {
    isAuthorizedUser,
    getSessionCookie,
    checkCookie,
    cookieOptions
}