
import { config } from 'dotenv';
config();

import '@/ai/flows/upsell-recommendations.ts';
import '@/ai/flows/order-confirmation-flow.ts';
import '@/ai/flows/admin-otp-notification-flow.ts';
