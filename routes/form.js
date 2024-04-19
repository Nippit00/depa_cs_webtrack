const express = require('express');

const formController = require('../controllers/form.js');

const isAuth = require('../middlewares/is-auth.js');
const router = express.Router();

router.get('/form',isAuth,formController.getform);
router.get('/formcdp/:solutionID',isAuth,formController.getformCdp);

module.exports = router;