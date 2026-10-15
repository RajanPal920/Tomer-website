import React from 'react';
import { Building2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function DevelopmentSection({ onOpenEnquiryModal }) {
  return (
    <section id="development" className="py-20 sm:py-28 bg-navy-900 text-white relative overflow-hidden">
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(#C5A46D_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-brandRed text-xs font-bold tracking-[0.2em] uppercase mb-4 border border-white/10">
            <Building2 className="w-3.5 h-3.5" />
            <span>Development Advisory</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight text-balance mb-4">
            Shaping Communities Across Vasai to Palghar
          </h2>
          <p className="text-white text-base sm:text-lg leading-relaxed text-balance">
            Whether embarking on greenfield township developments or reviving aging housing societies, Tomar Enterprises brings local feasibility insights and builder-landowner advisory.
          </p>
        </div>

        {/* Two-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Block 1: New Development & Construction */}
          <div className="bg-navy/70 border border-white/15 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-brandRed/60 transition-all duration-300">
            <div>
              <div className="relative aspect-[16/10] overflow-hidden bg-navy">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
                  alt="New architectural development and construction planning"
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-sm bg-brandRed text-white text-xs font-bold uppercase tracking-wider">
                    New Construction Advisory
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white mb-3">
                  Building Better Spaces for Tomorrow
                </h3>
                <p className="text-white text-sm sm:text-base leading-relaxed mb-6">
                  Explore new development opportunities and discuss your residential or commercial property requirements with our team.
                </p>

                <div className="space-y-2.5 mb-4 text-xs sm:text-sm text-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brandRed flex-shrink-0" />
                    <span>Planning & feasibility guidance for new residential towers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brandRed flex-shrink-0" />
                    <span>Commercial complex zoning & layout consultations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brandRed flex-shrink-0" />
                    <span>Direct liaison for prospective plot owners & developers</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 pt-0">
              <button
                type="button"
                onClick={() =>
                  onOpenEnquiryModal({
                    title: 'New Development & Construction Enquiry',
                    interest: 'Development',
                  })
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                <span>Discuss a New Project</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Block 2: Redevelopment Opportunities */}
          <div className="bg-navy/70 border border-white/15 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-royal/60 transition-all duration-300">
            <div>
              <div className="relative aspect-[16/10] overflow-hidden bg-navy">
                <img
                  src="https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=1200&q=80"
                  alt="Housing society rejuvenation and redevelopment"
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-sm bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs font-bold uppercase tracking-wider">
                    Society Rejuvenation
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white mb-3">
                  Unlock the Potential of Existing Properties
                </h3>
                <p className="text-white text-sm sm:text-base leading-relaxed mb-6">
                  Connect with our team to discuss redevelopment enquiries, property requirements and potential development opportunities.
                </p>

                <div className="space-y-2.5 mb-4 text-xs sm:text-sm text-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brandRed flex-shrink-0" />
                    <span>Co-operative housing society redevelopment advisory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brandRed flex-shrink-0" />
                    <span>FSI, corpus fund & transit rent viability understanding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brandRed flex-shrink-0" />
                    <span>Connecting reputable developer partners with society committees</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 pt-0">
              <button
                type="button"
                onClick={() =>
                  onOpenEnquiryModal({
                    title: 'Society Redevelopment Consultation',
                    interest: 'Redevelopment',
                  })
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-white hover:bg-ivory text-navy font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                <span>Discuss Redevelopment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
