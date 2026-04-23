
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  pg:       { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  tenant:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomType: { type: String },
  checkIn:  { type: String },
  message:  { type: String },
  status:   { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);