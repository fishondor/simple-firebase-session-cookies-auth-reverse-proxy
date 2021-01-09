const Auth = require("./Auth");
const {
    getEnvVar
} = require("./Environment");

const saveCookieEndpoint = getEnvVar('SAVE_COOKIE_ENDPOINT');
const cookieName = getEnvVar('COOKIE_NAME');
const handleBarsOptions = {
    firebaseConfig: Auth.firebaseConfig,
    saveCookieEndpoint: saveCookieEndpoint,
    helpers: {
        json: context => JSON.stringify(context)
    }
}

const login = (req,res) => {
    res.render('login', handleBarsOptions);
}

const logout = (req,res) => {
    res.clearCookie(cookieName, Auth.cookieOptions);
    res.render('login', handleBarsOptions);
}

module.exports = {
    login,
    logout
}