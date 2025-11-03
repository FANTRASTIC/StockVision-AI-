'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { allStocks } from '@/lib/data';
import { ChartTooltipContent, ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDailyStockData } from '@/lib/services/alpha-vantage'; // Use the service directly
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-card border border-border rounded-lg shadow-lg">
        <p className="font-bold text-card-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          Open: <span className="font-medium text-card-foreground">${payload[0]?.payload.open?.toFixed(2)}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          High: <span className="font-medium text-card-foreground">${payload[0]?.payload.high?.toFixed(2)}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Low: <span className="font-medium text-card-foreground">${payload[0]?.payload.low?.toFixed(2)}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Close: <span className="font-medium text-card-foreground">${payload[0]?.payload.close?.toFixed(2)}</span>
        </p>
      </div>
    );
  }

  return null;
};


const Candlestick = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isGrowing = open < close;
  const color = isGrowing ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))';
  
  if (high === low) { // Avoid division by zero
    return <g></g>;
  }

  const bodyHeight = Math.max(1, (Math.abs(open - close) / (high - low)) * height);
  const bodyY = isGrowing ? y + ((high - close) / (high - low)) * height : y + ((high - open) / (high - low)) * height;
  
  return (
    <g>
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} stroke={color} />
      <rect x={x} y={bodyY} width={width} height={bodyHeight} fill={color} />
    </g>
  );
};

const chartConfig = {
  rsi: {
    label: "RSI",
    color: "hsl(var(--chart-1))",
  },
  macd: {
    label: "MACD",
    color: "hsl(var(--chart-2))",
  },
  signal: {
    label: "Signal",
    color: "hsl(var(--chart-4))",
  },
  histogram: {
    label: "Histogram",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig

export function StockChartCard() {
    const [selectedStock, setSelectedStock] = useState(allStocks[0]);
    const [chartData, setChartData] = useState<CombinedData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setApiError(null);
            try {
                const data = await getDailyStockData(selectedStock.ticker);
                setChartData(data);
            } catch (error: any) {
                console.error(error);
                let description = `Could not load data for ${selectedStock.ticker}. Please check your API key or try again later.`;
                if (error.message && error.message.includes('limit')) {
                    description = `Alpha Vantage API limit reached. Please wait a moment or upgrade your key.`
                    setApiError(description);
                }
                toast({
                    title: 'Error Fetching Stock Data',
                    description: description,
                    variant: 'destructive'
                });
                setChartData([]); // Clear data on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedStock, toast]);
    
    const lastDataPoint = chartData.length > 0 ? chartData[chartData.length - 1] : null;
    const secondLastDataPoint = chartData.length > 1 ? chartData[chartData.length - 2] : null;

    const yDomain = useMemo(() => {
        if (!chartData || chartData.length === 0) return [0, 100];
        const prices = chartData.map(d => d.high).concat(chartData.map(d => d.low));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const padding = (maxPrice - minPrice) * 0.1; // 10% padding
        return [minPrice - padding, maxPrice + padding];
    }, [chartData]);


    const renderContent = () => {
        if (isLoading) {
             return <div className="h-[400px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
        }
        if (chartData.length === 0) {
            return <div className="h-[400px] flex items-center justify-center text-center"><p className="text-destructive">{apiError || "No data available. The API might be unavailable."}</p></div>
        }

        return (
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <div className="h-[70%] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))"/>
                        <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(str) => str.substring(5)} />
                        <YAxis domain={yDomain} orientation="left" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="close" shape={<Candlestick />} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className="h-[30%] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} hide/>
                            <YAxis yAxisId="left" domain={[0, 100]} orientation="left" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false}/>
                            <YAxis yAxisId="right" domain={['dataMin - 1', 'dataMax + 1']} orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                            <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="rsi" stroke="var(--color-rsi)" dot={false} name="RSI" strokeWidth={1.5} />
                            <Line yAxisId="right" type="monotone" dataKey="macd" stroke="var(--color-macd)" dot={false} name="MACD" strokeWidth={1.5} />
                            <Line yAxisId="right" type="monotone" dataKey="signal" stroke="var(--color-signal)" dot={false} name="Signal" strokeWidth={1.5} />
                            <Bar yAxisId="right" dataKey="histogram" fill="var(--color-histogram)" name="Histogram" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </ChartContainer>
        );
    }


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
             <Select value={selectedStock.ticker} onValueChange={(ticker) => setSelectedStock(allStocks.find(s => s.ticker === ticker)!)}>
                <SelectTrigger className="w-[200px] border-0 shadow-none text-2xl font-headline !p-0 focus:ring-0 focus:ring-offset-0 h-auto">
                    <SelectValue placeholder="Select stock" />
                </SelectTrigger>
                <SelectContent>
                    {allStocks.map(stock => (
                        <SelectItem key={stock.ticker} value={stock.ticker}>
                            <span className="font-bold">{stock.ticker}</span>
                            <span className="text-muted-foreground ml-2">{stock.name}</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <CardDescription>{selectedStock.name} Daily Chart</CardDescription>
          </div>
           {lastDataPoint && secondLastDataPoint && (
              <div className="text-right">
                <p className="text-2xl font-bold">${lastDataPoint.close.toFixed(2)}</p>
                <p className={`text-sm ${lastDataPoint.close > secondLastDataPoint.close ? 'text-green-500' : 'text-red-500'}`}>
                  { (lastDataPoint.close - secondLastDataPoint.close).toFixed(2)} 
                  ({((lastDataPoint.close - secondLastDataPoint.close) / secondLastDataPoint.close * 100).toFixed(2)}%)
                </p>
              </div>
           )}
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
