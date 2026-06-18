const dotenv = require('dotenv');
dotenv.config(); 

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const memoryRoutes = require('./routes/memoryRoutes');
const authRoutes = require('./routes/authRoutes');

// Connect to Database
connectDB();

const app = express();

app.use(cors({ origin: '*' }));

app.use(express.json()); 

// Basic Route
app.get('/', (req, res) => {
  res.send('PCSTians Memories Portal API is running...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/memories', memoryRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
