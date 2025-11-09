
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { portfolioHoldings } from '@/lib/data';

const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

export function PortfolioCard() {
  const totalValue = portfolioHoldings.reduce((acc, holding) => acc + holding.shares * holding.currentPrice, 0);
  const totalCost = portfolioHoldings.reduce((acc, holding) => acc + holding.shares * holding.avgCost, 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost !== 0 ? (totalGainLoss / totalCost) * 100 : 0;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">Paper Trading Portfolio</CardTitle>
                <CardDescription>Your virtual holdings with real-time data.</CardDescription>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold">${fmt(totalValue)}</p>
                <p className={`text-sm ${totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalGainLoss >= 0 ? '+' : ''}${fmt(totalGainLoss)}
                    ({totalGainLossPercent.toFixed(2)}%)
                </p>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Day's Gain</TableHead>
              <TableHead className="text-right">Total Gain</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portfolioHoldings.map((holding) => {
              const marketValue = holding.shares * holding.currentPrice;
              const dayGain = (Math.random() - 0.45) * holding.currentPrice * holding.shares * 0.05;
              const dayGainPercent = (dayGain / (marketValue-dayGain)) * 100;
              const totalGain = marketValue - (holding.shares * holding.avgCost);
              const gainPercent = (totalGain / (holding.shares * holding.avgCost)) * 100;

              return (
                <TableRow key={holding.ticker}>
                  <TableCell>
                    <div className="font-bold">{holding.ticker}</div>
                    <div className="text-xs text-muted-foreground">{holding.name}</div>
                  </TableCell>
                  <TableCell className="text-right">{fmt(holding.shares)}</TableCell>
                  <TableCell className="text-right">${fmt(holding.currentPrice)}</TableCell>
                  <TableCell className="text-right">${fmt(marketValue)}</TableCell>
                  <TableCell className={`text-right ${dayGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <div>{dayGain >= 0 ? '+' : ''}${fmt(dayGain)}</div>
                    <div className="text-xs">({dayGainPercent.toFixed(2)}%)</div>
                  </TableCell>
                  <TableCell className={`text-right ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <div>{totalGain >= 0 ? '+' : ''}${fmt(totalGain)}</div>
                    <div className="text-xs">({gainPercent.toFixed(2)}%)</div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
