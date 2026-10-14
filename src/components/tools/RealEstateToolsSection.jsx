import React, { useState } from 'react';
import { Calculator, Landmark, Wrench } from 'lucide-react';
import EmiCalculator from './EmiCalculator';
import AreaConverter from './AreaConverter';

export default function RealEstateToolsSection({ defaultTab = 'emi' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <section id="tools" className="py-20 sm:py-24 bg-ivory border-t border-stone/70">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-royal mb-3">
              <Wrench className="w-3.5 h-3.5 text-royal flex-shrink-0" />
              <span>Buyer & Investor Utilities</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-normal tracking-tight text-balance mb-3">
              Real Estate Calculation Tools
            </h2>
            <p className="text-muted text-base leading-relaxed text-balance">
              Plan your property investment with clarity. Estimate your monthly home loan installments or convert Maharashtra plot measurements with accuracy.
            </p>
          </div>

          {/* Tool Switcher Tabs */}
          <div className="inline-flex p-1.5 rounded-xl bg-white border border-stone shadow-2xs self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('emi')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'emi'
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-charcoal hover:text-navy hover:bg-stone/30'
              }`}
            >
              <Calculator className={`w-3.5 h-3.5 ${activeTab === 'emi' ? 'text-white' : 'text-royal'}`} />
              <span>EMI Calculator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('converter')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'converter'
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-charcoal hover:text-navy hover:bg-stone/30'
              }`}
            >
              <Landmark className={`w-3.5 h-3.5 ${activeTab === 'converter' ? 'text-white' : 'text-royal'}`} />
              <span>Plot Area Converter</span>
            </button>
          </div>
        </div>

        {/* Active Tool Render */}
        <div className="transition-all duration-300">
          {activeTab === 'emi' ? <EmiCalculator /> : <AreaConverter />}
        </div>
      </div>
    </section>
  );
}
