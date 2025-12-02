export const passwordResetTemplate = (email, resetUrl) => ({
  to: email,
  subject: 'Password Reset Request',
  html: `<!DOCTYPE html>
  <html>
  <body>
  <h2>Password Reset</h2>
  <p>You requested a password reset. Click the link below to reset your password:</p>
  <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
  <p>If you didn't request this, please ignore this email.</p>
  </body>
  </html>`
});