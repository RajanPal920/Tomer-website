import React, { useState, useMemo } from 'react';
import { Calculator, Info, RotateCcw } from 'lucide-react';

export default function EmiCalculator() {
  const [loanAmount, setLoanAmount] = useState(4500000); // 45 Lakhs default
  const [interestRate, setInterestRate] = useState(8.5); // 8.5% default
  const [tenureYears, setTenureYears] = useState(20); // 20 years default

  const calculation = useMemo(() => {
    const P = Number(loanAmount);
    const annualRate = Number(interestRate);
    const N_years = Number(tenureYears);

    if (P <= 0 || annualRate <= 0 || N_years <= 0) {
      return { monthlyEmi: 0, totalInterest: 0, totalPayment: 0, principalRatio: 100, interestRatio: 0 };
    }

    const r = annualRate / (12 * 100); // monthly interest rate
    const n = N_years * 12; // total monthly periods

    // Standard Amortization Formula: EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    const principalRatio = Math.round((P / totalPayment) * 100);
    const interestRatio = 100 - principalRatio;

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      principalRatio,
      interestRatio,
    };
  }, [loanAmount, interestRate, tenureYears]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleReset = () => {
    setLoanAmount(4500000);
    setInterestRate(8.5);
    setTenureYears(20);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone p-6 sm:p-8 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-stone mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-royal mb-1">
            <Calculator className="w-3.5 h-3.5" />
            <span>Financial Planning Tool</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal">
            Home Loan EMI Calculator
          </h3>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Calculate your estimated monthly payment and interest for properties in Vasai-Palghar.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-muted hover:text-navy flex items-center gap-1 border border-stone px-2.5 py-1.5 rounded-lg hover:bg-ivory transition-colors"
          title="Reset Calculator"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Slider 1: Loan Amount */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Loan Amount
              </label>
              <span className="font-serif text-lg font-bold text-navy">
                {formatCurrency(loanAmount)}
              </span>
            </div>
            <input
              type="range"
              min="500000"
              max="20000000"
              step="100000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-royal h-2 bg-stone/60 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted mt-1">
              <span>₹5 Lakh</span>
              <span>₹1 Crore</span>
              <span>₹2 Crore</span>
            </div>
          </div>

          {/* Slider 2: Interest Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Interest Rate (% P.A.)
              </label>
              <span className="font-serif text-lg font-bold text-navy">
                {interestRate}%
              </span>
            </div>
            <input
              type="range"
              min="6.5"
              max="15.0"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-royal h-2 bg-stone/60 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted mt-1">
              <span>6.5%</span>
              <span>9.0%</span>
              <span>15.0%</span>
            </div>
          </div>

          {/* Slider 3: Tenure */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Loan Tenure (Years)
              </label>
              <span className="font-serif text-lg font-bold text-navy">
                {tenureYears} Years ({tenureYears * 12} Mos)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-royal h-2 bg-stone/60 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted mt-1">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
          </div>
        </div>

        {/* Right Output Card (5 Cols) */}
        <div className="lg:col-span-5 bg-navy text-white rounded-2xl p-6 sm:p-7 shadow-elevated flex flex-col justify-between">
          <div>
            <div className="text-white text-xs uppercase font-bold tracking-wider mb-1">
              Estimated Monthly EMI
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-blue-200 tracking-tight mb-6">
              {formatCurrency(calculation.monthlyEmi)}
              <span className="text-xs font-normal text-white font-sans ml-1">/ month</span>
            </div>

            <div className="space-y-3.5 pb-6 border-b border-white/15 text-xs">
              <div className="flex justify-between">
                <span className="text-white">Principal Loan Amount:</span>
                <span className="font-bold text-white">{formatCurrency(loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Total Interest Payable:</span>
                <span className="font-bold text-blue-200">{formatCurrency(calculation.totalInterest)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 text-sm">
                <span className="font-bold text-white">Total Amount (P + I):</span>
                <span className="font-bold text-white">{formatCurrency(calculation.totalPayment)}</span>
              </div>
            </div>

            {/* Visual Ratio Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-[11px] font-semibold mb-1.5 text-white">
                <span>Principal ({calculation.principalRatio}%)</span>
                <span>Interest ({calculation.interestRatio}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden flex">
                <div
                  style={{ width: `${calculation.principalRatio}%` }}
                  className="bg-royal h-full transition-all duration-300"
                />
                <div
                  style={{ width: `${calculation.interestRatio}%` }}
                  className="bg-brandRed/75 h-full transition-all duration-300"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-[10px] text-white leading-relaxed flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-brandRed flex-shrink-0 mt-0.5" />
            <span>
              Disclaimer: This EMI calculation is for illustration and planning purposes only. Bank processing fees, stamp duty, GST, and final interest rates are subject to lender policies.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
