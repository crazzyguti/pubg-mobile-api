const sendGrid = require('sendgrid').mail;
// const sg = require('sendgrid')(process.env.SEND_GRID_API_KEY);
var verifier = require('email-verify');
      var infoCodes = verifier.infoCodes;
      
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
      from:    'pubg-mobile-event@pubgtournaments.in',            // from: by default equals to user
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

  module.exports = sendVerificationEmail;