import React, { useState, useEffect } from 'react';
import { X, MapPin, CheckCircle2, MessageSquare, Phone, Shield } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { contactInfo } from '../data/contactInfo';

export default function PropertyDetailModal({ property, onClose, onEnquire }) {
  const [activeImage, setActiveImage] = useState(property?.gallery?.[0] || property?.image || '');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!property) return null;

  const galleryImages = property.gallery && property.gallery.length > 0
    ? property.gallery
    : [property.image];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-property-title"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-modal border border-stone overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-navy text-white flex items-center justify-between border-b border-navy-700">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-brandRed text-white text-xs font-bold uppercase tracking-wider">
              {property.badge || property.category}
            </span>
            <span className="text-xs text-white">Ref: {property.id}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white hover:text-stone-light hover:bg-white/10 transition-colors"
            aria-label="Close property details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-stone/40">
              <img
                src={activeImage}
                alt={property.title}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-white text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brandRed" />
                <span>{property.subLocation}</span>
              </div>
            </div>

            {/* Thumbnail selector if multiple */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-14 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImage === img ? 'border-brandRed shadow-sm' : 'border-stone opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Key Meta */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-5 border-b border-stone">
            <div>
              <h2 id="modal-property-title" className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
                {property.title}
              </h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted mt-1">
                <MapPin className="w-4 h-4 text-brandRed flex-shrink-0" />
                <span>{property.subLocation}, {property.locality}</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-navy">
                {property.priceDisplay || property.priceFormatted}
              </div>
              {property.pricePerSqft && (
                <div className="text-xs text-muted font-medium">
                  {property.pricePerSqft}
                </div>
              )}
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-ivory rounded-xl p-4 border border-stone/70 text-xs">
            <div>
              <span className="text-muted block text-[11px] uppercase font-semibold">Area</span>
              <span className="font-bold text-charcoal text-sm">{property.areaDisplay || property.carpetArea || (property.areaSqFt ? `${property.areaSqFt} sq.ft` : 'N/A')}</span>
            </div>
            <div>
              <span className="text-muted block text-[11px] uppercase font-semibold">Configuration</span>
              <span className="font-bold text-charcoal text-sm capitalize">{property.bedrooms ? `${property.bedrooms} BHK` : (property.bhk || property.category?.replace('-', ' ') || 'Commercial Space')}</span>
            </div>
            <div>
              <span className="text-muted block text-[11px] uppercase font-semibold">Possession</span>
              <span className="font-bold text-charcoal text-sm">{property.possessionDisplay || property.possession || 'Ready to Move'}</span>
            </div>
            <div>
              <span className="text-muted block text-[11px] uppercase font-semibold">Furnishing</span>
              <span className="font-bold text-charcoal text-sm capitalize">{property.furnishing || 'Standard'}</span>
            </div>
          </div>

          {/* Overview Description */}
          <div>
            <h4 className="font-serif text-lg text-charcoal mb-2 font-normal">
              Property Overview
            </h4>
            <p className="text-sm text-muted leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Key Amenities & Features */}
          {property.features && (
            <div>
              <h4 className="font-serif text-lg text-charcoal mb-3 font-normal">
                Highlights & Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-charcoal/90">
                {property.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-royal flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification & Advisory Note */}
          <div className="p-3.5 rounded-lg bg-stone/30 border border-stone text-xs text-muted flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-royal flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-charcoal block">Property Advisory Notice:</strong>
              This profile illustrates property layout, carpet specification, and pricing benchmarks for the {property.locality} micro-market. Connect with our desk to verify live unit availability and arrange site inspections.
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 bg-ivory border-t border-stone flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a
              href={`tel:${contactInfo.phoneRaw}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold text-navy hover:bg-stone/60 border border-stone"
            >
              <Phone className="w-3.5 h-3.5 text-royal" />
              <span>Call Desk</span>
            </a>

            <a
              href={`https://wa.me/${contactInfo.whatsappNumber}?text=Hello%20Tomar%20Enterprises,%20I%20am%20interested%20in%20${encodeURIComponent(property.title)}%20(${encodeURIComponent(property.priceDisplay || property.priceFormatted || 'Property')})`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Inquiry</span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onEnquire(property);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-brandRed hover:bg-brandRed-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            <MessageSquare className="w-4 h-4 text-white" />
            <span>Enquire About This Property</span>
          </button>
        </div>
      </div>
    </div>
  );
}
