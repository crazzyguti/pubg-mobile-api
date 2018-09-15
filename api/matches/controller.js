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
        return db.Users.findOne({
          where: {
            id : value.userId
          },
          raw: true
        }).then(user => {
          if (!user) {
            return res.status(404).json(`User not found`);
          } else if (!user.isVerified) {
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
                userId : value.userId
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
                return db.MatchUsers.create({
                  matchId : value.matchId,
                  userId : value.userId,
                  payment : data[2].entryFee,
                  createdBy : 'test@test.com',
                  updatedBy : 'test@test.com'
                }).then((result) => {
                  return res.status(200).json(`User added succesfully`);
                }).catch(err => {
                  console.log(err);
                  return res.status(500).json('Error while creating user in a match');
                })
              }
            }).catch(err => {
              console.log(err);
              return res.status(500).json('Error in promises');
            })
          }

        }).catch(reason => {
          return res.status(500).json('Error while fetching user info');
        });
      }
  });
}

module.exports = {
  getMatches: getMatches,
  verifypayment: verifypayment,
  deletePlayer: deletePlayer,
  createMatchEntry : createMatchEntry
};
