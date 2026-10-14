import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Heart, Scale, Shield } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { contactInfo } from '../data/contactInfo';
import { getFavourites, getCompareList, subscribeToPreferences } from '../services/userPreferences';

export default function TopBar({ onOpenFavourites, onOpenCompare, onNavigate }) {
  const [favCount, setFavCount] = useState(() => getFavourites().length);
  const [compareCount, setCompareCount] = useState(() => getCompareList().length);

  useEffect(() => {
    return subscribeToPreferences((type) => {
      if (type === 'favourites') setFavCount(getFavourites().length);
      if (type === 'compare') setCompareCount(getCompareList().length);
    });
  }, []);

  return (
    <div className="bg-navy-950 text-stone text-xs border-b border-white/10 relative z-50">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
        {/* Left: Office Location & Service Corridor */}
        <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-stone/90 font-medium flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-brandRed flex-shrink-0" />
            <span className="font-semibold text-white">Office:</span>
            <span className="text-white/95 truncate">Virar East (Nakshatra Apt, Viva Jangid Complex)</span>
          </div>

          <span className="hidden xl:inline text-white/20 flex-shrink-0">|</span>
          <span className="hidden xl:inline text-stone/80 font-normal truncate">
            Corridor: {contactInfo.shortServiceArea}
          </span>
        </div>

        {/* Right: Saved, Compare, Phones, WhatsApp & Owner Portal */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0">
          {/* Saved Favourites */}
          {onOpenFavourites && (
            <button
              type="button"
              onClick={onOpenFavourites}
              className="inline-flex items-center gap-1 text-stone hover:text-white transition-colors"
              title="Saved Favourites"
            >
              <Heart className={`w-3.5 h-3.5 ${favCount > 0 ? 'text-brandRed fill-brandRed' : 'text-stone'}`} />
              <span className="hidden sm:inline font-medium">Saved</span>
              {favCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-brandRed text-white font-bold text-[10px]">
                  {favCount}
                </span>
              )}
            </button>
          )}

          {/* Compare */}
          {onOpenCompare && (
            <button
              type="button"
              onClick={onOpenCompare}
              className="inline-flex items-center gap-1 text-stone hover:text-white transition-colors"
              title="Compare Properties"
            >
              <Scale className={`w-3.5 h-3.5 ${compareCount > 0 ? 'text-blue-300' : 'text-stone'}`} />
              <span className="hidden sm:inline font-medium">Compare</span>
              {compareCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-royal text-white font-bold text-[10px] border border-blue-400/40">
                  {compareCount}
                </span>
              )}
            </button>
          )}

          <span className="hidden sm:inline text-white/20">|</span>

          {/* Direct Phone Sanjay Tomar */}
          <a
            href={`tel:${contactInfo.phoneSanjay1Raw}`}
            className="flex items-center gap-1 text-stone hover:text-white transition-colors duration-200"
            title="Call Sanjay Tomar"
          >
            <Phone className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" />
            <span className="font-semibold text-xs tracking-wide hidden md:inline">Sanjay: {contactInfo.phoneSanjay1Display || '+91 82370 92224'}</span>
            <span className="font-semibold text-xs tracking-wide md:hidden">{contactInfo.phoneSanjay1Display || '+91 82370 92224'}</span>
          </a>

          {/* WhatsApp Link (Sanjay Tomar) */}
          <a
            href={contactInfo.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors duration-200 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10"
            title="Chat with Sanjay Tomar on WhatsApp"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline font-semibold">WhatsApp</span>
          </a>

          <span className="text-white/20">|</span>

          {/* Owner Portal Link */}
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('/owner-login')}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/10 hover:bg-brandRed text-white text-[11px] font-bold uppercase tracking-wider transition-colors border border-white/20 hover:border-brandRed"
              title="Owner & Admin Secure Portal"
            >
              <Shield className="w-3 h-3 text-blue-300 group-hover:text-white" />
              <span>Owner Portal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
