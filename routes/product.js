const route = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const models = require('../models');
const auth = require('../utils/auth');
const {storage, cloudinary} = require('../utils/images.js');

const uploadImageandCreateProduct = (req, next) => {
    
    let product = new models.Product();
    let items = 0;
    if(req.files && req.files.length){
        
        req.files.forEach(file => {
            cloudinary.uploader.upload(file.path, (result)=>{
                fs.unlink(file.path);
                if(result.url)
                    product.images.push(result.url);
                items++;
                if(items==req.files.length){
                    return next(null, product);
                }
            })
        });
    } else {
        return next(null, product);
    }
}

route.get('/upload', auth.isLoggedIn, (req,res) => {
    res.render('product/upload');
})

route.post('/upload', auth.isLoggedIn, (req,res) => {
    const uploadMultiple = multer({ storage : storage }).array('productPic',20);

    uploadMultiple(req,res,function(err) {
        if(err) {
            req.flash('homePgFail', 'Error Uploading pictures. Make sure not more than 20 files are uploaded.');
            res.redirect('/');
        } 
            uploadImageandCreateProduct(req, (err, product)=>{
                if(err){
                    req.flash('homePgFail', 'Error uploading product. Please try again.');
                    return res.redirect('/');
                }
                
                product.gender = req.body.gender;
                product.name = req.body.name;
                product.description = req.body.description;
                product.price = req.body.price;
                product.designer = req.user._id;

                if(req.user.isAdmin){
                    product.status = 'in stock';
                    product.approvedBy = req.user._id;
                } else {
                    product.status = 'pending';
                }


                product
                    .save()
                    .then(product => {
                        if(req.user.isAdmin)
                            req.flash('success', 'Successfully uploaded the product.');
                        else
                            req.flash('success', 'Successfully submitted the product for approval.');
                        res.redirect(`/product/${product.id}`);
                    })      
                    .catch(err => {
                        req.flash('homePgFail', 'Error uploading product. Please try again.');
                        return res.redirect('/');    
                    })
            })
        });
})

route.get('/approve', (req,res)=>{
    models.Product
        .find({status: 'pending'})
        .then(products => {
            res.render('product/pending', {products: products});
        })
        .catch(err => {
            console.log(err);
            res.redirect('/');
        })
})

route.get('/:id/approve', (req,res)=>{
    models.Product
        .findById(req.params.id)
        .populate('designer')
        .then(product => {
            if(!product){
                req.flash('homePgFail', 'No such product exists.');
                res.redirect('/');
            }
            res.render('product/approve', {product});
        })
        .catch(err => {
            console.log(err);
            res.redirect('/');
        })
})

route.post('/:id/approve', (req,res)=>{
    models.Product
    .findById(req.params.id)
    .then(product => {
        if(!product){
            req.flash('homePgFail', 'No such product exists.');
            res.redirect('/');
        }

        product.gender = req.body.gender;
        product.name = req.body.name;
        product.description = req.body.description;
        product.price = req.body.price;
        product.status = 'in stock';
        product.approvedBy = req.user._id;

        product
            .save()
            .then(product => {
                req.flash('success', 'Successfully approved the product.');
                res.redirect(`/product/${product.id}`);
            })      

    })
    .catch(err => {
        console.log(err);
        res.redirect('/');
    })
})

route.get('/:id/reject', (req,res)=>{
    models.Product
    .findById(req.params.id)
    .then(product => {
        if(!product){
            req.flash('homePgFail', 'No such product exists.');
            res.redirect('/');
        }
        res.render('product/reject', {product});
    })
    .catch(err => {
        console.log(err);
        res.redirect('/');
    })
})

route.post('/:id/reject', (req,res)=>{
    models.Product
    .findById(req.params.id)
    .then(product => {
        if(!product){
            req.flash('homePgFail', 'No such product exists.');
            res.redirect('/');
        }

        product.status = 'rejected';
        product.rejectReason = req.body.rejectReason; 
        product.approvedBy = req.user._id;

        product
            .save()
            .then(product => {
                req.flash('success', 'Successfully rejected the product.');
                res.redirect(`/product/${product.id}`);
            })      

    })
    .catch(err => {
        console.log(err);
        res.redirect('/');
    })
})

route.get('/', (req,res)=>{
    res.render('product/products');
})

route.get('/:id', (req,res)=>{
    models.Product
        .findById(req.params.id)
        .populate('designer')
        .populate('approvedBy')
        .then(product => {
            if(!product){
                req.flash('homePgFail', 'No such product.');
                res.redirect('/');    
            }
            res.render('product/product', {product, success: req.flash('success'), fail: req.flash('fail')});
        })
        .catch(err => {
            console.log(err);
            req.flash('homePgFail', 'No such product.');
            res.redirect('/');
        })
})

route.get('/:id/wishlist/:username', (req,res)=>{
    models.Product
        .findById(req.params.id)
        .then(product=>{
            if(!product){
                req.flash('homePgFail', 'No such product exists.');
                res.redirect('/');
            } else {
                models.User
                    .findOne({username: req.params.username})
                    .then(user=>{
                        if(!user){                            
                            req.flash('homePgFail', 'No such user exists.');
                            res.redirect('/');
                        } else {
                            if(user.wishlist.indexOf(product.id) != -1){
                                req.flash('success', 'Already added to wishlist.');
                                res.redirect(`/product/${product.id}`);
                            } else {
                                user.wishlist.push(product.id);
                                user.save();
                                req.flash('success', 'Added to wishlist.');
                                res.redirect(`/product/${product.id}`);
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
route.post('/:id/cart/:username', (req,res)=>{
    models.Product
        .findById(req.params.id)
        .then(product=>{
            if(!product){
                req.flash('homePgFail', 'No such product exists.');
                res.redirect('/');
            } else {
                models.User
                    .findOne({username: req.params.username})
                    .then(user=>{
                        if(!user){                            
                            req.flash('homePgFail', 'No such user exists.');
                            res.redirect('/');
                        } else {
                            models.Item.create({
                                ...req.body,
                                product: product._id
                            })
                            .then(item=>{
                                user.cart.push(item);
                                return user.save();
                            })
                            .then(savedUser=>{
                                req.flash('success', 'Added to cart.');
                                res.redirect(`/product/${product.id}`);    
                            })
                        }
                    })
            }
        })
        .catch(err=>{
            console.log(err);
            res.redirect('/');
        })
})

module.exports = route;