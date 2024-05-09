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
router.get('/formcdp1/:solutionID',isAuth,formController.getformCdp1);
router.get('/formcdp2/:solutionID',isAuth,formController.getformCdp2);
router.get('/formcdp3/:solutionID',isAuth,formController.getformCdp3);
router.get('/formcdp4/:solutionID',isAuth,formController.getformCdp4);
router.post('/saveForm/:solutionID',isAuth,formController.saveAnsObj);
module.exports = router;