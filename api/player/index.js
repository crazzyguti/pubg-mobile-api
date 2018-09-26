const express = require('express')
  , router = express.Router();
  const playerController = require('./controller');
  const passport = require('passport');

// const passport = require('passport');
// POST /verication?token=[string]&email=[string]
router.get('/player/profile/', passport.authenticate('jwt', { session: false }), playerController.getPlayerProfile);

module.exports = router;
