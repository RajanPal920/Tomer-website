import React, { useState, useEffect } from 'react';
import {
  MapPin,
  CheckCircle2,
  MessageSquare,
  Phone,
  Shield,
  Heart,
  Scale,
  ArrowLeft,
  ChevronRight,
  Check,
  Compass,
  Mail,
  ExternalLink,
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { getPropertyBySlug, getSimilarProperties } from '../data/properties';
import { contactInfo } from '../data/contactInfo';
import { getLocationDisplayName } from '../data/locations';
import {
  isFavourite,
  toggleFavourite,
  isInCompare,
  toggleCompare,
  trackRecentlyViewed,
  subscribeToPreferences,
} from '../services/userPreferences';
import { submitEnquiry, fetchLiveProperties, subscribeToProperties } from '../services/propertyStore';
import { buildGmailComposeUrl, buildMailtoUrl, openGmailCompose } from '../services/emailService';
import { updateSeoMetadata, generatePropertySeo } from '../services/seo';
import PropertyCard from './PropertyCard';

export default function PropertyDetailPage({ slug, onNavigate, onEnquire }) {
  const [property, setProperty] = useState(() => getPropertyBySlug(slug));
  const [isLoading, setIsLoading] = useState(!property);
  const propId = property?.id;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFav, setIsFav] = useState(() => (propId ? isFavourite(propId) : false));
  const [inComp, setInComp] = useState(() => (propId ? isInCompare(propId) : false));
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Ensure property resolves even on fresh browser page refresh
  useEffect(() => {
    const existing = getPropertyBySlug(slug);
    if (existing) {
      setProperty(existing);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let isMounted = true;

    // Fetch live properties from backend API
    fetchLiveProperties(true)
      .then(() => {
        if (!isMounted) return;
        const liveProp = getPropertyBySlug(slug);
        if (liveProp) {
          setProperty(liveProp);
          setIsLoading(false);
        } else {
          // Direct API query for individual property ID or slug
          fetch(`/api/properties/${encodeURIComponent(slug)}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (isMounted && data?.property) {
                setProperty(data.property);
              }
            })
            .catch(() => {})
            .finally(() => {
              if (isMounted) setIsLoading(false);
            });
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    const unsubscribe = subscribeToProperties(() => {
      if (!isMounted) return;
      const updated = getPropertyBySlug(slug);
      if (updated) setProperty(updated);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [slug]);

  useEffect(() => {
    if (propId) {
      trackRecentlyViewed(propId);
      setIsFav(isFavourite(propId));
      setInComp(isInCompare(propId));
    }
  }, [propId]);

  useEffect(() => {
    if (!propId) return;
    return subscribeToPreferences((type) => {
      if (type === 'favourites') setIsFav(isFavourite(propId));
      if (type === 'compare') setInComp(isInCompare(propId));
    });
  }, [propId]);

  // Dynamic SEO Metadata & Schema generation following Property Type + Intent + Locality + Verified Attributes
  useEffect(() => {
    if (!property) {
      if (!isLoading) {
        updateSeoMetadata({
          title: 'Property Not Located',
          description: 'The requested real estate listing does not exist or has been updated in our catalog.',
          noindex: true,
        });
      }
      return;
    }

    const seo = generatePropertySeo(property);
    updateSeoMetadata({
      title: seo.title,
      description: seo.description,
      canonicalPath: seo.canonicalPath,
      ogType: 'article',
      ogImage: property.image || undefined,
      noindex: false,
      structuredData: seo.schema,
    });
  }, [property, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20 px-4 bg-ivory">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-brandRed border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted text-xs font-semibold uppercase tracking-wider">
            Loading Property Details...
          </p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20 px-4 bg-ivory">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-stone text-center shadow-card">
          <div className="w-16 h-16 rounded-full bg-stone/50 text-navy flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8 text-royal" />
          </div>
          <h2 className="font-serif text-3xl font-normal text-charcoal mb-2">
            Property Not Found
          </h2>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            The property reference you requested does not exist or has been updated in our catalog.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-brandRed" />
            <span>Return to Properties Catalog</span>
          </button>
        </div>
      </div>
    );
  }

  const gallery = property.gallery && property.gallery.length > 0 ? property.gallery : property.propertyImages || [property.image];
  const similarProperties = getSimilarProperties(property, 3);
  const localityName = getLocationDisplayName(property.locality);
  const seoData = generatePropertySeo(property);

  const isPlot = property.transactionType === 'plots-land' || property.category?.includes('plot');

  const handleToggleFav = () => {
    const state = toggleFavourite(property.id);
    setIsFav(state);
  };

  const handleToggleCompare = () => {
    const res = toggleCompare(property.id);
    if (!res.success && res.message) {
      alert(res.message);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!enquiryForm.name.trim()) errs.name = 'Please provide your full name.';
    const cleanPhone = enquiryForm.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Please provide a valid 10-digit mobile number.';
    }
    return errs;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});

    try {
      await submitEnquiry({
        name: enquiryForm.name.trim(),
        phone: enquiryForm.phone.trim(),
        email: enquiryForm.email.trim() || null,
        propertyTitle: property.title,
        propertyId: property.id,
        stationLocation: property.locality,
        message: enquiryForm.message.trim() || `Customer enquiry for ${property.title} (${property.priceDisplay || property.priceFormatted})`,
      });
    } catch (err) {
      console.warn('API enquiry persistence failed, stored locally:', err);
    }

    setEnquirySent(true);

    // Open preferred Gmail compose window addressed to Sanjaykumartomar4@gmail.com
    openGmailCompose({
      property,
      clientName: enquiryForm.name.trim(),
      clientPhone: enquiryForm.phone.trim(),
      message: enquiryForm.message.trim(),
    });
  };

  const isSoldOut = property.status === 'sold' || property.status === 'sold_out' || property.status === 'sold-out';

  const whatsappMessage = isSoldOut
    ? `Hello Tomar Enterprises, I saw that property: ${property.title} (Ref: ${property.id}) in ${property.locality} is Sold Out. Could you share details of similar available properties?`
    : `Hello Tomar Enterprises, I am inquiring about: ${property.title} (Price: ${property.priceDisplay || property.priceFormatted}, Ref: ${property.id}) located in ${property.locality}. Please connect with availability details.`;
  const whatsappUrl = `https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const gmailUrl = buildGmailComposeUrl({ property });
  const mailtoUrl = buildMailtoUrl({ property });

  return (
    <div className="bg-ivory min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Semantic Breadcrumb Navigation with Crawlable Anchors */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted flex-wrap">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="hover:text-navy hover:underline transition-colors font-medium"
          >
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-stone-dark" />
          <a
            href="/properties"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/properties');
            }}
            className="hover:text-navy hover:underline transition-colors font-medium"
          >
            Properties
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-stone-dark" />
          <a
            href={`/locations/${property.locality}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(`/locations/${property.locality}`);
            }}
            className="hover:text-navy hover:underline transition-colors capitalize font-medium"
          >
            {localityName}
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-stone-dark" />
          <span className="text-charcoal font-semibold truncate max-w-xs sm:max-w-md" aria-current="page">
            {seoData.h1}
          </span>
        </nav>

        {/* SOLD OUT Prominent Alert Banner */}
        {isSoldOut && (
          <div className="mb-6 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3.5">
              <span className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-xs flex-shrink-0">
                SOLD OUT
              </span>
              <div>
                <h4 className="font-serif font-bold text-base text-rose-950">This Property Has Been Sold</h4>
                <p className="text-xs text-rose-800 mt-0.5">
                  This unit is no longer available. You can explore our currently available listings in {localityName} and across the corridor.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/properties')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy hover:bg-navy-900 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex-shrink-0"
            >
              <span>Browse Available Listings</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-stone p-6 sm:p-8 mb-8 shadow-card">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
                {isSoldOut && (
                  <span className="px-3 py-1 rounded bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                    SOLD OUT
                  </span>
                )}
                <span className="px-3 py-1 rounded bg-navy text-white text-xs font-bold uppercase tracking-wider">
                  {property.transactionType}
                </span>
                <span className="px-3 py-1 rounded bg-royal text-white text-xs font-bold uppercase tracking-wider">
                  {property.category?.replace('-', ' ')}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-stone/50 text-charcoal/80 text-xs font-mono">
                  Ref: {property.id}
                </span>
              </div>

              {/* Exact SEO H1 (Property Type + Transaction Intent + Sublocality + Verified Attributes) */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal tracking-tight text-balance mb-2">
                {seoData.h1}
              </h1>

              {/* Distinct Property / Project Name Subtitle */}
              {seoData.subHeading && (
                <p className="text-base sm:text-lg font-medium text-navy/90 mb-2">
                  {seoData.subHeading}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm text-muted">
                <MapPin className="w-4 h-4 text-brandRed flex-shrink-0" />
                <span>{property.subLocation || property.locality}, Palghar District, Maharashtra</span>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between gap-4 flex-shrink-0">
              <div className="text-left lg:text-right">
                <div className="font-serif text-3xl sm:text-4xl font-bold text-navy">
                  {property.priceDisplay || property.priceFormatted}
                </div>
                {property.pricePerSqft && (
                  <div className="text-xs sm:text-sm text-muted font-semibold mt-0.5">
                    Rate: {property.pricePerSqft}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleFav}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all ${
                    isFav
                      ? 'bg-brandRed text-white border-brandRed shadow-sm'
                      : 'bg-white text-charcoal border-stone hover:bg-ivory'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                  <span>{isFav ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleCompare}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all ${
                    inComp
                      ? 'bg-navy text-white border-navy shadow-sm'
                      : 'bg-white text-charcoal border-stone hover:bg-ivory'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-royal" />
                  <span>{inComp ? 'Comparing (✓)' : 'Compare'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="pt-6">
            <div className="relative aspect-[16/9] lg:aspect-[21/9] rounded-2xl overflow-hidden bg-stone mb-3 shadow-inner">
              <img
                src={gallery[activeImageIndex] || property.image}
                alt={`${seoData.h1} - View ${activeImageIndex + 1} of ${gallery.length} at Tomar Enterprises`}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              <div className="absolute bottom-4 left-4 bg-navy-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-lg text-white text-xs flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brandRed" />
                <span>{property.subLocation || localityName}</span>
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {gallery.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 sm:w-28 h-16 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-brandRed shadow-sm scale-102' : 'border-stone opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${seoData.h1} - Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Two-Column Layout: Details (8 Cols) & Enquiry Sidebar (4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Details (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Key Specifications Grid */}
            <div className="bg-white rounded-2xl border border-stone p-6 sm:p-8 shadow-card">
              <h3 className="font-serif text-2xl font-normal text-charcoal mb-6">
                Property Specifications
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-ivory border border-stone/70">
                  <span className="text-muted block text-[11px] uppercase font-bold tracking-wider mb-1">
                    Area
                  </span>
                  <span className="font-bold text-navy text-sm">
                    {property.areaDisplay || (property.areaSqFt ? `${property.areaSqFt} sq.ft` : 'On Request')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-ivory border border-stone/70">
                  <span className="text-muted block text-[11px] uppercase font-bold tracking-wider mb-1">
                    Configuration
                  </span>
                  <span className="font-bold text-navy text-sm capitalize">
                    {isPlot
                      ? 'Land Parcel'
                      : property.bedrooms
                      ? `${property.bedrooms} BHK`
                      : property.category?.replace('-', ' ')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-ivory border border-stone/70">
                  <span className="text-muted block text-[11px] uppercase font-bold tracking-wider mb-1">
                    Possession
                  </span>
                  <span className="font-bold text-navy text-sm">
                    {property.possessionDisplay || property.possessionStatus || 'Immediate'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-ivory border border-stone/70">
                  <span className="text-muted block text-[11px] uppercase font-bold tracking-wider mb-1">
                    Furnishing
                  </span>
                  <span className="font-bold text-navy text-sm capitalize">
                    {property.furnishing || 'Standard'}
                  </span>
                </div>

                {property.bathrooms && (
                  <div className="p-3.5 rounded-xl bg-ivory border border-stone/70">
                    <span className="text-muted block text-[11px] uppercase font-bold tracking-wider mb-1">
                      Bathrooms
                    </span>
                    <span className="font-bold text-navy text-sm">{property.bathrooms} Baths</span>
                  </div>
                )}

                {property.parking && (
                  <div className="p-3.5 rounded-xl bg-ivory border border-stone/70">
                    <span className="text-muted block text-[11px] uppercase font-bold tracking-wider mb-1">
                      Parking
                    </span>
                    <span className="font-bold text-navy text-sm">{property.parking}</span>
                  </div>
                )}

                {property.floor && (
                  <div className="p-3.5 rounded-xl bg-ivory border border-stone/70">
                    <span className="text-muted block text-[11px] uppercase font-bold tracking-wider mb-1">
                      Floor Level
                    </span>
                    <span className="font-bold text-navy text-sm">{property.floor}</span>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-ivory border border-stone/70">
                  <span className="text-muted block text-[11px] uppercase font-bold tracking-wider mb-1">
                    Location Zone
                  </span>
                  <span className="font-bold text-navy text-sm capitalize">{localityName}</span>
                </div>
              </div>
            </div>

            {/* Overview & Description */}
            <div className="bg-white rounded-2xl border border-stone p-6 sm:p-8 shadow-card">
              <h3 className="font-serif text-2xl font-normal text-charcoal mb-4">
                About This Property
              </h3>
              <p className="text-charcoal/80 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities & Features */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone p-6 sm:p-8 shadow-card">
                <h3 className="font-serif text-2xl font-normal text-charcoal mb-6">
                  Amenities & Infrastructure
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm text-charcoal">
                  {property.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-ivory/60 border border-stone/60">
                      <CheckCircle2 className="w-4 h-4 text-royal flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification / Notice Banner */}
            <div className="p-5 rounded-2xl bg-stone/40 border border-stone text-xs text-muted flex items-start gap-3">
              <Shield className="w-5 h-5 text-royal flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-charcoal block mb-0.5">Verification & Advisory Standard:</strong>
                All property layouts, carpet specs, and pricing brackets presented here serve as authentic benchmarks for the {localityName} micro-market. We verify title documentation, municipal water, and access routes before organizing private site visits.
              </div>
            </div>
          </div>

          {/* Right Sidebar: Contact & Enquiry Form (4 Cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-white rounded-2xl border border-stone p-6 sm:p-7 shadow-card">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brandRed mb-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isSoldOut ? 'Property Sold Out' : 'Direct Property Advisory'}</span>
              </div>
              <h3 className="font-serif text-2xl font-normal text-charcoal mb-2">
                {isSoldOut ? 'Inquire for Similar Properties' : 'Enquire About This Property'}
              </h3>
              {isSoldOut && (
                <p className="text-xs text-muted mb-4 leading-relaxed">
                  This specific property has been marked Sold Out. Submit your details below and our team will share currently available options matching your requirements in {localityName}.
                </p>
              )}

              {enquirySent ? (
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg text-charcoal">Enquiry Captured</h4>
                  <p className="text-xs text-muted leading-relaxed">
                    Thank you! Your enquiry for <strong className="text-navy">{property.title}</strong> has been logged. A Gmail compose window has been opened for <strong className="text-navy">Sanjaykumartomar4@gmail.com</strong>.
                  </p>
                  
                  <div className="pt-2 flex flex-col gap-2">
                    <a
                      href={gmailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Re-Open in Gmail Compose</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={mailtoUrl}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white border border-stone text-charcoal font-semibold text-xs uppercase tracking-wider hover:bg-stone/30 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-royal" />
                      <span>Open in Mail App (Mailto)</span>
                    </a>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full bg-ivory/50 border border-stone rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
                    />
                    {formErrors.name && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-1.5">
                      Mobile Number (10 digits) *
                    </label>
                    <input
                      type="tel"
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      placeholder="e.g. 98200 12345"
                      className="w-full bg-ivory/50 border border-stone rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
                    />
                    {formErrors.phone && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full bg-ivory/50 border border-stone rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-1.5">
                      Questions / Preferred Visit Time
                    </label>
                    <textarea
                      rows={3}
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                      placeholder="I would like to inspect the site and review layout plans."
                      className="w-full bg-ivory/50 border border-stone rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                    <span>{isSoldOut ? 'Inquire for Similar Available Properties' : 'Submit & Open Gmail Enquiry'}</span>
                  </button>
                </form>
              )}

              {/* Direct Call, WhatsApp & Gmail Quick Actions */}
              <div className="pt-5 border-t border-stone mt-5 space-y-2.5">
                <a
                  href={`tel:${contactInfo.phoneRaw}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-navy hover:bg-navy-900 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-brandRed" />
                  <span>Call Advisory Desk: {contactInfo.phoneDisplay}</span>
                </a>

                <a
                  href={gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold uppercase tracking-wider text-royal transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-royal" />
                  <span>Enquire via Gmail (Sanjay Tomar)</span>
                  <ExternalLink className="w-3 h-3 text-royal/70" />
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold uppercase tracking-wider text-emerald-800 transition-colors"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chat on WhatsApp Directly</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-royal mb-1">
                  <span>Related Recommendations</span>
                </div>
                <h3 className="font-serif text-3xl font-normal text-charcoal">
                  Similar Properties in {localityName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(`/locations/${property.locality}`)}
                className="text-xs font-bold uppercase tracking-wider text-navy hover:text-royal transition-colors"
              >
                View All in {localityName} &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {similarProperties.map((sim) => (
                <PropertyCard
                  key={sim.id}
                  property={sim}
                  onNavigate={onNavigate}
                  onEnquire={onEnquire}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
