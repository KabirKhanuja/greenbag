'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cloneLayouts, defaultLayouts } from "./gridLayouts";
import type { LayoutsByBreakpoint } from "./gridLayouts";

type DashboardLayoutsContextValue = {
  layouts: LayoutsByBreakpoint;
  setLayouts: React.Dispatch<React.SetStateAction<LayoutsByBreakpoint>>;
  resetLayouts: () => void;
};

const DashboardLayoutsContext = createContext<DashboardLayoutsContextValue | null>(null);

export function DashboardLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [layouts, setLayouts] = useState<LayoutsByBreakpoint>(() =>
    cloneLayouts(defaultLayouts)
  );

  const resetLayouts = useCallback(() => {
    setLayouts(cloneLayouts(defaultLayouts));
  }, []);

  const value = useMemo(
    () => ({ layouts, setLayouts, resetLayouts }),
    [layouts, resetLayouts]
  );

  return (
    <DashboardLayoutsContext.Provider value={value}>
      {children}
    </DashboardLayoutsContext.Provider>
  );
}

export function useDashboardLayouts() {
  const ctx = useContext(DashboardLayoutsContext);
  if (!ctx) {
    throw new Error(
      "useDashboardLayouts must be used within <DashboardLayoutProvider>"
    );
  }
  return ctx;
}
