'use strict';

var express = require('express')
  , router = express.Router()
const AuthController = require('../../middlewares/auth');
  // POST /verication?token=[string]&email=[string]
router.post('/', AuthController.signUp);

module.exports = router;