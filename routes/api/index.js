const route = require("express").Router();

route.use('/admin', require('./admin'));
route.use('/user', require('./user'));
route.use('/product', require('./product'));

module.exports = route;