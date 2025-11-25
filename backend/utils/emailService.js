import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendContactEmail = async (name, email, subject, message) => {
  // Email to admin
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
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
    from: process.env.EMAIL_USER,
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
