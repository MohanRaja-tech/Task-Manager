const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
require('dotenv').config();

console.log('Starting admin user creation...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');

const createAdminUser = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB successfully');

    // Check if admin user already exists
    console.log('Checking for existing admin user...');
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating...');
      
      // Update admin user to ensure correct role and password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin@2006', salt);
      
      await User.findByIdAndUpdate(existingAdmin._id, {
        email: 'admin@gmail.com',
        password: hashedPassword,
        name: 'System Administrator',
        username: 'admin',
        role: 'admin',
        isAdmin: true
      });
      
      console.log('Admin user updated successfully');
    } else {
      console.log('Creating new admin user...');
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin@2006', salt);

      const adminUser = new User({
        email: 'admin@gmail.com',
        password: hashedPassword,
        name: 'System Administrator',
        username: 'admin',
        role: 'admin',
        isAdmin: true
      });

      await adminUser.save();
      console.log('Admin user created successfully');
    }

    console.log('✅ Admin Setup Complete!');
    console.log('Admin credentials:');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin@2006');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.error('Full error:', error);
  } finally {
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

createAdminUser();
