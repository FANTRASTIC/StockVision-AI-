import { DashboardHeader } from '@/components/dashboard/header';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { StockChartCard } from '@/components/dashboard/stock-chart-card';
import { TradingWidget } from '@/components/dashboard/trading-widget';
import { PortfolioCard } from '@/components/dashboard/portfolio-card';
import { WatchlistCard } from '@/components/dashboard/watchlist-card';
import { PriceForecastCard } from '@/components/dashboard/price-forecast-card';
import { RiskManagementCard } from '@/components/dashboard/risk-management-card';
import { MarketSentimentCard } from '@/components/dashboard/market-sentiment-card';

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <DashboardHeader />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-4 xl:col-span-3">
              <StockChartCard />
            </div>
            <div className="lg:col-span-4 xl:col-span-1">
              <TradingWidget />
            </div>
            <div className="lg:col-span-4">
              <PortfolioCard />
            </div>
            <div className="lg:col-span-4 xl:col-span-2">
              <WatchlistCard />
            </div>
            <div className="lg:col-span-4 xl:col-span-2">
              <PriceForecastCard />
            </div>
            <div className="lg:col-span-4 xl:col-span-2">
             <RiskManagementCard />
            </div>
            <div className="lg:col-span-4 xl:col-span-2">
             <MarketSentimentCard />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
