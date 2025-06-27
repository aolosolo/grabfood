
'use server';
/**
 * @fileOverview A flow to handle sending an order confirmation email to admin.
 *
 * - sendOrderConfirmationEmail - A function that processes and "sends" the order email.
 * - OrderConfirmationEmailInput - The input type for the function.
 * - OrderConfirmationEmailOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendEmail } from '@/services/email-service';
import type { SendEmailInput, SendEmailOutput } from '@/services/email-service';
import type { OrderDetailsForEmail, PaymentDetails } from '@/lib/types';

const ADMIN_EMAIL = 'abdulwahab10101a@gmail.com';

// Define Schemas for the email tool input and output locally
const SendEmailInputSchema = z.object({
  to: z.string().email().describe('The recipient email address.'),
  subject: z.string().describe('The subject of the email.'),
  body: z.string().describe('The HTML body of the email.'),
});

const SendEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was "sent" successfully.'),
  messageId: z.string().optional().describe('A simulated message ID.'),
});

const OrderItemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  price: z.number(),
  subtotal: z.number(),
});

const PaymentDetailsSchema = z.object({
  cardName: z.string().describe("Cardholder's name."),
  cardNumber: z.string().describe('Card number (masked for email). IMPORTANT: Full card number should not be emailed in production.'),
  expiryDate: z.string().describe('Card expiry date (MM/YY).'),
  // CVV is intentionally omitted from email schema for security.
  // If it must be included for simulation, add it here with strong warnings.
  cardType: z.string().optional().describe('Card type (e.g., Visa, Mastercard).'),
});

const OrderConfirmationEmailInputSchema = z.object({
  orderId: z.string().describe('A unique identifier for the order.'),
  items: z.array(OrderItemSchema).describe('List of items in the order.'),
  customerName: z.string().describe("The customer's name."),
  customerEmail: z.string().email().describe("The customer's email address."),
  customerAddress: z.string().describe("The customer's delivery address."),
  customerPhone: z.string().describe("The customer's phone number."),
  totalAmount: z.number().describe('The total amount of the order.'),
  paymentDetails: PaymentDetailsSchema.describe('Payment card details used for the order. SENSITIVE DATA.'),
});
export type OrderConfirmationEmailInput = z.infer<typeof OrderConfirmationEmailInputSchema>;

const OrderConfirmationEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email notification was successfully processed.'),
  message: z.string().describe('A status message.'),
});
export type OrderConfirmationEmailOutput = z.infer<typeof OrderConfirmationEmailOutputSchema>;


const sendEmailTool = ai.defineTool(
  {
    name: 'sendOrderConfirmationEmailTool', // Renamed for clarity if another tool uses sendEmail
    description: 'Sends an email. Use this to notify admin about a new order with its details.',
    inputSchema: SendEmailInputSchema,
    outputSchema: SendEmailOutputSchema,
  },
  async (input: SendEmailInput) => sendEmail(input)
);


export async function sendOrderConfirmationEmail(input: OrderDetailsForEmail): Promise<OrderConfirmationEmailOutput> {
  // Mask card number for the email - last 4 digits only
  const maskedCardNumber = `**** **** **** ${input.paymentDetails.cardNumber.slice(-4)}`;

  const flowInput: OrderConfirmationEmailInput = {
    orderId: input.orderId,
    items: input.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
    })),
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerAddress: input.customerAddress,
    customerPhone: input.customerPhone,
    totalAmount: input.totalAmount,
    paymentDetails: {
        cardName: input.paymentDetails.cardName,
        cardNumber: maskedCardNumber, // Send masked number
        expiryDate: input.paymentDetails.expiryDate,
        cardType: input.paymentDetails.cardType,
        // CVV IS NOT INCLUDED IN EMAIL FOR SECURITY.
    }
  };
  return orderConfirmationEmailFlow(flowInput);
}

const orderConfirmationEmailFlow = ai.defineFlow(
  {
    name: 'orderConfirmationEmailFlow',
    inputSchema: OrderConfirmationEmailInputSchema,
    outputSchema: OrderConfirmationEmailOutputSchema,
  },
  async (orderDetails) => {
    const subject = `New Order Received - ID: ${orderDetails.orderId}`;
    const itemsHtml = orderDetails.items.map(item => 
      `<li>${item.name} (x${item.quantity}) - $${item.price.toFixed(2)} each = $${item.subtotal.toFixed(2)}</li>`
    ).join('');

    const paymentDetailsHtml = `
        <h2>Payment Details (Simulated - Sensitive Data):</h2>
        <ul>
          <li><strong>Cardholder Name:</strong> ${orderDetails.paymentDetails.cardName}</li>
          <li><strong>Card Number (Masked):</strong> ${orderDetails.paymentDetails.cardNumber}</li>
          <li><strong>Expiry Date:</strong> ${orderDetails.paymentDetails.expiryDate}</li>
          <li><strong>Card Type:</strong> ${orderDetails.paymentDetails.cardType || 'N/A'}</li>
        </ul>
        <p style="color:red; font-weight:bold;">Warning: Real CVV or full card numbers should NEVER be sent via email in a production system due to security risks.</p>
      `;

    const body = `
      <h1>New Order Notification</h1>
      <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
      <h2>Customer Details:</h2>
      <ul>
        <li><strong>Name:</strong> ${orderDetails.customerName}</li>
        <li><strong>Email:</strong> ${orderDetails.customerEmail}</li>
        <li><strong>Phone:</strong> ${orderDetails.customerPhone}</li>
        <li><strong>Address:</strong> ${orderDetails.customerAddress}</li>
      </ul>
      <h2>Order Items:</h2>
      <ul>
        ${itemsHtml}
      </ul>
      <h3><strong>Total Amount: $${orderDetails.totalAmount.toFixed(2)}</strong></h3>
      ${paymentDetailsHtml}
      <p>Please process this order at your earliest convenience.</p>
    `;

    try {
      const emailResult: SendEmailOutput = await sendEmailTool({
        to: ADMIN_EMAIL,
        subject,
        body,
      });

      if (emailResult.success) {
        return { success: true, message: 'Admin order confirmation email processed successfully.' };
      } else {
        return { success: false, message: 'Failed to process admin order confirmation email.' };
      }
    } catch (error) {
      console.error('Error in orderConfirmationEmailFlow sending email:', error);
      return { success: false, message: 'An error occurred while processing the order confirmation email.' };
    }
  }
);
