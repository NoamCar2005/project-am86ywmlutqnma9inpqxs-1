import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Plus, 
  History, 
  Edit3, 
  CreditCard, 
  Settings, 
  User,
  Sparkles,
  MessageCircle,
  Database,
  Shield
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "דאשבורד",
    url: "/",
    icon: Home,
  },
  {
    title: "קריאייטיב חדש",
    url: "/create",
    icon: Plus,
  },
  {
    title: "היסטוריית קריאייטיבים",
    url: "/history",
    icon: History,
  },
  {
    title: "עוזר השיווק",
    url: "/marketing-assistant",
    icon: MessageCircle,
  },
  {
    title: "ניהול נתונים",
    url: "/data-management",
    icon: Database,
  },
  {
    title: "עריכה",
    url: "/editor",
    icon: Edit3,
  },
  {
    title: "ניהול מערכת",
    url: "/admin",
    icon: Shield,
  },
];

const accountItems = [
  {
    title: "ניהול קרדיטים",
    url: "/billing",
    icon: CreditCard,
  },
  {
    title: "הגדרות",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "פרופיל",
    url: "/profile",
    icon: User,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar side="right" className="border-l border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="AdCraftAI logo"
            className="w-10 h-10 object-contain rounded-lg shadow-sm"
            style={{ background: 'transparent' }}
          />
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">AdCraftAI</h2>
            <p className="text-xs text-sidebar-foreground/70">יצירת תוכן חכמה</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>תפריט ראשי</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>חשבון</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button 
          asChild 
          className="w-full gradient-primary text-white hover:opacity-90"
        >
          <Link to="/create">
            <Plus className="w-4 h-4 ml-2" />
            צור קריאייטיב חדש
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}