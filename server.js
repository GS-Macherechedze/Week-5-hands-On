// Import required modules
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

// Initialize the Express app
const app = express();

// Middleware setup
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Create a MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Function to get a database connection
const getConnection = (callback) => {
  pool.getConnection((err, connection) => {
    if (err) return callback(err);
    callback(null, connection);
  });
};

// Basic route
app.get('/', (req, res) => {
    const currentTime = new Date().toLocaleString();
    res.send(`<h1>Welcome!</h1><p>Current server time is ${currentTime}</p>`);
  });
  

// Example route to fetch users from the database
app.get('/users', (req, res) => {
  getConnection((err, connection) => {
    if (err) return res.status(500).json({ error: err.message });

    connection.query('SELECT * FROM users', (error, results) => {
      connection.release(); // Release the connection back to the pool

      if (error) return res.status(500).json({ error: error.message });
      res.json(results);
    });
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong! 😢' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
