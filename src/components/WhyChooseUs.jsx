import React from 'react';
import { Compass, CheckCircle2, Users, Building, Shield } from 'lucide-react';

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
      </div>
    </section>
  );
}
