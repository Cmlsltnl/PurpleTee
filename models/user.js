const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = mongoose.Schema({
    email : {type: String, unique: true, lowercase: true},
    password : String, 
    username : {type: String, unique: true, lowercase: true},
    name: String,
    picture: String,
    isAdmin: {type: Boolean, default : false},
    orientation: {type: String, default: 'off'},
    address: String,
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'item'
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }],
    designs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }]
}, {
    usePushEach : true
});

userSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(10, function(err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  });
  
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('user', userSchema); 