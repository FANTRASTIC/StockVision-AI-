
'use client';

import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
  CartesianGrid,
  Bar,
  BarChart,
} from "recharts";
import {
  Search,
  Settings,
  Moon,
  Sun,
  Bell,
  ChevronDown,
  Plus,
  Play,
  StopCircle,
  Upload,
  Download,
  Sparkles,
  Gauge,
  LineChart as LineChartIcon,
  TrendingUp,
  Newspaper,
  Layers,
  SlidersHorizontal,
  Filter,
  RefreshCw,
  GitBranch,
  Info,
  Loader2
} from "lucide-react";

// shadcn/ui components (available in this environment)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// --- Data Fetching and Processing ---

type OHLCData = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma50?: number;
  ma200?: number;
  forecast?: number;
};

// Mock Data Generator
function generateMockSeries(days = 120): OHLCData[] {
  let price = 150;
  const out: OHLCData[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const change = (Math.random() - 0.5) * 2.5;
    price = Math.max(50, price + change);
    out.push({
      date: d.toISOString().slice(0, 10),
      open: price - (Math.random() - 0.5),
      high: price + Math.random(),
      low: price - Math.random(),
      close: Number(price.toFixed(2)),
      volume: Math.round(2_000_000 + Math.random() * 4_000_000),
    });
  }
  return addMovingAverages(out);
}

// Moving Averages Calculator
function addMovingAverages(data: OHLCData[]): OHLCData[] {
  return data.map((pt, idx) => {
    let ma50, ma200;
    if (idx >= 49) {
      const slice = data.slice(idx - 49, idx + 1);
      ma50 = Number((slice.reduce((a, b) => a + b.close, 0) / 50).toFixed(2));
    }
    if (idx >= 199) {
      const slice = data.slice(idx - 199, idx + 1);
      ma200 = Number((slice.reduce((a, b) => a + b.close, 0) / 200).toFixed(2));
    }
    return { ...pt, ma50, ma200 };
  });
}

// --- API Fetchers ---
// These now call our internal Next.js API routes

async function fetchYahooDaily(symbol: string): Promise<OHLCData[]> {
    const res = await fetch(`/api/yahoo?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `Yahoo API request failed`);
    }
    const data = await res.json();
    return addMovingAverages(data);
}

async function fetchAlphaVantageDaily(symbol: string): Promise<OHLCData[]> {
    const res = await fetch(`/api/alpha?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `Alpha Vantage API request failed`);
    }
    const data = await res.json();
    return addMovingAverages(data);
}

const fetchers = {
  mock: generateMockSeries,
  yahoo: fetchYahooDaily,
  alpha: fetchAlphaVantageDaily,
};

type Provider = keyof typeof fetchers;

// Main Dashboard Component
export default function StockVisionDashboard() {
  const [dark, setDark] = useState(true);
  const [symbol, setSymbol] = useState("AAPL");
  const [provider, setProvider] = useState<Provider>("yahoo");

  const [data, setData] = useState<OHLCData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showMA50, setShowMA50] = useState(true);
  const [showMA200, setShowMA200] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const loadData = useCallback(async () => {
    if (!symbol) return;
    setIsLoading(true);
    setError(null);
    setData([]);

    try {
      const fetcher = fetchers[provider];
      const result = await fetcher(symbol);
      setData(result);
    } catch (err: any) {
      console.error(`Failed to fetch data from ${provider}:`, err);
      setError(`Could not load data from ${provider}. Falling back to mock data. ${err.message}`);
      setData(generateMockSeries()); // Fallback to mock data
    } finally {
      setIsLoading(false);
    }
  }, [symbol, provider]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body">
      <Header
        dark={dark}
        setDark={setDark}
        symbol={symbol}
        setSymbol={setSymbol}
        provider={provider}
        setProvider={setProvider}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight">{symbol} Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Using <span className="font-semibold">{provider}</span> data source.
                    {isLoading && <span className="ml-2">Loading...</span>}
                </p>
            </div>
             {error && (
                <div className="text-xs text-red-500 bg-red-500/10 p-2 rounded-md max-w-md">
                    <strong>Error:</strong> {error}
                </div>
            )}
            <Button onClick={loadData} variant="outline" size="sm" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2"/>}
                Refresh Data
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <ControlPanel
              showMA50={showMA50}
              setShowMA50={setShowMA50}
              showMA200={showMA200}
              setShowMA200={setShowMA200}
            />
          </div>
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <StockChart data={data} isLoading={isLoading} showMA50={showMA50} showMA200={showMA200} />
            <InfoTabs />
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Child Components ---

function Header({ dark, setDark, symbol, setSymbol, provider, setProvider }) {
  return (
     <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-semibold tracking-tight">StockVision</span>
          </div>

          <div className="flex-1 flex justify-center items-center gap-2">
             <Input 
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Symbol (e.g. AAPL)"
                className="w-32 h-9"
             />
             <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="w-48 h-9">
                    <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="yahoo">Yahoo (no key)</SelectItem>
                    <SelectItem value="alpha">Alpha Vantage (needs key)</SelectItem>
                    <SelectItem value="mock">Mock Data</SelectItem>
                </SelectContent>
             </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)}>
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon"><Bell className="w-5 h-5" /></Button>
             <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Settings className="w-5 h-5"/></Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Global Settings</SheetTitle>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
  );
}

function ControlPanel({ showMA50, setShowMA50, showMA200, setShowMA200 }) {
    return (
        <>
            <Card>
                <CardHeader><CardTitle className="text-base">Chart Overlays</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between"><Label htmlFor="ma50">50-Day MA</Label><Switch id="ma50" checked={showMA50} onCheckedChange={setShowMA50}/></div>
                    <div className="flex items-center justify-between"><Label htmlFor="ma200">200-Day MA</Label><Switch id="ma200" checked={showMA200} onCheckedChange={setShowMA200}/></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="text-base">AI Predictions</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Button className="w-full" disabled><Play className="w-4 h-4 mr-2"/>Run Forecast</Button>
                    <p className="text-xs text-muted-foreground text-center">Prediction controls coming soon.</p>
                </CardContent>
            </Card>
        </>
    );
}

function StockChart({ data, isLoading, showMA50, showMA200 }) {
  const chartData = useMemo(() => data, [data]);

  const lastDataPoint = chartData.length > 0 ? chartData[chartData.length - 1] : null;
  const price = lastDataPoint ? lastDataPoint.close : 0;
  const priceChange = chartData.length > 1 ? chartData[chartData.length - 1].close - chartData[chartData.length - 2].close : 0;
  const isPositive = priceChange >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Price Chart</CardTitle>
            <CardDescription>Daily price history</CardDescription>
          </div>
          {lastDataPoint && (
            <div className="text-right">
              <p className="text-2xl font-bold">${price.toFixed(2)}</p>
              <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{(priceChange / (price - priceChange) * 100).toFixed(2)}%)
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="h-[400px] pr-0">
        <ResponsiveContainer width="100%" height="100%">
          {isLoading ? (
             <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
             </div>
          ) : (
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                  <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={30} tickFormatter={(str) => str.substring(5)} />
              <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 5', 'auto']} />
              <Tooltip
                contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))'
                }}
                labelStyle={{ fontWeight: 'bold' }}
                formatter={(value, name) => [typeof value === 'number' ? `$${value.toFixed(2)}` : value, name]}
              />
              <Legend />
              <Area type="monotone" dataKey="close" name="Price" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorClose)" dot={false} />
              {showMA50 && <Line type="monotone" dataKey="ma50" name="MA 50" dot={false} stroke="hsl(var(--chart-2))" />}
              {showMA200 && <Line type="monotone" dataKey="ma200" name="MA 200" dot={false} stroke="hsl(var(--chart-4))" />}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function InfoTabs() {
  return (
    <Tabs defaultValue="news">
      <TabsList>
        <TabsTrigger value="news">News</TabsTrigger>
        <TabsTrigger value="profile">Company Profile</TabsTrigger>
        <TabsTrigger value="financials">Financials</TabsTrigger>
      </TabsList>
      <TabsContent value="news">
        <Card>
          <CardHeader><CardTitle>Latest News</CardTitle></CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Live news feed coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
       <TabsContent value="profile">
        <Card>
          <CardHeader><CardTitle>Company Profile</CardTitle></CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Company profile data coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
       <TabsContent value="financials">
        <Card>
          <CardHeader><CardTitle>Financials</CardTitle></CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Financial statements coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
