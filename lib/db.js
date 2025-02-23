const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',      // Your database host
    user: 'your_username',  // Your database username
    password: 'your_password',  // Your database password
    database: 'your_database',  // Your database name
    waitForConnections: true,
    connectionLimit: 10,    // Maximum number of connections
    queueLimit: 0
});

// Export the pool for querying the database
module.exports = {
    query: (sql, params) => pool.execute(sql, params)
};
