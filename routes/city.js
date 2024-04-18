const express = require('express');

const cityController = require('../controllers/city.js');
const isAuth = require('../middlewares/is-auth')

const router = express.Router();

// **************************
// ***     City Page      ***
// **************************
router.get('/', isAuth, cityController.GetCity);
router.get('/', isAuth, cityController.GetPosition);

router.get('/dashboard', isAuth, cityController.getCityDashboard);
router.get('/follow', isAuth, cityController.getCityFollow);
router.get('/upload', isAuth, cityController.getCityUpload);

module.exports = router;
