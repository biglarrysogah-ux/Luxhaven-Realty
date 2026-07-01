import { useState, useEffect, MouseEvent } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, DollarSign, Calendar, MessageCircle, Play, ChevronLeft, ChevronRight, Eye, Sparkles } from 'lucide-react';
import { getProperties } from '../lib/db';
import { Property } from '../types';
import ImageLightbox from '../components/ImageLightbox';

interface PropertiesProps {
  setCurrentPage: (page: string) => void;
  setSelectedPropertyForTour: (id: string) => void;
}

export default function Properties({ setCurrentPage, setSelectedPropertyForTour }: PropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(25000000);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Carousel Indexes (mapped by property ID)
  const [carouselIndexes, setCarouselIndexes] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchListings() {
      try {
        const data = await getProperties();
        setProperties(data);
        
        // Initialize carousel index to 0 for each property
        const indexes: Record<string, number> = {};
        data.forEach(p => {
          indexes[p.id] = 0;
        });
        setCarouselIndexes(indexes);
      } catch (e) {
        console.error('Error fetching properties', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchListings();
  }, []);

  const handleBookTour = (prop: Property) => {
    setSelectedPropertyForTour(prop.id);
    setCurrentPage('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppInquiry = (prop: Property) => {
    const text = `Hello Luxhaven Realty, I would like to inquire about the luxury property: "${prop.title}" (ID: ${prop.id}) located in ${prop.location} listed for $${prop.price.toLocaleString()}. Please share additional details.`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/233551056514?text=${encoded}`, '_blank', 'noreferrerPolicy=no-referrer');
  };

  // Carousel navigation
  const nextSlide = (e: MouseEvent, propId: string, totalItems: number) => {
    e.stopPropagation();
    setCarouselIndexes(prev => ({
      ...prev,
      [propId]: (prev[propId] + 1) % totalItems
    }));
  };

  const prevSlide = (e: MouseEvent, propId: string, totalItems: number) => {
    e.stopPropagation();
    setCarouselIndexes(prev => ({
      ...prev,
      [propId]: prev[propId] === 0 ? totalItems - 1 : prev[propId] - 1
    }));
  };

  // Open Lightbox
  const handleOpenLightbox = (prop: Property, index: number) => {
    const items: { url: string; type: 'image' | 'video' }[] = [];
    prop.images.forEach(img => items.push({ url: img, type: 'image' }));
    prop.videos.forEach(vid => items.push({ url: vid, type: 'video' }));

    setLightboxItems(items);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Filter listings
  const filteredProperties = properties.filter(prop => {
    const matchesSearch =
      prop.title.toLowerCase().includes(search.toLowerCase()) ||
      prop.location.toLowerCase().includes(search.toLowerCase()) ||
      prop.id.toLowerCase().includes(search.toLowerCase());
    const matchesPrice = prop.price <= maxPrice;
    return matchesSearch && matchesPrice;
  });

  return (
    <div className="relative bg-transparent text-white min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] -translate-y-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Page Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-2">
            LUXHAVEN CATALOGUE
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-light text-white tracking-wide">
            Properties Available
          </h1>
          <p className="text-white/60 font-light text-sm max-w-xl mx-auto mt-4 leading-relaxed">
            Browse our exclusive collection of hand-picked architectural estates. Filter your requirements to discover the perfect home.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 p-6 rounded-sm mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gold/60">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by title, location or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-navy-dark/90 border border-white/10 focus:border-gold focus:outline-none rounded-sm py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500 tracking-wider transition-all"
            />
          </div>

          {/* Price Range Filter */}
          <div className="w-full md:max-w-xs flex flex-col space-y-2">
            <div className="flex justify-between text-xs tracking-wider uppercase text-gray-400">
              <span>Max Price:</span>
              <span className="text-gold font-mono">${maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={2000000}
              max={25000000}
              step={500000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-gold cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* Listings Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[1, 2].map(n => (
              <div key={n} className="animate-pulse bg-white/[0.02] border border-white/10 rounded-sm h-[600px]" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.01] border border-white/10 p-12 rounded-sm max-w-2xl mx-auto backdrop-blur-md">
            <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center mx-auto mb-6">
              <span className="font-serif text-lg text-gold font-light">L</span>
            </div>
            <h3 className="font-serif text-2xl text-white font-light tracking-wide mb-4">
              Private Off-Market Portfolio
            </h3>
            <p className="text-white/60 font-light text-sm leading-relaxed mb-8">
              Our curated collection of ultra-exclusive estates is currently off-market. Contact our Lead Broker directly on WhatsApp for discrete inquiries and private listings, or access our Concierge Portal to upload new directory properties.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/233551056514"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                className="bg-gold hover:bg-gold-hover text-navy-dark font-semibold tracking-widest text-xs uppercase px-8 py-3.5 rounded-sm transition-all duration-300 cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg shadow-gold/5"
              >
                <MessageCircle size={14} />
                <span>Contact Lead Broker</span>
              </a>
              <button
                onClick={() => {
                  setCurrentPage('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white/[0.04] hover:bg-white/10 border border-white/20 text-white font-medium tracking-widest text-xs uppercase px-8 py-3.5 rounded-sm transition-all duration-300 cursor-pointer"
              >
                Concierge Portal
              </button>
            </div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/10 rounded-sm">
            <p className="text-gray-400 text-lg font-light tracking-wide">No properties match your current search.</p>
            <button
              onClick={() => {
                setSearch('');
                setMaxPrice(25000000);
              }}
              className="text-gold hover:text-white text-xs tracking-widest uppercase mt-4 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {filteredProperties.map((prop) => {
              // Create combined array of media items: images first, then videos
              const totalImages = prop.images.length;
              const totalVideos = prop.videos.length;
              const combinedMedia = [
                ...prop.images.map(url => ({ url, type: 'image' as const })),
                ...prop.videos.map(url => ({ url, type: 'video' as const })),
              ];
              const activeIndex = carouselIndexes[prop.id] || 0;
              const currentMediaItem = combinedMedia[activeIndex];

              return (
                <motion.div
                  key={prop.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/[0.02] backdrop-blur-md border border-white/10 hover:border-gold/30 rounded-sm overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Property Slideshow Component */}
                  <div className="relative h-96 bg-black flex items-center justify-center group overflow-hidden">
                    {/* Media render */}
                    {currentMediaItem?.type === 'video' ? (
                      <div className="relative w-full h-full">
                        <video
                          src={currentMediaItem.url}
                          className="w-full h-full object-cover brightness-95"
                          autoPlay
                          muted
                          loop
                          playsInline
                          referrerPolicy="no-referrer"
                        />
                        {/* Play Indicator Icon */}
                        <div className="absolute top-4 right-4 bg-gold text-navy-dark w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-gold/20">
                          <Play size={14} className="fill-current ml-0.5" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={currentMediaItem?.url}
                        alt={prop.title}
                        className="w-full h-full object-cover brightness-95"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Left & Right Slideshow Arrows */}
                    {combinedMedia.length > 1 && (
                      <>
                        <button
                          onClick={(e) => prevSlide(e, prop.id, combinedMedia.length)}
                          className="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-navy-dark/80 hover:bg-gold hover:text-navy-dark border border-white/10 text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-10 animate-fade-in"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={(e) => nextSlide(e, prop.id, combinedMedia.length)}
                          className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-navy-dark/80 hover:bg-gold hover:text-navy-dark border border-white/10 text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-10 animate-fade-in"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}

                    {/* Overlays / Badges */}
                    <div className="absolute top-4 left-4 bg-navy-dark/90 border border-white/10 px-4 py-1.5 rounded-sm shadow-md">
                      <span className="text-gold font-serif font-semibold text-sm tracking-widest block">
                        ${prop.price.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenLightbox(prop, activeIndex)}
                      className="absolute bottom-4 right-4 bg-black/70 hover:bg-gold hover:text-navy-dark px-3 py-1.5 rounded-sm text-xs tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-sm transition-all duration-300 cursor-pointer z-10 border border-white/10"
                    >
                      <Eye size={14} />
                      <span>View Fullscreen</span>
                    </button>

                    {/* Slide Count Overlay Indicator */}
                    <div className="absolute bottom-4 left-4 bg-black/60 px-2.5 py-1 rounded-sm text-[10px] tracking-widest uppercase font-mono text-gray-300 backdrop-blur-sm">
                      {activeIndex + 1} / {combinedMedia.length} Media
                    </div>
                  </div>

                  {/* Property details cards details */}
                  <div className="p-8 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <h2 className="font-serif text-2xl font-light text-white tracking-wide">
                          {prop.title}
                        </h2>
                        <span className="text-[10px] uppercase tracking-widest text-gold/70 font-mono">
                          ID: {prop.id}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-400 text-xs gap-1.5 mb-6">
                        <MapPin size={14} className="text-gold/70" />
                        <span className="tracking-wide uppercase font-light">{prop.location}</span>
                      </div>

                      <p className="text-white/70 text-sm font-light leading-relaxed mb-6">
                        {prop.description}
                      </p>

                      {/* Estate parameters */}
                      <div className="grid grid-cols-3 gap-4 border-y border-white/10 py-4 mb-6 text-center text-xs tracking-wider uppercase text-gray-400">
                        <div>
                          <span className="font-serif text-lg text-white block font-semibold mb-0.5">{prop.beds}</span>
                          <span>Bedrooms</span>
                        </div>
                        <div className="border-x border-white/10">
                          <span className="font-serif text-lg text-white block font-semibold mb-0.5">{prop.baths}</span>
                          <span>Bathrooms</span>
                        </div>
                        <div>
                          <span className="font-serif text-lg text-white block font-semibold mb-0.5">{prop.sqft.toLocaleString()}</span>
                          <span>Sq Ft</span>
                        </div>
                      </div>

                      {/* Unique features list */}
                      <div className="flex flex-wrap gap-2 mb-8">
                        {prop.features.map((feat, i) => (
                          <span
                            key={i}
                            className="text-[10px] uppercase tracking-wider bg-navy-dark/90 border border-white/10 px-2.5 py-1 rounded-sm text-gray-400"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mt-auto">
                      <button
                        onClick={() => handleBookTour(prop)}
                        className="bg-white/[0.04] hover:bg-white/10 border border-white/20 text-white font-medium tracking-widest text-xs uppercase py-3.5 rounded-sm transition-all duration-300 text-center cursor-pointer"
                      >
                        Book Private Tour
                      </button>
                      <button
                        onClick={() => handleWhatsAppInquiry(prop)}
                        className="bg-gold hover:bg-gold-hover text-navy-dark font-semibold tracking-widest text-xs uppercase py-3.5 rounded-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/5"
                      >
                        <MessageCircle size={14} />
                        <span>Inquire WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Rendering */}
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={lightboxItems}
        currentIndex={lightboxIndex}
        setCurrentIndex={setLightboxIndex}
      />
    </div>
  );
}
