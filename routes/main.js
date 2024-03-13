const express = require('express');

const mainController = require('../controllers/main');

const router = express.Router();

// **************************
// ***     Main Page      ***
// **************************
router.get('/', mainController.getMainPage);
router.get('/index', mainController.getMainPage);

module.exports = router;
