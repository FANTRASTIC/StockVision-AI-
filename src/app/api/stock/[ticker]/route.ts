import { type NextRequest } from "next/server";

// Example: in-memory cache (for a simple demo)
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to calculate RSI
const calculateRSI = (data: any[], period = 14) => {
  if (!data || data.length < period) return [];

  let gains: number[] = [];
  let losses: number[] = [];
  const rsiData = [];

  for (let i = 0; i < data.length; i++) {
      const price = data[i].close;
      if (i > 0) {
          const change = price - data[i - 1].close;
          gains.push(change > 0 ? change : 0);
          losses.push(change < 0 ? -change : 0);
      }

      if (i >= period) {
          const gainSlice = gains.slice(i - period, i);
          const lossSlice = losses.slice(i - period, i);
          
          let avgGain = gainSlice.reduce((a, b) => a + b, 0) / period;
          let avgLoss = lossSlice.reduce((a, b) => a + b, 0) / period;

          if (rsiData.length > 0) {
              avgGain = (rsiData[rsiData.length-1].avgGain * (period-1) + (gains.at(-1) ?? 0)) / period;
              avgLoss = (rsiData[rsiData.length-1].avgLoss * (period-1) + (losses.at(-1) ?? 0)) / period;
          }

          const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
          const rsi = 100 - (100 / (1 + rs));
          rsiData.push({ date: data[i].date, rsi: parseFloat(rsi.toFixed(2)), avgGain, avgLoss });
      } else {
          rsiData.push({ date: data[i].date, rsi: null, avgGain: 0, avgLoss: 0 });
      }
  }
  return rsiData.map(({date, rsi}) => ({date, rsi}));
};


// Helper function to calculate EMA
const calculateEMA = (data: number[], period: number) => {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  const emaArray: (number | null)[] = new Array(data.length).fill(null);
  
  let sum = 0;
  for(let i=0; i < period; i++) {
    sum += data[i];
  }
  emaArray[period-1] = sum / period;

  // Subsequent EMAs
  for (let i = period; i < data.length; i++) {
    const prevEma = emaArray[i - 1];
    if (prevEma !== null) {
      emaArray[i] = data[i] * k + prevEma * (1 - k);
    }
  }
  return emaArray;
};

// Helper function to calculate MACD
const calculateMACD = (data: any[], shortPeriod = 12, longPeriod = 26, signalPeriod = 9) => {
    if (data.length < longPeriod) return [];
    const closes = data.map(d => d.close);
    const emaShort = calculateEMA(closes, shortPeriod);
    const emaLong = calculateEMA(closes, longPeriod);
    
    if (!emaShort || !emaLong) return [];
    
    const macdLine = emaShort.map((val, i) => (val !== null && emaLong[i] !== null) ? val - emaLong[i]! : null);
    
    const macdValuesOnly = macdLine.filter((v): v is number => v !== null);
    if(macdValuesOnly.length < signalPeriod) return [];

    const signalLine = calculateEMA(macdValuesOnly, signalPeriod);
    
    // Align signal line with the original data
    const signalLinePadding = new Array(macdLine.length - signalLine.length).fill(null);
    const alignedSignalLine = signalLinePadding.concat(signalLine);

    const histogram = macdLine.map((val, i) => (val !== null && alignedSignalLine[i] !== null) ? val - alignedSignalLine[i]! : null);

    return data.map((d, i) => ({
        date: d.date,
        macd: macdLine[i] !== null ? parseFloat(macdLine[i]!.toFixed(2)) : null,
        signal: alignedSignalLine[i] !== null ? parseFloat(alignedSignalLine[i]!.toFixed(2)) : null,
        histogram: histogram[i] !== null ? parseFloat(histogram[i]!.toFixed(2)) : null,
    }));
};


export async function GET(req: NextRequest, { params }: { params: { ticker: string } }) {
  const ticker = params.ticker;
  const { searchParams } = new URL(req.url);
  const outputSize = searchParams.get("outputSize") || 'compact';

  if (!ticker) {
    return new Response(JSON.stringify({ error: "Ticker symbol is required" }), { status: 400 });
  }

  const apiKey = process.env.ALPHAVANTAGE_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key is not configured on the server" }), { status: 500 });
  }

  const cacheKey = `${ticker.toUpperCase()}_${outputSize}`;
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return new Response(JSON.stringify({ data: cached.data, fromCache: true }), { status: 200 });
  }

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&outputsize=${outputSize}&apikey=${apiKey}`;

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
      return new Response(JSON.stringify({ error: "Rate limit exceeded", detail: data["Note"] }), { status: 429 });
    }
     const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      return new Response(JSON.stringify({ error: "No time series data found in the response from Alpha Vantage." }), { status: 500 });
    }

    const candlestickData = Object.keys(timeSeries).map(date => {
        const dayData = timeSeries[date];
        return {
            date: date,
            open: parseFloat(dayData['1. open']),
            high: parseFloat(dayData['2. high']),
            low: parseFloat(dayData['3. low']),
            close: parseFloat(dayData['4. close']),
        };
    }).reverse(); // Reverse to have dates in ascending order

    const rsiData = calculateRSI(candlestickData);
    const macdData = calculateMACD(candlestickData);

    const combinedData = candlestickData.map(d => {
        const rsi = rsiData.find(r => r.date === d.date)?.rsi ?? null;
        const macd = macdData.find(m => m.date === d.date);

        return {
            ...d,
            rsi,
            macd: macd?.macd ?? null,
            signal: macd?.signal ?? null,
            histogram: macd?.histogram ?? null,
        };
    });

    cache.set(cacheKey, { timestamp: now, data: combinedData });
    return new Response(JSON.stringify({ data: combinedData, fromCache: false }), { status: 200 });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: "Failed to fetch from Alpha Vantage", detail: errorMessage }), { status: 500 });
  }
}
