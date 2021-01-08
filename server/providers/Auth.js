const admin = require("firebase-admin");

const Logger = require('./Logger');
const {
    getEnvVar
} = require('./Environment');

const serviceAccount = require(`${process.cwd()}/config/${getEnvVar('SERVICE_ACCONT_FILE_NAME')}`);
const firebaseConfig = require(`${process.cwd()}/config/${getEnvVar('FIREBASE_CONFIG_FILE_NAME')}`);
const logger = new Logger("Auth service");

const expiresIn = parseInt(getEnvVar('COOKIE_EXPIRATION'));
const cookieOptions = {maxAge: expiresIn, httpOnly: true, secure: false, domain: getEnvVar('COOKIE_DOMAIN')};

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
    return user.email.startsWith(getEnvVar('AUTHORIZED_EMAIL_DOMAIN'));
}

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
        return 
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
    getSessionCookie,
    checkCookie,
    cookieOptions,
    firebaseConfig,
    validateToken,
    getUserById,
    isAuthorized
}