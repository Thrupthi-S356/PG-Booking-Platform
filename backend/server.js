
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');           
const { Server } = require('socket.io'); 
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); 
const path = require('path');

const io = new Server(server, {
  cors: { origin:  ['http://localhost:3000', 'http://localhost:5173'], methods: ['GET', 'POST'] }
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/v1/auth', require('./routes/auth'));
app.use('/v1/pgs', require('./routes/pg'));        // handles /v1/pgs/:id/book too
app.use('/v1/bookings', require('./routes/booking'));
app.use('/v1/contact', require('./routes/contact'));


app.use('/v1/upload',   require('./routes/upload'));

app.get('/', (req, res) => res.send('PG Booking API Running ✅'));

const rooms = {}; // stores messages in memory per room

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // join a room (roomId = pgId + tenantId combined)
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    // send existing messages for this room
    socket.emit('room_history', rooms[roomId] || []);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // receive and broadcast message
  socket.on('send_message', ({ roomId, message }) => {
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(message);
    // send to everyone in that room
    io.to(roomId).emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));