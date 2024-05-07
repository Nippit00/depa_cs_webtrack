const express = require('express');

const formController = require('../controllers/form.js');

const isAuth = require('../middlewares/is-auth.js');
const router = express.Router();

//open form
router.get('/form',isAuth,formController.getform);

//Check before installing into database 
router.post('/formcheck/:solutionID',isAuth,formController.postFormcheck);
router.post('/comfirmformcheck/:solutionID',isAuth,formController.comfirmFormcheck);

//select form
router.get('/formsmart/:solutionID',isAuth,formController.getformSmart);

//send data form to backebd 
router.post('/sendformsmart/:solutionID',isAuth,formController.postFormSmart);

//formcdp
router.get('/formcdpfirst',formController.getformGdpFirst);
module.exports = router;