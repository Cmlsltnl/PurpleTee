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

route.get('/upload', auth.isLoggedIn, auth.isAdmin, (req,res) => {
    res.render('product/upload');
})

route.post('/upload', auth.isLoggedIn, auth.isAdmin, (req,res) => {
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
                product.name = req.body.name;
                product.description = req.body.description;
                product.status = 'approved';
                product.designer = req.user._id;
                product.approvedBy = req.user._id;


                product
                    .save()
                    .then(product => {
                        req.flash('success', 'Successfully uploaded the product.');
                        res.redirect(`/product/${product.id}`);
                    })      
                    .catch(err => {
                        req.flash('homePgFail', 'Error uploading product. Please try again.');
                        return res.redirect('/');    
                    })
            })
        });
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

module.exports = route;