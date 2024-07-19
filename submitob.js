const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse incoming form data
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MySQL connection configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ob_platform'
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Serve the form HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/obformplt.html');
});

// Handling form submission
app.post('/submit', (req, res) => {
  const { id, name, birth, death, content, author } = req.body;

  // Checking fields  replacing undefined with null
  const fields = [id, name, birth, death, content, author];
  const values = fields.map(field => field === '' ? null : field);

  if (values.includes(null)) {
    res.status(400).send('All fields are required');
    return;
  }

  const sql = 'INSERT INTO obs (id, name, birth, death, content, author) VALUES (?, ?, ?, ?, ?, ?)';
  db.execute(sql, values, (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('An error occurred while inserting data');
      return;
    }
    res.send('Data inserted successfully');
  });
});

// Render obituary page with dynamic meta tags
app.get('/obituary/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM obs WHERE id = ?';
  
  db.execute(sql, [id], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('An error occurred while fetching data');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Obituary not found');
      return;
    }
    const obituary = results[0];
    res.render('obituary', {
      title: obituary.name + ' Obituary',
      description: `Obituary for ${obituary.name}, born on ${obituary.birth} and passed away on ${obituary.death}.`,
      keywords: `obituary, ${obituary.name}, ${obituary.birth}, ${obituary.death}`,
      obituary
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
