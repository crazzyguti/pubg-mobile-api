const Umzug = require('umzug');
const db = require('./main/models');
const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
        sequelize: db.sequelize,
    },

    // see: https://github.com/sequelize/umzug/issues/17
    migrations: {
        params: [
            db.sequelize.getQueryInterface(), // queryInterface
            db.sequelize.constructor, // DataTypes
            function() {
                throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.');
            }
        ],
        path: './storage/main/migrations',
        pattern: /\.js$/
    },

    logging: function() {
        console.log.apply(null, arguments);
    },
});

const migrations = {
    runMigration: function() {
        return umzug.up().then(function (migrations) {
            // "migrations" will be an Array with the names of the
            // executed migrations.
            console.log(migrations);
        }).catch((error) => {
            console.log(error);
        });
    }
};

module.exports = migrations;
