'use server';
/**
 * @fileOverview Email sending service (using Nodemailer).
 *
 * - sendEmail - A function that sends an email using SMTP credentials.
 */

import { z } from 'genkit';
import nodemailer from 'nodemailer';

const SendEmailInputSchema = z.object({
  to: z.string().email().describe('The recipient email address.'),
  subject: z.string().describe('The subject of the email.'),
  body: z.string().describe('The HTML body of the email.'),
});
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

const SendEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was sent successfully.'),
  messageId: z.string().optional().describe('The message ID from the email server.'),
  error: z.string().optional().describe('Error message if sending failed.'),
});
export type SendEmailOutput = z.infer<typeof SendEmailOutputSchema>;

/**
 * Sends an email using Nodemailer with SMTP credentials from environment variables.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailOutput> {
  const { to, subject, body } = input;

  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('SMTP environment variables are not configured. Please check your .env file.');
    return {
      success: false,
      error: 'SMTP service is not configured on the server.',
    };
  }
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: `"FastGrab Order System" <${process.env.SMTP_USER}>`,
    to: to,
    subject: subject,
    html: body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('--- NODEMAILER ERROR ---', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      success: false,
      error: `Failed to send email: ${errorMessage}`,
    };
  }
}
