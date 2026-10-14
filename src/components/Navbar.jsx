import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  ChevronDown,
  PlusCircle,
  PhoneCall,
  Building2,
  Home,
  Landmark,
  Key,
  Layers,
  Sparkles,
  Calculator,
  Scale,
  Heart,
  Train,
  Phone,
  ArrowRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import WhatsAppIcon from './WhatsAppIcon';
import { APPROVED_STATIONS } from '../data/locations';
import { contactInfo } from '../data/contactInfo';
import { getFavourites, getCompareList, subscribeToPreferences } from '../services/userPreferences';
import { isAuthenticated } from '../services/authService';

export default function Navbar({
  onOpenListModal,
  onSelectCategory,
  onNavigateSection,
  onNavigate,
  onOpenFavourites,
  onOpenCompare,
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'properties' | 'locations' | 'more' | null
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null);

  // Dynamic Saved & Compare counters for Mobile Drawer
  const [favCount, setFavCount] = useState(() => getFavourites().length);
  const [compareCount, setCompareCount] = useState(() => getCompareList().length);

  const dropdownTimerRef = useRef(null);

  // Subscribe to user preference changes (LocalStorage updates)
  useEffect(() => {
    return subscribeToPreferences((type) => {
      if (type === 'favourites') setFavCount(getFavourites().length);
      if (type === 'compare') setCompareCount(getCompareList().length);
    });
  }, []);

  // Sticky header transition on window scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation & body scroll lock for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setOpenDropdown(null);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Click outside listener to close desktop dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-dropdown-container]')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleMouseEnter = (menuName) => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
    }
    setOpenDropdown(menuName);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  const handleAction = (sectionId, filterData = null, path = null) => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);

    if (path && onNavigate) {
      onNavigate(path);
      return;
    }

    if (filterData && onSelectCategory) {
      onSelectCategory(filterData);
    } else if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleListPropertyClick = () => {
    if (isAuthenticated()) {
      if (onNavigate) onNavigate('/owner/dashboard/add');
    } else {
      if (onOpenListModal) onOpenListModal();
    }
  };

  // Dropdown 1: Properties Submenu
  const propertiesDropdownItems = [
    { label: 'All Properties', filter: { transactionType: 'all', category: 'all' }, path: '/properties', icon: Home, desc: 'Complete Vasai-to-Palghar portfolio' },
    { label: 'Buy Properties', filter: { transactionType: 'buy', category: 'all' }, path: '/buy', icon: Building2, desc: 'New launches & registered resale homes' },
    { label: 'New Flats', filter: { transactionType: 'buy', category: 'new-flat' }, path: '/buy', icon: Building2, desc: 'Townships & under-construction launches' },
    { label: 'Resale Flats', filter: { transactionType: 'buy', category: 'resale-flat' }, path: '/buy', icon: Home, desc: 'Ready-to-move clear title registered units' },
    { label: 'Rental Properties', filter: { transactionType: 'rent', category: 'flat-rent' }, path: '/rent', icon: Key, desc: 'Family apartments with verified agreements' },
    { label: 'Commercial Spaces', filter: { transactionType: 'commercial', category: 'all' }, path: '/commercial', icon: Landmark, desc: 'High-footfall shops & corporate offices' },
    { label: 'Plots & Land', filter: { transactionType: 'plots-land', category: 'all' }, path: '/plots', icon: Layers, desc: 'Collector NA, residential & industrial land' },
    { label: 'Lease & Heavy Deposit', filter: { transactionType: 'lease', category: 'all' }, path: '/lease', icon: Key, desc: 'Zero monthly rent 3-year term opportunities' },
  ];

  // Dropdown 2: Locations Submenu (7 Canonical Stations)
  const locationsDropdownItems = APPROVED_STATIONS.map((st) => ({
    label: st.displayName,
    path: `/locations/${st.slug}`,
    locationId: st.locationId,
    desc: st.description,
  }));

  // Dropdown 3: More Submenu (Tools, Projects, Secondary Destinations)
  const moreDropdownSections = [
    {
      heading: 'Real Estate Utilities',
      items: [
        { label: 'EMI Calculator', path: '/tools/emi-calculator', icon: Calculator, desc: 'Estimate monthly mortgage installments' },
        { label: 'Plot Area Converter', path: '/tools/plot-area-converter', icon: Landmark, desc: 'Convert Guntha, Acre, Sq.Ft & Sq.Mtr' },
      ],
    },
    {
      heading: 'Projects & Advisory',
      items: [
        { label: 'New Developments', path: '/projects/new-developments', section: 'development', icon: Sparkles, desc: 'Township master plans & builder launches' },
        { label: 'Society Redevelopment', path: '/projects/redevelopment', section: 'development', icon: Building2, desc: 'Feasibility studies & committee advisory' },
      ],
    },
    {
      heading: 'About & Guidance',
      items: [
        { label: 'Why Choose Tomar', path: null, section: 'why-us', icon: Shield, desc: 'Corridor understanding & verified advisory' },
        { label: 'Frequently Asked Questions', path: null, section: 'faqs', icon: HelpCircle, desc: 'Guidance on buying, plotting & leases' },
      ],
    },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-stone/80'
          : 'bg-white border-b border-stone/60'
          }`}
      >
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* ============================================================== */}
          {/* 3-AREA LAYOUT: CSS GRID on Desktop (xl: 1280px+), Flex on Mobile */}
          {/* ============================================================== */}
          <div className="flex items-center justify-between gap-4 2xl:gap-8 w-full min-h-[84px] sm:min-h-[96px] lg:min-h-[104px] py-2 sm:py-3">

            {/* ============================================================ */}
            {/* AREA 1 — BRAND: Logo, TOMAR ENTERPRISES, Subtitle            */}
            {/* ============================================================ */}
            <div className="flex-shrink-0 flex items-center min-w-[200px] sm:min-w-[240px] md:min-w-[280px]">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleAction('home', null, '/');
                }}
                className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded transition-transform hover:opacity-95"
                aria-label="Tomar Enterprises Home"
              >
                <BrandLogo variant="default" size="large" />
              </a>
            </div>

            {/* ============================================================ */}
            {/* AREA 2 — PRIMARY NAVIGATION: 8 Distinct Items (Desktop xl+)   */}
            {/* Center aligned with bold typography                          */}
            {/* ============================================================ */}
            <nav
              className="hidden xl:flex items-center justify-center gap-1.5 2xl:gap-3 text-sm 2xl:text-[15px] font-bold text-navy/90 flex-1 mx-2 2xl:mx-4 min-w-0"
              data-dropdown-container
              aria-label="Main Navigation"
            >
              {/* 1. Home */}
              <button
                type="button"
                onClick={() => handleAction('home', null, '/')}
                className="px-3 py-2 rounded-lg font-bold text-navy hover:text-brandRed hover:bg-ivory transition-colors whitespace-nowrap"
              >
                Home
              </button>

              {/* 2. Properties Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('properties')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => handleAction('listings', { transactionType: 'all', category: 'all' }, '/properties')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg font-bold transition-colors whitespace-nowrap ${openDropdown === 'properties' ? 'text-brandRed bg-ivory' : 'text-navy hover:text-brandRed hover:bg-ivory'
                    }`}
                  aria-expanded={openDropdown === 'properties'}
                  aria-haspopup="true"
                >
                  <span>Properties</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'properties' ? 'rotate-180 text-brandRed' : 'text-muted'}`} />
                </button>

                {openDropdown === 'properties' && (
                  <div className="absolute left-0 mt-1 w-80 bg-white rounded-2xl shadow-elevated border border-stone p-2.5 z-50 animate-fadeIn">
                    <div className="px-3 py-1.5 border-b border-stone/50 mb-1 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted">All Portfolios</span>
                      <span className="text-[10px] text-royal font-bold">Vasai to Palghar</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1 max-h-[440px] overflow-y-auto">
                      {propertiesDropdownItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAction('listings', item.filter, item.path)}
                            className="flex items-center gap-3 p-2 rounded-xl text-left hover:bg-brandBlue-light hover:text-navy transition-colors group"
                          >
                            <div className="p-1.5 rounded-lg bg-brandBlue-light text-royal group-hover:bg-royal group-hover:text-white transition-colors flex-shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-charcoal group-hover:text-navy truncate">
                                {item.label}
                              </div>
                              <div className="text-[11px] text-muted truncate">
                                {item.desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Buy (Direct Shortcut) */}
              <button
                type="button"
                onClick={() => handleAction('listings', { transactionType: 'buy', category: 'all' }, '/buy')}
                className="px-3 py-2 rounded-lg font-bold text-navy hover:text-brandRed hover:bg-ivory transition-colors whitespace-nowrap"
              >
                Buy
              </button>

              {/* 4. Rent (Direct Shortcut) */}
              <button
                type="button"
                onClick={() => handleAction('listings', { transactionType: 'rent', category: 'all' }, '/rent')}
                className="px-3 py-2 rounded-lg font-bold text-navy hover:text-brandRed hover:bg-ivory transition-colors whitespace-nowrap"
              >
                Rent
              </button>

              {/* 5. Commercial (Direct Shortcut) */}
              <button
                type="button"
                onClick={() => handleAction('listings', { transactionType: 'commercial', category: 'all' }, '/commercial')}
                className="px-3 py-2 rounded-lg font-bold text-navy hover:text-brandRed hover:bg-ivory transition-colors whitespace-nowrap"
              >
                Commercial
              </button>

              {/* 6. Plots & Land (Direct Shortcut) */}
              <button
                type="button"
                onClick={() => handleAction('listings', { transactionType: 'plots-land', category: 'all' }, '/plots')}
                className="px-3 py-2 rounded-lg font-bold text-navy hover:text-brandRed hover:bg-ivory transition-colors whitespace-nowrap"
              >
                Plots & Land
              </button>

              {/* 7. Locations Dropdown (7 Station Corridor) */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('locations')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => handleAction('localities')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg font-bold transition-colors whitespace-nowrap ${openDropdown === 'locations' ? 'text-brandRed bg-ivory' : 'text-navy hover:text-brandRed hover:bg-ivory'
                    }`}
                  aria-expanded={openDropdown === 'locations'}
                  aria-haspopup="true"
                >
                  <span>Locations</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'locations' ? 'rotate-180 text-brandRed' : 'text-muted'}`} />
                </button>

                {openDropdown === 'locations' && (
                  <div className="absolute left-0 mt-1 w-72 bg-white rounded-2xl shadow-elevated border border-stone p-2.5 z-50 animate-fadeIn">
                    <div className="px-3 py-1.5 border-b border-stone/50 mb-1 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted">7 Station Corridor</span>
                      <span className="text-[10px] text-royal font-bold">WR Mainline</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {locationsDropdownItems.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAction(null, null, item.path)}
                          className="flex items-center justify-between p-2 rounded-xl text-left hover:bg-brandBlue-light hover:text-navy transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Train className="w-3.5 h-3.5 text-royal flex-shrink-0 group-hover:text-brandRed transition-colors" />
                            <span className="text-xs font-bold text-charcoal group-hover:text-navy">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted group-hover:text-royal font-medium">Explore &rarr;</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 8. More Dropdown (Tools, Projects, Redevelopment, Advisory) */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('more')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg font-bold transition-colors whitespace-nowrap ${openDropdown === 'more' ? 'text-brandRed bg-ivory' : 'text-navy hover:text-brandRed hover:bg-ivory'
                    }`}
                  aria-expanded={openDropdown === 'more'}
                  aria-haspopup="true"
                >
                  <span>More</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'more' ? 'rotate-180 text-brandRed' : 'text-muted'}`} />
                </button>

                {openDropdown === 'more' && (
                  <div className="absolute right-0 mt-1 w-80 bg-white rounded-2xl shadow-elevated border border-stone p-3 z-50 animate-fadeIn space-y-3">
                    {moreDropdownSections.map((sec, sIdx) => (
                      <div key={sIdx}>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted px-2 mb-1">
                          {sec.heading}
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {sec.items.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleAction(item.section, null, item.path)}
                                className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-ivory hover:text-navy transition-colors group"
                              >
                                <div className="p-1.5 rounded-lg bg-brandBlue-light text-royal group-hover:bg-royal group-hover:text-white transition-colors flex-shrink-0">
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-charcoal group-hover:text-navy truncate">
                                    {item.label}
                                  </div>
                                  <div className="text-[10px] text-muted truncate">
                                    {item.desc}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* ============================================================ */}
            {/* AREA 3 — ACTIONS (Desktop xl+): Owner Action & Contact Desk */}
            {/* ============================================================ */}
            <div className="hidden xl:flex items-center justify-end gap-3 flex-shrink-0">
              {isAuthenticated() && (
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/owner/dashboard/add')}
                  className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-xs uppercase tracking-wider font-bold text-white bg-royal hover:bg-navy border border-royal shadow-xs transition-all duration-200 whitespace-nowrap"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-white flex-shrink-0" />
                  <span>Owner: Add Listing</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleAction('contact', null, '/contact')}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-xs uppercase tracking-wider font-bold text-white bg-navy hover:bg-navy-900 border border-navy shadow-xs transition-all duration-200 whitespace-nowrap"
              >
                <PhoneCall className="w-3.5 h-3.5 text-white flex-shrink-0" />
                <span>Contact Desk</span>
              </button>
            </div>

            {/* ============================================================ */}
            {/* TABLET & MOBILE HEADER CONTROLS (Below xl: < 1280px)         */}
            {/* ============================================================ */}
            <div className="flex items-center justify-end gap-2 xl:hidden">
              {/* Add Listing CTA (only visible to authenticated owner) */}
              {isAuthenticated() && (
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('/owner/dashboard/add')}
                  className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-royal border border-royal transition-colors shadow-2xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-white flex-shrink-0" />
                  <span>Add Listing</span>
                </button>
              )}

              {/* Quick Call Desk icon */}
              <a
                href={`tel:${contactInfo.phoneRaw}`}
                className="p-2 rounded-lg text-charcoal hover:text-navy hover:bg-ivory border border-stone transition-colors"
                title="Call Desk"
                aria-label="Call Tomar Enterprises Advisory Desk"
              >
                <Phone className="w-4 h-4 text-navy" />
              </a>

              {/* Hamburger Button Toggle (Toggles mobile drawer) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="p-2.5 rounded-lg text-charcoal hover:text-navy hover:bg-ivory border border-stone focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-navy" /> : <Menu className="w-5 h-5 text-navy" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* FULL-VIEWPORT MOBILE & TABLET DRAWER (Universally Accessible)      */}
      {/* ================================================================== */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[100] flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Slide-Over Panel */}
          <div className="relative w-full max-w-sm sm:max-w-md h-full bg-white shadow-2xl flex flex-col z-10 animate-fadeIn">

            {/* Drawer Top Header */}
            <div className="p-4 sm:p-5 border-b border-stone/70 flex items-center justify-between bg-ivory/50">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleAction('home', null, '/');
                }}
                className="focus:outline-none"
              >
                <BrandLogo variant="dark" size="default" />
              </a>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-charcoal hover:bg-stone/60 hover:text-navy transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5 text-navy" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">

              {/* Saved & Compare Quick Bar (Retained inside mobile menu) */}
              <div className="grid grid-cols-2 gap-2.5 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenFavourites();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-stone bg-ivory/60 hover:bg-ivory hover:border-brandRed/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Heart className={`w-4 h-4 ${favCount > 0 ? 'text-brandRed fill-brandRed' : 'text-charcoal'}`} />
                    <span className="text-xs font-bold text-navy">Saved</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-brandRed text-white text-[10px] font-bold">
                    {favCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCompare();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-stone bg-ivory/60 hover:bg-ivory hover:border-royal/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Scale className={`w-4 h-4 ${compareCount > 0 ? 'text-royal' : 'text-charcoal'}`} />
                    <span className="text-xs font-bold text-navy">Compare</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-royal text-white text-[10px] font-bold">
                    {compareCount}
                  </span>
                </button>
              </div>

              {/* Direct Primary Links */}
              <div className="space-y-1 border-b border-stone/50 pb-3">
                <button
                  type="button"
                  onClick={() => handleAction('home', null, '/')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-sm text-charcoal hover:bg-ivory hover:text-navy transition-colors text-left"
                >
                  <span>Home</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-dark" />
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('listings', { transactionType: 'buy', category: 'all' }, '/buy')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-sm text-charcoal hover:bg-ivory hover:text-navy transition-colors text-left"
                >
                  <span>Buy Properties (New & Resale)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-dark" />
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('listings', { transactionType: 'rent', category: 'all' }, '/rent')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-sm text-charcoal hover:bg-ivory hover:text-navy transition-colors text-left"
                >
                  <span>Rental Properties</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-dark" />
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('listings', { transactionType: 'commercial', category: 'all' }, '/commercial')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-sm text-charcoal hover:bg-ivory hover:text-navy transition-colors text-left"
                >
                  <span>Commercial Shops & Offices</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-dark" />
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('listings', { transactionType: 'plots-land', category: 'all' }, '/plots')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-sm text-charcoal hover:bg-ivory hover:text-navy transition-colors text-left"
                >
                  <span>Plots & Land (NA & Sanctioned)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-dark" />
                </button>
              </div>

              {/* Accordion 1: All Property Categories */}
              <div className="border-b border-stone/50 pb-3">
                <button
                  type="button"
                  onClick={() =>
                    setMobileExpandedSection(mobileExpandedSection === 'categories' ? null : 'categories')
                  }
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-sm text-charcoal hover:bg-ivory transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-royal" />
                    <span>All Property Portfolios</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted transition-transform duration-200 ${mobileExpandedSection === 'categories' ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {mobileExpandedSection === 'categories' && (
                  <div className="mt-1 space-y-1 pl-4 animate-fadeIn">
                    {propertiesDropdownItems.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAction('listings', item.filter, item.path)}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-charcoal hover:bg-ivory hover:text-navy text-left"
                      >
                        <span>{item.label}</span>
                        <span className="text-[10px] text-muted">View &rarr;</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 2: 7 Station Corridor */}
              <div className="border-b border-stone/50 pb-3">
                <button
                  type="button"
                  onClick={() =>
                    setMobileExpandedSection(mobileExpandedSection === 'stations' ? null : 'stations')
                  }
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-sm text-charcoal hover:bg-ivory transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Train className="w-4 h-4 text-royal" />
                    <span>7 Station Corridor (Vasai to Palghar)</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted transition-transform duration-200 ${mobileExpandedSection === 'stations' ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {mobileExpandedSection === 'stations' && (
                  <div className="mt-1 space-y-1 pl-4 animate-fadeIn">
                    {locationsDropdownItems.map((st, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAction(null, null, st.path)}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-charcoal hover:bg-ivory hover:text-navy text-left"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-royal" />
                          {st.label}
                        </span>
                        <span className="text-[10px] text-muted">Explore &rarr;</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 3: Real Estate Tools */}
              <div className="border-b border-stone/50 pb-3">
                <button
                  type="button"
                  onClick={() =>
                    setMobileExpandedSection(mobileExpandedSection === 'tools' ? null : 'tools')
                  }
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-sm text-charcoal hover:bg-ivory transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-royal" />
                    <span>Real Estate Tools</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted transition-transform duration-200 ${mobileExpandedSection === 'tools' ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {mobileExpandedSection === 'tools' && (
                  <div className="mt-1 space-y-1 pl-4 animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => handleAction('tools', null, '/tools/emi-calculator')}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-charcoal hover:bg-ivory hover:text-navy text-left"
                    >
                      <span>EMI Mortgage Calculator</span>
                      <span className="text-[10px] text-muted">Loan estimator</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('tools', null, '/tools/plot-area-converter')}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-charcoal hover:bg-ivory hover:text-navy text-left"
                    >
                      <span>Plot Area Unit Converter</span>
                      <span className="text-[10px] text-muted">Guntha / Acre / Sq.Ft</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Accordion 4: Projects & Redevelopment */}
              <div className="border-b border-stone/50 pb-3">
                <button
                  type="button"
                  onClick={() =>
                    setMobileExpandedSection(mobileExpandedSection === 'projects' ? null : 'projects')
                  }
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-sm text-charcoal hover:bg-ivory transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-royal" />
                    <span>Projects & Redevelopment</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted transition-transform duration-200 ${mobileExpandedSection === 'projects' ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {mobileExpandedSection === 'projects' && (
                  <div className="mt-1 space-y-1 pl-4 animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => handleAction('development', null, '/projects/new-developments')}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-charcoal hover:bg-ivory hover:text-navy text-left"
                    >
                      <span>New Developments & Launches</span>
                      <span className="text-[10px] text-muted">View details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('development', null, '/projects/redevelopment')}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-charcoal hover:bg-ivory hover:text-navy text-left"
                    >
                      <span>Housing Society Redevelopment</span>
                      <span className="text-[10px] text-muted">Feasibility advisory</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Company Information Links */}
              <div className="space-y-1 pt-1">
                <button
                  type="button"
                  onClick={() => handleAction('why-us')}
                  className="w-full p-2 rounded-lg text-xs font-semibold text-muted hover:text-navy hover:bg-ivory text-left"
                >
                  Why Choose Tomar Enterprises
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('faqs')}
                  className="w-full p-2 rounded-lg text-xs font-semibold text-muted hover:text-navy hover:bg-ivory text-left"
                >
                  Frequently Asked Questions (FAQ)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigate) onNavigate('/owner-login');
                  }}
                  className="w-full p-2.5 rounded-xl text-xs font-semibold text-royal hover:text-brandBlue bg-navy/5 hover:bg-navy/10 flex items-center justify-between text-left transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-royal" />
                    <span className="font-bold text-navy">Owner Portal (Tomar Admin)</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-royal bg-royal/10 px-2 py-0.5 rounded">Login</span>
                </button>
              </div>

            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-4 border-t border-stone/70 bg-ivory/60 space-y-2.5">
              {isAuthenticated() ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigate) onNavigate('/owner/dashboard/add');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider font-bold text-white bg-royal hover:bg-navy transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>Owner: Add Listing</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigate) onNavigate('/contact');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider font-bold text-white bg-navy hover:bg-navy-900 transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <PhoneCall className="w-4 h-4 text-brandRed" />
                  <span>Contact Advisory Desk</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${contactInfo.phoneRaw}`}
                  className="py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider font-bold text-white bg-navy hover:bg-navy-900 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-brandRed" />
                  <span>Call Desk</span>
                </a>

                <a
                  href={contactInfo.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
