'use client';

import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Bot,
  Calculator,
  TrendingUp,
} from "lucide-react";

interface BankSidebarProps {
  className?: string;
}

export function BankSidebar({ className = "" }: BankSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/bank",
    },
    {
      icon: Users,
      label: "At-Risk Customers",
      path: "/bank/at-risk",
    },
    {
      icon: Bot,
      label: "AI Agent",
      path: "/bank/ai-agent",
    },
    {
      icon: Calculator,
      label: "Intervention Planner",
      path: "/bank/intervention-planner",
    },
  ];

  return (
    <div className={`w-64 bg-[#0074A3] text-white min-h-screen flex flex-col ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-8 h-8" />
          <div>
            <h1 className="font-bold text-lg">PRE-DELINQUENCY</h1>
            <p className="text-xs text-blue-200">INTERVENTION ENGINE</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#00A9CE] text-white"
                    : "text-blue-100 hover:bg-[#005F82] hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-blue-400/30">
        <div className="bg-[#005F82] rounded-lg p-3">
          <p className="text-xs font-semibold">Ops Lead Alpha</p>
          <p className="text-xs text-blue-200">Tier 1 Authorization</p>
        </div>
      </div>
    </div>
  );
}