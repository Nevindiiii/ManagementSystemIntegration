import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const WELCOME_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const sendWelcomeEmail = async (userName: string, userEmail: string) => {
  try {
    console.log('Sending email with:', {
      SERVICE_ID,
      WELCOME_TEMPLATE_ID,
      PUBLIC_KEY,
      userName,
      userEmail
    });

    const templateParams = {
      name: userName,
      to_name: userName,
      email: userEmail,
      app_name: 'Management System',
      from_name: 'Management System Team',
    };

    console.log('Template params:', templateParams);

    const response = await emailjs.send(
      SERVICE_ID,
      WELCOME_TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );
    console.log('Email sent successfully:', response);
    return response;
  } catch (error: any) {
    console.error('Failed to send welcome email:', error);
    console.error('Error details:', error.text, error.status);
    throw error;
  }
};
