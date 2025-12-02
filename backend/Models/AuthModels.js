import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; 

const authSchema = new mongoose.Schema({ // Schema for authentication users
  name: {
    type: String,
    required: [true, 'Name is required'],
    maxlength: [50, 'Name must be less than 50 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: { 
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true,
  collection: 'authusers'
});

// Hash password before saving
authSchema.pre('save', async function(next) { // Only hash if password is modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
}); 

// Compare password method
authSchema.methods.comparePassword = async function(candidatePassword) { // Compare given password with hashed password
  return bcrypt.compare(candidatePassword, this.password);
};

const Auth = mongoose.model('Auth', authSchema); // 'Auth' model for 'authusers' collection

export default Auth;