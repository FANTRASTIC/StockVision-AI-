'use client';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { allStocks } from '@/lib/data';
import { useMemo } from 'react';

type TrendingStock = {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
};

// Generate some mock trending data
const generateTrendingData = () => {
  const shuffled = [...allStocks].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10).map(stock => ({
    ...stock,
    change: (Math.random() - 0.45) * 10,
    changePercent: (Math.random() - 0.45) * 5,
    volume: `${(Math.random() * 50).toFixed(2)}M`
  }));
};


export default function ExplorePage({ isTab }: { isTab?: boolean }) {
    
  const trendingStocks = useMemo(() => generateTrendingData(), []);
  const topGainers = [...trendingStocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topLosers = [...trendingStocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  
  const StockTable = ({ stocks }: { stocks: TrendingStock[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Change</TableHead>
          <TableHead className="text-right">Volume</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stocks.map((stock) => (
          <TableRow key={stock.ticker}>
            <TableCell>
              <div className="font-bold">{stock.ticker}</div>
              <div className="text-xs text-muted-foreground">{stock.name}</div>
            </TableCell>
            <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
            <TableCell className={`text-right ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <div>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)</div>
            </TableCell>
            <TableCell className="text-right">{stock.volume}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const content = (
    <main className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Flame className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-headline">Explore Hot Stocks</h1>
          <p className="text-muted-foreground">Discover stocks in the conversation right now.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="text-green-500" /> Top Gainers</CardTitle>
            <CardDescription>Stocks with the highest price increase today.</CardDescription>
          </CardHeader>
          <CardContent>
            <StockTable stocks={topGainers} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingDown className="text-red-500" /> Top Losers</CardTitle>
            <CardDescription>Stocks with the biggest price drop today.</CardDescription>
          </CardHeader>
          <CardContent>
             <StockTable stocks={topLosers} />
          </CardContent>
        </Card>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Most Active</CardTitle>
          <CardDescription>Stocks with the highest trading volume today.</CardDescription>
        </CardHeader>
        <CardContent>
           <StockTable stocks={[...trendingStocks].sort((a,b) => parseFloat(b.volume) - parseFloat(a.volume))} />
        </CardContent>
      </Card>
    </main>
  );

  if (isTab) {
    return content;
  }

  return (
    <>
      <Sidebar>
        <SidebarNav activeTab="explore" setActiveTab={() => {}} />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader selectedTicker={''} onTickerSelect={() => {}} />
        {content}
      </SidebarInset>
    </>
  );
}
