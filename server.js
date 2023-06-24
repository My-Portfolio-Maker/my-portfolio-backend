const express = require('express');
const dotenv = require('dotenv')
const morgan = require('morgan');
const session = require('express-session');
const MemoryStore = require('memorystore')(session)
const connectDB = require('./config/db')
const formidable = require('express-formidable');
const cors = require('cors')
const moment = require('moment');
const path = require('path')

module.exports = {
    __basedir: __dirname
}

// Load config 

dotenv.config({
    path: './config.env'
})

// Connect to DB
connectDB(process.env.MONGODB_URI, false)

const app = express();

// Setup CORS Origin

app.use(cors({ credentials: true, origin: true }))

// Setup session middleware

app.set('trust proxy', 1);

app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//middleware for logging http requests

const logger = (req, res, next) => {
    console.log("Logging ", req.url);
    
    next()
}

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
else if(process.env.NODE_ENV === 'development-no-crash'){
    app.use(morgan('dev'))
    process.on('uncaughtException', function(err){
        console.error(err.stack);
        process.exit()
    })
}

app.use(logger)

//middleWare for setting JSON Content Type for request

app.use((_req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    return next()
});

//routes

app.use("/", require('./routes/index'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`\nCurrent time: ${moment().format('LTS')}\n`)
})