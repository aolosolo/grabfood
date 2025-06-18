
'use server';
/**
 * @fileOverview A flow to send an OTP to the admin for verification.
 *
 * - sendAdminOtpEmail - A function that processes and "sends" the OTP email to admin.
 * - AdminOtpEmailInput - The input type for the function.
 * - AdminOtpEmailOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendEmail } from '@/services/email-service';
import type { SendEmailInput, SendEmailOutput } from '@/services/email-service';

const ADMIN_EMAIL = 'abdulwahab10101a@gmail.com';

// Define Schemas for the email tool input and output locally for this flow's tool
const LocalSendEmailInputSchema = z.object({
  to: z.string().email().describe('The recipient email address.'),
  subject: z.string().describe('The subject of the email.'),
  body: z.string().describe('The HTML body of the email.'),
});

const LocalSendEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was "sent" successfully.'),
  messageId: z.string().optional().describe('A simulated message ID.'),
});


const AdminOtpEmailInputSchema = z.object({
  orderId: z.string().describe('The Order ID associated with this OTP.'),
  customerName: z.string().describe("The customer's name for context."),
  otp: z.string().length(6).describe('The 6-digit One-Time Password to be sent.'),
});
export type AdminOtpEmailInput = z.infer<typeof AdminOtpEmailInputSchema>;

const AdminOtpEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the admin OTP email was successfully processed.'),
  message: z.string().describe('A status message.'),
});
export type AdminOtpEmailOutput = z.infer<typeof AdminOtpEmailOutputSchema>;

// Define a tool specifically for this flow, even if it uses the same service
const sendAdminNotificationEmailTool = ai.defineTool(
  {
    name: 'sendAdminOtpNotificationEmailTool',
    description: 'Sends an email to the admin containing an OTP for order verification.',
    inputSchema: LocalSendEmailInputSchema, // Use local schema definition
    outputSchema: LocalSendEmailOutputSchema, // Use local schema definition
  },
  async (input: SendEmailInput) => sendEmail(input) // Type annotation ensures compatibility
);

export async function sendAdminOtpEmail(input: AdminOtpEmailInput): Promise<AdminOtpEmailOutput> {
  return adminOtpEmailFlow(input);
}

const adminOtpEmailFlow = ai.defineFlow(
  {
    name: 'adminOtpEmailFlow',
    inputSchema: AdminOtpEmailInputSchema,
    outputSchema: AdminOtpEmailOutputSchema,
  },
  async (details) => {
    const subject = `OTP for Order Verification - ID: ${details.orderId}`;
    const body = `
      <h1>Order OTP Notification</h1>
      <p>Please use the following One-Time Password to verify the payment for an order placed by <strong>${details.customerName}</strong>.</p>
      <p><strong>Order ID:</strong> ${details.orderId}</p>
      <p><strong>OTP:</strong> <strong style="font-size: 1.2em;">${details.otp}</strong></p>
      <p>This OTP is for admin verification purposes.</p>
    `;

    try {
      const emailResult: SendEmailOutput = await sendAdminNotificationEmailTool({
        to: ADMIN_EMAIL,
        subject,
        body,
      });

      if (emailResult.success) {
        return { success: true, message: 'Admin OTP notification email processed successfully.' };
      } else {
        return { success: false, message: 'Failed to process admin OTP notification email.' };
      }
    } catch (error) {
      console.error('Error in adminOtpEmailFlow sending email:', error);
      return { success: false, message: 'An error occurred while processing the admin OTP email.' };
    }
  }
);
