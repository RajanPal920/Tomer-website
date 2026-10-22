// Centralized contact & business configuration for TOMAR ENTERPRISES
// Sourced strictly from the client visiting card.
// Dedicated Service Corridor: Vasai Road to Palghar (7 Station Corridor)

export const contactInfo = {
  // Business Identity
  brandName: "TOMAR ENTERPRISES",
  businessType: "Real Estate Agency",
  tagline: "Vasai Road to Boisar Real Estate & Property Advisory",
  serviceRegion: "Vasai Road – Nalasopara – Virar – Saphale – Kelve Road – Palghar – Boisar",
  shortServiceArea: "Vasai Road to Boisar (7 Station Corridor)",
  locationBadge: "Virar East, Palghar District & Vasai Corridor",

  // Business Services (Exact from visiting card)
  services: [
    "Property Sales",
    "Property Purchase Assistance",
    "Property Rentals",
    "Flats",
    "Shops",
    "Bungalows",
    "Home Loan Assistance",
    "Notary Assistance",
    "Stamp Duty and Registration Assistance",
  ],

  // Office Address (Exact from visiting card)
  officeAddress: {
    shopNo: "Shop No. 06, Nakshtra Apt.",
    complex: "Viva Jangid Complex, Manvelpada",
    locality: "Virar (East)",
    district: "Palghar - 401305",
    state: "Maharashtra, India",
    full: "Shop No. 06, Nakshtra Apt., Viva Jangid Complex, Manvelpada, Virar (East), Palghar, Maharashtra - 401305",
    short: "Shop No. 06, Nakshtra Apt., Viva Jangid Complex, Manvelpada, Virar (East), Palghar - 401305",
  },

  // Contact Persons & Numbers (Exact from visiting card)
  contacts: [
    {
      name: "Sanjay Tomar",
      role: "Principal Real Estate Advisor",
      phones: [
        { display: "+91 82370 92224", raw: "+918237092224", isWhatsApp: true },
        { display: "+91 9156915329", raw: "+919156915329", isWhatsApp: true },
      ],
      primaryPhone: "+91 82370 92224",
      primaryPhoneRaw: "+918237092224",
      isPrimaryWhatsApp: true,
    },
    {
      name: "Shlok Tomar",
      role: "Client Relations & Sales",
      phones: [
        { display: "+91 93566 20596", raw: "+919356620596", isWhatsApp: true },
      ],
      primaryPhone: "+91 93566 20596",
      primaryPhoneRaw: "+919356620596",
      isPrimaryWhatsApp: false,
    },
  ],

  // Direct Phone Numbers for quick access
  phoneSanjay1: "8237092224",
  phoneSanjay1Display: "+91 82370 92224",
  phoneSanjay1Raw: "+918237092224",
  phoneSanjay2: "9156915329",
  phoneSanjay2Display: "+91 9156915329",
  phoneSanjay2Raw: "+919156915329",
  phoneShlok: "9356620596",
  phoneShlokDisplay: "+91 93566 20596",
  phoneShlokRaw: "+919356620596",

  // Primary Default Contact
  phoneDisplay: "+91 82370 92224",
  phoneRaw: "+918237092224",

  // Confirmed WhatsApp Numbers (India country code 91, no +, spaces, or dashes in wa.me)
  whatsappNumber: "918237092224",
  whatsappDisplay: "+91 82370 92224",
  whatsappNumberShlok: "919356620596",
  whatsappDisplayShlok: "+91 93566 20596",
  defaultWhatsAppMessage: "Hello Tomar Enterprises, I would like to enquire about a property.",
  whatsappLink: "https://wa.me/918237092224?text=Hello%20Tomar%20Enterprises,%20I%20would%20like%20to%20enquire%20about%20a%20property.",
  whatsappLinkShlok: "https://wa.me/919356620596?text=Hello%20Tomar%20Enterprises,%20I%20would%20like%20to%20enquire%20about%20a%20property.",

  // Email (Exact from visiting card: Sanjaykumartomar4@gmail.com)
  email: "Sanjaykumartomar4@gmail.com",
  emailMailto: "mailto:Sanjaykumartomar4@gmail.com",

  // Office Hours (Configurable notice as requested)
  officeHours: "Please contact us to confirm office hours.",

  // Google Maps Search & Embed Links
  googleMapsQuery: "Shop No. 06, Nakshtra Apt., Viva Jangid Complex, Manvelpada, Virar (East), Palghar, Maharashtra - 401305",
  googleMapsSearchUrl: "https://www.google.com/maps/search/?api=1&query=Shop+No.+06,+Nakshtra+Apt.,+Viva+Jangid+Complex,+Manvelpada,+Virar+(East),+Palghar,+Maharashtra+-+401305",
  googleMapsEmbedUrl: "https://maps.google.com/maps?q=Shop+No.+06,+Nakshtra+Apt.,+Viva+Jangid+Complex,+Manvelpada,+Virar+(East),+Palghar,+Maharashtra+-+401305&t=&z=15&ie=UTF8&iwloc=&output=embed",

  // Core Value Pillars
  values: [
    "Transparent Real Estate Advisory",
    "Vasai Road to Palghar Corridor Expertise",
    "Flats, Shops, Bungalows & NA Land Plots",
    "Stamp Duty, Registration & Loan Assistance",
  ],

  // Official MahaRERA Government Registration
  reraRegistration: {
    authority: "Maharashtra Real Estate Regulatory Authority",
    form: "FORM 'H' [See rule 12(1)(b)]",
    certificateNumber: "A99000043480",
    agentName: "Sanjay Mewalal Tomar",
    registeredOffice: "Tahsil: Vasai, District: Palghar, Pin-401305",
    validFrom: "14/06/2023",
    validTill: "14/06/2028",
    certificateImageUrl: "/images/certificates/maharera-certificate.jpg",
  },
  reraNumber: "A99000043480",
  reraCertificateUrl: "/images/certificates/maharera-certificate.jpg",

  // Server state
  demoMode: false,
  isBackendConnected: true,
};
