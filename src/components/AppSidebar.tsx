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
  Sparkles
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "לוח מחוונים",
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
    title: "עורך",
    url: "/editor",
    icon: Edit3,
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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
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