'use client';

import { useState } from "react";
import { Search, Bell, Settings, Plus, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { BankSidebar } from "@/components/BankSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type InterventionPlan = {
  id: string;
  name: string;
  type: string;
  duration: string;
  emiChange: string;
  interestImpact: string;
  tenureExtension: string;
  recoveryChance: number;
  furtherLossRisk: number;
  customerSatisfaction: number;
  notes: string;
};

export default function BankInterventionPlanner() {
  const [customerId, setCustomerId] = useState("8829-X-4421");
  const [customerName, setCustomerName] = useState("Alexander, James");
  const [plans, setPlans] = useState<InterventionPlan[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    duration: "",
    emiChange: "",
    interestImpact: "",
    tenureExtension: "",
    notes: "",
  });

  const planTypes = [
    "Payment Holiday",
    "Reduced EMI",
    "Interest-Only Period",
    "Tenure Extension",
    "Interest Rate Reduction",
    "Partial Waiver",
    "Debt Consolidation",
  ];

  const calculatePlanMetrics = (planType: string) => {
    const metrics: Record<string, { recovery: number; loss: number; satisfaction: number }> = {
      "Payment Holiday": { recovery: 87, loss: 8, satisfaction: 92 },
      "Reduced EMI": { recovery: 72, loss: 15, satisfaction: 85 },
      "Interest-Only Period": { recovery: 64, loss: 22, satisfaction: 78 },
      "Tenure Extension": { recovery: 68, loss: 18, satisfaction: 81 },
      "Interest Rate Reduction": { recovery: 75, loss: 12, satisfaction: 88 },
      "Partial Waiver": { recovery: 82, loss: 10, satisfaction: 95 },
      "Debt Consolidation": { recovery: 70, loss: 16, satisfaction: 83 },
    };

    return metrics[planType] || { recovery: 50, loss: 30, satisfaction: 60 };
  };

  const handleAddPlan = () => {
    if (!formData.name || !formData.type) return;

    const metrics = calculatePlanMetrics(formData.type);

    const newPlan: InterventionPlan = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      duration: formData.duration,
      emiChange: formData.emiChange,
      interestImpact: formData.interestImpact,
      tenureExtension: formData.tenureExtension,
      recoveryChance: metrics.recovery,
      furtherLossRisk: metrics.loss,
      customerSatisfaction: metrics.satisfaction,
      notes: formData.notes,
    };

    setPlans([...plans, newPlan]);
    setFormData({
      name: "",
      type: "",
      duration: "",
      emiChange: "",
      interestImpact: "",
      tenureExtension: "",
      notes: "",
    });
    setShowForm(false);
  };

  const handleLoadExamples = () => {
    const examplePlans: InterventionPlan[] = [
      {
        id: "1",
        name: "Plan A - Payment Holiday",
        type: "Payment Holiday",
        duration: "2 months",
        emiChange: "£0 for 2 months",
        interestImpact: "+£342",
        tenureExtension: "+3 months",
        recoveryChance: 87,
        furtherLossRisk: 8,
        customerSatisfaction: 92,
        notes: "Customer maintains good standing, temporary cash flow issue",
      },
      {
        id: "2",
        name: "Plan B - Reduced EMI",
        type: "Reduced EMI",
        duration: "6 months",
        emiChange: "£420 (-30%)",
        interestImpact: "+£589",
        tenureExtension: "+6 months",
        recoveryChance: 72,
        furtherLossRisk: 15,
        customerSatisfaction: 85,
        notes: "Lower monthly burden, longer commitment period",
      },
      {
        id: "3",
        name: "Plan C - Interest-Only",
        type: "Interest-Only Period",
        duration: "3 months",
        emiChange: "£180 (interest only)",
        interestImpact: "+£215",
        tenureExtension: "+3 months",
        recoveryChance: 64,
        furtherLossRisk: 22,
        customerSatisfaction: 78,
        notes: "Minimal payment during stress period",
      },
    ];

    setPlans(examplePlans);
  };

  const getBestPlan = () => {
    if (plans.length === 0) return null;
    return plans.reduce((best, current) =>
      current.recoveryChance > best.recoveryChance ? current : best
    );
  };

  const bestPlan = getBestPlan();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <BankSidebar />

      <div className="flex-1">
        {/* Top Header */}
        <header className="bg-[#0074A3] text-white px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">INTERVENTION PLANNER</h1>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                <Input
                  placeholder="Search Customer ID..."
                  className="pl-10 bg-[#005F82] border-blue-400 text-white placeholder:text-blue-200"
                />
              </div>
              <button className="relative p-2 hover:bg-[#005F82] rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
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
          {/* Customer Selection */}
          <Card className="p-6 mb-6 bg-white border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#0074A3]">JA</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{customerName}</h2>
                  <p className="text-sm text-gray-500">Customer ID: {customerId}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      Risk Score: 92
                    </span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                      Help Requested
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleLoadExamples}>
                  Load Example Plans
                </Button>
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-gradient-to-r from-[#00A9CE] to-[#0074A3] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Plan
                </Button>
              </div>
            </div>
          </Card>

          {/* Add Plan Form */}
          {showForm && (
            <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Intervention Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plan-name">Plan Name</Label>
                  <Input
                    id="plan-name"
                    placeholder="e.g., Plan A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="plan-type">Intervention Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {planTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 2 months"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="emi-change">EMI Change</Label>
                  <Input
                    id="emi-change"
                    placeholder="e.g., £420"
                    value={formData.emiChange}
                    onChange={(e) => setFormData({ ...formData, emiChange: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="interest-impact">Interest Impact</Label>
                  <Input
                    id="interest-impact"
                    placeholder="e.g., +£342"
                    value={formData.interestImpact}
                    onChange={(e) => setFormData({ ...formData, interestImpact: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="tenure-extension">Tenure Extension</Label>
                  <Input
                    id="tenure-extension"
                    placeholder="e.g., +3 months"
                    value={formData.tenureExtension}
                    onChange={(e) => setFormData({ ...formData, tenureExtension: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Additional considerations"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddPlan} className="bg-[#00A9CE]">
                  Add Plan
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Plans Comparison */}
          {plans.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Plan Comparison Analysis</h3>

              {bestPlan && (
                <Card className="p-6 mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-bold text-green-800 mb-1">RECOMMENDED PLAN</h4>
                      <p className="text-gray-700">
                        <strong>{bestPlan.name}</strong> shows highest recovery probability at {bestPlan.recoveryChance}%
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`p-6 ${
                      plan.id === bestPlan?.id
                        ? "border-2 border-green-500 bg-gradient-to-br from-green-50 to-white"
                        : "bg-white border-blue-100"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-800">{plan.name}</h4>
                        <p className="text-sm text-gray-600">{plan.type}</p>
                      </div>
                      {plan.id === bestPlan?.id && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>

                    <div className="space-y-3 mb-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-medium text-gray-800">{plan.duration}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">EMI Change</p>
                        <p className="font-medium text-gray-800">{plan.emiChange}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Recovery</span>
                          <span className="text-sm font-bold text-green-600">
                            {plan.recoveryChance}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${plan.recoveryChance}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex gap-4 mt-6 justify-center">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8">
                  Implement Plan
                </Button>
                <Button variant="outline" className="px-8">Export Analysis</Button>
              </div>
            </div>
          )}

          {plans.length === 0 && !showForm && (
            <Card className="p-12 bg-white border-blue-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-[#0074A3]" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Plans Yet</h3>
                <p className="text-gray-600 mb-6">
                  Create intervention plans to compare recovery probabilities
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleLoadExamples}
                    variant="outline"
                  >
                    Load Example Plans
                  </Button>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-[#00A9CE] to-[#0074A3] text-white"
                  >
                    Create First Plan
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
