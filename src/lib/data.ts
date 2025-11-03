export type PortfolioHolding = {
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
};

export const portfolioHoldings: PortfolioHolding[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', shares: 10.5, avgCost: 170.12, currentPrice: 214.29 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', shares: 5.2, avgCost: 155.6, currentPrice: 179.63 },
  { ticker: 'TSLA', name: 'Tesla, Inc.', shares: 15.0, avgCost: 200.45, currentPrice: 183.01 },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', shares: 7.8, avgCost: 180.22, currentPrice: 185.57 },
];

export type WatchlistItem = {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

export const watchlist: WatchlistItem[] = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation', price: 120.91, change: -5.77, changePercent: -4.55 },
  { ticker: 'MSFT', name: 'Microsoft Corporation', price: 449.78, change: 2.11, changePercent: 0.47 },
  { ticker: 'META', name: 'Meta Platforms, Inc.', price: 509.84, change: 11.23, changePercent: 2.25 },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', price: 198.88, change: -1.02, changePercent: -0.51 },
];

export type CandlestickData = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

// Simple pseudo-random number generator to ensure consistency between server and client
const seededRandom = (seed: number) => {
  let s = Math.sin(seed) * 10000;
  return s - Math.floor(s);
};


// Generate more realistic random walk data
const generateCandlestickData = (count: number, startDate: Date, initialPrice: number): CandlestickData[] => {
  const data: CandlestickData[] = [];
  let currentDate = new Date(startDate);
  let lastClose = initialPrice;

  for (let i = 0; i < count; i++) {
    const seed = i + 1;
    const open = parseFloat((lastClose * (1 + (seededRandom(seed * 10) - 0.49) * 0.05)).toFixed(2));
    const close = parseFloat((open * (1 + (seededRandom(seed * 20) - 0.5) * 0.06)).toFixed(2));
    const high = parseFloat(Math.max(open, close, open * (1 + seededRandom(seed * 30) * 0.03), close * (1 + seededRandom(seed * 40) * 0.02)).toFixed(2));
    const low = parseFloat(Math.min(open, close, open * (1 - seededRandom(seed * 50) * 0.03), close * (1 - seededRandom(seed * 60) * 0.02)).toFixed(2));
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
    });

    lastClose = close;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return data;
};

export const candlestickData: CandlestickData[] = generateCandlestickData(100, new Date('2023-01-01'), 150);

// Generate RSI and MACD data based on candlestick data
const calculateRSI = (data: CandlestickData[], period = 14) => {
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
        const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
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

const calculateEMA = (data: number[], period: number) => {
  const k = 2 / (period + 1);
  const emaArray = [data[0]];
  for (let i = 1; i < data.length; i++) {
    emaArray.push(data[i] * k + emaArray[i - 1] * (1 - k));
  }
  return emaArray;
};

const calculateMACD = (data: CandlestickData[], shortPeriod = 12, longPeriod = 26, signalPeriod = 9) => {
  const closes = data.map(d => d.close);
  const emaShort = calculateEMA(closes, shortPeriod);
  const emaLong = calculateEMA(closes, longPeriod);
  
  const macdLine = emaShort.map((val, i) => val - emaLong[i]);
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram = macdLine.map((val, i) => val - signalLine[i]);

  return data.map((d, i) => ({
    date: d.date,
    macd: parseFloat(macdLine[i].toFixed(2)),
    signal: parseFloat(signalLine[i].toFixed(2)),
    histogram: parseFloat(histogram[i].toFixed(2)),
  }));
};

export const rsiData = calculateRSI(candlestickData);
export const macdData = calculateMACD(candlestickData);

export const combinedChartData = candlestickData.map((d, i) => ({
  ...d,
  ...rsiData[i],
  ...macdData[i],
}));
