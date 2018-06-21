const route = require('express').Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt-nodejs');
const auth = require('../utils/auth.js');
const models = require('../models');
const CONFIG = require('../config');

const smtpTransport = nodemailer.createTransport({
    service: CONFIG.NODE_MAILER.SERVICE,
    auth: {
        user: CONFIG.NODE_MAILER.USER,
        pass: CONFIG.NODE_MAILER.PASS
    }
});


route.get('/signup', auth.isLoggedIn, (req,res)=>{
    res.render('adminApproval');
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
                            <p>User: ${req.user._id}</p>
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