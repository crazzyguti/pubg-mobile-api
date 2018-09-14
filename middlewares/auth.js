'use strict';

const jwt = require('jsonwebtoken');
const config = require('../api/config/' + process.env.NODE_ENV);
let bcrypt, salt;

if (process.env.NODE_ENV === 'development') {
    bcrypt = require('bcrypt-nodejs');
} else {
    bcrypt = require('bcrypt');
    const saltRounds = 10;
    salt = bcrypt.genSaltSync(saltRounds);
}
const crypto = require('crypto-random-string');
const db = require('../storage/main/models');
const sendVerificationEmail = require('../api/sendverificationmail/controller');
const Joi = require('joi');
// The authentication controller.
var AuthController = {};

// Register a user.
AuthController.signUp = function(req, res) {
    const schema = Joi.object().keys({
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required()
    }).options({
        stripUnknown: true
    });

    return Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return res.status(422).json(err.details[0].message);
        } else {
            const newUser = {
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                createdBy: req.body.email,
                updatedBy: req.body.email,
            };
            if (process.env.NODE_ENV === 'development') {
                newUser.password = bcrypt.hashSync(req.body.password);
            } else {
                newUser.password = bcrypt.hashSync(req.body.password, salt);
            }
            // Attempt to save the user
            return db.sequelize.transaction().then((t) => {
                return db.Users.findOrCreate({
                    where: { email:  req.body.email },
                    defaults: newUser,
                    transaction: t
                }).spread((user, created) => {
                    // if user email already exists
                    if(!created) {
                        return res.status(409).json('User with email address already exists');
                    } else {
                        return db.VerificationToken.create({
                            userId: user.id,
                            token: crypto(16)
                        }, { transaction: t }).then((result) => {
                            return sendVerificationEmail(req.body.email, result.token).then(() => {
                                return t.commit().then(() => {
                                    return res.status(200).json({
                                        success: true,
                                        message: `${req.body.email} account created successfully`,
                                        email: user.email
                                    });
                                });
                            }).catch((err) => {
                                return t.rollback().then(() => {
                                    return res.status(500).json(err);
                                });
                            });
                        }).catch((error) => {
                            return t.rollback().then(() => {
                                return res.status(500).json(error);
                            });
                        });
                    }
                }).catch((error1) => {
                    return t.rollback().then(() => {
                        return res.status(500).json(error1);
                    });
                });
            });
        }
    });  // err === null -> valid
}

// Compares two passwords.
function comparePasswords(password, userPassword, callback) {
    bcrypt.compare(password, userPassword, function(error, isMatch) {
        if(error) {
            return callback(error);
        }
        return callback(null, isMatch);
    });
}

// Authenticate a user.
AuthController.authenticateUser = function(req, res) {
    const schema = Joi.object().keys({
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
    }).options({
        stripUnknown: true
    });

    return Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return res.status(422).json(err.details[0].message);
        } else {
            const email = req.body.email,
                password = req.body.password,
                potentialUser = { where: { email: email } };

            return db.Users.findOne(potentialUser).then(function(user) {
                if(!user) {
                    return res.status(404).json('Authentication failed!');
                } else {
                    if (!user.isVerified) {
                        return res.status(404).json('Please verify your Email!');
                    }
                    comparePasswords(password, user.password, function(error, isMatch) {
                        if(isMatch && !error) {
                            var token = jwt.sign(
                                { email: user.email },
                                config.keys.secret
                            );

                            return res.json({
                                success: true,
                                token: 'JWT ' + token,
                                role: user.role
                            });
                        } else {
                            return res.status(404).json('Login failed!');
                        }
                    });
                }
            }).catch(function(error) {
                return res.status(500).json('There was an error!');
            });
        }
    });
}

module.exports = AuthController;