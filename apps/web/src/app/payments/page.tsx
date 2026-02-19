'use client';

import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CustomerPaymentDetails() {
  const router = useRouter();

  const upcomingPayments = [
    {
      id: 1,
      dueDate: "March 1, 2026",
      amount: 600.0,
      type: "Personal Loan",
      accountNumber: "****4421",
      status: "upcoming",
    },
    {
      id: 2,
      dueDate: "March 15, 2026",
      amount: 450.0,
      type: "Credit Card",
      accountNumber: "****8029",
      status: "upcoming",
    },
    {
      id: 3,
      dueDate: "April 1, 2026",
      amount: 600.0,
      type: "Personal Loan",
      accountNumber: "****4421",
      status: "scheduled",
    },
    {
      id: 4,
      dueDate: "April 15, 2026",
      amount: 450.0,
      type: "Credit Card",
      accountNumber: "****8029",
      status: "scheduled",
    },
  ];

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
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-[#0074A3]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Schedule</h1>
          <p className="text-gray-600">View all your upcoming payment obligations</p>
        </div>

        <div className="space-y-4">
          {upcomingPayments.map((payment) => (
            <Card
              key={payment.id}
              className="p-6 bg-white border-blue-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-[#0074A3]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{payment.type}</h3>
                    <p className="text-sm text-gray-500">Account: {payment.accountNumber}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {payment.dueDate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">£{payment.amount.toFixed(2)}</p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                      payment.status === "upcoming"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {payment.status === "upcoming" ? "Due Soon" : "Scheduled"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-1">
                Need help managing payments?
              </h3>
              <p className="text-sm text-gray-600">
                We're here to help you find the right payment plan for your situation.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-[#00A9CE] to-[#0074A3] text-white">
              Contact Us
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
