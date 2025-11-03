'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type StatCardProps = {
    title: string;
    value: string | number;
    sub: string;
    Icon: LucideIcon;
}

export function StatCard({ title, value, sub, Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="w-4 h-4" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        <div className="text-xs opacity-70 mt-1">{sub}</div>
      </CardContent>
    </Card>
  );
}
