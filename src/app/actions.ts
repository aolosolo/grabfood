
'use server';
import { getUpsellRecommendations as getAiUpsellRecommendations, type UpsellRecommendationsInput, type UpsellRecommendationsOutput } from '@/ai/flows/upsell-recommendations';
import { sendOrderConfirmationEmail as sendAiOrderConfirmationEmail } from '@/ai/flows/order-confirmation-flow';
import type { OrderDetailsForEmail } from '@/lib/types';
import { sendAdminOtpEmail as sendAiAdminOtpEmail, type AdminOtpEmailInput, type AdminOtpEmailOutput } from '@/ai/flows/admin-otp-notification-flow';


export async function getUpsellRecommendations(input: UpsellRecommendationsInput): Promise<UpsellRecommendationsOutput> {
  try {
    const recommendations = await getAiUpsellRecommendations(input);
    return recommendations;
  } catch (error) {
    console.error("Error fetching upsell recommendations:", error);
    return { recommendations: [] };
  }
}

export async function sendOrderEmailAction(orderDetails: OrderDetailsForEmail): Promise<{ success: boolean; message: string }> {
  try {
    const result = await sendAiOrderConfirmationEmail(orderDetails);
    return result;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return { success: false, message: 'Failed to send order confirmation email.' };
  }
}

export async function sendAdminOtpEmailAction(input: AdminOtpEmailInput): Promise<AdminOtpEmailOutput> {
  try {
    const result = await sendAiAdminOtpEmail(input);
    return result;
  } catch (error) {
    console.error("Error sending admin OTP email:", error);
    return { success: false, message: 'Failed to send admin OTP email.' };
  }
}
