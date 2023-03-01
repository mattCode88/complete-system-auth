const express = require('express');
const router = express.Router();

router.get('/home', (req, res) => {
    res.render('dashboard', {
        title: 'Dashboard',
        css: '/css/dashboard-home.css',
        js: '/js/dashboard-home.js',
        auth: req.isAuthenticated()
    })
})

module.exports = router;