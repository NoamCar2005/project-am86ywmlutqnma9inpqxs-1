// This file defines the main layout for the AdCraftAI app.
// It adds the sidebar and wraps the main content area for every page.
//
// What happens here:
// - We use a SidebarProvider to manage the sidebar's state (open/closed).
// - We show the AppSidebar on the side.
// - We show the main content (children) next to the sidebar.

import { SidebarProvider } from "@/components/ui/sidebar"; // Handles sidebar state
import { AppSidebar } from "@/components/AppSidebar"; // The sidebar with navigation links

interface LayoutProps {
  children: React.ReactNode; // The main content to show (the current page)
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider> {/* Lets us control the sidebar everywhere inside */}
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50/30"> {/* Main layout: sidebar + content */}
        <AppSidebar /> {/* The sidebar on the side */}
        <main className="flex-1 overflow-auto"> {/* The main content area */}
          {children} {/* Show the current page here */}
        </main>
      </div>
    </SidebarProvider>
  );
}