
import * as dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Admin from './models/Admin';

const createAdmin = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-db';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected!');

    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    const admin = new Admin({
      email: 'admin@example.com',
      password: 'password123',
      name: 'Admin',
      role: 'admin',
    });
    await admin.save();
    console.log('Initial admin created: admin@example.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
};

createAdmin();
