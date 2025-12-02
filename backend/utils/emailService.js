import nodemailer from 'nodemailer';
import { application } from '../config/application.js';

const transporter = nodemailer.createTransport({
  host: application.EMAIL_HOST,
  port: application.EMAIL_PORT,
  secure: application.EMAIL_SECURE,
  auth: {
    user: application.EMAIL_USER,
    pass: application.EMAIL_PASSWORD,
  },
});

export const sendContactEmail = async (name, email, subject, message) => {
  // Email to admin
  await transporter.sendMail({
    from: application.EMAIL_FROM || application.EMAIL_USER,
    to: 'nevindisadeera@gmail.com',
    subject: `Contact Form: ${subject}`,
    html: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  });

  // Auto-reply to user
  await transporter.sendMail({
    from: application.EMAIL_FROM || application.EMAIL_USER,
    to: email,
    subject: 'Thank you for contacting us!',
    html: `
      <h2>Thank You for Reaching Out!</h2>
      <p>Dear ${name},</p>
      <p>We have received your message and will get back to you as soon as possible.</p>
      <p><strong>Your Message:</strong></p>
      <p><em>${message}</em></p>
      <br>
      <p>Best regards,</p>
      <p>Management System Team</p>
    `,
  });
};
