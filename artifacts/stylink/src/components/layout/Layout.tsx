import { ReactNode } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface LayoutProps {
  children: ReactNode;
}

const B2B_DASHBOARD_PATHS = new Set([
  "/b2b",
  "/b2b/",
  "/b2b/network",
  "/b2b/opportunities",
  "/b2b/messages",
]);

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isB2BDashboard = B2B_DASHBOARD_PATHS.has(location);

  if (isB2BDashboard) {
    return <div className="min-h-[100dvh] flex flex-col">{children}</div>;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col pt-20">{children}</main>
      <Footer />
    </div>
  );
}
