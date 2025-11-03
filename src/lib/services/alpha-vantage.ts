'use server';
import { CandlestickData } from '@/lib/data';

// This function now fetches data from our own API route, not directly from Alpha Vantage.
export async function getDailyStockData(ticker: string, outputSize: 'compact' | 'full' = 'compact') {
  try {
    // In a real app, you would get the base URL from an environment variable.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const response = await fetch(`${baseUrl}/api/stock/${ticker}?outputSize=${outputSize}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to fetch daily stock data via internal API:', error);
    throw error;
  }
}
