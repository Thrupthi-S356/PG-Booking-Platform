const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  location: {
    city:  { type: String },
    area:  { type: String },
    lat:   { type: Number },
    lng:   { type: Number },
  },
  price:       { type: Number, required: true },
  type:        { type: String, enum: ['male', 'female', 'coed'] },
  rating:      { type: Number, default: 0 },
  reviews:     { type: Number, default: 0 },
  available:   { type: Boolean, default: true },
  images:      [String],
  amenities:   [String],
  description: { type: String },
  owner: {
    name:  { type: String },
    phone: { type: String },
    since: { type: String },
  },
  rooms: [
    {
      type:      { type: String },
      price:     { type: Number },
      available: { type: Number },
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('PG', pgSchema);