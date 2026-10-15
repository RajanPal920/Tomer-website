import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  ChevronDown,
  PhoneCall,
  Building2,
  Home,
  Landmark,
  Key,
  Layers,
  Sparkles,
  Calculator,
  Train,
  Phone,
  ArrowRight,
  Shield,
  HelpCircle,
  Briefcase,
  Award,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import WhatsAppIcon from './WhatsAppIcon';
import { APPROVED_STATIONS } from '../data/locations';
import { contactInfo } from '../data/contactInfo';

export default function Navbar({
  onSelectCategory,
  onNavigateSection,
  onNavigate,
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'properties' | 'locations' | 'more' | null
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null);

  const dropdownTimerRef = useRef(null);

  // Sticky header transition on window scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation & body scroll lock for mobile drawer & closing dropdowns
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setOpenDropdown(null);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    window.addEventListener('keydown', handleKeyDown);
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
    }, 200);
  };

  const toggleDropdown = (menuName) => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
    }
    setOpenDropdown((prev) => (prev === menuName ? null : menuName));
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

  // Dropdown 1: Properties Submenu
  const propertiesDropdownItems = [
    { label: 'All Properties', filter: { transactionType: 'all', category: 'all' }, path: '/properties', icon: Home, desc: 'Complete portfolio across corridor' },
    { label: 'Buy Properties', filter: { transactionType: 'buy', category: 'all' }, path: '/buy', icon: Building2, desc: 'New launches & registered resale homes' },
    { label: 'New Flats', filter: { transactionType: 'buy', category: 'new-flat' }, path: '/buy', icon: Building2, desc: 'Townships & builder launches' },
    { label: 'Resale Flats', filter: { transactionType: 'buy', category: 'resale-flat' }, path: '/buy', icon: Home, desc: 'Ready-to-move clear title units' },
    { label: 'Rental Properties', filter: { transactionType: 'rent', category: 'flat-rent' }, path: '/rent', icon: Key, desc: 'Verified residential rentals' },
    { label: 'Commercial Spaces', filter: { transactionType: 'commercial', category: 'all' }, path: '/commercial', icon: Landmark, desc: 'High-footfall shops & corporate offices' },
    { label: 'Plots & Land', filter: { transactionType: 'plots-land', category: 'all' }, path: '/plots', icon: Layers, desc: 'Collector NA, residential & industrial land' },
    { label: 'Lease & Heavy Deposit', filter: { transactionType: 'lease', category: 'all' }, path: '/lease', icon: Key, desc: 'Zero monthly rent 3-year term opportunities' },
  ];

  // Dropdown 2: Locations Submenu (Vasai to Palghar Corridor — 7 Approved Stations)
  const locationsDropdownItems = APPROVED_STATIONS.map((st) => ({
    label: st.displayName,
    path: `/locations/${st.slug}`,
    locationId: st.locationId,
    desc: st.description,
  }));

  // Dropdown 3: More Submenu (Utilities, Projects & Guidance)
  const moreDropdownSections = [
    {
      heading: 'Real Estate Utilities',
      items: [
        { label: 'EMI Mortgage Calculator', path: '/tools/emi-calculator', icon: Calculator, desc: 'Estimate monthly mortgage installments' },
        { label: 'Plot Area Converter', path: '/tools/plot-area-converter', icon: Landmark, desc: 'Convert Guntha, Acre, Sq.Ft & Sq.Mtr' },
      ],
    },
    {
      heading: 'Projects & Advisory',
      items: [
        { label: 'New Developments', path: '/projects/new-developments', section: 'development', icon: Sparkles, desc: 'Township master plans & builder launches' },
        { label: 'Housing Society Redevelopment', path: '/projects/redevelopment', section: 'development', icon: Building2, desc: 'Feasibility studies & committee advisory' },
        { label: 'Lease & Heavy Deposit', path: '/lease', icon: Key, desc: 'Zero rent deposit alternatives' },
        { label: 'Commercial Spaces', path: '/commercial', icon: Briefcase, desc: 'Shops, showrooms & offices' },
      ],
    },
    {
      heading: 'Agency & Support',
      items: [
        { label: 'Why Choose Tomar Enterprises', path: null, section: 'why-us', icon: Shield, desc: 'Corridor understanding & verified advisory' },
        {
          label: 'Nidhi Pramanpatra',
          path: null,
          onClick: () => window.open('/certificate/nidhi-pramanpatra.pdf', '_blank'),
          icon: Award,
          desc: 'Official registration certificate (PDF)',
        },
        { label: 'Frequently Asked Questions', path: null, section: 'faqs', icon: HelpCircle, desc: 'Guidance on buying, plotting & leases' },
        { label: 'Contact Advisory Desk', path: '/contact', icon: PhoneCall, desc: 'Reach Sanjay Tomar & advisory team' },
      ],
    },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-white/98 backdrop-blur-md shadow-md border-b border-stone/80'
            : 'bg-white border-b border-stone/60'
        }`}
      >
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* ========================================================================= */}
          {/* 3-AREA BALANCED LAYOUT: Left (Logo), Center (Nav Links), Right (Actions)  */}
          {/* Uses flex-shrink-0 for Left/Right to guarantee ZERO overlap with Center   */}
          {/* ========================================================================= */}
          <div className="flex items-center justify-between w-full min-h-[76px] sm:min-h-[82px] lg:min-h-[88px] py-2 sm:py-2.5">
            {/* ----------------------------------------------------------------- */}
            {/* SECTION 1: LEFT — BRAND LOGO (Dedicated space, center aligned)    */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex-shrink-0 flex items-center pr-3 sm:pr-4 xl:pr-6 z-10">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleAction('home', null, '/');
                }}
                className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-royal rounded-xl transition-transform hover:opacity-95"
                aria-label="Tomar Enterprises Home"
              >
                <BrandLogo variant="default" size="large" />
              </a>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 2: CENTER — NAVIGATION (Clean spacing, 8 primary links)   */}
            {/* On >=1240px (xl): All 8 links. On 1024-1239px (lg): Compact 6.  */}
            {/* ----------------------------------------------------------------- */}
            <nav
              className="hidden lg:flex items-center justify-center gap-1 xl:gap-1.5 2xl:gap-2.5 flex-1 mx-1 xl:mx-2 min-w-0"
              data-dropdown-container
              aria-label="Main Navigation"
            >
              {/* 1. Home */}
              <button
                type="button"
                onClick={() => handleAction('home', null, '/')}
                className="px-2.5 xl:px-3 py-2 rounded-xl text-[13.5px] xl:text-[14px] 2xl:text-[14.5px] font-bold text-navy hover:text-brandRed hover:bg-ivory/80 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-royal"
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
                  onClick={() => toggleDropdown('properties')}
                  className={`flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-xl text-[13.5px] xl:text-[14px] 2xl:text-[14.5px] font-bold transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-royal ${
                    openDropdown === 'properties'
                      ? 'text-brandRed bg-ivory'
                      : 'text-navy hover:text-brandRed hover:bg-ivory/80'
                  }`}
                  aria-expanded={openDropdown === 'properties'}
                  aria-haspopup="true"
                >
                  <span>Properties</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openDropdown === 'properties' ? 'rotate-180 text-brandRed' : 'text-muted'
                    }`}
                  />
                </button>

                {openDropdown === 'properties' && (
                  <div className="absolute left-0 mt-1 w-80 bg-white rounded-2xl shadow-elevated border border-stone p-2.5 z-50 animate-fadeIn">
                    <div className="px-3 py-1.5 border-b border-stone/50 mb-1 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                        All Portfolios
                      </span>
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
                            className="flex items-center gap-3 p-2 rounded-xl text-left hover:bg-brandBlue-light hover:text-navy transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-royal"
                          >
                            <div className="p-1.5 rounded-lg bg-brandBlue-light text-royal group-hover:bg-royal group-hover:text-white transition-colors flex-shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-charcoal group-hover:text-navy truncate">
                                {item.label}
                              </div>
                              <div className="text-[11px] text-muted truncate">{item.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Buy (Visible on standard desktop xl: 1240px+) */}
              <button
                type="button"
                onClick={() =>
                  handleAction('listings', { transactionType: 'buy', category: 'all' }, '/buy')
                }
                className="hidden xl:inline-flex px-2.5 xl:px-3 py-2 rounded-xl text-[13.5px] xl:text-[14px] 2xl:text-[14.5px] font-bold text-navy hover:text-brandRed hover:bg-ivory/80 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-royal"
              >
                Buy
              </button>

              {/* 4. Rent (Visible on standard desktop xl: 1240px+) */}
              <button
                type="button"
                onClick={() =>
                  handleAction('listings', { transactionType: 'rent', category: 'all' }, '/rent')
                }
                className="hidden xl:inline-flex px-2.5 xl:px-3 py-2 rounded-xl text-[13.5px] xl:text-[14px] 2xl:text-[14.5px] font-bold text-navy hover:text-brandRed hover:bg-ivory/80 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-royal"
              >
                Rent
              </button>

              {/* 5. Commercial */}
              <button
                type="button"
                onClick={() =>
                  handleAction('listings', { transactionType: 'commercial', category: 'all' }, '/commercial')
                }
                className="px-2.5 xl:px-3 py-2 rounded-xl text-[13.5px] xl:text-[14px] 2xl:text-[14.5px] font-bold text-navy hover:text-brandRed hover:bg-ivory/80 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-royal"
              >
                Commercial
              </button>

              {/* 6. Plots & Land (Priority Corridor Specialty) */}
              <button
                type="button"
                onClick={() =>
                  handleAction('listings', { transactionType: 'plots-land', category: 'all' }, '/plots')
                }
                className="px-2.5 xl:px-3 py-2 rounded-xl text-[13.5px] xl:text-[14px] 2xl:text-[14.5px] font-bold text-navy hover:text-brandRed hover:bg-ivory/80 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-royal"
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
                  onClick={() => toggleDropdown('locations')}
                  className={`flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-xl text-[13.5px] xl:text-[14px] 2xl:text-[14.5px] font-bold transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-royal ${
                    openDropdown === 'locations'
                      ? 'text-brandRed bg-ivory'
                      : 'text-navy hover:text-brandRed hover:bg-ivory/80'
                  }`}
                  aria-expanded={openDropdown === 'locations'}
                  aria-haspopup="true"
                >
                  <span>Locations</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openDropdown === 'locations' ? 'rotate-180 text-brandRed' : 'text-muted'
                    }`}
                  />
                </button>

                {openDropdown === 'locations' && (
                  <div className="absolute left-0 mt-1 w-80 bg-white rounded-2xl shadow-elevated border border-stone p-2.5 z-50 animate-fadeIn">
                    <div className="px-3 py-1.5 border-b border-stone/50 mb-1 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                        Railway Corridor
                      </span>
                      <span className="text-[10px] text-royal font-bold">Western Line</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1 max-h-[420px] overflow-y-auto">
                      {locationsDropdownItems.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAction(null, null, item.path)}
                          className="flex items-center justify-between p-2 rounded-xl text-left hover:bg-brandBlue-light hover:text-navy transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-royal"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Train className="w-3.5 h-3.5 text-royal flex-shrink-0 group-hover:text-brandRed transition-colors" />
                            <span className="text-xs font-bold text-charcoal group-hover:text-navy truncate">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted group-hover:text-royal font-medium flex-shrink-0 ml-1">
                            &rarr;
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 8. More Dropdown (Secondary Links, Utilities, Advisory) */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('more')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => toggleDropdown('more')}
                  className={`flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-xl text-[13.5px] xl:text-[14px] 2xl:text-[14.5px] font-bold transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-royal ${
                    openDropdown === 'more'
                      ? 'text-brandRed bg-ivory'
                      : 'text-navy hover:text-brandRed hover:bg-ivory/80'
                  }`}
                  aria-expanded={openDropdown === 'more'}
                  aria-haspopup="true"
                >
                  <span>More</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openDropdown === 'more' ? 'rotate-180 text-brandRed' : 'text-muted'
                    }`}
                  />
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
                                onClick={() => {
                                  if (item.onClick) {
                                    item.onClick();
                                  } else {
                                    handleAction(item.section, null, item.path);
                                  }
                                }}
                                className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-ivory hover:text-navy transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-royal"
                              >
                                <div className="p-1.5 rounded-lg bg-brandBlue-light text-royal group-hover:bg-royal group-hover:text-white transition-colors flex-shrink-0">
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-charcoal group-hover:text-navy truncate">
                                    {item.label}
                                  </div>
                                  <div className="text-[10px] text-muted truncate">{item.desc}</div>
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

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 3: RIGHT — ACTIONS (List Property & Contact Desk)         */}
            {/* List Property is ONLY shown to authenticated owners/admins.       */}
            {/* ----------------------------------------------------------------- */}
            <div className="hidden lg:flex items-center justify-end gap-2.5 flex-shrink-0 pl-3 xl:pl-5 z-10">
              <button
                type="button"
                onClick={() => handleAction('contact', null, '/contact')}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-4 xl:px-4.5 rounded-xl text-xs uppercase tracking-wider font-bold text-white bg-navy hover:bg-navy-900 border border-navy shadow-xs transition-all duration-200 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-royal cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-brandRed flex-shrink-0" />
                <span>Contact Desk</span>
              </button>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* TABLET & MOBILE HEADER CONTROLS (Below lg: < 1024px)              */}
            {/* Keeps Contact Desk accessible on tablet, with clean hamburger     */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex items-center justify-end gap-2 lg:hidden flex-shrink-0 z-10">
              {/* Tablet Contact Desk shortcut */}
              <button
                type="button"
                onClick={() => handleAction('contact', null, '/contact')}
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-navy border border-navy transition-colors shadow-2xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-brandRed flex-shrink-0" />
                <span>Contact Desk</span>
              </button>

              {/* Quick Call Desk icon */}
              <a
                href={`tel:${contactInfo.phoneRaw}`}
                className="p-2 sm:p-2.5 rounded-lg text-charcoal hover:text-navy hover:bg-ivory border border-stone transition-colors"
                title="Call Advisory Desk"
                aria-label="Call Tomar Enterprises Advisory Desk"
              >
                <Phone className="w-4 h-4 text-navy" />
              </a>

              {/* Hamburger Button Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="p-2 sm:p-2.5 rounded-lg text-charcoal hover:text-navy hover:bg-ivory border border-stone focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-navy" /> : <Menu className="w-5 h-5 text-navy" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* FULL-VIEWPORT MOBILE & TABLET DRAWER (Universally Accessible)             */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[100] flex justify-end overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Slide-Over Panel (Zero horizontal overflow) */}
          <div className="relative w-full max-w-sm sm:max-w-md h-full bg-white shadow-2xl flex flex-col z-10 animate-fadeIn overflow-hidden">
            {/* Drawer Top Header */}
            <div className="p-4 sm:p-5 border-b border-stone/70 flex items-center justify-between bg-ivory/50 flex-shrink-0">
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 overscroll-contain">
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
                  onClick={() =>
                    handleAction('listings', { transactionType: 'buy', category: 'all' }, '/buy')
                  }
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-sm text-charcoal hover:bg-ivory hover:text-navy transition-colors text-left"
                >
                  <span>Buy Properties (New & Resale)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-dark" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleAction('listings', { transactionType: 'rent', category: 'all' }, '/rent')
                  }
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-sm text-charcoal hover:bg-ivory hover:text-navy transition-colors text-left"
                >
                  <span>Rental Properties</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-dark" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleAction('listings', { transactionType: 'commercial', category: 'all' }, '/commercial')
                  }
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-sm text-charcoal hover:bg-ivory hover:text-navy transition-colors text-left"
                >
                  <span>Commercial Shops & Offices</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-dark" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleAction('listings', { transactionType: 'plots-land', category: 'all' }, '/plots')
                  }
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
                    className={`w-4 h-4 text-muted transition-transform duration-200 ${
                      mobileExpandedSection === 'categories' ? 'rotate-180' : ''
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
                        <span className="text-[10px] text-muted">{item.desc}</span>
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
                    setMobileExpandedSection(mobileExpandedSection === 'locations' ? null : 'locations')
                  }
                  className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-sm text-charcoal hover:bg-ivory transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Train className="w-4 h-4 text-royal" />
                    <span>Railway Station Corridor</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted transition-transform duration-200 ${
                      mobileExpandedSection === 'locations' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {mobileExpandedSection === 'locations' && (
                  <div className="mt-1 space-y-1 pl-4 animate-fadeIn">
                    {locationsDropdownItems.map((st, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAction(null, null, st.path)}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-charcoal hover:bg-ivory hover:text-navy text-left"
                      >
                        <span>{st.label}</span>
                        <span className="text-[10px] text-royal font-medium">Explore &rarr;</span>
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
                    <span>Calculators & Utilities</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted transition-transform duration-200 ${
                      mobileExpandedSection === 'tools' ? 'rotate-180' : ''
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
                    className={`w-4 h-4 text-muted transition-transform duration-200 ${
                      mobileExpandedSection === 'projects' ? 'rotate-180' : ''
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
                      <span className="text-[10px] text-muted">Township master plans</span>
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

              {/* Company Information & Owner Portal */}
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
                  <span className="text-[10px] uppercase font-bold text-royal bg-royal/10 px-2 py-0.5 rounded">
                    Login
                  </span>
                </button>
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-4 border-t border-stone/70 bg-ivory/60 space-y-2 flex-shrink-0">
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
