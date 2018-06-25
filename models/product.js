const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    images : [String],
    name : String, 
    description: String, 
    price: Number,  
    gender: String,
    status : String,
    rejectReason: String, 
    designer : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    approvedBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
}, {
    usePushEach : true
});

module.exports = mongoose.model('product', productSchema); 