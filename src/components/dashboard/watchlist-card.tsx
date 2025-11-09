'use client';
import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { BellPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { WatchlistItem } from '@/lib/data';

interface WatchlistCardProps {
    watchlist: WatchlistItem[];
}

export function WatchlistCard({ watchlist }: WatchlistCardProps) {
  const [isAlertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<WatchlistItem | null>(null);
  const { toast } = useToast();

  const handleOpenAlert = (stock: WatchlistItem) => {
    setSelectedStock(stock);
    setAlertDialogOpen(true);
  };

  const handleSetAlert = () => {
    if (!selectedStock) return;
    toast({
        title: "Alert Set!",
        description: `You will be notified about ${selectedStock.ticker}.`
    });
    setAlertDialogOpen(false);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Watchlist</CardTitle>
          <CardDescription>Your tracked stocks at a glance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">Alert</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchlist.map((stock) => (
                <TableRow key={stock.ticker}>
                  <TableCell>
                    <div className="font-bold">{stock.ticker}</div>
                    <div className="text-xs text-muted-foreground">{stock.name}</div>
                  </TableCell>
                  <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
                  <TableCell className={`text-right ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <div>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}</div>
                    <div className="text-xs">({stock.changePercent.toFixed(2)}%)</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenAlert(stock)}>
                      <BellPlus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isAlertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Set Alert for {selectedStock?.ticker}</DialogTitle>
                <DialogDescription>
                    Get notified when {selectedStock?.name} hits your price target.
                    Current price: ${selectedStock?.price.toFixed(2)}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price-target" className="text-right">
                        Price Target
                    </Label>
                    <Input id="price-target" defaultValue={selectedStock?.price.toFixed(2)} className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSetAlert}>Set Alert</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
