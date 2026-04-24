const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const PG = require('../models/PG');
const { protect, ownerOnly } = require('../middleware/auth');


router.post('/', protect, async (req, res) => {
  try {
    const { pgId, roomType, checkIn, message } = req.body;
    const pg = await PG.findById(pgId);
    if (!pg) return res.status(404).json({ message: 'PG not found' });

    const room = pg.rooms.find(r => r.type === roomType);
    const booking = await Booking.create({
      pg: pgId,
      tenant: req.user._id,   // ✅ from JWT, not req.body
      roomType,
      checkIn,
      message,
      status: 'pending',
      // snapshot for dashboard display
      pgTitle: pg.title,
      pgLocation: `${pg.location.area}, ${pg.location.city}`,
      price: room?.price || pg.price,
      image: pg.images[0] || '',
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /v1/bookings/my  — tenant's bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.user._id }).sort({ createdAt: -1 });
    const formatted = bookings.map(b => ({
      id: b._id,
      pgId: b.pg,
      pgTitle: b.pgTitle,
      pgLocation: b.pgLocation,
      checkIn: b.checkIn,
      roomType: b.roomType,
      price: b.price,
      status: b.status,
      image: b.image,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /v1/bookings/owner-requests  — owner sees requests for their PGs
router.get('/owner-requests', protect, ownerOnly, async (req, res) => {
  try {
    const myPGs = await PG.find({ 'owner.userId': req.user._id }).select('_id');
    const pgIds = myPGs.map(p => p._id);

    const bookings = await Booking.find({ pg: { $in: pgIds } })
      .populate('tenant', 'name email')
      .sort({ createdAt: -1 });

    const formatted = bookings.map(b => ({
      id: b._id,
      tenant: b.tenant?.name || 'Unknown',
      email: b.tenant?.email || '',
      avatar: (b.tenant?.name || 'U').substring(0, 2).toUpperCase(),
      pgTitle: b.pgTitle,
      roomType: b.roomType,
      checkIn: b.checkIn,
      status: b.status,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /v1/bookings/:id/status  — owner approves/rejects
router.patch('/:id/status', protect, ownerOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
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