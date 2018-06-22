const route = require('express').Router();
const models = require('../../models');

route.get('/', (req, res) => {
    models.Product
        .find()
        .then(products => {
            res.send(products);
        })
        .catch(err=>{
            console.log(err);
        })
})

module.exports = route;