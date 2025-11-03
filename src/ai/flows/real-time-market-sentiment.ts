'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing real-time market sentiment.
 *
 * The flow uses NLP to analyze financial news and social media, generating a sentiment score.
 * It exports the analyzeMarketSentiment function, the MarketSentimentInput type, and the MarketSentimentOutput type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketSentimentInputSchema = z.object({
  newsData: z
    .string()
    .describe('Aggregated financial news data as a single string.'),
  socialMediaData: z
    .string()
    .describe('Aggregated social media posts related to finance as a single string.'),
});
export type MarketSentimentInput = z.infer<typeof MarketSentimentInputSchema>;

const MarketSentimentOutputSchema = z.object({
  overallSentimentScore: z
    .number()
    .describe(
      'A numerical score representing the overall market sentiment, ranging from -1 (negative) to 1 (positive).' +  
      'A score of 0 indicates neutral sentiment.'
    ),
  positiveKeywords: z.array(z.string()).describe('Keywords associated with positive sentiment.'),
  negativeKeywords: z.array(z.string()).describe('Keywords associated with negative sentiment.'),
});
export type MarketSentimentOutput = z.infer<typeof MarketSentimentOutputSchema>;

export async function analyzeMarketSentiment(
  input: MarketSentimentInput
): Promise<MarketSentimentOutput> {
  return analyzeMarketSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketSentimentPrompt',
  input: {schema: MarketSentimentInputSchema},
  output: {schema: MarketSentimentOutputSchema},
  prompt: `You are an AI assistant that analyzes financial news and social media data to determine the overall market sentiment.

Analyze the following data and provide an overall sentiment score between -1 and 1, where -1 is extremely negative, 0 is neutral, and 1 is extremely positive.
Also extract keywords associated with positive and negative sentiment.

Financial News Data:
{{newsData}}

Social Media Data:
{{socialMediaData}}`,
});

const analyzeMarketSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeMarketSentimentFlow',
    inputSchema: MarketSentimentInputSchema,
    outputSchema: MarketSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
