


const express  = require('express');
const router   = express.Router();
const upload   = require('../config/multer');
const { protect } = require('../middleware/auth');
const path     = require('path');
const fs       = require('fs');

router.post('/', protect, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const urls    = req.files.map(f => `${baseUrl}/uploads/${f.filename}`);
    console.log('✅ Uploaded:', urls);
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/', protect, (req, res) => {
  try {
    const { url } = req.body;
    const filename = url.split('/uploads/')[1];
    if (!filename) return res.status(400).json({ message: 'Invalid URL' });
    const filepath = path.join(__dirname, '../uploads', filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;