// Import templates
export { welcomeTemplate } from '../templates/welcomeTemplate.js';
export { contactTemplate } from '../templates/contactTemplate.js';
export { autoReplyTemplate } from '../templates/autoReplyTemplate.js';
export { passwordResetTemplate } from '../templates/passwordResetTemplate.js';
export { notificationTemplate } from '../templates/notificationTemplate.js';

// Helper functions
export const sendEmailWithTemplate = async (template) => {
  const { sendEmail } = await import('../services/email.service.js');
  return await sendEmail(template);
};

export const sendWelcomeEmail = async (userEmail, userName, password) => await sendEmailWithTemplate(welcomeTemplate(userName, userEmail, password));

export const sendContactEmail = async (name, email, subject, message) => {
  await sendEmailWithTemplate(contactTemplate(name, email, subject, message));
  const userReply = autoReplyTemplate(name, message);
  userReply.to = email;
  await sendEmailWithTemplate(userReply);
};

export const sendPasswordResetEmail = async (email, resetUrl) => await sendEmailWithTemplate(passwordResetTemplate(email, resetUrl));

export const sendNotificationEmail = async (email, title, message, actionUrl, actionText) => await sendEmailWithTemplate(notificationTemplate(email, title, message, actionUrl, actionText));

export const sendBulkNotifications = async (userEmails, title, message) => {
  const results = await Promise.allSettled(userEmails.map(email => sendEmailWithTemplate(notificationTemplate(email, title, message))));
  return { successful: results.filter(r => r.status === 'fulfilled').length, failed: results.filter(r => r.status === 'rejected').length, total: userEmails.length };
};