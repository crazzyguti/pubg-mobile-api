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
    amount: Joi.number().required(),
    buyer: Joi.string().required(),
    currency: Joi.string().required(),
    fees: Joi.number().required(),
    purpose: Joi.string().required(),
    status: Joi.string().required(),
    mac: Joi.string().required(),
    buyer_name: Joi.string().required(),
    buyer_phone: Joi.string().required(),
    payment_id: Joi.string().required(),
    payment_request_id: Joi.string().required()
  }).options({
    stripUnknown: true
  });
  return Joi.validate(req.body, schema, function (err, params) {
    if (err) {
      console.log(err);
      return res.status(422).json(err.details[0].message);
    } else {
      console.log(req.params);
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      return db.MatchUsers.update({
        paymentVerified: true,
        paymentId: params.payment_id,
        createdBy: params.buyer,
        updatedBy: params.buyer
      }, {
        where: {
          userId: req.params.userId,
          matchId: req.params.matchId,
          paymentRequestId: params.payment_request_id  
        }
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
      userId: Joi.number().positive(),
      matchId: Joi.number().positive().required()
  }).options({
      stripUnknown: true
  });
  return Joi.validate(req.body, schema, function (err, value) {
      if (err) {
          return res.status(422).json(err.details[0].message);
      } else {
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
            } else if (data[1].count > 0 && data[1].paymentVerified) {
              return res.status(404).json(`Already Partcicipated`);
            } else if (data[1].count > 0 && !data[1].paymentVerified) {
              return res.status(404).json(`Already Partcicipated`);
            } else {
              var payment = new Insta.PaymentData();
              payment.purpose = `Tournament User: ${req.user.email}, Match: ${value.matchId}`;            // REQUIRED
              payment.amount = data[2].entryFee;                  // REQUIRED
              payment.phone = req.user.contact;                  // REQUIRED
              payment.buyer_name = req.user.firstName + ' ' + req.user.lastName;                  // REQUIRED
              // payment.redirect_url = 'https://pubg-mobile-api.herokuapp.com/varifypayment?userId=' + req.user.id + '&matchId=' + value.matchId;                  // REQUIRED
              // payment.send_email = 9;                  // REQUIRED
              payment.webhook = `https://pubg-mobile-api.herokuapp.com/matches/verifypayment/${req.user.id}/${value.matchId}`;                 // REQUIRED
              // payment.send_sms = 9;                  // REQUIRED
              payment.email = req.user.email;                  // REQUIRED
              payment.allow_repeated_payments = false;                  // REQUIRED
              // payment.setRedirectUrl(REDIRECT_URL);
              Insta.isSandboxMode(true);
              Insta.createPayment(payment, function(error, response) {
                if (error) {
                  // some error
                  console.log(error);
                } else {
                  response = JSON.parse(response);
                  console.log(response.payment_request.longurl);
                  
                  return db.MatchUsers.create({
                    matchId : value.matchId,
                    userId : req.user.id,
                    payment : Number(response.payment_request.amount),
                    paymentRequestId : response.payment_request.id,
                    createdBy : req.user.email,
                    updatedBy : req.user.email
                  }).then((result) => {
                    return res.status(200).json(response.payment_request.longurl);
                  }).catch(err => {
                    console.log(err);
                    return res.status(500).json(err);
                  })
                  // Payment redirection link at response.payment_request.longurl
                }
              });
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
