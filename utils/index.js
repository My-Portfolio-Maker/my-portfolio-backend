const jwt = require("jsonwebtoken");
const moment = require('moment');
const { defaultDateFormat } = require("../constants");

const getAuthTokenFromHeader = (header, decode = false) => {
    const bearerHeader = header["authorization"];
    const token = bearerHeader && bearerHeader.split(" ")[1];

    if (decode) {
        return jwt.decode(token);
    }
    return token;
}


const resolveDateFormat = (data, format) => {
    if (data) {
        if (format)
            return moment(data, format)
        else if (!format)
            return moment(data, defaultDateFormat)
    }
    return moment().format(format?format:defaultDateFormat)
}
module.exports = { getAuthTokenFromHeader, resolveDateFormat };