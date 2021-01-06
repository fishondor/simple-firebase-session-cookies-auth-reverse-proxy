const admin = require("firebase-admin");

const {
    getEnvVar
} = require('./Environment');

const serviceAccount = require(getEnvVar('SERVICE_ACCONT_FILE_PATH'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const isAuthorizedUser = async (idToken) => {
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

const getSessionCookie = async (idToken) => {
    try{
        let sessionCookie = await admin.auth().createSessionCookie(idToken,{expiresIn});
        return sessionCookie
    }catch(error){
        console.log("Could not create session cookie", error);
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
			// Session cookie is unavailable or invalid. Force user to login.
			res.redirect('/login');
		});

}

module.exports = {
    isAuthorizedUser,
    getSessionCookie,
    checkCookie
}