import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Phone,
  ArrowRight,
  Building,
  ExternalLink,
  Compass,
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { getSeoLandingPageBySlug } from '../data/seoLandingPages';
import { getAllProperties } from '../data/properties';
import { fetchLiveProperties, subscribeToProperties } from '../services/propertyStore';
import { filterProperties } from '../services/propertySearch';
import { contactInfo } from '../data/contactInfo';
import { updateSeoMetadata, buildBreadcrumbSchema, buildFaqSchema, buildRealEstateAgentSchema, SITE_BASE_URL } from '../services/seo';
import PropertyCard from './PropertyCard';

export default function SeoLandingPageView({ slug, onNavigate, onEnquire }) {
  const pageData = getSeoLandingPageBySlug(slug);

  const [allProps, setAllProps] = useState(() => getAllProperties());
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    fetchLiveProperties().catch(() => {});
    return subscribeToProperties((liveProps) => {
      if (Array.isArray(liveProps) && liveProps.length > 0) {
        setAllProps(liveProps);
      }
    });
  }, []);

  // Update SEO Head Tags dynamically
  useEffect(() => {
    if (!pageData) return;

    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: pageData.h1, url: `/${pageData.slug}` },
    ];

    const graph = [
      buildRealEstateAgentSchema(),
      buildBreadcrumbSchema(breadcrumbs),
    ];

    if (pageData.faqs && pageData.faqs.length > 0) {
      const faqSchema = buildFaqSchema(pageData.faqs);
      if (faqSchema) graph.push(faqSchema);
    }

    updateSeoMetadata({
      title: pageData.title,
      description: pageData.metaDescription,
      canonicalPath: `/${pageData.slug}`,
      ogType: 'website',
      structuredData: {
        '@context': 'https://schema.org',
        '@graph': graph,
      },
    });
  }, [pageData]);

  // Filter listings strictly matching this landing page's criteria
  const matchingProperties = useMemo(() => {
    if (!pageData) return [];
    let list = filterProperties(allProps, {
      locality: pageData.primaryLocation,
      category: pageData.categoryFilter && pageData.categoryFilter !== 'all' ? pageData.categoryFilter : undefined,
      categoryTab: pageData.tabFilter && pageData.tabFilter !== 'all' ? pageData.tabFilter : undefined,
      sortBy: 'recommended',
    });
    if (pageData.sublocalityFilter) {
      const term = pageData.sublocalityFilter.toLowerCase();
      const filtered = list.filter((p) => {
        const text = `${p.subLocation || ''} ${p.address || ''} ${p.locality || ''}`.toLowerCase();
        return text.includes(term);
      });
      if (filtered.length > 0) {
        list = filtered;
      }
    }
    return list;
  }, [allProps, pageData]);

  if (!pageData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20 px-4 bg-ivory">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-stone text-center shadow-card">
          <div className="w-16 h-16 rounded-full bg-stone/50 text-navy flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8 text-royal" />
          </div>
          <h2 className="font-serif text-3xl font-normal text-charcoal mb-2">
            Page Not Found
          </h2>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            The requested real estate directory page could not be located.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            <span>Return to Homepage</span>
          </button>
        </div>
      </div>
    );
  }

  const whatsappInquiryUrl = `https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent(
    `Hello Tomar Enterprises, I am inquiring regarding "${pageData.targetKeyword}" in ${pageData.locationName}. Please share available property details and site inspection timings.`
  )}`;

  return (
    <div className="bg-ivory min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Semantic Breadcrumbs with Crawlable Links */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted flex-wrap">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="hover:text-navy transition-colors font-medium"
          >
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-muted/60" />
          <a
            href={`/locations/${pageData.primaryLocation}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(`/locations/${pageData.primaryLocation}`);
            }}
            className="hover:text-navy transition-colors font-medium"
          >
            {pageData.locationName}
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-muted/60" />
          <span className="text-charcoal font-semibold truncate max-w-xs sm:max-w-md">
            {pageData.targetKeyword}
          </span>
        </nav>

        {/* Hero Header Section with Single Clean H1 */}
        <div className="bg-white rounded-3xl border border-stone p-6 sm:p-10 mb-10 shadow-subtle relative overflow-hidden">
          <div className="max-w-4xl relative z-10">
            {/* Trust Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy/5 text-navy border border-navy/15 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-brandRed" />
                <span>{pageData.locationName} Corridor</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>MahaRERA: {contactInfo.reraRegistration.certificateNumber}</span>
              </span>
            </div>

            {/* Primary H1 */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-navy leading-tight mb-4 tracking-tight">
              {pageData.h1}
            </h1>

            {/* Useful Local Introduction */}
            <p className="text-charcoal/80 text-base sm:text-lg leading-relaxed mb-6 font-normal">
              {pageData.introParagraph}
            </p>

            {/* Micro-Market Highlights */}
            {pageData.localHighlights && pageData.localHighlights.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 pt-4 border-t border-stone/60">
                {pageData.localHighlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-ivory/60 border border-stone/40">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-charcoal font-medium leading-snug">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Contact & Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Quick WhatsApp Advisory</span>
              </a>

              <a
                href={`tel:${contactInfo.phoneRaw}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                <Phone className="w-4 h-4 text-brandRed" />
                <span>Call {contactInfo.phoneDisplay}</span>
              </a>

              <a
                href="#matching-listings"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-stone/40 hover:bg-stone/70 text-charcoal font-bold text-xs uppercase tracking-wider transition-all"
              >
                <span>View {matchingProperties.length} Matching Listings</span>
                <ArrowRight className="w-4 h-4 text-royal" />
              </a>
            </div>
          </div>
        </div>

        {/* Property Listings Section */}
        <div id="matching-listings" className="mb-14 scroll-mt-6">
          <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
                Available Properties in {pageData.locationName}
              </h2>
              <p className="text-muted text-sm mt-1">
                Verified listings matching {pageData.targetKeyword.toLowerCase()} ({matchingProperties.length} properties available)
              </p>
            </div>

            <a
              href="/properties"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/properties');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:text-navy transition-colors"
            >
              <span>Explore Full Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {matchingProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchingProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onViewDetails={(p) => onNavigate(`/properties/${p.slug || p.id}`)}
                  onEnquire={onEnquire}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone p-12 text-center max-w-lg mx-auto shadow-subtle">
              <Building className="w-12 h-12 text-royal/60 mx-auto mb-3" />
              <h3 className="font-serif text-xl font-bold text-charcoal mb-2">
                Active Mandates Updating
              </h3>
              <p className="text-muted text-sm mb-6 leading-relaxed">
                New inventory is actively being registered in {pageData.locationName}. Contact Sanjay or Shlok Tomar directly for off-market opportunities.
              </p>
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <span>Contact Advisory Desk</span>
              </a>
            </div>
          )}
        </div>

        {/* Genuine Location & Category FAQs Section */}
        {pageData.faqs && pageData.faqs.length > 0 && (
          <div className="bg-white rounded-3xl border border-stone p-6 sm:p-10 mb-14 shadow-subtle">
            <div className="max-w-3xl mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal/10 text-royal text-xs font-bold uppercase tracking-wider mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
                Common Inquiries on {pageData.locationName} Real Estate
              </h2>
            </div>

            <div className="space-y-4 max-w-4xl">
              {pageData.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-stone rounded-2xl overflow-hidden transition-colors bg-ivory/30"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-serif text-base sm:text-lg font-bold text-charcoal hover:text-navy transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <span className={`text-royal transition-transform duration-200 text-xl font-normal ${isOpen ? 'rotate-45' : ''}`}>
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-sm sm:text-base text-charcoal/80 leading-relaxed border-t border-stone/40 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Internal Cross-Linking Grid */}
        {pageData.relatedPages && pageData.relatedPages.length > 0 && (
          <div className="bg-ivory rounded-3xl border border-stone/80 p-6 sm:p-8 mb-12">
            <h3 className="font-serif text-xl font-bold text-navy mb-4">
              Explore Related Real Estate in {pageData.locationName} & Adjacent Corridors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {pageData.relatedPages.map((rel, idx) => (
                <a
                  key={idx}
                  href={rel.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(rel.path);
                  }}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-stone hover:border-royal/60 text-charcoal hover:text-navy transition-all shadow-2xs group"
                >
                  <span className="text-xs sm:text-sm font-semibold truncate">{rel.title}</span>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-royal flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Official Advisory & MahaRERA Registration Bar */}
        <div className="p-6 rounded-2xl bg-navy text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <ShieldCheck className="w-8 h-8 text-brandRed flex-shrink-0" />
            <div>
              <p className="font-bold text-sm sm:text-base">
                MahaRERA Registered Real Estate Agency: {contactInfo.reraRegistration.certificateNumber}
              </p>
              <p className="text-white/70 text-xs">
                Agent: {contactInfo.reraRegistration.agentName} &bull; Office: Nakshatra Apt., Manvelpada, Virar East, Palghar - 401305
              </p>
            </div>
          </div>
          <a
            href={contactInfo.reraCertificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold tracking-wider uppercase transition-colors flex-shrink-0"
          >
            <span>View Certificate</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
}
