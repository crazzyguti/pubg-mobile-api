const sendGrid = require('sendgrid').mail;
// const sg = require('sendgrid')(process.env.SEND_GRID_API_KEY);
var verifier = require('email-verify');
      var infoCodes = verifier.infoCodes;
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const db = require('../../storage/main/models');
const config = require('../../api/config/' + process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  bcrypt = require('bcrypt-nodejs');
} else {
  bcrypt = require('bcrypt');
  const saltRounds = 10;
  salt = bcrypt.genSaltSync(saltRounds);
}
      
const sendVerificationEmail = (to, token) => {
    const hostUrl = process.env.HOST_URL;
    // const request = sg.emptyRequest({
    //   method: "POST",
    //   path: "/v3/mail/send",
    //   body: {
    //     personalizations: [
    //       {
    //         to: [
    //           {
    //             email: to
    //           }
    //         ],
    //         subject:"Verify Your Email"
    //       }
    //     ],
    //     from: {
    //       email: "no-reply@example.com"
    //     },
    //     content: [
    //         {
    //             type: 'text/html',
    //             value: `Click <a href="${hostUrl}/verification?token=${token}&email=${to}">here</a> to verify your email.
    //             <p>Please ignore this email if you have not registered to Ads App</p>`
    //         }
    //     ]
    //   }
    // });
    var send = require('gmail-send')({
      //var send = require('../index.js')({
      user: process.env.ADMIN_EMAIL,
      // user: credentials.user,                  // Your GMail account used to send emails
      pass: process.env.ADMIN_EMAIL_KEY,
      // pass: credentials.pass,                  // Application-specific password
      to: to,
      // to:   credentials.user,                  // Send to yourself
                                                // you also may set array of recipients:
                                                // [ 'user1@gmail.com', 'user2@gmail.com' ]
      from: 'pubg-mobile-event@pubgtournaments.in',            // from: by default equals to user
      // replyTo: credentials.user,            // replyTo: by default undefined
      // bcc: 'some-user@mail.com',            // almost any option of `nodemailer` will be passed to it
      subject: 'test subject',
      // text:    'gmail-send example 1',         // Plain text
      html: `Click <a href="${hostUrl}/verification?token=${token}&email=${to}">here</a> to verify your email.
      <p>Please ignore this email if you have not registered to Ads App</p>`            // HTML
     });

    return new Promise(function (resolve, reject) {
      return verifier.verify( to, function( err, info ){
        if ( err ) {
          console.log(err);
          return reject(err);
        }
        else if (info.success) {
          // sg.API(request, function (error, response) {
          //   if (error) {
          //     console.log(error);
          //   }
          // });

          send({ // Overriding default parameters
            subject: 'Verify Your Email',         // Override value set as default
          }, function (err, res) {
            console.log('* [example 1.1] send() callback returned: err:', err, '; res:', res);
          });

          console.log( "Success (T/F): " + info.success );
          console.log( "Info: " + info.info );
          return resolve();
        } else {
          return reject(info.info);
        }
      });
    });
  };
  
  const changePasswordEmail = (req, res) => {
    const schema = Joi.object().keys({
      email: Joi.string().email({ minDomainAtoms: 2 }).required(),
      password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
    }).options({
      stripUnknown: true
    });

    return Joi.validate(req.body, schema, function (err, params) {
      if (err) {
        return res.status(422).json(err.details[0].message);
      } else {
        const hostUrl = process.env.HOST_URL;
        const token = jwt.sign(
          { email: params.email },
          config.keys.secret,
          { expiresIn:  "1h" }
        );
        const send = require('gmail-send')({
          //var send = require('../index.js')({
          user: process.env.ADMIN_EMAIL,
          // user: credentials.user,                  // Your GMail account used to send emails
          pass: process.env.ADMIN_EMAIL_KEY,
          // pass: credentials.pass,                  // Application-specific password
          to: params.email,
          // to:   credentials.user,                  // Send to yourself
                                                    // you also may set array of recipients:
                                                    // [ 'user1@gmail.com', 'user2@gmail.com' ]
          from:    'pubg-mobile-event@pubgtournaments.in',            // from: by default equals to user
          // replyTo: credentials.user,            // replyTo: by default undefined
          // bcc: 'some-user@mail.com',            // almost any option of `nodemailer` will be passed to it
          subject: 'test subject',
          // text:    'gmail-send example 1',         // Plain text
          html: `Click <a href="${hostUrl}/changepassword?token=${token}&email=${params.email}&password=${params.password}">here</a> to change your password.
          <p>Please ignore this email if you have not requseted for password change</p>`            // HTML
        });

        return verifier.verify(params.email, function( err, info ) {
          if ( err ) {
            console.log(err);
            return res.status(500).json(err);
          }
          else if (info.success) {
            return db.Users.findOne({
              where: {
                email: params.email
              }
            }).then(function(user) {
              if(!user) {
                return res.status(404).json('Invalid User!');
              } else {
                if (!user.isVerified) {
                  return res.status(404).json('Please verify your Email!');
                }
                send({ // Overriding default parameters
                  subject: 'Verify Your Email',         // Override value set as default
                }, function (err, res) {
                  console.log('* [example 1.1] send() callback returned: err:', err, '; res:', res);
                });
    
                console.log( "Success (T/F): " + info.success );
                console.log( "Info: " + info.info );
                return res.status(200).json('Mail sent to your registered email please follow the link in mail to change your password.');
              }
            }).catch(function(error) {
              console.log(error);
              return res.status(500).json(error);
            });
          } else {
            return res.status(500).json(info.info);
          }
        });
      }
    });
  };

  const changePassword = (req, res) => {
    const schema = Joi.object().keys({
      token: Joi.string().required(),
      password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
    }).options({
      stripUnknown: true
    });

    return Joi.validate(req.query, schema, function (err, params) {
      if (err) {
        return res.status(422).json(err.details[0].message);
      } else {
        const decoded = jwt.verify(params.token, config.keys.secret);
        let password;
        if (process.env.NODE_ENV === 'development') {
          password = bcrypt.hashSync(params.password);
        } else {
          password = bcrypt.hashSync(params.password, salt);
        }
        return db.Users.update({
          password: password
        }, {
          where: {
            email: decoded.email
          }
        }).then(() => {
          res.status(200).send('Your password has been reset successfully');
        }).catch((err) => {
          console.log(err);
          res.status(500).json(err);
        });
      }
    });
  };

  module.exports = {
    sendVerificationEmail: sendVerificationEmail,
    changePasswordEmail: changePasswordEmail,
    changePassword: changePassword
  };