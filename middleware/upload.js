const multer = require('multer');
const { __basedir } = require('../server.js');
const { v4: uuidv4 } = require('uuid');
const { getFileExtension } = require('../utils');
const util = require('util');
const ErrorHandler = require('../errors/ErrorHandler');
const UploadErrorHandler = require('../errors/UploadErrorHandler');
const fs = require('fs');
const path = require('path');

const multerS3 = require('multer-s3');

const maxSize = 8 * 1024 * 1024

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
    const upload = uploadFile("images").array('image', 5)

    upload(req, res, function (err) {
        nextHandler(res, err, next)
    })
}

const AWSCvUpload = (req, res, next) => {

    const upload = s3UploadFile("cv", false).single("file")

    upload(req, res, function (err) {
        nextHandler(res, err, next);
    })

}

const AWSImageUpload = (req, res, next) => {
    const upload = s3UploadFile("images", false).array("image", 5)

    upload(req, res, function (err) {
        nextHandler(res, err, next)
    })
}

const uploadFile = (type, keepExtension, memory = false) => {
    //middleware to create upload directories

    const createDir = async (type) => {

        const dir = `./uploads/${type}`

        if (!fs.existsSync(dir)) {
            console.log('Creating upload directories...')
            fs.mkdirSync(dir, {
                recursive: true
            })
            return true
        }
        else
            return true
    }

    let storage = multer.diskStorage({
        destination: (req, file, cb) => {
            if (createDir(type))
                cb(null, __basedir + `/uploads/${type}`)
        },
        filename: (req, file, cb) => {
            const newFileName = keepExtension ? uuidv4() + "." + getFileExtension(file.originalname) : uuidv4();
            //rename the incoming file to the file's name
            cb(null, newFileName);
        },
    });

    let storage2 = multer.memoryStorage();

    return multer({
        storage: memory ? storage2 : storage,
        limits: {
            fileSize: maxSize,
        },
        fileFilter: (req, file, cb) => {
            if (type === 'images') {
                if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                    return cb(new Error('Please upload a valid image file'))
                }
            }
            else if (type === 'cv') {
                if (!file.originalname.match(/\.(pdf|docx|doc|pptx|txt)$/)) {
                    return cb(new Error('Please upload a valid document file'))
                }
            }
            cb(undefined, true)
        }
    })

}

const s3UploadFile = (type, keepExtension) => {

    const s3 = global.s3
    const s3Storage = multerS3({
        s3: s3, // s3 instance
        bucket: process.env.AWS_BUCKET_NAME,
        acl: "public-read", // storage access type
        metadata: (req, file, cb) => {
            cb(null, { fieldname: file.fieldname })
        },
        key: (req, file, cb) => {
            const newFileName = keepExtension ? uuidv4() + "." + getFileExtension(file.originalname) : uuidv4();
            //rename the incoming file to the file's name
            var fullPath = `${type}/${newFileName}`
            cb(null, fullPath);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
    });

    // function to sanitize files and send error for unsupported files
    function sanitizeFile(file, cb) {
        // Define the allowed extension
        if (type === 'images') {
            const fileExts = [".png", ".jpg", ".jpeg"];

            // Check allowed extensions
            const isAllowedExt = fileExts.includes(
                path.extname(file.originalname.toLowerCase())
            );

            // Mime type must be an image
            const isAllowedMimeType = file.mimetype.startsWith("image/");

            if (isAllowedExt && isAllowedMimeType) {
                return cb(null, true); // no errors
            } else {
                // pass error msg to callback, which can be displaye in frontend
                cb("Error: File type not allowed!");
            }
        }
        else if (type === 'cv') {
            const fileExts = [".pdf", ".docx", ".doc", ".pptx", ".txt"];

            // Check allowed extensions
            const isAllowedExt = fileExts.includes(
                path.extname(file.originalname.toLowerCase())
            );

            if (isAllowedExt) {
                return cb(null, true); // no errors
            } else {
                // pass error msg to callback, which can be displaye in frontend
                cb("Error: File type not allowed!");
            }
        }
    }

    // our middleware
    return multer({
        storage: s3Storage,
        fileFilter: (req, file, callback) => {
            sanitizeFile(file, callback)
        },
        limits: {
            fileSize: maxSize // 8mb file size
        }
    })
}

module.exports = {
    SingleFile,
    MultipleImageFiles,
    AWSImageUpload,
    AWSCvUpload
}
