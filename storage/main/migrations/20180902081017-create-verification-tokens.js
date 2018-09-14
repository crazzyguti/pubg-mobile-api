module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('VerificationTokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onUpdate: "cascade",
        onDelete: "cascade",
        references: { model: "Users", key: "id" }
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => {
      console.log('created VerificationToken table');
      // return queryInterface.sequelize.query(`
      //   SELECT cron.schedule('0 */1 * * *', $$DELETE FROM verification_tokens WHERE createdAt < DATE_SUB(NOW(), INTERVAL 1 DAY);$$);
      // `)
    }).then(() => { console.log('expireToken event created') });
  },
  down: function(queryInterface) {
    return queryInterface.dropTable('VerificationTokens')
	  .then(() => {
	    console.log('VericationTokens table dropped')
	    return queryInterface.sequelize.query(`DROP EVENT IF EXISTS  expireToken`);
    }).then(() => { console.log('expireToken event dropped') })
  }
};