import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Building2,
  Sparkles,
  PhoneCall,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { contactInfo } from '../data/contactInfo';

export default function VideoWalkthroughSection({ onEnquire, onScheduleVisit }) {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  const videoList = [
    {
      id: 'walkthrough-full',
      title: 'Luxury Sample Flat Interior Tour',
      tagline: 'Virar & Vasai Corridor Living Experience',
      description:
        'Experience the craftsmanship firsthand: spacious living room with imported vitrified tiling, custom false ceiling with ambient cove lighting, dedicated dining section, designer master bedroom suite, modern modular kitchen, and luxury ceramic sanitaryware.',
      src: '/images/video/video1.mp4',
      poster: '/images/buildingImages/build2.png',
      badge: 'Complete Flat Walkthrough',
      duration: 'Sample Flat Walkthrough',
      highlights: [
        'Open Living & Dining Area',
        'Designer Modular Kitchen',
        'Master Suite with Premium Wardrobes',
        'Anti-skid Ceramic Bathrooms',
      ],
    },
    {
      id: 'walkthrough-master',
      title: 'Master Bedroom & Balcony Showcase',
      tagline: '#JewelOfVirar Premium Collection',
      description:
        'A closer look at the master bedroom retreat featuring elegant wall paneling, false ceiling with recessed spotlights, dedicated wardrobe alcove, ensuite bath, and floor-to-ceiling glass sliding doors opening to a scenic private balcony.',
      src: '/images/video/video2.mp4',
      poster: '/images/buildingImages/build1.png',
      badge: '#JewelOfVirar Showcase',
      duration: 'Master Suite & Balcony Tour',
      highlights: [
        'Floor-to-Ceiling Sliding Balcony Doors',
        'Ambient Cove Ceiling Lighting',
        'Ensuite Master Washroom',
        'Cross-Ventilated Open Views',
      ],
    },
  ];

  const currentVideo = videoList[activeVideoIndex];

  const handleSelectVideo = (idx) => {
    setActiveVideoIndex(idx);
    setIsPlaying(false);
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.load();
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn('Video play error:', err));
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    }
  };

  return (
    <section
      id="video-walkthrough"
      className="py-16 sm:py-20 bg-navy text-white relative overflow-hidden"
      aria-label="Property Video Walkthrough Showcase"
    >
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-royal/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 rounded-full bg-brandRed/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs font-bold tracking-wider uppercase mb-3.5">
              <Sparkles className="w-3.5 h-3.5 text-brandRed" />
              <span>Real Property Walkthroughs</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-normal leading-tight">
              Step Inside Actual Sample Residences
            </h2>
            <p className="mt-3 text-stone/90 text-sm sm:text-base leading-relaxed">
              Explore authentic interior walkthroughs of verified residential properties in Virar and the Vasai corridor. Inspect finishes, layouts, natural lighting, and balcony vistas before scheduling your site visit.
            </p>
          </div>

          {/* Video Selector Tabs */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 p-1.5 bg-navy-950/80 rounded-2xl border border-white/15">
            {videoList.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectVideo(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeVideoIndex === idx
                    ? 'bg-brandRed text-white shadow-md'
                    : 'text-stone hover:text-white hover:bg-white/10'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{item.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Video Player & Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Video Frame (7 Columns) */}
          <div className="lg:col-span-7 bg-navy-950 rounded-3xl overflow-hidden border border-white/20 shadow-2xl relative group">
            {/* The HTML5 Video Element */}
            <div className="relative aspect-video sm:aspect-[16/10] bg-black flex items-center justify-center">
              <video
                key={currentVideo.id}
                ref={videoRef}
                poster={currentVideo.poster}
                muted={isMuted}
                playsInline
                controls
                preload="metadata"
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setHasError(true)}
              >
                <source src={currentVideo.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Graceful Fallback if video fails */}
              {hasError && (
                <div className="absolute inset-0 bg-navy-950 flex flex-col items-center justify-center p-6 text-center">
                  <Building2 className="w-12 h-12 text-royal-light mb-3 opacity-60" />
                  <h3 className="font-serif text-lg text-white mb-1">
                    Video Temporarily Unavailable
                  </h3>
                  <p className="text-xs text-stone max-w-sm mb-4">
                    The walkthrough footage is loading or updating. You can still inspect property photographs and schedule an in-person site visit.
                  </p>
                  <a
                    href={`tel:${contactInfo.phoneRaw}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brandRed text-white font-bold text-xs uppercase"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Advisory Desk</span>
                  </a>
                </div>
              )}
            </div>

            {/* Custom Bottom Control Bar */}
            <div className="p-4 sm:p-5 bg-navy-950/95 border-t border-white/10 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-2 rounded-xl bg-white/10 hover:bg-brandRed hover:text-white text-white transition-colors"
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone hover:text-white transition-colors"
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-royal-light" />
                  )}
                </button>

                <span className="text-stone/80 text-[11px] font-medium hidden sm:inline">
                  {isPlaying ? 'Playing Walkthrough' : 'Click Play to Watch with Controls'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-blue-200 font-semibold uppercase tracking-wider hidden sm:inline">
                  {currentVideo.duration}
                </span>

                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone hover:text-white transition-colors"
                  aria-label="View Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Video Metadata & Inspection Actions (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-brandRed/20 border border-brandRed/40 text-brandRed-400 text-xs font-bold uppercase tracking-wider mb-3">
                {currentVideo.tagline}
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal leading-tight mb-3">
                {currentVideo.title}
              </h3>
              <p className="text-stone text-xs sm:text-sm leading-relaxed mb-6">
                {currentVideo.description}
              </p>

              {/* Highlights Pill List */}
              <div className="space-y-2.5 mb-8">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                  Featured in this walkthrough:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {currentVideo.highlights.map((item, hIdx) => (
                    <div
                      key={hIdx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-stone"
                    >
                      <CheckCircle2 className="w-4 h-4 text-brandRed flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onEnquire) {
                    onEnquire({
                      title: currentVideo.title,
                      locality: 'virar',
                      category: 'new-flat',
                      transactionType: 'buy',
                    });
                  } else {
                    const el = document.getElementById('contact');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brandRed hover:bg-brandRed-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>Schedule On-Site Inspection</span>
              </button>

              <a
                href={contactInfo.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <span>WhatsApp Video Enquiry</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
