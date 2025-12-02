export const welcomeTemplate = (name, email, password) => ({
  to: email,
  subject: "Welcome! Your Account Credentials",
  html: `<!DOCTYPE html>
  <html>
  <body>
  <h1>Welcome ${name}!</h1>
  <p>Email: ${email}</p>
  <p>Password: ${password}</p>
  <p>⚠️ Change password after first login</p>
  </body>
  </html>`
});