require('dotenv').config();
const express = require('express');
const { auth } = require('express-openid-connect');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies


const port = process.env.PORT || 3000;

// Path to the transactions file (the database)
const transactionsFilePath = path.join(__dirname, 'transactions.txt');

// Routes
const apiRoutes = require('./routes/apiRoutes');
const defaultRoutes = require('./routes/defaultRoutes');

// For Auth0 authentication
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: `http://localhost:${port}`,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  clientSecret: process.env.CLIENT_SECRET,
  // Ensure scopes include openid at a minimum and any other required scopes
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email',
    audience: "http://localhost:3000/*"
  },
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// Set PUG templating engine
app.set('views', path.join(__dirname, 'views')); // Set the directory for Pug templates
app.set('view engine', 'pug'); // Use Pug as the template engine


// Use routers
app.use('/api', apiRoutes); // Prefix all routes defined in apiRoutes with `/api`
app.use('/', defaultRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
