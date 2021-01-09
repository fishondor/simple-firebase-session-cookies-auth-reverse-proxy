const express = require('express');
const httpProxy = require('http-proxy');

const {
    getEnvVar
} = require("./Environment");
const Auth = require("./Auth");
const Views = require('./Views');

const apiProxy = httpProxy.createProxyServer();
const router = express.Router();

const host = getEnvVar('HOST');
const proxyTargetPort = getEnvVar('REVERSE_PROXY_TARGET_PORT');
const proxyTarget = `http://${host}:${proxyTargetPort}`;
const saveCookieEndpoint = getEnvVar('SAVE_COOKIE_ENDPOINT');

router.post(`/${saveCookieEndpoint}`, Auth.api.saveCookie);

router.get('/login', Views.login);

router.get('/logout', Views.logout);

router.get('/*', Auth.checkCookie, function(req, res) {
    apiProxy.web(req, res, {target: proxyTarget});
});

router.put('/*', Auth.checkCookie, function(req, res) {
    apiProxy.web(req, res, {target: proxyTarget});
});

router.post('/*', Auth.checkCookie, function(req, res) {
    apiProxy.web(req, res, {target: proxyTarget});
});

router.delete('/*', Auth.checkCookie, function(req, res) {
    apiProxy.web(req, res, {target: proxyTarget});
});

module.exports = {
    router,
    proxyTarget
};