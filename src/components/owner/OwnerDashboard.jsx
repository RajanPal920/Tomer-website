import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Building2,
  CheckCircle2,
  FileEdit,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  Settings,
  LogOut,
  Search,
  Filter,
  ArrowUpRight,
  Shield,
  MessageSquare,
  MapPin,
  Tag,
  IndianRupee,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import BrandLogo from '../BrandLogo';
import OwnerPropertyForm from './OwnerPropertyForm';
import {
  fetchOwnerInventory,
  createOwnerListing,
  updateOwnerListing,
  deleteOwnerListing,
  fetchOwnerEnquiries,
  updateEnquiryStatus,
  fetchWebsiteSettings,
  updateWebsiteSettings,
} from '../../services/propertyStore';
import { logout } from '../../services/authService';

export default function OwnerDashboard({ onNavigate, user }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview | add | all | published | drafts | enquiries | sold | settings
  const [properties, setProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [settings, setSettings] = useState({ showDemoInventory: true });
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Property being edited in form (null = adding new, object = editing)
  const [editingProperty, setEditingProperty] = useState(null);
  const [isSavingProperty, setIsSavingProperty] = useState(false);

  // Filter & Search inside Dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocality, setFilterLocality] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Load dashboard data from backend
  const loadDashboardData = async () => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const [inventoryData, enquiriesData, settingsData] = await Promise.all([
        fetchOwnerInventory(),
        fetchOwnerEnquiries().catch(() => []),
        fetchWebsiteSettings().catch(() => ({ showDemoInventory: true })),
      ]);

      setProperties(inventoryData || []);
      setEnquiries(enquiriesData || []);
      setSettings(settingsData || { showDemoInventory: true });
    } catch (err) {
      console.error('[DASHBOARD ERROR]', err);
      setErrorNotice(err.message || 'Failed to fetch inventory from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Compute live data-driven metrics
  const stats = useMemo(() => {
    const total = properties.length;
    const published = properties.filter((p) => p.status === 'published').length;
    const drafts = properties.filter((p) => p.status === 'draft').length;
    const unavailableOrSold = properties.filter(
      (p) => p.status === 'sold' || p.status === 'rented' || p.status === 'unavailable'
    ).length;
    const newEnquiries = enquiries.filter((e) => e.status === 'new').length;

    return { total, published, drafts, unavailableOrSold, newEnquiries, totalEnquiries: enquiries.length };
  }, [properties, enquiries]);

  // Filtered properties for the "All / Filtered" tabs
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Tab filter
      if (activeTab === 'published' && p.status !== 'published') return false;
      if (activeTab === 'drafts' && p.status !== 'draft') return false;
      if (activeTab === 'sold' && !['sold', 'rented', 'unavailable'].includes(p.status)) return false;

      // Status dropdown filter
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;

      // Locality filter
      if (filterLocality !== 'all' && p.locality !== filterLocality) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = (p.title || '').toLowerCase().includes(query);
        const matchLoc = (p.locality || '').toLowerCase().includes(query);
        const matchCat = (p.category || '').toLowerCase().includes(query);
        const matchId = (p.id || '').toLowerCase().includes(query);
        if (!matchTitle && !matchLoc && !matchCat && !matchId) return false;
      }

      return true;
    });
  }, [properties, activeTab, filterStatus, filterLocality, searchQuery]);

  // Handle Save (Create or Update)
  const handleSaveProperty = async (propertyData) => {
    setIsSavingProperty(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      if (editingProperty?.id) {
        // Update
        const updated = await updateOwnerListing(editingProperty.id, propertyData);
        setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setSuccessNotice(`Property "${updated.title}" successfully updated!`);
      } else {
        // Create
        const created = await createOwnerListing(propertyData);
        setProperties((prev) => [created, ...prev]);
        setSuccessNotice(`New property "${created.title}" successfully created and saved!`);
      }

      setEditingProperty(null);
      setActiveTab('all');
    } catch (err) {
      setErrorNotice(err.message || 'Failed to save property listing');
    } finally {
      setIsSavingProperty(false);
    }
  };

  // Handle Status Toggle (e.g. Quick Publish / Unpublish)
  const handleQuickStatusChange = async (property, newStatus) => {
    try {
      const updated = await updateOwnerListing(property.id, { status: newStatus });
      setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSuccessNotice(`Status for "${property.title}" updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      setErrorNotice(err.message || 'Failed to update property status');
    }
  };

  // Handle Delete
  const handleDeleteProperty = async (property) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently remove "${property.title}" (Ref: ${property.id})?`
      )
    ) {
      return;
    }

    try {
      await deleteOwnerListing(property.id);
      setProperties((prev) => prev.filter((p) => p.id !== property.id));
      setSuccessNotice(`Property "${property.title}" deleted.`);
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
              Owner Management
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone hover:text-white text-xs font-semibold transition-colors"
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
            <button onClick={() => setErrorNotice(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
            <button onClick={() => setSuccessNotice(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* If user is adding/editing property, show form view */}
        {activeTab === 'add' ? (
          <OwnerPropertyForm
            initialProperty={editingProperty}
            onSave={handleSaveProperty}
            onCancel={() => {
              setEditingProperty(null);
              setActiveTab('all');
            }}
            isSaving={isSavingProperty}
          />
        ) : (
          <div className="space-y-8">
            {/* Top Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-stone/80 pb-4">
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
                  setEditingProperty(null);
                  setActiveTab('add');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors"
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
                <span>All Properties ({stats.total})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('published')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'published'
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-white border border-stone text-charcoal hover:bg-stone/40'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Published ({stats.published})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('drafts')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'drafts'
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-white border border-stone text-charcoal hover:bg-stone/40'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Drafts ({stats.drafts})</span>
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
                <span>Pending Review ({stats.totalEnquiries})</span>
                {stats.newEnquiries > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sold')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'sold'
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-white border border-stone text-charcoal hover:bg-stone/40'
                }`}
              >
                <Tag className="w-4 h-4 text-stone-dark" />
                <span>Unavailable / Sold ({stats.unavailableOrSold})</span>
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
                {/* 5 Real Data-Driven Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white rounded-2xl border border-stone p-5 shadow-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                      Total Listings
                    </span>
                    <div className="text-3xl font-serif font-bold text-navy">{stats.total}</div>
                    <span className="text-[10px] text-muted mt-1 block">Managed by Owner</span>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone p-5 shadow-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                      Live Published
                    </span>
                    <div className="text-3xl font-serif font-bold text-emerald-600">{stats.published}</div>
                    <span className="text-[10px] text-muted mt-1 block">Visible on Public Site</span>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone p-5 shadow-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                      Private Drafts
                    </span>
                    <div className="text-3xl font-serif font-bold text-amber-600">{stats.drafts}</div>
                    <span className="text-[10px] text-muted mt-1 block">Pending Verification</span>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone p-5 shadow-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                      Sold / Rented
                    </span>
                    <div className="text-3xl font-serif font-bold text-stone-dark">{stats.unavailableOrSold}</div>
                    <span className="text-[10px] text-muted mt-1 block">Closed Transactions</span>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone p-5 shadow-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                      Customer Enquiries
                    </span>
                    <div className="text-3xl font-serif font-bold text-blue-600">{stats.totalEnquiries}</div>
                    <span className="text-[10px] text-muted mt-1 block">
                      {stats.newEnquiries} New Leads
                    </span>
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
                    <p className="text-xs sm:text-sm text-stone leading-relaxed">
                      Create and publish residential flats, commercial retail, NA plots, or redevelopment projects. Published properties immediately appear on the public website with verified titles.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingProperty(null);
                      setActiveTab('add');
                    }}
                    className="relative z-10 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-[1.02]"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Property Listing</span>
                  </button>
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
                                prop.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : prop.status === 'draft'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-stone text-charcoal'
                              }`}
                            >
                              {prop.status}
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

            {/* TAB CONTENT: 2. ALL / PUBLISHED / DRAFTS / SOLD LISTINGS */}
            {['all', 'published', 'drafts', 'sold'].includes(activeTab) && (
              <div className="space-y-6 animate-fadeIn">
                {/* Search & Filter Bar */}
                <div className="bg-white rounded-2xl border border-stone p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-muted absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search title, ref ID, category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-ivory/50 border border-stone rounded-xl pl-9 pr-3.5 py-2 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                      value={filterLocality}
                      onChange={(e) => setFilterLocality(e.target.value)}
                      className="bg-white border border-stone rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-royal flex-1 sm:flex-none"
                    >
                      <option value="all">All Stations</option>
                      <option value="vasai-road">Vasai Road</option>
                      <option value="nalasopara">Nalasopara</option>
                      <option value="virar">Virar</option>
                      <option value="vaitarna">Vaitarna</option>
                      <option value="saphale">Saphale</option>
                      <option value="kelve-road">Kelve Road</option>
                      <option value="palghar">Palghar</option>
                    </select>

                    <button
                      type="button"
                      onClick={loadDashboardData}
                      className="p-2 rounded-xl border border-stone hover:bg-ivory text-muted hover:text-navy"
                      title="Refresh from server"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
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
                        {filteredProperties.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-muted">
                              No properties matching current criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredProperties.map((prop) => (
                            <tr key={prop.id} className="hover:bg-ivory/40 transition-colors">
                              {/* Title & Image */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={prop.image}
                                    alt={prop.title}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                  />
                                  <div>
                                    <div className="font-bold text-navy line-clamp-1">{prop.title}</div>
                                    <span className="text-[10px] text-muted font-mono">Ref: {prop.id}</span>
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
                                  value={prop.status}
                                  onChange={(e) => handleQuickStatusChange(prop, e.target.value)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border focus:outline-none ${
                                    prop.status === 'published'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : prop.status === 'draft'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-stone/50 text-charcoal border-stone'
                                  }`}
                                >
                                  <option value="published">Published</option>
                                  <option value="draft">Draft</option>
                                  <option value="sold">Sold</option>
                                  <option value="rented">Rented</option>
                                  <option value="unavailable">Unavailable</option>
                                  <option value="archived">Archived</option>
                                </select>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  {prop.status === 'published' && (
                                    <button
                                      type="button"
                                      onClick={() => onNavigate(`/properties/${prop.slug || prop.id}`)}
                                      className="p-1.5 rounded-lg border border-stone hover:bg-navy hover:text-white text-muted transition-colors"
                                      title="Open Public Detail Page"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  )}

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

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProperty(prop)}
                                    className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-500 hover:text-white text-rose-500 transition-colors"
                                    title="Delete Property"
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

            {/* TAB CONTENT: 4. WEBSITE SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-stone p-6 sm:p-8 space-y-6 max-w-3xl animate-fadeIn">
                <h3 className="font-serif text-xl text-navy font-bold flex items-center gap-2 border-b border-stone/60 pb-3">
                  <Settings className="w-5 h-5 text-royal" />
                  <span>Website Configuration & Inventory Controls</span>
                </h3>

                {/* Demo Inventory Toggle */}
                <div className="p-4 rounded-xl border border-stone bg-ivory/50 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-navy">Prototype Demonstration Inventory</h4>
                    <p className="text-xs text-muted max-w-md mt-0.5">
                      Toggle whether the initial 53 sample demonstration listings appear alongside your live owner listings. When turned OFF, only genuine owner-published properties will be shown on the website.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleDemoInventory}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      settings.showDemoInventory
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone text-charcoal'
                    }`}
                  >
                    {settings.showDemoInventory ? 'Enabled (ON)' : 'Disabled (OFF)'}
                  </button>
                </div>

                {/* Server Status Badge */}
                <div className="p-4 rounded-xl border border-stone bg-ivory/50 space-y-2">
                  <h4 className="text-sm font-bold text-navy">Backend Authorization & Persistence</h4>
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Server-Side PBKDF2 Password Hashing & Role-Based Authorization Active</span>
                  </div>
                  <p className="text-[11px] text-muted">
                    Properties and customer enquiries are securely persisted on the server filesystem. Public visitors cannot bypass authorization to publish or modify property data.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
