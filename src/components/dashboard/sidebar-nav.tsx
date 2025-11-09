
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

interface SidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function SidebarNav({ activeTab, setActiveTab }: SidebarNavProps) {
  const handleNav = (tab: string) => {
    setActiveTab(tab);
  };

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
              onClick={() => handleNav('dashboard')}
              isActive={activeTab === 'dashboard'}
            >
              <Home />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Portfolio"
              onClick={() => handleNav('portfolio')}
              isActive={activeTab === 'portfolio'}
            >
              <Wallet />
              <span>Portfolio</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="AI Tools"
              onClick={() => handleNav('ai-tools')}
              isActive={activeTab === 'ai-tools'}
            >
              <Bot />
              <span>AI Tools</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Charts"
              onClick={() => handleNav('charts')}
              isActive={activeTab === 'charts'}
            >
              <BarChart2 />
              <span>Charts</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Alerts"
              onClick={() => handleNav('alerts')}
              isActive={activeTab === 'alerts'}
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
