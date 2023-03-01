const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
const bodyparser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');

// import della funzione connect e dalla middleware checkout
const connect = require('./server/config/db-config');
const checkAuth = require('./server/middleware/check-auth');

// abilito l' uso di dotenv e stabilisco una porta
dotenv.config({ path: '.env' });
const PORT = process.env.PORT || 8000 || 4200;

// route
const homeRouter = require('./server/routes/home.js');
const authRouter = require('./server/routes/auth-route.js');
const dashboardRouter = require('./server/routes/dashboard-route.js');

// api
const authApi = require('./server/api/auth-api');

// richiamo il metodo connect che avvia il server e connette al db
connect(process.env.MONGO_URI, PORT, app);

// setto ejs come view enjine e stabilisco il path delle views a partire da ./frontend/views
app.set('view engine', 'ejs');
app.set('views', './frontend/views');

// abilito bodyparser, middleware che consente di recuperare i dati inviati dai client all' interno del body della 
// richiestae di elaborarli per poi fornirli ai controller o alle viste
app.use(bodyparser.urlencoded({ extended: true }));

// abilito l' utilizzo di flash per inviare messaggi "flash" alle rotte
app.use(flash());

// abilito l' uso di sessioni
app.use(session({
    secret: process.env.CHIAVE_SEGRETA,
    saveUninitialized: false,
    resave: false,
}))

// abilito l' uso di passport
app.use(passport.initialize());
app.use(passport.session());

// setto i path per i file statici
app.use('/css', express.static(path.resolve(__dirname, "frontend/assets/css")));
app.use('/img', express.static(path.resolve(__dirname, "frontend/assets/images")));
app.use('/js', express.static(path.resolve(__dirname, "frontend/assets/js")));

// definisco le rotte per le viste
app.use(homeRouter);
app.use('/auth', authRouter);
app.use('/dashboard', checkAuth, dashboardRouter);

// definisco le rotte api
app.use('/api', authApi);


