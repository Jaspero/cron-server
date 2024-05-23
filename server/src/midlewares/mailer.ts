import sgMail from '@sendgrid/mail';
import { CONFIG } from '../config';

sgMail.setApiKey(CONFIG.email.sendgridApiKey);

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  const msg = {
    to,
    from: CONFIG.email.sender,
    subject: 'Password Reset',
    text: `You requested to reset your password. Use the following link to reset it: ${resetLink}`,
    html: `<p>You requested to reset your password. Use the following link to reset it: <a href="${resetLink}">${resetLink}</a></p>`,
  };

  try {
    await sgMail.send(msg);
    console.log('Password reset email sent');
  } catch (error) {
    console.error('Error sending password reset email:', error.response.body);
  }
};
