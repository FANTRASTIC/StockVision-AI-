'use client';

type CombinedData = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    rsi: number | null;
    macd: number | null;
    signal: number | null;
    histogram: number | null;
};

export async function getDailyStockData(ticker: string, range: string): Promise<CombinedData[]> {
    const response = await fetch(`/api/stock/${ticker}?range=${range}`);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(errorData.error || `Failed to fetch data for ${ticker}`);
    }

    const result = await response.json();
    return result.data;
}
