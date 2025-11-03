'use server';

/**
 * @fileOverview This file defines a Genkit tool for fetching daily stock data.
 * This tool allows the AI to get historical price data for a given stock ticker.
 */
import { ai } from '@/ai/genkit';
import { getDailyStockData } from '@/lib/services/alpha-vantage';
import { z } from 'genkit';

export const getStockDataTool = ai.defineTool(
  {
    name: 'getDailyStockData',
    description: 'Get daily time series (date, open, high, low, close) for a stock.',
    inputSchema: z.object({
      ticker: z.string().describe('The stock ticker symbol, e.g., AAPL.'),
      outputSize: z.enum(['compact', 'full']).default('compact').optional().describe("By default, outputsize=compact. 'compact' returns only the latest 100 data points; 'full' returns the full-length time series. Default is 'compact'."),
    }),
    outputSchema: z.array(z.object({
        date: z.string(),
        open: z.number(),
        high: z.number(),
        low: z.number(),
        close: z.number(),
        rsi: z.number().nullable(),
        macd: z.number().nullable(),
        signal: z.number().nullable(),
        histogram: z.number().nullable(),
    })),
  },
  async (input) => {
    console.log(`Fetching daily stock data for ${input.ticker}`);
    return getDailyStockData(input.ticker, input.outputSize);
  }
);
