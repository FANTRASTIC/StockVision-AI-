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
import { Badge } from '@/components/ui/badge';

export function PortfolioCard() {
  const totalValue = portfolioHoldings.reduce((acc, holding) => acc + holding.shares * holding.currentPrice, 0);
  const totalCost = portfolioHoldings.reduce((acc, holding) => acc + holding.shares * holding.avgCost, 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = (totalGainLoss / totalCost) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">Paper Trading Portfolio</CardTitle>
                <CardDescription>Your virtual holdings with real-time data.</CardDescription>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className={`text-sm ${totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              const totalGain = marketValue - holding.shares * holding.avgCost;
              const gainPercent = (totalGain / (holding.shares * holding.avgCost)) * 100;
              // Mock day's gain for demonstration
              const dayGain = (Math.random() - 0.5) * 5 * holding.shares; 
              const dayGainPercent = (dayGain / (marketValue - dayGain)) * 100;

              return (
                <TableRow key={holding.ticker}>
                  <TableCell>
                    <div className="font-bold">{holding.ticker}</div>
                    <div className="text-xs text-muted-foreground">{holding.name}</div>
                  </TableCell>
                  <TableCell className="text-right">{holding.shares.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${holding.currentPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${marketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell className={`text-right ${dayGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <div>{dayGain >= 0 ? '+' : ''}${dayGain.toFixed(2)}</div>
                    <div className="text-xs">({dayGainPercent.toFixed(2)}%)</div>
                  </TableCell>
                  <TableCell className={`text-right ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <div>{totalGain >= 0 ? '+' : ''}${totalGain.toFixed(2)}</div>
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
