import 'dotenv/config';
import express from 'express';
import app from './src/routes/app.js';
import connectDB from './src/config/db.config.js';


// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 3000;

// Middleware to parse JSON data (useful for POST requests)
app.use(express.json());

// Basic GET route for the home page
app.get('/', (req, res) => {
  res.send('Hello, World! Your Express app is running.');
});

// Basic POST route example
app.post('/api/data', (req, res) => {
  const receivedData = req.body;
  res.json({
    message: 'Data received successfully!',
    data: receivedData
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
