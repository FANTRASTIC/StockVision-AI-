
'use client';
import { PriceForecastCard } from '@/components/dashboard/price-forecast-card';
import { RiskManagementCard } from '@/components/dashboard/risk-management-card';
import { MarketSentimentCard } from '@/components/dashboard/market-sentiment-card';

export default function AiToolsPage({ isTab }: { isTab?: boolean }) {
    const content = (
    <main className="p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PriceForecastCard />
        <RiskManagementCard />
        <MarketSentimentCard />
      </div>
    </main>
  );

  // This component is only used as a tab, so we don't need the standalone page logic.
  // However, keeping it allows for future flexibility if it needs to be a separate page.
  if (isTab) {
    return content;
  }

  // The code below is for rendering as a standalone page, which is not the current use case.
  // It is kept for completeness.
  return (
    <>
      {/* Standalone page would need Sidebar and Header components here */}
      {content}
    </>
  );
}
