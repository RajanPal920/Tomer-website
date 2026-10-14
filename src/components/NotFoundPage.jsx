import React from 'react';
import { Compass, Home, Search, PhoneCall } from 'lucide-react';

export default function NotFoundPage({ path = '', onNavigate }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4 sm:px-6 bg-ivory">
      <div className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl border border-stone text-center shadow-card animate-fadeIn">
        
        {/* Emblem */}
        <div className="w-20 h-20 rounded-2xl bg-stone/50 text-navy flex items-center justify-center mx-auto mb-6 border border-royal/30 shadow-xs">
          <Compass className="w-10 h-10 text-royal" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-brandRed/10 text-brandRed text-xs font-bold uppercase tracking-wider mb-3">
          404 &bull; Page Not Found
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal mb-3">
          Destination Not Located
        </h1>

        <p className="text-muted text-sm sm:text-base leading-relaxed mb-8">
          The real estate address or page <code className="px-2 py-0.5 rounded bg-stone/40 text-navy font-semibold text-xs">{path || 'requested'}</code> does not exist in our catalog or may have been updated.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            <Home className="w-4 h-4 text-white" />
            <span>Return Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/properties')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-ivory border border-navy/30 text-navy font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
          >
            <Search className="w-4 h-4 text-royal" />
            <span>Browse Properties</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/contact')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone/40 hover:bg-stone/70 text-charcoal font-bold text-xs uppercase tracking-wider transition-all"
          >
            <PhoneCall className="w-4 h-4 text-navy" />
            <span>Contact Desk</span>
          </button>
        </div>

      </div>
    </div>
  );
}
