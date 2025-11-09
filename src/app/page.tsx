
'use client';
import { useState } from 'react';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { DashboardHeader } from '@/components/dashboard/header';
import { StockChartCard } from '@/components/dashboard/stock-chart-card';
import { PortfolioCard } from '@/components/dashboard/portfolio-card';
import { TradingWidget } from '@/components/dashboard/trading-widget';
import { WatchlistCard } from '@/components/dashboard/watchlist-card';
import { allStocks } from '@/lib/data';
import AiToolsPage from './ai-tools/page';
import AlertsPage from './alerts/page';
import ChartsPage from './charts/page';
import PortfolioPage from './portfolio/page';
import ExplorePage from './explore/page';

export default function DashboardPage() {
  const [selectedTicker, setSelectedTicker] = useState(allStocks[0].ticker);
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <StockChartCard selectedTicker={selectedTicker} onTickerSelect={setSelectedTicker} />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <PortfolioCard />
              </div>
              <div className="space-y-6">
                <TradingWidget />
              </div>
            </div>
            <WatchlistCard />
          </>
        );
      case 'portfolio':
        return <PortfolioPage isTab />;
      case 'explore':
        return <ExplorePage isTab />;
      case 'ai-tools':
        return <AiToolsPage isTab />;
      case 'charts':
        return <ChartsPage isTab />;
      case 'alerts':
        return <AlertsPage isTab />;
      default:
        return null;
    }
  };

  return (
    <>
      <Sidebar>
        <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader selectedTicker={selectedTicker} onTickerSelect={setSelectedTicker} />
        <main className="p-4 sm:p-6 space-y-6">
          {renderContent()}
        </main>
      </SidebarInset>
    </>
  );
}
