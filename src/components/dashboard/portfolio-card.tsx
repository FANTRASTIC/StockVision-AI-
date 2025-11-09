
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
import { type PortfolioHolding } from '@/lib/data';
import { useState, useEffect } from 'react';
import { toNum } from '@/lib/utils';

// Simple pseudo-random number generator to ensure consistency between server and client
const seededRandom = (seed: number) => {
  let s = Math.sin(seed) * 10000;
  return s - Math.floor(s);
};


const generateDayGains = (holdings: PortfolioHolding[]) => {
    return holdings.map((holding, index) => {
        const seed = index + 1; // Simple seed based on index
        const price = toNum(holding.currentPrice);
        const shares = toNum(holding.shares);
        // Use a smaller random factor for more realistic daily changes
        const dayGain = (seededRandom(seed) - 0.45) * (price * 0.05) * shares;
        const marketValue = shares * price;
        const dayGainPercent = (marketValue - dayGain) !== 0 ? (dayGain / (marketValue - dayGain)) * 100 : 0;
        return {
            dayGain,
            dayGainPercent
        };
    });
};

interface PortfolioCardProps {
    holdings: PortfolioHolding[];
}

export function PortfolioCard({ holdings }: PortfolioCardProps) {
  const [dayGains, setDayGains] = useState<{dayGain: number, dayGainPercent: number}[]>([]);

  useEffect(() => {
    // Generate on client to avoid hydration mismatch and re-generate when holdings change
    setDayGains(generateDayGains(holdings));
  }, [holdings]);

  const totalValue = holdings.reduce((acc, holding) => acc + toNum(holding.shares) * toNum(holding.currentPrice), 0);
  const totalCost = holdings.reduce((acc, holding) => acc + toNum(holding.shares) * toNum(holding.avgCost), 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost !== 0 ? (totalGainLoss / totalCost) * 100 : 0;

  if (dayGains.length === 0) {
      return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Paper Trading Portfolio</CardTitle>
                <CardDescription>Your virtual holdings with real-time data.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Loading portfolio...</p>
            </CardContent>
        </Card>
      )
  }

  const fmt = (n: number, d = 2) =>
    n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

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
            {holdings.map((holding, index) => {
              const shares = toNum(holding.shares);
              const price = toNum(holding.currentPrice);
              const avgCost = toNum(holding.avgCost);
              
              const marketValue = shares * price;
              const totalGain = marketValue - shares * avgCost;
              const costBasis = shares * avgCost;
              const gainPercent = costBasis !== 0 ? (totalGain / costBasis) * 100 : 0;
              const {dayGain, dayGainPercent} = dayGains[index] || { dayGain: 0, dayGainPercent: 0};

              return (
                <TableRow key={holding.ticker}>
                  <TableCell>
                    <div className="font-bold">{holding.ticker}</div>
                    <div className="text-xs text-muted-foreground">{holding.name}</div>
                  </TableCell>
                  <TableCell className="text-right">{fmt(shares)}</TableCell>
                  <TableCell className="text-right">${fmt(price)}</TableCell>
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
