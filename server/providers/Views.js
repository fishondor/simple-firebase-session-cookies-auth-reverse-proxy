const Auth = require("./Auth");
const {
    getEnvVar
} = require("./Environment");

const handleBarsOptions = {
    firebaseConfig: Auth.firebaseConfig,
    helpers: {
        json: context => JSON.stringify(context)
    }
}

const login = (req,res) => {
    res.render('login', handleBarsOptions);
}

const logout = (req,res) => {
    res.clearCookie(getEnvVar('COOKIE_NAME'), Auth.cookieOptions);
    res.render('login', handleBarsOptions);
}

module.exports = {
    login,
    logout
}