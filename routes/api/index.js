const route = require("express").Router();

route.use('/admins', require('./admin'));

module.exports = route;