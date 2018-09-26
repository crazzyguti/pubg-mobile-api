var express = require('express')
  , router = express.Router()

const passport = require('passport');
const controller = require('./controller');
  // POST /verication?token=[string]&email=[string]
router.post('/matchnotification', passport.authenticate('jwt', { session: false }), controller.sendMatchNotification);
// router.post('/changepasswordemail', controller.changePasswordEmail);
// router.get('/changepassword', controller.changePassword);

module.exports = router
