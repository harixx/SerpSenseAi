import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home.tsx";
import AnalyticsDashboard from "@/pages/analytics-dashboard";
import TrackingGuide from "@/pages/tracking-guide";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/analytics" component={AnalyticsDashboard} />
      <Route path="/tracking" component={TrackingGuide} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
