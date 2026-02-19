import type { ReactNode } from "react";
import { DashboardLayoutProvider } from "./DashboardLayoutProvider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutProvider>{children}</DashboardLayoutProvider>;
}
