
import { type NextRequest } from "next/server";

// Maps Yahoo's API response to our simple OHLC format
function mapYahooData(data: any) {
    const timestamps = data?.chart?.result?.[0]?.timestamp;
    const quotes = data?.chart?.result?.[0]?.indicators?.quote?.[0];

    if (!timestamps || !quotes) {
        return [];
    }

    return timestamps.map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toISOString().slice(0, 10),
        open: quotes.open[i],
        high: quotes.high[i],
        low: quotes.low[i],
        close: quotes.close[i],
        volume: quotes.volume[i],
    }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  
  if (!symbol) {
    return new Response(JSON.stringify({ error: "Symbol is required" }), { status: 400 });
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?region=US&lang=en-US&includePrePost=false&interval=1d&useYfid=true&range=1y&corsDomain=finance.yahoo.com&.tsrc=finance`;

  try {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    if (!response.ok) {
       throw new Error(`Yahoo API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data?.chart?.error) {
        throw new Error(data.chart.error.description || 'Yahoo API error');
    }

    const mappedData = mapYahooData(data);
    return new Response(JSON.stringify(mappedData), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: "Failed to fetch from Yahoo Finance", detail: errorMessage }), { status: 500 });
  }
}
