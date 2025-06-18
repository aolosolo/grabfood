'use server';
/**
 * @fileOverview A flow to generate a One-Time Password (OTP).
 *
 * - generateOtp - A function that simulates OTP generation.
 * - GenerateOtpInput - The input type for the generateOtp function.
 * - GenerateOtpOutput - The return type for the generateOtp function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const GenerateOtpInputSchema = z.object({
  phoneNumber: z.string().describe('The phone number to which the OTP is ostensibly sent.'),
});
export type GenerateOtpInput = z.infer<typeof GenerateOtpInputSchema>;

const GenerateOtpOutputSchema = z.object({
  otp: z.string().length(6).describe('The 6-digit One-Time Password.'),
});
export type GenerateOtpOutput = z.infer<typeof GenerateOtpOutputSchema>;

export async function generateOtp(input: GenerateOtpInput): Promise<GenerateOtpOutput> {
  // In a real application, you would integrate with an SMS gateway here.
  // For simulation, we just generate a random 6-digit OTP.
  // The input.phoneNumber is logged to simulate association.
  console.log(`Generating OTP for phone number (simulated): ${input.phoneNumber}`);
  return generateOtpFlow(input);
}

const generateOtpFlow = ai.defineFlow(
  {
    name: 'generateOtpFlow',
    inputSchema: GenerateOtpInputSchema,
    outputSchema: GenerateOtpOutputSchema,
  },
  async (input) => {
    // Simulate OTP generation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP for ${input.phoneNumber}: ${otp} (This would normally be sent via SMS)`);
    return { otp };
  }
);
