import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { useEffect } from "react";
import { initializeGA } from "./lib/google-analytics";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home.tsx";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* Legacy routes redirect to secure admin login */}
      <Route path="/analytics">
        <Redirect to="/admin/login" />
      </Route>
      <Route path="/tracking">
        <Redirect to="/admin/login" />
      </Route>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin" component={AdminLogin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize Google Analytics 4 tracking
    const ga = initializeGA();
    if (ga) {
      console.log('Google Analytics 4 initialized for Imperius');
    } else {
      console.warn('GA4 not initialized - missing VITE_GA_MEASUREMENT_ID');
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
