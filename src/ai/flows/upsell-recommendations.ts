// src/ai/flows/upsell-recommendations.ts
'use server';

/**
 * @fileOverview Provides upsell recommendations based on the current order.
 *
 * - getUpsellRecommendations - A function that provides upsell recommendations.
 * - UpsellRecommendationsInput - The input type for the getUpsellRecommendations function.
 * - UpsellRecommendationsOutput - The return type for the getUpsellRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UpsellRecommendationsInputSchema = z.object({
  selectedItems: z
    .array(z.string())
    .describe('A list of currently selected food items.'),
  availableItems: z
    .array(z.string())
    .describe('A list of all available food items to choose recommendations from.'),
});
export type UpsellRecommendationsInput = z.infer<
  typeof UpsellRecommendationsInputSchema
>;

const UpsellRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('A list of recommended upsell items.'),
});
export type UpsellRecommendationsOutput = z.infer<
  typeof UpsellRecommendationsOutputSchema
>;

export async function getUpsellRecommendations(
  input: UpsellRecommendationsInput
): Promise<UpsellRecommendationsOutput> {
  return upsellRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'upsellRecommendationsPrompt',
  input: {schema: UpsellRecommendationsInputSchema},
  output: {schema: UpsellRecommendationsOutputSchema},
  prompt: `You are a helpful assistant for a fast-food restaurant that recommends upsell items. Your goal is to suggest items that customers are likely to add to their order.

Here is a list of ALL available items on the menu:
{{#each availableItems}}- {{this}}\n{{/each}}

The customer currently has the following items in their cart:
{{#each selectedItems}}- {{this}}\n{{/each}}

From the list of ALL available items, recommend 3 items that are NOT already in the cart.
Prioritize suggesting common add-on items like drinks, fries, or other sides. For example, if the user has a pizza, suggest a cola or garlic bread.
Only provide the names of the items. Format your output as a simple JSON array of strings.
Example output: ["Sparkling Cola", "Golden Fries", "Cheesy Garlic Breadsticks"]`,
});

const upsellRecommendationsFlow = ai.defineFlow(
  {
    name: 'upsellRecommendationsFlow',
    inputSchema: UpsellRecommendationsInputSchema,
    outputSchema: UpsellRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
