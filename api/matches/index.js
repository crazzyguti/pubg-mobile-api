var express = require('express')
  , router = express.Router()
const MatchesController = require('./controller');
  // POST /verication?token=[string]&email=[string]
router.get('/matches/listing/', MatchesController.getMatches);

module.exports = router;