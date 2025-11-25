import mongoose from 'mongoose';
import Auth from '../Models/AuthModels.js';
import dotenv from 'dotenv';

dotenv.config();

async function testUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'test@example.com';
    const user = await Auth.findOne({ email });

    if (user) {
      console.log('User exists:', { email: user.email, name: user.name, role: user.role });
    } else {
      console.log('Creating test user...');
      const newUser = new Auth({
        name: 'Test User',
        email: 'test@example.com',
        password: 'test123',
        role: 'user'
      });
      await newUser.save();
      console.log('Test user created:', { email: newUser.email, name: newUser.name });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testUser();
