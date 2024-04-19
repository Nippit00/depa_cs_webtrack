
const express = require('express');

const FileController = require('../controllers/file.js');
const isAuth = require('../middlewares/is-auth')
const router = express.Router();


router.post('/upload', isAuth, FileController.SaveFile);



module.exports = router;
