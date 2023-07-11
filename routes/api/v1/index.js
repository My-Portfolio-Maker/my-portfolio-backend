const express = require('express');
const router = express.Router();
const path = require('path');
const { __basedir } = require('../../../server.js');
const auth = require('../../../middleware/auth');
const contentType = require('../../../middleware/contentType');
const formData = require('../../../middleware/formData.js');


router.use('/get/profile/', auth.verifyUID, require('./get/profile'));
router.use('/get/skills/', auth.verifyUID, require('./get/skills'))
router.use('/get/extras/', auth.verifyUID, require('./get/extras'))
router.use('/get/resume/', auth.verifyUID, require('./get/resume'))
router.use('/get/services/', auth.verifyUID, require('./get/services'))
router.use('/get/uploads', require('./get/uploads'));

router.use('/email', [auth.verifyUID, formData], require('./email'));


router.get('/', async(_, res)=>{

    return res.status(200).send('Welcome to Server Public API page');
})

module.exports = router;