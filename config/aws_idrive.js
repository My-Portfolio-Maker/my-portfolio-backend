const { S3Client } = require("@aws-sdk/client-s3");
const fs = require('fs');
const path = require('path')

const AWSConfig = () => {

    const s3 = new S3Client({
        endpoint: 'https://'+process.env.AWS_S3_ENDPOINT,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        },
        forcePathStyle: true,
        region: 'us-east-1'
    })

    return s3;
}


module.exports = AWSConfig