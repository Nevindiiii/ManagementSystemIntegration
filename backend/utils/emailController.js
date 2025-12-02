const { sendEmail, sendBulkEmails } = require('../config/emailConfig');

// Send welcome email
const sendWelcomeEmail = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    await sendEmail(email, 'welcome', { name, email, password });
    
    res.json({ message: 'Welcome email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send password reset email
const sendPasswordResetEmail = async (req, res) => {
  try {
    const { email, resetToken } = req.body;
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    await sendEmail(email, 'passwordReset', resetUrl);
    
    res.json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send notification email
const sendNotificationEmail = async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    
    await sendEmail(email, 'notification', { subject, message });
    
    res.json({ message: 'Notification email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send bulk emails
const sendBulkNotifications = async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;
    
    const result = await sendBulkEmails(recipients, 'notification', { subject, message });
    
    res.json({
      message: 'Bulk emails processed',
      result: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
  sendBulkNotifications
};