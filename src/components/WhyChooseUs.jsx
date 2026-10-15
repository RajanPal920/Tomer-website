import React from 'react';
import {
  Compass,
  CheckCircle2,
  Users,
  Building,
  Shield,
  FileText,
  Download,
  ExternalLink,
  Award,
} from 'lucide-react';

export default function WhyChooseUs() {
  const valueProps = [
    {
      icon: Compass,
      title: 'Local Property Understanding',
      description:
        'Focused exclusively on the Vasai-to-Palghar micro-markets. We track genuine neighborhood pricing, municipal water availability, and transit connectivity rather than generic portal averages.',
    },
    {
      icon: Building,
      title: 'Residential & Commercial Options',
      description:
        'A comprehensive portfolio covering 1–3 BHK flats, registered resale apartments, high-street retail shops, corporate offices, NA plots, and Palghar industrial and logistics land under one roof.',
    },
    {
      icon: Users,
      title: 'Personalised Property Assistance',
      description:
        'Direct, transparent consultations tailored to your individual budget and timelines. We coordinate site visits, verify title document pathways, and facilitate clear negotiations.',
    },
    {
      icon: Shield,
      title: 'Support for Buying, Renting & Development',
      description:
        'Whether you are purchasing your first family home, leasing a commercial premise, or seeking advisory on society redevelopment viability, our team is equipped to support your journey.',
    },
  ];

  return (
    <section id="why-us" className="py-20 sm:py-24 bg-ivory">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-royal mb-3">
            <span>Our Approach</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-normal tracking-tight text-balance mb-4">
            Property Decisions Deserve a Better Experience
          </h2>
          <p className="text-muted text-base sm:text-lg leading-relaxed text-balance">
            Real estate in the suburban corridor can be confusing. We prioritize transparency, authentic micro-market knowledge, and straightforward guidance.
          </p>
        </div>

        {/* 4 Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {valueProps.map((prop, idx) => {
            const Icon = prop.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-stone shadow-subtle hover:shadow-card hover:border-royal/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-royal/5 text-navy flex items-center justify-center mb-5 border border-royal/15">
                    <Icon className="w-6 h-6 text-royal" />
                  </div>
                  <h3 className="font-serif text-xl font-normal text-charcoal mb-3">
                    {prop.title}
                  </h3>
                  <p className="text-muted text-xs sm:text-sm leading-relaxed">
                    {prop.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone/50 flex items-center gap-2 text-xs font-bold text-navy">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brandRed flex-shrink-0" />
                  <span>Client-First Standard</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Official Agency Registration Certificate Card */}
        <div className="mt-14 bg-white rounded-3xl border border-stone/80 p-6 sm:p-8 lg:p-10 shadow-card">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
            {/* Certificate Preview Image */}
            <div className="w-full lg:w-5/12 flex-shrink-0">
              <a
                href="/certificate/nidhi-pramanpatra.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group block relative rounded-2xl overflow-hidden border-2 border-stone hover:border-royal transition-all duration-300 shadow-md hover:shadow-xl bg-ivory"
                title="Click to view full ई-स्टेट कन्सल्टंट विकास मंडळ – नोंदणी प्रमाणपत्र PDF"
              >
                <img
                  src="/certificate/certificate-preview.jpg"
                  alt="ई-स्टेट कन्सल्टंट विकास मंडळ – नोंदणी प्रमाणपत्र"
                  className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 rounded-xl bg-navy/90 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5 shadow-lg">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Full PDF</span>
                  </span>
                </div>
              </a>
            </div>

            {/* Certificate Details & Actions */}
            <div className="w-full lg:w-7/12 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal/10 text-royal text-xs font-bold uppercase tracking-wider mb-3">
                  <Award className="w-3.5 h-3.5" />
                  <span>Verified Agency Registration</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl text-navy font-normal tracking-tight mb-2">
                  ई-स्टेट कन्सल्टंट विकास मंडळ – नोंदणी प्रमाणपत्र
                </h3>

                <p className="text-muted text-sm sm:text-base leading-relaxed mb-4">
                  Official membership registration certificate issued by <strong>Estate Consultant Vikas Mandal</strong> (इस्टेट कन्सल्टंट विकास मंडळ) recognizing Tomar Enterprises as an authorized agency.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-4 rounded-xl bg-ivory border border-stone/60 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brandRed flex-shrink-0" />
                    <span className="text-charcoal"><strong>Document:</strong> Official PDF Certificate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-charcoal"><strong>Status:</strong> Verified & Valid</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: View & Download */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href="/certificate/nidhi-pramanpatra.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Certificate</span>
                </a>

                <a
                  href="/certificate/nidhi-pramanpatra.pdf"
                  download="nidhi-pramanpatra.pdf"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-ivory text-navy font-bold text-xs uppercase tracking-wider border border-stone hover:border-navy/40 transition-all shadow-xs"
                >
                  <Download className="w-4 h-4 text-royal" />
                  <span>Download Certificate</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
