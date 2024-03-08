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
    const userId = req.auth && req.auth.sub; // 'sub' is a common field for user identifier in JWTs
    // Generate a timestamp
    const timestamp = new Date().toISOString();

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

    // Modify the transaction data to include userId and timestamp
    const enrichedTransactionData = {
        ...transactionData,
        userId, // Append the user identifier
        timestamp // Append the timestamp
    };

    // Convert to string for saving
    const transactionString = JSON.stringify(enrichedTransactionData);

    // Append the transaction data to the file, each transaction on a new line
    fs.appendFile(transactionsFilePath, transactionString + '\n', (err) => {
        if (err) {
            console.error('Failed to save transaction:', err);
            return res.status(500).send({ message: "Failed to add transaction" });
        }

        res.status(201).send({ message: "Transaction added successfully", transaction: req.body });
    });
});

router.get('/transactions/list', checkJwt, (req, res) => {
    const userId = req.auth && req.auth.sub; // Assuming user ID is in req.auth.sub
    const { type, month } = req.query; // Optional filters: type and month

    // Read the transactions file
    fs.readFile(transactionsFilePath, { encoding: 'utf8' }, (err, data) => {
        if (err) {
            console.error('Failed to read transactions:', err);
            return res.status(500).send({ message: "Failed to retrieve transactions" });
        }

        // Split the file content by new line to get each transaction as an element in an array
        const transactions = data.trim().split('\n')
            .map(line => JSON.parse(line)) // Parse each line as JSON
            .filter(transaction => transaction.userId === userId) // Filter transactions by userId
            .filter(transaction => {
                // Apply optional filters if they are provided
                if (type && transaction.type !== type) {
                    return false; // Filter by type if specified
                }
                if (month) {
                    const transactionMonth = new Date(transaction.timestamp).getMonth() + 1;
                    const filterMonth = parseInt(month, 10);
                    return transactionMonth === filterMonth; // Filter by month if specified
                }
                return true; // Include transaction if no type or month filter is applied
            });

        res.status(200).send(transactions);
    });
});


// Export the router
module.exports = router;
