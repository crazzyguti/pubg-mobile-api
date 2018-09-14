'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('MatchUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' }
      },
      matchId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Matches', key: 'id' }
      },
      attendance: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      kills: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      rank: {
        type: Sequelize.INTEGER
      },
      payment: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      paymentVerified: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      createdBy: {
        allowNull: false,
        type: Sequelize.STRING
      },
      updatedBy: {
        allowNull: false,
        type: Sequelize.STRING
      }
    }).then(() => {
      queryInterface.addConstraint('MatchUsers', ['userId', 'matchId'], {
        type: 'unique',
        name: 'MatchUsers_unique_user_match'
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('MatchUsers');
  }
};