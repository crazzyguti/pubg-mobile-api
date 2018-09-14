var express = require('express')
  , router = express.Router()
const AuthController = require('../../middlewares/auth');
const passport = require('passport');

router.post('/', AuthController.authenticateUser);
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).send(req.user);
});

module.exports = router;