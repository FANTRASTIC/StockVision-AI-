'use client';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

type ComposedStockChartProps = {
    data: any[];
    showMA50: boolean;
    showMA200: boolean;
    showForecast: boolean;
};

export function ComposedStockChart({ data, showMA50, showMA200, showForecast }: ComposedStockChartProps) {
  const areaData = data.map((d) => ({
    date: d.date,
    close: d.close,
    ma50: d.ma50,
    ma200: d.ma200,
    forecast: d.forecast,
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={areaData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" hide={false} tick={{ fontSize: 12 }} minTickGap={24} />
        <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="close" name="Close" dot={false} stroke="hsl(var(--primary))" strokeOpacity={0.9} fillOpacity={0.15} fill="url(#colorClose)" />
        {showMA50 && <Line type="monotone" dataKey="ma50" name="MA 50" dot={false} stroke="hsl(var(--chart-2))" />}
        {showMA200 && <Line type="monotone" dataKey="ma200" name="MA 200" dot={false} stroke="hsl(var(--chart-4))" />}
        {showForecast && <Line type="monotone" dataKey="forecast" name="Forecast" strokeDasharray="6 6" dot={false} stroke="hsl(var(--chart-5))" />}
      </AreaChart>
    </ResponsiveContainer>
  );
}
