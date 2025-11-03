
import { type NextRequest } from "next/server";

const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

function mapAlphaVantageData(data: any) {
    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
        return [];
    }

    // Sort dates ascending
    return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['6. volume'], 10)
    })).reverse();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  
  if (!symbol) {
    return new Response(JSON.stringify({ error: "Symbol is required" }), { status: 400 });
  }

  const apiKey = process.env.ALPHAVANTAGE_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Alpha Vantage API key is not configured on the server." }), { status: 500 });
  }

  const cacheKey = symbol.toUpperCase();
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return new Response(JSON.stringify(cached.data), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', 'X-Cache-Hit': 'true' } 
    });
  }

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Alpha Vantage API request failed with status: ${response.status}`);
    }
    const data = await response.json();

    if (data["Error Message"]) {
      return new Response(JSON.stringify({ error: "Invalid symbol or API error from Alpha Vantage", detail: data["Error Message"] }), { status: 400 });
    }
    if (data["Note"]) {
      // This indicates a rate limit error
      return new Response(JSON.stringify({ error: "Rate limit exceeded for Alpha Vantage API.", detail: data["Note"] }), { status: 429 });
    }

    const mappedData = mapAlphaVantageData(data);
    cache.set(cacheKey, { timestamp: now, data: mappedData });

    return new Response(JSON.stringify(mappedData), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: "Failed to fetch from Alpha Vantage", detail: errorMessage }), { status: 500 });
  }
}
