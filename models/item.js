const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    size: String, 
    gender: String,
    quantity: Number,
    product : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }
}, {
    usePushEach : true
});

module.exports = mongoose.model('item', itemSchema); 