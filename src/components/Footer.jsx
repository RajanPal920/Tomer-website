import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  ArrowUp,
  Calculator,
  Landmark,
  Shield,
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import BrandLogo from './BrandLogo';
import { contactInfo } from '../data/contactInfo';
import { APPROVED_STATIONS } from '../data/locations';

export default function Footer({ onSelectCategory, onSelectLocality, onNavigate }) {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLink = (sectionId, filter = null, path = null) => {
    if (path && onNavigate) {
      onNavigate(path);
      return;
    }
    if (filter && onSelectCategory) {
      onSelectCategory(filter);
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const propertyExploreLinks = [
    { label: 'New Flats', filter: { transactionType: 'buy', category: 'new-flat' }, path: '/buy' },
    { label: 'Resale Flats', filter: { transactionType: 'buy', category: 'resale-flat' }, path: '/buy' },
    { label: 'Rental Properties', filter: { transactionType: 'rent', category: 'flat-rent' }, path: '/rent' },
    { label: 'Commercial Shops', filter: { transactionType: 'commercial', category: 'commercial-shop' }, path: '/commercial' },
    { label: 'Commercial Offices', filter: { transactionType: 'commercial', category: 'commercial-office' }, path: '/commercial' },
    { label: 'Residential Plots', filter: { transactionType: 'plots-land', category: 'residential-plot' }, path: '/plots' },
    { label: 'NA Plots (Sanctioned)', filter: { transactionType: 'plots-land', category: 'na-plot' }, path: '/plots' },
    { label: 'Industrial Plots', filter: { transactionType: 'plots-land', category: 'industrial-plot' }, path: '/plots' },
    { label: 'Lease & Heavy Deposit', filter: { transactionType: 'lease', category: 'commercial-property' }, path: '/lease' },
  ];

  return (
    <footer className="bg-navy-950 text-white text-sm border-t border-white/10">
      {/* Upper Footer Grid */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Column 1: Brand & Contact Info from Visiting Card (4 Cols) */}
          <div className="lg:col-span-4">
            <BrandLogo variant="light" size="large" className="mb-4" />
            <p className="text-white text-sm leading-relaxed mb-6 max-w-sm">
              TOMAR ENTERPRISES is an authorized real estate agency located in Virar East. We specialize in property sales, purchase assistance, rentals, NA plots, home loans, and registration assistance across the Vasai-to-Palghar corridor.
            </p>

            <div className="space-y-3 text-white text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brandRed flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {contactInfo.officeAddress.shopNo}, {contactInfo.officeAddress.complex}, {contactInfo.officeAddress.locality}, {contactInfo.officeAddress.district}, {contactInfo.officeAddress.state}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brandRed flex-shrink-0" />
                <div className="flex flex-wrap items-center gap-2">
                  <a href={`tel:${contactInfo.phoneSanjay1Raw}`} className="hover:text-stone-light font-semibold transition-colors">
                    Sanjay: {contactInfo.phoneSanjay1}
                  </a>
                  <span className="text-white/40">|</span>
                  <a href={`tel:${contactInfo.phoneSanjay2Raw}`} className="hover:text-stone-light transition-colors">
                    {contactInfo.phoneSanjay2}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brandRed flex-shrink-0" />
                <a href={`tel:${contactInfo.phoneShlokRaw}`} className="hover:text-stone-light font-semibold transition-colors">
                  Shlok: {contactInfo.phoneShlok}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brandRed flex-shrink-0" />
                <a href={contactInfo.emailMailto} className="hover:text-stone-light font-semibold transition-colors break-all">
                  {contactInfo.email}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <WhatsAppIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href={contactInfo.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white text-emerald-400 font-semibold transition-colors"
                >
                  WhatsApp: {contactInfo.whatsappDisplay} (Sanjay Tomer)
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Explore Properties (3 Cols) */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-white text-[16px] tracking-tight mb-4 pb-2 border-b border-white/10 flex items-center justify-between">
              <span>Explore Properties</span>
            </h4>
            <ul className="space-y-2.5 text-[14px] text-white">
              {propertyExploreLinks.map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLink('listings', item.filter, item.path)}
                    className="hover:text-stone-light hover:underline transition-colors text-left font-medium"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services & Visiting Card Specializations (2 Cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white text-[16px] tracking-tight mb-4 pb-2 border-b border-white/10">
              <span>Agency Services</span>
            </h4>
            <ul className="space-y-2.5 text-[14px] text-white font-medium">
              {contactInfo.services.slice(0, 6).map((srv, idx) => (
                <li key={idx} className="truncate" title={srv}>
                  &bull; {srv}
                </li>
              ))}
              <li className="pt-2 border-t border-white/10">
                <button
                  onClick={() => handleLink('tools', null, '/tools/emi-calculator')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-blue-200 font-semibold"
                >
                  <Calculator className="w-3.5 h-3.5 text-royal-light" />
                  <span>EMI Calculator</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('tools', null, '/tools/area-converter')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-blue-200 font-semibold"
                >
                  <Landmark className="w-3.5 h-3.5 text-royal-light" />
                  <span>Plot Area Converter</span>
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('/owner-login');
                  }}
                  className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white font-bold transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-brandRed" />
                  <span>Owner Portal Login</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: 7 Stations Covered (3 Cols) */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-white text-[16px] tracking-tight mb-4 pb-2 border-b border-white/10">
              <span>7 Station Corridor</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[13.5px] font-medium text-white">
              {APPROVED_STATIONS.map((loc) => (
                <button
                  key={loc.locationId}
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate(`/locations/${loc.slug}`);
                    } else if (onSelectLocality) {
                      onSelectLocality(loc.locationId);
                    }
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-left hover:text-white transition-colors flex items-center gap-1.5 text-white"
                >
                  <MapPin className="w-3 h-3 text-brandRed flex-shrink-0" />
                  <span className="truncate">{loc.canonicalName}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[12px] text-white leading-relaxed">
              <strong className="text-white block mb-0.5">Vasai Road to Palghar:</strong>
              Continuous mainline rail corridor & highway connectivity across Palghar district.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="border-t border-white/10 bg-black/40 py-5">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <span>&copy; {currentYear} TOMAR ENTERPRISES. All rights reserved. Shop No. 06, Nakshtra Apt., Viva Jangid Complex, Manvelpada, Virar (East), Palghar - 401305.</span>
            <span className="hidden sm:inline text-white/30">&bull;</span>
            <span className="text-white">
              Design and SEO by{' '}
              <a
                href="https://sunmargindia.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-royal underline underline-offset-2 transition-colors font-semibold"
              >
                Sunmarg India
              </a>
            </span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => {
                if (onNavigate) onNavigate('/owner-login');
              }}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Shield className="w-3 h-3 text-brandRed" />
              <span>Owner Portal</span>
            </button>
            <button
              onClick={() => handleLink('faqs')}
              className="hover:text-white transition-colors"
            >
              Privacy & Disclaimers
            </button>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('/contact');
                else handleLink('contact');
              }}
              className="hover:text-white transition-colors"
            >
              Contact Desk
            </button>

            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Back to Top"
              aria-label="Scroll back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
