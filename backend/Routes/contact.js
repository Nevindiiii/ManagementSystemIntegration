import express from 'express';
import nodemailer from 'nodemailer';
const router = express.Router();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/send', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <h3>Thank you for contacting us, ${name}!</h3>
        <p>We received your message:</p>
        <blockquote>${message}</blockquote>
        <p>We'll get back to you soon.</p>
      `
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

export default router;