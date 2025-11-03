'use server';

/**
 * @fileOverview Provides AI-driven Stop Loss and Take Profit recommendations based on historical volatility and market sentiment.
 *
 * - getRiskManagementRecommendations - A function that provides risk management recommendations.
 * - RiskManagementRecommendationsInput - The input type for the getRiskManagementRecommendations function.
 * - RiskManagementRecommendationsOutput - The return type for the getRiskManagementRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RiskManagementRecommendationsInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the stock.'),
  historicalVolatility: z.number().describe('The historical volatility of the stock.'),
  marketSentimentScore: z.number().describe('The current market sentiment score for the stock.'),
  currentPrice: z.number().describe('The current price of the stock.'),
});
export type RiskManagementRecommendationsInput = z.infer<
  typeof RiskManagementRecommendationsInputSchema
>;

const RiskManagementRecommendationsOutputSchema = z.object({
  stopLossRecommendation: z
    .number()
    .describe('The recommended stop loss price for the stock.'),
  takeProfitRecommendation: z
    .number()
    .describe('The recommended take profit price for the stock.'),
  rationale: z.string().describe('The rationale behind the recommendations.'),
});
export type RiskManagementRecommendationsOutput = z.infer<
  typeof RiskManagementRecommendationsOutputSchema
>;

export async function getRiskManagementRecommendations(
  input: RiskManagementRecommendationsInput
): Promise<RiskManagementRecommendationsOutput> {
  return riskManagementRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'riskManagementRecommendationsPrompt',
  input: {schema: RiskManagementRecommendationsInputSchema},
  output: {schema: RiskManagementRecommendationsOutputSchema},
  prompt: `You are an AI assistant designed to provide risk management recommendations for stocks.

  Based on the historical volatility, market sentiment, and current price of the stock, provide a stop loss and take profit recommendation.

  Consider the following information:
  - Ticker Symbol: {{{ticker}}}
  - Historical Volatility: {{{historicalVolatility}}}
  - Market Sentiment Score: {{{marketSentimentScore}}}
  - Current Price: {{{currentPrice}}}

  Provide a rationale for your recommendations.

  Here's an example of how you could format the answer:
  {
    "stopLossRecommendation": 145.00,
    "takeProfitRecommendation": 160.00,
    "rationale": "Based on the historical volatility and positive market sentiment, a stop loss at $145.00 and a take profit at $160.00 is recommended."
  }
  `,
});

const riskManagementRecommendationsFlow = ai.defineFlow(
  {
    name: 'riskManagementRecommendationsFlow',
    inputSchema: RiskManagementRecommendationsInputSchema,
    outputSchema: RiskManagementRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
