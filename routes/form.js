const express = require('express');

const formController = require('../controllers/form.js');

const isAuth = require('../middlewares/is-auth.js');
const router = express.Router();


router.post('/saveForm/:solutionID',isAuth,formController.saveAnsObj);
module.exports = router;