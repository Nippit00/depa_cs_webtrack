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
router.get('/formcdp1',isAuth,formController.getformCdp1);
router.get('/formcdp2',isAuth,formController.getformCdp2);
router.get('/formcdp3',isAuth,formController.getformCdp3);
router.get('/formcdp4',isAuth,formController.getformCdp4);
module.exports = router;