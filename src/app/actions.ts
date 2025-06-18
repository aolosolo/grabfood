'use server';
import { getUpsellRecommendations as getAiUpsellRecommendations, type UpsellRecommendationsInput, type UpsellRecommendationsOutput } from '@/ai/flows/upsell-recommendations';

export async function getUpsellRecommendations(input: UpsellRecommendationsInput): Promise<UpsellRecommendationsOutput> {
  try {
    // Artificial delay to simulate network latency for loading state
    // await new Promise(resolve => setTimeout(resolve, 1500));
    const recommendations = await getAiUpsellRecommendations(input);
    return recommendations;
  } catch (error) {
    console.error("Error fetching upsell recommendations:", error);
    // Return a structured error or empty recommendations
    return { recommendations: [] };
  }
}