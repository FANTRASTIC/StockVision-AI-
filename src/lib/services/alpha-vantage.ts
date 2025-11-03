'use server';
import { CandlestickData } from '@/lib/data';

const BASE_URL = 'https://www.alphavantage.co/query';

// Helper function to calculate RSI
const calculateRSI = (data: CandlestickData[], period = 14) => {
  if (!data || data.length < period) return [];

  const rsiData: { date: string; rsi: number | null }[] = [];
  let gains: number[] = [];
  let losses: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i > 0) {
      const change = data[i].close - data[i - 1].close;
      if (change > 0) {
        gains.push(change);
        losses.push(0);
      } else {
        gains.push(0);
        losses.push(Math.abs(change));
      }

      if (i >= period) {
        // Use Wilder's smoothing for RSI
        let avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
        let avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;

        if (rsiData.length > 0 && rsiData[rsiData.length-1].rsi !== null) {
            const lastAvgGain = gains.slice(i - period -1, i-1).reduce((a, b) => a + b, 0) / period;
            const lastAvgLoss = losses.slice(i - period -1, i-1).reduce((a, b) => a + b, 0) / period;
            avgGain = (lastAvgGain * (period -1) + (change > 0 ? change : 0)) / period;
            avgLoss = (lastAvgLoss * (period -1) + (change < 0 ? Math.abs(change) : 0)) / period;
        }

        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        rsiData.push({ date: data[i].date, rsi: parseFloat(rsi.toFixed(2)) });
      } else {
        rsiData.push({ date: data[i].date, rsi: null });
      }
    } else {
      rsiData.push({ date: data[i].date, rsi: null });
    }
  }
  return rsiData;
};


// Helper function to calculate EMA
const calculateEMA = (data: number[], period: number) => {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  const emaArray: (number | null)[] = [];
  // First EMA is a simple average
  let sum = 0;
  for(let i=0; i< period; i++) {
    sum += data[i];
    emaArray.push(null);
  }
  emaArray[period-1] = sum / period;

  // Subsequent EMAs
  for (let i = period; i < data.length; i++) {
    const prevEma = emaArray[i - 1];
    if (prevEma !== null) {
      emaArray.push(data[i] * k + prevEma * (1 - k));
    } else {
      emaArray.push(null); // Should not happen after first EMA is calculated
    }
  }
  return emaArray;
};

// Helper function to calculate MACD
const calculateMACD = (data: CandlestickData[], shortPeriod = 12, longPeriod = 26, signalPeriod = 9) => {
    if (data.length < longPeriod) return [];
    const closes = data.map(d => d.close);
    const emaShort = calculateEMA(closes, shortPeriod);
    const emaLong = calculateEMA(closes, longPeriod);
    
    const macdLine = emaShort.map((val, i) => (val !== null && emaLong[i] !== null) ? val! - emaLong[i]! : null);
    const signalLine = calculateEMA(macdLine.filter(v => v !== null) as number[], signalPeriod);

    // Align signal line and histogram with the original data length
    const alignedSignalLine = Array(macdLine.length - signalLine.length).fill(null).concat(signalLine);
    const histogram = macdLine.map((val, i) => (val !== null && alignedSignalLine[i] !== null) ? val! - alignedSignalLine[i]! : null);

    return data.map((d, i) => ({
        date: d.date,
        macd: macdLine[i] !== null ? parseFloat(macdLine[i]!.toFixed(2)) : null,
        signal: alignedSignalLine[i] !== null ? parseFloat(alignedSignalLine[i]!.toFixed(2)) : null,
        histogram: histogram[i] !== null ? parseFloat(histogram[i]!.toFixed(2)) : null,
    }));
};

export async function getDailyStockData(ticker: string, outputSize: 'compact' | 'full' = 'compact') {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
        throw new Error('Alpha Vantage API key not found in environment variables.');
    }

    const url = `${BASE_URL}?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&outputsize=${outputSize}&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data['Error Message']) {
            throw new Error(`API Error: ${data['Error Message']}`);
        }
        if (data['Note']) {
             console.warn(`API Note: ${data['Note']}`);
        }


        const timeSeries = data['Time Series (Daily)'];
        if (!timeSeries) {
            throw new Error('No time series data found in the response.');
        }

        const candlestickData: CandlestickData[] = Object.keys(timeSeries).map(date => {
            const dayData = timeSeries[date];
            return {
                date: date,
                open: parseFloat(dayData['1. open']),
                high: parseFloat(dayData['2. high']),
                low: parseFloat(dayData['3. low']),
                close: parseFloat(dayData['4. close']),
            };
        }).reverse(); // Reverse to have dates in ascending order for calculations

        const rsiData = calculateRSI(candlestickData);
        const macdData = calculateMACD(candlestickData);

        // Combine all data
        const combinedData = candlestickData.map((d, i) => {
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

        return combinedData;

    } catch (error) {
        console.error('Failed to fetch daily stock data:', error);
        throw error;
    }
}
