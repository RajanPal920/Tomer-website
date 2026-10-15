import React, { useState, useEffect } from 'react';
import { X, Scale, Trash2, ArrowUpRight, MessageSquare, Check, MapPin } from 'lucide-react';
import { getCompareList, toggleCompare, clearCompare, subscribeToPreferences } from '../services/userPreferences';
import { getAllProperties } from '../data/properties';

export default function PropertyComparisonModal({ onClose, onViewDetails, onEnquire }) {
  const [compareIds, setCompareIds] = useState(() => getCompareList());
  const allProps = getAllProperties();

  useEffect(() => {
    return subscribeToPreferences((type, data) => {
      if (type === 'compare') {
        setCompareIds(data || getCompareList());
      }
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const propertiesToCompare = compareIds
    .map((id) => allProps.find((p) => p.id === id))
    .filter(Boolean);

  const handleRemove = (id) => {
    toggleCompare(id);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
    >
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-modal border border-stone overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-navy text-white flex items-center justify-between border-b border-navy-700 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-brandRed" />
            <h2 id="compare-modal-title" className="font-serif text-xl font-normal">
              Compare Properties ({propertiesToCompare.length}/3)
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {propertiesToCompare.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="text-xs text-white hover:text-stone-light flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white hover:text-stone-light hover:bg-white/10 transition-colors"
              aria-label="Close compare window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-x-auto overflow-y-auto p-6 flex-1">
          {propertiesToCompare.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-ivory text-muted flex items-center justify-center mx-auto mb-4 border border-stone">
                <Scale className="w-8 h-8 text-royal" />
              </div>
              <h3 className="font-serif text-2xl text-charcoal font-normal mb-2">
                No Properties in Comparison
              </h3>
              <p className="text-sm text-muted max-w-md mx-auto mb-6">
                Click the "+ Compare" button on any property card to view side-by-side specifications, pricing, and locations.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-navy text-white text-xs font-bold uppercase tracking-wider hover:bg-navy-900 transition-colors"
              >
                Explore Properties
              </button>
            </div>
          ) : (
            <div className="min-w-[640px]">
              {/* Properties Grid Headers */}
              <div
                className={`grid gap-4 mb-6 ${
                  propertiesToCompare.length === 1
                    ? 'grid-cols-1'
                    : propertiesToCompare.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-3'
                }`}
              >
                {propertiesToCompare.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-4 rounded-xl bg-ivory/60 border border-stone flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-3 bg-stone">
                        <img
                          src={prop.image}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemove(prop.id)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white hover:bg-red-600 flex items-center justify-center transition-colors"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="font-serif text-xl font-bold text-navy mb-1">
                        {prop.priceDisplay || prop.priceFormatted}
                      </div>
                      <h4 className="font-serif text-base text-charcoal font-normal line-clamp-1 mb-2">
                        {prop.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-muted mb-4">
                        <MapPin className="w-3.5 h-3.5 text-brandRed flex-shrink-0" />
                        <span className="truncate">{prop.subLocation || prop.locality}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-stone/50">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onViewDetails) onViewDetails(prop);
                        }}
                        className="flex-1 py-1.5 px-2 rounded bg-white border border-stone text-xs font-bold text-navy hover:bg-stone/30 uppercase tracking-wider flex items-center justify-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowUpRight className="w-3 h-3 text-royal" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onEnquire) onEnquire(prop);
                        }}
                        className="flex-1 py-1.5 px-2 rounded bg-brandRed text-white text-xs font-bold uppercase tracking-wider hover:bg-brandRed-700 flex items-center justify-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3 text-white" />
                        <span>Enquire</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Attributes Table */}
              <div className="border border-stone rounded-xl overflow-hidden divide-y divide-stone text-xs">
                {/* Row: Transaction & Category */}
                <div className="bg-stone/30 px-4 py-2 font-bold uppercase tracking-wider text-charcoal">
                  Property Classification
                </div>
                <div
                  className={`grid px-4 py-3 divide-x divide-stone ${
                    propertiesToCompare.length === 1
                      ? 'grid-cols-1'
                      : propertiesToCompare.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}
                >
                  {propertiesToCompare.map((p) => (
                    <div key={p.id} className="px-3 first:pl-0">
                      <span className="font-semibold text-navy capitalize">
                        {p.transactionType} • {p.category?.replace('-', ' ')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Row: Area / Size */}
                <div className="bg-stone/30 px-4 py-2 font-bold uppercase tracking-wider text-charcoal">
                  Area & Dimensions
                </div>
                <div
                  className={`grid px-4 py-3 divide-x divide-stone ${
                    propertiesToCompare.length === 1
                      ? 'grid-cols-1'
                      : propertiesToCompare.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}
                >
                  {propertiesToCompare.map((p) => (
                    <div key={p.id} className="px-3 first:pl-0">
                      <span className="font-bold text-charcoal">
                        {p.areaDisplay || (p.areaSqFt ? `${p.areaSqFt} sq.ft` : 'N/A')}
                      </span>
                      {p.pricePerSqft && (
                        <div className="text-[11px] text-muted">{p.pricePerSqft}</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Row: Configuration (Adaptive: omit BHK for land!) */}
                <div className="bg-stone/30 px-4 py-2 font-bold uppercase tracking-wider text-charcoal">
                  Configuration / Layout
                </div>
                <div
                  className={`grid px-4 py-3 divide-x divide-stone ${
                    propertiesToCompare.length === 1
                      ? 'grid-cols-1'
                      : propertiesToCompare.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}
                >
                  {propertiesToCompare.map((p) => {
                    const isLand = p.transactionType === 'plots-land' || p.category?.includes('plot');
                    return (
                      <div key={p.id} className="px-3 first:pl-0">
                        {isLand ? (
                          <span className="text-muted">Land Parcel (Not applicable)</span>
                        ) : p.bedrooms ? (
                          <span className="font-bold text-navy">{p.bedrooms} BHK</span>
                        ) : (
                          <span className="font-semibold capitalize text-charcoal">
                            {p.category?.replace('-', ' ')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Row: Possession / Contract */}
                <div className="bg-stone/30 px-4 py-2 font-bold uppercase tracking-wider text-charcoal">
                  Possession Status
                </div>
                <div
                  className={`grid px-4 py-3 divide-x divide-stone ${
                    propertiesToCompare.length === 1
                      ? 'grid-cols-1'
                      : propertiesToCompare.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}
                >
                  {propertiesToCompare.map((p) => (
                    <div key={p.id} className="px-3 first:pl-0">
                      <span className="font-semibold text-charcoal">
                        {p.possessionDisplay || p.possessionStatus || 'Ready'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Row: Key Features */}
                <div className="bg-stone/30 px-4 py-2 font-bold uppercase tracking-wider text-charcoal">
                  Key Features
                </div>
                <div
                  className={`grid px-4 py-3 divide-x divide-stone ${
                    propertiesToCompare.length === 1
                      ? 'grid-cols-1'
                      : propertiesToCompare.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}
                >
                  {propertiesToCompare.map((p) => (
                    <div key={p.id} className="px-3 first:pl-0 space-y-1">
                      {(p.features || []).slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-start gap-1 text-[11px] text-charcoal/80">
                          <Check className="w-3 h-3 text-brandRed flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
