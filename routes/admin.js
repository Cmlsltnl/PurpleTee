const route = require('express').Router();
const bcrypt = require('bcrypt-nodejs');
const auth = require('../utils/auth.js');
const models = require('../models');
const CONFIG = require('../config');
const {smtpTransport} = require('../utils/nodemailer.js');

route.get('/', auth.isLoggedIn, auth.isAdmin, (req,res)=>{
    res.render('admin/index');
})

route.get('/signup', auth.isLoggedIn, (req,res)=>{
    res.render('admin/approval');
})

route.get('/manage', auth.isLoggedIn, auth.isAdmin, (req,res)=>{
    res.render('admin/manage');
})
route.post('/add', auth.isLoggedIn, auth.isAdmin, (req,res)=>{
    models.User.findOne({username: req.body.username})
    .then(user=> {
        if(user){
            user.isAdmin = true;
            user.save();
            req.flash('homePgMsg',`${user.name} is now an Admin.`);
            res.redirect('/');
        } else {
            req.flash('homePgFail','No such User exists.');
            res.redirect('/');
        }
    })
    .catch(err=> {
        console.log(err);
        res.redirect('/');
    })
})
route.get('/remove/:username', auth.isLoggedIn, auth.isAdmin, (req,res)=>{
    models.User.findOne({username: req.params.username})
        .then(user=> {
            if(user){
                user.isAdmin = false;
                user.save();
                req.flash('homePgMsg',`${user.name} is no longer Admin.`);
                res.redirect('/');
            } else {
                req.flash('homePgFail','No such User exists.');
                res.redirect('/');
            }
        })
        .catch(err=> {
            console.log(err);
            res.redirect('/');
        })
})
route.post('/signup', auth.isLoggedIn, (req,res) => {
    
    bcrypt.genSalt(10, (err, salt) => {
            if(err)
                return res.redirect('/');
            bcrypt.hash(req.user.id, salt, null, (err, hash) => {
                if(err)
                    return res.redirect('/');
                host=req.get('host');
                link=`http://${host}/admin/verify?user=${req.user._id}&id=${hash}`;
                mailOptions={
                    to : CONFIG.NODE_MAILER.TO,
                    subject : "Approval for New Admin",
                    html : `<p>Name: ${req.body.name}</p>
                            <p>Message: ${req.body.message}</p>
                            <p>Email: ${req.user.email}</p>
                            <p>Username: ${req.user.username}</p>
                            <strong><a href="${link}">Click here to verify</a></strong>`
                }
                smtpTransport.sendMail(mailOptions, (err,response) => {
                    if(err)
                        return res.redirect('/');    
                    req.flash('homePgMsg', `Email has been sent for Approval.`);
                    res.redirect('/');            
                });
            })
        })
});

route.get('/verify', (req,res) => {
    models.User.findById(req.query.user)
        .then(user => {
            if(bcrypt.compareSync(req.query.user, req.query.id)){
                user.isAdmin = true;
                user.save();
                req.flash('homePgMsg', `${user.name} is an Admin Now.`);
            }
            res.redirect('/');        
        })
        .catch(err => {
            console.log(err);
        })
});

module.exports = route;