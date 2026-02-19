'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Bell, Settings, TrendingUp, TrendingDown, AlertCircle, AlertTriangle, Bot, X, Send, GripVertical } from "lucide-react";
import { BankSidebar } from "@/components/BankSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Responsive, getCompactor } from "react-grid-layout";
import type { Layout, LayoutItem } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { useDashboardLayouts } from "./DashboardLayoutProvider";

const ResponsiveGridLayout = Responsive;

export default function BankDashboard() {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const { layouts, setLayouts, resetLayouts } = useDashboardLayouts();
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [gridWidth, setGridWidth] = useState<number>(0);
  const [animateIn, setAnimateIn] = useState(false);
  const [breakpoint, setBreakpoint] = useState<string>("lg");
  const layoutBeforeDragRef = useRef<Layout | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [chatInput, setChatInput] = useState("");

  const handleResetLayout = () => {
    layoutBeforeDragRef.current = null;
    resetLayouts();
  };

  const colsByBreakpoint = useMemo(
    () => ({ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }),
    []
  );

  const getOverlapArea = (a: LayoutItem, b: LayoutItem): number => {
    const left = Math.max(a.x, b.x);
    const right = Math.min(a.x + a.w, b.x + b.w);
    const top = Math.max(a.y, b.y);
    const bottom = Math.min(a.y + a.h, b.y + b.h);
    const width = right - left;
    const height = bottom - top;
    if (width <= 0 || height <= 0) return 0;
    return width * height;
  };

  const hasAnyOverlap = (layout: Layout): boolean => {
    for (let i = 0; i < layout.length; i++) {
      for (let j = i + 1; j < layout.length; j++) {
        if (getOverlapArea(layout[i], layout[j]) > 0) return true;
      }
    }
    return false;
  };

  const resolveVerticalOverlaps = (
    layout: Layout,
    keepOnTopIds: Set<string> = new Set()
  ): Layout => {
    // Push items down until no overlaps remain.
    // If two items start on the same row, prefer keeping "keepOnTopIds" in place.
    const next = layout.map((item) => ({ ...item }));

    for (let safety = 0; safety < 50; safety++) {
      let movedAnything = false;
      for (let i = 0; i < next.length; i++) {
        for (let j = i + 1; j < next.length; j++) {
          const a = next[i];
          const b = next[j];
          if (getOverlapArea(a, b) <= 0) continue;

          let upper: LayoutItem;
          let lower: LayoutItem;

          if (a.y === b.y) {
            const aPinned = keepOnTopIds.has(a.i);
            const bPinned = keepOnTopIds.has(b.i);

            if (aPinned && !bPinned) {
              upper = a;
              lower = b;
            } else if (bPinned && !aPinned) {
              upper = b;
              lower = a;
            } else {
              // Stable fallback: keep the larger footprint in place.
              const aArea = a.w * a.h;
              const bArea = b.w * b.h;
              upper = aArea >= bArea ? a : b;
              lower = upper === a ? b : a;
            }
          } else {
            upper = a.y < b.y ? a : b;
            lower = upper === a ? b : a;
          }
          const requiredY = upper.y + upper.h;
          if (lower.y < requiredY) {
            lower.y = requiredY;
            movedAnything = true;
          }
        }
      }
      if (!movedAnything) break;
    }

    return next;
  };

  const pushRowMatesBelowIfFullWidth = (
    layout: Layout,
    movedId: string,
    cols: number
  ): Layout => {
    const moved = layout.find((i) => i.i === movedId);
    if (!moved) return layout;

    if (moved.w < cols) return layout;

    const rowY = moved.y;
    const belowY = moved.y + moved.h;

    return layout.map((item) => {
      if (item.i === movedId) {
        return { ...item, x: 0, w: cols };
      }
      if (item.y === rowY) {
        return { ...item, y: belowY };
      }
      return item;
    });
  };

  const detectSwapTarget = (
    layoutAtDragStart: Layout | null,
    oldItem: LayoutItem | null,
    newItem: LayoutItem | null
  ): string | null => {
    if (!layoutAtDragStart || !oldItem || !newItem) {
      return null;
    }

    // Find which card from the original layout the dragged card now overlaps most with
    let bestTarget: LayoutItem | null = null;
    let bestArea = 0;
    
    for (const candidate of layoutAtDragStart) {
      if (candidate.i === newItem.i) continue;
      const area = getOverlapArea(newItem, candidate);
      if (area > bestArea) {
        bestArea = area;
        bestTarget = candidate;
      }
    }

    // Only swap if there's significant overlap (at least 30% of the moved card's area)
    const movedArea = Math.max(1, newItem.w * newItem.h);
    if (!bestTarget || bestArea / movedArea < 0.3) {
      return null;
    }

    return bestTarget.i;
  };

  const fitRow = (layout: Layout, rowY: number, cols: number): Layout => {
    const rowItems = layout
      .filter((item) => item.y === rowY)
      .slice()
      .sort((a, b) => a.x - b.x);

    if (rowItems.length <= 1) return layout;

    const minWById = new Map<string, number>();
    for (const item of rowItems) {
      minWById.set(item.i, Math.max(1, item.minW ?? 1));
    }

    const totalMinW = rowItems.reduce(
      (sum, item) => sum + (minWById.get(item.i) ?? 1),
      0
    );

    // If min widths can't fit, don't force anything crazy; just normalize x positions.
    if (totalMinW > cols) {
      const normalized = new Map<string, { x: number; w: number }>();
      let x = 0;
      for (const item of rowItems) {
        normalized.set(item.i, { x, w: item.w });
        x += item.w;
      }
      return layout.map((item) => {
        const next = normalized.get(item.i);
        return next ? { ...item, x: next.x } : item;
      });
    }

    // Start from current widths but ensure they're at least minW.
    const widths = rowItems.map((item) =>
      Math.max(minWById.get(item.i) ?? 1, item.w)
    );

    const sumW = () => widths.reduce((s, w) => s + w, 0);

    // If too wide, shrink down (largest slack first) until it fits.
    while (sumW() > cols) {
      let bestIndex = -1;
      let bestSlack = 0;
      for (let idx = 0; idx < rowItems.length; idx++) {
        const item = rowItems[idx];
        const minW = minWById.get(item.i) ?? 1;
        const slack = widths[idx] - minW;
        if (slack > bestSlack) {
          bestSlack = slack;
          bestIndex = idx;
        }
      }
      if (bestIndex === -1) break;
      widths[bestIndex] -= 1;
    }

    // If there's leftover space, give it to the last card in the row.
    if (sumW() < cols) {
      widths[widths.length - 1] += cols - sumW();
    }

    const normalized = new Map<string, { x: number; w: number }>();
    let x = 0;
    for (let idx = 0; idx < rowItems.length; idx++) {
      const item = rowItems[idx];
      const w = widths[idx];
      normalized.set(item.i, { x, w });
      x += w;
    }

    return layout.map((item) => {
      const next = normalized.get(item.i);
      return next ? { ...item, x: next.x, w: next.w } : item;
    });
  };

  const autoFitRowForItem = (layout: Layout, movedItem: LayoutItem | null) => {
    if (!movedItem) return;
    const cols =
      colsByBreakpoint[breakpoint as keyof typeof colsByBreakpoint] ?? 12;
    const nextLayout = fitRow(layout, movedItem.y, cols);
    setLayouts((prev) => ({
      ...prev,
      [breakpoint]: nextLayout,
    }));
  };

  const handleResizeStop = (
    currentLayout: Layout,
    oldItem: LayoutItem | null,
    newItem: LayoutItem | null
  ) => {
    const cols =
      colsByBreakpoint[breakpoint as keyof typeof colsByBreakpoint] ?? 12;

    const movedId = newItem?.i ?? oldItem?.i;
    if (!movedId) return;

    const movedAfter = currentLayout.find((i) => i.i === movedId);
    if (!movedAfter) return;

    // If resized to full width, push anything sharing the row below it.
    const working = pushRowMatesBelowIfFullWidth(currentLayout, movedId, cols);

    // 1) Fix horizontal overlaps in the moved row by resizing neighbors.
    let nextLayout = fitRow(working, movedAfter.y, cols);

    // 2) If any overlaps remain (usually from height increases), push cards down.
    if (hasAnyOverlap(nextLayout)) {
      nextLayout = resolveVerticalOverlaps(nextLayout, new Set([movedId]));
    }

    // 3) Normalize rows after any vertical pushes.
    const uniqueYs = Array.from(new Set(nextLayout.map((i) => i.y)));
    for (const y of uniqueYs) {
      nextLayout = fitRow(nextLayout, y, cols);
    }

    setLayouts((prev) => ({
      ...prev,
      [breakpoint]: nextLayout,
    }));
  };

  const handleDragStart = (currentLayout: Layout) => {
    // Snapshot so we can do stable swaps and/or snap back.
    layoutBeforeDragRef.current = currentLayout.map((item) => ({ ...item }));
  };

  const handleDragStop = (
    currentLayout: Layout,
    oldItem: LayoutItem | null,
    newItem: LayoutItem | null
  ) => {
    if (!oldItem || !newItem) return;

    const cols =
      colsByBreakpoint[breakpoint as keyof typeof colsByBreakpoint] ?? 12;

    // Check if we should swap with another card
    const swapTargetId = detectSwapTarget(
      layoutBeforeDragRef.current,
      oldItem,
      newItem
    );

    const before = layoutBeforeDragRef.current;
    let nextLayout: Layout = currentLayout;

    // Prefer computing swaps from the pre-drag snapshot (it is guaranteed non-overlapping).
    if (swapTargetId && before) {
      const targetInStart = before.find((item) => item.i === swapTargetId);
      if (targetInStart) {
        nextLayout = before.map((item) => {
          if (item.i === newItem.i) {
            return { ...item, x: targetInStart.x, y: targetInStart.y };
          }
          if (item.i === swapTargetId) {
            return { ...item, x: oldItem.x, y: oldItem.y };
          }
          return item;
        });
      }
    }

    // If the moved card is (or becomes) full-width, push other cards in that row below it.
    nextLayout = pushRowMatesBelowIfFullWidth(nextLayout, newItem.i, cols);

    // Collect all affected rows and fit them (use post-swap positions for correctness)
    const affectedYs = new Set<number>();
    affectedYs.add(newItem.y);
    affectedYs.add(oldItem.y);

    const movedAfter = nextLayout.find((i) => i.i === newItem.i);
    if (movedAfter) affectedYs.add(movedAfter.y);

    if (swapTargetId) {
      const swappedAfter = nextLayout.find((i) => i.i === swapTargetId);
      if (swappedAfter) affectedYs.add(swappedAfter.y);
    }

    for (const y of affectedYs) {
      nextLayout = fitRow(nextLayout, y, cols);
    }

    // Enforce: never persist overlaps after drop.
    // Prefer reflow (push down) over snapping back, only snap back if reflow can't resolve.
    if (hasAnyOverlap(nextLayout)) {
      nextLayout = resolveVerticalOverlaps(nextLayout, new Set([newItem.i]));

      const uniqueYs = Array.from(new Set(nextLayout.map((i) => i.y)));
      for (const y of uniqueYs) {
        nextLayout = fitRow(nextLayout, y, cols);
      }

      if (hasAnyOverlap(nextLayout) && before) {
        nextLayout = swapTargetId ? nextLayout : before;
      }
    }

    setLayouts((prev) => ({
      ...prev,
      [breakpoint]: nextLayout,
    }));

    // Clear snapshot
    layoutBeforeDragRef.current = null;
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 60);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const element = gridContainerRef.current;
    if (!element) return;

    const updateWidth = () => {
      const nextWidth = element.getBoundingClientRect().width;
      if (Number.isFinite(nextWidth) && nextWidth > 0) setGridWidth(nextWidth);
    };

    // Set an initial width ASAP to avoid the first render laying out at 0px.
    updateWidth();

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setGridWidth(entry.contentRect.width);
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  const weeklyTrendData = useMemo(
    () => [
      { day: "MON", newCases: 45, interventions: 38 },
      { day: "TUE", newCases: 52, interventions: 42 },
      { day: "WED", newCases: 48, interventions: 45 },
      { day: "THU", newCases: 58, interventions: 50 },
      { day: "FRI", newCases: 62, interventions: 55 },
      { day: "SAT", newCases: 68, interventions: 60 },
      { day: "SUN", newCases: 72, interventions: 65 },
    ],
    []
  );

  const [weeklyTrendSeries, setWeeklyTrendSeries] = useState(() =>
    weeklyTrendData.map((d) => ({ ...d, newCases: 0, interventions: 0 }))
  );

  useEffect(() => {
    if (!animateIn) return;
    const timer = setTimeout(() => setWeeklyTrendSeries(weeklyTrendData), 80);
    return () => clearTimeout(timer);
  }, [animateIn, weeklyTrendData]);

  const riskDistributionData = useMemo(
    () => [
      { name: "Low Risk", value: 54, color: "#86efac" },
      { name: "Moderate", value: 28, color: "#fcd34d" },
      { name: "High Risk", value: 18, color: "#fca5a5" },
    ],
    []
  );

  const [riskDistributionSeries, setRiskDistributionSeries] = useState(() =>
    riskDistributionData.map((d) => ({ ...d, value: 0 }))
  );

  useEffect(() => {
    if (!animateIn) return;
    const timer = setTimeout(
      () => setRiskDistributionSeries(riskDistributionData),
      80
    );
    return () => clearTimeout(timer);
  }, [animateIn, riskDistributionData]);

  const financialStressIndicators = [
    { name: "Salary Delay (>3 Days)", cases: 842, color: "#7dd3fc" },
    { name: "Savings Depletion Rate (>20% MoM)", cases: 612, color: "#93c5fd" },
    { name: "High-Interest Micro-Loan Apps", cases: 429, color: "#a5b4fc" },
    { name: "Overdraft Occurrence (x3+)", cases: 310, color: "#c4b5fd" },
  ];

  const modelFeatureImportance = [
    { feature: "Cash Flow", importance: 35 },
    { feature: "Utilization", importance: 25 },
    { feature: "Payment History", importance: 20 },
    { feature: "Spend Velocity", importance: 15 },
    { feature: "Demographics", importance: 5 },
  ];

  const atRiskCustomers = [
    {
      id: "8829-X-4421",
      name: "Sharma, Rajesh",
      riskScore: 92,
      trigger: "SALARY DELAY (4D)",
      action: "Immediate Phone Intervention",
      status: "Urgent",
    },
    {
      id: "1104-B-8923",
      name: "Singh, Anjali",
      riskScore: 88,
      trigger: "SAVINGS DEPLETION",
      action: "Soft Nudge SMS / Email",
      status: "Pending",
    },
    {
      id: "7732-K-0012",
      name: "Gupta, Neha",
      riskScore: 74,
      trigger: "LOAN APP SPIKE",
      action: "Financial Wellness Consult",
      status: "Pending",
    },
    {
      id: "5543-P-2111",
      name: "Reddy, Karthik",
      riskScore: 68,
      trigger: "UTILIZATION SPIKE",
      action: "Credit Limit Review",
      status: "Contacted",
    },
  ];

  const spendingVelocityData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: Math.floor(Math.random() * 40) + (i > 25 ? 80 : 60),
  }));

  const selectedCustomerData = selectedCustomer 
    ? atRiskCustomers.find(c => c.id === selectedCustomer)
    : null;

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    setChatMessages([...chatMessages, 
      { role: 'user', content: chatInput },
      { role: 'assistant', content: 'Based on current data, there are 1,248 high-risk customers. The top triggers are salary delays (842 cases) and savings depletion (612 cases). Would you like me to analyze a specific segment?' }
    ]);
    setChatInput("");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <BankSidebar onResetLayout={handleResetLayout} />

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className={`flex-1 transition-all ${selectedCustomer ? 'mr-96' : ''}`}>
          {/* Top Header */}
          <header className="bg-[#0074A3] text-white px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">PRE-DELINQUENCY INTERVENTION ENGINE</h1>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <Input
                    placeholder="Search Customer ID, SSN, or Account Number..."
                    className="pl-10 bg-[#005F82] border-blue-400 text-white placeholder:text-blue-200"
                  />
                </div>
                <button className="relative p-2 hover:bg-[#005F82] rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                </button>
                <button className="p-2 hover:bg-[#005F82] rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <div className="text-right">
                  <p className="text-sm font-semibold">Ops Lead Alpha</p>
                  <p className="text-xs text-blue-200">Tier 1 Authorization</p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-8">
            {/* Static Stats Cards - Not draggable */}
            <div className="grid grid-cols-4 gap-6 mb-6">
              <Card className="p-6 bg-white border-blue-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">HIGH RISK CUSTOMERS</p>
                  <p className="text-3xl font-bold text-gray-800">1,248</p>
                  <div className="flex items-center gap-1 mt-2 text-red-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">↑ 12.4%</span>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-white border-blue-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">MODERATE RISK CUSTOMERS</p>
                  <p className="text-3xl font-bold text-gray-800">3,892</p>
                  <div className="flex items-center gap-1 mt-2 text-green-600">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm font-medium">↓ 2.1%</span>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-white border-blue-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">AVERAGE RISK SCORE</p>
                  <p className="text-3xl font-bold text-gray-800">42.5</p>
                  <p className="text-sm text-gray-500 mt-2">STABLE</p>
                </div>
              </Card>
              <Card className="p-6 bg-white border-blue-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">ALERTS TODAY</p>
                  <p className="text-3xl font-bold text-gray-800">156</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-sm font-medium text-orange-600">24 PRIORITY</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Draggable and Resizable Grid */}
            <div ref={gridContainerRef}>
              {gridWidth > 0 ? (
                <ResponsiveGridLayout
                  className="layout"
                  width={gridWidth}
                  layouts={layouts}
                  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                  rowHeight={80}
                  compactor={getCompactor(null, true)}
                  onBreakpointChange={(newBreakpoint) => setBreakpoint(newBreakpoint)}
                  onDragStart={(currentLayout) => handleDragStart(currentLayout)}
                  onDragStop={(currentLayout, oldItem, newItem) =>
                    handleDragStop(currentLayout, oldItem, newItem)
                  }
                  onResizeStop={(currentLayout, oldItem, newItem) =>
                    handleResizeStop(currentLayout, oldItem, newItem)
                  }
                  resizeConfig={{
                    handles: ["se", "ne"],
                  }}
                  dragConfig={{
                    handle: ".drag-handle",
                    cancel: "a,button,input,textarea,select,option,label",
                  }}
                  containerPadding={[0, 0]}
                  margin={[24, 24]}
                >
              {/* Risk Distribution */}
              <div key="riskDist" data-grid-id="riskDist">
                <Card className="p-6 bg-white border-blue-100 h-full overflow-hidden flex flex-col">
                  <div className="flex items-center gap-2 mb-4 cursor-move drag-handle">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-700">RISK DISTRIBUTION</h3>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <PieChart width={170} height={170}>
                      <Pie
                        data={riskDistributionSeries}
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={78}
                        paddingAngle={2}
                        dataKey="value"
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      >
                        {riskDistributionSeries.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#fca5a5] rounded-full"></div>
                        <span className="text-sm text-gray-600">High Risk</span>
                      </div>
                      <span className="font-medium">18%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#fcd34d] rounded-full"></div>
                        <span className="text-sm text-gray-600">Moderate</span>
                      </div>
                      <span className="font-medium">28%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#86efac] rounded-full"></div>
                        <span className="text-sm text-gray-600">Low Risk</span>
                      </div>
                      <span className="font-medium">54%</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Weekly Risk Trend */}
              <div key="weeklyTrend" data-grid-id="weeklyTrend">
                <Card className="p-6 bg-white border-blue-100 h-full overflow-hidden flex flex-col">
                  <div className="flex items-center gap-2 mb-4 cursor-move drag-handle">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-700">WEEKLY RISK TREND</h3>
                  </div>
                  <div className="flex-1 min-h-55">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyTrendSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="newCases"
                        stroke="#7dd3fc"
                        strokeWidth={2}
                        name="New Cases"
                        dot={{ r: 4 }}
                        isAnimationActive={animateIn}
                        animationBegin={100}
                        animationDuration={900}
                        animationEasing="ease-out"
                      />
                      <Line
                        type="monotone"
                        dataKey="interventions"
                        stroke="#c7d2fe"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Interventions"
                        dot={{ r: 4 }}
                        isAnimationActive={animateIn}
                        animationBegin={140}
                        animationDuration={900}
                        animationEasing="ease-out"
                      />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Financial Stress Indicators */}
              <div key="stressIndicators" data-grid-id="stressIndicators">
                <Card className="p-6 bg-white border-blue-100 h-full overflow-auto">
                  <div className="flex items-center gap-2 mb-4 cursor-move drag-handle">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-700">FINANCIAL STRESS INDICATORS</h3>
                  </div>
                  <div className="space-y-4">
                    {financialStressIndicators.map((indicator, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">{indicator.name}</span>
                          <span className="font-semibold text-gray-800">{indicator.cases} Cases</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-[width] duration-700 ease-out"
                            style={{
                              width: animateIn ? `${(indicator.cases / 842) * 100}%` : "0%",
                              backgroundColor: indicator.color,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Model Feature Importance */}
              <div key="featureImportance" data-grid-id="featureImportance">
                <Card className="p-6 bg-white border-blue-100 h-full overflow-auto">
                  <div className="flex items-center gap-2 mb-4 cursor-move drag-handle">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-700">MODEL FEATURE IMPORTANCE</h3>
                  </div>
                  <div className="space-y-4">
                    {modelFeatureImportance.map((feature, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">{feature.feature}</span>
                          <span className="font-semibold text-gray-800">{feature.importance}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-[#93c5fd] transition-[width] duration-700 ease-out"
                            style={{ width: animateIn ? `${feature.importance}%` : "0%" }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* At-Risk Customers Table */}
              <div key="atRiskTable" data-grid-id="atRiskTable">
                <Card className="p-6 bg-white border-blue-100 h-full overflow-auto">
                  <div className="flex items-center gap-2 mb-4 cursor-move drag-handle">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-700">AT-RISK CUSTOMERS PRIORITY QUEUE</h3>
                  </div>
                  <div className="flex justify-end gap-2 mb-4">
                    <Button variant="outline" size="sm">FILTER BY TRIGGER</Button>
                    <Button variant="outline" size="sm">EXPORT CSV</Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ACCOUNT ID</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">NAME</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">RISK SCORE</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">PRIMARY TRIGGER</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">RECOMMENDED ACTION</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">STATUS</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {atRiskCustomers.map((customer) => (
                          <tr
                            key={customer.id}
                            className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                              selectedCustomer === customer.id ? "bg-blue-50" : ""
                            }`}
                            onClick={() => setSelectedCustomer(customer.id)}
                          >
                            <td className="py-4 px-4 text-sm">{customer.id}</td>
                            <td className="py-4 px-4 text-sm font-medium">{customer.name}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-full max-w-25 bg-gray-100 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      customer.riskScore >= 85
                                        ? "bg-red-400"
                                        : customer.riskScore >= 70
                                        ? "bg-orange-300"
                                        : "bg-yellow-300"
                                    }`}
                                    style={{ width: `${customer.riskScore}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-semibold">{customer.riskScore}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                                {customer.trigger}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">{customer.action}</td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  customer.status === "Urgent"
                                    ? "bg-red-100 text-red-700"
                                    : customer.status === "Contacted"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {customer.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <Button variant="outline" size="sm">VIEW</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
                </ResponsiveGridLayout>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Side Panel - Customer Detail */}
        {selectedCustomer && selectedCustomerData && (
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto fixed right-0 top-0 bottom-0 shadow-xl">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-[#0074A3]">JA</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{selectedCustomerData.name}</h3>
                    <p className="text-xs text-gray-500">ID: {selectedCustomerData.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Risk Score Gauge */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-700 text-sm">RISK SCORE</h4>
                <div className="flex items-center gap-4">
                  <div className="relative w-28 h-28">
                    <svg className="transform -rotate-90 w-28 h-28">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="#fee2e2"
                        strokeWidth="10"
                        fill="none"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="#f87171"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${301 * (selectedCustomerData.riskScore / 100)} ${301 * (1 - selectedCustomerData.riskScore / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{selectedCustomerData.riskScore}</p>
                        <p className="text-xs text-gray-500">CRITICAL</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Trigger Breakdown */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-700 text-sm">RISK TRIGGER BREAKDOWN</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">Salary Delay Detect</p>
                      <p className="text-xs text-gray-600">
                        Historical pay date missed by 4.2 days. Predicted liquidity gap: ₹1,07,250.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">New Liability Spike</p>
                      <p className="text-xs text-gray-600">
                        3 Credit Bureau inquiries from Buy-Now-Pay-Later providers in 48h.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spending Velocity */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-700 text-sm">SPENDING VELOCITY (30D)</h4>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={spendingVelocityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="day"
                      stroke="#64748b"
                      style={{ fontSize: '9px' }}
                    />
                    <YAxis stroke="#64748b" style={{ fontSize: '9px' }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#f87171"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-linear-to-r from-[#7dd3fc] to-[#93c5fd] text-gray-800 hover:opacity-90">
                  START INTERVENTION
                </Button>
                <Button variant="outline" className="w-full">
                  ASSIGN TO SPECIALIST
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating AI Chat Button */}
      <button
        onClick={() => setShowAIChat(!showAIChat)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-linear-to-br from-[#7dd3fc] to-[#93c5fd] rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
      >
        <Bot className="w-7 h-7 text-gray-800" />
      </button>

      {/* AI Chat Popup */}
      {showAIChat && (
        <div className="fixed bottom-28 right-8 w-96 h-125 bg-white rounded-lg shadow-2xl border border-blue-200 flex flex-col z-50">
          <div className="p-4 bg-linear-to-r from-[#7dd3fc] to-[#93c5fd] rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-gray-800" />
              <h3 className="font-semibold text-gray-800">AI Assistant</h3>
            </div>
            <button onClick={() => setShowAIChat(false)} className="text-gray-600 hover:text-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm mt-8">
                <p>Hi! I'm your AI assistant.</p>
                <p className="mt-2">Ask me anything about your customers or portfolio.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.role === 'user' 
                        ? 'bg-[#bfdbfe] text-gray-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask about your portfolio..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 min-h-15 resize-none text-sm"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-linear-to-r from-[#7dd3fc] to-[#93c5fd] text-gray-800 hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
