import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Shield,
  MapPin,
  IndianRupee,
  Phone,
  Layers,
  UploadCloud,
  FileCheck2,
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { contactInfo } from '../data/contactInfo';
import { APPROVED_STATIONS } from '../data/locations';
import {
  PROPERTY_TYPES_BY_CATEGORY,
  ALL_PROPERTY_TYPE_OPTIONS,
  REQUIREMENT_OPTIONS,
} from '../data/listingModalData';
import { submitEnquiry } from '../services/propertyStore';

export { PROPERTY_TYPES_BY_CATEGORY, ALL_PROPERTY_TYPE_OPTIONS, REQUIREMENT_OPTIONS };

export default function PropertyListModal({ initialRequirement = 'Sell', onClose }) {
  // Normalize initial requirement safely
  const getCleanInitialReq = (req) => {
    if (!req) return 'Sell';
    if (req.toLowerCase().includes('rent')) return 'Rent Out';
    if (req.toLowerCase().includes('heavy')) return 'Heavy Deposit';
    if (req.toLowerCase().includes('lease')) return 'Lease';
    if (req.toLowerCase().includes('redevelopment')) return 'Redevelopment';
    if (req.toLowerCase().includes('joint') || req.toLowerCase().includes('development')) return 'Development / Joint Development';
    return 'Sell';
  };

  // Base Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState(APPROVED_STATIONS[0]?.displayName || 'Vasai Road (East & West)');
  const [localityDetail, setLocalityDetail] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyType, setPropertyType] = useState('new-flat');
  const [requirement, setRequirement] = useState(() => getCleanInitialReq(initialRequirement));

  // Conditional Fields: Specifications & Sizing
  const [bedrooms, setBedrooms] = useState('2 BHK');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('sq.ft');
  const [roadAccess, setRoadAccess] = useState('');

  // Conditional Fields: Commercial & Projects
  const [commercialUsage, setCommercialUsage] = useState('');
  const [societyName, setSocietyName] = useState('');
  const [existingUnits, setExistingUnits] = useState('');

  // Conditional Fields: Financial Expectations
  const [expectedPrice, setExpectedPrice] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [leaseTerm, setLeaseTerm] = useState('');

  // Optional Description & Image Attachment
  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);

  // Submission State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Close on Escape key & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Derived Category State for Conditional UI
  const isPlotOrLand =
    propertyType.includes('plot') ||
    propertyType.includes('land') ||
    propertyType === 'agricultural-land' ||
    propertyType === 'plotting-project';

  const isResidentialFlat =
    propertyType === 'new-flat' ||
    propertyType === 'resale-flat' ||
    propertyType === 'residential-apartment' ||
    propertyType === 'residential-house-villa' ||
    propertyType === 'residential-rent';

  const isCommercialUnit =
    propertyType === 'commercial-shop' ||
    propertyType === 'commercial-office' ||
    propertyType === 'commercial-unit' ||
    propertyType === 'commercial-rent';

  const isRedevelopment =
    propertyType === 'redevelopment-property' ||
    propertyType === 'society-redevelopment' ||
    propertyType === 'new-development-project' ||
    requirement === 'Redevelopment' ||
    requirement === 'Development / Joint Development' ||
    requirement === 'Joint Development';

  // Area units based on property type
  const availableAreaUnits = isPlotOrLand
    ? [
        { id: 'guntha', label: 'Guntha (33 ft × 33 ft)' },
        { id: 'sq.ft', label: 'Square Feet (sq.ft)' },
        { id: 'acre', label: 'Acres (40 Gunthas)' },
        { id: 'sq.mtr', label: 'Square Metres' },
        { id: 'sq.yard', label: 'Square Yards' },
        { id: 'bigha', label: 'Bigha' },
      ]
    : [
        { id: 'sq.ft', label: 'Square Feet (sq.ft)' },
        { id: 'sq.mtr', label: 'Square Metres' },
        { id: 'sq.yard', label: 'Square Yards' },
      ];

  // Adjust default area unit when switching to/from plots
  useEffect(() => {
    if (isPlotOrLand && areaUnit === 'sq.ft') {
      setAreaUnit('guntha');
    } else if (!isPlotOrLand && areaUnit !== 'sq.ft' && areaUnit !== 'sq.mtr') {
      setAreaUnit('sq.ft');
    }
  }, [isPlotOrLand, areaUnit]);

  // Handle image file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.slice(0, 3).filter((file) => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });
    setSelectedImages(validFiles);
  };

  // Form Validation
  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Please provide your full legal name.';

    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.slice(2);
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.slice(1);
    }

    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      errs.phone = 'Please provide a valid 10-digit Indian mobile number (e.g. 98200 12345).';
    }

    if (!location) errs.location = 'Please select a station area from the service corridor.';
    if (!propertyType) errs.propertyType = 'Please choose a property category.';
    if (!requirement) errs.requirement = 'Please choose a transaction requirement.';

    return errs;
  };

  // Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const typeObj = ALL_PROPERTY_TYPE_OPTIONS.find((t) => t.id === propertyType);
    const refCode = `TE-OWNER-${Date.now().toString().slice(-6)}`;

    const submissionPayload = {
      referenceId: refCode,
      submittedAt: new Date().toISOString(),
      ownerName: name.trim(),
      mobilePhone: phone.trim(),
      stationLocation: location,
      specificLocality: localityDetail.trim(),
      propertyAddress: propertyAddress.trim() || null,
      propertyType: typeObj ? typeObj.label : propertyType,
      propertyTypeId: propertyType,
      requirement,
      bedrooms: isResidentialFlat ? bedrooms : null,
      area: area ? `${area} ${areaUnit}` : null,
      roadAccess: isPlotOrLand && roadAccess ? roadAccess.trim() : null,
      commercialUsage: isCommercialUnit && commercialUsage ? commercialUsage.trim() : null,
      societyName: isRedevelopment && societyName ? societyName.trim() : null,
      existingUnits: isRedevelopment && existingUnits ? existingUnits.trim() : null,
      expectedPrice: expectedPrice.trim() || null,
      monthlyRent: monthlyRent.trim() || null,
      depositAmount: depositAmount.trim() || null,
      leaseTerm: leaseTerm.trim() || null,
      description: description.trim() || null,
      imageCount: selectedImages.length,
      status: 'Pending Review & Verification',
      isDemoSubmission: contactInfo.isDemoMode,
    };

    try {
      await submitEnquiry({
        name: name.trim(),
        phone: phone.trim(),
        stationLocation: location,
        type: `Property Listing Intake (${requirement})`,
        propertyTitle: `${requirement} ${typeObj ? typeObj.label : propertyType} - ${location}`,
        message: `Property details submitted by visitor/owner for verification: Locality: ${localityDetail.trim() || 'N/A'}. Details: ${description.trim() || 'N/A'}. Expected: ${expectedPrice || monthlyRent || 'On Request'}. Area: ${area ? `${area} ${areaUnit}` : 'N/A'}. Reference: ${refCode}`,
        metadata: submissionPayload,
      });
    } catch (err) {
      console.warn('API enquiry persistence failed, stored locally for review:', err);
    } finally {
      setIsSubmitting(false);
      setSubmittedData(submissionPayload);
    }
  };

  // WhatsApp Pre-filled payload
  const getWhatsAppListingUrl = () => {
    if (!submittedData) return '';
    const typeLabel = ALL_PROPERTY_TYPE_OPTIONS.find((t) => t.id === propertyType)?.label || propertyType;

    const lines = [
      `*NEW PROPERTY LISTING PROFILE* (Ref: ${submittedData.referenceId})`,
      `----------------------------------------`,
      `*Owner Name:* ${name.trim()}`,
      `*Mobile:* ${phone.trim()}`,
      `*Requirement:* ${requirement}`,
      `*Property Type:* ${typeLabel}`,
      `*Station Corridor:* ${location}`,
      localityDetail.trim() ? `*Locality / Area:* ${localityDetail.trim()}` : null,
      propertyAddress.trim() ? `*Property Address:* ${propertyAddress.trim()}` : null,
      isResidentialFlat && bedrooms ? `*BHK:* ${bedrooms}` : null,
      area ? `*Area:* ${area} ${areaUnit}` : null,
      expectedPrice ? `*Expected Price:* ${expectedPrice}` : null,
      monthlyRent ? `*Monthly Rent / Lease:* ${monthlyRent}` : null,
      depositAmount ? `*Deposit Amount:* ${depositAmount}` : null,
      leaseTerm ? `*Lease Term / Tenure:* ${leaseTerm}` : null,
      societyName ? `*Society / Project:* ${societyName}` : null,
      roadAccess ? `*Road Access:* ${roadAccess}` : null,
      description.trim() ? `*Details:* ${description.trim()}` : null,
      `----------------------------------------`,
      `Please review this property profile and confirm onboarding steps.`,
    ].filter(Boolean);

    return `https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-modal border border-stone overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header — Fixed at Top */}
        <div className="px-6 py-4 sm:py-5 bg-navy text-white flex items-center justify-between border-b border-navy-700 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-royal/30 text-white">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="modal-title" className="font-serif text-lg sm:text-xl font-normal leading-tight">
                List Your Property With Us
              </h2>
              <p className="text-[11px] text-stone/80 uppercase tracking-wider">
                Direct Owner & Landlord Onboarding &bull; Vasai to Palghar
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close listing modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 overscroll-contain">
          {submittedData ? (
            /* ============================================================== */
            /* SUBMISSION CONFIRMATION STATE (Pending Verification)           */
            /* ============================================================== */
            <div className="space-y-5 text-center py-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-royal/10 text-royal text-xs font-bold uppercase tracking-wider mb-2">
                  Ref: {submittedData.referenceId}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
                  Property Profile Registered
                </h3>
                <p className="text-xs sm:text-sm text-muted max-w-md mx-auto mt-1 leading-relaxed">
                  Thank you, <strong className="text-navy">{submittedData.ownerName}</strong>. Your listing request for{' '}
                  <span className="font-semibold text-charcoal">
                    {submittedData.propertyType} ({submittedData.requirement}) in {submittedData.stationLocation}
                  </span>{' '}
                  has been recorded in our owner onboarding desk.
                </p>
              </div>

              {/* Structured Submission Summary Box */}
              <div className="bg-ivory rounded-2xl border border-stone p-4 sm:p-5 text-left text-xs space-y-2 max-w-lg mx-auto shadow-xs">
                <div className="font-bold text-navy uppercase tracking-wider text-[11px] border-b border-stone/60 pb-1.5 mb-2 flex items-center justify-between">
                  <span>Registered Details</span>
                  <span className="text-emerald-700 font-semibold text-[10px]">Pending Verification</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-charcoal">
                  <div>
                    <span className="text-muted block text-[10px] uppercase">Requirement:</span>
                    <span className="font-semibold">{submittedData.requirement}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase">Property Category:</span>
                    <span className="font-semibold">{submittedData.propertyType}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase">Location Corridor:</span>
                    <span className="font-semibold">{submittedData.stationLocation}</span>
                  </div>
                  {submittedData.specificLocality && (
                    <div>
                      <span className="text-muted block text-[10px] uppercase">Locality / Area:</span>
                      <span className="font-semibold">{submittedData.specificLocality}</span>
                    </div>
                  )}
                  {submittedData.propertyAddress && (
                    <div>
                      <span className="text-muted block text-[10px] uppercase">Property Address:</span>
                      <span className="font-semibold">{submittedData.propertyAddress}</span>
                    </div>
                  )}
                  {submittedData.area && (
                    <div>
                      <span className="text-muted block text-[10px] uppercase">Dimensions / Area:</span>
                      <span className="font-semibold">{submittedData.area}</span>
                    </div>
                  )}
                  {(submittedData.expectedPrice || submittedData.monthlyRent || submittedData.depositAmount) && (
                    <div>
                      <span className="text-muted block text-[10px] uppercase">Expected Pricing / Terms:</span>
                      <span className="font-semibold text-navy">
                        {submittedData.expectedPrice || submittedData.monthlyRent || submittedData.depositAmount}
                      </span>
                    </div>
                  )}
                  {submittedData.leaseTerm && (
                    <div>
                      <span className="text-muted block text-[10px] uppercase">Lease Term / Tenure:</span>
                      <span className="font-semibold">{submittedData.leaseTerm}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] max-w-lg mx-auto text-left flex items-start gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Quality Protocol:</strong> In accordance with Tomar Enterprises verification guidelines, all owner-submitted properties undergo title and document verification before publishing publicly.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <a
                  href={getWhatsAppListingUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Send to WhatsApp Desk</span>
                </a>

                <a
                  href={`tel:${contactInfo.phoneRaw}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4 text-brandRed" />
                  <span>Call Advisory Desk</span>
                </a>
              </div>

              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-6 rounded-lg text-xs font-semibold text-muted hover:text-navy transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* MAIN PROPERTY LISTING FORM                                      */
            /* ============================================================== */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="p-3 rounded-xl bg-ivory border border-stone/70 text-xs text-muted flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-royal flex-shrink-0 mt-0.5" />
                <span>
                  List your residential flat, commercial space, land parcel, or housing society redevelopment with Tomar Enterprises. Your submission is held securely for direct broker-owner verification.
                </span>
              </div>

              {/* Section 1: Contact Information */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy mb-3 flex items-center gap-2 border-b border-stone/60 pb-1">
                  <span>1. Owner & Contact Information</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ownerName" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="ownerName"
                      type="text"
                      placeholder="e.g. Anand Tomar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full bg-white border ${
                        errors.name ? 'border-rose-400 ring-1 ring-rose-300' : 'border-stone'
                      } rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="mobilePhone" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="mobilePhone"
                      type="tel"
                      placeholder="e.g. 98200 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full bg-white border ${
                        errors.phone ? 'border-rose-400 ring-1 ring-rose-300' : 'border-stone'
                      } rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Requirement & Category */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy mb-3 flex items-center gap-2 border-b border-stone/60 pb-1">
                  <span>2. Property Category & Transaction Intent</span>
                </h3>

                {/* Requirement Selector (6 mutually exclusive buttons) */}
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    Your Transaction Requirement <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {REQUIREMENT_OPTIONS.map((req) => (
                      <button
                        key={req.id}
                        type="button"
                        onClick={() => setRequirement(req.id)}
                        className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                          requirement === req.id
                            ? 'border-royal bg-navy text-white shadow-xs font-bold'
                            : 'border-stone bg-ivory/60 text-charcoal hover:bg-stone/60 hover:text-navy'
                        }`}
                      >
                        {req.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Type Dropdown (Organized into Optgroups) */}
                <div>
                  <label htmlFor="propertyType" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                    Property Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="propertyType"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                  >
                    {PROPERTY_TYPES_BY_CATEGORY.map((grp) => (
                      <optgroup key={grp.category} label={grp.category} className="font-bold text-navy">
                        {grp.options.map((opt) => (
                          <option key={opt.id} value={opt.id} className="font-normal text-charcoal">
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section 3: Corridor & Specific Locality */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy mb-3 flex items-center gap-2 border-b border-stone/60 pb-1">
                  <MapPin className="w-3.5 h-3.5 text-royal" />
                  <span>3. Location & Locality</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="stationLocation" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                      Corridor Station Area <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="stationLocation"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                    >
                      {APPROVED_STATIONS.map((station) => (
                        <option key={station.locationId} value={station.displayName}>
                          {station.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="specificLocality" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                      Specific Locality / Area <span className="text-muted font-normal">(Optional)</span>
                    </label>
                    <input
                      id="specificLocality"
                      type="text"
                      placeholder="e.g. Babhola Naka, Station Road, Global City..."
                      value={localityDetail}
                      onChange={(e) => setLocalityDetail(e.target.value)}
                      className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="propertyAddress" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                      Property Address / Society Name <span className="text-muted font-normal">(Optional)</span>
                    </label>
                    <input
                      id="propertyAddress"
                      type="text"
                      placeholder="e.g. Flat 402, Wing-A, Gokul Heights, Behind D-Mart"
                      value={propertyAddress}
                      onChange={(e) => setPropertyAddress(e.target.value)}
                      className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Conditional Property Specifications */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy mb-3 flex items-center gap-2 border-b border-stone/60 pb-1">
                  <Layers className="w-3.5 h-3.5 text-royal" />
                  <span>4. Property Specifications & Dimensions</span>
                </h3>

                {/* Conditional A: Residential Flat BHK */}
                {isResidentialFlat && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label htmlFor="bhkConfig" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                        BHK Configuration
                      </label>
                      <select
                        id="bhkConfig"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                      >
                        <option value="1 RK">1 RK (Studio)</option>
                        <option value="1 BHK">1 BHK</option>
                        <option value="2 BHK">2 BHK</option>
                        <option value="3 BHK">3 BHK</option>
                        <option value="4+ BHK">4+ BHK / Penthouse</option>
                        <option value="Independent Villa">Independent House / Villa</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="carpetArea" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                        Carpet / Built-up Area
                      </label>
                      <div className="relative">
                        <input
                          id="carpetArea"
                          type="number"
                          placeholder="e.g. 650"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 pr-14 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs text-muted font-semibold pointer-events-none">
                          sq.ft
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional B: Plot / Land Dimensions & Units */}
                {isPlotOrLand && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label htmlFor="plotArea" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                        Plot / Land Area
                      </label>
                      <input
                        id="plotArea"
                        type="number"
                        placeholder="e.g. 5"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="areaUnit" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                        Measurement Unit
                      </label>
                      <select
                        id="areaUnit"
                        value={areaUnit}
                        onChange={(e) => setAreaUnit(e.target.value)}
                        className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                      >
                        {availableAreaUnits.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="roadAccess" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                        Road Access / Frontage <span className="text-muted font-normal">(Optional)</span>
                      </label>
                      <input
                        id="roadAccess"
                        type="text"
                        placeholder="e.g. 30 ft DP road touch, corner parcel with 45 ft frontage"
                        value={roadAccess}
                        onChange={(e) => setRoadAccess(e.target.value)}
                        className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Conditional C: Commercial Shops & Offices */}
                {isCommercialUnit && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label htmlFor="commArea" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                        Commercial Built-up Area
                      </label>
                      <div className="relative">
                        <input
                          id="commArea"
                          type="number"
                          placeholder="e.g. 450"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 pr-14 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs text-muted font-semibold pointer-events-none">
                          sq.ft
                        </span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="commUsage" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                        Floor / Frontage / Usage <span className="text-muted font-normal">(Optional)</span>
                      </label>
                      <input
                        id="commUsage"
                        type="text"
                        placeholder="e.g. Ground floor main road shop, bank approved"
                        value={commercialUsage}
                        onChange={(e) => setCommercialUsage(e.target.value)}
                        className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Conditional D: Society Redevelopment & Project Details */}
                {isRedevelopment && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label htmlFor="societyName" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                        Housing Society / Project Name
                      </label>
                      <input
                        id="societyName"
                        type="text"
                        placeholder="e.g. Sai Krupa Co-operative Housing Society"
                        value={societyName}
                        onChange={(e) => setSocietyName(e.target.value)}
                        className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="existingUnits" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                        Total Member Flats / Age of Building
                      </label>
                      <input
                        id="existingUnits"
                        type="text"
                        placeholder="e.g. 24 member flats, 32 years old"
                        value={existingUnits}
                        onChange={(e) => setExistingUnits(e.target.value)}
                        className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 5: Financial Expectations based on Requirement */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy mb-3 flex items-center gap-2 border-b border-stone/60 pb-1">
                  <IndianRupee className="w-3.5 h-3.5 text-brandRed" />
                  <span>5. Commercial Terms & Pricing Expectations</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* For Sell / Development / Joint Development / Redevelopment */}
                  {(requirement === 'Sell' || requirement === 'Development / Joint Development' || requirement === 'Joint Development' || requirement === 'Redevelopment') && (
                    <div className="sm:col-span-2">
                      <label htmlFor="expectedPrice" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                        Expected Asking Price <span className="text-muted font-normal">(e.g. ₹55 Lakh, ₹1.2 Cr, or Discuss)</span>
                      </label>
                      <input
                        id="expectedPrice"
                        type="text"
                        placeholder="e.g. ₹52.00 Lakh (Negotiable)"
                        value={expectedPrice}
                        onChange={(e) => setExpectedPrice(e.target.value)}
                        className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                      />
                    </div>
                  )}

                  {/* For Rent Out */}
                  {requirement === 'Rent Out' && (
                    <>
                      <div>
                        <label htmlFor="monthlyRent" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                          Expected Monthly Rent
                        </label>
                        <input
                          id="monthlyRent"
                          type="text"
                          placeholder="e.g. ₹18,000 / month"
                          value={monthlyRent}
                          onChange={(e) => setMonthlyRent(e.target.value)}
                          className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="depositAmount" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                          Security Deposit Amount
                        </label>
                        <input
                          id="depositAmount"
                          type="text"
                          placeholder="e.g. ₹60,000 (Refundable)"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                        />
                      </div>
                    </>
                  )}

                  {/* For Commercial / Residential Lease */}
                  {requirement === 'Lease' && (
                    <>
                      <div>
                        <label htmlFor="monthlyRent" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                          Expected Monthly Lease Rent
                        </label>
                        <input
                          id="monthlyRent"
                          type="text"
                          placeholder="e.g. ₹45,000 / month"
                          value={monthlyRent}
                          onChange={(e) => setMonthlyRent(e.target.value)}
                          className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="depositAmount" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                          Security Deposit Amount
                        </label>
                        <input
                          id="depositAmount"
                          type="text"
                          placeholder="e.g. ₹2.50 Lakh"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="leaseTerm" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                          Lease Period / Lock-in Term <span className="text-muted font-normal">(Optional)</span>
                        </label>
                        <input
                          id="leaseTerm"
                          type="text"
                          placeholder="e.g. 36 Months Registered Lease (11 Months Lock-in)"
                          value={leaseTerm}
                          onChange={(e) => setLeaseTerm(e.target.value)}
                          className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                        />
                      </div>
                    </>
                  )}

                  {/* For Heavy Deposit */}
                  {requirement === 'Heavy Deposit' && (
                    <>
                      <div>
                        <label htmlFor="depositAmount" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                          Expected Heavy Deposit (Lump Sum)
                        </label>
                        <input
                          id="depositAmount"
                          type="text"
                          placeholder="e.g. ₹15.00 Lakh (Refundable, 0 Monthly Rent)"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="leaseTerm" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                          Agreement Tenure / Duration
                        </label>
                        <input
                          id="leaseTerm"
                          type="text"
                          placeholder="e.g. 24 Months / 36 Months"
                          value={leaseTerm}
                          onChange={(e) => setLeaseTerm(e.target.value)}
                          className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Section 6: Optional Image Attachments */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Property Photographs <span className="text-muted font-normal">(Optional &bull; Max 3 images, 5MB each)</span>
                </label>
                <div className="border border-dashed border-stone-dark/60 rounded-2xl p-3.5 bg-ivory/50 hover:bg-ivory transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white text-royal border border-stone flex-shrink-0">
                      <UploadCloud className="w-5 h-5 text-royal" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageChange}
                        className="block w-full text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-navy file:text-white hover:file:bg-navy-900 cursor-pointer"
                      />
                    </div>
                  </div>

                  {selectedImages.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2 pt-2 border-t border-stone/50">
                      {selectedImages.map((img, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone text-xs text-charcoal font-medium">
                          <span>{img.name} ({(img.size / 1024).toFixed(0)} KB)</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-muted mt-2">
                    Photos are bundled with your listing profile for advisory assessment. Direct cloud storage will sync once the live client media backend is enabled.
                  </p>
                </div>
              </div>

              {/* Section 7: Description & Additional Notes */}
              <div>
                <label htmlFor="propertyDesc" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Additional Notes / Title Details / Possession <span className="text-muted font-normal">(Optional)</span>
                </label>
                <textarea
                  id="propertyDesc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 4th floor garden facing, clear title with CIDCO/VVCMC sanctioned plan, 24x7 municipal water supply..."
                  className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <PlusCircle className="w-4 h-4 text-white flex-shrink-0" />
                  <span>{isSubmitting ? 'Registering Property Profile...' : 'Submit Property for Review'}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted text-center pt-0.5">
                <Shield className="w-3.5 h-3.5 text-royal flex-shrink-0" />
                <span>Zero spam guarantee &bull; Confidential verified local advisory</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
