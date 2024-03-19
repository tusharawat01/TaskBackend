// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const Redis = require('ioredis'); // Import Redis library
const config = require('./config'); // Import the config object

// Initialize Express app
const app = express();
const port = config.port;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const connection = mysql.createConnection({
  host: config.mysqlHost,
  user: config.mysqlUser,
  password: config.mysqlPassword,
  database: config.mysqlDatabase
});

// Connect to MySQL
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL Database');
});

// Redis Connection
// Connect to Redis server
const redisClient = new Redis({
  host: config.redisHost,
  port: config.redisPort
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
      res.status(500).json('Error submitting code snippet in backend:', error);
      return;
    }
    console.log('Code snippet submitted successfully');
    res.status(200).json({ message: 'Code snippet submitted successfully' });
  });
});

// GET endpoint to fetch all submissions
app.get('/api/submissions', async (req, res) => {
  try {
    // Check if submissions data is cached in Redis
    const cachedData = await redisClient.get('submissions');
    if (cachedData) {
      console.log('Submissions data retrieved from Redis cache');
      res.json(JSON.parse(cachedData)); // Return cached data
    } else {
      // If data is not cached, fetch submissions from MySQL
      const sql = 'SELECT username, code_language, stdin, LEFT(source_code, 100) AS source_code_preview, timestamp FROM submissions';
      connection.query(sql, (err, results) => {
        if (err) {
          console.error('Error fetching submissions:', err);
          res.status(500).send('Error fetching submissions in backend');
          return;
        }
        // Cache the fetched data in Redis
        redisClient.set('submissions', JSON.stringify(results), 'EX', 3600); // Cache expiry time: 1 hour
        console.log('Submissions data fetched from MySQL and cached in Redis');
        res.json(results); // Return fetched data
      });
    }
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).send('Error fetching submissions in backend');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
