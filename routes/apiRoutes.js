const express = require('express');
const router = express.Router();
const checkJwt = require('../util/jwtAuth');
const fs = require('fs');
const path = require('path');

// Path to the transactions file (the database)
const transactionsFilePath = path.join(__dirname, '../transactions.txt');

// Define API routes
router.post('/transactions/add', checkJwt, (req, res) => {
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
// Export the router
module.exports = router;
