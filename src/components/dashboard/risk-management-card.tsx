'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getRiskManagementRecommendations, type RiskManagementRecommendationsOutput } from '@/ai/flows/risk-management-recommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ShieldCheck, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  ticker: z.string().min(1, 'Ticker required').max(5, 'Invalid Ticker').toUpperCase(),
  historicalVolatility: z.coerce.number().min(0, 'Must be positive'),
  marketSentimentScore: z.coerce.number().min(-1).max(1),
  currentPrice: z.coerce.number().min(0, 'Must be positive'),
});

export function RiskManagementCard() {
  const [recommendations, setRecommendations] = useState<RiskManagementRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticker: 'TSLA',
      historicalVolatility: 0.45,
      marketSentimentScore: 0.6,
      currentPrice: 183.01,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendations(null);
    try {
      const result = await getRiskManagementRecommendations(values);
      setRecommendations(result);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to get recommendations.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleApplyOrder = (type: 'Stop Loss' | 'Take Profit', price: number) => {
    toast({
        title: 'Order Placed!',
        description: `${type} order for ${form.getValues('ticker')} set at $${price.toFixed(2)}.`
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">AI Risk Management</CardTitle>
        <CardDescription>Stop Loss & Take Profit Recommendations.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="ticker" render={({ field }) => (<FormItem><FormLabel>Ticker</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="currentPrice" render={({ field }) => (<FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="historicalVolatility" render={({ field }) => (<FormItem><FormLabel>Volatility</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="marketSentimentScore" render={({ field }) => (<FormItem><FormLabel>Sentiment</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Recommendations'}
            </Button>
          </form>
        </Form>
        <div className="mt-6 min-h-[120px] flex items-center justify-center">
            {isLoading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
            {!isLoading && recommendations && (
                <div className="w-full space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                            <div>
                                <p className="text-sm text-red-400">Stop Loss</p>
                                <p className="text-xl font-bold text-red-300">${recommendations.stopLossRecommendation.toFixed(2)}</p>
                            </div>
                            <Button size="sm" variant="destructive" onClick={() => handleApplyOrder('Stop Loss', recommendations.stopLossRecommendation)}>Apply</Button>
                        </div>
                        <div className="flex justify-between items-center bg-green-900/20 p-3 rounded-lg border border-green-500/30">
                             <div>
                                <p className="text-sm text-green-400">Take Profit</p>
                                <p className="text-xl font-bold text-green-300">${recommendations.takeProfitRecommendation.toFixed(2)}</p>
                            </div>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApplyOrder('Take Profit', recommendations.takeProfitRecommendation)}>Apply</Button>
                        </div>
                    </div>
                     <p className="text-xs text-muted-foreground italic text-center p-2 bg-muted/30 rounded-md">
                        <ShieldCheck className="inline-block h-4 w-4 mr-1" />
                        <strong>Rationale:</strong> {recommendations.rationale}
                    </p>
                </div>
            )}
            {!isLoading && !recommendations && (
                <div className="text-center text-muted-foreground">
                    <p>Fill in the details to get AI recommendations.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
