import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MessageSquare, Phone, User, CheckCircle, MessageCircle } from 'lucide-react';
import { getProperties, addBooking } from '../lib/db';
import { Property } from '../types';

interface BookTourProps {
  selectedPropertyId: string;
  setSelectedPropertyId: (id: string) => void;
}

export default function BookTour({ selectedPropertyId, setSelectedPropertyId }: BookTourProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [propId, setPropId] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await getProperties();
        setProperties(data);
        // If a property was pre-selected, use it, else default to first
        if (selectedPropertyId) {
          setPropId(selectedPropertyId);
        } else if (data.length > 0) {
          setPropId(data[0].id);
        }
      } catch (e) {
        console.error('Error fetching property list for tour selection', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadProperties();
  }, [selectedPropertyId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!fullName || !whatsappNumber || !phoneNumber || !propId || !preferredDate || !preferredTime) {
      setValidationError('Please fill out all required fields.');
      return;
    }

    setValidationError('');
    const selectedProp = properties.find(p => p.id === propId);
    const propName = selectedProp ? selectedProp.title : 'Unknown Property';

    // 1. Save to Supabase / Local Storage
    try {
      await addBooking({
        fullName,
        whatsappNumber,
        phoneNumber,
        propertyId: propId,
        propertyName: propName,
        preferredDate,
        preferredTime,
        additionalNotes,
      });
    } catch (err) {
      console.error('Error storing booking in database', err);
    }

    // 2. Generate WhatsApp link and open it
    const text = `✨ LUXHAVEN TOUR BOOKING ✨
------------------------------
👤 Client: ${fullName}
💬 WhatsApp: ${whatsappNumber}
📞 Phone: ${phoneNumber}
🏰 Estate: ${propName} (ID: ${propId})
📅 Date: ${preferredDate}
⏰ Time: ${preferredTime}
📝 Notes: ${additionalNotes || 'None'}`;

    const encoded = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/233551056514?text=${encoded}`;

    // Show success visual state
    setFormSubmitted(true);

    // Open WhatsApp after a brief delay
    setTimeout(() => {
      window.open(whatsappUrl, '_blank', 'noreferrerPolicy=no-referrer');
      // Reset form fields
      setFullName('');
      setWhatsappNumber('');
      setPhoneNumber('');
      setPreferredDate('');
      setPreferredTime('');
      setAdditionalNotes('');
      setFormSubmitted(false);
      setSelectedPropertyId('');
    }, 2000);
  };

  return (
    <div className="relative bg-transparent text-white min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-2">
            PRIVATE ACCESS SHOWINGS
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-light text-white tracking-wide">
            Book A Private Tour
          </h1>
          <p className="text-white/60 font-light text-sm max-w-xl mx-auto mt-4 leading-relaxed">
            Fill out the consultation form below to coordinate an exclusive off-market walk-through of our premier estates.
          </p>
        </div>

        {/* Success Modal Overlay */}
        {formSubmitted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-navy-dark border border-gold p-8 max-w-md w-full rounded-sm text-center shadow-2xl"
            >
              <CheckCircle className="text-gold mx-auto mb-4" size={48} />
              <h3 className="font-serif text-2xl text-white font-medium mb-2">Booking Logged</h3>
              <p className="text-gray-400 text-sm font-light mb-6 leading-relaxed">
                Your private showing inquiry has been registered in our central records. Redirecting you to WhatsApp to complete your concierge assignment...
              </p>
              <div className="flex items-center justify-center gap-2 text-gold text-xs uppercase tracking-widest font-semibold animate-pulse">
                <MessageCircle size={16} />
                <span>Launching WhatsApp...</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Core Booking Form */}
        <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-sm shadow-2xl">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
              <span className="text-xs uppercase tracking-widest text-gray-500">Retrieving Estate Listings...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {validationError && (
                <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-200 text-xs uppercase tracking-widest rounded-sm text-center">
                  {validationError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold/80 font-semibold flex items-center gap-1.5">
                    <User size={12} />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-navy-dark/80 border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-gray-500 tracking-wider transition-all"
                  />
                </div>

                {/* Property Dropdown Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold/80 font-semibold">
                    Select Estate *
                  </label>
                  <select
                    required
                    value={propId}
                    onChange={(e) => setPropId(e.target.value)}
                    className="w-full bg-navy-dark/80 border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white tracking-wider transition-all"
                  >
                    {properties.length === 0 ? (
                      <option value="">No estates available</option>
                    ) : (
                      properties.map(p => (
                        <option key={p.id} value={p.id} className="bg-navy-dark text-white">
                          {p.title} (${p.price.toLocaleString()})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* WhatsApp Number */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold/80 font-semibold flex items-center gap-1.5">
                    <MessageSquare size={12} />
                    <span>WhatsApp Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +233551056514"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full bg-navy-dark/80 border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-gray-500 tracking-wider transition-all"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold/80 font-semibold flex items-center gap-1.5">
                    <Phone size={12} />
                    <span>Direct Call Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +233 551 056 514"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-navy-dark/80 border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-gray-500 tracking-wider transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preferred Date */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold/80 font-semibold flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>Preferred Showing Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-navy-dark/80 border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-gray-500 tracking-wider transition-all"
                  />
                </div>

                {/* Preferred Time */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold/80 font-semibold flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>Preferred Time Slot *</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full bg-navy-dark/80 border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-gray-500 tracking-wider transition-all"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gold/80 font-semibold">
                  Custom Request or Additional Notes (Optional)
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Helicopter landing requests, discrete off-market inquiries, custom security specifications..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full bg-navy-dark/80 border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-gray-500 tracking-wider transition-all resize-none"
                />
              </div>

              {/* Submitting button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gold hover:bg-gold-hover text-navy-dark font-semibold tracking-widest text-xs uppercase py-4 rounded-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/10"
                >
                  <MessageCircle size={15} />
                  <span>Submit Booking & Open WhatsApp</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
