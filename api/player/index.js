const express = require('express')
  , router = express.Router();
  const playerController = require('./controller');

// const passport = require('passport');
// POST /verication?token=[string]&email=[string]
router.get('/player/profile/', playerController.getPlayerProfile);

module.exports = router;
