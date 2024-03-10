const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');


// req.isAuthenticated is provided from the auth router
router.get('/', async (req, res) => {

    let access_token; // Declare access_token at a higher scope
    if (req.oidc && req.oidc.accessToken) {
        // special page that should work without authentication also (no requiresAuth())
        let accessTokenDetails = req.oidc.accessToken;
        if (accessTokenDetails.isExpired()) {
            ({ access_token } = await accessTokenDetails.refresh());
        } else {
            access_token = accessTokenDetails.access_token;
        }
    }

    res.render('index', { title: "Dashboard", accessToken: access_token, isAuthenticated: req.oidc.isAuthenticated(), user: req.oidc.user });
});

router.get('/profile', requiresAuth(), async (req, res) => {
    let { token_type, access_token, isExpired, refresh } = req.oidc.accessToken;
    if (isExpired()) {
        ({ access_token } = await refresh());
    }
    res.render('profile', { title: "User Profile", accessToken: access_token, isAuthenticated: req.oidc.isAuthenticated(), user: req.oidc.user });
});

router.get('/add', requiresAuth(), (req, res) => {
    let accessToken = req.oidc.accessToken;
    accessToken = accessToken.access_token;
    res.render('add.pug', { title: "Add Transaction", accessToken: accessToken, isAuthenticated: req.oidc.isAuthenticated(), user: req.oidc.user });
});

// Export the router
module.exports = router;
