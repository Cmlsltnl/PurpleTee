const route = require('express').Router();
const models = require('../../models');

route.get('/', (req, res) => {
    models.User
        .find()
        .then(users => {
            res.send(users);
        })
        .catch(err=>{
            console.log(err);
        })
})

module.exports = route;