const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const auth = req.isAuthenticated() ? true : false;
    res.render('home', {
        title: 'Home',
        css: '/css/home.css',
        auth
    })
})

module.exports = router;