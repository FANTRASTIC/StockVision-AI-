
'use client';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AlertsPage({ isTab }: { isTab?: boolean }) {
  const content = (
    <main className="p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>This is a placeholder for the alerts page. You can manage price alerts, news alerts, and other notifications here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Alerts Management Content Goes Here</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );

  if (isTab) {
    return content;
  }

  return (
    <>
      <Sidebar>
        <SidebarNav activeTab="alerts" setActiveTab={() => {}} />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader selectedTicker={''} onTickerSelect={() => {}} />
        {content}
      </SidebarInset>
    </>
  );
}
