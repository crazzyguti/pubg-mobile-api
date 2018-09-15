const db = require('../../storage/main/models/index');
const Joi = require('joi');


const getMatches = (req, res) => {
  return db.Matches.findAll({
    include: [{
      model: db.Users
    }, {
      model: db.MatchUsers,
      where: {
        userId: req.user.id
      },
      required: false
    }]
  }).then(matches => {
    return res.status(200).json(matches);
  }).catch(reason => {
    console.log(reason);
    return res.status(404).json(`Matches not found`);
  });
}

const verifypayment = (req, res) => {
  const schema = Joi.object().keys({
    matchId: Joi.number().required(),
    payment: Joi.number().required()
  }).options({
    stripUnknown: true
  });
  return Joi.validate(req.body, schema, function (err, params) {
    if (err) {
      return res.status(422).json(err.details[0].message);
    } else {
      return db.MatchUsers.update({
        userId: req.user.id,
        matchId: params.matchId
      }, {
        payment: 100,
        paymentVerified: true,
        createdBy: req.user.email,
        updatedBy: req.user.email
      }).then(data => {
        return res.status(200).json(data);
      }).catch(reason => {
        console.log(reason);
        return res.status(404).json(`Payment Verification Failed`);
      });
    }
  });
}

const deletePlayer = (req, res) => {
  const schema = Joi.object().keys({
    matchId: Joi.number().required(),
    payment: Joi.number().required()
  }).options({
    stripUnknown: true
  });
  return Joi.validate(req.body, schema, function (err, params) {
    if (err) {
      return res.status(422).json(err.details[0].message);
    } else {
      return db.MatchUsers.destroy({
        userId: req.user.id,
        matchId: params.matchId
      }).then(data => {
        return res.status(200).json(data);
      }).catch(reason => {
        console.log(reason);
        return res.status(404).json(`Payment Verification Failed`);
      });
    }
  });
}

module.exports = {
  getMatches: getMatches,
  verifypayment: verifypayment,
  deletePlayer: deletePlayer
};