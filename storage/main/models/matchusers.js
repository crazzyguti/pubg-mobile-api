'use strict';
module.exports = (sequelize, DataTypes) => {
  var MatchUsers = sequelize.define('MatchUsers', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: { model: 'Users', key: 'id' }
    },
    matchId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: { model: 'Matches', key: 'id' }
    },
    attendance: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    kills: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rank: {
      type: DataTypes.INTEGER
    },
    payment: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    paymentVerified: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    paymentRequestId: {
      allowNull: false,
      type: DataTypes.STRING
    },
    paymentId: {
      type: DataTypes.STRING
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    createdBy: {
      allowNull: false,
      type: DataTypes.STRING
    },
    updatedBy: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {
    timestamps: true
  });
  MatchUsers.associate = function(models) {
    // associations can be defined here
    MatchUsers.belongsTo(models.Users, {foreignKey: 'userId', targetKey: 'id'});
    MatchUsers.belongsTo(models.Matches, {foreignKey: 'matchId', targetKey: 'id'});
  };
  return MatchUsers;
};