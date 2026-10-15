import React from 'react';

/**
 * Official Brand Logo for TOMAR ENTERPRISES
 * Sourced directly from /tomar-logo.png in the public directory.
 * Preserves original artwork, colors, and exact aspect ratio (1338 x 455 = ~2.94 : 1).
 */
export default function BrandLogo({
  variant = 'default', // 'default' | 'dark' | 'light' | 'on-dark'
  className = '',
  size = 'large',      // 'large' | 'default' | 'small'
}) {
  const isDarkBg = variant === 'light' || variant === 'on-dark';

  // Responsive height scale ensuring the ~2.94:1 logo proportions stay visually balanced, prominent, and crisp
  const heightClasses = {
    large: 'h-[58px] sm:h-[66px] md:h-[72px] lg:h-[78px] xl:h-[82px]',
    default: 'h-[44px] sm:h-[52px] md:h-[58px] lg:h-[64px]',
    small: 'h-[36px] sm:h-[40px] md:h-[46px]',
  }[size] || 'h-[58px] sm:h-[66px] md:h-[74px]';

  const logoImg = (
    <img
      src="/tomar-logo.png"
      alt="TOMAR ENTERPRISES — Real Estate Agency"
      className={`${heightClasses} w-auto object-contain select-none max-w-full flex-shrink-0 transition-opacity duration-200`}
      loading="eager"
      fetchPriority="high"
    />
  );

  // If rendered on a dark navy/black background (e.g. Footer or Dark Owner Login),
  // place it inside a clean crisp white container so the navy wordmark and red emblem are 100% visible and unaltered
  if (isDarkBg) {
    return (
      <div className={`inline-flex items-center bg-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl shadow-xs border border-white/60 ${className}`}>
        {logoImg}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      {logoImg}
    </div>
  );
}
