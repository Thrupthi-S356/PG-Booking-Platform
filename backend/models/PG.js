
 const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  type:      { type: String, enum: ['Single', 'Double Sharing', 'Triple Sharing'], default: 'Single' },
  price:     { type: Number, required: true },
  available: { type: Number, default: 0 },
});

const pgSchema = new mongoose.Schema({
  title:       { type: String, required: [true, 'PG name is required'], trim: true },
  description: { type: String, default: '', trim: true },
  location: {
    city: { type: String, required: [true, 'City is required'], trim: true },
    area: { type: String, default: '', trim: true }, // ✅ not required
    lat:  { type: Number, default: null },
    lng:  { type: Number, default: null },
  },
  price:     { type: Number, required: [true, 'Price is required'], min: 0 },
  type:      { type: String, enum: ['male', 'female', 'coed'], default: 'coed' },
  rating:    { type: Number, default: 0, min: 0, max: 5 },
  reviews:   { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  images:    { type: [String], default: [] },
  amenities: {
    type: [String],
    
    default: [],
  },
  rooms: { type: [roomSchema], default: [] },
  owner: {
    name:   { type: String, required: true },
    phone:  { type: String, default: '' },
    since:  { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
}, { timestamps: true });

pgSchema.index({ 'location.city': 1 });
pgSchema.index({ type: 1 });
pgSchema.index({ price: 1 });
pgSchema.index({ 'owner.userId': 1 });
pgSchema.index({ available: 1 });

pgSchema.virtual('totalBeds').get(function () {
  return this.rooms.reduce((sum, r) => sum + (r.available || 0), 0);
});




pgSchema.pre('save', function (next) {
  if (this.rooms && this.rooms.length > 0) {
    const totalBeds = this.rooms.reduce((sum, r) => sum + (r.available || 0), 0);
    this.available = totalBeds > 0;
  }
  
});

module.exports = mongoose.model('PG', pgSchema);