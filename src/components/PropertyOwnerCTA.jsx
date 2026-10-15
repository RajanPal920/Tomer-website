import React from 'react';
import { PlusCircle, Handshake, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { isAuthenticated } from '../services/authService';

export default function PropertyOwnerCTA({ onNavigate }) {
  const isOwner = isAuthenticated();

  const handleConsultClick = () => {
    if (isOwner) {
      if (onNavigate) onNavigate('/owner/dashboard/add');
    } else {
      if (onNavigate) onNavigate('/contact');
      else {
        const el = document.getElementById('contact');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLeaseClick = () => {
    if (isOwner) {
      if (onNavigate) onNavigate('/owner/dashboard');
    } else {
      if (onNavigate) onNavigate('/contact');
      else {
        const el = document.getElementById('contact');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  return (
    <section id="owner-section" className="py-20 sm:py-24 bg-navy text-white relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-royal/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-navy-700/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-navy-900/90 rounded-3xl border border-white/15 p-8 sm:p-12 lg:p-14 shadow-elevated">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-blue-200 text-xs font-bold tracking-[0.2em] uppercase mb-4 border border-white/10">
                <Handshake className="w-3.5 h-3.5" />
                <span>For Property Owners & Landlords</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight text-balance mb-4">
                Have a Property to Sell, Rent or Lease?
              </h2>

              <p className="text-stone text-base sm:text-lg leading-relaxed mb-8 max-w-xl text-balance">
                Tell us about your property and connect with our team to discuss the next steps. We help owners connect with genuine, pre-qualified buyers and verified tenants.
              </p>

              {/* Owner benefits checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm text-stone/90 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-brandRed/20 text-brandRed flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Fair market valuation guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-brandRed/20 text-brandRed flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Vetted buyers & verified tenants</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-brandRed/20 text-brandRed flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Heavy deposit lease matchmaking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-brandRed/20 text-brandRed flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Confidential landowner consultations</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
                <button
                  type="button"
                  onClick={handleConsultClick}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer"
                >
                  <Handshake className="w-4 h-4" />
                  <span>{isOwner ? 'Add Property to Inventory' : 'Consult Advisory Desk'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLeaseClick}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider border border-white/25 transition-all duration-200 cursor-pointer"
                >
                  <span>{isOwner ? 'Manage Owner Inventory' : 'Reach Sanjay Tomar'}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-7 backdrop-blur-sm shadow-inner">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-brandRed" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg text-white font-normal">
                      Transparent Owner Workflow
                    </h4>
                    <p className="text-xs text-stone">Direct local facilitation</p>
                  </div>
                </div>

                <ol className="space-y-4 text-xs text-stone/90">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-white">Submit Property Profile:</strong> Fill the quick form with locality, carpet area & asking price/rent.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-white">Consultation & Verification:</strong> Our desk coordinates directly with you to understand title papers & preferences.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-white">Targeted Matchmaking:</strong> We introduce genuine buyers, corporate tenants, or development partners without endless nuisance calls.
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
