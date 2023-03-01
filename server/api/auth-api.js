const express = require('express');
const router = express.Router();
const passport = require('../config/passport-config');
const authController = require('../controller/auth-controller');

// faccio gestire le prime tre rotte dalle middleware definite in passport-config
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/dashboard/home',
    failureRedirect: '/auth/login',
    failureFlash: true
}))

router.get('/google-login', passport.authenticate('google', {
    scope: ['openid', 'email']
}))

router.get('/google-auth-redirect', passport.authenticate('google', {
    successRedirect: '/dashboard/home',
    failureRedirect: '/auth/login',
    failureFlash: true
}))

//definisco le varie rotte api associandogli i controller per gestirle
router.post('/register', authController.create);

router.post('/password', authController.forgotPassword);

router.post('/password-reset', authController.resetPassword);

router.get('/verify/:token', authController.verifyAccount);

router.get('/verify-user', authController.verifyUsername);

router.get('/verify-email', authController.verifyEmail);

module.exports = router;