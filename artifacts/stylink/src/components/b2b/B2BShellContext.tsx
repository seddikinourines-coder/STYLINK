import { createContext, useContext, useState, type ReactNode } from "react";

interface ShellContextValue {
  search: string;
  setSearch: (value: string) => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

export function B2BShellContextProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  return (
    <ShellContext.Provider value={{ search, setSearch }}>
      {children}
    </ShellContext.Provider>
  );
}

export function useB2BShell(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx)
    throw new Error("useB2BShell must be used inside <B2BShellContextProvider>");
  return ctx;
}
