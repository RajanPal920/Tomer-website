import React, { useState, useMemo, useEffect } from 'react';
import TopBar from './components/TopBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SearchPanel from './components/SearchPanel';
import RegionalPropertySearch from './components/RegionalPropertySearch';
import CategoryExplorer from './components/CategoryExplorer';
import FeaturedListings from './components/FeaturedListings';
import DevelopmentSection from './components/DevelopmentSection';
import ResidentialVsCommercial from './components/ResidentialVsCommercial';
import LocalityExplorer from './components/LocalityExplorer';
import WhyChooseUs from './components/WhyChooseUs';
import PropertyOwnerCTA from './components/PropertyOwnerCTA';
import ContactSection from './components/ContactSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';

// Dynamic Sub-Pages
import ListingPageView from './components/ListingPageView';
import PropertyDetailPage from './components/PropertyDetailPage';
import LocationPageView from './components/LocationPageView';
import RealEstateToolsSection from './components/tools/RealEstateToolsSection';
import ProjectsPageView from './components/ProjectsPageView';
import NotFoundPage from './components/NotFoundPage';
import VideoWalkthroughSection from './components/VideoWalkthroughSection';
import OwnerLoginPage from './components/owner/OwnerLoginPage';
import OwnerDashboard from './components/owner/OwnerDashboard';
import ContactPageView from './components/ContactPageView';
import FloatingContactButtons from './components/FloatingContactButtons';

// Modals
import PropertyDetailModal from './components/PropertyDetailModal';
import EnquiryModal from './components/EnquiryModal';
import PropertyComparisonModal from './components/PropertyComparisonModal';
import FavouritesModal from './components/FavouritesModal';

// Router & State Engine
import { useRouter } from './services/router';
import { sampleProperties } from './data/properties';
import { fetchLiveProperties, subscribeToProperties } from './services/propertyStore';
import { isAuthenticated, getCurrentUser } from './services/authService';
import {
  filterProperties,
  getFiltersFromUrl,
  syncFiltersToUrl,
  DEFAULT_FILTERS,
  CATEGORY_TABS,
  normalizeTabId,
} from './services/propertySearch';
import { getLocalityDisplayName } from './data/localities';

export default function App() {
  const { route, goTo } = useRouter();

  // Modals state
  const [selectedPropertyForModal, setSelectedPropertyForModal] = useState(null);
  const [enquiryModalData, setEnquiryModalData] = useState(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [favouritesModalOpen, setFavouritesModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [allProperties, setAllProperties] = useState(() => sampleProperties);

  // Subscribe to live property store updates (ensures owner-added listings appear automatically)
  useEffect(() => {
    const unsubscribe = subscribeToProperties((liveProps) => {
      if (Array.isArray(liveProps) && liveProps.length > 0) {
        setAllProperties(liveProps);
      }
    });

    fetchLiveProperties().catch((err) => {
      console.warn('Initial live properties fetch failed, using curated catalog:', err);
    });

    return () => unsubscribe();
  }, []);

  // Centralized State-Driven Property Discovery Engine (for Homepage)
  const [activeFilters, setActiveFilters] = useState(() => getFiltersFromUrl());

  // Keep browser URL search parameters synchronized with active state if on home or listings
  useEffect(() => {
    if (route.view === 'home') {
      syncFiltersToUrl(activeFilters);
    }
  }, [activeFilters, route.view]);

  // Handle direct action routes (saved-properties, compare, list-your-property)
  useEffect(() => {
    if (route.view === 'saved-properties') {
      setFavouritesModalOpen(true);
    } else if (route.view === 'compare') {
      setCompareModalOpen(true);
    } else if (route.view === 'list-your-property' || route.view === 'list-property') {
      if (isAuthenticated()) {
        goTo('/owner/dashboard/add');
      } else {
        goTo('/owner-login');
      }
    }
  }, [route.view, goTo]);

  // Execute pure, deterministic AND-filter engine across the dataset
  const filteredProperties = useMemo(() => {
    return filterProperties(allProperties, activeFilters);
  }, [allProperties, activeFilters]);

  // Smooth scroll utility taking sticky header height into account
  const scrollToListings = () => {
    const listingsElement = document.getElementById('listings');
    if (listingsElement) {
      listingsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Primary search handler used on homepage
  const handleApplyFilters = (newCriteria, shouldScroll = true) => {
    setActiveFilters((prev) => {
      const merged = { ...prev, ...newCriteria };
      if (newCriteria.transactionType && !newCriteria.categoryTab) {
        merged.categoryTab = newCriteria.transactionType;
      }
      if (newCriteria.categoryTab && !newCriteria.transactionType) {
        merged.transactionType = newCriteria.categoryTab;
      }
      const norm = normalizeTabId(merged.categoryTab || merged.transactionType);
      if (norm === 'plots-land' || norm === 'commercial' || norm === 'lease-heavy-deposit') {
        merged.bedrooms = 'all';
      }
      return merged;
    });

    if (route.view !== 'home') {
      goTo('/');
    }

    if (shouldScroll) {
      setTimeout(() => {
        scrollToListings();
      }, 50);
    }
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setActiveFilters({ ...DEFAULT_FILTERS });
    scrollToListings();
  };

  // Category card click handler
  const handleCategorySelect = (cat) => {
    if (cat.isDevelopment || cat.id === 'new-development-projects' || cat.id === 'redevelopment-opportunities') {
      if (route.view !== 'home') {
        goTo('/');
        setTimeout(() => {
          const devEl = document.getElementById('development');
          if (devEl) devEl.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const devEl = document.getElementById('development');
        if (devEl) devEl.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    handleApplyFilters({
      transactionType: cat.transactionType || 'all',
      categoryTab: cat.transactionType || 'all',
      category: cat.category || 'all',
      locality: 'all',
      minBudget: null,
      maxBudget: null,
      bedrooms: 'all',
      searchQuery: '',
    });
  };

  // Locality selection handler (from corridor pills, explorer cards, or footer)
  const handleLocalitySelect = (localityId) => {
    const normalizedLoc = (localityId || '').toLowerCase().trim();
    goTo(`/locations/${normalizedLoc}`);
  };

  // Residential vs Commercial cards
  const handleResVsCommSelect = (mode) => {
    if (mode === 'Residential') {
      goTo('/buy');
    } else {
      goTo('/commercial');
    }
  };

  // Human-readable summary of active filter criteria for UI badge
  const activeFilterSummary = useMemo(() => {
    const parts = [];

    const normTab = normalizeTabId(activeFilters.categoryTab || activeFilters.transactionType || 'all');
    if (normTab && normTab !== 'all') {
      const tabObj = CATEGORY_TABS.find((t) => t.id === normTab);
      parts.push(`Tab: ${tabObj ? tabObj.label : normTab.toUpperCase()}`);
    }

    if (activeFilters.locality && activeFilters.locality !== 'all') {
      parts.push(`Locality: ${getLocalityDisplayName(activeFilters.locality)}`);
    }

    if (activeFilters.category && activeFilters.category !== 'all') {
      const cleanCat = activeFilters.category.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      parts.push(`Category: ${cleanCat}`);
    }

    if (activeFilters.maxBudget && Number(activeFilters.maxBudget) > 0) {
      const maxVal = Number(activeFilters.maxBudget);
      const formattedMax =
        maxVal >= 10000000
          ? `₹${(maxVal / 10000000).toFixed(1)} Cr`
          : `₹${(maxVal / 100000).toFixed(0)} Lakh`;
      parts.push(`Budget ≤ ${formattedMax}`);
    }

    if (activeFilters.bedrooms && activeFilters.bedrooms !== 'all') {
      parts.push(`${activeFilters.bedrooms} BHK`);
    }

    return parts.length > 0 ? parts.join(' • ') : null;
  }, [activeFilters]);

  // Dedicated Owner Portal Auth and Protected Management Views
  if (route.view === 'owner-login') {
    return (
      <OwnerLoginPage
        onNavigate={goTo}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          goTo('/owner/dashboard');
        }}
      />
    );
  }

  if (route.view === 'owner-dashboard') {
    if (!isAuthenticated()) {
      // Enforce Owner Authentication: Public visitors cannot access dashboard
      setTimeout(() => goTo('/owner-login'), 0);
      return (
        <div className="min-h-screen bg-navy-950 flex items-center justify-center text-white">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-brandRed border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-stone text-sm">Verifying Owner Authorization...</p>
          </div>
        </div>
      );
    }

    return (
      <OwnerDashboard
        onNavigate={goTo}
        user={currentUser || getCurrentUser()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col font-sans selection:bg-brandRed/20 selection:text-navy">
      {/* SECTION A — Premium Top Bar */}
      <TopBar
        onOpenFavourites={() => setFavouritesModalOpen(true)}
        onOpenCompare={() => setCompareModalOpen(true)}
        onNavigate={goTo}
      />

      {/* SECTION B — Main Navigation with 7-Station Dropdown & Tools */}
      <Navbar
        onSelectCategory={(filterData) => {
          handleApplyFilters(filterData);
        }}
        onNavigateSection={(sectionId) => {
          if (route.view !== 'home') {
            goTo('/');
            setTimeout(() => {
              const el = document.getElementById(sectionId);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onNavigate={goTo}
      />

      {/* MAIN VIEW ROUTING */}
      <main className="flex-grow">
        {route.view === 'home' && (
          <>
            {/* SECTION C — Premium Hero Showcase (Six-Slide Carousel with daylight balance) */}
            <Hero
              onExploreClick={() => {
                scrollToListings();
              }}
              onTalkToExpertClick={() => {
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onSlideAction={(filterParams) => {
                handleApplyFilters(filterParams, true);
              }}
              onDevelopmentClick={() => {
                const el = document.getElementById('development');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* SECTION D — Interactive Property Search Panel (Multi-Parameter AND Filter Engine) */}
            <SearchPanel
              onSearch={(filters) => handleApplyFilters(filters, true)}
              activeFilters={activeFilters}
              onReset={handleResetFilters}
            />

            {/* Corridor Discovery: "Your Property Search, From Vasai to Palghar" (7 canonical station pills) */}
            <RegionalPropertySearch
              onQuickSearch={(params) => handleApplyFilters(params, true)}
              onSelectLocality={handleLocalitySelect}
            />

            {/* SECTION E — Property Category Explorer (11 Curated Portfolios) */}
            <CategoryExplorer onSelectCategory={handleCategorySelect} />

            {/* SECTION F — Featured Property Listings (State-Driven Discovery & Empty States) */}
            <FeaturedListings
              properties={filteredProperties}
              totalCount={filteredProperties.length}
              activeFilters={activeFilters}
              onFilterChange={(filterChange) => handleApplyFilters(filterChange, false)}
              onResetFilters={handleResetFilters}
              onViewDetails={(prop) => goTo(`/properties/${prop.slug || prop.id}`)}
              onEnquire={(prop) => setEnquiryModalData(prop)}
              onNavigate={goTo}
              searchQueryInfo={activeFilterSummary}
            />

            {/* Client Video Walkthrough Tour (Sample Luxury Flat Walkthrough) */}
            <VideoWalkthroughSection
              onEnquire={(data) => setEnquiryModalData(data)}
            />

            {/* SECTION G — Real Estate Calculation Tools (EMI & Plot Area Converter) */}
            <RealEstateToolsSection />

            {/* SECTION H — New Development & Society Redevelopment */}
            <DevelopmentSection
              onOpenEnquiryModal={(data) => setEnquiryModalData(data)}
            />

            {/* SECTION I — Residential vs Commercial Discovery */}
            <ResidentialVsCommercial onSelectPanel={handleResVsCommSelect} />

            {/* SECTION J — Location-Based Property Discovery (7 stations: Vasai Road to Palghar) */}
            <LocalityExplorer
              onSelectLocality={handleLocalitySelect}
              onNavigate={goTo}
            />

            {/* SECTION K — Why Choose Tomar Enterprises */}
            <WhyChooseUs />

            {/* SECTION L — Property Owner / Landlord Advisory */}
            <PropertyOwnerCTA onNavigate={goTo} />

            {/* SECTION M — Customer Enquiry & Advisory Contact Desk */}
            <ContactSection />

            {/* SECTION N — FAQ Section */}
            <FaqSection />
          </>
        )}

        {/* DEDICATED LISTINGS VIEW (/properties, /buy, /rent, /commercial, /plots, /lease) */}
        {route.view === 'listings' && (
          <ListingPageView
            initialTab={route.tab || 'all'}
            pageTitle={route.title || 'Property Opportunities'}
            onNavigate={goTo}
            onEnquire={(prop) => setEnquiryModalData(prop)}
          />
        )}

        {/* DEDICATED PROPERTY DETAIL VIEW (/property/:slug) */}
        {route.view === 'property-detail' && (
          <PropertyDetailPage
            slug={route.slug}
            onNavigate={goTo}
            onEnquire={(prop) => setEnquiryModalData(prop)}
          />
        )}

        {/* DEDICATED LOCATION LANDING VIEW (/locations/:slug) */}
        {route.view === 'location' && (
          <LocationPageView
            slug={route.slug}
            onNavigate={goTo}
            onEnquire={(prop) => setEnquiryModalData(prop)}
          />
        )}

        {/* DEDICATED REAL ESTATE TOOLS VIEW (/tools, /tools/emi-calculator, /tools/area-converter) */}
        {route.view === 'tools' && (
          <div className="py-8 bg-ivory">
            <RealEstateToolsSection defaultTab={route.tool === 'converter' ? 'converter' : 'emi'} />
          </div>
        )}

        {/* DEDICATED PROJECTS VIEW (/projects, /projects/new-developments, /projects/redevelopment) */}
        {route.view === 'projects' && (
          <ProjectsPageView
            subView={route.subView}
            onNavigate={goTo}
            onEnquire={(prop) => setEnquiryModalData(prop)}
          />
        )}

        {/* DEDICATED CONTACT DESK VIEW (/contact) */}
        {route.view === 'contact' && (
          <ContactPageView onNavigate={goTo} />
        )}

        {/* DEDICATED 404 NOT FOUND VIEW */}
        {route.view === 'not-found' && (
          <NotFoundPage
            path={route.path}
            onNavigate={goTo}
          />
        )}
      </main>

      {/* SECTION O — Premium Footer */}
      <Footer
        onSelectCategory={(filter) => {
          handleApplyFilters(filter, true);
        }}
        onSelectLocality={handleLocalitySelect}
        onNavigate={goTo}
      />

      {/* Interactive Modals */}
      {selectedPropertyForModal && (
        <PropertyDetailModal
          property={selectedPropertyForModal}
          onClose={() => setSelectedPropertyForModal(null)}
          onEnquire={(prop) => setEnquiryModalData(prop)}
        />
      )}

      {enquiryModalData && (
        <EnquiryModal
          initialData={enquiryModalData}
          onClose={() => setEnquiryModalData(null)}
        />
      )}

      {compareModalOpen && (
        <PropertyComparisonModal
          onClose={() => setCompareModalOpen(false)}
          onViewDetails={(prop) => goTo(`/properties/${prop.slug || prop.id}`)}
          onEnquire={(prop) => setEnquiryModalData(prop)}
        />
      )}

      {favouritesModalOpen && (
        <FavouritesModal
          onClose={() => setFavouritesModalOpen(false)}
          onViewDetails={(prop) => goTo(`/properties/${prop.slug || prop.id}`)}
          onEnquire={(prop) => setEnquiryModalData(prop)}
          onNavigate={goTo}
        />
      )}

      {/* Global Fixed Floating Call & WhatsApp Buttons */}
      <FloatingContactButtons />
    </div>
  );
}
