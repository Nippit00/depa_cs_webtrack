
const express = require('express');

const adminController = require('../controllers/admin.js');
const isAuth = require('../middlewares/is-auth')
const isAdmin = require('../middlewares/is-admin')

const router = express.Router();

// **************************
// ***     Admin Page     ***
// **************************
router.get('/', isAdmin, adminController.getAdPage);

router.get('/adduser', isAdmin, adminController.getAddUserPage);
// **************************
// ***     City Page     ***
// **************************
//get city
router.get('/city', isAdmin, adminController.getAdCityP);
router.get('/city/:cityID', isAdmin, adminController.getAdCityDataP);
router.get('/addCity',isAdmin,adminController.getAddCity)
router.post('/postAddCity',isAdmin,adminController.postAddCity)
module.exports = router;
