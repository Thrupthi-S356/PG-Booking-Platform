const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../services/mailer');

// POST /v1/contact
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name?.trim())    return res.status(400).json({ error: 'Name is required' });
  if (!email)           return res.status(400).json({ error: 'Email is required' });
  if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: 'Invalid email' });
  if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

  try {
    await sendContactEmail({ name: name.trim(), email, subject: subject?.trim(), message: message.trim() });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact email error:', err);
    return res.status(500).json({ error: 'Failed to send message. Try again.' });
  }
});

module.exports = router;