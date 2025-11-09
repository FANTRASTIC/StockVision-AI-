
'use client';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function PortfolioPage() {
  return (
    <>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader selectedTicker={''} onTickerSelect={() => {}} />
        <main className="p-4 sm:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>This is a placeholder for your portfolio page. You can display user's holdings, performance charts, and allocation breakdowns here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Portfolio Content Goes Here</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </>
  );
}
