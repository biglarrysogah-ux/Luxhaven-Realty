import { useEffect, MouseEvent } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  items: { url: string; type: 'image' | 'video' }[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

export default function ImageLightbox({
  isOpen,
  onClose,
  items,
  currentIndex,
  setCurrentIndex,
}: ImageLightboxProps) {
  // Keypress support (Escape for close, Left/Right for nav)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock scrolling on main page while lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, currentIndex, items]);

  if (!isOpen || items.length === 0) return null;

  const activeItem = items[currentIndex];

  const handlePrev = (e?: MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(currentIndex === 0 ? items.length - 1 : currentIndex - 1);
  };

  const handleNext = (e?: MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(currentIndex === items.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between py-6 select-none"
      >
        {/* Header toolbar */}
        <div className="w-full max-w-7xl px-6 flex items-center justify-between text-white z-10">
          <span className="font-mono text-xs tracking-widest text-amber-400">
            {currentIndex + 1} / {items.length}
          </span>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-amber-400 hover:text-black transition-all duration-300 cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Showcase */}
        <div className="w-full flex-grow flex items-center justify-center px-4 md:px-12 relative">
          {/* Previous Button */}
          {items.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 md:left-8 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-amber-400 hover:bg-amber-400 hover:text-black text-white transition-all duration-300 cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Core Media */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[80vh] max-w-[90vw] md:max-w-4xl rounded-lg overflow-hidden flex items-center justify-center shadow-2xl"
          >
            {activeItem.type === 'video' ? (
              <video
                src={activeItem.url}
                className="max-h-[80vh] w-auto max-w-full rounded-md object-contain"
                controls
                autoPlay
                playsInline
                referrerPolicy="no-referrer"
              />
            ) : (
              <img
                src={activeItem.url}
                alt={`Gallery media ${currentIndex + 1}`}
                className="max-h-[80vh] w-auto max-w-full rounded-md object-contain"
                referrerPolicy="no-referrer"
              />
            )}
          </motion.div>

          {/* Next Button */}
          {items.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 md:right-8 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-amber-400 hover:bg-amber-400 hover:text-black text-white transition-all duration-300 cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* Footer thumbnail strip / indicators */}
        {items.length > 1 && (
          <div className="w-full max-w-2xl px-6 flex items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-none z-10">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`relative w-12 h-12 rounded overflow-hidden border-2 flex-shrink-0 cursor-pointer ${
                  index === currentIndex ? 'border-amber-400' : 'border-white/25 hover:border-white/60'
                }`}
              >
                {item.type === 'video' ? (
                  <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                    <Play size={14} className="text-white/80" />
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
