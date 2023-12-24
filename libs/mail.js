var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rp.virtuallifepl@gmail.com',
        pass: 'prgiidfnoqlspacq'
    }
});

module.exports = {
    sendMail: function(mail, subject, text) {
        let mailOptions = {
            from: 'Andra - System Nadgodzin',
            to: mail,
            subject: subject,
            text: text
        }

        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log('Email sent: ' + data.response);
            }
        });
    }
}

