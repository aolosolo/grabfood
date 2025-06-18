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
  prompt: `You are a helpful assistant that recommends upsell items based on the customer's current order.

  Given the following list of items in the customer's order:
  {{#each selectedItems}}- {{this}}\n{{/each}}

  Recommend 3 additional items that would complement their order. Only provide the names of the items. The items should maximize revenue.
  Do not repeat the items that are already in the order.
  Format your output as a simple JSON array of strings.`,
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
