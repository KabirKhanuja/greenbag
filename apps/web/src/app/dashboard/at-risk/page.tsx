'use client';

import { useEffect, useMemo, useState } from "react";
import { Search, Bell, Settings, Filter, Download, AlertCircle, Phone } from "lucide-react";
import { BankSidebar } from "@/components/BankSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateAtRiskCustomers } from "@/lib/mockAtRiskCustomers";

function hashStringToUint(str: string): number {
  // Deterministic (no Math.random) so the UI stays stable across reloads.
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickPriorityMix<T extends { id: string; riskScore: number }>(
  rows: T[],
  count: number
): T[] {
  const sorted = rows
    .slice()
    .sort((a, b) => (b.riskScore - a.riskScore) || (hashStringToUint(a.id) - hashStringToUint(b.id)));

  const picked: T[] = [];
  const used = new Set<string>();

  // Balance: some very high, some high, some borderline-high.
  // This avoids the UI looking like every priority case is identical.
  const tierA = Math.floor(count * 0.42); // ~10 of 24
  const tierB = Math.floor(count * 0.33); // ~8 of 24
  const tierC = count - tierA - tierB; // remainder

  const aPred = (r: T) => r.riskScore >= 95;
  const bPred = (r: T) => r.riskScore >= 90 && r.riskScore <= 94;
  const cPred = (r: T) => r.riskScore >= 85 && r.riskScore <= 89;

  // Take per tier; if any tier is short, we’ll fill from the remainder below.
  const takeTier = (predicate: (r: T) => boolean, n: number) => {
    let taken = 0;
    for (const r of sorted) {
      if (picked.length >= count) break;
      if (taken >= n) break;
      if (used.has(r.id)) continue;
      if (!predicate(r)) continue;
      used.add(r.id);
      picked.push(r);
      taken++;
    }
  };

  takeTier(aPred, tierA);
  takeTier(bPred, tierB);
  takeTier(cPred, tierC);

  for (const r of sorted) {
    if (picked.length >= count) break;
    if (used.has(r.id)) continue;
    used.add(r.id);
    picked.push(r);
  }

  return picked;
}

export default function BankAtRiskCustomers() {
  const [filter, setFilter] = useState<"all" | "priority" | "contacted" | "all-customers">("all");
  const pageSize = 25;
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const highRiskTotal = 1248;
  const generatedAtRisk = useMemo(
    () => generateAtRiskCustomers(highRiskTotal, 20260219),
    []
  );

  const priorityCustomers = useMemo(() => {
    // Mix the priority queue so it doesn't look like every case is identical.
    // Still deterministic, still biased toward higher-risk customers.
    return pickPriorityMix(generatedAtRisk, 24).map((c) => ({
        ...c,
        requestedHelp: true,
        requestDate: c.requestDate ?? "Feb 16, 2026 10:05 AM",
        status: "Help Requested" as const,
      }));
  }, [generatedAtRisk]);

  const regularAtRiskCustomers = useMemo(() => {
    const priorityIds = new Set(priorityCustomers.map((c) => c.id));
    return generatedAtRisk
      .filter((c) => !priorityIds.has(c.id))
      .map((c) => ({
        ...c,
        requestedHelp: false,
        status: c.status === "Urgent" ? ("Pending" as const) : c.status,
      }));
  }, [generatedAtRisk, priorityCustomers]);

  const allCustomers = useMemo(
    () => [
      ...priorityCustomers,
      ...regularAtRiskCustomers,
      {
        id: "2341-T-5678",
        name: "Desai, Rohan",
        riskScore: 24,
        trigger: "N/A",
        requestedHelp: false,
        phone: "+91 98765 43217",
        email: "r.desai@email.com",
        loanAmount: "₹10,71,000",
        missedPayments: 0,
        status: "Good Standing",
      },
      {
        id: "8912-F-3421",
        name: "Nair, Vivek",
        riskScore: 18,
        trigger: "N/A",
        requestedHelp: false,
        phone: "+91 98765 43218",
        email: "v.nair@email.com",
        loanAmount: "₹8,19,000",
        missedPayments: 0,
        status: "Good Standing",
      },
    ],
    [priorityCustomers, regularAtRiskCustomers]
  );

  const regularFiltered = useMemo(() => {
    return regularAtRiskCustomers.filter(
      (c) => filter !== "contacted" || c.status === "Contacted"
    );
  }, [regularAtRiskCustomers, filter]);

  const regularTotal = regularFiltered.length;
  const regularStart = (page - 1) * pageSize;
  const regularEnd = Math.min(regularTotal, regularStart + pageSize);
  const regularPageRows = useMemo(
    () => regularFiltered.slice(regularStart, regularEnd),
    [regularFiltered, regularStart, regularEnd]
  );

  const allTotal = allCustomers.length;
  const allStart = (page - 1) * pageSize;
  const allEnd = Math.min(allTotal, allStart + pageSize);
  const allPageRows = useMemo(
    () => allCustomers.slice(allStart, allEnd),
    [allCustomers, allStart, allEnd]
  );

  const totalAtRisk = priorityCustomers.length + regularAtRiskCustomers.length;
  const helpRequestedCount = priorityCustomers.length;
  const avgRiskScore = useMemo(() => {
    const all = [...priorityCustomers, ...regularAtRiskCustomers];
    if (all.length === 0) return 0;
    const sum = all.reduce((acc, c) => acc + c.riskScore, 0);
    return Math.round(sum / all.length);
  }, [priorityCustomers, regularAtRiskCustomers]);
  const immediateActionCount = useMemo(() => {
    const all = [...priorityCustomers, ...regularAtRiskCustomers];
    return all.filter((c) => c.riskScore >= 90).length;
  }, [priorityCustomers, regularAtRiskCustomers]);

  const getFilteredCustomers = () => {
    if (filter === "priority") return priorityCustomers;
    if (filter === "contacted") 
      return [...priorityCustomers, ...regularAtRiskCustomers].filter(c => c.status === "Contacted");
    if (filter === "all-customers") return allCustomers;
    return [...priorityCustomers, ...regularAtRiskCustomers];
  };

  const filteredCustomers = getFilteredCustomers();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <BankSidebar />

      <div className="flex-1">
        {/* Top Header */}
        <header className="bg-[#0074A3] text-white px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">AT-RISK CUSTOMERS - EXPANDED VIEW</h1>
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
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-white border-blue-100">
              <p className="text-sm text-gray-500 mb-1">Total At-Risk</p>
              <p className="text-2xl font-bold text-gray-800">{totalAtRisk}</p>
            </Card>
            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Help Requested</p>
              <p className="text-2xl font-bold text-blue-800">{helpRequestedCount}</p>
            </Card>
            <Card className="p-4 bg-white border-blue-100">
              <p className="text-sm text-gray-500 mb-1">Avg Risk Score</p>
              <p className="text-2xl font-bold text-gray-800">{avgRiskScore}</p>
            </Card>
            <Card className="p-4 bg-white border-red-100">
              <p className="text-sm text-red-500 mb-1">Needs Immediate Action</p>
              <p className="text-2xl font-bold text-red-600">{immediateActionCount}</p>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6 bg-white border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-500" />
                <div className="flex gap-2">
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    At-Risk Only
                  </Button>
                  <Button
                    variant={filter === "priority" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("priority")}
                    className={filter === "priority" ? "bg-orange-600 hover:bg-orange-700" : ""}
                  >
                    Priority (Help Requested)
                  </Button>
                  <Button
                    variant={filter === "contacted" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("contacted")}
                  >
                    Contacted
                  </Button>
                  <Button
                    variant={filter === "all-customers" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all-customers")}
                  >
                    All Customers
                  </Button>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </Card>

          {/* Priority Section - Help Requested */}
          {(filter === "all" || filter === "priority") && priorityCustomers.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">PRIORITY - Customers Who Requested Help</h2>
                <Badge className="bg-blue-600">{priorityCustomers.length}</Badge>
              </div>

              <div className="space-y-3">
                {priorityCustomers.map((customer) => (
                  <Card key={customer.id} className="p-6 bg-linear-to-r from-blue-50 to-white border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-6 flex-1">
                        <div className="w-16 h-16 bg-linear-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                          <Phone className="w-8 h-8 text-blue-600" />
                        </div>
                        
                        <div className="flex-1 grid grid-cols-5 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">CUSTOMER</p>
                            <p className="font-semibold text-gray-800">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.id}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">RISK SCORE</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                                <div
                                  className={`h-2 rounded-full ${
                                    customer.riskScore >= 85
                                      ? "bg-red-500"
                                      : customer.riskScore >= 70
                                      ? "bg-orange-500"
                                      : "bg-yellow-500"
                                  }`}
                                  style={{ width: `${customer.riskScore}%` }}
                                ></div>
                              </div>
                              <span
                                className={`font-bold ${
                                  customer.riskScore >= 85
                                    ? "text-red-600"
                                    : customer.riskScore >= 70
                                    ? "text-orange-600"
                                    : "text-yellow-700"
                                }`}
                              >
                                {customer.riskScore}
                              </span>
                            </div>
                            <Badge className="mt-1 bg-red-100 text-red-700 text-xs">
                              {customer.trigger}
                            </Badge>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">REQUEST TIME</p>
                            <p className="text-sm font-medium text-gray-800">{customer.requestDate}</p>
                            <p className="text-xs text-orange-600 font-medium mt-1">⚡ URGENT</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">CONTACT</p>
                            <p className="text-xs text-gray-700">{customer.phone}</p>
                            <p className="text-xs text-gray-700">{customer.email}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">LOAN DETAILS</p>
                            <p className="text-sm font-semibold text-gray-800">{customer.loanAmount}</p>
                            <p className="text-xs text-green-600">0 Missed Payments</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button className="bg-linear-to-r from-[#7dd3fc] to-[#93c5fd] text-gray-800 hover:opacity-90">
                          CALL NOW
                        </Button>
                        <Button variant="outline">View Details</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular At-Risk Customers */}
          {(filter === "all" || filter === "contacted") && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {filter === "contacted" ? "Contacted Customers" : "Other At-Risk Customers"}
              </h2>

              <Card className="bg-white border-blue-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ACCOUNT ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">NAME</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">RISK SCORE</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">TRIGGER</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">CONTACT</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">LOAN AMOUNT</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">STATUS</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regularPageRows.map((customer) => (
                        <tr
                          key={customer.id}
                          className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                        >
                          <td className="py-4 px-4 text-sm">{customer.id}</td>
                          <td className="py-4 px-4 text-sm font-medium">{customer.name}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    customer.riskScore >= 85
                                      ? "bg-red-500"
                                      : customer.riskScore >= 70
                                      ? "bg-orange-500"
                                      : "bg-yellow-500"
                                  }`}
                                  style={{ width: `${customer.riskScore}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold">{customer.riskScore}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              {customer.trigger}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-xs">
                            <p className="text-gray-700">{customer.phone}</p>
                            <p className="text-gray-500">{customer.email}</p>
                          </td>
                          <td className="py-4 px-4 text-sm font-medium">{customer.loanAmount}</td>
                          <td className="py-4 px-4">
                            <Badge
                              className={
                                customer.status === "Contacted"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }
                            >
                              {customer.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              <Button size="sm" className="bg-[#00A9CE]">
                                Contact
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Showing {regularTotal === 0 ? 0 : regularStart + 1}-{regularEnd} of {regularTotal}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={regularEnd >= regularTotal}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* All Customers View */}
          {filter === "all-customers" && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">All Customers</h2>

              <Card className="bg-white border-blue-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ACCOUNT ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">NAME</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">RISK SCORE</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">TRIGGER</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">CONTACT</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">LOAN AMOUNT</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">STATUS</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPageRows.map((customer) => (
                        <tr
                          key={customer.id}
                          className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                        >
                          <td className="py-4 px-4 text-sm">{customer.id}</td>
                          <td className="py-4 px-4 text-sm font-medium">{customer.name}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    customer.riskScore >= 85
                                      ? "bg-red-500"
                                      : customer.riskScore >= 70
                                      ? "bg-orange-500"
                                      : customer.riskScore >= 40
                                      ? "bg-yellow-400"
                                      : "bg-green-400"
                                  }`}
                                  style={{ width: `${customer.riskScore}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold">{customer.riskScore}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {customer.trigger !== "N/A" ? (
                              <Badge className="bg-red-100 text-red-700 text-xs">
                                {customer.trigger}
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-400">No Triggers</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-xs">
                            <p className="text-gray-700">{customer.phone}</p>
                            <p className="text-gray-500">{customer.email}</p>
                          </td>
                          <td className="py-4 px-4 text-sm font-medium">{customer.loanAmount}</td>
                          <td className="py-4 px-4">
                            <Badge
                              className={
                                customer.status === "Help Requested"
                                  ? "bg-orange-100 text-orange-700"
                                  : customer.status === "Contacted"
                                  ? "bg-green-100 text-green-700"
                                  : customer.status === "Good Standing"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }
                            >
                              {customer.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {customer.riskScore > 40 && (
                                <Button size="sm" className="bg-[#93c5fd] text-gray-800 hover:opacity-90">
                                  Contact
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Showing {allTotal === 0 ? 0 : allStart + 1}-{allEnd} of {allTotal}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={allEnd >= allTotal}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
