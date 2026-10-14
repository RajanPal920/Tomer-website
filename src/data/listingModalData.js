// Property Listing Taxonomies & Requirements for Tomar Enterprises

export const PROPERTY_TYPES_BY_CATEGORY = [
  {
    category: 'Residential',
    options: [
      { id: 'new-flat', label: 'New Flat' },
      { id: 'resale-flat', label: 'Resale Flat' },
      { id: 'residential-apartment', label: 'Residential Apartment' },
      { id: 'residential-house-villa', label: 'Residential House / Villa' },
      { id: 'residential-plot', label: 'Residential Plot' },
      { id: 'na-plot', label: 'NA Plot' },
    ],
  },
  {
    category: 'Commercial',
    options: [
      { id: 'commercial-shop', label: 'Commercial Shop' },
      { id: 'commercial-office', label: 'Commercial Office' },
      { id: 'commercial-unit', label: 'Commercial Unit' },
      { id: 'commercial-land', label: 'Commercial Land' },
    ],
  },
  {
    category: 'Plots and Land',
    options: [
      { id: 'plot-residential', label: 'Plot for Residential Use' },
      { id: 'plot-commercial', label: 'Plot for Commercial Use' },
      { id: 'industrial-plot', label: 'Industrial Plot' },
      { id: 'agricultural-land', label: 'Agricultural Land' },
    ],
  },
  {
    category: 'Rental and Leasing',
    options: [
      { id: 'residential-rent', label: 'Residential Property for Rent' },
      { id: 'commercial-rent', label: 'Commercial Property for Rent' },
      { id: 'lease-property', label: 'Lease Property' },
      { id: 'heavy-deposit-property', label: 'Heavy-Deposit Property' },
    ],
  },
  {
    category: 'Development',
    options: [
      { id: 'new-development-project', label: 'New Development / Under-Construction Project' },
      { id: 'redevelopment-property', label: 'Redevelopment Property' },
      { id: 'society-redevelopment', label: 'Society Redevelopment Opportunity' },
      { id: 'plotting-project', label: 'Land / Plotting Project' },
    ],
  },
];

// Flat list of all property types for easy lookup
export const ALL_PROPERTY_TYPE_OPTIONS = PROPERTY_TYPES_BY_CATEGORY.flatMap((c) => c.options);

// 6 Clear & Mutually Exclusive Transaction Requirements
export const REQUIREMENT_OPTIONS = [
  { id: 'Sell', label: 'Sell' },
  { id: 'Rent Out', label: 'Rent Out' },
  { id: 'Lease', label: 'Lease' },
  { id: 'Heavy Deposit', label: 'Heavy Deposit' },
  { id: 'Redevelopment', label: 'Redevelopment' },
  { id: 'Development / Joint Development', label: 'Development / Joint Development' },
];
