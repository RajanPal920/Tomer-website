import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Building2,
  MapPin,
  IndianRupee,
  Layers,
  FileText,
  Star,
  Check,
  UploadCloud,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { APPROVED_STATIONS } from '../../data/locations';
import { PROPERTY_TYPES_BY_CATEGORY } from '../../data/listingModalData';
import { uploadPropertyImage } from '../../services/propertyStore';

const COMMON_AMENITIES = [
  '24x7 Municipal Water Supply',
  'Car Parking Space',
  'Power Backup / Inverter',
  'Lift with Inverter Backup',
  'Gated Complex with Security / CCTV',
  'Children Play Area / Garden',
  'Clubhouse / Community Hall',
  'Vastu Compliant',
  'Rainwater Harvesting',
  'Piped Gas Connection (PNG)',
  'Main Road Facing / Highway Touch',
  'Clear Title / CIDCO / VVCMC Sanctioned',
];

export default function OwnerPropertyForm({
  initialProperty = null,
  onSave,
  onCancel,
  isSaving = false,
}) {
  const isEditing = Boolean(initialProperty?.id);

  // Core Details
  const [title, setTitle] = useState(initialProperty?.title || '');
  const [category, setCategory] = useState(initialProperty?.category || 'new-flat');
  const [transactionType, setTransactionType] = useState(initialProperty?.transactionType || 'buy');
  const [locality, setLocality] = useState(initialProperty?.locality || APPROVED_STATIONS[0].locationId);
  const [subLocation, setSubLocation] = useState(initialProperty?.subLocation || '');
  const [address, setAddress] = useState(initialProperty?.address || '');

  // Pricing
  const [price, setPrice] = useState(initialProperty?.price || '');
  const [priceDisplay, setPriceDisplay] = useState(initialProperty?.priceDisplay || '');
  const [pricePerSqft, setPricePerSqft] = useState(initialProperty?.pricePerSqft || '');
  const [monthlyRent, setMonthlyRent] = useState(initialProperty?.monthlyRent || '');
  const [depositAmount, setDepositAmount] = useState(initialProperty?.depositAmount || '');
  const [leaseTerm, setLeaseTerm] = useState(initialProperty?.leaseTerm || '');

  // Dimensions & Specs
  const [areaSqFt, setAreaSqFt] = useState(initialProperty?.areaSqFt || '');
  const [areaUnit, setAreaUnit] = useState(initialProperty?.areaUnit || 'sq.ft');
  const [bedrooms, setBedrooms] = useState(initialProperty?.bedrooms?.toString() || '2');
  const [bathrooms, setBathrooms] = useState(initialProperty?.bathrooms?.toString() || '2');
  const [furnishing, setFurnishing] = useState(initialProperty?.furnishing || 'Unfurnished');
  const [possessionStatus, setPossessionStatus] = useState(initialProperty?.possessionStatus || 'Ready to Move');
  const [roadAccess, setRoadAccess] = useState(initialProperty?.roadAccess || '');
  const [commercialUsage, setCommercialUsage] = useState(initialProperty?.commercialUsage || '');
  const [societyName, setSocietyName] = useState(initialProperty?.societyName || '');

  // Description & Features
  const [description, setDescription] = useState(initialProperty?.description || '');
  const [selectedFeatures, setSelectedFeatures] = useState(initialProperty?.features || []);
  const [customFeature, setCustomFeature] = useState('');

  // Status & Governance
  const normalizeInitialStatus = (s) => {
    if (!s) return 'available';
    if (s === 'published' || s === 'available') return 'available';
    if (s === 'sold' || s === 'sold_out') return 'sold_out';
    if (s === 'archived' || s === 'rented' || s === 'unavailable') return 'archived';
    if (s === 'draft') return 'draft';
    return 'available';
  };
  const [status, setStatus] = useState(initialProperty?.status ? normalizeInitialStatus(initialProperty.status) : 'available');
  const [featured, setFeatured] = useState(Boolean(initialProperty?.featured));
  const [isVerified, setIsVerified] = useState(Boolean(initialProperty?.isVerified));
  const [internalNotes, setInternalNotes] = useState(initialProperty?.internalNotes || '');

  // Media / Gallery
  const [coverImage, setCoverImage] = useState(
    initialProperty?.image ||
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
  );
  const [gallery, setGallery] = useState(
    initialProperty?.gallery && initialProperty.gallery.length > 0
      ? initialProperty.gallery
      : [
          initialProperty?.image ||
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        ]
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [errors, setErrors] = useState({});

  // Categorization helpers
  const isPlot = category.includes('plot') || category.includes('land') || transactionType === 'plots-land';
  const isCommercial =
    category.startsWith('commercial') ||
    category.includes('shop') ||
    category.includes('office') ||
    transactionType === 'commercial';
  const isRental = transactionType === 'rent' || category.includes('rent');
  const isLease = transactionType === 'lease' || category.includes('lease');
  const isHeavyDeposit = category.includes('heavy') || transactionType === 'heavy-deposit';
  const isRedevelopment = category.includes('redevelopment') || transactionType === 'redevelopment';
  const showLivingSpecs = !isPlot && !isCommercial && !isRedevelopment;

  // Auto-adjust default area unit
  useEffect(() => {
    if (isPlot && areaUnit === 'sq.ft') {
      setAreaUnit('guntha');
    } else if (!isPlot && areaUnit === 'guntha') {
      setAreaUnit('sq.ft');
    }
  }, [isPlot, areaUnit]);

  // Toggle amenity tag
  const toggleFeature = (feat) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  // Add custom amenity
  const handleAddCustomFeature = () => {
    if (customFeature.trim() && !selectedFeatures.includes(customFeature.trim())) {
      setSelectedFeatures((prev) => [...prev, customFeature.trim()]);
      setCustomFeature('');
    }
  };

  // Upload image file via backend API
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const uploadedUrls = [];
    const uploadErrors = [];

    for (const file of files) {
      try {
        const res = await uploadPropertyImage(file);
        if (res && res.url) {
          uploadedUrls.push(res.url);
        }
      } catch (err) {
        uploadErrors.push(`${file.name}: ${err.message}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setGallery((prev) => {
        // If current gallery has only placeholder, replace with uploaded
        const isDefaultPlaceholder =
          prev.length === 1 && prev[0].includes('photo-1545324418-cc1a3fa10c00');
        const nextGallery = isDefaultPlaceholder ? uploadedUrls : [...prev, ...uploadedUrls];
        if (!coverImage || isDefaultPlaceholder) {
          setCoverImage(uploadedUrls[0]);
        }
        return nextGallery;
      });
      setUploadSuccess(`Successfully stored ${uploadedUrls.length} property photo(s) on server.`);
    }

    if (uploadErrors.length > 0) {
      setUploadError(uploadErrors.join(' | '));
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and drop image upload
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith('image/')
    );
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const uploadedUrls = [];
    const uploadErrors = [];

    for (const file of files) {
      try {
        const res = await uploadPropertyImage(file);
        if (res && res.url) {
          uploadedUrls.push(res.url);
        }
      } catch (err) {
        uploadErrors.push(`${file.name}: ${err.message}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setGallery((prev) => {
        const isDefaultPlaceholder =
          prev.length === 1 && prev[0].includes('photo-1545324418-cc1a3fa10c00');
        const nextGallery = isDefaultPlaceholder ? uploadedUrls : [...prev, ...uploadedUrls];
        if (!coverImage || isDefaultPlaceholder) {
          setCoverImage(uploadedUrls[0]);
        }
        return nextGallery;
      });
      setUploadSuccess(`Successfully stored ${uploadedUrls.length} property photo(s) on server.`);
    }

    if (uploadErrors.length > 0) {
      setUploadError(uploadErrors.join(' | '));
    }

    setIsUploading(false);
  };

  // Add image URL manually to gallery
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setGallery((prev) => {
        const isDefaultPlaceholder =
          prev.length === 1 && prev[0].includes('photo-1545324418-cc1a3fa10c00');
        const nextGallery = isDefaultPlaceholder ? [newImageUrl.trim()] : [...prev, newImageUrl.trim()];
        if (!coverImage || isDefaultPlaceholder) {
          setCoverImage(newImageUrl.trim());
        }
        return nextGallery;
      });
      setNewImageUrl('');
    }
  };

  // Reorder images
  const moveImage = (index, delta) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= gallery.length) return;
    const updated = [...gallery];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setGallery(updated);
  };

  // Remove image from gallery
  const handleRemoveImage = (indexToRemove) => {
    const updated = gallery.filter((_, idx) => idx !== indexToRemove);
    setGallery(updated);
    if (coverImage === gallery[indexToRemove]) {
      setCoverImage(updated[0] || '');
    }
  };

  // Validation
  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Property title is required';
    if (!category) errs.category = 'Property category is required';
    if (!transactionType) errs.transactionType = 'Transaction type is required';
    if (!locality) errs.locality = 'Main location is required';

    if (!price.trim() && !monthlyRent.trim() && !depositAmount.trim()) {
      errs.price = 'Please specify asking price, monthly rent, or deposit amount';
    }

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstError = document.querySelector('.error-indicator');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});

    const payload = {
      title: title.trim(),
      category,
      transactionType,
      locality,
      subLocation: subLocation.trim() || locality,
      address: address.trim() || '',
      price: price.trim() || (monthlyRent ? `${monthlyRent} / mo` : depositAmount ? `${depositAmount} Deposit` : 'Price on Request'),
      priceDisplay: priceDisplay.trim() || price.trim() || (monthlyRent ? `${monthlyRent} / mo` : 'Price on Request'),
      pricePerSqft: pricePerSqft.trim() || null,
      monthlyRent: monthlyRent.trim() || null,
      depositAmount: depositAmount.trim() || null,
      leaseTerm: leaseTerm.trim() || null,
      areaSqFt: areaSqFt ? Number(areaSqFt) : null,
      areaDisplay: areaSqFt ? `${areaSqFt} ${areaUnit}` : null,
      areaUnit,
      bedrooms: !isPlot && bedrooms !== 'none' ? Number(bedrooms) : null,
      bathrooms: !isPlot && bathrooms !== 'none' ? Number(bathrooms) : null,
      furnishing: !isPlot ? furnishing : null,
      possessionStatus,
      roadAccess: isPlot && roadAccess ? roadAccess.trim() : null,
      commercialUsage: isCommercial && commercialUsage ? commercialUsage.trim() : null,
      societyName: isRedevelopment && societyName ? societyName.trim() : null,
      image: coverImage || gallery[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      gallery: gallery.length > 0 ? gallery : [coverImage],
      features: selectedFeatures,
      description: description.trim(),
      status,
      featured,
      isVerified,
      internalNotes: internalNotes.trim(),
      isDemo: false, // Explicit owner listing
    };

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* Form Top Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-stone shadow-sm sticky top-20 z-20 backdrop-blur-md">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-navy transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Inventory</span>
          </button>
          <h2 className="font-serif text-xl sm:text-2xl text-navy font-bold leading-tight">
            {isEditing ? `Edit: ${initialProperty.title}` : 'Create New Property Listing'}
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone text-charcoal hover:bg-ivory text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow disabled:opacity-75"
          >
            <Save className="w-4 h-4 text-white" />
            <span>{isSaving ? 'Saving Listing...' : isEditing ? 'Save Changes' : 'Publish / Create'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Core Identification & Categorization */}
      <div className="bg-white rounded-2xl border border-stone p-5 sm:p-7 shadow-xs space-y-5">
        <h3 className="font-serif text-lg text-navy font-bold flex items-center gap-2 border-b border-stone/60 pb-3">
          <Building2 className="w-5 h-5 text-royal" />
          <span>1. Property Title & Categorization</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Property Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Palm Meadows 2 BHK Ready Resale Apartment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full bg-white border ${
                errors.title ? 'border-rose-400 ring-1 ring-rose-300 error-indicator' : 'border-stone'
              } rounded-xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors`}
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Property Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Transaction Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
            >
              <option value="buy">Buy / Sale</option>
              <option value="rent">Rent Out</option>
              <option value="lease">Lease</option>
              <option value="heavy-deposit">Heavy Deposit</option>
              <option value="plots-land">Plots & Land</option>
              <option value="commercial">Commercial</option>
              <option value="development">Development / Joint Development</option>
              <option value="redevelopment">Redevelopment</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: Location & Address */}
      <div className="bg-white rounded-2xl border border-stone p-5 sm:p-7 shadow-xs space-y-5">
        <h3 className="font-serif text-lg text-navy font-bold flex items-center gap-2 border-b border-stone/60 pb-3">
          <MapPin className="w-5 h-5 text-royal" />
          <span>2. Service Corridor & Address</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Corridor Station Area <span className="text-rose-500">*</span>
            </label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
            >
              {APPROVED_STATIONS.map((station) => (
                <option key={station.locationId} value={station.locationId}>
                  {station.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Locality / Micro-Market Name
            </label>
            <input
              type="text"
              placeholder="e.g. Virar West, Bolinj Agashi Road"
              value={subLocation}
              onChange={(e) => setSubLocation(e.target.value)}
              className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Complete Property Address <span className="text-muted font-normal">(Approved for Public Display)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Flat 302, Wing-A, Gokul Heights, Station Road, Vasai West"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Financial Pricing & Commercials */}
      <div className="bg-white rounded-2xl border border-stone p-5 sm:p-7 shadow-xs space-y-5">
        <h3 className="font-serif text-lg text-navy font-bold flex items-center gap-2 border-b border-stone/60 pb-3">
          <IndianRupee className="w-5 h-5 text-royal" />
          <span>3. Pricing & Terms</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(!isRental && !isHeavyDeposit) && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Asking Price
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹52.00 Lakh"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Display Price Format
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹52.00 Lakh (Negotiable)"
                  value={priceDisplay}
                  onChange={(e) => setPriceDisplay(e.target.value)}
                  className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Price / Sq.Ft (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹6,800 / sq.ft"
                  value={pricePerSqft}
                  onChange={(e) => setPricePerSqft(e.target.value)}
                  className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                />
              </div>
            </>
          )}

          {(isRental || isLease) && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Monthly Rent / Lease
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹22,000 / month"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Security Deposit
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹75,000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Lease Term / Lock-in
                </label>
                <input
                  type="text"
                  placeholder="e.g. 11 Months / 3 Years"
                  value={leaseTerm}
                  onChange={(e) => setLeaseTerm(e.target.value)}
                  className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                />
              </div>
            </>
          )}

          {isHeavyDeposit && !isRental && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Heavy Deposit Amount
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹15.00 Lakh (0 Monthly Rent)"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Agreement Tenure
                </label>
                <input
                  type="text"
                  placeholder="e.g. 36 Months Registered Term"
                  value={leaseTerm}
                  onChange={(e) => setLeaseTerm(e.target.value)}
                  className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* SECTION 4: Dimensions & Specifications (Adaptive) */}
      <div className="bg-white rounded-2xl border border-stone p-5 sm:p-7 shadow-xs space-y-5">
        <h3 className="font-serif text-lg text-navy font-bold flex items-center gap-2 border-b border-stone/60 pb-3">
          <Layers className="w-5 h-5 text-royal" />
          <span>4. Dimensions & Specifications</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Area Value
            </label>
            <input
              type="number"
              placeholder="e.g. 680"
              value={areaSqFt}
              onChange={(e) => setAreaSqFt(e.target.value)}
              className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Measurement Unit
            </label>
            <select
              value={areaUnit}
              onChange={(e) => setAreaUnit(e.target.value)}
              className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
            >
              <option value="sq.ft">Square Feet (sq.ft)</option>
              <option value="guntha">Guntha (33 ft × 33 ft)</option>
              <option value="acre">Acres (40 Gunthas)</option>
              <option value="sq.mtr">Square Metres</option>
              <option value="sq.yard">Square Yards</option>
              <option value="bigha">Bigha</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Possession Status
            </label>
            <select
              value={possessionStatus}
              onChange={(e) => setPossessionStatus(e.target.value)}
              className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
            >
              <option value="Ready to Move">Ready to Move</option>
              <option value="Under Construction">Under Construction</option>
              <option value="Immediate Possession">Immediate Possession</option>
              <option value="Possession in 6 Months">Possession in 6 Months</option>
              <option value="Possession in 1 Year">Possession in 1 Year</option>
            </select>
          </div>

          {showLivingSpecs && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Bedrooms / BHK
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                >
                  <option value="1">1 BHK / 1 RK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4+ BHK / Villa</option>
                  <option value="none">Not Applicable</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Bathrooms
                </label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                >
                  <option value="1">1 Bathroom</option>
                  <option value="2">2 Bathrooms</option>
                  <option value="3">3 Bathrooms</option>
                  <option value="4">4+ Bathrooms</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Furnishing
                </label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                >
                  <option value="Unfurnished">Unfurnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                </select>
              </div>
            </>
          )}

          {isPlot && (
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Road Access / Frontage / Sanction Status
              </label>
              <input
                type="text"
                placeholder="e.g. 40 ft DP road touch, Collector sanctioned, demarcation complete"
                value={roadAccess}
                onChange={(e) => setRoadAccess(e.target.value)}
                className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
              />
            </div>
          )}

          {isCommercial && (
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Commercial Floor / Frontage / Approved Usage
              </label>
              <input
                type="text"
                placeholder="e.g. Ground floor high-footfall frontage, ideal for retail bank or clinic"
                value={commercialUsage}
                onChange={(e) => setCommercialUsage(e.target.value)}
                className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
              />
            </div>
          )}

          {isRedevelopment && (
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Housing Society Name / Existing Units Scope
              </label>
              <input
                type="text"
                placeholder="e.g. Sai Krupa CHS (32 Members, 35 Years Old)"
                value={societyName}
                onChange={(e) => setSocietyName(e.target.value)}
                className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5: Image Management (Direct Uploads & Persistent Storage) */}
      <div className="bg-white rounded-2xl border border-stone p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone/60 pb-3">
          <h3 className="font-serif text-lg text-navy font-bold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-royal" />
            <span>5. Property Images & Cover Photo</span>
          </h3>
          <span className="text-xs text-muted font-medium">
            {gallery.length} photo{gallery.length === 1 ? '' : 's'} attached
          </span>
        </div>

        {uploadError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1">
              <span className="font-bold">Upload Notice:</span> {uploadError}
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-rose-500 hover:text-rose-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {uploadSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="flex-1">{uploadSuccess}</span>
            <button
              type="button"
              onClick={() => setUploadSuccess(null)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-4">
          {/* Drag & Drop Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-royal bg-royal/5 ring-4 ring-royal/10'
                : 'border-stone hover:border-navy hover:bg-ivory/50 bg-stone/5'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-royal/10 text-royal flex items-center justify-center mb-1">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-royal" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>

              <div className="text-sm font-bold text-navy">
                {isUploading ? 'Uploading and Storing Image on Server...' : 'Click to Upload Property Photos or Drag & Drop'}
              </div>
              <p className="text-xs text-muted max-w-sm">
                Supports JPEG, PNG, and WebP (up to 5MB each). Photos are stored securely on the Tomar Enterprises server.
              </p>

              <button
                type="button"
                disabled={isUploading}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-2 px-4 py-2 bg-navy text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-navy-900 transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Browse Files</span>
              </button>
            </div>
          </div>

          {/* Or Add from Image URL */}
          <div className="pt-2 border-t border-stone/60">
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Or attach by web Image URL:
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="url"
                placeholder="Paste Image URL (e.g. https://images.unsplash.com/...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImage();
                  }
                }}
                className="flex-1 bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-5 py-2.5 bg-stone/70 hover:bg-navy hover:text-white text-charcoal text-xs font-bold uppercase tracking-wider rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Attach URL</span>
              </button>
            </div>
          </div>

          {/* Gallery Grid with Reordering & Cover Selection */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Listing Image Gallery ({gallery.length})
              </span>
              <span className="text-[11px] text-muted">
                Tip: Click "Cover" to set primary display image. Use arrows to reorder.
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.map((imgUrl, idx) => {
                const isCover = imgUrl === coverImage;
                return (
                  <div
                    key={`${imgUrl}-${idx}`}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all group bg-white shadow-xs ${
                      isCover
                        ? 'border-brandRed shadow-md ring-2 ring-brandRed/20'
                        : 'border-stone hover:border-navy'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Photo ${idx + 1}`}
                      className="w-full aspect-[4/3] object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80';
                      }}
                    />

                    {/* Cover badge */}
                    {isCover && (
                      <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-brandRed text-white font-bold text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>Cover</span>
                      </div>
                    )}

                    {/* Order index */}
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white font-mono text-[10px]">
                      #{idx + 1}
                    </div>

                    {/* Hover actions overlay */}
                    <div className="absolute inset-0 bg-navy/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveImage(idx, -1)}
                            className="p-1.5 rounded-lg bg-white/90 text-navy hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move Earlier"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === gallery.length - 1}
                            onClick={() => moveImage(idx, 1)}
                            className="p-1.5 rounded-lg bg-white/90 text-navy hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move Later"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-sm"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => setCoverImage(imgUrl)}
                          className="w-full py-1.5 rounded-lg bg-white text-navy hover:bg-ivory text-xs font-bold uppercase tracking-wider text-center shadow transition-colors"
                        >
                          Set as Cover
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Description & Amenities */}
      <div className="bg-white rounded-2xl border border-stone p-5 sm:p-7 shadow-xs space-y-5">
        <h3 className="font-serif text-lg text-navy font-bold flex items-center gap-2 border-b border-stone/60 pb-3">
          <FileText className="w-5 h-5 text-royal" />
          <span>6. Description & Amenities</span>
        </h3>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
            Detailed Description / Overview
          </label>
          <textarea
            rows={4}
            placeholder="Describe the unit layout, natural light, nearby railway/highway connectivity, water availability, and sanctioned documents..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white border border-stone rounded-xl px-4 py-3 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
            Selected Amenities / Features
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_AMENITIES.map((amenity) => {
              const isSelected = selectedFeatures.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleFeature(amenity)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-navy text-white border-navy shadow-xs'
                      : 'bg-ivory/60 text-charcoal border-stone hover:bg-stone/60'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-brandRed" />}
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-2 max-w-md">
            <input
              type="text"
              placeholder="Add custom feature..."
              value={customFeature}
              onChange={(e) => setCustomFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomFeature();
                }
              }}
              className="flex-1 bg-white border border-stone rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
            />
            <button
              type="button"
              onClick={handleAddCustomFeature}
              className="px-3.5 py-2 bg-stone/70 hover:bg-navy hover:text-white text-charcoal text-xs font-bold rounded-xl transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 7: Status, Governance & Internal Notes (Private to Owner) */}
      <div className="bg-white rounded-2xl border border-stone p-5 sm:p-7 shadow-xs space-y-5">
        <h3 className="font-serif text-lg text-navy font-bold flex items-center gap-2 border-b border-stone/60 pb-3">
          <Star className="w-5 h-5 text-brandRed" />
          <span>7. Publishing Status & Private Owner Notes</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Publication Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white border border-stone rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors font-semibold"
            >
              <option value="available">Available (Live on Website - Active Slot)</option>
              <option value="draft">Draft (Private Owner Review - Active Slot)</option>
              <option value="sold_out">Sold Out (Preserved, Inactive)</option>
              <option value="archived">Archived (Preserved, Inactive)</option>
            </select>
          </div>

          <div className="flex items-center gap-4 pt-6">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 text-brandRed rounded border-stone focus:ring-royal"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Feature on Homepage
              </span>
            </label>
          </div>

          <div className="flex items-center gap-4 pt-6">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 text-brandRed rounded border-stone focus:ring-royal"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Mark Verified Title
              </span>
            </label>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Private Owner Notes <span className="text-muted font-normal">(Never Visible to Public Visitors)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Landlord expected minimum price is ₹48L. Contact Mr. Sharma at 98200... Keys with watchman."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="w-full bg-amber-50/40 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl border border-stone text-charcoal hover:bg-ivory text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-75"
        >
          <Save className="w-4 h-4 text-white" />
          <span>{isSaving ? 'Saving Listing...' : isEditing ? 'Save Changes' : 'Publish / Create Property'}</span>
        </button>
      </div>
    </form>
  );
}
