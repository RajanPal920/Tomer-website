// Centralized locality data for Vasai to Palghar corridor
// Re-exports and integrates with centralized locations configuration

import {
  APPROVED_STATIONS,
  LOCATION_DROPDOWN_OPTIONS,
  resolveCanonicalLocation,
  getLocationDisplayName,
} from './locations.js';

export const LOCALITY_OPTIONS = LOCATION_DROPDOWN_OPTIONS;

export const localities = APPROVED_STATIONS.map((station) => ({
  id: station.locationId,
  name: station.canonicalName,
  region: station.displayName,
  tagline: station.tagline,
  description: station.description,
  image: station.image,
  keyHighlights: station.keyHighlights,
  propertyTypes: ['1, 2 & 3 BHK Flats', 'Commercial Retail', 'NA Plotted Land'],
  localities: station.localities,
  slug: station.slug,
}));

export function getLocalityDisplayName(localityId) {
  return getLocationDisplayName(localityId);
}

export {
  APPROVED_STATIONS,
  LOCATION_DROPDOWN_OPTIONS,
  resolveCanonicalLocation,
  getLocationDisplayName,
};
