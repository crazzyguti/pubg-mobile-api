const express = require('express')
  , router = express.Router();
const bodyParser = require('body-parser')

// const customParser = bodyParser.json({type: function(req) {
//   return req.headers['content-type'] === '*/*; charset=UTF-8'
// }});

const passport = require('passport');
const MatchesController = require('./controller');
  // POST /verication?token=[string]&email=[string]
router.post('/paytm/matches/paymentsuccess/', MatchesController.paymentSuccess);
router.post('/paytm/matches/entry/', passport.authenticate('jwt', { session: false }), MatchesController.createMatchEntry);
// router.get('/matches/info/:id', MatchesController.getMatchInfo);
module.exports = router;
