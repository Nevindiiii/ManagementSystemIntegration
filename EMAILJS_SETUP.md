# EmailJS Setup Guide - Welcome Email

## 1. EmailJS Account Setup

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up / Login
3. Complete email verification

## 2. Add Email Service

1. Go to **Email Services** → Click **Add New Service**
2. Select **Gmail** (or your preferred email provider)
3. Click **Connect Account** and authorize
4. Copy the **Service ID** (e.g., `service_1myy7ai`)

## 3. Create Welcome Email Template

1. Go to **Email Templates** → Click **Create New Template**
2. Template Name: `Welcome Email`
3. Template Content:

```
Subject: Welcome to {{app_name}}! 🎉

Hi {{to_name}},

Welcome to Management System! We're excited to have you on board.

Your account has been successfully created. You can now login and start using our platform.

If you have any questions, feel free to reach out to our support team.

Best regards,
Management System Team
```

4. Click **Save**
5. Copy the **Template ID**

## 4. Get Public Key

1. Go to **Account** → **General**
2. Copy your **Public Key**

## 5. Configure Environment Variables

Add these to `frontend/.env`:

```env
VITE_EMAILJS_SERVICE_ID=service_1myy7ai
VITE_EMAILJS_WELCOME_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

## 6. Install Package

```bash
cd frontend
npm install @emailjs/browser
```

## 7. Test

1. Start frontend: `npm run dev`
2. Go to signup page
3. Register a new user
4. Check email inbox for welcome email

## Template Variables

The welcome email uses these variables:

- `{{to_name}}` - User's name
- `{{to_email}}` - User's email
- `{{app_name}}` - Application name (Management System)

## Troubleshooting

**Email not received?**
- Check spam folder
- Verify Service ID, Template ID, and Public Key
- Check EmailJS dashboard → Email History
- Ensure email service is connected properly

**Rate Limits**
- Free plan: 200 emails/month
- Check usage in EmailJS dashboard

## Files Modified

1. `frontend/src/services/emailService.ts` - Email service
2. `frontend/src/pages/auth/signup.tsx` - Signup integration
3. `frontend/.env.example` - Environment template
