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
import { allStocks } from '@/lib/data';

export function MarketOverviewCard() {
  // Select a few stocks to show as recommendations
  const recommendedStocks = allStocks.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Markets</CardTitle>
        <CardDescription>Overview of popular stocks.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recommendedStocks.map((stock) => (
              <TableRow key={stock.ticker}>
                <TableCell>
                  <div className="font-bold">{stock.ticker}</div>
                  <div className="text-xs text-muted-foreground">{stock.name}</div>
                </TableCell>
                <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
