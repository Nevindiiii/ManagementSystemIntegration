import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth',
    required: true,
    unique: true
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'profiles'
});

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
