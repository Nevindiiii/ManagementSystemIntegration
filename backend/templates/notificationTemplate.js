export const notificationTemplate = (email, title, message, actionUrl = null, actionText = 'Click Here') => ({
  to: email,
  subject: title,
  html: `<!DOCTYPE html>
  <html>
  <body>
  <h2>${title}</h2>
  <p>${message}</p>
  ${actionUrl ? `<a href="${actionUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${actionText}</a>` : ''}
  </body>
  </html>`
});