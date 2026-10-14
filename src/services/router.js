// Client-Side Router Hook for Tomar Enterprises
// Supports clean URLs without full page reloads, browser history (back/forward), and URL query parameters.

import { useState, useEffect, useCallback } from 'react';

/**
 * Parses a pathname into a structured route object
 */
export function parseRoute(pathname = '/') {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  // 1. Home
  if (cleanPath === '/' || cleanPath === '') {
    return { view: 'home' };
  }

  // 2. Listing Pages
  if (cleanPath === '/properties') {
    return { view: 'listings', tab: 'all', title: 'All Property Opportunities' };
  }
  if (cleanPath === '/buy') {
    return { view: 'listings', tab: 'buy', title: 'Properties for Sale (New & Resale)' };
  }
  if (cleanPath === '/rent') {
    return { view: 'listings', tab: 'rentals', title: 'Rental Properties' };
  }
  if (cleanPath === '/commercial') {
    return { view: 'listings', tab: 'commercial', title: 'Commercial Properties & Spaces' };
  }
  if (cleanPath === '/plots' || cleanPath === '/plots-land') {
    return { view: 'listings', tab: 'plots-land', title: 'Plots & Land Opportunities' };
  }
  if (cleanPath === '/lease' || cleanPath === '/heavy-deposit') {
    return { view: 'listings', tab: 'lease-heavy-deposit', title: 'Lease & Heavy Deposit Properties' };
  }

  // 3. Property Detail: SEO-friendly /properties/:slug and backwards-compatible /property/:slug
  const propMatch = cleanPath.match(/^\/(?:properties|property)\/([^/]+)/i);
  if (propMatch) {
    return { view: 'property-detail', slug: propMatch[1] };
  }

  // 4. Location Landing Pages: /locations/:slug
  const locMatch = cleanPath.match(/^\/locations\/([^/]+)/i);
  if (locMatch) {
    return { view: 'location', slug: locMatch[1].toLowerCase() };
  }

  // 5. Tools
  if (cleanPath === '/tools' || cleanPath === '/tools/emi-calculator') {
    return { view: 'tools', tool: 'emi' };
  }
  if (cleanPath === '/tools/plot-area-converter' || cleanPath === '/tools/area-converter') {
    return { view: 'tools', tool: 'converter' };
  }

  // 6. Projects & Redevelopment
  if (cleanPath === '/projects' || cleanPath === '/projects/new-developments') {
    return { view: 'projects', subView: 'new' };
  }
  if (cleanPath === '/projects/redevelopment') {
    return { view: 'projects', subView: 'redevelopment' };
  }

  // 7. Favourites & Saved
  if (cleanPath === '/saved-properties' || cleanPath === '/favourites') {
    return { view: 'saved-properties' };
  }

  // 8. Property Comparison
  if (cleanPath === '/compare') {
    return { view: 'compare' };
  }

  // 9. Contact
  if (cleanPath === '/contact') {
    return { view: 'contact' };
  }

  // 10. List Your Property / Public Enquiry
  if (cleanPath === '/list-your-property' || cleanPath === '/submit-enquiry') {
    return { view: 'list-your-property' };
  }

  // 11. Owner Portal & Administration
  if (cleanPath === '/owner-login' || cleanPath === '/admin/login' || cleanPath === '/admin') {
    return { view: 'owner-login' };
  }
  const dashMatch = cleanPath.match(/^\/(?:owner\/dashboard|owner-dashboard)(?:\/([^/]+))?/i);
  if (dashMatch) {
    return { view: 'owner-dashboard', tab: dashMatch[1] || 'overview' };
  }

  // 12. 404 Not Found for unrecognized URLs
  return { view: 'not-found', path: cleanPath };
}

/**
 * Navigate to a specific path using pushState
 */
export function navigate(path, { replace = false, scrollToTop = true } = {}) {
  if (typeof window === 'undefined') return;

  if (replace) {
    window.history.replaceState({}, '', path);
  } else {
    window.history.pushState({}, '', path);
  }

  // Dispatch custom popstate event so listeners update
  window.dispatchEvent(new Event('popstate'));

  if (scrollToTop) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/**
 * React Hook for consuming router state
 */
export function useRouter() {
  const [route, setRoute] = useState(() => {
    if (typeof window === 'undefined') return { view: 'home' };
    return parseRoute(window.location.pathname);
  });

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goTo = useCallback((path, options) => {
    navigate(path, options);
  }, []);

  return { route, goTo, pathname: typeof window !== 'undefined' ? window.location.pathname : '/' };
}
