export const contactTemplate = (name, email, subject, message) => ({
  to: 'nevindisadeera@gmail.com',
  subject: `Contact Form: ${subject}`,
  html: `<!DOCTYPE html>
  <html>
  <body>
  <h2>New Contact Message</h2>
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Subject:</strong> ${subject}</p>
  <p><strong>Message:</strong> ${message}</p>
  </body>
  </html>`
});