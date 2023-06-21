const { LIMIT_UNEXPECTED_FILE } = require("../constants");
const uploadErrors = require("../constants/errors");

const UploadErrorHandler = (error) => {
    const {code, field} = error;
    switch(code){
        case LIMIT_UNEXPECTED_FILE: 
            return uploadErrors.LIMIT_UNEXPECTED_FILE + ` '/'${field}'/'`;
        default: 
            return code;
    }
}


module.exports = UploadErrorHandler