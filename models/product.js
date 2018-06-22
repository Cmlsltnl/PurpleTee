const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    images : [String],
    name : String, 
    description: String,  
    designer : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    approvedBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    status : String
}, {
    usePushEach : true
});

module.exports = mongoose.model('product', productSchema); 