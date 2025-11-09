
'use client';
import { useState } from 'react';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { DashboardHeader } from '@/components/dashboard/header';
import { StockChartCard } from '@/components/dashboard/stock-chart-card';
import { PortfolioCard } from '@/components/dashboard/portfolio-card';
import { WatchlistCard } from '@/components/dashboard/watchlist-card';
import { TradingWidget } from '@/components/dashboard/trading-widget';
import { PriceForecastCard } from '@/components/dashboard/price-forecast-card';
import { RiskManagementCard } from '@/components/dashboard/risk-management-card';
import { MarketSentimentCard } from '@/components/dashboard/market-sentiment-card';
import { allStocks } from '@/lib/data';


export default function DashboardPage() {
  const [selectedTicker, setSelectedTicker] = useState(allStocks[0].ticker);

  return (
    <>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader selectedTicker={selectedTicker} onTickerSelect={setSelectedTicker} />
        <main className="p-4 sm:p-6 space-y-6">
           <StockChartCard selectedTicker={selectedTicker} onTickerSelect={setSelectedTicker} />
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <PortfolioCard />
                </div>
                <div className="space-y-6">
                    <TradingWidget />
                </div>
           </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PriceForecastCard />
              <RiskManagementCard />
              <MarketSentimentCard />
            </div>
            <WatchlistCard />
        </main>
      </SidebarInset>
    </>
  );
}
