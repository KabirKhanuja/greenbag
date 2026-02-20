import { BankSidebar } from "@/components/BankSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Newspaper,
  BriefcaseBusiness,
  Landmark,
  ShieldAlert,
  Users,
  ArrowRight,
} from "lucide-react";

type NewsRole = "Ops Lead" | "Collections" | "Policy" | "Customer Support";

type NewsItem = {
  id: string;
  date: string;
  title: string;
  summary: string;
  tags: string[];
  impact: "High" | "Medium" | "Low";
  relevantTo: NewsRole[];
  icon: React.ComponentType<{ className?: string }>;
};

const newsItems: NewsItem[] = [
  {
    id: "layoffs-collections-capacity",
    date: "Feb 19, 2026",
    title: "Industry hiring freeze slows collections capacity",
    summary:
      "Peer lenders are pausing hiring across ops/collections. Expect longer callback SLAs and higher queue times; prioritize help-requested and salary-delay cohorts.",
    tags: ["Layoffs", "Ops", "Collections"],
    impact: "High",
    relevantTo: ["Ops Lead", "Collections", "Customer Support"],
    icon: BriefcaseBusiness,
  },
  {
    id: "policy-credit-bureau-inquiries",
    date: "Feb 18, 2026",
    title: "Credit bureau inquiry bursts flagged in risk triage",
    summary:
      "Regulators are asking for clearer adverse-action reasoning when risk actions are triggered by rapid inquiry spikes (BNPL / short-term apps). Add a human-review step for borderline scores.",
    tags: ["Policy", "Credit Bureau"],
    impact: "Medium",
    relevantTo: ["Policy", "Ops Lead"],
    icon: Landmark,
  },
  {
    id: "rbi-contact-consent",
    date: "Feb 17, 2026",
    title: "Contact-consent enforcement tightened for outreach",
    summary:
      "A refreshed consent interpretation requires clearer logging for repeated outreach attempts. Keep call/SMS cadence within policy; route unresolved cases to assisted channels.",
    tags: ["Policy", "Consent", "Outreach"],
    impact: "High",
    relevantTo: ["Policy", "Collections", "Customer Support"],
    icon: ShieldAlert,
  },
  {
    id: "customer-impact-messaging",
    date: "Feb 16, 2026",
    title: "Customer messaging: hardship support scripts updated",
    summary:
      "Updated scripts reduce churn in salary-delay scenarios by offering a short buffer period + repayment plan. Use when riskScore ≥ 85 and trigger = Salary Delay.",
    tags: ["Customer", "Intervention"],
    impact: "Medium",
    relevantTo: ["Customer Support", "Collections", "Ops Lead"],
    icon: Users,
  },
];

function impactStyles(impact: NewsItem["impact"]) {
  if (impact === "High") return "bg-red-100 text-red-700 border-red-200";
  if (impact === "Medium") return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
}

export default function NewsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <BankSidebar />

      <div className="flex-1">
        <header className="bg-[#0074A3] text-white px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#005F82] flex items-center justify-center">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">RISK & POLICY NEWS</h1>
                <p className="text-xs text-blue-200">
                  Curated updates likely to impact operations, interventions, and customer outcomes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className="bg-[#005F82] text-blue-100">Updated Feb 19, 2026</Badge>
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/15">
                Export Brief
              </Button>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="p-5 bg-white border-blue-100">
                <p className="text-sm text-gray-500 mb-1">Today’s Focus</p>
                <p className="text-lg font-semibold text-gray-800">Outreach capacity + consent</p>
                <p className="text-sm text-gray-600 mt-2">
                  Queue prioritization and compliant contact cadence are the two biggest levers this week.
                </p>
              </Card>

              <Card className="p-5 bg-white border-blue-100">
                <p className="text-sm text-gray-500 mb-1">Recommended Action</p>
                <p className="text-lg font-semibold text-gray-800">Tighten priority rules</p>
                <p className="text-sm text-gray-600 mt-2">
                  Escalate help-requested, bounced-EMI and salary-delay cases first; hold borderline inquiry-spike cases for review.
                </p>
              </Card>

              <Card className="p-5 bg-white border-blue-100">
                <p className="text-sm text-gray-500 mb-1">Who’s impacted</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(["Ops Lead", "Collections", "Policy", "Customer Support"] as NewsRole[]).map((r) => (
                    <Badge key={r} className="bg-blue-50 text-blue-700 border border-blue-200">
                      {r}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-white border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Latest updates</h2>
                <p className="text-sm text-gray-500">{newsItems.length} items</p>
              </div>

              <div className="space-y-4">
                {newsItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-200 p-5 hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-slate-700" />
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs text-gray-500">{item.date}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${impactStyles(item.impact)}`}>
                              Impact: {item.impact}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {item.tags.map((t) => (
                                <Badge
                                  key={t}
                                  className="bg-slate-100 text-slate-700 hover:bg-slate-100"
                                >
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <h3 className="text-base font-semibold text-gray-900 mt-2">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-700 mt-1">{item.summary}</p>

                          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs text-gray-500">Relevant to:</span>
                              {item.relevantTo.map((r) => (
                                <span key={r} className="text-xs font-medium text-gray-700">
                                  {r}
                                </span>
                              ))}
                            </div>

                            <Button size="sm" variant="outline" className="gap-2">
                              View playbook <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
