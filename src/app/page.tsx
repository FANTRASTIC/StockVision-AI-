
'use client';

import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  Settings,
  Moon,
  Sun,
  Bell,
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
  RefreshCw,
  GitBranch,
  Info,
} from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Custom components
import { StatCard } from "@/components/dashboard/stat-card";
import { ComposedStockChart } from "@/components/dashboard/composed-stock-chart";

// Services and AI Flows
import { getDailyStockData } from "@/lib/services/alpha-vantage";
import { stockPriceForecast, StockPriceForecastOutput } from "@/ai/flows/stock-price-forecast";
import { analyzeMarketSentiment, MarketSentimentOutput } from "@/ai/flows/real-time-market-sentiment";
import { useToast } from "@/hooks/use-toast";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { allStocks } from "@/lib/data";

const models = [
  { key: "lstm", label: "LSTM (Neural)" },
  { key: "prophet", label: "Prophet (Additive)" },
  { key: "arima", label: "ARIMA" },
  { key: "rf", label: "Random Forest" },
  { key: "xgb", label: "XGBoost" },
];

export default function StockVisionDashboard() {
  const [dark, setDark] = useState(true);
  const [symbol, setSymbol] = useState("AAPL");
  const [watchlist, setWatchlist] = useState(["AAPL", "MSFT", "NVDA", "GOOGL"]);
  const [data, setData] = useState<any[]>([]);
  const [showMA50, setShowMA50] = useState(true);
  const [showMA200, setShowMA200] = useState(false);
  const [showForecast, setShowForecast] = useState(true);
  const [model, setModel] = useState("lstm");
  const [horizon, setHorizon] = useState(7);
  const [split, setSplit] = useState(80);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [forecast, setForecast] = useState<StockPriceForecastOutput['forecast']>([]);
  const [sentiment, setSentiment] = useState<MarketSentimentOutput | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stockData = await getDailyStockData(symbol, 'full');
        setData(stockData.map((d: any) => ({ ...d, date: d.date.slice(0, 10) })));
        setForecast([]); // Clear forecast when symbol changes
      } catch (error) {
        console.error(error);
        toast({ title: 'Error fetching stock data', description: 'Could not load data. Please try again later.', variant: 'destructive' });
      }
    };
    fetchData();
  }, [symbol, toast]);

  useEffect(() => {
    if (!running) return;
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          return 100;
        }
        const step = Math.random() * 18;
        return Math.min(100, p + step);
      });
    }, 300);
    
    async function runForecast() {
        try {
            const result = await stockPriceForecast({ ticker: symbol });
            setForecast(result.forecast);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error generating forecast', description: 'The AI model could not generate a forecast.', variant: 'destructive' });
        } finally {
            setRunning(false);
            setProgress(100);
            clearInterval(id);
        }
    }
    
    runForecast();
    return () => clearInterval(id);
  }, [running, symbol, toast]);

  const mergedSeries = useMemo(() => {
    const base = data.map((d) => ({ ...d }));
    forecast.forEach((f) => {
        const existing = base.find(d => d.date === f.date);
        if (existing) {
            existing.forecast = f.price;
        } else {
            base.push({ date: f.date, forecast: f.price });
        }
    });
    return base;
  }, [data, forecast]);

  const metrics = useMemo(() => ({
    rmse: 1.72,
    mae: 1.12,
    r2: 0.89,
    dir: 64,
    trainTime: running ? "Running…" : "11.8s",
  }), [running]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleRunSentiment = async () => {
    try {
        const result = await analyzeMarketSentiment({newsData: '...', socialMediaData: '...'});
        setSentiment(result);
    } catch (error) {
        console.error(error);
        toast({ title: 'Error analyzing sentiment', variant: 'destructive' });
    }
  }
  
  const currentPrice = data.length > 0 ? data[data.length - 1]?.close ?? 0 : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span className="font-semibold tracking-tight">StockVision</span>
            <Badge variant="secondary" className="ml-1">Prototype</Badge>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm opacity-90">
            <a className="hover:opacity-100" href="#dashboard">Dashboard</a>
            <a className="hover:opacity-100" href="#predictions">Predictions</a>
            <a className="hover:opacity-100" href="#analytics">Analytics</a>
            <a className="hover:opacity-100" href="#portfolio">Portfolio</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)}>
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon"><Bell className="w-5 h-5" /></Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm"><Settings className="w-4 h-4 mr-2"/>Settings</Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>Global Settings</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-6">
                  <div className="space-y-2">
                    <Label>Default Model</Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                      <SelectContent>
                        {models.map((m) => (
                          <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable real-time feed</Label>
                      <p className="text-xs opacity-70">WebSocket updates for prices</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>API Keys</Label>
                    <Textarea placeholder="Your API keys are stored securely in .env" />
                  </div>
                  <Separator />
                  <p className="text-xs opacity-70">© 2025 StockVision · Terms · Privacy</p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><Search className="w-4 h-4"/>Find a Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <Select value={symbol} onValueChange={setSymbol}>
                  <SelectTrigger><SelectValue placeholder="Choose symbol" /></SelectTrigger>
                  <SelectContent>
                    {allStocks.map((s) => (
                      <SelectItem key={s.ticker} value={s.ticker}>{s.ticker} - {s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              <div className="text-xs opacity-70">Use the dropdown to select a stock.</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Layers className="w-4 h-4"/>Overlays</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between"><Label>MA 50</Label><Switch checked={showMA50} onCheckedChange={setShowMA50}/></div>
              <div className="flex items-center justify-between"><Label>MA 200</Label><Switch checked={showMA200} onCheckedChange={setShowMA200}/></div>
              <div className="flex items-center justify-between"><Label>Forecast</Label><Switch checked={showForecast} onCheckedChange={setShowForecast}/></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><SlidersHorizontal className="w-4 h-4"/>Model Controls</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger><SelectValue placeholder="Choose model" /></SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prediction Horizon: {horizon} days</Label>
                <Slider value={[horizon]} min={1} max={30} step={1} onValueChange={(v) => setHorizon(v[0])}/>
              </div>
              <div className="space-y-2">
                <Label>Train/Test Split: {split}%</Label>
                <Slider value={[split]} min={50} max={95} step={1} onValueChange={(v) => setSplit(v[0])}/>
              </div>
              <div className="flex items-center gap-2">
                <Button className="w-full" onClick={() => setRunning(true)} disabled={running}><Play className="w-4 h-4 mr-2"/>Run Prediction</Button>
                <Button variant="outline" disabled={!running} onClick={() => setRunning(false)}><StopCircle className="w-4 h-4 mr-2"/>Stop</Button>
              </div>
              {running && (
                <div className="space-y-2">
                  <Label>Training… {Math.round(progress)}%</Label>
                  <Progress value={progress} />
                </div>
              )}
              <Separator />
              <div className="space-y-2">
                <Label>Upload Dataset (CSV)</Label>
                <div className="flex items-center gap-2">
                  <Input type="file" accept=".csv" />
                  <Button variant="secondary"><Upload className="w-4 h-4 mr-2"/>Parse</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="portfolio">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><LineChartIcon className="w-4 h-4"/>Watchlist</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {watchlist.map((t) => (
                <div key={t} className="flex items-center justify-between text-sm">
                  <button className="underline-offset-2 hover:underline" onClick={() => setSymbol(t)}>
                    {t}
                  </button>
                  <span className="font-mono text-xs opacity-70">
                    {allStocks.find(s => s.ticker === t)?.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <section className="lg:col-span-9 space-y-6">
          {/* Overview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title={`${symbol} Price`} value={`$${currentPrice.toFixed(2)}`} sub="Live" Icon={TrendingUp} />
            <StatCard title="Sentiment" value={sentiment ? `${Math.round((sentiment.overallSentimentScore + 1) * 50)}% Bullish` : 'N/A'} sub="News & Social" Icon={Gauge} />
            <StatCard title="RMSE" value={metrics.rmse} sub="Model error" Icon={Info} />
            <StatCard title="Train Time" value={metrics.trainTime} sub={models.find(m=>m.key===model)?.label} Icon={GitBranch} />
          </div>

          {/* Chart */}
          <Card id="predictions">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2"><LineChartIcon className="w-4 h-4"/>Price & Forecast</CardTitle>
            </CardHeader>
            <CardContent className="h-[360px]">
              <ComposedStockChart data={mergedSeries} showMA50={showMA50} showMA200={showMA200} showForecast={showForecast} />
            </CardContent>
          </Card>

          {/* Tabs: Metrics / Explainability / News */}
          <Tabs defaultValue="metrics" className="w-full" id="analytics">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="explain">Explainability</TabsTrigger>
              <TabsTrigger value="news">News & Sentiment</TabsTrigger>
            </TabsList>
            <TabsContent value="metrics" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-base">Error Metrics</CardTitle></CardHeader><CardContent>
                  <ul className="text-sm space-y-2">
                    <li>RMSE: <b>{metrics.rmse}</b></li>
                    <li>MAE: <b>{metrics.mae}</b></li>
                    <li>R²: <b>{metrics.r2}</b></li>
                    <li>Directional Acc.: <b>{metrics.dir}%</b></li>
                  </ul>
                  <Button className="mt-4" variant="outline"><Download className="w-4 h-4 mr-2"/>Download Report</Button>
                </CardContent></Card>
                <Card className="md:col-span-2"><CardHeader className="pb-2"><CardTitle className="text-base">Feature Importance (Mock)</CardTitle></CardHeader><CardContent className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{k:"Close",v:0.6},{k:"Volume",v:0.2},{k:"High",v:0.1},{k:"Low",v:0.07},{k:"Open",v:0.03}]}> 
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="k"/>
                      <YAxis domain={[0,1]} />
                      <Tooltip />
                      <Bar dataKey="v" radius={[6,6,0,0]} fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent></Card>
              </div>
            </TabsContent>
            <TabsContent value="explain" className="mt-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-base">SHAP-like Explanation (Mock)</CardTitle></CardHeader><CardContent>
                <p className="text-sm opacity-80">This is a placeholder for SHAP summary or waterfall charts to explain the model’s prediction for the latest date. Integrate your explainer output here.</p>
                <div className="mt-4 h-[220px] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs opacity-60">Drop your SHAP visualization here</div>
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="news" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2"><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Newspaper className="w-4 h-4"/>Latest Headlines</CardTitle></CardHeader><CardContent>
                  <ul className="text-sm space-y-3">
                    {sentiment?.positiveKeywords.map((n,i)=> (
                      <li key={i} className="flex items-start justify-between">
                        <div>
                          <p className="font-medium leading-tight">{n}</p>
                        </div>
                        <Badge variant="outline" className="border-green-500/50">Bullish</Badge>
                      </li>
                    ))}
                     {sentiment?.negativeKeywords.map((n,i)=> (
                      <li key={i} className="flex items-start justify-between">
                        <div>
                          <p className="font-medium leading-tight">{n}</p>
                        </div>
                        <Badge variant="outline" className="border-red-500/50">Bearish</Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-base">Sentiment Gauge</CardTitle></CardHeader><CardContent>
                  <div className="h-[220px] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold">{sentiment ? `${Math.round((sentiment.overallSentimentScore + 1) * 50)}%` : 'N/A'}</div>
                    <div className="text-xs opacity-70">Bullish</div>
                    <Button size="sm" className="mt-3" variant="outline" onClick={handleRunSentiment}><RefreshCw className="w-4 h-4 mr-2"/>Recompute</Button>
                  </div>
                </CardContent></Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
