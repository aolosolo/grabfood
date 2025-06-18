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
import type { SendEmailInput, SendEmailOutput } from '@/services/email-service'; // Import types
import type { OrderDetailsForEmail } from '@/lib/types';

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

const OrderConfirmationEmailInputSchema = z.object({
  orderId: z.string().describe('A unique identifier for the order.'),
  items: z.array(OrderItemSchema).describe('List of items in the order.'),
  customerName: z.string().describe("The customer's name."),
  customerEmail: z.string().email().describe("The customer's email address."),
  customerAddress: z.string().describe("The customer's delivery address."),
  customerPhone: z.string().describe("The customer's phone number."),
  totalAmount: z.number().describe('The total amount of the order.'),
});
export type OrderConfirmationEmailInput = z.infer<typeof OrderConfirmationEmailInputSchema>;

const OrderConfirmationEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email notification was successfully processed.'),
  message: z.string().describe('A status message.'),
});
export type OrderConfirmationEmailOutput = z.infer<typeof OrderConfirmationEmailOutputSchema>;


const sendEmailTool = ai.defineTool(
  {
    name: 'sendEmailTool',
    description: 'Sends an email. Use this to notify admin about a new order.',
    inputSchema: SendEmailInputSchema, // Use locally defined schema
    outputSchema: SendEmailOutputSchema, // Use locally defined schema
  },
  async (input: SendEmailInput) => sendEmail(input) // Type annotation for input
);


export async function sendOrderConfirmationEmail(input: OrderDetailsForEmail): Promise<OrderConfirmationEmailOutput> {
  // Ensure the input matches the schema expected by the flow.
  // OrderDetailsForEmail might be slightly different so we map it.
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
      <p>Please process this order at your earliest convenience.</p>
    `;

    try {
      const emailResult: SendEmailOutput = await sendEmailTool({ // Ensure result type matches
        to: ADMIN_EMAIL,
        subject,
        body,
      });

      if (emailResult.success) {
        return { success: true, message: 'Admin notification email processed successfully.' };
      } else {
        return { success: false, message: 'Failed to process admin notification email.' };
      }
    } catch (error) {
      console.error('Error in orderConfirmationEmailFlow sending email:', error);
      return { success: false, message: 'An error occurred while processing the email notification.' };
    }
  }
);
