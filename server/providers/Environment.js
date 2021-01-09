
require('dotenv').config({ path: `${process.cwd()}/.env` });

const defaults = require("./defaults.json");
const getEnvVar = (name) => {
    let value = process.env[name] || defaults[name];
    if(typeof value === 'undefined')
        throw new Error(`Environment variable ${name} was not found`);
    return value;
};

module.exports = {
    getEnvVar
}