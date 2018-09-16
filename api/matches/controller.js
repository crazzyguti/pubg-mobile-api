const db = require('../../storage/main/models/index');
const Joi = require('joi');
const Insta = require('instamojo-nodejs');
const API_KEY = process.env.INSTAMOJO_API_KEY_PUBG || 'test_f6dcb6d040f7cdf5fc7884233e8';
const AUTH_KEY = process.env.INSTAMOJO_AUTH_KEY_PUBG || 'test_f9531e70b8123199e8cc5467d38';

Insta.setKeys(API_KEY, AUTH_KEY);

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

const createMatchEntry = (req, res) => {
  const schema = Joi.object().keys({
      userId: Joi.number().positive().required(),
      matchId: Joi.number().positive().required()
  }).options({
      stripUnknown: true
  });
  return Joi.validate(req.body, schema, function (err, value) {
      if (err) {
          return res.status(422).json(err.details[0].message);
      } else {
        console.log('req.body', value.matchId);
          if (!req.user) {
            return res.status(404).json(`User not found`);
          } else if (!req.user.isVerified) {
            return res.status(404).json(`Please verify your account`);
          } else {
            const promiseArray = [];
            // total participants in a match
            promiseArray.push(db.MatchUsers.count({
              where: {
                matchId: value.matchId
              },
              raw: true
            }));
            // check the user is already present in a math or not
            promiseArray.push(db.MatchUsers.findAndCountAll({
              where: {
                matchId: value.matchId,
                userId : req.user.id
              },
              raw: true
            }));
            promiseArray.push(db.Matches.findOne({
              where : {
                id : value.matchId
              },
              raw: true
            }));
             Promise.all(promiseArray).then(data => {
              if (data[0] >= 100) {
                return res.status(404).json(`Oops, the tournament is full, try another.`);
              } else if (data[1].count > 0) {
                return res.status(404).json(`Already Partcicipated`);
              } else {
                console.log('in elese');
                  var data = new Insta.PaymentData();
                  data.purpose = "Tournament";            // REQUIRED
                  data.amount = data[2].entryFee;                  // REQUIRED
                  data.phone = req.user.contact;                  // REQUIRED
                  data.buyer_name = req.user.firstName + ' ' + req.user.lastName;                  // REQUIRED
                  data.redirect_url = 'https://pubg-mobile-api.herokuapp.com/varifypayment?userId=' + req.user.id + '&matchId=' + value.matchId;                  // REQUIRED
                  // data.send_email = 9;                  // REQUIRED
                  // data.webhook = 9;                  // REQUIRED
                  // data.send_sms = 9;                  // REQUIRED
                  data.email = req.user.email;                  // REQUIRED
                  data.allow_repeated_payments = false;                  // REQUIRED
                  data.setRedirectUrl(REDIRECT_URL);
                  Insta.createPayment(data, function(error, response) {
                    if (error) {
                      // some error
                      console.log(error);
                    } else {
                      console.log(response);
                      return db.MatchUsers.create({
                        matchId : value.matchId,
                        userId : req.user.id,
                        payment : response.payment_request.amount,
                        paymentRequestId : response.payment_request.id,
                        createdBy : req.user.email,
                        updatedBy : req.user.email
                      }).then((result) => {
                      }).catch(err => {
                        console.log(err);
                        return res.status(500).json('Error while creating user in a match');
                      })
                      // Payment redirection link at response.payment_request.longurl
                    }
                  });
                  return res.status(200).json(`User added succesfully`);
                
              }
            }).catch(err => {
              console.log(err);
              return res.status(500).json('Error in promises');
            })
          }
      }
  });
}

module.exports = {
  getMatches: getMatches,
  verifypayment: verifypayment,
  deletePlayer: deletePlayer,
  createMatchEntry : createMatchEntry
};
