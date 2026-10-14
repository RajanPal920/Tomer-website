import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUpRight, MapPin, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { contactInfo } from '../data/contactInfo';

export const HERO_SLIDES = [
  {
    id: 1,
    image: '/images/hero/hero-residential.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=90',
    tag: 'PRIME RESIDENTIAL • VASAI TO PALGHAR',
    eyebrow: 'YOUR PROPERTY. YOUR NEXT CHAPTER.',
    headline: 'Find the Right Property.',
    highlighted: 'Build Your Future.',
    description: 'Discover homes, commercial spaces and land opportunities across Vasai to Palghar with Tomar Enterprises.',
    primaryCtaText: 'Explore Properties',
    secondaryCtaText: 'Talk to Our Property Expert',
    actionType: 'explore',
  },
  {
    id: 2,
    image: '/images/hero/hero-apartments.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=90',
    tag: 'NEW HOMES & RESALE APARTMENTS',
    eyebrow: 'CURATED LIVING SPACES',
    headline: 'Find a Place to Call Home.',
    highlighted: 'Modern Gated Living.',
    description: 'Explore new homes and resale apartments across our service region with verified amenities and titles.',
    primaryCtaText: 'Explore Residential Properties',
    secondaryCtaText: 'Talk to Our Property Expert',
    actionType: 'filter',
    filterParams: { transactionType: 'buy', category: 'all' },
  },
  {
    id: 3,
    image: '/images/hero/hero-interior.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=90',
    tag: 'PREMIUM INTERIORS & FINISHES',
    eyebrow: 'NATURAL LIGHT & OPEN SKYLINE',
    headline: 'Your Next Chapter Starts Here.',
    highlighted: 'Thoughtfully Designed.',
    description: 'Discover residential opportunities for your lifestyle and budget, from cozy 1 BHKs to luxury 3 BHK family residences.',
    primaryCtaText: 'Explore Flats',
    secondaryCtaText: 'Talk to Our Property Expert',
    actionType: 'filter',
    filterParams: { transactionType: 'buy', category: 'resale-flat' },
  },
  {
    id: 4,
    image: '/images/hero/hero-commercial.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=90',
    tag: 'COMMERCIAL SHOPS & CORPORATE SUITES',
    eyebrow: 'MAIN ROAD MARKET FRONTAGE',
    headline: 'Space for Your Next Opportunity.',
    highlighted: 'High-Footfall Locations.',
    description: 'Explore commercial shops, office spaces and business property options in high-growth transit corridors.',
    primaryCtaText: 'Explore Commercial Properties',
    secondaryCtaText: 'Talk to Our Property Expert',
    actionType: 'filter',
    filterParams: { transactionType: 'commercial', category: 'all' },
  },
  {
    id: 5,
    image: '/images/hero/hero-land.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=90',
    tag: 'RESIDENTIAL & INDUSTRIAL PLOTS',
    eyebrow: 'FREEHOLD & DEMARCATED LAYOUTS',
    headline: 'Find Land with Potential.',
    highlighted: 'Strategic Plotted Growth.',
    description: 'Explore residential plots, NA plot enquiries and industrial land opportunities across the western corridor.',
    primaryCtaText: 'Explore Plots & Land',
    secondaryCtaText: 'Talk to Our Property Expert',
    actionType: 'filter',
    filterParams: { transactionType: 'plots-land', category: 'all' },
  },
  {
    id: 6,
    image: '/images/hero/hero-development.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=90',
    tag: 'DEVELOPMENT & REDEVELOPMENT',
    eyebrow: 'INFRASTRUCTURE & JOINT VENTURES',
    headline: "Building Tomorrow's Possibilities.",
    highlighted: 'Society Redevelopment.',
    description: 'Discuss new development and redevelopment opportunities with Tomar Enterprises with transparent local expertise.',
    primaryCtaText: 'Discuss a Project',
    secondaryCtaText: 'Talk to Our Property Expert',
    actionType: 'development',
  },
];

export default function Hero({
  onExploreClick,
  onTalkToExpertClick,
  onSlideAction,
  onDevelopmentClick,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = HERO_SLIDES.length;
  const timerRef = useRef(null);
  const touchStartXRef = useRef(null);

  // Preload all 6 hero images into memory on mount
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  // Function to advance to the next slide
  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  // Function to go to the previous slide
  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Robust, self-contained 5-second automatic continuous rotation
  useEffect(() => {
    timerRef.current = setInterval(() => {
      goToNextSlide();
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [goToNextSlide]);

  // Reset the 5-second timer whenever user manually navigates
  const handleManualNavigation = useCallback((action) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    action();
    timerRef.current = setInterval(() => {
      goToNextSlide();
    }, 5000);
  }, [goToNextSlide]);

  const nextSlide = () => {
    handleManualNavigation(() => goToNextSlide());
  };

  const prevSlide = () => {
    handleManualNavigation(() => goToPrevSlide());
  };

  const goToSlide = (idx) => {
    handleManualNavigation(() => setCurrentSlide(idx));
  };

  // Handle Primary CTA click for the active slide
  const handlePrimaryCta = (slide) => {
    if (slide.actionType === 'explore') {
      if (onExploreClick) onExploreClick();
    } else if (slide.actionType === 'filter') {
      if (onSlideAction) {
        onSlideAction(slide.filterParams);
      } else if (onExploreClick) {
        onExploreClick();
      }
    } else if (slide.actionType === 'development') {
      if (onDevelopmentClick) {
        onDevelopmentClick();
      } else {
        const devEl = document.getElementById('development');
        if (devEl) devEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartXRef.current = null;
  };

  const activeSlideData = HERO_SLIDES[currentSlide];

  return (
    <section
      id="home"
      className="relative overflow-hidden min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] flex items-center select-none"
      aria-label="Real estate hero showcase"
      aria-roledescription="carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 6 Real Estate Background Images - Smooth Crossfade */}
      <div className="absolute inset-0 z-0 bg-stone/20 overflow-hidden">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              <img
                src={slide.image}
                alt={slide.headline}
                loading="eager"
                fetchPriority={idx === 0 ? 'high' : 'auto'}
                className={`w-full h-full object-cover object-center transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                onError={(e) => {
                  e.currentTarget.src = slide.fallbackImage;
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Natural, clear daytime background showcase without darkening overlays */}

      {/* Hero Content Container */}
      <div className="relative z-20 w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 flex items-center justify-between">
        <div className="max-w-xl lg:max-w-2xl w-full">
          {/* Refined Architectural Text Panel */}
          <div className="bg-navy-900/85 backdrop-blur-md rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/20 shadow-2xl text-white relative">
            {/* 1. Introductory Label & Service Corridor Badge */}
            <div className="flex items-center justify-between gap-3 mb-3.5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-stone text-xs tracking-wider uppercase shadow-xs">
                <span className="w-2 h-2 rounded-full bg-brandRed animate-pulse" />
                <MapPin className="w-3.5 h-3.5 text-brandRed" />
                <span className="font-semibold text-white tracking-wide">{contactInfo.locationBadge}</span>
              </div>

              {/* Slide Counter */}
              <div className="flex items-center gap-1.5 text-xs font-mono tracking-widest text-white/90 font-bold">
                <span className="text-white">0{currentSlide + 1}</span>
                <span className="text-white/40">/</span>
                <span className="text-white/60">0{totalSlides}</span>
              </div>
            </div>

            {/* 2. Eyebrow */}
            <div className="text-red-400 tracking-[0.22em] text-xs sm:text-sm font-bold uppercase mb-2.5">
              {activeSlideData.eyebrow}
            </div>

            {/* 3. Main Heading */}
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-[44px] font-normal leading-[1.18] tracking-tight text-white mb-3 transition-all duration-300">
              {activeSlideData.headline}{' '}
              <span className="italic font-normal text-white/90 block sm:inline">
                {activeSlideData.highlighted}
              </span>
            </h1>

            {/* 4. Supporting Description */}
            <p className="text-stone/90 text-sm sm:text-base leading-relaxed mb-6 font-normal max-w-xl transition-all duration-300">
              {activeSlideData.description}
            </p>

            {/* 5. Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => handlePrimaryCta(activeSlideData)}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0"
              >
                <span>{activeSlideData.primaryCtaText}</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={onTalkToExpertClick}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/25 transition-all duration-200 flex-shrink-0"
              >
                <Compass className="w-4 h-4 text-white" />
                <span>Talk to Our Property Expert</span>
              </button>
            </div>

            {/* Slide Navigation Pagination Controls Inside Panel Bottom */}
            <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
              {/* Slide Indicator Pills */}
              <div className="flex items-center gap-2">
                {HERO_SLIDES.map((slide, idx) => {
                  const isActive = idx === currentSlide;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'w-8 bg-brandRed'
                          : 'w-2 bg-white/35 hover:bg-white/60'
                      }`}
                      aria-label={`Go to slide ${idx + 1}: ${slide.headline}`}
                      aria-current={isActive ? 'true' : 'false'}
                    />
                  );
                })}
              </div>

              {/* Prev / Next Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors border border-white/20"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors border border-white/20"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
