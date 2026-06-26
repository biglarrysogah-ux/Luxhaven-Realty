import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Sparkles } from 'lucide-react';
import Properties from './Properties';
import SellWithMe from './SellWithMe';
import BookTour from './BookTour';
import { getHomeVideo } from '../lib/db';
import { HomeVideo } from '../types';

interface HomeProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedPropertyId: string;
  setSelectedPropertyId: (id: string) => void;
}

export default function Home({
  currentPage,
  setCurrentPage,
  selectedPropertyId,
  setSelectedPropertyId,
}: HomeProps) {
  const [videoData, setVideoData] = useState<HomeVideo | null>(null);

  useEffect(() => {
    async function loadVideo() {
      try {
        const video = await getHomeVideo();
        setVideoData(video);
      } catch (e) {
        console.error('Error loading homepage background video:', e);
      }
    }
    loadVideo();
  }, []);

  // Unsplash images for the "AI Luxury Houses Section" masonry grid (clean of text, gorgeous modern houses)
  const aiLuxuryHouses = [
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  ];

  const testimonials = [
    {
      name: 'Victoria Sterling',
      role: 'Global Asset Manager',
      quote: 'The service was absolute perfection. From the discrete, off-market viewing to the final signature of the Obsidian Pavilion, Luxhaven Realty treated our transaction with precision and absolute sophistication.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      rating: 5,
    },
    {
      name: 'Dr. Julian Sterling-vance',
      role: 'Venture Capitalist',
      quote: 'Luxhaven Realty is the gold standard of real estate. Their attention to detail, design literacy, and deep understanding of high-end architecture enabled us to find our coastal dream villa in Malibu in record time.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
      rating: 5,
    },
    {
      name: 'Helena & Marcus Thorne',
      role: 'Founders, Thorne & Co.',
      quote: 'A breathtakingly smooth experience. They executed the marketing of our multi-million dollar estate on Amalfi with utmost class. WhatsApp communication was instant, responsive, and of the highest caliber.',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      rating: 5,
    }
  ];

  return (
    <div className="relative bg-transparent text-white min-h-screen overflow-hidden">
      {/* 1. HERO SECTION (Designed precisely to match the luxury mockup image) */}
      <section id="home" className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#08152b] to-[#050e1d]">
        {/* Dynamic Background Video */}
        {videoData?.url && (
          <>
            <video
              src={videoData.url}
              autoPlay
              muted
              loop
              playsInline
              controls={false}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover z-0 scale-105 select-none pointer-events-none opacity-40"
            />
            {/* Elegant overlay to keep branding readable and matches top/bottom gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#08152b]/95 via-black/50 to-[#050e1d] z-10" />
          </>
        )}

        {/* Centered Luxury Branding Typography */}
        <div className="relative z-20 text-center max-w-4xl px-6 flex flex-col items-center justify-center flex-grow">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* LUXHAVEN main text - identical to high-end serif styling in the image */}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[0.3em] text-white leading-none uppercase select-none mb-4 md:mb-6">
              LUXHAVEN
            </h1>
            
            {/* REALTY gold subtitle */}
            <p className="font-serif text-sm sm:text-base md:text-lg tracking-[0.45em] text-gold uppercase font-semibold select-none">
              REALTY
            </p>
          </motion.div>
        </div>

        {/* Muted Discover scroll-down prompt at the bottom of the hero, matching the mockup */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center select-none cursor-pointer group"
             onClick={() => {
               const nextSection = document.getElementById('properties');
               if (nextSection) {
                 nextSection.scrollIntoView({ behavior: 'smooth' });
               }
             }}
        >
          <span className="text-[10px] uppercase tracking-[0.35em] text-gray-400 font-light mb-3 group-hover:text-gold transition-colors duration-300">
            DISCOVER
          </span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-gold/80 group-hover:text-gold transition-colors duration-300"
          >
            {/* Clean downward chevron arrow matching the v shape in the image */}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* 2. PROPERTIES PAGE (Fully functional embedded listings catalogue) */}
      <section id="properties" className="border-t border-white/5 bg-transparent relative z-10 scroll-mt-20">
        <Properties
          setCurrentPage={setCurrentPage}
          setSelectedPropertyForTour={setSelectedPropertyId}
        />
      </section>

      {/* 3. LUXHAVEN CONCEPT ESTATES SECTION (Masonry Concept Visions) */}
      <section className="py-24 bg-white/[0.01] border-y border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <div className="flex items-center justify-center space-x-2 text-gold mb-3">
            <Sparkles size={16} />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">
              ARTIFICIAL INTELLIGENCE VISIONS
            </span>
            <Sparkles size={16} />
          </div>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-white tracking-wide">
            Luxhaven Concept Estates
          </h2>
          <p className="text-white/60 font-light text-sm max-w-xl mx-auto mt-4 leading-relaxed">
            Beautiful AI architectural designs curated to inspire the future of luxury structures. No compromise. Only pristine high-end environments.
          </p>
        </div>

        {/* Masonry / Grid Container */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {aiLuxuryHouses.map((imageUrl, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className={`overflow-hidden rounded-sm border border-white/10 group relative ${
                idx === 1 || idx === 4 ? 'md:row-span-2 md:h-full h-80' : 'h-80'
              }`}
            >
              <img
                src={imageUrl}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/20 transition-all duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. SELL WITH ME PAGE (Fully functional embedded seller brokerage options) */}
      <section id="sell" className="border-b border-white/5 bg-transparent relative z-10 scroll-mt-20">
        <SellWithMe />
      </section>

      {/* 5. BOOK TOUR PAGE (Fully functional embedded private showing request form) */}
      <section id="book" className="border-b border-white/5 bg-transparent relative z-10 scroll-mt-20">
        <BookTour
          selectedPropertyId={selectedPropertyId}
          setSelectedPropertyId={setSelectedPropertyId}
        />
      </section>

      {/* 6. CLIENT TESTIMONIALS (FAKE REVIEWS AT THE VERY BOTTOM) */}
      <section id="reviews" className="py-24 max-w-7xl mx-auto px-6 relative z-10 scroll-mt-20">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium block mb-2">
            TRUSTED BY THE ELITE
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-white tracking-wide">
            Client Testimonials
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/[0.02] backdrop-blur-md border border-white/10 p-8 rounded-sm hover:border-gold/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex text-gold space-x-1 mb-6">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-current" />
                  ))}
                </div>
                <p className="text-white/70 font-light italic text-sm leading-relaxed mb-8">
                  "{test.quote}"
                </p>
              </div>

              <div className="flex items-center space-x-4 border-t border-white/5 pt-4">
                <img
                  src={test.image}
                  alt={test.name}
                  className="w-12 h-12 rounded-full object-cover border border-white/10"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-serif text-sm font-light text-white tracking-wider">
                    {test.name}
                  </h4>
                  <span className="text-xs text-gold/75 uppercase tracking-widest block mt-0.5">
                    {test.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
