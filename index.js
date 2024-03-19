const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const config = require('./config');

const app = express();
const port = config.port;

app.use(cors({
  origin: 'https://react-express-sql.netlify.app',
  optionsSuccessStatus: 200 
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUser,
  password: config.mysqlPassword,
  database: config.mysqlDatabase
});

// No need for manual connection setup with connection pooling

const createTableSql = "CREATE TABLE IF NOT EXISTS submissions (username VARCHAR(50) NOT NULL, code_language VARCHAR(50) NOT NULL, stdin TEXT, source_code TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
pool.query(createTableSql, (error, results) => {
  if (error) {
    console.error('Error creating table:', error);
  } else {
    console.log('Table created successfully');
  }
});

app.post('/api/submit', (req, res) => {
  const { username, codeLanguage, stdin, sourceCode } = req.body;
  const sql = 'INSERT INTO submissions (username, code_language, stdin, source_code) VALUES (?, ?, ?, ?)';
  pool.query(sql, [username, codeLanguage, stdin, sourceCode], (error, result) => {
    if (error) {
      console.error('Error submitting code snippet:', error);
      res.status(500).json({ error: 'Error submitting code snippet' });
      return;
    }
    console.log('Code snippet submitted successfully');
    res.status(200).json({ message: 'Code snippet submitted successfully' });
  });
});

app.get('/api/submissions', (req, res) => {
  const sql = 'SELECT username, code_language, stdin, LEFT(source_code, 100) AS source_code_preview, timestamp FROM submissions';
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching submissions:', err);
      res.status(500).send('Error fetching submissions in backend');
      return;
    }
    if (results.length === 0) {
      res.send("empty array");
    } else {
      res.json(results);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
