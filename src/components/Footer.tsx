import { Instagram, MessageCircle, MapPin, Phone, Mail, Award } from 'lucide-react';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black/25 backdrop-blur-md text-gray-400 border-t border-white/10 pt-20 pb-12 relative overflow-hidden">
      {/* Absolute design accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Logo & Statement */}
          <div className="md:col-span-1 space-y-6">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center space-x-2 text-left focus:outline-none group cursor-pointer"
            >
              <div className="w-8 h-8 flex items-center justify-center border-2 border-gold rounded-sm overflow-hidden rotate-45 group-hover:border-gold-hover transition-colors duration-300">
                <div className="-rotate-45 font-serif text-gold font-bold text-lg group-hover:text-gold-hover transition-colors duration-300">
                  L
                </div>
              </div>
              <div>
                <span className="font-serif text-xl tracking-[0.2em] text-white block leading-none">
                  LUXHAVEN
                </span>
                <span className="text-[9px] tracking-[0.4em] text-gold block uppercase font-medium leading-none mt-1">
                  REALTY
                </span>
              </div>
            </button>
            <p className="text-sm leading-relaxed text-gray-500 font-light">
              Crafting extraordinary lifestyles through curated high-end architectural masterpieces. Luxhaven Realty is the premier gateway to elite coastal villas, obsidian estates, and legendary properties.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://instagram.com/Luxhaven_realty"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-gold hover:text-navy-dark hover:border-gold text-gray-300 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://wa.me/233551056514"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-gold hover:text-navy-dark hover:border-gold text-gray-300 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="space-y-6">
            <h4 className="font-serif text-xs tracking-[0.2em] text-white uppercase font-light">
              Client Portal
            </h4>
            <ul className="space-y-4 text-sm font-light">
              <li>
                <button
                  onClick={() => handleNavClick('home')}
                  className="hover:text-gold transition-colors duration-200 text-left cursor-pointer"
                >
                  Home Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('properties')}
                  className="hover:text-gold transition-colors duration-200 text-left cursor-pointer"
                >
                  Properties Available
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('sell')}
                  className="hover:text-gold transition-colors duration-200 text-left cursor-pointer"
                >
                  Sell Your Property
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('book')}
                  className="hover:text-gold transition-colors duration-200 text-left cursor-pointer"
                >
                  Book Private Tour
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Concierge */}
          <div className="space-y-6">
            <h4 className="font-serif text-xs tracking-[0.2em] text-white uppercase font-light">
              Global Concierge
            </h4>
            <ul className="space-y-4 text-sm font-light">
              <li className="flex items-start space-x-3 text-gray-500">
                <MapPin size={16} className="text-gold mt-1 shrink-0" />
                <span>Airport Residential Area, Accra, Ghana</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-500">
                <Phone size={16} className="text-gold shrink-0" />
                <a href="tel:+233551056514" className="hover:text-gold transition-colors duration-200">
                  +233 551 056 514
                </a>
              </li>
              <li className="flex items-center space-x-3 text-gray-500">
                <Mail size={16} className="text-gold shrink-0" />
                <a href="mailto:concierge@luxhaven.com" className="hover:text-gold transition-colors duration-200">
                  concierge@luxhaven.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Quality & Trust */}
          <div className="space-y-6 border-l border-white/10 pl-0 md:pl-8">
            <div className="flex items-center space-x-2 text-gold">
              <Award size={20} />
              <span className="font-serif text-xs tracking-[0.15em] uppercase font-light">
                Elite Brokerage
              </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 font-light">
              Recognized globally for representing some of the most influential architectural developments. We deal with absolute integrity, trust, and luxury hospitality.
            </p>
            <div className="pt-2 border-t border-white/5">
              <span className="text-[10px] uppercase tracking-widest text-gold/60 font-semibold block">
                Office Hours
              </span>
              <span className="text-xs text-gray-400 font-light block mt-1">
                Mon - Sun: 8:00 AM - 10:00 PM GMT
              </span>
            </div>
          </div>
        </div>

        {/* Dividers and Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 font-light">
          <p>© {new Date().getFullYear()} Luxhaven Realty. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gold transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gold transition-colors duration-200">
              Terms of Service
            </a>
            <button
              onClick={() => handleNavClick('dashboard')}
              className="hover:text-gold transition-colors duration-200 text-left"
            >
              Owner Access
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
