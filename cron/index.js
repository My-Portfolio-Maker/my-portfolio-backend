const connectDB = require("../config/db");
const SessionRemoveCron = require("./SessionCron");
const dotenv = require('dotenv');
const UploadsRemoveCron = require("./UploadsCron.js/index.js");


const initCron = async () => {
    try {
        // Load config 
        dotenv.config({
            path: './config.env',
        })

        await connectDB(process.env.MONGODB_URI, true);

        SessionRemoveCron.start();
        UploadsRemoveCron.start()
    }
    catch (err) {
        console.log(err);
    }
}

initCron();