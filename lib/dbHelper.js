const db = require('./db');

// Helper function to execute queries with parameters
const executeQuery = async (query, params) => {
    try {
        const [rows] = await db.query(query, params);
        return rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw error;
    }
};

module.exports = {
    executeQuery
};