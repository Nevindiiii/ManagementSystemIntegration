import express from 'express';
import Profile from '../Models/ProfileModels.js';
import { verifyToken } from '../Middleware/authMiddleware.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadBase64ToS3 = async (base64String) => {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid base64 string');
  
  const contentType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  
  const fileName = `profiles/profile-${Date.now()}.${contentType.split('/')[1]}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: contentType
  });
  
  await s3Client.send(command);
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

const router = express.Router();

// Get profile by userId
router.get('/', verifyToken, async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user._id });
    
    if (!profile) {
      profile = await Profile.create({
        userId: req.user._id,
        name: req.user.name,
        email: req.user.email
      });
    }
    
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update profile
router.put('/', verifyToken, async (req, res) => {
  try {
    const { name, phone, location, bio, profileImage } = req.body;
    
    let imageUrl = profileImage;
    
    if (profileImage && profileImage.startsWith('data:image')) {
      imageUrl = await uploadBase64ToS3(profileImage);
    }
    
    let profile = await Profile.findOne({ userId: req.user._id });
    
    if (!profile) {
      profile = await Profile.create({
        userId: req.user._id,
        name,
        email: req.user.email,
        phone,
        location,
        bio,
        profileImage: imageUrl
      });
    } else {
      profile.name = name || profile.name;
      profile.phone = phone || profile.phone;
      profile.location = location || profile.location;
      profile.bio = bio || profile.bio;
      profile.profileImage = imageUrl || profile.profileImage;
      
      await profile.save();
    }
    
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
