const express = require('express');

const mainController = require('../controllers/main');

const router = express.Router();

// **************************
// ***    Welcome Page    ***
// **************************
router.get('/welcome', mainController.getWelcomePage);

// **************************
// ***     Main Page      ***
// **************************
router.get('/', mainController.getMainPage);
router.get('/index', mainController.getMainPage);

module.exports = router;
