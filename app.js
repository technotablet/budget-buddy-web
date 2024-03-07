require('dotenv').config();
const express = require('express');
const { auth } = require('express-openid-connect');
const path = require('path');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies


const port = process.env.PORT || 3000;

// Routes
const apiRoutes = require('./routes/apiRoutes');
const defaultRoutes = require('./routes/defaultRoutes');

// Set PUG templating engine
app.set('views', path.join(__dirname, 'views')); // Set the directory for Pug templates
app.set('view engine', 'pug'); // Use Pug as the template engine

// For Auth0 authentication
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
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

// Use routers

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

app.use('/api', apiRoutes); // Prefix all routes defined in apiRoutes with `/api`
app.use('/', defaultRoutes);

app.listen(port, () => {
  console.log(`Budget Buddy App listening at http://localhost:${port}`);
});
