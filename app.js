require('dotenv').config();
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const path = require('path');

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

// Set PUG templating engine
app.set('views', path.join(__dirname, 'views')); // Set the directory for Pug templates
app.set('view engine', 'pug'); // Use Pug as the template engine


// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.render('index', { title: "Dashboard", isAuthenticated: req.oidc.isAuthenticated(), user: req.oidc.user });
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.render('profile', { title: "User Profile", isAuthenticated: req.oidc.isAuthenticated(), user: req.oidc.user });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
