import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Maximize2,
  ArrowUpRight,
  MessageSquare,
  Heart,
  Scale,
  Landmark,
  Building,
  Home,
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { isFavourite, toggleFavourite, isInCompare, toggleCompare, subscribeToPreferences } from '../services/userPreferences';
import { contactInfo } from '../data/contactInfo';
import { getLocationDisplayName } from '../data/locations';

export default function PropertyCard({
  property,
  onViewDetails,
  onEnquire,
  onNavigate,
  showCompare = true,
  className = '',
}) {
  const propId = property?.id;
  const [fav, setFav] = useState(() => (propId ? isFavourite(propId) : false));
  const [inComp, setInComp] = useState(() => (propId ? isInCompare(propId) : false));

  useEffect(() => {
    if (!propId) return;
    return subscribeToPreferences((type) => {
      if (type === 'favourites') setFav(isFavourite(propId));
      if (type === 'compare') setInComp(isInCompare(propId));
    });
  }, [propId]);

  if (!property) return null;

  const handleToggleFav = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const newState = toggleFavourite(property.id);
    setFav(newState);
  };

  const handleToggleCompare = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const res = toggleCompare(property.id);
    if (!res.success && res.message) {
      alert(res.message);
    }
  };

  const isPlot =
    property.transactionType === 'plots-land' ||
    (property.category && property.category.includes('plot'));
  const isCommercial =
    property.transactionType === 'commercial' ||
    (property.category && property.category.startsWith('commercial'));
  const isRental =
    property.transactionType === 'rent' ||
    (property.category && property.category.includes('rent'));

  // Display fields
  const displayPrice = property.priceDisplay || property.priceFormatted || 'Price on Request';
  const displayArea =
    property.areaDisplay ||
    property.carpetArea ||
    (property.areaSqFt ? `${property.areaSqFt} sq.ft` : null) ||
    'Specification on Request';

  let configDisplay = '';
  if (isPlot) {
    configDisplay = property.category === 'na-plot' ? 'Sanctioned NA Plot' : (property.category === 'industrial-plot' ? 'MIDC Industrial Plot' : 'Residential Plot');
  } else if (isCommercial) {
    configDisplay = property.category === 'commercial-shop' ? 'Commercial Retail Shop' : 'Commercial Office Suite';
  } else if (property.bedrooms) {
    configDisplay = `${property.bedrooms} BHK ${isRental ? 'Rental Flat' : 'Apartment'}`;
  } else {
    configDisplay = property.category ? property.category.replace('-', ' ') : 'Property Unit';
  }

  const possessionDisplay = property.possessionDisplay || property.possessionStatus || 'Ready to Inspect';
  const localityName = getLocationDisplayName(property.locality);

  // WhatsApp quick query
  const whatsappUrl = `https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent(
    `Hello Tomar Enterprises, I am interested in: ${property.title} (${displayPrice}, Ref: ${property.id}) in ${property.locality}. Please provide unit details.`
  )}`;

  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate(`/properties/${property.slug || property.id}`);
    } else if (onViewDetails) {
      onViewDetails(property);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group cursor-pointer bg-white rounded-2xl border border-stone overflow-hidden shadow-subtle hover:shadow-card hover:border-royal/50 transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      {/* Top Media & Badges */}
      <div>
        <div className="relative aspect-[16/11] overflow-hidden bg-stone/40">
          <img
            src={property.image}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80';
            }}
          />

          {/* Top Left Transaction & Category Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-sm bg-navy/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              {property.transactionType?.toUpperCase() || 'PROPERTY'}
            </span>
            <span className="px-2.5 py-1 rounded-sm bg-royal/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              {property.category ? property.category.replace('-', ' ') : 'Prime'}
            </span>
          </div>

          {/* Top Right Actions: Favourite Heart */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleFav}
              title={fav ? 'Remove from Favourites' : 'Save to Favourites'}
              aria-label={fav ? 'Remove from Favourites' : 'Save to Favourites'}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                fav
                  ? 'bg-brandRed text-white shadow-sm scale-110'
                  : 'bg-black/40 text-white hover:bg-black/60 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${fav ? 'fill-white stroke-white' : 'stroke-white'}`} />
            </button>
          </div>

          {/* Review Notice if outside primary service zone */}
          {property.isOutsidePrimaryServiceArea && (
            <div className="absolute top-12 right-3 px-2 py-0.5 rounded bg-amber-900/80 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-amber-200">
              Outside Primary Zone
            </div>
          )}

          {/* Bottom Locality Badge on Image */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-navy/85 backdrop-blur-md text-white text-[11px] font-semibold shadow-xs max-w-full truncate">
              <MapPin className="w-3.5 h-3.5 text-brandRed flex-shrink-0" />
              <span className="truncate">{property.subLocation || localityName}</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 pb-2">
          {/* Price Header */}
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="font-serif text-xl sm:text-2xl font-bold text-navy tracking-tight">
              {displayPrice}
            </div>
            {property.pricePerSqft && (
              <div className="text-xs text-muted font-semibold">
                {property.pricePerSqft}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-base sm:text-lg font-normal text-charcoal group-hover:text-navy transition-colors mb-2.5 line-clamp-1">
            {property.title}
          </h3>

          {/* Specifications Grid — Adaptive for Plots vs Flats vs Commercial */}
          <div className="grid grid-cols-2 gap-2 py-2.5 border-y border-stone/60 text-xs text-charcoal/90 my-2">
            {/* Spec 1: Area */}
            <div className="flex items-center gap-1.5 min-w-0">
              <Maximize2 className="w-3.5 h-3.5 text-royal flex-shrink-0" />
              <span className="truncate font-medium">{displayArea}</span>
            </div>

            {/* Spec 2: Adaptive Configuration */}
            <div className="flex items-center gap-1.5 min-w-0">
              {isPlot ? (
                <Landmark className="w-3.5 h-3.5 text-royal flex-shrink-0" />
              ) : isCommercial ? (
                <Building className="w-3.5 h-3.5 text-royal flex-shrink-0" />
              ) : (
                <Home className="w-3.5 h-3.5 text-royal flex-shrink-0" />
              )}
              <span className="truncate font-medium capitalize">{configDisplay}</span>
            </div>

            {/* Spec 3: Possession / Status */}
            <div className="col-span-2 text-[11px] text-muted truncate flex items-center justify-between">
              <span>
                <strong className="text-charcoal font-semibold">Status: </strong>
                {possessionDisplay}
              </span>
              <span className="text-[10px] text-charcoal/60 uppercase">Ref: {property.id}</span>
            </div>
          </div>

          {/* Description Snippet */}
          <p className="text-xs text-muted line-clamp-2 mb-2 leading-relaxed">
            {property.description}
          </p>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 sm:p-5 pt-0">
        <div className="pt-3 border-t border-stone/50 flex flex-col gap-2">
          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="flex-1 inline-flex items-center justify-center gap-1 h-9 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-navy bg-ivory hover:bg-stone/60 border border-stone transition-colors"
            >
              <span>View Details</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-royal" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onEnquire) onEnquire(property);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1 h-9 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-brandRed hover:bg-brandRed-700 transition-colors shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-white" />
              <span>Enquire</span>
            </button>
          </div>

          {/* Secondary Quick Channels: WhatsApp & Compare */}
          <div className="flex items-center justify-between text-[11px] text-muted pt-1">
            {showCompare && (
              <button
                type="button"
                onClick={handleToggleCompare}
                className={`inline-flex items-center gap-1 font-semibold hover:text-navy transition-colors ${
                  inComp ? 'text-navy font-bold' : 'text-muted'
                }`}
              >
                <Scale className={`w-3 h-3 ${inComp ? 'text-royal' : ''}`} />
                <span>{inComp ? 'In Compare (✓)' : '+ Compare'}</span>
              </button>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold transition-colors ml-auto"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
