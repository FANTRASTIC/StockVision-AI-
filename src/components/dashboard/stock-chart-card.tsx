
'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter
} from '@/components/ui/card';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from 'recharts';
import { allStocks } from '@/lib/data';
import { ChartTooltipContent, ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn, toNum } from '@/lib/utils';
import { getDailyStockData } from '@/lib/services/alpha-vantage';

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

const chartConfig = {
  close: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
  rsi: {
    label: "RSI",
    color: "hsl(var(--chart-2))",
  },
  macd: {
    label: "MACD",
    color: "hsl(var(--chart-3))",
  },
  signal: {
    label: "Signal",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const timeRanges = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'Max'];

interface StockChartCardProps {
    selectedTicker: string;
    onTickerSelect: (ticker: string) => void;
    onPriceUpdate: (ticker: string, newPrice: number) => void;
}

export function StockChartCard({ selectedTicker, onTickerSelect, onPriceUpdate }: StockChartCardProps) {
    const [chartData, setChartData] = useState<CombinedData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [apiError, setApiError] = useState<string | null>(null);
    const [activeRange, setActiveRange] = useState('1M');
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        // This will only run on the client, after the component has mounted.
        setCurrentDate(new Date().toLocaleString());
    }, []);

    const selectedStock = useMemo(() => allStocks.find(s => s.ticker === selectedTicker)!, [selectedTicker]);

    const fetchData = useCallback(async (ticker: string, range: string) => {
        setIsLoading(true);
        setApiError(null);
        setChartData([]); // Clear previous data
        try {
            const data = await getDailyStockData(ticker, range);
            if (data && data.length > 0) {
              setChartData(data);
              const latestPrice = data[data.length - 1].close;
              onPriceUpdate(ticker, latestPrice);
            } else {
               throw new Error('No data received from API.');
            }
        } catch (error: any) {
            console.error(error);
            setApiError(error.message);
            toast({
                title: 'Error Fetching Stock Data',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast, onPriceUpdate]);


    useEffect(() => {
        fetchData(selectedTicker, activeRange);
    }, [selectedTicker, activeRange, fetchData]);
    
    const { price, priceChange, priceChangePercent, afterHoursPrice, afterHoursChange, afterHoursChangePercent } = useMemo(() => {
        if (!chartData || chartData.length < 2) {
            const lastPrice = chartData?.[0]?.close ?? 0;
            return {
                price: lastPrice,
                priceChange: 0,
                priceChangePercent: 0,
                afterHoursPrice: lastPrice,
                afterHoursChange: 0,
                afterHoursChangePercent: 0,
            };
        }
        
        const last = chartData[chartData.length - 1]!;
        const secondLast = chartData[chartData.length - 2]!;
        
        const priceNum = toNum(last.close);
        const priceChangeNum = priceNum - toNum(secondLast.close);
        const priceChangePercentNum = toNum(secondLast.close) === 0 ? 0 : (priceChangeNum / toNum(secondLast.close)) * 100;
        
        // Mock after-hours data
        const afterHoursChangeNum = (Math.random() - 0.5) * (priceNum * 0.005);
        const afterHoursPriceNum = priceNum + afterHoursChangeNum;
        const afterHoursChangePercentNum = priceNum === 0 ? 0 : (afterHoursChangeNum / priceNum) * 100;

        return {
            price: priceNum,
            priceChange: priceChangeNum,
            priceChangePercent: priceChangePercentNum,
            afterHoursPrice: afterHoursPriceNum,
            afterHoursChange: afterHoursChangeNum,
            afterHoursChangePercent: afterHoursChangePercentNum,
        };
    }, [chartData]);


    const yDomain = useMemo(() => {
        if (!chartData || chartData.length === 0) return [0, 100];
        const prices = chartData.map(d => d.high).concat(chartData.map(d => d.low));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const padding = (maxPrice - minPrice) * 0.1;
        return [minPrice - padding, maxPrice + padding];
    }, [chartData]);


    const renderContent = () => {
        if (isLoading) {
             return <div className="h-[400px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
        }
        if (apiError || !chartData || chartData.length === 0) {
            return <div className="h-[400px] flex items-center justify-center text-center"><p className="text-destructive">{apiError || "No data available."}</p></div>
        }

        return (
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))"/>
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(str) => str.substring(5)} />
                    <YAxis domain={yDomain} orientation="left" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                    <Legend />
                    <defs>
                        <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={priceChange >= 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
                            stopOpacity={0.4}
                        />
                        <stop
                            offset="95%"
                             stopColor={priceChange >= 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
                            stopOpacity={0.05}
                        />
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="close" stroke={priceChange >= 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'} fill="url(#fillPrice)" name="Price" strokeWidth={2} />
                    </ComposedChart>
                </ResponsiveContainer>
            </ChartContainer>
        );
    }
    
    const keyMetrics = useMemo(() => {
        if (!chartData || chartData.length === 0) {
            return {
                open: 0, high: 0, low: 0, mktCap: 'N/A',
                peRatio: 'N/A', divYield: 'N/A', prevClose: 0,
            };
        }
        const lastDataPoint = chartData[chartData.length - 1];
        const secondLastDataPoint = chartData[chartData.length - 2];

        return {
            open: lastDataPoint?.open,
            high: Math.max(...chartData.map(d => d.high)),
            low: Math.min(...chartData.map(d => d.low)),
            mktCap: (Math.random() * 2 + 1).toFixed(2) + 'T',
            peRatio: (Math.random() * 20 + 15).toFixed(2),
            divYield: (Math.random() * 2).toFixed(2) + '%',
            prevClose: secondLastDataPoint?.close,
        }
    }, [chartData]);


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
             <div className="text-sm text-muted-foreground">Market Summary &gt; {selectedStock.name}</div>
             <div className="flex items-end gap-2 mt-1">
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
                <p className={`text-lg font-semibold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceChange >= 0 ? '+' : ''}{(priceChange).toFixed(2)} 
                  ({priceChangePercent.toFixed(2)}%)
                </p>
             </div>
             <div className="text-xs text-muted-foreground mt-1">
                {currentDate && <span>Closed: {currentDate}</span>}
                <span className="ml-4">After hours: ${afterHoursPrice.toFixed(2)} <span className={afterHoursChange >=0 ? 'text-green-500' : 'text-red-500'}>{afterHoursChange.toFixed(2)} ({afterHoursChangePercent.toFixed(2)}%)</span></span>
             </div>
          </div>
           <Button variant="outline">+ Follow</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
         <div className="px-6 border-b">
            {timeRanges.map(range => (
                <Button key={range} variant="ghost" size="sm" className={cn("rounded-none", activeRange === range && 'border-b-2 border-primary text-primary')} onClick={() => setActiveRange(range)}>
                    {range}
                </Button>
            ))}
        </div>
        <div className="p-6">
            {renderContent()}
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm px-6 pt-4 pb-6 border-t">
        <div className="flex justify-between"><span className="text-muted-foreground">Open</span> <span className="font-medium">{keyMetrics.open?.toFixed(2) ?? 'N/A'}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Mkt cap</span> <span className="font-medium">{keyMetrics.mktCap}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">High</span> <span className="font-medium">{keyMetrics.high?.toFixed(2) ?? 'N/A'}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">P/E ratio</span> <span className="font-medium">{keyMetrics.peRatio}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Low</span> <span className="font-medium">{keyMetrics.low?.toFixed(2) ?? 'N/A'}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Div yield</span> <span className="font-medium">{keyMetrics.divYield}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Prev. close</span> <span className="font-medium">{keyMetrics.prevClose?.toFixed(2) ?? 'N/A'}</span></div>
      </CardFooter>
    </Card>
  );
}
