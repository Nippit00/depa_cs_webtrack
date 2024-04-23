const express = require('express');


const formController = require('../controllers/form.js');


const isAuth = require('../middlewares/is-auth.js');
const router = express.Router();


router.get('/form',isAuth,formController.getform);
router.get('/formcdp/:solutionID',isAuth,formController.getformCdp);
router.post('/sendformcdp/:solutionID',isAuth,formController.postFormCdp);
router.post('/submitformcdp/:solutionID',isAuth,formController.submitFormCdp);
router.post('/testform',isAuth,formController.testForm)
// router.get('/sendformcdp',formController.postFormCdp);
module.exports = router;

