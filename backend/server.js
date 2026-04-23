

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/v1/auth', require('./routes/auth'));
app.use('/v1/pgs', require('./routes/pg'));        // handles /v1/pgs/:id/book too
app.use('/v1/bookings', require('./routes/booking'));
app.use('/v1/contact', require('./routes/contact'));

app.get('/', (req, res) => res.send('PG Booking API Running ✅'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));