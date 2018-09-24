var express = require('express')
  , router = express.Router()

router.use('/login', require('./login'))
router.use('/signup', require('./signup'))
router.use('/verification', require('./verification'))
router.use('/', require('./sendverificationmail'))
router.use('/', require('./matches'))
router.use('/', require('./player'))

module.exports = router
