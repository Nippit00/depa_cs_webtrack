const express = require('express');

const cityController = require('../controllers/city.js');

const router = express.Router();

// **************************
// ***     City Page      ***
// **************************
router.get('/', cityController.getCity);
router.get('/dashboard', cityController.getCityDashboard);
router.get('/follow', cityController.getCityFollow);
router.get('/upload', cityController.getCityUpload);

module.exports = router;
