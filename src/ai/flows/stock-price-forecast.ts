'use server';

/**
 * @fileOverview Stock price forecast flow.
 *
 * - stockPriceForecast - A function that generates a 7-day stock price forecast.
 * - StockPriceForecastInput - The input type for the stockPriceForecast function.
 * - StockPriceForecastOutput - The return type for the stockPriceForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StockPriceForecastInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the stock.'),
});
export type StockPriceForecastInput = z.infer<typeof StockPriceForecastInputSchema>;

const StockPriceForecastOutputSchema = z.object({
  forecast: z.array(
    z.object({
      date: z.string().describe('The date of the forecast.'),
      price: z.number().describe('The predicted price for the stock.'),
    })
  ).describe('A 7-day stock price forecast.'),
  trend: z.enum(['Up', 'Down', 'Sideways']).describe('The predicted trend for the stock.'),
  confidenceScore: z.number().describe('The confidence score for the prediction (0-1).'),
});
export type StockPriceForecastOutput = z.infer<typeof StockPriceForecastOutputSchema>;

export async function stockPriceForecast(input: StockPriceForecastInput): Promise<StockPriceForecastOutput> {
  return stockPriceForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stockPriceForecastPrompt',
  input: {schema: StockPriceForecastInputSchema},
  output: {schema: StockPriceForecastOutputSchema},
  prompt: `You are an AI that predicts the stock price for a given ticker symbol for the next 7 days.

  Return a JSON object containing the forecast, trend, and confidence score.

  Ticker Symbol: {{{ticker}}}
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const stockPriceForecastFlow = ai.defineFlow(
  {
    name: 'stockPriceForecastFlow',
    inputSchema: StockPriceForecastInputSchema,
    outputSchema: StockPriceForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
