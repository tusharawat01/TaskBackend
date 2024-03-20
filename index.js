// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT;

// app.use(cors({
//   origin: 'https://react-express-sql.netlify.app',
//   optionsSuccessStatus: 200 
// }));

app.use(cors());



// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const connection = mysql.createConnection({
  port: process.env.MYSQL_ADDON_PORT,
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB
});

// Connect to MySQL
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL Database');
});

const sql = "CREATE TABLE IF NOT EXISTS submissions (username VARCHAR(50) NOT NULL,code_language VARCHAR(50) NOT NULL,stdin TEXT,source_code TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
connection.query(sql, (error, results) => {
  if (error) {
    console.error('Error executing SQL command:', error);
  } else {
    console.log('Table created successfully');
  }
});



// API Endpoints

// POST endpoint to submit code snippet
app.post('/api/submit', (req, res) => {
  const { username, codeLanguage, stdin, sourceCode } = req.body;
  
  // Insert submission into MySQL
  const sql = 'INSERT INTO submissions (username, code_language, stdin, source_code) VALUES (?, ?, ?, ?)';
  connection.query(sql, [username, codeLanguage, stdin, sourceCode], (error, result) => {
    if (error) {
      console.error('Error submitting code snippet:', error);
      res.status(500).json('Error submitting code snippet:', error);
      return;
    }
    console.log('Code snippet submitted successfully');
    res.status(200).json({ message: 'Code snippet submitted successfully' });
  });
});

// app.get('/',(req,res) =>{
//   res.send('Server is ready');
// });

// GET endpoint to fetch all submissions
app.get('/api/submissions', (req, res) => {
  // Fetch submissions from MySQL
  const sql = 'SELECT username, code_language, stdin, LEFT(source_code, 100) AS source_code_preview, timestamp FROM submissions';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching submissions:', err);
      res.status(500).send('Error fetching submissions in backend');
      return;
    }
    if(results == null){
      res.send("empty array");
    }
    res.json(results);
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});