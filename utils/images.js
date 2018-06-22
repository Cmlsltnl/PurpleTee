const cloudinary = require('cloudinary');
const multer = require('multer');
const { CLOUDINARY } = require('../config');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public_static/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + file.originalname)
    },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(null, false);
        }
        cb(null, true);
    }
});
const upload = multer({storage: storage});

cloudinary.config({
    cloud_name: CLOUDINARY.CLOUD_NAME,
    api_key: CLOUDINARY.API_KEY,
    api_secret: CLOUDINARY.API_SECRET
});

module.exports = { upload, storage, cloudinary };
