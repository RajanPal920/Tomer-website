import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  FileCheck2,
  ChevronRight,
  Building2,
  Key,
  Home,
  Briefcase,
  Stamp,
  FileText,
  BadgePercent,
  Download,
  Award,
} from 'lucide-react';
import { contactInfo } from '../data/contactInfo';
import { submitEnquiry } from '../services/propertyStore';
import { buildGmailComposeUrl, openGmailCompose } from '../services/emailService';

import WhatsAppIcon from './WhatsAppIcon';
export { WhatsAppIcon };

export default function ContactPageView({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Property Sales',
    locality: 'Virar',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Please provide your full name.';
    }
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number.';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email address.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        propertyTitle: `${formData.service} Advisory (${formData.locality})`,
        requirement: formData.service,
        area: formData.locality,
        message: formData.message.trim(),
      };

      await submitEnquiry(payload);
      setSubmitSuccess({
        ...formData,
        referenceId: `TE-DESK-${Date.now().toString().slice(-6)}`,
      });

      // Open preferred Gmail compose window addressed to Sanjaykumartomar4@gmail.com
      openGmailCompose({
        subject: `Property Enquiry - ${formData.service} (${formData.locality})`,
        clientName: formData.name.trim(),
        clientPhone: formData.phone.trim(),
        message: `Service Required: ${formData.service}\nPreferred Locality: ${formData.locality}\n\nClient Message:\n${formData.message.trim() || 'Please connect for property consultation.'}`,
      });
    } catch (err) {
      console.warn('Enquiry fallback confirmation:', err);
      setSubmitSuccess({
        ...formData,
        referenceId: `TE-DESK-${Date.now().toString().slice(-6)}`,
      });

      openGmailCompose({
        subject: `Property Enquiry - ${formData.service} (${formData.locality})`,
        clientName: formData.name.trim(),
        clientPhone: formData.phone.trim(),
        message: `Service Required: ${formData.service}\nPreferred Locality: ${formData.locality}\n\nClient Message:\n${formData.message.trim() || 'Please connect for property consultation.'}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardServices = [
    { title: 'Property Sales', desc: 'Assistance for owners looking to sell residential or commercial property.', icon: Building2 },
    { title: 'Property Purchases', desc: 'Guidance for buyers looking for new flats, resale units, and land.', icon: Home },
    { title: 'Property Rentals', desc: 'Tenancy matchmaking and rental agreement coordination.', icon: Key },
    { title: 'Flats & Apartments', desc: '1 BHK, 2 BHK, and 3 BHK residential homes across Vasai to Palghar.', icon: Building2 },
    { title: 'Shops & Commercial', desc: 'Road-frontage shops, commercial complex spaces, and retail units.', icon: Briefcase },
    { title: 'Bungalows & Row Houses', desc: 'Independent residences, villas, and weekend homes in prime corridors.', icon: Home },
    { title: 'Home Loan Assistance', desc: 'Liaison with major nationalized and private banks for home loans.', icon: BadgePercent },
    { title: 'Notary-Related Assistance', desc: 'Facilitation and coordination for required notary documentation.', icon: Stamp },
    { title: 'Stamp Duty & Registration', desc: 'Guidance and desk support for legal registration and stamp duty.', icon: FileText },
  ];

  return (
    <div className="bg-ivory min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/')}
            className="hover:text-navy hover:underline transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-dark" />
          <span className="text-charcoal font-semibold">Contact Desk</span>
        </nav>

        {/* Section A: Header & Business Information Section */}
        <div className="bg-white rounded-3xl border border-stone p-6 sm:p-10 lg:p-12 mb-10 shadow-card">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brandRed/10 border border-brandRed/20 text-brandRed text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-brandRed animate-pulse" />
              <span>Official Advisory Desk</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal tracking-tight mb-4">
              Tomar Enterprises
            </h1>
            <p className="text-muted text-base sm:text-lg leading-relaxed mb-4">
              Real Estate Agency operating across the <strong className="text-navy">Vasai Road to Palghar</strong> Western Railway corridor. We provide transparent, client-first assistance for property sales, purchases, rentals, land acquisitions, and registration coordination.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal/80">
              <span className="px-3 py-1 rounded-lg bg-ivory border border-stone font-semibold text-navy">
                Corridor: Vasai • Nalasopara • Virar • Vaitarna • Saphale • Kelve Road • Palghar
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Left Contact Info & Direct Actions | Right Business Enquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-12">
          
          {/* LEFT COLUMN: Sections B, C, D, E, I (Address, Phones, Email, WhatsApp, Office Hours) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Section B: Complete Office Address */}
            <div className="bg-white rounded-2xl border border-stone p-6 shadow-card">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-navy text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <MapPin className="w-5 h-5 text-brandRed" />
                </div>
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-muted mb-1">
                    Registered Office Address
                  </h3>
                  <p className="text-sm font-semibold text-charcoal leading-relaxed">
                    Shop No. 06, Nakshtra Apt.,<br />
                    Viva Jangid Complex, Manvelpada,<br />
                    Virar (East), Palghar, Maharashtra - 401305
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-stone/60">
                    <a
                      href={contactInfo.googleMapsSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-royal hover:text-navy underline transition-colors"
                    >
                      <span>Find on Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Section C & E: Clickable Phone Numbers & WhatsApp Contact Buttons */}
            <div className="bg-white rounded-2xl border border-stone p-6 shadow-card space-y-5">
              <h3 className="text-xs uppercase font-bold tracking-wider text-muted border-b border-stone/60 pb-3">
                Direct Contact Persons & Advisory Lines
              </h3>

              {/* Shlok Tomar */}
              <div className="p-4 rounded-xl bg-ivory border border-stone/70">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-navy">Shlok Tomar</h4>
                    <span className="text-[11px] text-muted">Client Relations & Property Sales</span>
                  </div>
                  <a
                    href={contactInfo.whatsappLinkShlok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                    title="Chat with Shlok Tomar on WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" fill="#FFFFFF" />
                    <span>WhatsApp</span>
                  </a>
                </div>
                <div className="mt-2">
                  <a
                    href="tel:9356620596"
                    className="inline-flex items-center gap-2 text-sm font-bold text-charcoal hover:text-brandRed transition-colors"
                  >
                    <Phone className="w-4 h-4 text-brandRed flex-shrink-0" />
                    <span>+91 93566 20596</span>
                  </a>
                </div>
              </div>

              {/* Sanjay Tomar */}
              <div className="p-4 rounded-xl bg-ivory border border-stone/70">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-navy">Sanjay Tomar</h4>
                    <span className="text-[11px] text-muted">Principal Real Estate Advisor</span>
                  </div>
                  <a
                    href={contactInfo.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                    title="Chat with Sanjay Tomar on WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" fill="#FFFFFF" />
                    <span>WhatsApp</span>
                  </a>
                </div>
                <div className="space-y-1.5 mt-2">
                  <div>
                    <a
                      href="tel:8237092224"
                      className="inline-flex items-center gap-2 text-sm font-bold text-charcoal hover:text-brandRed transition-colors"
                    >
                      <Phone className="w-4 h-4 text-brandRed flex-shrink-0" />
                      <span>+91 82370 92224</span>
                    </a>
                  </div>
                  <div>
                    <a
                      href="tel:9970355543"
                      className="inline-flex items-center gap-2 text-sm font-bold text-charcoal hover:text-brandRed transition-colors"
                    >
                      <Phone className="w-4 h-4 text-brandRed flex-shrink-0" />
                      <span>+91 99703 55543</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Section D: Clickable Email Address */}
            <div className="bg-white rounded-2xl border border-stone p-6 shadow-card">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-navy text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Mail className="w-5 h-5 text-brandRed" />
                </div>
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-muted mb-1">
                    Official Email Address
                  </h3>
                  <a
                    href="mailto:Sanjaykumartomar4@gmail.com"
                    className="text-sm font-bold text-navy hover:text-brandRed transition-colors break-all"
                  >
                    Sanjaykumartomar4@gmail.com
                  </a>
                  <p className="text-xs text-muted mt-1">
                    Direct communication for inquiries, documents, and property proposals.
                  </p>
                  <div className="mt-3">
                    <a
                      href={buildGmailComposeUrl({ subject: 'General Property Consultation - Tomar Enterprises' })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-royal border border-blue-200 text-xs font-bold transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-royal" />
                      <span>Compose in Gmail</span>
                      <ExternalLink className="w-3 h-3 text-royal/70" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Section I: Office Hours Section */}
            <div className="bg-white rounded-2xl border border-stone p-6 shadow-card">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-navy text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Clock className="w-5 h-5 text-royal" />
                </div>
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-muted mb-1">
                    Office Hours
                  </h3>
                  <p className="text-sm font-medium text-charcoal">
                    {contactInfo.officeHours}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Prior phone appointment is recommended for on-site property inspections and notarized consultations.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Section G (Business Enquiry Form) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-stone p-6 sm:p-8 lg:p-10 shadow-card h-full flex flex-col justify-between">
              
              {submitSuccess ? (
                /* Submission Confirmation State */
                <div className="my-auto py-12 text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-normal text-navy mb-2">
                      Enquiry Submitted Successfully
                    </h3>
                    <p className="text-muted text-sm max-w-md mx-auto">
                      Thank you, <strong className="text-navy">{submitSuccess.name}</strong>. Your enquiry for <span className="font-semibold text-charcoal">{submitSuccess.service}</span> in <span className="font-semibold text-charcoal">{submitSuccess.locality}</span> has been forwarded to our desk. A Gmail compose window has also been prepared.
                    </p>
                    <div className="inline-block mt-3 px-3 py-1 bg-ivory border border-stone rounded-md text-xs font-mono text-muted">
                      Reference: {submitSuccess.referenceId}
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={buildGmailComposeUrl({
                        subject: `Property Enquiry - ${submitSuccess.service} (${submitSuccess.locality})`,
                        clientName: submitSuccess.name,
                        clientPhone: submitSuccess.phone,
                        message: `Service: ${submitSuccess.service}\nLocality: ${submitSuccess.locality}\n\n${submitSuccess.message || ''}`,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Re-Open in Gmail</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={`https://wa.me/918237092224?text=${encodeURIComponent(
                        `Hello Tomar Enterprises, my name is ${submitSuccess.name}. I just submitted an inquiry for ${submitSuccess.service} in ${submitSuccess.locality} (Ref: ${submitSuccess.referenceId}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                    >
                      <WhatsAppIcon className="w-4 h-4" fill="#FFFFFF" />
                      <span>Continue via WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setSubmitSuccess(null);
                        setFormData({
                          name: '',
                          phone: '',
                          email: '',
                          service: 'Property Sales',
                          locality: 'Virar',
                          message: '',
                        });
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl bg-ivory hover:bg-stone/60 text-navy font-bold text-xs uppercase tracking-wider border border-stone transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                /* Enquiry Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-stone/60 pb-4 mb-2">
                    <h2 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal">
                      Send an Enquiry to Our Desk
                    </h2>
                    <p className="text-muted text-xs sm:text-sm mt-1">
                      Fill out your requirement below. Our advisors will contact you with clear guidance and property options.
                    </p>
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="contact-desk-name" className="block text-xs uppercase font-bold tracking-wider text-charcoal mb-1.5">
                      Your Full Name <span className="text-brandRed">*</span>
                    </label>
                    <input
                      id="contact-desk-name"
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border bg-ivory text-charcoal text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.name ? 'border-brandRed focus:ring-brandRed/30' : 'border-stone focus:ring-navy/30'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-brandRed mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-desk-phone" className="block text-xs uppercase font-bold tracking-wider text-charcoal mb-1.5">
                        Mobile Number <span className="text-brandRed">*</span>
                      </label>
                      <input
                        id="contact-desk-phone"
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border bg-ivory text-charcoal text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.phone ? 'border-brandRed focus:ring-brandRed/30' : 'border-stone focus:ring-navy/30'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-xs text-brandRed mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-desk-email" className="block text-xs uppercase font-bold tracking-wider text-charcoal mb-1.5">
                        Email Address <span className="text-muted font-normal">(Optional)</span>
                      </label>
                      <input
                        id="contact-desk-email"
                        type="email"
                        placeholder="e.g. client@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border bg-ivory text-charcoal text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.email ? 'border-brandRed focus:ring-brandRed/30' : 'border-stone focus:ring-navy/30'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-xs text-brandRed mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Service Requirement & Preferred Locality */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-desk-service" className="block text-xs uppercase font-bold tracking-wider text-charcoal mb-1.5">
                        Service Requirement
                      </label>
                      <select
                        id="contact-desk-service"
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-stone bg-ivory text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy/30"
                      >
                        <option value="Property Sales">Property Sales (Selling Property)</option>
                        <option value="Property Purchases">Property Purchase (Buying Home / Shop)</option>
                        <option value="Property Rentals">Property Rentals</option>
                        <option value="Flats">Flats / Apartments (1, 2, 3 BHK)</option>
                        <option value="Shops">Commercial Shops / Offices</option>
                        <option value="Bungalows">Bungalows / Row Houses</option>
                        <option value="Plots & Land">Residential / NA / Industrial Land</option>
                        <option value="Home Loan Assistance">Home Loan Assistance</option>
                        <option value="Notary-Related Assistance">Notary-Related Assistance</option>
                        <option value="Stamp Duty & Registration">Stamp Duty & Registration Assistance</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-desk-locality" className="block text-xs uppercase font-bold tracking-wider text-charcoal mb-1.5">
                        Preferred Locality
                      </label>
                      <select
                        id="contact-desk-locality"
                        value={formData.locality}
                        onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-stone bg-ivory text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy/30"
                      >
                        <option value="Virar">Virar (East & West)</option>
                        <option value="Vasai">Vasai (East & West)</option>
                        <option value="Nalasopara">Nalasopara (East & West)</option>
                        <option value="Vaitarna">Vaitarna</option>
                        <option value="Saphale">Saphale</option>
                        <option value="Kelve Road">Kelve Road</option>
                        <option value="Palghar">Palghar (East & West)</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="contact-desk-message" className="block text-xs uppercase font-bold tracking-wider text-charcoal mb-1.5">
                      Your Message or Specific Details
                    </label>
                    <textarea
                      id="contact-desk-message"
                      rows={4}
                      placeholder="Share budget, carpet area preferences, project questions or property details..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-stone bg-ivory text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting Enquiry...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Advisory Enquiry</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-2 text-center text-xs text-muted flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-royal flex-shrink-0" />
                    <span>Your contact details are strictly confidential and shared only with Tomar Enterprises.</span>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>

        {/* Section H: Business Services Overview from Visiting Card */}
        <div className="bg-white rounded-3xl border border-stone p-6 sm:p-10 lg:p-12 mb-12 shadow-card">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-royal mb-2">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Card-Verified Scope of Services</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-charcoal">
              Services Provided by Tomar Enterprises
            </h2>
            <p className="text-muted text-sm sm:text-base mt-2">
              All services are delivered in strict alignment with professional property facilitation norms across the Vasai to Palghar corridor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cardServices.map((srv, idx) => {
              const IconComp = srv.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-ivory border border-stone/70 hover:border-royal/40 transition-colors shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center mb-3">
                    <IconComp className="w-5 h-5 text-brandRed" />
                  </div>
                  <h3 className="text-sm font-bold text-navy mb-1.5">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {srv.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Official Nidhi Pramanpatra Certificate Card */}
        <div className="bg-white rounded-3xl border border-stone p-6 sm:p-10 lg:p-12 mb-12 shadow-card">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
            {/* Certificate Preview Image */}
            <div className="w-full lg:w-5/12 flex-shrink-0">
              <a
                href="/certificate/nidhi-pramanpatra.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group block relative rounded-2xl overflow-hidden border-2 border-stone hover:border-royal transition-all duration-300 shadow-md hover:shadow-xl bg-ivory"
                title="Click to view full Nidhi Pramanpatra certificate PDF"
              >
                <img
                  src="/certificate/certificate-preview.jpg"
                  alt="Nidhi Pramanpatra - Estate Consultant Vikas Mandal Registration Certificate"
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
                  Nidhi Pramanpatra
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

        {/* Section F: Google Maps Location Section */}
        <div className="bg-white rounded-3xl border border-stone p-6 sm:p-10 lg:p-12 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brandRed mb-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Office Location</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal">
                Visit Tomar Enterprises in Virar East
              </h2>
              <p className="text-muted text-xs sm:text-sm mt-1">
                Shop No. 06, Nakshtra Apt., Viva Jangid Complex, Manvelpada, Virar (East), Palghar, Maharashtra - 401305
              </p>
            </div>

            <a
              href={contactInfo.googleMapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy hover:bg-navy-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs flex-shrink-0"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Embedded Google Maps Container */}
          <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-stone shadow-inner bg-stone/20">
            <iframe
              title="Tomar Enterprises Office Location - Shop No 06, Nakshatra Apartment, Viva Jangid Complex, Virar East"
              src={contactInfo.googleMapsEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

      </div>
    </div>
  );
}
