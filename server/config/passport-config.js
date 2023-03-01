const { ObjectID } = require('mongodb');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const UserCollection = require('../model/Auth');

// setto l' uso della strategia google passandogli i parametri richiesti e la callback
passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/google-auth-redirect',
        responseType: 'code',
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, tokenID, done) => {

        // controllo che dopo il login google, il richiedente non sia già registrato nel db
        const isUserDuplicated = await UserCollection.findOne({ email: tokenID.emails[0].value });

        //se non è registrato lo salvo e lo serializzo
        if (!isUserDuplicated) {
            const user = new UserCollection({
                googleID: tokenID.id,
                username: tokenID.emails[0].value.split('@')[0],
                email: tokenID.emails[0].value,
                password: tokenID.id,
                verified: true
            })
            user
                .save(user)
                .then(data => { return done(null, data) }).catch(err => console.log(err))
        } else if (isUserDuplicated && !isUserDuplicated.googleID) {

            // se è salvato senza un id google blocco il processo e lo notifico
            return done(null, false, req.flash('login-message', 'Indirizzo email registrato tramite username e password.'));
        } else {

            // altrimenti serializzo l' utente
            return done(null, isUserDuplicated)
        }

    }))

//setto l' utilizzo della strategia passport-local
passport.use('local-login', new LocalStrategy({ passReqToCallback: true }, async (req, username, password, done) => {

    //ricerco utente per username
    const user = await UserCollection.findOne({ username: username });

    //se non lo trovo ritorno un messaggio flash di errore
    if (!user) {
        return done(null, false, { message: req.flash('login-message', 'Username non corretto!') });
    }

    // se all' utente è associado un id google blocco il processo e la serializzazione dell' utente
    if (user.googleID) {
        return done(null, false, { message: req.flash('login-message', 'Utente registrato con google.') });
    }

    //comparo password inserita nel form con quella hashata salvata nel DB
    const bool = bcrypt.compareSync(password, user.password);

    //se le password non corrispondono ritorno messaggio flash di errore
    if (!bool) {
        return done(null, false, { message: req.flash('login-message', 'Password non corretta!') });
    }

    //se l' utente non ha ancora verificato la registrazione blocco il processo e lo informo
    if (!user.verified) {
        return done(null, false, { message: req.flash('login-message', 'Verifica la tua email, controlla la posta elettronica.') });
    }

    //se passo i controlli ritorno l' utente con la funzione done()
    return done(null, user);

}));

//salvo nella sessione l' id utente autenticato per riconoscerlo ad ogni richista
passport.serializeUser((user, done) => {
    done(null, user._id)
});

//alla richiesta recupero l' utente memorizzato in sessione nel DB e lo associo a req.user
passport.deserializeUser(async (id, done) => {
    const user = await UserCollection.findOne({ _id: id });
    done(null, user);
})

module.exports = passport;