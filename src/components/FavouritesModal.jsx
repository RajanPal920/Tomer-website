import React, { useState, useEffect } from 'react';
import { X, Heart, Trash2 } from 'lucide-react';
import { getFavourites, toggleFavourite, subscribeToPreferences } from '../services/userPreferences';
import { getAllProperties } from '../data/properties';
import PropertyCard from './PropertyCard';

export default function FavouritesModal({ onClose, onViewDetails, onEnquire, onNavigate }) {
  const [favIds, setFavIds] = useState(() => getFavourites());
  const allProps = getAllProperties();

  useEffect(() => {
    return subscribeToPreferences((type, data) => {
      if (type === 'favourites') {
        setFavIds(data || getFavourites());
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

  const favouriteProperties = favIds
    .map((id) => allProps.find((p) => p.id === id))
    .filter(Boolean);

  const handleClearAll = () => {
    favIds.forEach((id) => toggleFavourite(id));
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="favs-modal-title"
    >
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-modal border border-stone overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-navy text-white flex items-center justify-between border-b border-navy-700 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-brandRed fill-brandRed" />
            <h2 id="favs-modal-title" className="font-serif text-xl font-normal">
              Saved Favourites ({favouriteProperties.length})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {favouriteProperties.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-stone/80 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close favourites"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="overflow-y-auto p-6 sm:p-8 flex-1">
          {favouriteProperties.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-ivory text-muted flex items-center justify-center mx-auto mb-4 border border-stone">
                <Heart className="w-8 h-8 text-brandRed" />
              </div>
              <h3 className="font-serif text-2xl text-charcoal font-normal mb-2">
                You haven't saved any properties yet
              </h3>
              <p className="text-sm text-muted max-w-md mx-auto mb-6">
                Click the heart icon on any property card to save it here for easy access, comparison, and enquiry.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-navy text-white text-xs font-bold uppercase tracking-wider hover:bg-navy-900 transition-colors"
              >
                Browse Listings
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favouriteProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onViewDetails={(p) => {
                    onClose();
                    if (onViewDetails) onViewDetails(p);
                  }}
                  onEnquire={(p) => {
                    onClose();
                    if (onEnquire) onEnquire(p);
                  }}
                  onNavigate={(path) => {
                    onClose();
                    if (onNavigate) onNavigate(path);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
