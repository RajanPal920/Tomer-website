import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send, CheckCircle2, AlertCircle, Shield, Mail, ExternalLink } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { contactInfo } from '../data/contactInfo';
import { submitEnquiry } from '../services/propertyStore';
import { buildGmailComposeUrl, buildMailtoUrl, openGmailCompose } from '../services/emailService';

export default function EnquiryModal({ initialData, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    initialData?.title ? `I would like to enquire about: ${initialData.title} (${initialData.priceDisplay || initialData.priceFormatted || 'Consultation'})` : ''
  );
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!initialData) return null;

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Please enter your full name.';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number.';
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please provide a valid email address.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      await submitEnquiry({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        propertyTitle: initialData.title || 'General Property Consultation',
        requirement: initialData.category || initialData.transactionType || 'Enquiry',
        area: initialData.locality || 'Vasai to Palghar',
        message: message.trim(),
      });
    } catch (err) {
      console.warn('Enquiry store fallback sync:', err);
    }

    setIsSubmitting(false);
    setIsSuccess(true);

    // Open preferred Gmail compose window addressed to Sanjaykumartomar4@gmail.com
    openGmailCompose({
      property: initialData,
      clientName: name.trim(),
      clientPhone: phone.trim(),
      message: message.trim(),
    });
  };

  const getWhatsAppLink = () => {
    const text = `Hello Tomar Enterprises,\nMy name is ${name || 'Client'}.\nI am enquiring about: ${initialData.title || initialData.category || 'Property Consultation'}.\nMobile: ${phone}\nMessage: ${message || 'Please provide details.'}`;
    return `https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const gmailComposeUrl = buildGmailComposeUrl({
    property: initialData,
    clientName: name.trim(),
    clientPhone: phone.trim(),
    message: message.trim(),
  });

  const mailtoFallbackUrl = buildMailtoUrl({
    property: initialData,
    clientName: name.trim(),
    clientPhone: phone.trim(),
    message: message.trim(),
  });

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-modal border border-stone overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-navy text-white flex items-center justify-between border-b border-navy-700">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brandRed" />
            <span className="font-serif text-lg font-normal">Property Enquiry</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white hover:text-stone-light hover:bg-white/10 transition-colors"
            aria-label="Close enquiry modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7">
          {isSuccess ? (
            <div className="space-y-4 animate-fadeIn text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl text-charcoal font-normal">
                Enquiry Ready to Send
              </h3>
              <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto">
                Your enquiry has been formatted for <strong className="text-navy">{contactInfo.email}</strong>. A Gmail compose window has been prepared. You can review and click Send directly in Gmail.
              </p>

              <div className="pt-2 flex flex-col gap-2.5">
                <a
                  href={gmailComposeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>Open in Gmail Compose</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={mailtoFallbackUrl}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-ivory hover:bg-stone/50 text-navy border border-stone font-semibold text-xs uppercase tracking-wider transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-royal" />
                  <span>Open in Default Mail Client (Mailto)</span>
                </a>

                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Forward to WhatsApp Desk</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 px-4 rounded-lg bg-stone/30 hover:bg-stone/60 text-charcoal font-medium text-xs transition-colors mt-1"
                >
                  Done & Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Prefilled Subject Banner */}
              <div className="p-3 bg-ivory rounded-lg border border-stone/80 text-xs">
                <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">Regarding</span>
                <span className="font-bold text-navy text-sm block truncate">
                  {initialData.title || 'General Property Advisory Consultation'}
                </span>
                {initialData.priceFormatted && (
                  <span className="text-brandRed font-semibold">
                    {initialData.priceFormatted} &bull; {initialData.locality || 'Vasai to Palghar'}
                  </span>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sumeet Kadam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-white border ${
                    errors.name ? 'border-rose-400' : 'border-stone'
                  } rounded-md px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 98200 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full bg-white border ${
                    errors.phone ? 'border-rose-400' : 'border-stone'
                  } rounded-md px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Email Address <span className="text-muted font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. sumeet@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-white border ${
                    errors.email ? 'border-rose-400' : 'border-stone'
                  } rounded-md px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Message / Preference
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Specify floor, budget range or specific inquiry..."
                  className="w-full bg-white border border-stone rounded-md px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-royal"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Enquiry Request'}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted text-center pt-1">
                <Shield className="w-3 h-3 text-royal" />
                <span>Your information is kept confidential for property consultation only.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
