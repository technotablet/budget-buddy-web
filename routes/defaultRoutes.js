const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');


// req.isAuthenticated is provided from the auth router
router.get('/', (req, res) => {
    res.render('index', { title: "Dashboard", isAuthenticated: req.oidc.isAuthenticated(), user: req.oidc.user });
});

router.get('/profile', requiresAuth(), (req, res) => {
    let accessToken = req.oidc.accessToken;
    console.log(accessToken);
    res.render('profile', { title: "User Profile", accessToken: accessToken, isAuthenticated: req.oidc.isAuthenticated(), user: req.oidc.user });
});

router.get('/add', requiresAuth(), (req, res) => {
    res.render('add.pug', { title: "Add Transaction", isAuthenticated: req.oidc.isAuthenticated(), user: req.oidc.user });
});

// Export the router
module.exports = router;
