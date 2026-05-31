import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface SidebarContextValue {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  const setOpen = useCallback((open: boolean) => setIsOpen(open), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({ isOpen, setOpen, toggle }),
    [isOpen, setOpen, toggle]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}

/** Subscribe to sidebar open state only (Sidebar + Header). */
export function useSidebarOpen(): boolean {
  return useSidebar().isOpen;
}

/** Stable toggle/setters — no re-render when only isOpen changes. */
export function useSidebarControls() {
  const { setOpen, toggle } = useSidebar();
  return useMemo(() => ({ setOpen, toggle }), [setOpen, toggle]);
}
