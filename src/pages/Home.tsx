import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Star, Sparkles, Upload, Check } from 'lucide-react';
import Properties from './Properties';
import SellWithMe from './SellWithMe';
import BookTour from './BookTour';
import { getHomeVideo, getReviews, addReview, uploadFile } from '../lib/db';
import { HomeVideo, Review } from '../types';

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
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRole, setNewReviewRole] = useState('');
  const [newReviewQuote, setNewReviewQuote] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewImage, setNewReviewImage] = useState<File | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    async function loadVideoAndReviews() {
      try {
        const [video, reviews] = await Promise.all([
          getHomeVideo(),
          getReviews()
        ]);
        setVideoData(video);
        setReviewsList(reviews);
      } catch (e) {
        console.error('Error loading homepage data:', e);
      }
    }
    loadVideoAndReviews();
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

      {/* 6. CLIENT TESTIMONIALS (DYNAMIC REVIEWS STORED IN DATABASE) */}
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
          {reviewsList.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/[0.02] backdrop-blur-md border border-white/10 p-8 rounded-sm hover:border-gold/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex text-gold space-x-1 mb-6">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-current" />
                  ))}
                </div>
                <p className="text-white/70 font-light italic text-sm leading-relaxed mb-8">
                  "{test.quote}"
                </p>
              </div>

              <div className="flex items-center space-x-4 border-t border-white/5 pt-4">
                <img
                  src={test.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
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

        {/* Dynamic review submission form */}
        <div className="mt-16 text-center">
          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-navy-light/40 hover:bg-navy-light/75 border border-white/10 hover:border-gold/30 text-gold font-sans text-xs uppercase tracking-widest py-4 px-10 rounded-sm transition-all shadow-md cursor-pointer"
            >
              Share Your Experience
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto bg-[#0a1c3e]/30 border border-white/10 p-8 rounded-sm text-left mt-8 backdrop-blur-md relative"
            >
              <h3 className="font-serif text-xl font-light text-white tracking-wider mb-6 text-center">
                Submit Your Testimonial
              </h3>
              
              {reviewSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gold">
                  <Check size={48} className="mb-4 stroke-gold animate-bounce" />
                  <span className="font-serif font-light text-lg">Thank You</span>
                  <span className="text-xs text-white/60 mt-1">Your experience has been recorded in our luxury archive.</span>
                </div>
              ) : (
                <form onSubmit={async (e: FormEvent) => {
                  e.preventDefault();
                  if (!newReviewName || !newReviewQuote || !newReviewRole) return;
                  setReviewSubmitting(true);
                  try {
                    let imageUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
                    if (newReviewImage) {
                      imageUrl = await uploadFile(newReviewImage, 'owner-photos');
                    }
                    const added = await addReview({
                      name: newReviewName,
                      role: newReviewRole,
                      quote: newReviewQuote,
                      rating: newReviewRating,
                      image: imageUrl
                    });
                    setReviewsList(prev => [added, ...prev]);
                    setReviewSuccess(true);
                    setNewReviewName('');
                    setNewReviewRole('');
                    setNewReviewQuote('');
                    setNewReviewRating(5);
                    setNewReviewImage(null);
                    setTimeout(() => {
                      setReviewSuccess(false);
                      setShowReviewForm(false);
                    }, 3000);
                  } catch (err) {
                    console.error('Failed to submit review', err);
                  } finally {
                    setReviewSubmitting(false);
                  }
                }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={newReviewName}
                        onChange={e => setNewReviewName(e.target.value)}
                        placeholder="e.g. Alexis Sterling"
                        className="w-full bg-navy-dark/60 border border-white/10 p-3 rounded-sm text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Your Role / Company *</label>
                      <input
                        type="text"
                        required
                        value={newReviewRole}
                        onChange={e => setNewReviewRole(e.target.value)}
                        placeholder="e.g. CEO, Sterling Corp"
                        className="w-full bg-navy-dark/60 border border-white/10 p-3 rounded-sm text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Rating *</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className="text-gold focus:outline-none hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star size={18} className={star <= newReviewRating ? "fill-current text-gold" : "text-gray-600"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Testimonial Quote *</label>
                    <textarea
                      required
                      rows={3}
                      value={newReviewQuote}
                      onChange={e => setNewReviewQuote(e.target.value)}
                      placeholder="Share your experience working with Luxhaven Realty..."
                      className="w-full bg-navy-dark/60 border border-white/10 p-3 rounded-sm text-sm text-white focus:outline-none focus:border-gold/50 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Your Portrait Image (Optional)</label>
                    <label className="w-full border border-dashed border-white/15 hover:border-gold/30 bg-navy-dark/40 rounded-sm p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                      <Upload size={18} className="text-gold/80 mb-2" />
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest text-center">
                        {newReviewImage ? newReviewImage.name : "Select JPG / PNG Portrait"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          if (e.target.files && e.target.files[0]) {
                            setNewReviewImage(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="flex-1 bg-gold hover:bg-gold-hover text-navy-dark font-semibold text-xs uppercase tracking-widest py-3 px-6 rounded-sm transition-all hover:shadow-lg disabled:opacity-50 cursor-pointer text-center"
                    >
                      {reviewSubmitting ? "Archiving..." : "Submit Testimonial"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-widest py-3 px-6 rounded-sm transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
