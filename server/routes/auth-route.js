const express = require('express');
const router = express.Router();

// definisco le rotte settate in server.js, se l' utente e' autenticato non gli permetto di accedere rendirizzandolo
// alla dashboard, altrimenti lo mando alla rotta richiesta definendo alcuni parametri che verranno poi letti da ejs

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/dashboard/home');
    res.render('login', {
        title: 'Login',
        css: '/css/auth.css',
        js: '/js/auth-form.js',
        auth: req.isAuthenticated(),
        authMessage: req.flash('login-message')
    })
})

router.get('/register', (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/dashboard/home');
    res.render('register', {
        title: 'Register',
        css: '/css/auth.css',
        js: '/js/auth-form.js',
        auth: req.isAuthenticated(),
        authMessage: req.flash('register-message')
    })
})

router.get('/recovery-password', (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/dashboard/home');
    res.render('password-recovery', {
        title: 'Password Recovery',
        css: '/css/auth.css',
        js: '/js/auth-form.js',
        auth: req.isAuthenticated(),
        authMessage: req.flash('recovery-message')
    })
})

router.get('/reset-password/:token', (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/dashboard/home');
    res.render('password-reset', {
        title: 'Password Reset',
        css: '/css/auth.css',
        js: '/js/auth-form.js',
        auth: req.isAuthenticated(),
        token: req.params.token,
        authMessage: req.flash('reset-message')
    })
})

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/auth/login')
    });
})

module.exports = router;