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

  // Responsive height scale scaled 10-15% larger while preserving ~2.94:1 aspect ratio and crisp clarity
  const heightClasses = {
    large: 'h-[66px] sm:h-[74px] md:h-[80px] lg:h-[88px] xl:h-[94px]',
    default: 'h-[48px] sm:h-[58px] md:h-[64px] lg:h-[72px]',
    small: 'h-[38px] sm:h-[44px] md:h-[50px]',
  }[size] || 'h-[66px] sm:h-[74px] md:h-[84px]';

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
