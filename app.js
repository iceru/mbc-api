const express = require('express');
const transactionRoutes = require('./routes/transaction'); // Adjust the path as needed
const transactionsRoutes = require('./routes/transactions'); // Adjust the path as needed

const app = express();
app.use(express.json());

app.use('/api/transaction', transactionRoutes);
app.use('/api/transactions', transactionsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
