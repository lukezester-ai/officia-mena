import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useEffect } from 'react';
import NotFound from '@/pages/not-found';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Warehouse } from './pages/Warehouse';
import { Invoices } from './pages/Invoices';
import { Accounting } from './pages/Accounting';
import { Contacts } from './pages/Contacts';
import { Reports } from './pages/Reports';
import { HR } from './pages/HR';
import { VAT } from './pages/VAT';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/warehouse" component={Warehouse} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/accounting" component={Accounting} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/reports" component={Reports} />
        <Route path="/hr" component={HR} />
        <Route path="/vat" component={VAT} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  // Enforce dark theme and RTL
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
