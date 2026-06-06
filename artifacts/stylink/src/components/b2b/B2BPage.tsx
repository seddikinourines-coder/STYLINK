import type { ReactNode } from "react";
import { useAppStore } from "@/contexts/AppStore";
import B2BShell from "@/components/b2b/B2BShell";
import { B2BShellContextProvider } from "@/components/b2b/B2BShellContext";
import { B2BGuard } from "@/components/b2b/B2BGuard";

export default function B2BPage({ children }: { children: ReactNode }) {
  const { user } = useAppStore();

  if (!user || user.type !== "business") {
    return <B2BGuard>{null}</B2BGuard>;
  }

  return (
    <B2BShellContextProvider>
      <B2BShell>{children}</B2BShell>
    </B2BShellContextProvider>
  );
}
