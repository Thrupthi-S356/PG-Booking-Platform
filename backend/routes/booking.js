const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const PG = require('../models/PG');

// POST /pgs/:pgId/book
router.post('/pgs/:pgId/book', async (req, res) => {
  try {
    const { roomType, checkIn, message } = req.body;
    const booking = await Booking.create({
      pg: req.params.pgId,
      tenant: req.body.tenantId, // from JWT later
      roomType, checkIn, message,
      status: 'pending'
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /bookings/mine  (tenant's bookings)
router.get('/mine', async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.query.tenantId }).populate('pg');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /bookings/requests  (owner sees requests for their PGs)
router.get('/requests', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('pg').populate('tenant');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /bookings/:id  (approve/reject)
router.patch('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;