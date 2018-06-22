const express = require("express");
const path = require("path");

const route = express.Router();

route.use('/', express.static(path.join(__dirname, '../public_static')));

route.get('/', (req,res)=>{
    res.render('index', {message: req.flash('homePgMsg'), fail: req.flash('homePgFail')});
});

// Sub Routes
route.use('/', require('./user'));
route.use('/admin', require('./admin'));
route.use('/api', require('./api'));

module.exports = route;