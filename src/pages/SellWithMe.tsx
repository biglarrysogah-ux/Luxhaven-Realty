import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Instagram, Phone, Mail, Award, Key, Sparkles } from 'lucide-react';
import { getHomeVideo, getOwnerPhoto } from '../lib/db';
import { HomeVideo, OwnerPhoto } from '../types';

export default function SellWithMe() {
  const [videoData, setVideoData] = useState<HomeVideo | null>(null);
  const [ownerData, setOwnerData] = useState<OwnerPhoto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [video, photo] = await Promise.all([
          getHomeVideo(),
          getOwnerPhoto(),
        ]);
        setVideoData(video);
        setOwnerData(photo);
      } catch (e) {
        console.error('Error loading Sell With Me data', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleWhatsApp = () => {
    const text = `Hello Luxhaven Realty, I am looking to list and sell my high-end property. I would like to schedule a luxury home evaluation and discuss marketing strategies.`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/233551056514?text=${encoded}`, '_blank', 'noreferrerPolicy=no-referrer');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent py-32 px-6">
      {/* Dynamic Background Video */}
      {videoData?.url ? (
        <video
          src={videoData.url}
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover z-0 scale-105 select-none pointer-events-none"
        />
      ) : (
        <div className="absolute inset-0 bg-navy-deep z-0" />
      )}

      {/* Deep Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/95 via-navy-dark/85 to-navy-dark/95 z-10" />

      {/* Main Container */}
      <div className="relative z-20 max-w-5xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 md:p-16 rounded-sm shadow-2xl">
          
          {/* Text Message Column */}
          <div className="md:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold block">
                PREMIER BROKERAGE SOLUTIONS
              </span>
              <h1 className="font-serif text-3xl md:text-5xl font-light text-white tracking-wide leading-tight">
                Looking for the right agent to help you sell your property?
              </h1>
              <h2 className="font-serif text-2xl text-amber-100/90 font-light italic">
                Look no further.
              </h2>
            </div>

            <p className="text-white/70 font-light text-base leading-relaxed max-w-xl">
              Contact us through WhatsApp below and let’s discuss how we can successfully market and sell your property.
            </p>

            <div className="border-t border-white/10 pt-8 grid grid-cols-2 gap-6 text-xs text-gray-400 font-light uppercase tracking-widest">
              <div className="flex items-center gap-3">
                <Award size={18} className="text-gold shrink-0" />
                <span>Elite Global Placement</span>
              </div>
              <div className="flex items-center gap-3">
                <Key size={18} className="text-gold shrink-0" />
                <span>100% Discrete Listing</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={handleWhatsApp}
                className="bg-gold hover:bg-gold-hover text-navy-dark font-semibold tracking-widest text-xs uppercase px-8 py-4 rounded-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-lg shadow-gold/10"
              >
                <MessageCircle size={15} />
                <span>WhatsApp Listing</span>
              </button>
              
              <a
                href="https://instagram.com/Luxhaven_realty"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                className="bg-white/[0.04] hover:bg-white/10 border border-white/20 text-white font-medium tracking-widest text-xs uppercase px-8 py-4 rounded-sm flex items-center justify-center gap-2 transition-all duration-300"
              >
                <Instagram size={15} />
                <span>Instagram Feed</span>
              </a>

              <a
                href="tel:+233551056514"
                className="bg-white/[0.04] hover:bg-white/10 border border-white/20 text-white font-medium tracking-widest text-xs uppercase px-8 py-4 rounded-sm flex items-center justify-center gap-2 transition-all duration-300"
              >
                <Phone size={15} />
                <span>Call Concierge</span>
              </a>
            </div>
          </div>

          {/* Owner Professional Portrait Column */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-xs aspect-[3/4] border border-white/10 rounded-sm overflow-hidden bg-white/[0.02] shadow-2xl group">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-widest text-gray-500 animate-pulse">
                  Loading portrait...
                </div>
              ) : ownerData?.url ? (
                <img
                  src={ownerData.url}
                  alt="Lead Agent Portfolio"
                  className="w-full h-full object-cover filter brightness-95 group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1c3e] to-[#07152d] p-8 text-center select-none">
                  {/* High-end Monogram with subtle ambient background glow */}
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#f2dfb2] via-[#c5a059] to-[#8c6b2b] p-[1.5px] shadow-lg shadow-gold/10">
                    <div className="w-full h-full rounded-full bg-[#07152d] flex items-center justify-center">
                      <span className="font-serif text-3xl font-light tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-gold mr-[-0.1em]">
                        LHR
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mt-6">
              <span className="text-xs text-gray-400 font-light tracking-wide flex items-center justify-center gap-1.5">
                <Sparkles size={12} className="text-gold" />
                WhatsApp: +233 551 056 514
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
