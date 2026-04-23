

const express = require('express');
const router = express.Router();
const PG = require('../models/PG');
const Booking = require('../models/Booking');

// GET all PGs with filters
router.get('/', async (req, res) => {
  try {
    const { city, type, minPrice, maxPrice, amenities, search } = req.query;
    let query = {};
    if (city) query['location.city'] = city;
    if (type && type !== 'all') query.type = type;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (amenities) {
      const list = Array.isArray(amenities) ? amenities : [amenities];
      query.amenities = { $all: list };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.area': { $regex: search, $options: 'i' } },
      ];
    }
    const pgs = await PG.find(query);
    res.json(pgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single PG
router.get('/:id', async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ message: 'PG not found' });
    res.json(pg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /pgs/:pgId/book  ← THIS WAS MISSING
router.post('/:pgId/book', async (req, res) => {
  try {
    const { roomType, checkIn, message } = req.body;
    const booking = await Booking.create({
      pg: req.params.pgId,
      roomType,
      checkIn,
      message,
      status: 'pending'
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create PG
router.post('/', async (req, res) => {
  try {
    const pg = await PG.create(req.body);
    res.status(201).json(pg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update PG
router.put('/:id', async (req, res) => {
  try {
    const pg = await PG.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(pg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE PG
router.delete('/:id', async (req, res) => {
  try {
    await PG.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;