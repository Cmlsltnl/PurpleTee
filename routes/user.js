const route = require('express').Router();
const crypto = require('crypto');
const fs = require('fs');
const passport = require('passport');
const models = require('../models');
const auth = require('../utils/auth.js');
const { upload, cloudinary } = require("../utils/images");

const uploadImageandCreateUser = req => {
    if (req.file) {
        return cloudinary.uploader.upload(req.file.path)
            .then(result => {
                fs.unlink(req.file.path);
                return models.User.create({
                    ...req.body,
                    picture: result.url
                })
            });
    } else {
        let size = 200;
        let md5 = crypto.createHash('md5').update(req.body.email).digest('hex');
        let url = 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';

        return models.User.create({
            ...req.body,
            orientation: 'gravatar',
            picture: url
        });
    }
};
const uploadImageandEditUser = (req,user) => {
    if (req.file) {
        return cloudinary.uploader.upload(req.file.path)
            .then(result => {
                fs.unlink(req.file.path);
                user.name = req.body.name;
                user.orientation = req.body.orientation;
                user.address = req.body.address;
                user.picture = result.url;
                return user.save();
            });
    } else {
        if(req.body.removePic && req.body.removePic=='on'){
            let size = 200;
            let md5 = crypto.createHash('md5').update(user.email).digest('hex');
            let url = 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
            user.picture = url;
            user.orientation = 'gravatar';
        }
        user.name = req.body.name;
        user.address = req.body.address;
        return user.save();
    }
};

route.post('/signup', upload.single('profilePic'), (req,res,next) => {
     
    models.User
        .findOne({email: req.body.email})
        .then(existingEmailUser =>{
            if(existingEmailUser){
                req.flash('errors', 'Email already exists!');
                return res.redirect('/signup');
            } else {
                return models.User.findOne({username: req.body.username});
            }
        })
        .then(existingUsernameUser => {
            if(existingUsernameUser){
                req.flash('errors', 'Username already exists!');
                return res.redirect('/signup');
            } else {
                return uploadImageandCreateUser(req);
            }
        })
        .then(user=> {
            req.flash('signupSuccess', 'Successfully Signed Up!');
            res.redirect('/login');
        })
        .catch(err=> {
            console.log(`Error: ${err}`);
            res.redirect('/signup');
        })
})
route.post('/:username/profile/edit', auth.isLoggedIn, auth.checkCorrectUser, upload.single('profilePic'), (req,res,next) => {
    models.User
        .findById(req.user._id)
        .then(user => {
            return uploadImageandEditUser(req,user);
        })
        .then(user => {
            req.flash('editSuccess', 'Successfully edited your profile!');
            res.redirect(`/${user.username}/profile`);
        })
        .catch(err => {
            return next(err);
            res.redirect(`/${user.username}/profile`);
        })
})


route.get('/signup', (req,res) => {
    if(req.user)
        return res.redirect('/');
    res.render('user/signup', {errors: req.flash('errors')});
})
route.get('/login', (req,res) => {
    if(req.user)
        return res.redirect('/');
    res.render('user/login', {message: req.flash('loginMsg'), successMsg: req.flash('signupSuccess')});
})
route.get('/logout', (req, res)=>{
    if(req.user){
        req.logout();
        req.flash('homePgMsg', 'Successfully Logged Out!');
    }
    res.redirect('/');
});
route.get('/profile', (req,res) => {
    if(!req.query.userId){
        req.flash('homePgFail', 'Page does not exist.');
        return res.redirect('/');
    }
    models.User
        .findById(req.query.userId)
        .then(profileUser => {
            if(profileUser)
                res.redirect(`/${profileUser.username}/profile`);
            else {
                req.flash('homePgFail','No such User exists.');
                res.redirect('/');
            }
        })
        .catch(err=> {
            console.log(err);
            res.redirect('/');
        })
})
route.get('/:username/profile', (req,res,next) => {
    models.User
        .findOne({username: req.params.username})
        .then(profileUser => {
            if(profileUser)
                res.render('user/profile', {profileUser, message: req.flash('editSuccess')});
            else {
                req.flash('homePgFail','No such User exists.');
                res.redirect('/');
            }
        })
        .catch(err => {
            return next(err);
        })
})
route.get('/:username/profile/edit', auth.isLoggedIn, auth.checkCorrectUser, (req,res,next) =>{
    res.render('user/editProfile.ejs');
})
route.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    successFlash: true,
    failureFlash: true
}))
route.get('/:username/cart', (req,res)=>{
    models.User
        .findOne({username: req.params.username})
        .populate({path : 'cart', populate : {path : 'product'}})
        .then(profileUser => {
            if(!profileUser){
                req.flash('homePgFail', 'No such user exists.');
                res.redirect('/');
            } else {
                res.render('user/cart', {populatedUser: profileUser, success: req.flash('success'), fail: req.flash('fail')});
            }
        })
        .catch(err => {
            console.log(err);
            res.redirect('/');
        })
})

route.get('/:username/cart/remove/:itemId', (req,res)=>{
    models.User
        .findOne({username: req.params.username})
        .then(user=>{
            if(!user){
                req.flash('homePgFail', 'No such user exists.');
                res.redirect('/');
            } else {
                models.Item
                    .findById(req.params.itemId)
                    .then(item =>{
                        if(!item){                            
                            req.flash('homePgFail', 'No such item exists in your cart.');
                            res.redirect('/');
                        } else {
                            if(user.cart.indexOf(item.id) == -1){
                                res.redirect(`/${user.username}/cart`);
                            } else {
                                user.cart.splice(user.cart.indexOf(item.id),1);
                                user.save();
                                req.flash('success', 'Removed from cart.');
                                res.redirect(`/${user.username}/cart`);                    
                            }
                        }
                    })
            }
        })
        .catch(err=>{
            console.log(err);
            res.redirect('/');
        })
})

route.get('/:username/wishlist', (req,res)=>{
    models.User
        .findOne({username: req.params.username})
        .populate('wishlist')
        .then(profileUser => {
            if(!profileUser){
                req.flash('homePgFail', 'No such user exists.');
                res.redirect('/');
            } else {
                res.render('user/wishlist', {populatedUser: profileUser, success: req.flash('success'), fail: req.flash('fail')});
            }
        })
        .catch(err => {
            console.log(err);
            res.redirect('/');
        })
})

route.get('/:username/wishlist/remove/:productId', (req,res)=>{
    models.User
        .findOne({username: req.params.username})
        .then(user=>{
            if(!user){
                req.flash('homePgFail', 'No such user exists.');
                res.redirect('/');
            } else {
                models.Product
                    .findById(req.params.productId)
                    .then(product=>{
                        if(!product){                            
                            req.flash('homePgFail', 'No such product exists.');
                            res.redirect('/');
                        } else {
                            if(user.wishlist.indexOf(product.id) == -1){
                                res.redirect(`/${user.username}/wishlist`);
                            } else {
                                user.wishlist.splice(user.wishlist.indexOf(product.id),1);
                                user.save();
                                req.flash('success', 'Removed from wishlist.');
                                res.redirect(`/${user.username}/wishlist`);
                            }
                        }
                    })
            }
        })
        .catch(err=>{
            console.log(err);
            res.redirect('/');
        })
})

route.get('/:username/notifications', (req,res)=>{
    res.render('user/notifications');
})

route.get('/users', (req,res)=>{
    res.render('user/users');
})

module.exports = route;