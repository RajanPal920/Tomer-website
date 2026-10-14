// Email & Gmail Compose Integration Service for Tomar Enterprises
// Dedicated recipient: Sanjaykumartomar4@gmail.com

export const BUSINESS_EMAIL = 'Sanjaykumartomar4@gmail.com';

/**
 * Builds the preferred Gmail Web Compose URL with RFC-compliant parameter encoding
 */
export function buildGmailComposeUrl({ property = null, message = '', clientName = '', clientPhone = '', subject = '', body = '' } = {}) {
  const recipient = BUSINESS_EMAIL;

  let finalSubject = subject;
  if (!finalSubject) {
    if (property && property.title) {
      finalSubject = `Property Enquiry - ${property.title}`;
    } else {
      finalSubject = 'Property Enquiry - Tomar Enterprises';
    }
  }

  let finalBody = body;
  if (!finalBody) {
    const propTitle = property?.title || 'General Property Advisory Consultation';
    const propLocation = property?.subLocation || property?.locality || 'Vasai to Palghar Corridor';
    let propUrl = '';
    if (typeof window !== 'undefined') {
      if (property?.slug) {
        propUrl = `${window.location.origin}/properties/${property.slug}`;
      } else {
        propUrl = window.location.href;
      }
    }

    const clientDetails = [];
    if (clientName) clientDetails.push(`Name: ${clientName}`);
    if (clientPhone) clientDetails.push(`Phone: ${clientPhone}`);

    finalBody = `Hello Tomar Enterprises,

I would like to enquire about the following property.

Property: ${propTitle}
Location: ${propLocation}${propUrl ? `\nProperty Link: ${propUrl}` : ''}${clientDetails.length > 0 ? `\n\nClient Details:\n${clientDetails.join('\n')}` : ''}${message ? `\n\nMessage / Preferences:\n${message}` : ''}

Please contact me with more information.

Thank you.`;
  }

  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: recipient,
    su: finalSubject,
    body: finalBody,
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

/**
 * Builds standard mailto URL fallback
 */
export function buildMailtoUrl({ property = null, message = '', clientName = '', clientPhone = '', subject = '', body = '' } = {}) {
  const recipient = BUSINESS_EMAIL;
  const finalSubject = subject || (property?.title ? `Property Enquiry - ${property.title}` : 'Property Enquiry - Tomar Enterprises');

  const propTitle = property?.title || 'General Property Advisory Consultation';
  const propLocation = property?.subLocation || property?.locality || 'Vasai to Palghar Corridor';
  let propUrl = '';
  if (typeof window !== 'undefined') {
    if (property?.slug) {
      propUrl = `${window.location.origin}/properties/${property.slug}`;
    } else {
      propUrl = window.location.href;
    }
  }

  const clientDetails = [];
  if (clientName) clientDetails.push(`Name: ${clientName}`);
  if (clientPhone) clientDetails.push(`Phone: ${clientPhone}`);

  const finalBody = body || `Hello Tomar Enterprises,\n\nI would like to enquire about the following property.\n\nProperty: ${propTitle}\nLocation: ${propLocation}${propUrl ? `\nProperty Link: ${propUrl}` : ''}${clientDetails.length > 0 ? `\n\nClient Details:\n${clientDetails.join('\n')}` : ''}${message ? `\n\nMessage / Preferences:\n${message}` : ''}\n\nPlease contact me with more information.\n\nThank you.`;

  return `mailto:${recipient}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(finalBody)}`;
}

/**
 * Opens Gmail compose in a new tab safely
 */
export function openGmailCompose(options = {}) {
  const url = buildGmailComposeUrl(options);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
