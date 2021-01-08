
require('dotenv').config({ path: `${process.cwd()}/.env` });

const getEnvVar = name => process.env[name];

module.exports = {
    getEnvVar
}