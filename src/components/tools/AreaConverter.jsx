import React, { useState, useMemo } from 'react';
import { ArrowRightLeft, Info, Landmark } from 'lucide-react';

const UNITS = [
  { id: 'sqft', label: 'Square Feet (sq.ft)', factorToSqFt: 1, note: 'Standard carpet & built-up metric' },
  { id: 'guntha', label: 'Guntha', factorToSqFt: 1089, note: 'Standard Maharashtra land measurement (33 ft × 33 ft)' },
  { id: 'acre', label: 'Acre', factorToSqFt: 43560, note: '1 Acre = 40 Gunthas = 43,560 sq.ft' },
  { id: 'sqm', label: 'Square Metre (sq.m)', factorToSqFt: 10.7639, note: '1 sq.m = 10.7639 sq.ft' },
  { id: 'sqyd', label: 'Square Yard / Gaj (sq.yd)', factorToSqFt: 9, note: '1 sq.yard = 9 sq.ft' },
  { id: 'bigha', label: 'Bigha (Maharashtra Standard)', factorToSqFt: 17424, note: 'Regional measurement: 1 Bigha = 16 Gunthas' },
];

export default function AreaConverter() {
  const [inputValue, setInputValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('guntha');
  const [toUnit, setToUnit] = useState('sqft');

  const conversions = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0) {
      return { converted: 0, allUnits: {} };
    }

    const fromObj = UNITS.find((u) => u.id === fromUnit) || UNITS[0];
    const toObj = UNITS.find((u) => u.id === toUnit) || UNITS[1];

    // Convert input to base square feet
    const sqFt = val * fromObj.factorToSqFt;

    // Convert from base square feet to target unit
    const converted = sqFt / toObj.factorToSqFt;

    // Precalculate all units for the handy matrix
    const allUnits = {};
    UNITS.forEach((u) => {
      allUnits[u.id] = (sqFt / u.factorToSqFt).toLocaleString('en-IN', {
        maximumFractionDigits: 3,
      });
    });

    return {
      converted: Number(converted.toFixed(4)),
      allUnits,
    };
  }, [inputValue, fromUnit, toUnit]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const selectedFromObj = UNITS.find((u) => u.id === fromUnit);
  const selectedToObj = UNITS.find((u) => u.id === toUnit);

  return (
    <div className="bg-white rounded-2xl border border-stone p-6 sm:p-8 shadow-card">
      {/* Header */}
      <div className="pb-6 border-b border-stone mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-royal mb-1">
          <Landmark className="w-3.5 h-3.5" />
          <span>Land & Plotting Utility</span>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal">
          Plot Area Unit Converter
        </h3>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Accurate land measurements for Vasai-to-Palghar plots, NA layouts, and agricultural parcels.
        </p>
      </div>

      {/* Converter Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-end mb-8">
        {/* Input Value */}
        <div className="md:col-span-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
            Area Value
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-ivory/50 border border-stone rounded-xl px-4 py-3 text-lg font-bold text-navy focus:outline-none focus:ring-2 focus:ring-royal"
            placeholder="Enter value"
          />
        </div>

        {/* From Unit */}
        <div className="md:col-span-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
            From Unit
          </label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full bg-ivory/50 border border-stone rounded-xl px-3 py-3 text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
          >
            {UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center pb-2">
          <button
            type="button"
            onClick={handleSwap}
            className="w-10 h-10 rounded-full bg-royal text-white hover:bg-navy flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
            title="Swap Units"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* To Unit */}
        <div className="md:col-span-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
            To Unit
          </label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full bg-ivory/50 border border-stone rounded-xl px-3 py-3 text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
          >
            {UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Display Box */}
      <div className="bg-ivory border border-royal/30 rounded-2xl p-6 sm:p-7 text-center mb-8 shadow-xs">
        <div className="text-xs uppercase font-bold text-muted tracking-wider mb-1">
          Conversion Result
        </div>
        <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-navy tracking-tight my-2">
          {conversions.converted.toLocaleString('en-IN', { maximumFractionDigits: 4 })}{' '}
          <span className="text-brandRed font-sans text-xl sm:text-2xl font-bold">
            {selectedToObj?.label.split('(')[0]}
          </span>
        </div>
        <div className="text-xs text-charcoal/80 font-medium">
          {inputValue || 0} {selectedFromObj?.label} = {conversions.converted.toLocaleString('en-IN', { maximumFractionDigits: 4 })} {selectedToObj?.label}
        </div>
      </div>

      {/* Maharashtra Reference Matrix */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-3 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-royal" />
          <span>Standard Maharashtra Land Measurement Reference</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-stone">
            <strong className="text-navy block font-bold">1 Guntha</strong>
            <span className="text-muted">1,089 sq.ft (33 ft × 33 ft)</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-stone">
            <strong className="text-navy block font-bold">1 Acre</strong>
            <span className="text-muted">40 Gunthas (43,560 sq.ft)</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-stone">
            <strong className="text-navy block font-bold">1 Square Metre</strong>
            <span className="text-muted">10.7639 Square Feet</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-stone">
            <strong className="text-navy block font-bold">1 Square Yard (Gaj)</strong>
            <span className="text-muted">9 Square Feet</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-stone">
            <strong className="text-navy block font-bold">1 Bigha (Reg.)</strong>
            <span className="text-muted">16 Gunthas (17,424 sq.ft)</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-stone">
            <strong className="text-navy block font-bold">1 Hectare</strong>
            <span className="text-muted">2.471 Acres (1,07,639 sq.ft)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
