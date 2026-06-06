import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Directory from "@/pages/Directory";
import DesignerProfile from "@/pages/DesignerProfile";
import BoutiqueDirectory from "@/pages/BoutiqueDirectory";
import BoutiqueProfile from "@/pages/BoutiqueProfile";
import ProductDetail from "@/pages/ProductDetail";
import Messages from "@/pages/Messages";
import About from "@/pages/About";
import Favorites from "@/pages/Favorites";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import B2BDashboard from "@/pages/B2BDashboard";
import B2BOrders from "@/pages/B2BOrders";
import B2BOrderDetail from "@/pages/B2BOrderDetail";
import B2BRequests from "@/pages/B2BRequests";
import B2BCatalog from "@/pages/B2BCatalog";
import B2BOpportunityDetail from "@/pages/B2BOpportunityDetail";
import B2BShortlist from "@/pages/B2BShortlist";
import B2BProject from "@/pages/B2BProject";
import B2BProjects from "@/pages/B2BProjects";
import InvitationsDemo from "@/pages/InvitationsDemo";
import WorkflowDemo from "@/pages/WorkflowDemo";
import MyProfile from "@/pages/MyProfile";
import FashionMap from "@/components/FashionMap";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import { AppStoreProvider } from "@/contexts/AppStore";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/shop" component={Shop} />
        <Route path="/boutiques/:id" component={BoutiqueProfile} />
        <Route path="/boutiques" component={BoutiqueDirectory} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/designers/:id" component={DesignerProfile} />
        <Route path="/designers">
          <Directory
            type="Designer"
            eyebrow="Meet the Designers"
            title="Les Maisons de demain"
            subtitle="Designers indépendants qui réinventent la silhouette algérienne."
          />
        </Route>
        <Route path="/ateliers">
          <Directory
            type="Atelier"
            eyebrow="Discover Ateliers"
            title="Les Mains du Métier"
            subtitle="Ateliers gardiens du savoir-faire — broderies, coupes et finitions d'exception."
          />
        </Route>
        <Route path="/fabric-retailers">
          <Directory
            type="Fournisseur"
            eyebrow="Fabric Retailers"
            title="La Matière Rare"
            subtitle="Fournisseurs de tissus précieux, soies, brocarts et cotonnades de caractère."
          />
        </Route>
        <Route path="/about" component={About} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/b2b" component={B2BDashboard} />
        <Route path="/b2b/network" component={B2BDashboard} />
        <Route path="/b2b/opportunities" component={B2BDashboard} />
        <Route path="/b2b/messages" component={B2BDashboard} />
        <Route path="/b2b/projects" component={B2BProjects} />
        <Route path="/b2b/projects/:id" component={B2BProject} />
        <Route path="/b2b/feed/:id" component={B2BOpportunityDetail} />
        <Route path="/b2b/feed" component={B2BFeedRedirect} />
        <Route path="/b2b/shortlist" component={B2BShortlist} />
        <Route path="/b2b/orders/:id" component={B2BOrderDetail} />
        <Route path="/b2b/orders" component={B2BOrders} />
        <Route path="/b2b/requests" component={B2BRequests} />
        <Route path="/b2b/catalog" component={B2BCatalog} />
        <Route path="/profile" component={MyProfile} />
        <Route path="/invitations-demo" component={InvitationsDemo} />
        <Route path="/workflow-demo" component={WorkflowDemo} />
        <Route path="/messages" component={Messages} />
        <Route path="/map" component={FashionMap} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function B2BFeedRedirect() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/b2b/opportunities", { replace: true });
  }, [navigate]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStoreProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AppStoreProvider>
    </QueryClientProvider>
  );
}

export default App;
