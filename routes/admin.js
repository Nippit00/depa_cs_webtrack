
const express = require('express');

const adminController = require('../controllers/admin.js');
const isAuth = require('../middlewares/is-auth')
const isAdmin = require('../middlewares/is-admin')

const router = express.Router();

// **************************
// ***     Admin Page     ***
// **************************
router.get('/', isAuth, isAdmin, adminController.getAdPage);


// **************************
// ***     City Page     ***
// **************************
router.get('/city', isAuth, isAdmin, adminController.getAdCityP);
router.get('/city/:cityID', isAuth, isAdmin, adminController.getAdCityDataP);

module.exports = router;
