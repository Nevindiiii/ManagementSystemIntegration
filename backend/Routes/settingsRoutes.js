import express from 'express';
import Settings from '../Models/SettingsModels.js';
import { protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Get user settings
router.get('/', protect, async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user._id });
    
    if (!settings) {
      settings = await Settings.create({ userId: req.user._id });
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user settings
router.put('/', protect, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
