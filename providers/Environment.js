
require('dotenv').config({ path: `${process.cwd()}/config/.env` });

const getEnvVar = name => process.env[name];

module.exports = {
    getEnvVar
}