const express = require('express');

const uploadController = require('../controllers/uploadRoutes.js');

const isAuth = require('../middlewares/is-auth.js');
const router = express.Router();

router.post('/formsmart/:solutionID',isAuth, uploadController.uploadFile, uploadController.handleUpload);
router.post('/formsmart_round2/:solutionID', isAuth, uploadController.uploadFileRound2, uploadController.handleUploadRound2);


module.exports = router;