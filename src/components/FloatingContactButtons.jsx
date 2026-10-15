import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { contactInfo } from '../data/contactInfo';
import WhatsAppIcon from './WhatsAppIcon';

export default function FloatingContactButtons() {
  const [showCallTooltip, setShowCallTooltip] = useState(false);
  const [showWaTooltip, setShowWaTooltip] = useState(false);

  return (
    <aside
      aria-label="Quick contact advisory assistance"
      className="fixed z-50 flex flex-col items-center gap-3 pointer-events-auto print:hidden"
      style={{
        right: 'max(16px, calc(env(safe-area-inset-right, 0px) + 16px))',
        bottom: 'max(20px, calc(env(safe-area-inset-bottom, 0px) + 20px))',
      }}
    >
      {/* 1. Floating WhatsApp Button (Top) */}
      <div className="relative flex items-center justify-center">
        {/* Desktop Tooltip */}
        <span
          className={`hidden md:inline-block absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-navy-950/95 text-white text-xs font-semibold whitespace-nowrap shadow-lg border border-white/10 pointer-events-none transition-all duration-200 ${
            showWaTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          Chat with Advisor on WhatsApp
        </span>

        <a
          href={contactInfo.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setShowWaTooltip(true)}
          onMouseLeave={() => setShowWaTooltip(false)}
          onFocus={() => setShowWaTooltip(true)}
          onBlur={() => setShowWaTooltip(false)}
          aria-label="Chat with Tomar Enterprises on WhatsApp"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/50"
        >
          <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7" fill="#FFFFFF" />
        </a>
      </div>

      {/* 2. Floating Call Button (Bottom) */}
      <div className="relative flex items-center justify-center">
        {/* Desktop Tooltip */}
        <span
          className={`hidden md:inline-block absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-navy-950/95 text-white text-xs font-semibold whitespace-nowrap shadow-lg border border-white/10 pointer-events-none transition-all duration-200 ${
            showCallTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          Call Advisory Desk (+91 82370 92224)
        </span>

        <a
          href={`tel:${contactInfo.phoneRaw}`}
          onMouseEnter={() => setShowCallTooltip(true)}
          onMouseLeave={() => setShowCallTooltip(false)}
          onFocus={() => setShowCallTooltip(true)}
          onBlur={() => setShowCallTooltip(false)}
          aria-label="Call Tomar Enterprises advisory desk directly"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-brandRed hover:bg-brandRed-700 text-white flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-brandRed/50"
        >
          <Phone className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2] text-white" />
        </a>
      </div>
    </aside>
  );
}
