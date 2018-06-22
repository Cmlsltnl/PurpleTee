const route = require('express').Router();
const models = require('../../models');

route.get('/', (req, res) => {
    models.User
        .find({isAdmin: true})
        .then(admins => {
            res.send(admins);
        })
        .catch(err=>{
            console.log(err);
        })
})

module.exports = route;