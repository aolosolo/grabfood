'use server';
/**
 * @fileOverview Email sending service (simulated).
 *
 * - sendEmail - A function that simulates sending an email.
 */

import { z } from 'genkit';

// Schemas are defined here for type inference and internal use if needed, but not exported.
const SendEmailInputSchema = z.object({
  to: z.string().email().describe('The recipient email address.'),
  subject: z.string().describe('The subject of the email.'),
  body: z.string().describe('The HTML body of the email.'),
});
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

const SendEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was "sent" successfully.'),
  messageId: z.string().optional().describe('A simulated message ID.'),
});
export type SendEmailOutput = z.infer<typeof SendEmailOutputSchema>;

/**
 * Simulates sending an email. In a real application, this function would
 * use a library like Nodemailer and actual SMTP credentials to send an email.
 * For this prototype, it logs the email details to the console.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailOutput> {
  console.log('--- SIMULATING EMAIL SEND ---');
  console.log(`To: ${input.to}`);
  console.log(`Subject: ${input.subject}`);
  console.log('Body:');
  console.log(input.body);
  console.log('--- END SIMULATED EMAIL ---');

  // Simulate a successful email send
  return {
    success: true,
    messageId: `simulated-${Date.now()}`,
  };
}
