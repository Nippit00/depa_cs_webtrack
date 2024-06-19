
const express = require('express');

const noti = require('../controllers/notification.js');


const router = express.Router();

router.get('/noti',noti.notification);
router.post('/postnoti',noti.postnotification);

module.exports = router;
