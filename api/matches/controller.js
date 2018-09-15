const db = require('../../storage/main/models/index');

const getMatches = (req, res) => {
  return db.Matches.findAll({
    include: [{
      model: db.Users
    }]
  }).then(matches => {
    return res.status(200).json(matches);
  }).catch(reason => {
    return res.status(404).json(`Matches not found`);
  });
}

module.exports = {
  getMatches: getMatches
};