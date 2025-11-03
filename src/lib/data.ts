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
  { ticker: 'NVDA', name: 'NVIDIA Corporation', shares: 25.0, avgCost: 105.50, currentPrice: 120.91 },
  { ticker: 'MSFT', name: 'Microsoft Corporation', shares: 12.0, avgCost: 400.10, currentPrice: 449.78 },
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
  { ticker: 'V', name: 'Visa Inc.', price: 275.98, change: 1.50, changePercent: 0.55},
  { ticker: 'WMT', name: 'Walmart Inc.', price: 67.50, change: -0.25, changePercent: -0.37}
];

export type CandlestickData = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export const allStocks = [
    { ticker: 'AAPL', name: 'Apple Inc.', price: 214.29 },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 179.63 },
    { ticker: 'TSLA', name: 'Tesla, Inc.', price: 183.01 },
    { ticker: 'AMZN', name: 'Amazon.com, Inc.', price: 185.57 },
    { ticker: 'NVDA', name: 'NVIDIA Corporation', price: 120.91 },
    { ticker: 'MSFT', name: 'Microsoft Corporation', price: 449.78 },
    { ticker: 'META', name: 'Meta Platforms, Inc.', price: 509.84 },
    { ticker: 'JPM', name: 'JPMorgan Chase & Co.', price: 198.88 },
    { ticker: 'V', name: 'Visa Inc.', price: 275.98 },
    { ticker: 'WMT', name: 'Walmart Inc.', price: 67.50 },
    { ticker: 'DIS', name: 'The Walt Disney Company', price: 101.98 },
    { ticker: 'NFLX', name: 'Netflix, Inc.', price: 686.12 },
].filter((value, index, self) =>
  index === self.findIndex((t) => (
    t.ticker === value.ticker
  ))
);
