const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGODB_URI = 'mongodb://localhost:27017/knight-wolf';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Successfully connected to Knight Wolf Database'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
    res.status(200).send('Knight Wolf Backend API is running.');
});

// Server Initialization
app.listen(PORT, () => {
    console.log(`Server is live at http://localhost:${PORT}`);
});

