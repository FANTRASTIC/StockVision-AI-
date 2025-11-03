'use client';

import { useState } from 'react';
import { analyzeMarketSentiment, type MarketSentimentOutput } from '@/ai/flows/real-time-market-sentiment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Newspaper, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const mockNewsData = `
    "Tech stocks rally as new inflation data shows cooling economy."
    "Global markets are jittery amid geopolitical tensions in Eastern Europe."
    "Federal Reserve hints at pausing interest rate hikes, boosting investor confidence."
    "Innovate Corp's new AI chip is set to revolutionize the industry, stock sores 20%."
`;

const mockSocialMediaData = `
    "UserA: Just went all in on $TECH, to the moon! 🚀"
    "UserB: Feeling bearish about the market this week, might sell off some positions."
    "UserC: The Fed's announcement is exactly what we needed. #bullish"
    "UserD: $INVC is a pump and dump, be careful y'all."
`;

export function MarketSentimentCard() {
  const [sentiment, setSentiment] = useState<MarketSentimentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function handleAnalyze() {
    setIsLoading(true);
    setSentiment(null);
    try {
      const result = await analyzeMarketSentiment({
        newsData: mockNewsData,
        socialMediaData: mockSocialMediaData,
      });
      setSentiment(result);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to analyze market sentiment.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const sentimentValue = sentiment ? (sentiment.overallSentimentScore + 1) * 50 : 0;
  const sentimentColor = sentimentValue > 60 ? 'bg-green-500' : sentimentValue < 40 ? 'bg-red-500' : 'bg-yellow-500';
  const sentimentLabel = sentimentValue > 60 ? 'Positive' : sentimentValue < 40 ? 'Negative' : 'Neutral';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Real-Time Market Sentiment</CardTitle>
        <CardDescription>AI-powered sentiment analysis from news and social media.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="min-h-[200px] flex flex-col justify-center items-center space-y-4">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : sentiment ? (
            <div className="w-full space-y-4">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Overall Sentiment</p>
                    <p className="text-2xl font-bold">{sentimentLabel}</p>
                </div>
                <Progress value={sentimentValue} className="h-3" indicatorClassName={sentimentColor} />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold mb-2 text-green-400">Positive Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                            {sentiment.positiveKeywords.map(kw => <Badge key={kw} variant="outline" className="border-green-500/50">{kw}</Badge>)}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2 text-red-400">Negative Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                            {sentiment.negativeKeywords.map(kw => <Badge key={kw} variant="outline" className="border-red-500/50">{kw}</Badge>)}
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-4">
              <p>Click below to analyze current market sentiment from aggregated live data.</p>
            </div>
          )}
        </div>
        <Button onClick={handleAnalyze} disabled={isLoading} className="w-full mt-4">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Analyze Sentiment'}
        </Button>
      </CardContent>
    </Card>
  );
}
