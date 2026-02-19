import type { Layout } from "react-grid-layout";

export type LayoutsByBreakpoint = Record<string, Layout>;

// Default layouts per breakpoint (prevents overlap on non-lg widths)
// Resets on reload because we don't persist to storage.
export const defaultLayouts: LayoutsByBreakpoint = {
  lg: [
    { i: "riskDist", x: 0, y: 0, w: 3, h: 4, minW: 3, minH: 4 },
    { i: "weeklyTrend", x: 3, y: 0, w: 9, h: 4, minW: 4, minH: 4 },
    { i: "stressIndicators", x: 0, y: 4, w: 6, h: 3, minW: 4, minH: 3 },
    { i: "featureImportance", x: 6, y: 4, w: 6, h: 3, minW: 4, minH: 3 },
    { i: "atRiskTable", x: 0, y: 7, w: 12, h: 4, minW: 8, minH: 4 },
  ],
  md: [
    { i: "riskDist", x: 0, y: 0, w: 3, h: 4, minW: 3, minH: 4 },
    { i: "weeklyTrend", x: 3, y: 0, w: 7, h: 4, minW: 4, minH: 4 },
    { i: "stressIndicators", x: 0, y: 4, w: 5, h: 3, minW: 4, minH: 3 },
    { i: "featureImportance", x: 5, y: 4, w: 5, h: 3, minW: 4, minH: 3 },
    { i: "atRiskTable", x: 0, y: 7, w: 10, h: 4, minW: 8, minH: 4 },
  ],
  sm: [
    { i: "riskDist", x: 0, y: 0, w: 3, h: 4, minW: 2, minH: 4 },
    { i: "weeklyTrend", x: 3, y: 0, w: 3, h: 4, minW: 3, minH: 4 },
    { i: "stressIndicators", x: 0, y: 4, w: 6, h: 3, minW: 4, minH: 3 },
    { i: "featureImportance", x: 0, y: 7, w: 6, h: 3, minW: 4, minH: 3 },
    { i: "atRiskTable", x: 0, y: 10, w: 6, h: 4, minW: 4, minH: 4 },
  ],
  xs: [
    { i: "riskDist", x: 0, y: 0, w: 4, h: 4, minW: 4, minH: 4 },
    { i: "weeklyTrend", x: 0, y: 4, w: 4, h: 4, minW: 4, minH: 4 },
    { i: "stressIndicators", x: 0, y: 8, w: 4, h: 3, minW: 4, minH: 3 },
    { i: "featureImportance", x: 0, y: 11, w: 4, h: 3, minW: 4, minH: 3 },
    { i: "atRiskTable", x: 0, y: 14, w: 4, h: 5, minW: 4, minH: 4 },
  ],
  xxs: [
    { i: "riskDist", x: 0, y: 0, w: 2, h: 4, minW: 2, minH: 4 },
    { i: "weeklyTrend", x: 0, y: 4, w: 2, h: 4, minW: 2, minH: 4 },
    { i: "stressIndicators", x: 0, y: 8, w: 2, h: 3, minW: 2, minH: 3 },
    { i: "featureImportance", x: 0, y: 11, w: 2, h: 3, minW: 2, minH: 3 },
    { i: "atRiskTable", x: 0, y: 14, w: 2, h: 6, minW: 2, minH: 4 },
  ],
};

export const cloneLayouts = (source: LayoutsByBreakpoint): LayoutsByBreakpoint => {
  const out: LayoutsByBreakpoint = {};
  for (const [bp, layout] of Object.entries(source)) {
    out[bp] = layout.map((item) => ({ ...item }));
  }
  return out;
};
