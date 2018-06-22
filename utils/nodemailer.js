const nodemailer = require('nodemailer');
const CONFIG = require('../config');

const smtpTransport = nodemailer.createTransport({
    service: CONFIG.NODE_MAILER.SERVICE,
    auth: {
        user: CONFIG.NODE_MAILER.USER,
        pass: CONFIG.NODE_MAILER.PASS
    }
});

module.exports = {smtpTransport};