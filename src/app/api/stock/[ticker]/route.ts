
import { type NextRequest } from "next/server";

const memoryCache = new Map<string, { t: number; data: any }>();
const ONE_MIN = 60_000; // 1 minute cache

// Helper to calculate RSI
const calculateRSI = (data: any[], period = 14) => {
    if (!data || data.length < period) return data.map(d => ({ ...d, rsi: null }));

    let gains: number[] = [];
    let losses: number[] = [];
    const rsiData: ({ date: string; rsi: number | null; avgGain: number; avgLoss: number })[] = [];

    for (let i = 0; i < data.length; i++) {
        const price = data[i].close;
        if (i > 0) {
            const change = price - data[i - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? -change : 0);
        }

        if (i >= period - 1) {
            const currentGain = gains[i - 1] ?? 0;
            const currentLoss = losses[i - 1] ?? 0;

            const prevAvgGain = rsiData[i - 1]?.avgGain;
            const prevAvgLoss = rsiData[i - 1]?.avgLoss;
            
            let avgGain, avgLoss;

            if (prevAvgGain !== undefined) {
                 avgGain = (prevAvgGain * (period-1) + currentGain) / period;
                 avgLoss = (prevAvgLoss * (period-1) + currentLoss) / period;
            } else {
                 const gainSlice = gains.slice(i - period + 1, i + 1);
                 const lossSlice = losses.slice(i - period + 1, i + 1);
                 avgGain = gainSlice.reduce((a, b) => a + b, 0) / period;
                 avgLoss = lossSlice.reduce((a, b) => a + b, 0) / period;
            }
            
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));
            rsiData.push({ date: data[i].date, rsi: parseFloat(rsi.toFixed(2)), avgGain, avgLoss });
        } else {
            rsiData.push({ date: data[i].date, rsi: null, avgGain: 0, avgLoss: 0 });
        }
    }

    return data.map((d, i) => ({ ...d, rsi: rsiData[i]?.rsi ?? null }));
};

const calculateEMA = (data: number[], period: number) => {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  const emaArray: (number | null)[] = new Array(data.length).fill(null);
  
  let sum = 0;
  for(let i=0; i < period; i++) { sum += data[i]; }
  emaArray[period-1] = sum / period;

  for (let i = period; i < data.length; i++) {
    const prevEma = emaArray[i - 1];
    if (prevEma !== null) {
      emaArray[i] = data[i] * k + prevEma * (1 - k);
    }
  }
  return emaArray;
};

const calculateMACD = (data: any[], shortPeriod = 12, longPeriod = 26, signalPeriod = 9) => {
    if (data.length < longPeriod) return data.map(d => ({ ...d, macd: null, signal: null, histogram: null }));
    const closes = data.map(d => d.close);
    const emaShort = calculateEMA(closes, shortPeriod);
    const emaLong = calculateEMA(closes, longPeriod);
    
    if (!emaShort || !emaLong) return data.map(d => ({ ...d, macd: null, signal: null, histogram: null }));
    
    const macdLine = emaShort.map((val, i) => (val !== null && emaLong[i] !== null) ? val - emaLong[i]! : null);
    
    const macdValuesOnly = macdLine.filter((v): v is number => v !== null);
    if(macdValuesOnly.length < signalPeriod) return data.map(d => ({ ...d, macd: null, signal: null, histogram: null }));

    const signalLine = calculateEMA(macdValuesOnly, signalPeriod);
    
    const signalLinePadding = new Array(macdLine.length - (signalLine?.length ?? 0)).fill(null);
    const alignedSignalLine = signalLinePadding.concat(signalLine ?? []);

    const histogram = macdLine.map((val, i) => (val !== null && alignedSignalLine[i] !== null) ? val - alignedSignalLine[i]! : null);

    return data.map((d, i) => ({
        ...d,
        macd: macdLine[i] !== null ? parseFloat(macdLine[i]!.toFixed(2)) : null,
        signal: alignedSignalLine[i] !== null ? parseFloat(alignedSignalLine[i]!.toFixed(2)) : null,
        histogram: histogram[i] !== null ? parseFloat(histogram[i]!.toFixed(2)) : null,
    }));
};

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

const processYahooData = (yahooData: any[]) => {
    const withRSI = calculateRSI(yahooData);
    const withMACD = calculateMACD(withRSI);
    return withMACD;
};

export async function GET(req: NextRequest, { params }: { params: { ticker: string } }) {
  const ticker = params.ticker;
  
  if (!ticker) {
    return new Response(JSON.stringify({ error: "Ticker symbol is required" }), { status: 400 });
  }
  
  const cacheKey = `${ticker.toUpperCase()}_YAHOO`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.t < ONE_MIN) {
    return Response.json({ data: cached.data, fromCache: true });
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?region=US&lang=en-US&includePrePost=false&interval=1d&useYfid=true&range=5y&corsDomain=finance.yahoo.com&.tsrc=finance`;

  try {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    if (!response.ok) {
       throw new Error(`Yahoo API responded with status: ${response.status}`);
    }

    const json = await response.json();
    
    if (json?.chart?.error) {
        throw new Error(json.chart.error.description || 'Yahoo API error');
    }
    
    const mappedData = mapYahooData(json);
    const processedData = processYahooData(mappedData);
    
    memoryCache.set(cacheKey, { t: Date.now(), data: processedData });
    return Response.json({ data: processedData });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return Response.json({ ok: false, error: "network", detail: errorMessage }, { status: 500 });
  }
}
