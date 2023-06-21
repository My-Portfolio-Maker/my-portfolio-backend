const multer = require('multer');
const { __basedir } = require('../server');
const { v4: uuidv4 } = require('uuid');
const { getFileExtension } = require('../utils');
const util = require('util');
const ErrorHandler = require('../errors/ErrorHandler');
const UploadErrorHandler = require('../errors/UploadErrorHandler');

const maxSize = 2 * 1024 * 1024

const nextHandler = (res, err, next) => {
    let message;
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        message = UploadErrorHandler(err);
    } else if (err) {
        message = ErrorHandler(err);
    }
    if (message) {
        return res.status(400).json({
            message
        })
    }
    return next();
}

const SingleFile = (req, res, next) => {
    const upload = uploadFile("cv").single("file")

    upload(req, res, function (err) {
        nextHandler(res, err, next);
    })
}

const MultipleImageFiles = (req, res, next) => {
    const upload = uploadFile("images", true).array('image', 5)

    upload(req, res, function (err) {
        nextHandler(res, err, next)
    })
}

const uploadFile = (type, keepExtension) => {
    let storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __basedir + `/uploads/${type}`)
        },
        filename: (req, file, cb) => {
            const newFileName = keepExtension?uuidv4()+"."+getFileExtension(file.originalname):uuidv4();
            //rename the incoming file to the file's name
            cb(null, newFileName);
        },
    });

    return multer({
        storage: storage,
        limits: {
            fileSize: maxSize,
        },
        fileFilter(req, file, cb) {
            if(type === 'images'){
                if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                    return cb(new Error('Please upload a valid image file'))
                }
                cb(undefined, true)
            }   
            else if(type === 'cv'){
                if (!file.originalname.match(/\.(pdf|docx|doc|pptx|txt)$/)) {
                    return cb(new Error('Please upload a valid document file'))
                }
                cb(undefined, true)
            }
            cb(undefined, true)
        }
    })

}

module.exports = {
    SingleFile,
    MultipleImageFiles
}
