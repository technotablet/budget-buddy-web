require('dotenv').config();
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');

const app = express();
const port = process.env.PORT || 3000;

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: `http://localhost:${port}`,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  let loggedIn = "Logged In. <a href='/profile'>Profile</a> • <a href='/logout'>Logout</a>";
  let loggedOut = "Logged Out. <a href='/login'>Login</a>";
  res.send(req.oidc.isAuthenticated() ? loggedIn : loggedOut);
});

app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
  });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
