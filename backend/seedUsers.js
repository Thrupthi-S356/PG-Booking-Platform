const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected ✅');

    await User.deleteMany();

    const hashed = await bcrypt.hash('password', 10);
    await User.insertMany([
      { name: 'Demo Tenant', email: 'tenant@demo.com', password: hashed, role: 'tenant' },
      { name: 'Demo Owner',  email: 'owner@demo.com',  password: hashed, role: 'owner'  },
    ]);

    console.log('Demo users seeded ✅');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
};

seedUsers();