export const autoReplyTemplate = (name, message) => ({
  to: '',
  subject: 'Thank you for contacting us!',
  html: `<!DOCTYPE html>
  <html>
  <body>
  <h2>Thank You for Reaching Out!</h2>
  <p>Dear ${name},</p>
  <p>We have received your message and will get back to you as soon as possible.</p>
  <p><strong>Your Message:</strong></p>
  <p><em>${message}</em></p>
  <br>
  <p>Best regards,</p>
  <p>Management System Team</p>
  </body><
  /html>`
});