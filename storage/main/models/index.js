'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(__filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require('../config/config')[env];
var db        = {};

if (config.url) {
  var sequelize = new Sequelize('postgres://eccaqyxglguigu:14ba4b4540f0c518a10cf9d82914ba964a0fe327f2bb3e295b90935b13277bc7@ec2-54-247-123-231.eu-west-1.compute.amazonaws.com:5432/d1a54r924nn2b6', {
  dialectOptions: {
    ssl: true
  },
});
} else if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
