const db = require('../../storage/main/models/index');
const Joi = require('joi');
const payumoney = require('payumoney-node');
const MERCHANT_KEY = process.env.PAYUMONEY_MERCHANT_KEY_PUBG || 'dK0uoDM5';
const MERCHANT_SALT = process.env.PAYUMONEY_MERCHANT_SALT_PUBG || 'Gnkh3uQ976';
const AUTHORIZATION_HEADER = process.env.PAYUMONEY_AUTHORIZATION_HEADER_PUBG || 'z7EEmRmAE5y/jLCfO2AJIWIsAdu7XMLXE9VuHdBBJqY=';

payumoney.setKeys(MERCHANT_KEY, MERCHANT_SALT, AUTHORIZATION_HEADER);
payumoney.isProdMode(true);

const getMatches = (req, res) => {
  return db.Matches.findAll({
    include: [{
      model: db.Users,
      attributes: ['id', 'email', 'contact'],
      where: {
        isActive: true,
        isVerified: true
      }
    }, {
      model: db.MatchUsers,
      where: {
        userId: req.user.id,
        '': db.sequelize.literal('"MatchUsers"."matchId" = "Matches"."id"')
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

const paymentSuccess = (req, res) => {
  const schema = Joi.object().keys({
    paymentId: Joi.string().required(),
    customerEmail: Joi.string().required(),
    merchantTransactionId: Joi.string().required()
  }).options({
    stripUnknown: true
  });
  return Joi.validate(req.body, schema, function (err, params) {
    if (err) {
      console.log(err);
      return res.status(422).json(err.details[0].message);
    } else {
      return db.MatchUsers.update({
        paymentVerified: true,
        paymentId: params.paymentId,
        createdBy: params.customerEmail,
        updatedBy: params.customerEmail
      }, {
        where: {
          paymentRequestId: params.merchantTransactionId
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

const getMatchUsers = (req, res) => {
  const schema = Joi.object().keys({
    id: Joi.number().required()
  }).options({
    stripUnknown: true
  });
  return Joi.validate(req.params, schema, function (err, params) {
    if (err) {
      console.log(err);
      return res.status(422).json(err.details[0].message);
    } else {
      return db.Matches.findOne({
        where: {
          id: params.id
        },
        attributes : ['title', 'description', 'rules', 'time', 'entryFee', 'roomId', 'roomPassword', 'createdAt'],
        include : [{
          model : db.MatchUsers,
          attributes : ['userId'],
          where : {
            paymentVerified : true
          },
          required : false,
          include : [{
            model : db.Users,
            attributes : ['id', 'email', 'contact', 'payTM']
          }]
        }]
      }).then(data => {
        if (!data) {
          return res.status(401).json(`No Match found`);
        } else {
          return res.status(200).json(data);
        }
      }).catch(reason => {
        console.log(reason);
        return res.status(404).json(`Error while getting match Info`);
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
          promiseArray.push(db.MatchUsers.findOne({
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
              console.log(data[1]);
            if (data[0] >= 100) {
              return res.status(404).send('Oops, the tournament is full, try another.');
            } else if (data[1] && data[1].paymentVerified) {
              return res.status(404).send('Already Partcicipated');
            } else {
              const paymentData = {
                productinfo: `Tournament User: ${req.user.email}, Match: ${value.matchId}`,
                txnid: req.user.id + '-' + value.matchId,
                amount: data[2].entryFee,
                email: req.user.email,
                phone: req.user.contact,
                lastname: req.user.lastName,
                firstname: req.user.firstName,
                sendEmail: true,
                modes: 'all',
                surl: 'https://payumoney.com/success/' + req.user.id + '-' + value.matchId, //"http://localhost:3000/payu/success"
                furl: 'https://payumoney.com/failure/' + req.user.id + '-' + value.matchId //"http://localhost:3000/payu/fail"
              };

              payumoney.makePayment(paymentData, function(error, response) {
                if (error) {
                  // Some error
                } else {
                  // Payment redirection link
                  console.log('/////////////////////////////////');
                  console.log(response);
                  return db.MatchUsers.findOne({
                    where: {
                      matchId : value.matchId,
                      userId : req.user.id
                    }
                  }).then(function(obj) {
                    if (obj) { // update
                      return obj.update({
                        payment : Number(data[2].entryFee),
                        paymentVerified: false,
                        paymentRequestId : req.user.id + '-' + value.matchId,
                        paymentId: null,
                        createdBy : req.user.email,
                        updatedBy : req.user.email
                      }).then(() => {
                        return res.status(200).json(response);
                      }).catch(err => {
                        console.log(err);
                        return res.status(500).json(err);
                      });
                    } else { // insert
                      return db.MatchUsers.create({
                        matchId : value.matchId,
                        userId : req.user.id,
                        payment : Number(data[2].entryFee),
                        paymentVerified: false,
                        paymentRequestId : req.user.id + '-' + value.matchId,
                        paymentId: null,
                        createdBy : req.user.email,
                        updatedBy : req.user.email
                      }).then(() => {
                        return res.status(200).json(response);
                      }).catch(err => {
                        console.log(err);
                        return res.status(500).json(err);
                      });
                    }
                  });
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

const getMatchInfo = (req, res) => {
  const schema = Joi.object().keys({
    id: Joi.number().required()
  }).options({
    stripUnknown: true
  });
  return Joi.validate(req.params, schema, function (err, params) {
    if (err) {
      console.log(err);
      return res.status(422).json(err.details[0].message);
    } else {
      return db.Matches.findOne({
        where: {
          id: params.id
        },
        attributes : ['title', 'description', 'rules', 'time', 'entryFee', 'roomId', 'roomPassword', 'createdAt'],
        include : [{
          model : db.MatchUsers,
          attributes : ['userId'],
          where : {
            paymentVerified : true
          },
          required : false,
          include : [{
            model : db.Users,
            attributes : ['id', 'email', 'contact', 'payTM']
          }]
        }]
      }).then(data => {
        if (!data) {
          return res.status(401).json(`No Match found`);
        } else {
          return res.status(200).json(data);
        }
      }).catch(reason => {
        console.log(reason);
        return res.status(404).json(`Error while getting match Info`);
      });
    }
  });
}

module.exports = {
  getMatches: getMatches,
  paymentSuccess: paymentSuccess,
  deletePlayer: deletePlayer,
  createMatchEntry : createMatchEntry,
  getMatchInfo : getMatchInfo
};
