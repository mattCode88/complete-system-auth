const UserCollection = require('../model/Auth');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const utils = require('../utils/utils');
const { MyMail } = require('../classes/MyMail')

// controller per la funzione di registrazione utente
exports.create = async (req, res) => {

    // se lo username ha meno di tre lettere mando errore
    if (req.body.username.length < 3) {
        req.flash('register-message', `Lo username deve avere almeno 3 lettere`);
        res.redirect('/auth/register');
        return;
    }

    // se la mail non è valida mando errore
    if (utils.validateMail(req.body.email)) {
        req.flash('register-message', `Inserisci mail valida!`);
        res.redirect('/auth/register');
        return;
    }

    // se la password non è valida mando errore
    if (utils.validatePassword(req.body.password)) {
        req.flash('register-message', `Password non valida.`);
        res.redirect('/auth/register');
        return;
    }

    // cripto la password
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    // genero un token casuale
    const token = crypto.randomBytes(20).toString('hex');

    // istanzio un nuovo oggetto MyMail definito in classes
    const newMail = new MyMail(
        req.body.email,
        'Verifica account',
        'Clicca sul seguente link per verificare il tuo account: http://' + req.headers.host + '/api/verify/' + token
    )

    // invio la mail
    newMail.emailSend((err, info) => {

        // se ci sono errori nell' ivio della mail, lo notifico e rimando l' utente alla register
        if (err) {
            req.flash('register-message', `Errore durante l' invio della mail di verifica.`);
            return res.redirect('/auth/register');
        } else {

            // altrimenti creo un nuovo utente
            const user = new UserCollection({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                verificationToken: token
            });

            // salvo l' utente nel db
            user
                .save(user)
                .then(data => {

                    // notifico l' invio della mail di verifica e rimando alla login
                    req.flash('login-message', `Ti abbiamo inviato un link di verifica, controlla la tua email.`);
                    return res.redirect('/auth/login')
                })
                .catch(err => {

                    // in caso di errori nel salvataggio ritorno alla register con i dovuti errori
                    if (err.keyPattern.username === 1) {
                        req.flash('register-message', `Username: ${req.body.username} non disponibile!`);
                        res.redirect('/auth/register');
                    }
                    if (err.keyPattern.email === 1) {
                        req.flash('register-message', `Email: ${req.body.email} già registrata!`);
                        res.redirect('/auth/register');
                    }
                });
        }
    })

};

// controller per la funzione di verifica account
exports.verifyAccount = async (req, res) => {

    // recupero il token inviato
    const token = req.params.token;

    // cerco nel database un utente al quale è associato il token
    const verifyToken = await UserCollection.findOne({ verificationToken: token });

    // se non trovo l' utente mando errore e reindirizzo al login
    if (verifyToken === null) {

        req.flash('login-message', 'Token di verifica non valido o scaduto.');
        return res.redirect('/auth/login');

    } else {

        // altrimenti aggiorno l' utente con verified: true e mando un messaggio di conferma
        UserCollection.findOneAndUpdate({ verificationToken: token }, { verified: true }, { new: true }, (err, user) => {
            req.flash('login-message', `Utente verificato, ora puoi accedere all' app.`);
            return res.redirect('/auth/login');
        })

    }

}

// controller per la funzione di password dimenticata
exports.forgotPassword = async (req, res) => {

    // cerco nel db l' utente associato all' email richiesta
    const searchedUser = await UserCollection.findOne({ email: req.body.email });

    // se non trovo l' utente mando errore e reindirizzo al login
    if (searchedUser === null) {
        req.flash('recovery-message', `Email non trovata.`);
        return res.redirect('/auth/recovery-password');
    }

    // se l' utente è registrato con google comunico l' impossibilità di cambiare la password
    if (searchedUser.googleID) {
        req.flash('recovery-message', `Impossibile cambiare la password, utente registrato tramite google.`);
        return res.redirect('/auth/recovery-password');
    }

    // genero un token random e definisco il tempo di validità del token(ora + un ora)
    const token = crypto.randomUUID();
    const resetPasswordExpires = Date.now() + 3600000;

    // aggiorno l' utente richiedente nel db con i token generati
    UserCollection.findOneAndUpdate({ email: req.body.email }, { resetToken: token, resetTokenExpiration: resetPasswordExpires }, { useFindAndModify: false })
        .then(data => {

            // in caso di problemi notifico l' errore e rimando alla pagina di recovery
            if (!data) {
                req.flash('recovery-message', `Utente non trovato.`);
                return res.redirect('/auth/recovery-password');
            } else {

                // altrimenti istanzio una nuova mail
                const newMail = new MyMail(
                    req.body.email,
                    'Modifica Password',
                    'Clicca sul seguente link per reimpostare la password: http://' + req.headers.host + '/auth/reset-password/' + token
                )

                // invo la mail
                newMail.emailSend((err, info) => {
                    if (err) {

                        // in caso di problemi notifico l' errore e rimando alla pagina di recovery
                        req.flash('recovery-message', `Errore durante l' invio della mail di verifica.`);
                        return res.redirect('/auth/recovery-password');
                    } else {

                        // altrimenti rimando alla pagina di recovery notificando l' avvenuto invio della mail
                        req.flash('recovery-message', `Ti abbiamo inviato un link per il reset della password. Controlla la tua email.`);
                        return res.redirect('/auth/recovery-password');
                    }
                })
            }
        }).catch(err => {

            // in caso di problemi notifico l' errore e rimando alla pagina di recovery
            req.flash('recovery-message', `Errore nell' aggiornamento delle informazioni.`);
            return res.redirect('/auth/recovery-password');
        });


}

// controller per la funzione di reset della password
exports.resetPassword = async (req, res) => {

    // verifico che le password inviate siano uguali e valide, se non lo sono, lo notifico e rimando alla pagina di reset
    if (
        req.body.passwordReset1 !== req.body.passwordReset2 ||
        utils.validatePassword(req.body.passwordReset1) ||
        utils.validatePassword(req.body.passwordReset2)
    ) {
        req.flash('reset-message', `Le password inserite non sono corrette.`);
        return res.redirect(`/auth/reset-password/${req.body.token}`);
    }

    // se le password sono valide aggiorno l' utente nel db previa verifica del token generato da forgotPassword e che la 
    // scadenza del token sia valida
    UserCollection.findOneAndUpdate(
        { resetToken: req.body.token, resetTokenExpiration: { $gt: Date.now() } },
        {
            resetToken: '',
            resetTokenExpiration: '',
            password: bcrypt.hashSync(req.body.passwordReset1, 10)
        },
        { useFindAndModify: false }).then(data => {

            // se ci sono errori lo notifico e rimando alla pagina di recovery
            if (!data) {
                req.flash('recovery-message', `Token errato o scaduto`);
                return res.redirect('/auth/recovery-password');
            } else {

                // altrimenti istanzio una nuova mail
                const newMail = new MyMail(
                    data.email,
                    'Conferma modifica password',
                    'La password del tuo account è stata modificata correttamente.'
                )

                // invio la mail
                newMail.emailSend((err, info) => {

                    // se ci sono errori lo notifico e rimando alla pagina di reset
                    if (err) {
                        req.flash('reset-message', `Errore durante l' invio della mail di verifica.`);
                        return res.redirect(`/auth/reset-password/${req.body.token}`);
                    } else {

                        // altrimenti notifico l' invio della mail di conferma e riamndo alla pagina di login
                        req.flash('login-message', `La password è stata modificata, ti abbiamo inviato una mail di conferma.`);
                        return res.redirect('/auth/login');
                    }
                })

            }
        }).catch(err => {

            // in caso di errori nell' aggiornamento lo notifico e rimando alla pagina di reset
            req.flash('reset-message', `Errore nell' aggiornamento delle informazioni.`);
            return res.redirect(`/auth/reset-password/${req.body.token}`);
        });

}

//controller per la funzione che verifica l' esistenza dello username inserito nel db(richiesta in evento input _auth-form.js)
exports.verifyUsername = async (req, res) => {
    const duplicateUser = await UserCollection.findOne({ username: req.query.username })
    if (duplicateUser !== null) {
        return res.send(duplicateUser)
    }
    return res.send({ message: 'user not fund' })
}

//controller per la funzione che verifica l' esistenza dello username inserito nel db(richiesta in evento input _auth-form.js)
exports.verifyEmail = async (req, res) => {
    const duplicateEmail = await UserCollection.findOne({ email: req.query.email })
    if (duplicateEmail !== null) {
        return res.send(duplicateEmail)
    }
    return res.send({ message: 'email not fund' })
}