const connectDB = require("./config/db");
const SessionRemoveCron = require("./cron/SessionCron");
const dotenv = require('dotenv');
const UploadsRemoveCron = require("./cron/UploadsCron.js/index.js");


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