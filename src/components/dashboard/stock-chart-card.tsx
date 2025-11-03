'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from 'recharts';
import { combinedChartData } from '@/lib/data';
import { ChartTooltipContent } from '@/components/ui/chart';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-card border border-border rounded-lg shadow-lg">
        <p className="font-bold text-card-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          Open: <span className="font-medium text-card-foreground">${payload[0]?.payload.open}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          High: <span className="font-medium text-card-foreground">${payload[0]?.payload.high}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Low: <span className="font-medium text-card-foreground">${payload[0]?.payload.low}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Close: <span className="font-medium text-card-foreground">${payload[0]?.payload.close}</span>
        </p>
      </div>
    );
  }

  return null;
};


const Candlestick = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isGrowing = open < close;
  const color = isGrowing ? '#4CAF50' : '#F44336';

  return (
    <g>
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} stroke={color} />
      <rect x={x} y={isGrowing ? y + (height * (high-close))/(high-low) : y + (height * (high-open))/(high-low)} width={width} height={Math.abs(open - close) / (high-low) * height} fill={color} />
    </g>
  );
};


export function StockChartCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline">AAPL/USD</CardTitle>
            <CardDescription>Apple Inc. Daily Chart</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{combinedChartData[combinedChartData.length-1].close}</p>
            <p className={`text-sm ${combinedChartData[combinedChartData.length-1].close > combinedChartData[combinedChartData.length-2].close ? 'text-green-500' : 'text-red-500'}`}>
              { (combinedChartData[combinedChartData.length-1].close - combinedChartData[combinedChartData.length-2].close).toFixed(2)} 
              ({((combinedChartData[combinedChartData.length-1].close - combinedChartData[combinedChartData.length-2].close) / combinedChartData[combinedChartData.length-2].close * 100).toFixed(2)}%)
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
           <ResponsiveContainer width="100%" height="70%">
            <ComposedChart data={combinedChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))"/>
              <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis domain={['dataMin - 10', 'dataMax + 10']} orientation="left" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="close" shape={<Candlestick />} />
            </ComposedChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height="30%">
             <ComposedChart data={combinedChartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} hide/>
                <YAxis yAxisId="left" domain={[0, 100]} orientation="left" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false}/>
                <YAxis yAxisId="right" domain={['dataMin - 1', 'dataMax + 1']} orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="rsi" stroke="hsl(var(--chart-1))" dot={false} name="RSI"/>
                <Line yAxisId="right" type="monotone" dataKey="macd" stroke="hsl(var(--chart-2))" dot={false} name="MACD"/>
                <Line yAxisId="right" type="monotone" dataKey="signal" stroke="#facc15" dot={false} name="Signal"/>
                <Bar yAxisId="right" dataKey="histogram" fill="hsl(var(--muted))" name="Histogram" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
