const db = require('../../storage/main/models/index');
const Joi = require('joi');
const sequelize = require('sequelize');
const Insta = require('instamojo-nodejs');
// const API_KEY = process.env.INSTAMOJO_API_KEY_PUBG || 'test_f6dcb6d040f7cdf5fc7884233e8';
// const AUTH_KEY = process.env.INSTAMOJO_AUTH_KEY_PUBG || 'test_f9531e70b8123199e8cc5467d38';
//
// Insta.setKeys(API_KEY, AUTH_KEY);

const getPlayerProfile = (req, res) => {
  if (!req.user) {
    return res.status(404).json(`User not found`);
  } else {
    return db.Users.findOne({
      where : {
        id : req.user.id
      },
      attributes: ['firstName', 'lastName', 'email', 'credit'],
      raw: true
  }).then(users => {
      if (!users) {
        return res.status(401).json(`User not found`);
      } else {
        return db.MatchUsers.findAll({
          where : {
            userId : req.user.id,
            attendance : true
          },
          attributes : [[sequelize.fn('COUNT', sequelize.col('matchId')), 'totalMatchesPlayed'],
            [sequelize.fn('SUM', sequelize.col('kills')), 'totalKills'],
            [sequelize.fn('max', sequelize.col('kills')), 'maxKill'],
            [sequelize.fn('min', sequelize.col('kills')), 'minKill'],
            [sequelize.fn('AVG', sequelize.col('kills')), 'avgKill'],
            [sequelize.fn('max', sequelize.col('rank')), 'maxRank'],
            [sequelize.fn('min', sequelize.col('rank')), 'minRank'],
            [sequelize.fn('AVG', sequelize.col('rank')), 'avgRank'],
            [sequelize.fn('SUM', sequelize.col('payment')), 'totalPayment']],
            raw: true
          }).then((stats) => {
          if (!stats) {
            return res.status(200).json(users);
          } else {
            users.stats = stats;
            return res.status(200).json(users);
          }
        }).catch((err) => {
          console.log('err**', err);
          return res.status(404).json(`stats not found`);
        })
      }
    }).catch(err => {
      console.log('err**', err);
      return res.status(404).json(`User not found`);
    });
  }
}
module.exports = {
  getPlayerProfile: getPlayerProfile
};
