
'use server';
import { getUpsellRecommendations as getAiUpsellRecommendations, type UpsellRecommendationsInput, type UpsellRecommendationsOutput } from '@/ai/flows/upsell-recommendations';
import { sendOrderConfirmationEmail as sendAiOrderConfirmationEmail } from '@/ai/flows/order-confirmation-flow';
import type { OrderDetailsForEmail, Order } from '@/lib/types';
import { sendAdminOtpEmail as sendAiAdminOtpEmail, type AdminOtpEmailInput, type AdminOtpEmailOutput } from '@/ai/flows/admin-otp-notification-flow';

import { db } from '@/lib/firebase';
import { collection, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function getUpsellRecommendations(input: UpsellRecommendationsInput): Promise<UpsellRecommendationsOutput> {
  try {
    const recommendations = await getAiUpsellRecommendations(input);
    return recommendations;
  } catch (error) {
    console.error("Error fetching upsell recommendations:", error);
    return { recommendations: [] };
  }
}

/**
 * Checks if the necessary SMTP environment variables are configured.
 */
function areEmailCredentialsConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendOrderEmailAction(orderDetails: OrderDetailsForEmail): Promise<{ success: boolean; message: string }> {
  if (!areEmailCredentialsConfigured()) {
    console.log("SMTP not configured. Skipping order confirmation email.");
    // Return success to avoid blocking the user flow, but indicate it was skipped.
    return { success: true, message: 'Email service not configured.' };
  }
  
  try {
    const result = await sendAiOrderConfirmationEmail(orderDetails);
    return result;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return { success: false, message: 'Failed to send order confirmation email.' };
  }
}

export async function sendAdminOtpEmailAction(input: AdminOtpEmailInput): Promise<AdminOtpEmailOutput> {
  if (!areEmailCredentialsConfigured()) {
    console.log("SMTP not configured. Skipping admin OTP email.");
    return { success: true, message: 'Email service not configured.' };
  }

  try {
    const result = await sendAiAdminOtpEmail(input);
    return result;
  } catch (error) {
    console.error("Error sending admin OTP email:", error);
    return { success: false, message: 'Failed to send admin OTP email.' };
  }
}

/**
 * Saves a new order to Firestore.
 */
export async function saveOrderAction(order: Omit<Order, 'createdAt'>): Promise<{ success: boolean; message: string }> {
  try {
    const orderWithTimestamp = {
      ...order,
      createdAt: serverTimestamp(), // Use server-side timestamp
    };
    await setDoc(doc(db, "orders", order.orderId), orderWithTimestamp);
    return { success: true, message: 'Order saved successfully.' };
  } catch (error) {
    console.error("Error saving order to Firestore:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Failed to save order: ${errorMessage}` };
  }
}

/**
 * Updates an existing order in Firestore with the OTP.
 */
export async function updateOrderWithOtpAction(orderId: string, otp: string): Promise<{ success: boolean; message: string }> {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      otp: otp,
      status: 'completed'
    });
    return { success: true, message: 'Order updated with OTP.' };
  } catch (error) {
    console.error("Error updating order with OTP:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Failed to update order: ${errorMessage}` };
  }
}
