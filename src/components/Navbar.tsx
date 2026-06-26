import { useState, useEffect } from 'react';
import { Lock, Menu, X, Instagram, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function Navbar({ currentPage, setCurrentPage }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Properties', id: 'properties' },
    { name: 'Sell With Me', id: 'sell' },
    ...(currentPage !== 'dashboard' ? [{ name: 'Book A Tour', id: 'book' }] : []),
  ];

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-navy-dark/40 backdrop-blur-md border-b border-white/10 py-4 shadow-lg'
          : 'bg-transparent py-6 border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center text-left focus:outline-none group cursor-pointer"
        >
          <div className="relative w-7 h-7 bg-gradient-to-br from-[#f2dfb2] via-[#c5a059] to-[#8c6b2b] rounded-[6px] rotate-45 shadow-sm shadow-gold/20" />
          <div className="flex flex-col ml-3">
            <span className="font-serif text-lg tracking-[0.3em] text-white block leading-none font-light">
              LUXHAVEN
            </span>
            <span className="text-[8px] tracking-[0.5em] text-gold block uppercase font-semibold leading-none mt-1.5">
              REALTY
            </span>
          </div>
        </button>
 
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`text-xs tracking-[0.15em] uppercase transition-colors duration-300 relative py-1 cursor-pointer ${
                currentPage === link.id
                  ? 'text-gold font-medium'
                  : 'text-gray-300 hover:text-gold transition-colors'
              }`}
            >
              {link.name}
              {currentPage === link.id && (
                <motion.div
                  layoutId="activeUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-gold"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
 
        {/* Right Controls (Mockup matches perfectly) */}
        <div className="flex items-center space-x-4">
          {/* Circular Outlined Lock Button (Matches mock and provides desktop/mobile access) */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className="w-10 h-10 border border-white/10 rounded-full hover:border-gold/50 transition-all duration-300 cursor-pointer flex items-center justify-center text-gray-300 hover:text-gold"
            title="Concierge Portal"
            aria-label="Concierge Portal"
          >
            <Lock size={14} className="stroke-[1.5]" />
          </button>
          
          {/* Mobile Menu Toggle (Visible on mobile screens) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-300 hover:text-white focus:outline-none cursor-pointer flex items-center justify-center p-2"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} className="stroke-[1.5]" />}
          </button>
        </div>
      </div>
 
      {/* Mobile Menu Backdrop & Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 right-0 bg-navy-dark/95 border-b border-white/10 backdrop-blur-lg md:hidden flex flex-col py-8 px-6 space-y-6 shadow-2xl"
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left text-sm tracking-widest uppercase py-2 border-b border-white/5 cursor-pointer ${
                  currentPage === link.id ? 'text-gold font-medium' : 'text-gray-300'
                }`}
              >
                {link.name}
              </button>
            ))}
 
            <div className="flex items-center justify-between pt-4">
              <div className="flex space-x-6">
                <a
                  href="https://instagram.com/Luxhaven_realty"
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-gold flex items-center space-x-2 text-xs tracking-wider uppercase"
                >
                  <Instagram size={18} />
                  <span>Instagram</span>
                </a>
                <a
                  href="https://wa.me/233551056514"
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-gold flex items-center space-x-2 text-xs tracking-wider uppercase"
                >
                  <MessageCircle size={18} />
                  <span>WhatsApp</span>
                </a>
              </div>
 
              {/* Hidden Lock Icon in Mobile Menu as well, but very subtle */}
              <button
                onClick={() => handleNavClick('dashboard')}
                className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gold/40 rounded-full transition-colors duration-300"
                aria-label="Owner Login"
              >
                <Lock size={10} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
