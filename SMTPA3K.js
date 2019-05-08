const nodemailer = require('nodemailer');
var logger = require('../log');

// Fork of Official SMTP Plugin
// Add Address extraction

function run(trigger, scope, data, config, callback) {
    var sConfA3K = data.pluginconf.SMTPA3K;

    if ( sConfA3K && sConfA3K.enable) {
        let smtpConfig = {
            host: config.server,
            port: config.port,
            secure: config.secure, // upgrade later with STARTTLS
            auth: {
              user: config.username,
              pass: config.password
            },
            tls: {
              // do not fail on invalid certs
              rejectUnauthorized: false
            }
        };
        let transporter = nodemailer.createTransport(smtpConfig,[])

        if(sConfA3K.extractAddr && typeof sConfA3K.regex != 'undefined'){
          String.prototype.replaceAll = function(search, replacement) {
            var target = this;
            return target.split(search).join(replacement);
          };
          var addr_grp = data.message.match(new RegExp(sConfA3K.regex))
          if(Array.isArray(addr_grp) && addr_grp.length){
            addr_clean = addr_grp[1]
            addr = addr_grp[1].replaceAll(',', '').replaceAll(' ', '+')
            logger.main.info('SMTP:' + 'Address is: %s', addr);
            var addr_url = 'https://maps.google.com/maps?q='+addr
          }
        }

        let mailOptions = {
          from: `"${config.mailFromName}" <${config.mailFrom}>`, // sender address
          to: sConfA3K.mailto, // list of receivers
          subject: data.agency+' - '+data.alias, // Subject line
          text: data.message, // plain text body
          html: '<b>'+data.message+'</b>' // html body
        };

        if(typeof addr_url != 'undefined'){
          mailOptions.html += '<br /><a href="'+addr_url+'" style="font-size:1.5em;">'+addr_clean+'</a>'
        }

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            logger.main.error('SMTP:' + error);
            callback();
          } else {
            logger.main.info('SMTP:' + 'Message sent: %s', info.messageId);
            callback();
          }
        });
    } else {
        callback();
    }
}

module.exports = {
    run: run
}