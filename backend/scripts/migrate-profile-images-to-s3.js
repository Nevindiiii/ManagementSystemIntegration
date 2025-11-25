import mongoose from 'mongoose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import Profile from '../Models/ProfileModels.js';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadBase64ToS3 = async (base64String, profileId) => {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid base64 string');
  
  const contentType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  
  const fileName = `profiles/profile-${profileId}-${Date.now()}.${contentType.split('/')[1]}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: contentType
  });
  
  await s3Client.send(command);
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

const migrateProfiles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const profiles = await Profile.find({ 
      profileImage: { $regex: '^data:image' } 
    });

    console.log(`Found ${profiles.length} profiles with base64 images`);

    for (const profile of profiles) {
      try {
        console.log(`Migrating profile ${profile._id}...`);
        const s3Url = await uploadBase64ToS3(profile.profileImage, profile._id);
        profile.profileImage = s3Url;
        await profile.save();
        console.log(`✓ Migrated profile ${profile._id}`);
      } catch (error) {
        console.error(`✗ Failed to migrate profile ${profile._id}:`, error.message);
      }
    }

    console.log('Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateProfiles();
