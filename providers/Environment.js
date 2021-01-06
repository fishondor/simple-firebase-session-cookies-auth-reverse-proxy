require('dotenv').config({ path: `${pwd}/config/.env` });

const getEnvVar = name => process.env[name];

module.exports = {
    getEnvVar
}