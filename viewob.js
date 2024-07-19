const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

// MySQL connection configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ob_platform'  
});

// Connection MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Serve static files (like HTML) from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to get all data
app.get('/data', (req, res) => {
  const sql = 'SELECT * FROM obs'; 

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).send('An error occurred while retrieving data');
      return;
    }

    // Render results as JSON
    res.json(results);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
