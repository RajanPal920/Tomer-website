import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Building2,
  CheckCircle2,
  FileEdit,
  Clock,
  Eye,
  Trash2,
  Settings,
  LogOut,
  Search,
  Shield,
  MessageSquare,
  Tag,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  X,
  Download,
  Home,
  Layers,
  FileSpreadsheet,
  ShieldAlert,
} from 'lucide-react';
import BrandLogo from '../BrandLogo';
import { APPROVED_STATIONS } from '../../data/locations';
import OwnerPropertyForm from './OwnerPropertyForm';
import {
  fetchOwnerInventory,
  fetchListingStats,
  createOwnerListing,
  updateOwnerListing,
  deleteOwnerListing,
  fetchOwnerEnquiries,
  updateEnquiryStatus,
  fetchWebsiteSettings,
  updateWebsiteSettings,
  changeOwnerCredentials,
} from '../../services/propertyStore';
import { logout, login } from '../../services/authService';

export default function OwnerDashboard({ onNavigate, user }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview | add | all | published | drafts | enquiries | sold | settings
  const [properties, setProperties] = useState([]);
  const [listingCapacity, setListingCapacity] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [settings, setSettings] = useState({ showDemoInventory: true });
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Property being edited in form (null = adding new, object = editing)
  const [editingProperty, setEditingProperty] = useState(null);
  const [isSavingProperty, setIsSavingProperty] = useState(false);

  // Re-authentication modal state (retains unsaved form changes on session expiry)
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState('');
  const [isReauthing, setIsReauthing] = useState(false);

  // Filter & Search inside Dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocality, setFilterLocality] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | price-desc | price-asc | title

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15); // 10 | 15 | 25 | 50 | 100

  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load dashboard data from backend
  const loadDashboardData = async () => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const [inventoryRes, enquiriesData, settingsData] = await Promise.all([
        fetchOwnerInventory(),
        fetchOwnerEnquiries().catch(() => []),
        fetchWebsiteSettings().catch(() => ({ showDemoInventory: true })),
      ]);

      setProperties(inventoryRes?.properties || []);
      setListingCapacity(inventoryRes?.capacity || null);
      setEnquiries(enquiriesData || []);
      setSettings(settingsData || { showDemoInventory: true });
    } catch (err) {
      console.error('[DASHBOARD ERROR]', err);
      if (err.statusCode === 401 || err.code === 'UNAUTHENTICATED') {
        setErrorNotice('Your owner session has expired. Please sign in to access management functions.');
        setShowReauthModal(true);
      } else {
        setErrorNotice(err.message || 'Failed to fetch inventory from server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterLocality, filterCategory, filterStatus, searchQuery, sortBy, pageSize]);

  // Compute live data-driven metrics across full portfolio
  const stats = useMemo(() => {
    const total = properties.length;
    const available = properties.filter((p) => p.status === 'published' || p.status === 'available').length;
    const drafts = properties.filter((p) => p.status === 'draft').length;
    const soldOut = properties.filter((p) => p.status === 'sold' || p.status === 'sold_out').length;
    const archived = properties.filter(
      (p) => p.status === 'archived' || p.status === 'rented' || p.status === 'unavailable'
    ).length;
    const active = available + drafts;

    const residential = properties.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      return (
        cat.includes('flat') ||
        cat.includes('residential') ||
        cat.includes('house') ||
        cat.includes('villa') ||
        cat.includes('bungalow')
      );
    }).length;

    const commercial = properties.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      return (
        cat.includes('commercial') ||
        cat.includes('shop') ||
        cat.includes('office') ||
        cat.includes('showroom')
      );
    }).length;

    const plotsAndLand = properties.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const tt = (p.transactionType || '').toLowerCase();
      return cat.includes('plot') || cat.includes('land') || tt.includes('plot');
    }).length;

    const rental = properties.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const tt = (p.transactionType || '').toLowerCase();
      return tt === 'rent' || tt === 'lease' || cat.includes('rent') || cat.includes('lease') || cat.includes('heavy');
    }).length;

    const newEnquiries = enquiries.filter((e) => e.status === 'new').length;

    return {
      total,
      available,
      drafts,
      soldOut,
      archived,
      active,
      residential,
      commercial,
      plotsAndLand,
      rental,
      newEnquiries,
      totalEnquiries: enquiries.length,
    };
  }, [properties, enquiries]);

  // Filtered and Sorted properties
  const filteredProperties = useMemo(() => {
    const result = properties.filter((p) => {
      // Tab filter
      if (activeTab === 'available' && !(p.status === 'published' || p.status === 'available')) return false;
      if (activeTab === 'draft' && p.status !== 'draft') return false;
      if (activeTab === 'sold_out' && !(p.status === 'sold' || p.status === 'sold_out')) return false;
      if (activeTab === 'archived' && !(p.status === 'archived' || p.status === 'rented' || p.status === 'unavailable')) return false;

      // Status dropdown filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'available' && !(p.status === 'published' || p.status === 'available')) return false;
        if (filterStatus === 'draft' && p.status !== 'draft') return false;
        if (filterStatus === 'sold_out' && !(p.status === 'sold' || p.status === 'sold_out')) return false;
        if (filterStatus === 'archived' && !(p.status === 'archived' || p.status === 'rented' || p.status === 'unavailable')) return false;
      }

      // Locality filter
      if (filterLocality !== 'all' && p.locality !== filterLocality) return false;

      // Category filter
      if (filterCategory !== 'all') {
        const cat = (p.category || '').toLowerCase();
        const tt = (p.transactionType || '').toLowerCase();
        if (filterCategory === 'residential' && !(cat.includes('flat') || cat.includes('residential') || cat.includes('villa') || cat.includes('house'))) return false;
        if (filterCategory === 'commercial' && !(cat.includes('commercial') || cat.includes('shop') || cat.includes('office'))) return false;
        if (filterCategory === 'plots-land' && !(cat.includes('plot') || cat.includes('land') || tt.includes('plot'))) return false;
        if (filterCategory === 'rent-lease' && !(tt === 'rent' || tt === 'lease' || cat.includes('rent') || cat.includes('lease') || cat.includes('heavy'))) return false;
        if (filterCategory === 'redevelopment' && !(cat.includes('redevelopment') || tt === 'redevelopment')) return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = (p.title || '').toLowerCase().includes(query);
        const matchLoc = (p.locality || '').toLowerCase().includes(query);
        const matchCat = (p.category || '').toLowerCase().includes(query);
        const matchId = (p.id || '').toLowerCase().includes(query);
        const matchPrice = (p.priceDisplay || p.price || '').toLowerCase().includes(query);
        if (!matchTitle && !matchLoc && !matchCat && !matchId && !matchPrice) return false;
      }

      return true;
    });

    // Sort result
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || a.updatedAt || 0) - new Date(b.createdAt || b.updatedAt || 0);
      }
      if (sortBy === 'price-desc') {
        return (Number(b.priceNumber) || 0) - (Number(a.priceNumber) || 0);
      }
      if (sortBy === 'price-asc') {
        return (Number(a.priceNumber) || 0) - (Number(b.priceNumber) || 0);
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return result;
  }, [properties, activeTab, filterStatus, filterLocality, filterCategory, searchQuery, sortBy]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / (pageSize || 15)));
  const paginatedProperties = useMemo(() => {
    if (pageSize === 0) return filteredProperties;
    const start = (currentPage - 1) * pageSize;
    return filteredProperties.slice(start, start + pageSize);
  }, [filteredProperties, currentPage, pageSize]);

  // Handle Save (Create or Update)
  const handleSaveProperty = async (propertyData) => {
    setIsSavingProperty(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      if (editingProperty?.id) {
        // Update existing property (permitted even if at listing limit)
        const updated = await updateOwnerListing(editingProperty.id, propertyData);
        setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setSuccessNotice(`Property "${updated.title}" successfully updated!`);
      } else {
        // Create new property (checked against MAX_PROPERTY_LISTINGS)
        const created = await createOwnerListing(propertyData);
        setProperties((prev) => [created, ...prev]);
        setSuccessNotice(`New property "${created.title}" successfully created and saved!`);
      }

      // Refresh capacity in background
      fetchListingStats().then((c) => c && setListingCapacity(c)).catch(() => {});

      setEditingProperty(null);
      setActiveTab('all');
    } catch (err) {
      if (err.statusCode === 401 || err.code === 'UNAUTHENTICATED') {
        setErrorNotice(
          'Your owner session has expired or is invalid. Please sign in below to save your changes — your edits have been preserved.'
        );
        setShowReauthModal(true);
      } else if (
        err.code === 'ACTIVE_LISTING_LIMIT_REACHED' ||
        err.code === 'PROPERTY_LIMIT_REACHED' ||
        err.statusCode === 409
      ) {
        setErrorNotice(
          err.message ||
            'Active listing limit reached (30 / 30). You must mark an existing property Sold Out or Archive it before adding a new active listing.'
        );
        if (err.capacity) {
          setListingCapacity(err.capacity);
        }
      } else {
        setErrorNotice(err.message || 'Failed to save property listing');
      }
    } finally {
      setIsSavingProperty(false);
    }
  };

  // Handle Status Toggle (Quick change / status transitions) with confirmation
  const handleQuickStatusChange = async (property, newStatus) => {
    const actionDesc =
      newStatus === 'sold_out'
        ? 'mark as SOLD OUT (frees 1 active listing slot)'
        : newStatus === 'archived'
        ? 'ARCHIVE (preserved in records, removed from public view)'
        : newStatus === 'available'
        ? 'RESTORE to AVAILABLE (consumes 1 active listing slot)'
        : newStatus === 'draft'
        ? 'move to DRAFT (counts toward 30 active listings limit)'
        : `change status to ${newStatus.toUpperCase()}`;

    const confirmed = window.confirm(
      `Confirm Listing Status Change:\n\nAre you sure you want to ${actionDesc} for:\n"${property.title}"?`
    );
    if (!confirmed) return;

    setErrorNotice(null);
    setSuccessNotice(null);
    try {
      const updated = await updateOwnerListing(property.id, { status: newStatus });
      setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      const readable =
        newStatus === 'sold_out'
          ? 'SOLD OUT'
          : newStatus === 'available'
          ? 'AVAILABLE'
          : newStatus === 'draft'
          ? 'DRAFT'
          : newStatus.toUpperCase();
      setSuccessNotice(`Property "${property.title}" status successfully updated to ${readable}.`);
      // Refresh capacity in background
      fetchListingStats().then((c) => c && setListingCapacity(c)).catch(() => {});
    } catch (err) {
      if (
        err.code === 'ACTIVE_LISTING_LIMIT_REACHED' ||
        err.code === 'PROPERTY_LIMIT_REACHED' ||
        err.statusCode === 409
      ) {
        setErrorNotice(
          err.message ||
            'Cannot activate listing: Active listing limit (30 / 30) reached. Mark another property Sold Out or Archive it before restoring this property.'
        );
        if (err.capacity) {
          setListingCapacity(err.capacity);
        }
      } else {
        setErrorNotice(err.message || 'Failed to update property status');
      }
    }
  };

  // Handle Delete with Safety Warning
  const handleDeleteProperty = async (property) => {
    const confirmed = window.confirm(
      `⚠️ PERMANENT DELETION WARNING:\n\nAre you sure you want to permanently delete "${property.title}" (Ref: ${property.id})?\n\nThis will remove the property record and its files from the server. This action CANNOT be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteOwnerListing(property.id);
      setProperties((prev) => prev.filter((p) => p.id !== property.id));
      setSuccessNotice(`Property "${property.title}" permanently removed.`);
    } catch (err) {
      setErrorNotice(err.message || 'Failed to delete property listing');
    }
  };

  // Handle Enquiry Status change
  const handleEnquiryStatusChange = async (enquiryId, newStatus) => {
    try {
      await updateEnquiryStatus(enquiryId, newStatus);
      setEnquiries((prev) =>
        prev.map((e) => (e.id === enquiryId ? { ...e, status: newStatus } : e))
      );
    } catch (err) {
      console.error('Failed to update enquiry status:', err);
    }
  };

  // Handle Settings Toggle (e.g. demo inventory)
  const handleToggleDemoInventory = async () => {
    const nextVal = !settings.showDemoInventory;
    try {
      const updated = await updateWebsiteSettings({ showDemoInventory: nextVal });
      setSettings(updated);
      setSuccessNotice(
        nextVal
          ? 'Prototype demonstration inventory is now VISIBLE on website.'
          : 'Prototype demonstration inventory is now HIDDEN on website.'
      );
    } catch (err) {
      setErrorNotice(err.message || 'Failed to update settings');
    }
  };

  // Handle Owner Password Update
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordChangeStatus(null);

    if (!newPassword || newPassword.length < 8) {
      setPasswordChangeStatus({
        type: 'error',
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeStatus({
        type: 'error',
        message: 'New password and confirmation do not match.',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changeOwnerCredentials(null, newPassword);
      setPasswordChangeStatus({
        type: 'success',
        message: 'Password successfully updated! Your next login will require this new password.',
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordChangeStatus({
        type: 'error',
        message: err.message || 'Failed to update owner password.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Export / Backup Inventory (All records from server)
  const handleExportInventory = (format = 'csv') => {
    if (properties.length === 0) {
      setErrorNotice('No property records available to export.');
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(properties, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `tomar_properties_backup_${timestamp}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const headers = [
        'ID',
        'Title',
        'Category',
        'TransactionType',
        'Locality',
        'Price',
        'PriceNumber',
        'Area',
        'Status',
        'CreatedAt',
        'UpdatedAt',
        'Slug',
      ];
      const rows = properties.map((p) => [
        `"${p.id || ''}"`,
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${p.category || ''}"`,
        `"${p.transactionType || ''}"`,
        `"${p.locality || ''}"`,
        `"${p.priceDisplay || p.price || ''}"`,
        p.priceNumber || '',
        `"${p.areaDisplay || p.areaSqFt || ''}"`,
        `"${p.status || ''}"`,
        `"${p.createdAt || ''}"`,
        `"${p.updatedAt || ''}"`,
        `"${p.slug || ''}"`,
      ]);
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        encodeURIComponent([headers.join(','), ...rows.map((r) => r.join(','))].join('\n'));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvContent);
      downloadAnchor.setAttribute('download', `tomar_properties_backup_${timestamp}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    setSuccessNotice(`Complete inventory backup (${properties.length} properties) exported successfully!`);
  };

  // Logout handler
  const handleLogout = async () => {
    await logout();
    if (onNavigate) onNavigate('/');
  };

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col font-sans">
      {/* Top Navbar Header */}
      <header className="bg-navy text-white border-b border-navy-700 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="on-dark" size="default" />
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-royal-light/20 text-blue-200 border border-blue-300/30 text-xs font-bold uppercase tracking-wider">
              Owner Management {user?.username ? `• ${user.username}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {listingCapacity && (
              <div 
                className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border ${
                  listingCapacity.isAtLimit 
                    ? 'bg-rose-500/20 border-rose-400/40 text-rose-200' 
                    : (listingCapacity.active / listingCapacity.maxLimit > 0.8)
                    ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                    : 'bg-white/10 border-white/20 text-blue-100'
                }`}
                title={`Active Listings: ${listingCapacity.active} / ${listingCapacity.maxLimit} (Available + Draft listings count toward maximum 30 active listings limit)`}
              >
                <span>Active Properties:</span>
                <span className="font-bold text-white">{listingCapacity.active} / {listingCapacity.maxLimit}</span>
                <span className="text-[11px] opacity-85">({listingCapacity.remaining} slots remain)</span>
                {listingCapacity.isAtLimit && (
                  <span className="text-[10px] uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">Limit Reached</span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:text-stone-light text-xs font-semibold transition-colors"
            >
              <span>View Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-royal-light" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Alerts & Notifications */}
        {errorNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorNotice(null)}
              className="p-1 hover:bg-rose-100 rounded text-rose-600"
              aria-label="Dismiss error notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {successNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessNotice(null)}
              className="p-1 hover:bg-emerald-100 rounded text-emerald-600"
              aria-label="Dismiss success notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        {activeTab === 'add' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy">
                  {editingProperty ? 'Edit Property Listing' : 'Create New Property Listing'}
                </h1>
                <p className="text-xs text-muted mt-1">
                  Fill in title, category, pricing, locality, and images. Available listings appear immediately on the website.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingProperty(null);
                  setActiveTab('all');
                }}
                className="px-4 py-2 rounded-xl border border-stone bg-white hover:bg-ivory text-charcoal font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                Cancel & Return
              </button>
            </div>

            {/* Quota limit warning if attempting to add new property at 30 active limit */}
            {!editingProperty && listingCapacity?.isAtLimit && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-900">
                    Active Listing Limit Reached ({listingCapacity.active} / {listingCapacity.maxLimit})
                  </h4>
                  <p className="mt-0.5 text-amber-800">
                    Your account has reached the maximum allowed 30 active property listings. To add another active listing, please return to the inventory table and mark an existing property as <strong>Sold Out</strong> or <strong>Archived</strong>.
                  </p>
                </div>
              </div>
            )}

            <OwnerPropertyForm
              initialProperty={editingProperty}
              onSave={handleSaveProperty}
              onCancel={() => {
                setEditingProperty(null);
                setActiveTab('all');
              }}
              isSaving={isSavingProperty}
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Navigation Tabs Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone/80 no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'overview'
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-white border border-stone text-charcoal hover:bg-stone/40'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-royal" />
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (listingCapacity?.isAtLimit) {
                    setErrorNotice(
                      `Active listing limit reached (${listingCapacity.active} / ${listingCapacity.maxLimit}). A listing must be marked Sold Out or Archived before another active property can be added.`
                    );
                    return;
                  }
                  setEditingProperty(null);
                  setActiveTab('add');
                }}
                disabled={listingCapacity?.isAtLimit}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-colors ${
                  listingCapacity?.isAtLimit
                    ? 'bg-stone/40 text-muted cursor-not-allowed border border-stone'
                    : 'bg-brandRed hover:bg-brandRed-700 text-white'
                }`}
                title={
                  listingCapacity?.isAtLimit
                    ? 'Active property limit reached (30/30). Mark a listing Sold Out or Archive it to add new listings.'
                    : 'Add New Property'
                }
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Property</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'all'
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-white border border-stone text-charcoal hover:bg-stone/40'
                }`}
              >
                <Building2 className="w-4 h-4 text-royal" />
                <span>All ({stats.total})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('available')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'available'
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-white border border-stone text-charcoal hover:bg-stone/40'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Available ({stats.available})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('draft')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'draft'
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-white border border-stone text-charcoal hover:bg-stone/40'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Draft ({stats.drafts})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sold_out')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'sold_out'
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-white border border-stone text-charcoal hover:bg-stone/40'
                }`}
              >
                <Tag className="w-4 h-4 text-rose-500" />
                <span>Sold Out ({stats.soldOut})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('archived')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'archived'
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-white border border-stone text-charcoal hover:bg-stone/40'
                }`}
              >
                <Layers className="w-4 h-4 text-stone-dark" />
                <span>Archived ({stats.archived})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('enquiries')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'enquiries'
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-white border border-stone text-charcoal hover:bg-stone/40'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span>Enquiries ({stats.totalEnquiries})</span>
                {stats.newEnquiries > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ml-auto ${
                  activeTab === 'settings'
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-white border border-stone text-charcoal hover:bg-stone/40'
                }`}
              >
                <Settings className="w-4 h-4 text-royal" />
                <span>Settings</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Row 1: Primary Status Stat Cards */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                    Portfolio Status Overview
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    <div className="bg-white rounded-2xl border border-stone p-4.5 shadow-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                        Active Listings
                      </span>
                      <div className="text-2xl sm:text-3xl font-serif font-bold text-navy">
                        {listingCapacity ? listingCapacity.active : stats.active} <span className="text-sm font-sans text-muted">/ {listingCapacity ? listingCapacity.maxLimit : 30}</span>
                      </div>
                      <span className="text-[10px] text-muted mt-1 block">Available + Drafts</span>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone p-4.5 shadow-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                        Available Properties
                      </span>
                      <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-600">
                        {stats.available}
                      </div>
                      <span className="text-[10px] text-muted mt-1 block">Live on website</span>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone p-4.5 shadow-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                        Draft Properties
                      </span>
                      <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-600">
                        {stats.drafts}
                      </div>
                      <span className="text-[10px] text-muted mt-1 block">Counts toward limit</span>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone p-4.5 shadow-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                        Sold Out Properties
                      </span>
                      <div className="text-2xl sm:text-3xl font-serif font-bold text-rose-600">
                        {stats.soldOut}
                      </div>
                      <span className="text-[10px] text-muted mt-1 block">Frees active slot</span>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone p-4.5 shadow-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                        Archived Properties
                      </span>
                      <div className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">
                        {stats.archived}
                      </div>
                      <span className="text-[10px] text-muted mt-1 block">Preserved, inactive</span>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone p-4.5 shadow-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                        Remaining Active Slots
                      </span>
                      <div className="text-2xl sm:text-3xl font-serif font-bold text-royal">
                        {listingCapacity ? listingCapacity.remaining : Math.max(0, 30 - stats.active)}
                      </div>
                      <span className="text-[10px] text-muted mt-1 block">Slots available to add</span>
                    </div>
                  </div>
                </div>

                {/* Capacity Limit Banner */}
                {listingCapacity && (
                  <div className="bg-white rounded-2xl border border-stone p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-navy text-base">Active Properties Limit</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            listingCapacity.isAtLimit 
                              ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {listingCapacity.isAtLimit ? 'Limit Reached (30 / 30)' : `${listingCapacity.remaining} Slots Remaining`}
                          </span>
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          Active Properties: {listingCapacity.active} / {listingCapacity.maxLimit}. Available and Draft listings count toward the 30 active listings limit. Sold Out and Archived properties are preserved and do not count toward the limit.
                        </p>
                      </div>
                      <div className="text-right sm:text-right">
                        <span className="font-serif font-bold text-xl text-navy">
                          {listingCapacity.active} <span className="text-sm font-sans text-muted">/ {listingCapacity.maxLimit}</span>
                        </span>
                        <div className="text-[10px] text-muted">
                          {listingCapacity.remaining} slots remaining
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-stone/40 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          listingCapacity.isAtLimit
                            ? 'bg-rose-500'
                            : (listingCapacity.active / listingCapacity.maxLimit > 0.8)
                            ? 'bg-amber-500'
                            : 'bg-royal'
                        }`}
                        style={{
                          width: `${Math.min(100, (listingCapacity.active / listingCapacity.maxLimit) * 100)}%`,
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-muted mt-2 pt-2 border-t border-stone/50 gap-2">
                      <span>To free a slot: mark an active listing Sold Out or Archive it.</span>
                      <span className="font-mono text-[10px]">Configured via MAX_ACTIVE_LISTINGS (default: 30)</span>
                    </div>
                  </div>
                )}

                {/* Row 2: Asset Class & Category Breakdown */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                    Inventory by Asset Category
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-white rounded-2xl border border-stone p-4 shadow-xs flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-50 text-royal">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xl font-serif font-bold text-navy">{stats.residential}</div>
                        <span className="text-[11px] text-muted font-medium">Residential Flats & Homes</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone p-4 shadow-xs flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xl font-serif font-bold text-navy">{stats.commercial}</div>
                        <span className="text-[11px] text-muted font-medium">Commercial Retail & Offices</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone p-4 shadow-xs flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xl font-serif font-bold text-navy">{stats.plotsAndLand}</div>
                        <span className="text-[11px] text-muted font-medium">NA Plots & Land Parcels</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone p-4 shadow-xs flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xl font-serif font-bold text-navy">{stats.rental}</div>
                        <span className="text-[11px] text-muted font-medium">Rental & Lease Properties</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Banner */}
                <div className="bg-navy rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-modal">
                  <div className="relative z-10 max-w-xl">
                    <span className="px-3 py-1 rounded-full bg-brandRed/20 text-brandRed text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                      Exclusive Administration
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight mb-2">
                      Ready to onboard a new property?
                    </h2>
                    <p className="text-xs sm:text-sm text-white leading-relaxed">
                      Create and publish residential flats, commercial retail, NA plots, or redevelopment projects. Available properties immediately appear on the public website with verified titles.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 relative z-10">
                    <button
                      type="button"
                      onClick={() => handleExportInventory('csv')}
                      className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-colors"
                    >
                      <Download className="w-4 h-4 text-royal-light" />
                      <span>Backup Inventory</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (listingCapacity?.isAtLimit) {
                          setErrorNotice(
                            `Active listing limit reached (${listingCapacity.active} / ${listingCapacity.maxLimit}). A listing must be marked Sold Out or Archived before another active property can be added.`
                          );
                          return;
                        }
                        setEditingProperty(null);
                        setActiveTab('add');
                      }}
                      disabled={listingCapacity?.isAtLimit}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-transform ${
                        listingCapacity?.isAtLimit
                          ? 'bg-stone/40 text-stone-dark border border-white/20 cursor-not-allowed opacity-75'
                          : 'bg-brandRed hover:bg-brandRed-700 text-white hover:scale-[1.02]'
                      }`}
                      title={
                        listingCapacity?.isAtLimit
                          ? 'Active listing limit (30/30) reached'
                          : 'Create Property Listing'
                      }
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{listingCapacity?.isAtLimit ? 'Limit Reached (30/30)' : 'Create Property Listing'}</span>
                    </button>
                  </div>
                </div>

                {/* Recent Properties Quick View */}
                <div className="bg-white rounded-2xl border border-stone p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-stone/60 pb-3 mb-4">
                    <h3 className="font-serif text-lg text-navy font-bold">Recent Inventory Updates</h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className="text-xs font-bold text-royal hover:text-navy uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                    >
                      <span>View All ({stats.total})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {properties.length === 0 ? (
                    <div className="text-center py-10 text-muted text-xs">
                      No properties created yet. Click "Add Property" to create your first listing.
                    </div>
                  ) : (
                    <div className="divide-y divide-stone/50">
                      {properties.slice(0, 5).map((prop) => (
                        <div key={prop.id} className="py-3.5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={prop.image}
                              alt={prop.title}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-navy truncate">{prop.title}</h4>
                              <p className="text-xs text-muted">
                                {prop.category} &bull; {prop.locality} &bull;{' '}
                                <span className="font-semibold text-charcoal">{prop.priceDisplay || prop.price}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                prop.status === 'published' || prop.status === 'available'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : prop.status === 'draft'
                                  ? 'bg-amber-100 text-amber-800'
                                  : prop.status === 'sold' || prop.status === 'sold_out'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-stone/80 text-charcoal'
                              }`}
                            >
                              {prop.status === 'published' || prop.status === 'available'
                                ? 'Available'
                                : prop.status === 'draft'
                                ? 'Draft'
                                : prop.status === 'sold' || prop.status === 'sold_out'
                                ? 'Sold Out'
                                : 'Archived'}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingProperty(prop);
                                setActiveTab('add');
                              }}
                              className="p-1.5 rounded-lg border border-stone hover:bg-ivory text-muted hover:text-navy"
                              title="Edit Listing"
                            >
                              <FileEdit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. ALL / AVAILABLE / DRAFT / SOLD OUT / ARCHIVED LISTINGS */}
            {['all', 'available', 'draft', 'sold_out', 'archived'].includes(activeTab) && (
              <div className="space-y-6 animate-fadeIn">
                {/* Search & Filter & Sorting Toolbar */}
                <div className="bg-white rounded-2xl border border-stone p-4 flex flex-col gap-3 shadow-xs">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                      <Search className="w-4 h-4 text-muted absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Search title, ref ID, category, locality..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-ivory/50 border border-stone rounded-xl pl-9 pr-3.5 py-2 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
                      />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      {/* Locality Filter */}
                      <select
                        value={filterLocality}
                        onChange={(e) => setFilterLocality(e.target.value)}
                        className="bg-white border border-stone rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal flex-1 sm:flex-none"
                      >
                        <option value="all">All Stations (Vasai to Palghar)</option>
                        {APPROVED_STATIONS.map((st) => (
                          <option key={st.locationId} value={st.locationId}>
                            {st.canonicalName}
                          </option>
                        ))}
                      </select>

                      {/* Category Filter */}
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-white border border-stone rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal flex-1 sm:flex-none"
                      >
                        <option value="all">All Categories</option>
                        <option value="residential">Residential Flats / Homes</option>
                        <option value="commercial">Commercial Shops / Offices</option>
                        <option value="plots-land">Plots & Land Parcels</option>
                        <option value="rent-lease">Rental & Leases</option>
                        <option value="redevelopment">Redevelopment Projects</option>
                      </select>

                      {/* Status Filter (When on 'all' tab) */}
                      {activeTab === 'all' && (
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="bg-white border border-stone rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal flex-1 sm:flex-none font-medium"
                        >
                          <option value="all">All Statuses</option>
                          <option value="available">Available</option>
                          <option value="draft">Draft</option>
                          <option value="sold_out">Sold Out</option>
                          <option value="archived">Archived</option>
                        </select>
                      )}

                      {/* Sort Selector */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white border border-stone rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal flex-1 sm:flex-none"
                      >
                        <option value="newest">Sort: Newest Added</option>
                        <option value="oldest">Sort: Oldest Added</option>
                        <option value="price-desc">Sort: Price (High to Low)</option>
                        <option value="price-asc">Sort: Price (Low to High)</option>
                        <option value="title">Sort: Title (A-Z)</option>
                      </select>

                      {/* Items Per Page */}
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="bg-white border border-stone rounded-xl px-2.5 py-2 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
                        title="Items per page"
                      >
                        <option value={10}>10 / page</option>
                        <option value={15}>15 / page</option>
                        <option value={25}>25 / page</option>
                        <option value={50}>50 / page</option>
                        <option value={100}>100 / page</option>
                        <option value={0}>Show All</option>
                      </select>

                      {/* Refresh button */}
                      <button
                        type="button"
                        onClick={loadDashboardData}
                        disabled={isLoading}
                        className="p-2 rounded-xl border border-stone hover:bg-ivory text-muted hover:text-navy disabled:opacity-50"
                        title="Refresh from server"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-royal' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Export & Bulk Action Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone/50 text-xs text-muted">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-charcoal">
                        {filteredProperties.length} properties matching criteria
                      </span>
                      {filteredProperties.length !== properties.length && (
                        <span className="text-[11px] text-muted">
                          (Filtered from total {properties.length})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExportInventory('csv')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone hover:bg-ivory text-charcoal font-semibold text-xs transition-colors"
                        title="Export full inventory to CSV spreadsheet"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Export CSV</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExportInventory('json')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone hover:bg-ivory text-charcoal font-semibold text-xs transition-colors"
                        title="Export full database snapshot to JSON"
                      >
                        <Download className="w-3.5 h-3.5 text-royal" />
                        <span>Export JSON</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table View */}
                <div className="bg-white rounded-2xl border border-stone overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-ivory border-b border-stone/80 text-muted uppercase tracking-wider text-[10px]">
                          <th className="py-3.5 px-4 font-bold">Property Details</th>
                          <th className="py-3.5 px-4 font-bold">Category & Type</th>
                          <th className="py-3.5 px-4 font-bold">Station Area</th>
                          <th className="py-3.5 px-4 font-bold">Pricing</th>
                          <th className="py-3.5 px-4 font-bold">Status</th>
                          <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone/50">
                        {paginatedProperties.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-muted">
                              No properties matching current criteria. Try adjusting filters or search.
                            </td>
                          </tr>
                        ) : (
                          paginatedProperties.map((prop) => (
                            <tr key={prop.id} className="hover:bg-ivory/40 transition-colors">
                              {/* Title & Image */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={prop.image}
                                    alt={prop.title}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                    onError={(e) => {
                                      e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80';
                                    }}
                                  />
                                  <div className="min-w-0">
                                    <div className="font-bold text-navy line-clamp-1">{prop.title}</div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted">
                                      <span className="font-mono">Ref: {prop.id}</span>
                                      {(prop.updatedAt || prop.createdAt) && (
                                        <span>
                                          • Updated: {new Date(prop.updatedAt || prop.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                      )}
                                    </div>
                                    {prop.internalNotes && (
                                      <p className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 line-clamp-1 max-w-xs font-mono">
                                        Notes: {prop.internalNotes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="py-3 px-4 font-medium text-charcoal">
                                <div>{prop.category}</div>
                                <span className="text-[10px] text-muted uppercase">{prop.transactionType}</span>
                              </td>

                              {/* Station */}
                              <td className="py-3 px-4 text-charcoal">
                                <span className="font-semibold">{prop.locality}</span>
                                {prop.subLocation && prop.subLocation !== prop.locality && (
                                  <span className="block text-[10px] text-muted">{prop.subLocation}</span>
                                )}
                              </td>

                              {/* Pricing */}
                              <td className="py-3 px-4 font-bold text-navy">
                                {prop.priceDisplay || prop.price || 'On Request'}
                              </td>

                              {/* Status */}
                              <td className="py-3 px-4">
                                <select
                                  value={
                                    prop.status === 'published' || prop.status === 'available'
                                      ? 'available'
                                      : prop.status === 'draft'
                                      ? 'draft'
                                      : prop.status === 'sold' || prop.status === 'sold_out'
                                      ? 'sold_out'
                                      : 'archived'
                                  }
                                  onChange={(e) => handleQuickStatusChange(prop, e.target.value)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border focus:outline-none cursor-pointer ${
                                    prop.status === 'published' || prop.status === 'available'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : prop.status === 'draft'
                                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                                      : prop.status === 'sold' || prop.status === 'sold_out'
                                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                                      : 'bg-stone/50 text-charcoal border-stone'
                                  }`}
                                >
                                  <option value="available">Available</option>
                                  <option value="draft">Draft</option>
                                  <option value="sold_out">Sold Out</option>
                                  <option value="archived">Archived</option>
                                </select>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                                  {/* Preview */}
                                  <button
                                    type="button"
                                    onClick={() => onNavigate(`/properties/${prop.slug || prop.id}`)}
                                    className="p-1.5 rounded-lg border border-stone hover:bg-navy hover:text-white text-muted transition-colors"
                                    title="Preview Public Page"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Edit */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingProperty(prop);
                                      setActiveTab('add');
                                    }}
                                    className="p-1.5 rounded-lg border border-stone hover:bg-navy hover:text-white text-muted transition-colors"
                                    title="Edit Property"
                                  >
                                    <FileEdit className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Mark Sold Out (when Available or Draft) */}
                                  {(prop.status === 'published' || prop.status === 'available' || prop.status === 'draft') && (
                                    <button
                                      type="button"
                                      onClick={() => handleQuickStatusChange(prop, 'sold_out')}
                                      className="px-2 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-[10px] font-bold uppercase tracking-wider transition-colors"
                                      title="Mark Property as Sold Out (Frees an active listing slot)"
                                    >
                                      Mark Sold
                                    </button>
                                  )}

                                  {/* Restore to Available (when Sold Out or Archived) */}
                                  {(prop.status === 'sold' || prop.status === 'sold_out' || prop.status === 'archived' || prop.status === 'rented' || prop.status === 'unavailable') && (
                                    <button
                                      type="button"
                                      onClick={() => handleQuickStatusChange(prop, 'available')}
                                      className="px-2 py-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 text-[10px] font-bold uppercase tracking-wider transition-colors"
                                      title="Restore to Available (Checks 30 active listings limit)"
                                    >
                                      Restore
                                    </button>
                                  )}

                                  {/* Archive (when not already Archived) */}
                                  {prop.status !== 'archived' && prop.status !== 'unavailable' && (
                                    <button
                                      type="button"
                                      onClick={() => handleQuickStatusChange(prop, 'archived')}
                                      className="px-2 py-1 rounded-lg border border-stone bg-white hover:bg-stone/40 text-charcoal text-[10px] font-semibold uppercase tracking-wider transition-colors"
                                      title="Archive Property"
                                    >
                                      Archive
                                    </button>
                                  )}

                                  {/* Delete (with confirmed owner authentication modal) */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProperty(prop)}
                                    className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-500 hover:text-white text-rose-500 transition-colors"
                                    title="Permanently Delete Property Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  {filteredProperties.length > 0 && (
                    <div className="px-4 py-3 bg-ivory/80 border-t border-stone/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal">
                      <div className="text-muted">
                        Showing{' '}
                        <span className="font-bold text-navy">
                          {pageSize === 0 ? 1 : (currentPage - 1) * pageSize + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-bold text-navy">
                          {pageSize === 0 ? filteredProperties.length : Math.min(currentPage * pageSize, filteredProperties.length)}
                        </span>{' '}
                        of <span className="font-bold text-navy">{filteredProperties.length}</span> properties
                      </div>

                      {pageSize > 0 && totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-2.5 py-1.5 rounded-lg border border-stone bg-white hover:bg-stone/30 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs flex items-center gap-1"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Prev</span>
                          </button>

                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                              .filter((pageNum) => {
                                // Show first, last, and pages close to current
                                return (
                                  pageNum === 1 ||
                                  pageNum === totalPages ||
                                  Math.abs(pageNum - currentPage) <= 2
                                );
                              })
                              .map((pageNum, idx, arr) => {
                                const prevPageNum = arr[idx - 1];
                                const showEllipsis = prevPageNum && pageNum - prevPageNum > 1;
                                return (
                                  <React.Fragment key={pageNum}>
                                    {showEllipsis && <span className="px-1 text-muted">&hellip;</span>}
                                    <button
                                      type="button"
                                      onClick={() => setCurrentPage(pageNum)}
                                      className={`min-w-[28px] h-7 px-2 rounded-lg font-bold text-xs transition-colors ${
                                        currentPage === pageNum
                                          ? 'bg-navy text-white shadow-2xs'
                                          : 'bg-white border border-stone text-charcoal hover:bg-stone/30'
                                      }`}
                                    >
                                      {pageNum}
                                    </button>
                                  </React.Fragment>
                                );
                              })}
                          </div>

                          <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-2.5 py-1.5 rounded-lg border border-stone bg-white hover:bg-stone/30 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs flex items-center gap-1"
                          >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. PENDING REVIEW (VISITOR ENQUIRIES) */}
            {activeTab === 'enquiries' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                  <div className="font-bold flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Private Customer Enquiries Desk</span>
                  </div>
                  <p>
                    These enquiries were submitted by public visitors through the property enquiry forms. In accordance with strict security rules, submitted customer leads are private to the owner and NEVER automatically create public listings.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-stone overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-ivory border-b border-stone/80 text-muted uppercase tracking-wider text-[10px]">
                          <th className="py-3.5 px-4 font-bold">Customer Name</th>
                          <th className="py-3.5 px-4 font-bold">Contact Phone</th>
                          <th className="py-3.5 px-4 font-bold">Property / Subject</th>
                          <th className="py-3.5 px-4 font-bold">Message Details</th>
                          <th className="py-3.5 px-4 font-bold">Date</th>
                          <th className="py-3.5 px-4 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone/50">
                        {enquiries.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-muted">
                              No customer enquiries recorded yet.
                            </td>
                          </tr>
                        ) : (
                          enquiries.map((enq) => (
                            <tr key={enq.id} className="hover:bg-ivory/40">
                              <td className="py-3 px-4 font-bold text-navy">{enq.name}</td>
                              <td className="py-3 px-4">
                                <a href={`tel:${enq.phone}`} className="text-navy font-semibold hover:underline">
                                  {enq.phone}
                                </a>
                                {enq.email && <span className="block text-[10px] text-muted">{enq.email}</span>}
                              </td>
                              <td className="py-3 px-4 font-medium text-charcoal">
                                {enq.propertyTitle}
                                {enq.propertyLocation && (
                                  <span className="block text-[10px] text-muted">{enq.propertyLocation}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-muted max-w-xs">{enq.message || '—'}</td>
                              <td className="py-3 px-4 text-[10px] text-muted whitespace-nowrap">
                                {new Date(enq.submittedAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  value={enq.status}
                                  onChange={(e) => handleEnquiryStatusChange(enq.id, e.target.value)}
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-stone bg-white focus:outline-none"
                                >
                                  <option value="new">New Lead</option>
                                  <option value="reviewed">Reviewed</option>
                                  <option value="contacted">Contacted</option>
                                  <option value="closed">Closed</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. WEBSITE & INVENTORY SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fadeIn max-w-3xl">
                {/* Demo Inventory Toggle */}
                <div className="bg-white rounded-2xl border border-stone p-6 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-navy">Prototype Demonstration Data</h3>
                      <p className="text-xs text-muted mt-1 leading-relaxed">
                        Control whether prototype sample properties are visible alongside genuine owner listings on the public website. Turning this off shows strictly the properties you have added and published in this portal.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleDemoInventory}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.showDemoInventory ? 'bg-royal' : 'bg-stone'
                      }`}
                      role="switch"
                      aria-checked={settings.showDemoInventory}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.showDemoInventory ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-3 border-t border-stone/50 text-xs">
                    <span className="font-bold text-charcoal">Status: </span>
                    {settings.showDemoInventory ? (
                      <span className="text-emerald-600 font-semibold">
                        Visible on website (Hybrid mode)
                      </span>
                    ) : (
                      <span className="text-royal font-semibold">
                        Hidden (Strict live owner inventory only)
                      </span>
                    )}
                  </div>
                </div>

                {/* Database Backup & Export Card */}
                <div className="bg-white rounded-2xl border border-stone p-6 shadow-xs space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-navy">Backup & Data Preservation</h3>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      Download a complete, offline backup copy of your entire property portfolio. This includes all published listings, drafts, pricing, and internal notes.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleExportInventory('csv')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone bg-ivory hover:bg-stone/30 font-bold text-xs uppercase tracking-wider text-charcoal transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Download Spreadsheet (CSV)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportInventory('json')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone bg-ivory hover:bg-stone/30 font-bold text-xs uppercase tracking-wider text-charcoal transition-colors"
                    >
                      <Download className="w-4 h-4 text-royal" />
                      <span>Download JSON Database Dump</span>
                    </button>
                  </div>
                </div>

                {/* Change Owner Password */}
                <div className="bg-white rounded-2xl border border-stone p-6 shadow-xs space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-navy">Update Owner Password</h3>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      Change the password used to access this management dashboard. The new password will be hashed with PBKDF2-SHA-512 before saving.
                    </p>
                  </div>

                  {passwordChangeStatus && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        passwordChangeStatus.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {passwordChangeStatus.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      )}
                      <span>{passwordChangeStatus.message}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-3.5 max-w-md pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                        New Password (Min 8 Characters)
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter secure new password"
                        className="w-full bg-ivory/50 border border-stone rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
                        required
                        minLength={8}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full bg-ivory/50 border border-stone rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
                        required
                        minLength={8}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors disabled:opacity-50"
                    >
                      <span>{isChangingPassword ? 'Saving Password...' : 'Save New Password'}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session Expired Re-authentication Modal */}
      {showReauthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-navy">Owner Session Refresh Required</h3>
            <p className="text-xs text-charcoal/70 mt-2 mb-4 leading-relaxed">
              Your security session has expired or requires renewal to complete your property updates. Enter your owner password below to refresh your session without losing any of your form edits.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsReauthing(true);
                setErrorNotice(null);
                try {
                  const result = await login(user?.username || 'admin', reauthPassword);
                  if (result && result.user) {
                    setShowReauthModal(false);
                    setReauthPassword('');
                    setSuccessNotice('Session refreshed successfully! Please click Save again to finalize your changes.');
                  } else {
                    setErrorNotice('Password verification failed. Please try again.');
                  }
                } catch (err) {
                  setErrorNotice(err.message || 'Failed to refresh session');
                } finally {
                  setIsReauthing(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Owner Password
                </label>
                <input
                  type="password"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  placeholder="Enter your owner password"
                  className="w-full bg-ivory/50 border border-stone rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReauthModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone text-xs font-semibold text-charcoal hover:bg-stone/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReauthing || !reauthPassword}
                  className="px-5 py-2 rounded-xl bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isReauthing ? 'Verifying...' : 'Authenticate & Continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
