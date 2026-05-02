import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Onboarding from "@/pages/onboarding";
import Feed from "@/pages/feed";
import Matches from "@/pages/matches";
import Squads from "@/pages/squads";
import Zone from "@/pages/zone";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Onboarding} />
        <Route path="/feed" component={Feed} />
        <Route path="/matches" component={Matches} />
        <Route path="/squads" component={Squads} />
        <Route path="/zone/:zone" component={Zone} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
