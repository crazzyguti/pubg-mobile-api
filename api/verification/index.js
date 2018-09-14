var express = require('express')
  , router = express.Router()
const VerificationController = require('./controller');
  // POST /verication?token=[string]&email=[string]
router.get('/', VerificationController);

module.exports = router;