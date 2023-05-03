const jwt = require("jsonwebtoken");


const getAuthTokenFromHeader = (header, decode = false) => {
    const bearerHeader = header["authorization"];
    const token = bearerHeader && bearerHeader.split(" ")[1];

    if(decode){
        return jwt.decode(token);
    }
    return token;
}

module.exports = { getAuthTokenFromHeader };