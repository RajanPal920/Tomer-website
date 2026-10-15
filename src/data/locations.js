// Centralized Location Configuration for Tomar Enterprises
// Approved Service Region: Vasai Road to Palghar (7 Railway Station Areas)
// Strict Rule: Naigaon is excluded unless explicitly approved.
// Supports canonical resolution of spelling variations and approved micro-localities.

export const APPROVED_STATIONS = [
  {
    locationId: 'vasai-road',
    canonicalName: 'Vasai Road',
    displayName: 'Vasai Road (East & West)',
    stationName: 'Vasai Road Railway Station',
    slug: 'vasai-road',
    displayOrder: 1,
    isEnabled: true,
    tagline: 'Coastal heritage, thriving residential townships & major railway junction',
    description: 'Vasai Road is the southern gateway of the corridor, featuring well-established residential hubs like Evershine City, Babhola, and Stella, alongside seamless suburban and express train connectivity.',
    image: '/images/buildingImages/build1.png',
    keyHighlights: ['Major express & local junction', 'Evershine, Babhola & Stella hubs', 'Established civic & educational infrastructure'],
    alternativeNames: ['vasai', 'vasai road', 'vasai rd', 'vasai west', 'vasai east', 'babhola', 'evershine', 'stella'],
    localities: [
      { id: 'vasai-west', name: 'Vasai West', highlights: 'Babhola, Stella, Kaul Heritage' },
      { id: 'vasai-east', name: 'Vasai East', highlights: 'Evershine City, NH-48 link' },
    ],
  },
  {
    locationId: 'nalasopara',
    canonicalName: 'Nalasopara',
    displayName: 'Nalasopara (East & West)',
    stationName: 'Nalasopara Railway Station',
    slug: 'nalasopara',
    displayOrder: 2,
    isEnabled: true,
    tagline: 'High-density affordable housing & bustling transit-oriented commercial markets',
    description: 'A vibrant micro-market known for accessible entry-level homeownership, thriving marketplace retail along Station Road, and high rental housing demand.',
    image: '/images/buildingImages/image copy 15.png',
    keyHighlights: ['High value-for-money ticket sizes', 'Sriprastha, Patankar Park & Achole', 'High rental occupancy and returns'],
    alternativeNames: ['nalasopara', 'nallasopara', 'nalla sopara', 'nala sopara', 'nalasopara west', 'nalasopara east', 'sriprastha'],
    localities: [
      { id: 'nalasopara-west', name: 'Nalasopara West', highlights: 'Sriprastha, Patankar Park, Sopara Gaon' },
      { id: 'nalasopara-east', name: 'Nalasopara East', highlights: 'Achole Road, Central Park, Highway Link' },
    ],
  },
  {
    locationId: 'virar',
    canonicalName: 'Virar',
    displayName: 'Virar (East & West)',
    stationName: 'Virar Railway Station',
    slug: 'virar',
    displayOrder: 3,
    isEnabled: true,
    tagline: 'Originating local trains, modern master-planned townships & lifestyle amenities',
    description: 'Virar is the bustling northern terminal for Western Railway local trains. It offers expansive planned communities like Global City, sports complexes, and active society redevelopment prospects.',
    image: '/images/buildingImages/build2.png',
    keyHighlights: ['Originating local train terminal', 'Global City, Yashwant Nagar, Bolinj', 'Spacious gated residential complexes'],
    alternativeNames: ['virar', 'virar west', 'virar east', 'global city', 'yashwant nagar', 'bolinj', 'agashi'],
    localities: [
      { id: 'virar-west', name: 'Virar West', highlights: 'Global City, Yashwant Nagar, Bolinj, Agashi Road' },
      { id: 'virar-east', name: 'Virar East', highlights: 'Manvelpada, Phoolpada, Highway Bypass' },
    ],
  },
  {
    locationId: 'vaitarna',
    canonicalName: 'Vaitarna',
    displayName: 'Vaitarna',
    stationName: 'Vaitarna Railway Station',
    slug: 'vaitarna',
    displayOrder: 4,
    isEnabled: true,
    tagline: 'Scenic riverfront belt, emerging agricultural & plotted retreat land',
    description: 'Surrounded by the scenic Vaitarna river estuary and lush open expanses, this tranquil stop is an emerging region for eco-retreats, private farm lands, and long-term land parcel investments.',
    image: '/images/buildingImages/image copy 20.png',
    keyHighlights: ['Scenic Vaitarna Riverfront', 'Tranquil countryside environment', 'Farmhouse & long-horizon land potential'],
    alternativeNames: ['vaitarna', 'vaitarana', 'vaitarna station'],
    localities: [
      { id: 'vaitarna-riverfront', name: 'Vaitarna Riverfront & Rural Belt', highlights: 'Scenic open parcels' },
    ],
  },
  {
    locationId: 'saphale',
    canonicalName: 'Saphale',
    displayName: 'Saphale',
    slug: 'saphale',
    stationName: 'Saphale Railway Station',
    displayOrder: 5,
    isEnabled: true,
    tagline: 'Green countryside, agro-tourism plots, second homes & serene nature',
    description: 'Known for its peaceful greenery, proximity to Tandulwadi Fort and coastal gateways, Saphale is a popular micro-market for bungalow plots, organic retreats, and quiet residential living.',
    image: '/images/buildingImages/image copy 18.png',
    keyHighlights: ['Popular second-home & villa plotted belt', 'Proximity to Tandulwadi & agro-tourism', 'Clean air & natural countryside'],
    alternativeNames: ['saphale', 'saphale west', 'saphale east', 'tandulwadi'],
    localities: [
      { id: 'saphale-town', name: 'Saphale Station Area', highlights: 'Market & transit link' },
      { id: 'saphale-rural', name: 'Saphale Countryside', highlights: 'Agro & bungalow plots' },
    ],
  },
  {
    locationId: 'kelve-road',
    canonicalName: 'Kelve Road',
    displayName: 'Kelve Road (Kelva Beach Belt)',
    stationName: 'Kelve Road Railway Station',
    slug: 'kelve-road',
    displayOrder: 6,
    isEnabled: true,
    tagline: 'Famous coastal beach gateway, tourism plots & leisure properties',
    description: 'Famous for the picturesque Kelva Beach and suru tree plantations, Kelve Road is ideal for holiday home plots, hospitality ventures, and residential land away from urban congestion.',
    image: '/images/buildingImages/image copy 23.png',
    keyHighlights: ['Gateway to iconic Kelva Beach & Fort', 'Hospitality & agro-resort land', 'Peaceful coastal lifestyle'],
    alternativeNames: ['kelve', 'kelve road', 'kelva', 'kelva road', 'kelve beach', 'kelva beach'],
    localities: [
      { id: 'kelve-station', name: 'Kelve Road Station Zone', highlights: 'Transit & local markets' },
      { id: 'kelve-beach-belt', name: 'Kelva Beach Coastal Corridor', highlights: 'Resort & holiday home plots' },
    ],
  },
  {
    locationId: 'palghar',
    canonicalName: 'Palghar',
    displayName: 'Palghar (District Capital & Town)',
    stationName: 'Palghar Railway Station',
    slug: 'palghar',
    displayOrder: 7,
    isEnabled: true,
    tagline: 'Palghar District administrative capital, sanctioned NA plots & institutional hub',
    description: 'The administrative heart of Palghar District, featuring the new Collectorate complex, expanding broad road networks, educational institutions, and high-potential collector-sanctioned NA land layouts.',
    image: '/images/buildingImages/image copy 14.png',
    keyHighlights: ['District administrative headquarters', 'Collector sanctioned NA plots & townships', 'Expanding institutional & highway infrastructure'],
    alternativeNames: ['palghar', 'palghar west', 'palghar east', 'palghar town', 'manor road', 'mahim road'],
    localities: [
      { id: 'palghar-west', name: 'Palghar West & Mahim Road', highlights: 'Town center & administrative zone' },
      { id: 'palghar-east', name: 'Palghar East & Manor Road', highlights: 'Highway link & plotted expansions' },
    ],
  },
];

// Locations flagged for review (outside approved primary 7-station corridor)
export const FLAGGED_LOCATIONS = [
  {
    locationId: 'boisar',
    canonicalName: 'Boisar',
    displayName: 'Boisar (MIDC & Residential)',
    stationName: 'Boisar Railway Station',
    slug: 'boisar',
    isOutsidePrimaryServiceArea: true,
    reviewStatus: 'Pending client confirmation for extension beyond Palghar',
    description: 'Major industrial powerhouse north of Palghar district capital.',
    alternativeNames: ['boisar', 'boisar midc', 'tarapur'],
  },
];

export const APPROVED_LOCATION_IDS = APPROVED_STATIONS.map((loc) => loc.locationId);

/**
 * Dropdown options list for search panels and form dropdowns (Strictly 7 approved stations)
 */
export const LOCATION_DROPDOWN_OPTIONS = [
  { id: 'all', label: 'All Locations (Vasai to Palghar Corridor)' },
  ...APPROVED_STATIONS.map((loc) => ({
    id: loc.locationId,
    label: loc.displayName,
    canonicalName: loc.canonicalName,
  })),
];

export function isLocationInApprovedCorridor(locationId) {
  if (!locationId || locationId === 'all') return true;
  const resolved = resolveCanonicalLocation(locationId);
  if (!resolved) return false;
  return APPROVED_STATIONS.some((st) => st.locationId === resolved.locationId);
}

/**
 * Resolves any spelling variation or alias to the canonical location object or null.
 * Handles cases like "Vasai", "Kelva Road", "Nallasopara", "Saphale".
 */
export function resolveCanonicalLocation(searchTerm) {
  if (!searchTerm) return null;
  const term = String(searchTerm).toLowerCase().trim();

  if (term === 'all') return null;

  for (const station of APPROVED_STATIONS) {
    if (station.locationId.toLowerCase() === term || station.slug.toLowerCase() === term) {
      return station;
    }
    if (station.canonicalName.toLowerCase() === term) {
      return station;
    }
    if (station.alternativeNames.some((alias) => alias.toLowerCase() === term || term.includes(alias.toLowerCase()))) {
      return station;
    }
  }

  // Check flagged locations
  for (const flagged of FLAGGED_LOCATIONS) {
    if (flagged.locationId.toLowerCase() === term || flagged.slug.toLowerCase() === term) {
      return flagged;
    }
    if (flagged.alternativeNames.some((alias) => alias.toLowerCase() === term)) {
      return flagged;
    }
  }

  return null;
}

/**
 * Gets clean display name for a location ID
 */
export function getLocationDisplayName(locationId) {
  if (!locationId || locationId === 'all') return 'All Locations (Vasai to Palghar)';
  const resolved = resolveCanonicalLocation(locationId);
  return resolved ? resolved.displayName || resolved.canonicalName : locationId;
}
