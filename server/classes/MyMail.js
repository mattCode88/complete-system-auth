const nodemailer = require('nodemailer');

class MyMail {

    // al costruttore passo l' indirizzo a cui inviare la mail, il soggetto e il testo della stessa 
    constructor(emailToSend, subject, text) {

        // definisco la proprietà transporter, chiamata su nodemailer.createTransport inserendo il servizio mail da utilizzare
        // e le mie credenziali salvate in .env
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MYEMAIL,
                pass: process.env.MYEMAILPASSWORD
            }
        });

        // definisco la proprietà message che definisce il messaggio
        this.message = {
            from: process.env.MYEMAIL,
            to: emailToSend,
            subject: subject,
            text
        };
    }

    // definisco il metodo emailSend, costruito sul metodo senMail di nodemailer, che prende il messaggio e una callback
    emailSend = (callback) => {
        this.transporter.sendMail(this.message, callback)
    }

}

module.exports = {
    MyMail
}