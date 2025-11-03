'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { stockPriceForecast, type StockPriceForecastOutput } from '@/ai/flows/stock-price-forecast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  ticker: z.string().min(1, 'Ticker is required').max(5, 'Invalid Ticker').toUpperCase(),
});

const TrendIcon = ({ trend }: { trend: 'Up' | 'Down' | 'Sideways' | undefined }) => {
  switch (trend) {
    case 'Up':
      return <TrendingUp className="h-6 w-6 text-green-500" />;
    case 'Down':
      return <TrendingDown className="h-6 w-6 text-red-500" />;
    case 'Sideways':
      return <Minus className="h-6 w-6 text-yellow-500" />;
    default:
      return null;
  }
};

export function PriceForecastCard() {
  const [forecast, setForecast] = useState<StockPriceForecastOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticker: 'AAPL',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setForecast(null);
    try {
      const result = await stockPriceForecast(values);
      setForecast(result);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to fetch price forecast.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">AI Price Forecast</CardTitle>
        <CardDescription>7-day price prediction using GenAI.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 items-start">
            <FormField
              control={form.control}
              name="ticker"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input placeholder="Enter Ticker (e.g., AAPL)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Forecast'}
            </Button>
          </form>
        </Form>
        <div className="mt-6 min-h-[200px] flex items-center justify-center">
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
          {!isLoading && forecast && (
            <div className="w-full space-y-4">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecast.forecast} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                     <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(str) => str.substring(5)}/>
                    <YAxis fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                    <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendIcon trend={forecast.trend} />
                  <div>
                    <p className="text-sm text-muted-foreground">Trend</p>
                    <p className="font-bold">{forecast.trend}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="font-bold">{(forecast.confidenceScore * 100).toFixed(0)}%</p>
                   <Progress value={forecast.confidenceScore * 100} className="w-24 h-1.5 mt-1" />
                </div>
              </div>
            </div>
          )}
           {!isLoading && !forecast && (
            <div className="text-center text-muted-foreground">
                <p>Enter a stock ticker to see the AI forecast.</p>
            </div>
           )}
        </div>
      </CardContent>
    </Card>
  );
}
