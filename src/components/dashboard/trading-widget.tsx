'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const currentPrice = 183.01; // Mock price for TSLA

export function TradingWidget() {
  const [amount, setAmount] = useState('100.00');
  const [shares, setShares] = useState((100 / currentPrice).toFixed(6));
  const { toast } = useToast();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    if (parseFloat(value) > 0) {
      setShares((parseFloat(value) / currentPrice).toFixed(6));
    } else {
      setShares('0.000000');
    }
  };

  const handleBuy = () => {
    toast({
      title: 'Order Placed',
      description: `Successfully bought ${shares} shares of TSLA for $${amount}.`,
    });
  };
  
  const handleSell = () => {
    toast({
      title: 'Order Placed',
      description: `Successfully sold ${shares} shares of TSLA for $${amount}.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Trade TSLA</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          <TabsContent value="buy">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="buy-amount">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                  <Input id="buy-amount" type="number" value={amount} onChange={handleAmountChange} className="pl-7" />
                </div>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                You will get approx. <span className="font-bold text-foreground">{shares}</span> shares.
              </div>
              <Button onClick={handleBuy} className="w-full bg-green-600 hover:bg-green-700 text-white">Buy TSLA</Button>
            </div>
          </TabsContent>
          <TabsContent value="sell">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sell-amount">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                  <Input id="sell-amount" type="number" value={amount} onChange={handleAmountChange} className="pl-7" />
                </div>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                This is approx. <span className="font-bold text-foreground">{shares}</span> shares.
              </div>
              <Button onClick={handleSell} variant="destructive" className="w-full">Sell TSLA</Button>
            </div>
          </TabsContent>
        </Tabs>
        <div className="text-center text-xs text-muted-foreground mt-2">
          Paper trading account. Not real money.
        </div>
      </CardContent>
    </Card>
  );
}
