'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function CustomerDashboard() {
  const router = useRouter();
  const [notified, setNotified] = useState(false);

  const transactions = [
    { id: 1, date: "Feb 14, 2026", description: "Grocery Store", amount: -11680.00 },
    { id: 2, date: "Feb 13, 2026", description: "Salary Credit", amount: 325500.00 },
    { id: 3, date: "Feb 12, 2026", description: "Electric Bill", amount: -8305.00 },
    { id: 4, date: "Feb 10, 2026", description: "Restaurant", amount: -6310.00 },
    { id: 5, date: "Feb 9, 2026", description: "Online Shopping", amount: -22785.00 },
  ];

  const emiPlans = [
    {
      id: 1,
      name: "Personal Loan",
      description: "Fixed rate loan with flexible repayment terms",
      monthlyEMI: "From ₹23,250",
      totalInterest: "5.9% APR",
      color: "bg-gradient-to-br from-blue-50 to-cyan-50",
    },
    {
      id: 2,
      name: "Debt Consolidation Loan",
      description: "Combine multiple debts into one monthly payment",
      monthlyEMI: "From ₹32,550",
      totalInterest: "6.4% APR",
      color: "bg-gradient-to-br from-teal-50 to-emerald-50",
    },
    {
      id: 3,
      name: "Flexible Payment Plan",
      description: "Adjust payments based on your cash flow",
      monthlyEMI: "Variable",
      totalInterest: "7.2% APR",
      color: "bg-gradient-to-br from-indigo-50 to-blue-50",
    },
    {
      id: 4,
      name: "Balance Transfer",
      description: "0% interest for the first 12 months",
      monthlyEMI: "From ₹18,600",
      totalInterest: "0% (12mo)",
      color: "bg-gradient-to-br from-purple-50 to-pink-50",
    },
  ];

  const handleReachOut = () => {
    setNotified(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00A9CE] to-[#0074A3] rounded"></div>
              <span className="text-xl font-semibold text-[#0074A3]">Barclays</span>
            </div>
            <button className="p-2 rounded-full hover:bg-blue-50 transition-colors">
              <User className="w-6 h-6 text-[#0074A3]" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section - Next Due Date */}
            <Card className="p-8 bg-gradient-to-br from-[#00A9CE] to-[#0074A3] text-white border-0 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-100 mb-2">Next Payment Due</p>
                  <h1 className="text-4xl font-bold mb-1">March 1, 2026</h1>
                  <p className="text-2xl font-semibold text-blue-50">₹55,800.00</p>
                  <p className="text-sm text-blue-100 mt-2">Personal Loan - EMI Payment</p>
                </div>
                <CreditCard className="w-12 h-12 text-blue-200" />
              </div>
              <Button
                onClick={() => router.push("/user/payments")}
                className="mt-6 bg-white text-[#0074A3] hover:bg-blue-50"
              >
                Learn More
              </Button>
            </Card>

            {/* Transaction History */}
            <Card className="p-6 bg-white border-blue-100 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Transactions</h2>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                    <p
                      className={`font-semibold ${
                        transaction.amount > 0 ? "text-green-600" : "text-gray-700"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}₹{Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* EMI Plans Carousel */}
            <div className="bg-white p-6 rounded-lg border border-blue-100 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Alternate EMI Plans</h2>
              <Carousel className="w-full">
                <CarouselContent>
                  {emiPlans.map((plan) => (
                    <CarouselItem key={plan.id} className="md:basis-1/2 lg:basis-1/2">
                      <Card className={`p-6 ${plan.color} border-blue-200 h-full`}>
                        <h3 className="font-semibold text-lg mb-2 text-gray-800">{plan.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Monthly Payment:</span>
                            <span className="font-semibold text-gray-800">{plan.monthlyEMI}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Additional Interest:</span>
                            <span className="font-semibold text-gray-800">{plan.totalInterest}</span>
                          </div>
                        </div>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </div>
          </div>

          {/* Right Panel - Help Section */}
          <div className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-sm">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#00A9CE] to-[#0074A3] rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Want some help?</h3>
                <p className="text-sm text-gray-600">
                  Click the button below to discuss alternative loan schedules with us. We will
                  reach out to you as soon as we can.
                </p>
                <Button
                  onClick={handleReachOut}
                  disabled={notified}
                  className="w-full bg-gradient-to-r from-[#00A9CE] to-[#0074A3] text-white hover:opacity-90"
                >
                  {notified ? "Request Sent" : "Reach out"}
                </Button>
              </div>
            </Card>
            {notified && (
              <div className="flex items-center gap-2 text-green-600 text-sm justify-center">
                <Check className="w-4 h-4" />
                <span>Our team has been notified and we will connect with you shortly.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
