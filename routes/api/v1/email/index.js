"use strict";
const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: false,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: process.env.USER_MAILID,
    pass: process.env.USER_MAILPASS
  }
});

router.post('/send', async(req, res)=>{

    transporter.verify(function(error, success){

        
        if(error){
            console.log(error)
            return res.sendStatus(400)
        }
        else {
            console.log('Server is ready to take our messages');
            return res.sendStatus(200);
        }
    })
    
})


module.exports = router;