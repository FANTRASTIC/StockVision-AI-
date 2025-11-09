
'use client';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import {
  BarChart2,
  Settings,
  LifeBuoy,
  Home,
  Wallet,
  Bell,
  Bot,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.logo className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-headline font-semibold">StockWise AI</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Dashboard"
              href="/"
              isActive={pathname === '/'}
            >
              <Home />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Portfolio" 
              href="/portfolio"
              isActive={pathname === '/portfolio'}
            >
              <Wallet />
              <span>Portfolio</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="AI Tools" 
              href="/ai-tools"
              isActive={pathname === '/ai-tools'}
            >
              <Bot />
              <span>AI Tools</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Charts" 
              href="/charts"
              isActive={pathname === '/charts'}
            >
              <BarChart2 />
              <span>Charts</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Alerts" 
              href="/alerts"
              isActive={pathname === '/alerts'}
            >
              <Bell />
              <span>Alerts</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" href="#">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Support" href="#">
              <LifeBuoy />
              <span>Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
