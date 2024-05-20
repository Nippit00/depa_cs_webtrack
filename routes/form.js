const express = require('express');

const formController = require('../controllers/form.js');

const isAuth = require('../middlewares/is-auth.js');
const router = express.Router();

//open form
// router.get('/form',isAuth,formController.getform);

// //Check before installing into database 

// router.post('/comfirmformcheck/:solutionID',isAuth,formController.comfirmFormcheck);

// router.post('/formcheck_round2/:solutionID',isAuth,formController.postFormcheck2);
// router.post('/comfirmformcheck_round2/:solutionID',isAuth,formController.comfirmFormcheck2);

// //select form
router.get('/formsmart/:solutionID/:round',isAuth,formController.getformSmart);

router.post('/formcheck/:solutionID',isAuth,formController.postFormcheck);

// //select form round 2
// router.get('/formsmart_round2/:solutionID',isAuth,formController.getformSmartRound2);

// //send data form to backebd 
// router.post('/sendformsmart/:solutionID',isAuth,formController.postFormSmart);

// //formcdp
router.get('/formcdp1/:solutionID',isAuth,formController.getformCdp1);


//saveform
router.post('/saveForm/:solutionID/:round',isAuth,formController.saveAnsObj);
router.post('/saveFormcdp1/:solutionID',isAuth,formController.saveAnsObjcdp1);
// router.post('/saveformsmart_round2/:solutionID',isAuth,formController.saveFormRound2);
module.exports = router;