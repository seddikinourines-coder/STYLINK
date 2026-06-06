import { useLocation } from "wouter";
import B2BPage from "@/components/b2b/B2BPage";
import FeedTab from "@/components/b2b/tabs/FeedTab";
import NetworkTab from "@/components/b2b/tabs/NetworkTab";
import OpportunitiesTab from "@/components/b2b/tabs/OpportunitiesTab";
import MessagesTab from "@/components/b2b/tabs/MessagesTab";

export default function B2BDashboard() {
  const [location] = useLocation();

  let content: React.ReactNode;
  if (location.startsWith("/b2b/network")) {
    content = <NetworkTab />;
  } else if (location.startsWith("/b2b/opportunities")) {
    content = <OpportunitiesTab />;
  } else if (location.startsWith("/b2b/messages")) {
    content = <MessagesTab />;
  } else {
    content = <FeedTab />;
  }

  return <B2BPage>{content}</B2BPage>;
}
