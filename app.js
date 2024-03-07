require('dotenv').config();
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

const port = process.env.PORT || 3000;

// Path to the transactions file (the database)
const transactionsFilePath = path.join(__dirname, 'transactions.txt');

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


// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.render('index', { title: "Dashboard", isAuthenticated: req.oidc.isAuthenticated(), user: req.oidc.user });
});

app.get('/profile', requiresAuth(), (req, res) => {
  let accessToken = req.oidc.accessToken;
  console.log(accessToken);
  res.render('profile', { title: "User Profile", accessToken: accessToken, isAuthenticated: req.oidc.isAuthenticated(), user: req.oidc.user });
});

app.post('/api/transactions/add', requiresAuth(), (req, res) => {
  const transactionData = req.body;
  const transactionString = JSON.stringify(transactionData);

  // Extracting fields from the request body
  const { type, amount, note } = transactionData;

  console.log(transactionData);

  // Basic validation
  if (!type || !['income', 'expense'].includes(type)) {
    return res.status(400).send({ message: "Invalid or missing 'type'. Must be 'income' or 'expense'." });
  }

  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return res.status(400).send({ message: "Invalid or missing 'amount'. Must be a positive number." });
  }

  if (typeof note !== 'string' || note.trim().length === 0) {
    return res.status(400).send({ message: "Invalid or missing 'note'. Must be a non-empty string." });
  }

  // Append the transaction data to the file, each transaction on a new line
  fs.appendFile(transactionsFilePath, transactionString + '\n', (err) => {
    if (err) {
      console.error('Failed to save transaction:', err);
      return res.status(500).send({ message: "Failed to add transaction" });
    }

    res.status(201).send({ message: "Transaction added successfully", transaction: req.body });
  });
});


app.get('/add', requiresAuth(), (req, res) => {
  res.render('add.pug', { title: "Add Transaction", isAuthenticated: req.oidc.isAuthenticated(), user: req.oidc.user });
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
