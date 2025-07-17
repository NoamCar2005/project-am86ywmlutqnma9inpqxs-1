// This file defines the main App component for AdCraftAI.
// It sets up the main structure, routes (pages), and important tools for the whole app.
//
// What happens here:
// - We import tools and pages we need.
// - We set up things like notifications, tooltips, and data fetching.
// - We tell the app which page to show for each URL.

import { Toaster } from "@/components/ui/toaster"; // Shows toast notifications (pop-up messages)
import { Toaster as Sonner } from "@/components/ui/sonner"; // Another type of notification system
import { TooltipProvider } from "@/components/ui/tooltip"; // Lets us show helpful tooltips
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Handles data fetching and caching
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Lets us show different pages for different URLs
import Layout from "./layout/Layout"; // The main layout (sidebar, etc.)
import Dashboard from "./pages/Dashboard"; // The dashboard page
import CreateCreative from "./pages/CreateCreative"; // The page to create a new creative
import CreativeHistory from "./pages/CreativeHistory"; // The page to see past creatives
import CreativeEditor from "./pages/CreativeEditor"; // The page to edit a creative
import BillingPage from "./pages/BillingPage"; // The billing/credits page
import SettingsPage from "./pages/SettingsPage"; // The settings page
import MarketingAssistant from "./pages/MarketingAssistant"; // The marketing assistant page
import DataManagement from "./pages/DataManagement"; // The data management page
import AdminPage from "./pages/AdminPage"; // The admin page
import NotFound from "./pages/NotFound"; // The 404 (not found) page
import { makeDebugGloballyAvailable } from "@/lib/debug-avatar-connection"; // Debug functions

const queryClient = new QueryClient(); // This helps manage data requests and caching

// Initialize debug functions globally
if (typeof window !== 'undefined') {
  makeDebugGloballyAvailable();
}

// The main App component
const App = () => (
  <QueryClientProvider client={queryClient}> {/* Makes data fetching work everywhere */}
    <TooltipProvider> {/* Lets us use tooltips everywhere */}
      <Toaster /> {/* Shows toast notifications */}
      <Sonner /> {/* Shows another type of notifications */}
      <BrowserRouter> {/* Handles page navigation by URL */}
        <Layout> {/* Adds the sidebar and main layout */}
          <Routes> {/* Defines which page to show for each URL */}
            <Route path="/" element={<Dashboard />} /> {/* Home page */}
            <Route path="/create" element={<CreateCreative />} /> {/* Create new creative */}
            <Route path="/history" element={<CreativeHistory />} /> {/* Creative history */}
            <Route path="/editor" element={<CreativeEditor />} /> {/* Creative editor */}
            <Route path="/marketing-assistant" element={<MarketingAssistant />} /> {/* Marketing assistant */}
            <Route path="/billing" element={<BillingPage />} /> {/* Billing/credits */}
            <Route path="/settings" element={<SettingsPage />} /> {/* Settings */}
            <Route path="/data-management" element={<DataManagement />} /> {/* Data management */}
            <Route path="/admin" element={<AdminPage />} /> {/* Admin page */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} /> {/* 404 page for unknown URLs */}
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App; // Makes this component available to other files