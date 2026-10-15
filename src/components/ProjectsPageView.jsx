import React from 'react';
import { ChevronRight, Building2, CheckCircle2, Phone } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { contactInfo } from '../data/contactInfo';
import VideoWalkthroughSection from './VideoWalkthroughSection';

export default function ProjectsPageView({ subView = 'all', onNavigate, onEnquire }) {
  const isRedevelopment = subView === 'redevelopment';
  const isNew = subView === 'new';

  return (
    <div className="bg-ivory min-h-screen">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-stone/70">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <nav className="flex items-center gap-2 text-xs text-muted mb-3">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="hover:text-navy transition-colors font-medium"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-dark" />
            <span className="text-navy font-semibold">
              {isRedevelopment ? 'Redevelopment Advisory' : isNew ? 'New Developments' : 'Projects & Redevelopment'}
            </span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-brandRed/10 text-brandRed text-xs font-bold tracking-[0.2em] uppercase mb-3">
              <Building2 className="w-3.5 h-3.5 text-brandRed" />
              <span>Vasai-to-Palghar Corridor Projects</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal tracking-tight mb-3">
              {isRedevelopment
                ? 'Housing Society Redevelopment Advisory'
                : isNew
                ? 'New Real Estate Developments & Townships'
                : 'Developments & Housing Society Redevelopment'}
            </h1>
            <p className="text-muted text-sm sm:text-base leading-relaxed">
              Tomar Enterprises connects property buyers, housing society committees, and premier builders with grounded feasibility, municipal regulation compliance, and verified execution.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Card 1: New Construction & Developments */}
          <div className={`bg-white rounded-3xl border ${isNew ? 'border-royal shadow-card ring-2 ring-royal/20' : 'border-stone shadow-sm'} overflow-hidden flex flex-col justify-between`}>
            <div>
              <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
                <img
                  src="/images/buildingImages/image copy 14.png"
                  alt="New township masterplan and residential development"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded bg-navy text-white text-xs font-bold uppercase tracking-wider shadow-xs border border-white/20">
                    New Construction Projects
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <h2 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal mb-3">
                  New Residential & Commercial Townships
                </h2>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  Explore new residential launches, commercial office parks, and plotted layout partnerships across Vasai, Virar, and Palghar. We verify developer track records, municipal clearances, and delivery commitments.
                </p>

                <div className="space-y-3 mb-6 text-sm text-charcoal">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Township master plans with RERA registration assistance</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Early-stage buyer pricing & developer negotiation</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Strategic micro-market locations near railway stations</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 pt-0 border-t border-stone/50 mt-auto flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() =>
                  onEnquire({
                    title: 'New Development Projects Consultation',
                    priceDisplay: 'Development Advisory',
                    locality: 'Vasai to Palghar Corridor',
                  })
                }
                className="w-full py-3 px-4 rounded-xl bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm text-center"
              >
                Enquire for New Launches
              </button>
            </div>
          </div>

          {/* Card 2: Society Redevelopment */}
          <div className={`bg-white rounded-3xl border ${isRedevelopment ? 'border-brandRed shadow-card ring-2 ring-brandRed/20' : 'border-stone shadow-sm'} overflow-hidden flex flex-col justify-between`}>
            <div>
              <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
                <img
                  src="/images/buildingImages/build1.png"
                  alt="Housing society redevelopment advisory and modern residential tower"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded bg-brandRed text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                    Redevelopment Advisory
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <h2 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal mb-3">
                  Housing Society Redevelopment & Renewal
                </h2>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  Aging residential buildings across Vasai Road, Nalasopara, and Virar have substantial redevelopment potential. Tomar Enterprises provides impartial committee consultation, feasibility studies, and vetted developer tender management.
                </p>

                <div className="space-y-3 mb-6 text-sm text-charcoal">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>FSI, TDR & permissible carpet area enhancement audits</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Transparent builder tender documentation & legal safeguards</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Corpus fund & hardship compensation optimization for members</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 pt-0 border-t border-stone/50 mt-auto flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() =>
                  onEnquire({
                    title: 'Society Redevelopment Advisory Consultation',
                    priceDisplay: 'Free Feasibility Audit',
                    locality: 'Vasai to Palghar Corridor',
                  })
                }
                className="w-full py-3 px-4 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm text-center"
              >
                Schedule Society Feasibility Audit
              </button>
            </div>
          </div>

        </div>

        {/* Client Walkthrough Showcase (Sample Flat Tour) */}
        <div className="mt-12 sm:mt-16">
          <VideoWalkthroughSection onEnquire={onEnquire} />
        </div>

        {/* Direct Contact Banner */}
        <div className="mt-12 sm:mt-16 bg-navy text-white p-8 sm:p-12 rounded-3xl shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white mb-2">
              Have a Land Parcel or Housing Society to Discuss?
            </h3>
            <p className="text-white text-sm sm:text-base leading-relaxed">
              Connect directly with our development advisory desk for confidential feasibility reviews and developer screening.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 w-full sm:w-auto">
            <a
              href={`tel:${contactInfo.phoneRaw}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-navy font-bold text-xs uppercase tracking-wider hover:bg-ivory transition-colors"
            >
              <Phone className="w-4 h-4 text-brandRed" />
              <span>Call Advisory Desk</span>
            </a>

            <a
              href={contactInfo.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>WhatsApp Message</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
