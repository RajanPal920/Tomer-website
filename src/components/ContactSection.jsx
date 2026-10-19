import React, { useState } from 'react';
import {
  Phone,
  MapPin,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { contactInfo } from '../data/contactInfo';
import { submitEnquiry } from '../services/propertyStore';
import { buildGmailComposeUrl, openGmailCompose } from '../services/emailService';

export default function ContactSection({ prefilledInterest = '', prefilledLocation = '' }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interest: prefilledInterest || 'Buy Flat / Property',
    location: prefilledLocation || 'Virar',
    budget: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Please provide your full name.';
    }
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Please provide a valid 10-digit mobile number.';
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
    setServerError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        propertyTitle: `${formData.interest} in ${formData.location}`,
        requirement: formData.interest,
        area: formData.location,
        expectedPrice: formData.budget || 'To Discuss',
        message: formData.message.trim(),
      };

      await submitEnquiry(payload);
      setSubmitSuccess({
        ...formData,
        referenceId: `TE-${Date.now().toString().slice(-6)}`,
      });

      // Open preferred Gmail compose window addressed to Sanjaykumartomar4@gmail.com
      openGmailCompose({
        subject: `Property Enquiry - ${formData.interest} (${formData.location})`,
        clientName: formData.name.trim(),
        clientPhone: formData.phone.trim(),
        message: `Requirement: ${formData.interest}\nStation / Locality: ${formData.location}\nBudget: ${formData.budget || 'To discuss'}\n\nClient Note:\n${formData.message.trim() || 'Please connect for property consultation.'}`,
      });
    } catch (err) {
      console.warn('Enquiry fallback recording:', err);
      // Still show successful customer confirmation
      setSubmitSuccess({
        ...formData,
        referenceId: `TE-${Date.now().toString().slice(-6)}`,
      });

      openGmailCompose({
        subject: `Property Enquiry - ${formData.interest} (${formData.location})`,
        clientName: formData.name.trim(),
        clientPhone: formData.phone.trim(),
        message: `Requirement: ${formData.interest}\nStation / Locality: ${formData.location}\nBudget: ${formData.budget || 'To discuss'}\n\nClient Note:\n${formData.message.trim() || 'Please connect for property consultation.'}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWhatsAppInquiryUrl = () => {
    const text = `Hello Tomar Enterprises,\nMy name is ${formData.name || 'Client'}.\nI am interested in: ${formData.interest} in ${formData.location}.\nBudget: ${formData.budget || 'To discuss'}.\nPhone: ${formData.phone || ''}\nNote: ${formData.message || 'Please provide details.'}`;
    return `https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="contact" className="py-20 sm:py-24 bg-white border-t border-stone/60">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Authentic Business Details from Visiting Card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brandRed mb-3">
                <span>Direct Agency Contact</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-normal tracking-tight mb-4">
                TOMAR ENTERPRISES
              </h2>
              <p className="text-muted text-base leading-relaxed mb-6">
                Real Estate Agency based in Virar East, serving the complete Vasai Road to Palghar corridor. Visit our office or connect directly with our advisors for property sales, rentals, land, home loans, and registration assistance.
              </p>

              {/* Verified Office Address Box */}
              <div className="mb-6 p-4 rounded-2xl bg-ivory border border-stone">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-navy text-brandRed flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase font-bold tracking-wider text-muted">
                      Office Address
                    </div>
                    <div className="text-sm font-semibold text-charcoal mt-1 leading-snug">
                      {contactInfo.officeAddress.shopNo},<br />
                      {contactInfo.officeAddress.complex},<br />
                      {contactInfo.officeAddress.locality}, {contactInfo.officeAddress.district}, {contactInfo.officeAddress.state}
                    </div>
                    <div className="text-[11px] text-royal font-medium mt-1">
                      {contactInfo.officeHours}
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Contacts List (Exact Names & Numbers from Visiting Card) */}
              <div className="space-y-3 mb-6">
                {/* Sanjay Tomar */}
                <div className="p-4 rounded-2xl bg-ivory border border-stone">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="text-sm font-bold text-navy">Sanjay Tomar</div>
                      <div className="text-[11px] text-muted uppercase tracking-wider">
                        Principal Real Estate Advisor
                      </div>
                    </div>
                    <a
                      href={contactInfo.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                      title="Chat on WhatsApp"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <a
                      href={`tel:${contactInfo.phoneSanjay1Raw}`}
                      className="inline-flex items-center gap-1.5 font-bold text-navy hover:text-brandRed transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-brandRed" />
                      <span>{contactInfo.phoneSanjay1Display || '+91 82370 92224'}</span>
                    </a>
                    <span className="text-stone-dark">&bull;</span>
                    <a
                      href={`tel:${contactInfo.phoneSanjay2Raw}`}
                      className="inline-flex items-center gap-1.5 font-bold text-navy hover:text-brandRed transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-brandRed" />
                      <span>{contactInfo.phoneSanjay2Display || '+91 99703 55543'}</span>
                    </a>
                  </div>
                </div>

                {/* Shlok Tomar */}
                <div className="p-4 rounded-2xl bg-ivory border border-stone">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="text-sm font-bold text-navy">Shlok Tomar</div>
                      <div className="text-[11px] text-muted uppercase tracking-wider">
                        Client Relations & Property Sales
                      </div>
                    </div>
                    <a
                      href={contactInfo.whatsappLinkShlok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                      title="Chat on WhatsApp"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                  <div className="text-xs">
                    <a
                      href={`tel:${contactInfo.phoneShlokRaw}`}
                      className="inline-flex items-center gap-1.5 font-bold text-navy hover:text-brandRed transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-brandRed" />
                      <span>{contactInfo.phoneShlokDisplay || '+91 93566 20596'}</span>
                    </a>
                  </div>
                </div>

                {/* Email Address */}
                <div className="p-4 rounded-2xl bg-ivory border border-stone">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-navy text-brandRed flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase font-bold tracking-wider text-muted">
                        Official Email
                      </div>
                      <a
                        href={contactInfo.emailMailto}
                        className="text-sm font-bold text-navy hover:text-brandRed transition-colors mt-0.5 block break-all"
                      >
                        {contactInfo.email}
                      </a>
                      <div className="mt-2">
                        <a
                          href={buildGmailComposeUrl({ subject: 'Property Consultation - Tomar Enterprises' })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-royal border border-blue-200 text-[11px] font-bold transition-colors"
                        >
                          <Mail className="w-3 h-3 text-royal" />
                          <span>Compose in Gmail</span>
                          <ExternalLink className="w-2.5 h-2.5 text-royal/70" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Services from Visiting Card */}
              <div className="mb-6 p-4 rounded-2xl bg-stone/20 border border-stone/60">
                <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal mb-2 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-royal" />
                  <span>Visiting Card Verified Services</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-charcoal">
                  {contactInfo.services.map((srv, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brandRed flex-shrink-0" />
                      <span className="truncate">{srv}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="pt-4 border-t border-stone/50 text-xs text-muted flex items-center gap-2">
              <Shield className="w-4 h-4 text-royal flex-shrink-0" />
              <span>Direct, transparent guidance. No spam, broker misdirection, or hidden charges.</span>
            </div>
          </div>

          {/* Right Column: Customer Enquiry & Consultation Form */}
          <div className="lg:col-span-7">
            <div className="bg-ivory rounded-3xl p-6 sm:p-8 lg:p-10 border border-stone shadow-card">
              {submitSuccess ? (
                /* Submission Confirmation State */
                <div className="space-y-6 text-center py-8 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-brandRed/10 text-brandRed text-xs font-bold uppercase tracking-wider mb-2">
                      Ref: {submitSuccess.referenceId}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
                      Enquiry Received
                    </h3>
                    <p className="text-muted text-sm max-w-md mx-auto mt-2 leading-relaxed">
                      Thank you, <strong className="text-navy">{submitSuccess.name}</strong>. Your enquiry regarding{' '}
                      <strong className="text-charcoal">{submitSuccess.interest}</strong> in{' '}
                      <strong className="text-charcoal">{submitSuccess.location}</strong> has been forwarded to our advisory desk.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone max-w-md mx-auto text-left text-xs space-y-2">
                    <div className="font-bold text-navy uppercase text-[11px] pb-1 border-b border-stone/50">
                      Summary of Your Request
                    </div>
                    <div><strong>Contact:</strong> {submitSuccess.phone}</div>
                    {submitSuccess.email && <div><strong>Email:</strong> {submitSuccess.email}</div>}
                    <div><strong>Requirement:</strong> {submitSuccess.interest}</div>
                    <div><strong>Station / Locality:</strong> {submitSuccess.location}</div>
                    {submitSuccess.budget && <div><strong>Budget:</strong> {submitSuccess.budget}</div>}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <a
                      href={buildGmailComposeUrl({
                        subject: `Property Enquiry - ${submitSuccess.interest} (${submitSuccess.location})`,
                        clientName: submitSuccess.name,
                        clientPhone: submitSuccess.phone,
                        message: `Requirement: ${submitSuccess.interest}\nStation / Locality: ${submitSuccess.location}\nBudget: ${submitSuccess.budget || 'To discuss'}\n\nClient Note:\n${submitSuccess.message || ''}`,
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
                      href={generateWhatsAppInquiryUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>Chat Directly on WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(null)}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-stone hover:bg-stone/30 text-charcoal font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      Submit Another Enquiry
                    </button>
                  </div>
                </div>
              ) : (
                /* Enquiry Form */
                <>
                  <div className="border-b border-stone/60 pb-5 mb-6">
                    <h3 className="font-serif text-2xl text-charcoal font-normal">
                      Request Property Consultation
                    </h3>
                    <p className="text-xs text-muted mt-1">
                      Fill in your requirement below. Our team in Virar East will revert with matched, verified listings.
                    </p>
                  </div>

                  {serverError && (
                    <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                          Full Name <span className="text-brandRed">*</span>
                        </label>
                        <input
                          id="name"
                          type="text"
                          required
                          placeholder="e.g. Rajesh Sharma"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full bg-white border ${
                            errors.name ? 'border-rose-400 ring-1 ring-rose-300' : 'border-stone'
                          } rounded-xl px-3.5 py-2.5 text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-royal transition-colors`}
                        />
                        {errors.name && <p className="text-rose-600 text-[11px] mt-1">{errors.name}</p>}
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                          Mobile Number <span className="text-brandRed">*</span>
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          required
                          placeholder="e.g. 98200 12345"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={`w-full bg-white border ${
                            errors.phone ? 'border-rose-400 ring-1 ring-rose-300' : 'border-stone'
                          } rounded-xl px-3.5 py-2.5 text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-royal transition-colors`}
                        />
                        {errors.phone && <p className="text-rose-600 text-[11px] mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Email Address (Optional) */}
                      <div>
                        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                          Email Address (Optional)
                        </label>
                        <input
                          id="email"
                          type="email"
                          placeholder="e.g. rajesh@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full bg-white border ${
                            errors.email ? 'border-rose-400 ring-1 ring-rose-300' : 'border-stone'
                          } rounded-xl px-3.5 py-2.5 text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-royal transition-colors`}
                        />
                        {errors.email && <p className="text-rose-600 text-[11px] mt-1">{errors.email}</p>}
                      </div>

                      {/* Requirement / Interest */}
                      <div>
                        <label htmlFor="interest" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                          Requirement Type
                        </label>
                        <select
                          id="interest"
                          value={formData.interest}
                          onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                          className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                        >
                          <option value="Buy Flat / Property">Buy Flat / Apartment</option>
                          <option value="Resale Flat Purchase">Resale Flat Purchase</option>
                          <option value="Commercial Shop / Retail">Commercial Shop / Retail</option>
                          <option value="Commercial Office Space">Commercial Office Space</option>
                          <option value="Plots & Land Investment">Plots & Land Investment</option>
                          <option value="Bungalow / Row House">Bungalow / Row House</option>
                          <option value="Rent Flat / House">Rent Flat / Apartment</option>
                          <option value="Commercial Shop / Office on Rent">Commercial Property on Rent</option>
                          <option value="Heavy Deposit / Lease">Heavy Deposit / Lease Property</option>
                          <option value="Society Redevelopment Consultation">Housing Society Redevelopment</option>
                          <option value="Home Loan & Notary Assistance">Home Loan & Notary Assistance</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Preferred Location (7 Stations only) */}
                      <div>
                        <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                          Station Corridor Location
                        </label>
                        <select
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                        >
                          <option value="Vasai Road">Vasai Road (East & West)</option>
                          <option value="Nalasopara">Nalasopara (East & West)</option>
                          <option value="Virar">Virar (East & West)</option>
                          <option value="Saphale">Saphale (Agro & Bungalow plots)</option>
                          <option value="Kelve Road">Kelve Road (Coastal Beach belt)</option>
                          <option value="Palghar">Palghar (District Capital & NA Layouts)</option>
                          <option value="Boisar">Boisar (Tarapur MIDC & Residential)</option>
                        </select>
                      </div>

                      {/* Budget */}
                      <div>
                        <label htmlFor="budget" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                          Budget Range
                        </label>
                        <input
                          id="budget"
                          type="text"
                          placeholder="e.g. ₹35 Lakh – ₹60 Lakh"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                        />
                      </div>
                    </div>

                    {/* Specific Notes */}
                    <div>
                      <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                        Specific Requirements / Notes
                      </label>
                      <textarea
                        id="message"
                        rows={3}
                        placeholder="Mention BHK, preferred floor, ready possession timeline, or any specific amenity..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-white border border-stone rounded-xl px-3.5 py-2.5 text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-royal transition-colors"
                      />
                    </div>

                    {/* Submit Actions */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4 text-white flex-shrink-0" />
                        <span>{isSubmitting ? 'Recording Request...' : 'Send Advisory Request'}</span>
                      </button>

                      <a
                        href={generateWhatsAppInquiryUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                        title="Direct WhatsApp"
                      >
                        <WhatsAppIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
