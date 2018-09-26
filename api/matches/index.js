const express = require('express')
  , router = express.Router();
const bodyParser = require('body-parser')

const customParser = bodyParser.json({type: function(req) {
  return req.headers['content-type'] === '*/*; charset=UTF-8'
}});

const passport = require('passport');
const MatchesController = require('./controller');
  // POST /verication?token=[string]&email=[string]
router.get('/matches/listing/', passport.authenticate('jwt', { session: false }), MatchesController.getMatches);
router.post('/matches/paymentsuccess/', customParser, MatchesController.paymentSuccess);
router.post('/matches/deletePlayer/', passport.authenticate('jwt', { session: false }), MatchesController.deletePlayer);
router.post('/matches/entry/', passport.authenticate('jwt', { session: false }), MatchesController.createMatchEntry);
router.get('/matches/info/:id', passport.authenticate('jwt', { session: false }), MatchesController.createMatchEntry);
// router.get('/matches/info/:id', MatchesController.getMatchInfo);
module.exports = router;
