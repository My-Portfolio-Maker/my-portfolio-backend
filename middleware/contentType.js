const path = require('path');
const { __basedir } = require('../server.js');
const fs = require('fs')


const contentType = async(req, res, next)=>{
    

    let filePath = path.join(__basedir, 'uploads/images', req.url);

    let contentType = 'text/html'
    let mimeType = path.extname(filePath)

    switch (mimeType) {
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
        case '.jpeg': contentType = 'image/jpeg'; break;
    }
    
    fs.readFile(filePath, (error, data) => {
        // stop the execution and send nothing if the requested file path does not exist.
        if (error) return next()
        
        // otherwise, fetch and show the target image
        res.writeHead(200, { 'Content-Type': contentType })
        res.end(data, 'utf8')
    })
}

module.exports = contentType