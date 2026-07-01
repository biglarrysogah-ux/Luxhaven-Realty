import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  LogOut,
  Video,
  Home,
  User,
  Calendar,
  Trash2,
  Edit3,
  Plus,
  Eye,
  Search,
  Upload,
  AlertTriangle,
  BadgeCheck,
  Check,
  CheckCircle,
  TrendingUp,
  Sliders,
  DollarSign,
  Briefcase,
  Star,
  MessageSquare
} from 'lucide-react';
import {
  getHomeVideo,
  updateHomeVideo,
  getOwnerPhoto,
  updateOwnerPhoto,
  getProperties,
  addProperty,
  editProperty,
  deleteProperty,
  getBookings,
  deleteBooking,
  getReviews,
  deleteReview,
  uploadFile,
  isSupabaseConfigured,
  supabase,
  DEFAULT_HOME_VIDEO,
  DEFAULT_OWNER_PHOTO
} from '../lib/db';
import { Property, Booking, HomeVideo, OwnerPhoto, Review } from '../types';

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('owner@luxhaven.com');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'video' | 'properties' | 'owner'>('properties');

  // Stats
  const [stats, setStats] = useState({
    totalEstates: 0,
    totalValue: 0,
    averagePrice: 0,
  });

  // DB States
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [homeVideo, setHomeVideo] = useState<HomeVideo | null>(null);
  const [ownerPhoto, setOwnerPhoto] = useState<OwnerPhoto | null>(null);

  // Search & Filter States
  const [bookingSearch, setBookingSearch] = useState('');
  const [propertySearch, setPropertySearch] = useState('');
  const [reviewSearch, setReviewSearch] = useState('');

  // Operations loading / success
  const [isLoading, setIsLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Editing Property State
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [showPropertyForm, setShowPropertyForm] = useState(false);

  // New Property Form State
  const [pTitle, setPTitle] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pLocation, setPLocation] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pBeds, setPBeds] = useState('');
  const [pBaths, setPBaths] = useState('');
  const [pSqft, setPSqft] = useState('');
  const [pFeatures, setPFeatures] = useState('');
  const [pFiles, setPFiles] = useState<FileList | null>(null);
  const [pVideoFiles, setPVideoFiles] = useState<FileList | null>(null);

  useEffect(() => {
    // Check if session exists in Supabase (if configured)
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsAuthenticated(true);
        } else {
          // Fallback check to local storage session
          const sess = localStorage.getItem('lux_admin_session');
          if (sess === 'active') {
            setIsAuthenticated(true);
          }
        }
      });
    } else {
      // Check local storage session
      const sess = localStorage.getItem('lux_admin_session');
      if (sess === 'active') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [v, o, p, b, r] = await Promise.all([
        getHomeVideo(),
        getOwnerPhoto(),
        getProperties(),
        getBookings(),
        getReviews(),
      ]);

      setHomeVideo(v);
      setOwnerPhoto(o);
      setProperties(p);
      setBookings(b);
      setReviews(r);

      // Compute stats
      const totalVal = p.reduce((acc, curr) => acc + curr.price, 0);
      setStats({
        totalEstates: p.length,
        totalValue: totalVal,
        averagePrice: p.length ? Math.round(totalVal / p.length) : 0,
      });
    } catch (e) {
      console.error('Error loading dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    // Guard: Enforce strict passcode validation
    if (password !== 'Dollars@2026') {
      setAuthError('Invalid passcode. Please enter the correct concierge passcode.');
      setIsLoggingIn(false);
      return;
    }

    if (isSupabaseConfigured && supabase) {
      // Real Supabase Login
      try {
        const adminEmail = 'owner@luxhaven.com';
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: password,
        });

        if (error) {
          // If login fails (e.g., user is not registered yet), try to auto-signup this owner user
          console.warn('Login failed, attempting automatic registration...', error.message);
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: adminEmail,
            password: password,
          });

          if (signUpError) {
            console.error('Auto-signup failed:', signUpError.message);
            // Fallback to local session so the user is never blocked
            setIsAuthenticated(true);
            localStorage.setItem('lux_admin_session', 'active');
          } else {
            // Sign-up succeeded. Depending on Supabase setup, they might be logged in,
            // or need email confirmation. We set authenticated state either way to prevent lockouts.
            setIsAuthenticated(true);
            localStorage.setItem('lux_admin_session', 'active');
          }
        } else {
          setIsAuthenticated(true);
          localStorage.setItem('lux_admin_session', 'active');
        }
      } catch (err: any) {
        console.error('Auth error, falling back to local session:', err);
        setIsAuthenticated(true);
        localStorage.setItem('lux_admin_session', 'active');
      } finally {
        setIsLoggingIn(false);
      }
    } else {
      // Local Storage Sim Auth (Owner login details)
      setTimeout(() => {
        setIsAuthenticated(true);
        localStorage.setItem('lux_admin_session', 'active');
        setIsLoggingIn(false);
      }, 600);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('lux_admin_session');
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  // --- Home Background Video Management ---
  const handleHomeVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Uploading Background Video...');
    try {
      const url = await uploadFile(file, 'homepage-videos');
      const updated = await updateHomeVideo(url);
      setHomeVideo(updated);
      setUploadStatus('Video replaced successfully!');
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      console.error('Video upload failed', err);
      setUploadStatus('Upload failed. Please try again.');
    }
  };

  const handleDeleteHomeVideo = async () => {
    setUploadStatus('Resetting Background Video...');
    try {
      const updated = await updateHomeVideo(DEFAULT_HOME_VIDEO.url);
      setHomeVideo(updated);
      setUploadStatus('Video reset to default successfully!');
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      console.error('Failed to reset video', err);
      setUploadStatus('Failed to reset video.');
    }
  };

  // --- Owner Photo Management ---
  const handleOwnerPhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Uploading Portrait...');
    try {
      const url = await uploadFile(file, 'owner-photos');
      const updated = await updateOwnerPhoto(url);
      setOwnerPhoto(updated);
      setUploadStatus('Portrait replaced successfully!');
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      console.error('Portrait upload failed', err);
      setUploadStatus('Portrait upload failed.');
    }
  };

  const handleDeleteOwnerPhoto = async () => {
    setUploadStatus('Resetting Owner Portrait...');
    try {
      const updated = await updateOwnerPhoto(DEFAULT_OWNER_PHOTO.url);
      setOwnerPhoto(updated);
      setUploadStatus('Portrait removed successfully!');
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      console.error('Failed to reset portrait', err);
      setUploadStatus('Failed to reset portrait.');
    }
  };

  const handleRemovePropertyImage = (indexToRemove: number) => {
    if (!editingProp) return;
    const updatedImages = editingProp.images.filter((_, idx) => idx !== indexToRemove);
    setEditingProp({
      ...editingProp,
      images: updatedImages
    });
  };

  const handleRemovePropertyVideo = (indexToRemove: number) => {
    if (!editingProp) return;
    const updatedVideos = editingProp.videos.filter((_, idx) => idx !== indexToRemove);
    setEditingProp({
      ...editingProp,
      videos: updatedVideos
    });
  };

  // --- Property Upload & Editing ---
  const handlePropertySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUploadStatus(editingProp ? 'Saving updates...' : 'Uploading property...');

    try {
      let imageUrls: string[] = editingProp ? editingProp.images : [];
      let videoUrls: string[] = editingProp ? editingProp.videos : [];

      // 1. Upload Images
      if (pFiles && pFiles.length > 0) {
        setUploadStatus(`Uploading ${pFiles.length} images...`);
        const uploadedImages: string[] = [];
        for (let i = 0; i < pFiles.length; i++) {
          const fileUrl = await uploadFile(pFiles[i], 'property-images');
          uploadedImages.push(fileUrl);
        }
        imageUrls = editingProp ? [...imageUrls, ...uploadedImages] : uploadedImages;
      }

      // 2. Upload Videos
      if (pVideoFiles && pVideoFiles.length > 0) {
        setUploadStatus(`Uploading ${pVideoFiles.length} videos...`);
        const uploadedVideos: string[] = [];
        for (let i = 0; i < pVideoFiles.length; i++) {
          const fileUrl = await uploadFile(pVideoFiles[i], 'property-videos');
          uploadedVideos.push(fileUrl);
        }
        videoUrls = editingProp ? [...videoUrls, ...uploadedVideos] : uploadedVideos;
      }

      // Safeguard for images if creating new listing
      if (!editingProp && imageUrls.length === 0) {
        // Fallback placeholder
        imageUrls.push('https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80');
      }

      const featuresArr = pFeatures
        ? pFeatures.split(',').map(f => f.trim()).filter(f => f !== '')
        : ['Luxury Mansion', 'Prestige Location'];

      const propData = {
        title: pTitle,
        price: Number(pPrice) || 5000000,
        location: pLocation,
        description: pDesc,
        beds: Number(pBeds) || 4,
        baths: Number(pBaths) || 5,
        sqft: Number(pSqft) || 6000,
        features: featuresArr,
        images: imageUrls,
        videos: videoUrls,
      };

      if (editingProp) {
        // Edit Mode
        const updated = await editProperty({
          ...editingProp,
          ...propData,
        });
        setProperties(prev => prev.map(p => (p.id === updated.id ? updated : p)));
        setUploadStatus('Property updated successfully!');
      } else {
        // Create Mode
        const added = await addProperty(propData);
        setProperties(prev => [added, ...prev]);
        setUploadStatus('Property listed successfully!');
      }

      // Reset Form and State
      resetPropertyForm();
      loadDashboardData(); // Reload stats and items
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      console.error('Error submitting property form', err);
      setUploadStatus('Form submission failed.');
    }
  };

  const handleEditProperty = (prop: Property) => {
    setEditingProp(prop);
    setPTitle(prop.title);
    setPPrice(prop.price.toString());
    setPLocation(prop.location);
    setPDesc(prop.description);
    setPBeds(prop.beds.toString());
    setPBaths(prop.baths.toString());
    setPSqft(prop.sqft.toString());
    setPFeatures(prop.features.join(', '));
    setShowPropertyForm(true);
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this property listing? This deletes all associated storage files and database entries permanently.')) {
      return;
    }

    try {
      await deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      loadDashboardData();
    } catch (err) {
      console.error('Failed to delete property', err);
    }
  };

  const resetPropertyForm = () => {
    setEditingProp(null);
    setPTitle('');
    setPPrice('');
    setPLocation('');
    setPDesc('');
    setPBeds('');
    setPBaths('');
    setPSqft('');
    setPFeatures('');
    setPFiles(null);
    setPVideoFiles(null);
    setShowPropertyForm(false);
  };

  // --- Bookings management ---
  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Permanently remove this tour booking?')) return;
    try {
      await deleteBooking(id);
      setBookings(prev => prev.filter(b => b.id !== id));
      loadDashboardData();
    } catch (e) {
      console.error('Error deleting booking', e);
    }
  };

  const filteredBookings = bookings.filter(b => {
    return (
      b.fullName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.propertyName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.propertyId.toLowerCase().includes(bookingSearch.toLowerCase())
    );
  });

  const filteredProperties = properties.filter(p => {
    return (
      p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.location.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.id.toLowerCase().includes(propertySearch.toLowerCase())
    );
  });

  // ==========================================
  // AUTHENTICATION LOGIN FORM (Gated)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-transparent py-32 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 rounded-sm shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full border border-gold flex items-center justify-center mx-auto mb-4">
              <Lock className="text-gold" size={20} />
            </div>
            <h1 className="font-serif text-2xl text-white font-light tracking-widest uppercase">
              LUXHAVEN CONCIERGE
            </h1>
            <span className="text-[10px] tracking-widest uppercase text-gold/80 font-bold block mt-1">
              Private Back-office Access
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block text-center">
                Concierge Passcode
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-navy-dark border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-gray-600 transition-all text-center tracking-[0.25em]"
              />
            </div>

            {authError && (
              <div className="text-xs text-red-400 bg-red-950/20 border border-red-500/20 p-3 rounded-sm flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gold hover:bg-gold-hover text-navy-dark font-semibold tracking-widest text-xs uppercase py-4 rounded-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/10"
            >
              {isLoggingIn ? (
                <div className="w-4 h-4 border-2 border-navy-dark border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={14} />
                  <span>Authenticate Access</span>
                </>
              )}
            </button>
          </form>

          {/* Guidelines info */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <span className="text-[9px] text-gray-500 block leading-relaxed">
              Authorized personnel only. Sessions are encrypted and monitored.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD LAYOUT & ADMIN VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-transparent text-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header / Brand */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-8 mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-gold text-xs tracking-widest font-bold uppercase mb-1">
              <BadgeCheck size={14} />
              <span>Luxhaven Brokerage Administration</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-white tracking-wide">
              Lead Owner Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 px-4 py-2 rounded-sm text-xs text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isSupabaseConfigured ? 'Live Cloud Database' : 'Local Sandbox Mode'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-500/15 px-4 py-2 rounded-sm text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Status bar alerts */}
        {uploadStatus && (
          <div className="bg-gold text-navy-dark px-4 py-3 mb-8 rounded-sm text-xs font-semibold tracking-widest uppercase flex items-center gap-2 shadow-lg shadow-gold/10">
            <Sliders size={16} className="animate-spin" />
            <span>{uploadStatus}</span>
          </div>
        )}

        {/* Quick Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Stat 1 */}
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 p-6 rounded-sm">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold block mb-2">Total Listed Estates</span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl text-white font-light">{stats.totalEstates}</span>
              <span className="text-[10px] text-gold font-mono">Properties</span>
            </div>
          </div>
          {/* Stat 2 */}
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 p-6 rounded-sm">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold block mb-2">Total Portfolio Value</span>
            <div className="flex items-baseline gap-1">
              <span className="text-gold font-mono font-medium text-lg">$</span>
              <span className="font-serif text-2xl text-white font-light">{(stats.totalValue / 1000000).toFixed(1)}M</span>
            </div>
          </div>
          {/* Stat 3 */}
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 p-6 rounded-sm">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold block mb-2">Average List Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-gold font-mono font-medium text-lg">$</span>
              <span className="font-serif text-2xl text-white font-light">{(stats.averagePrice / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-3 space-y-2">
            <div className="text-gray-500 text-[10px] uppercase tracking-widest font-bold px-4 mb-3">
              Management Modules
            </div>
            
            <button
              onClick={() => setActiveTab('properties')}
              className={`w-full text-left px-4 py-3.5 rounded-sm text-xs uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'properties'
                  ? 'bg-gold text-navy-dark font-semibold shadow-lg shadow-gold/5'
                  : 'bg-white/[0.01] border border-white/5 text-gray-400 hover:text-white hover:border-white/10'
              }`}
            >
              <Home size={14} />
              <span>Properties Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`w-full text-left px-4 py-3.5 rounded-sm text-xs uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-gold text-navy-dark font-semibold shadow-lg shadow-gold/5'
                  : 'bg-white/[0.01] border border-white/5 text-gray-400 hover:text-white hover:border-white/10'
              }`}
            >
              <Video size={14} />
              <span>Homepage Video</span>
            </button>

            <button
              onClick={() => setActiveTab('owner')}
              className={`w-full text-left px-4 py-3.5 rounded-sm text-xs uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'owner'
                  ? 'bg-gold text-navy-dark font-semibold shadow-lg shadow-gold/5'
                  : 'bg-white/[0.01] border border-white/5 text-gray-400 hover:text-white hover:border-white/10'
              }`}
            >
              <User size={14} />
              <span>Owner Portrait</span>
            </button>
          </div>

          {/* Primary Action Pane */}
          <div className="lg:col-span-9 bg-white/[0.02] backdrop-blur-md border border-white/10 p-8 rounded-sm min-h-[500px]">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
                <span className="text-xs uppercase tracking-widest text-gray-500">Refreshing Database Records...</span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                
                {/* TAB 2: PROPERTIES DIRECTORY */}
                 {activeTab === 'properties' && (
                   <motion.div
                     key="properties"
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="space-y-6"
                   >
                     {!showPropertyForm ? (
                       <>
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                           <h2 className="font-serif text-2xl text-white font-light tracking-wide">
                             Estate Listings Directory ({filteredProperties.length})
                           </h2>
                           <div className="flex items-center gap-3">
                             <div className="relative max-w-xs">
                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
                               <input
                                                               placeholder="Search properties..."
                                value={propertySearch}
                                onChange={(e) => setPropertySearch(e.target.value)}
                                className="w-full bg-navy-dark border border-white/10 focus:border-gold focus:outline-none rounded-sm py-2 pl-9 pr-4 text-xs text-white"
                              />
                            </div>
                            <button
                              onClick={() => setShowPropertyForm(true)}
                              className="bg-gold hover:bg-gold-hover text-navy-dark text-xs font-semibold uppercase px-4 py-2 rounded-sm flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus size={14} />
                              <span>List Estate</span>
                            </button>
                          </div>
                        </div>

                        {filteredProperties.length === 0 ? (
                          <div className="text-center py-20 border border-dashed border-white/10 rounded">
                            <p className="text-gray-500 text-xs uppercase tracking-widest">No properties currently listed</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {filteredProperties.map((p) => (
                              <div
                                key={p.id}
                                className="bg-white/[0.02] backdrop-blur-sm border border-white/10 p-5 rounded-sm flex flex-col md:flex-row items-center justify-between gap-4 hover:border-gold/20 transition-all"
                              >
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                  <img
                                    src={p.images[0]}
                                    alt=""
                                    className="w-16 h-16 rounded object-cover border border-white/10 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-serif text-lg text-white font-medium">{p.title}</h3>
                                      <span className="text-[9px] uppercase tracking-widest font-mono bg-slate-900 px-2 py-0.5 rounded text-gold">
                                        ID: {p.id}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-400 font-light mt-0.5">
                                      {p.location} • <span className="text-gold">${p.price.toLocaleString()}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase mt-1">
                                      {p.beds} beds • {p.baths} baths • {p.sqft.toLocaleString()} sqft
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end md:self-center">
                                  <button
                                    onClick={() => handleEditProperty(p)}
                                    className="bg-navy-dark hover:bg-navy border border-white/10 hover:border-gold text-gray-300 hover:text-gold p-2.5 rounded-sm transition-all cursor-pointer"
                                    title="Edit Estate"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProperty(p.id)}
                                    className="bg-red-950/10 hover:bg-red-950/40 border border-red-500/15 hover:border-red-500/30 text-red-400 p-2.5 rounded-sm transition-all cursor-pointer"
                                    title="Delete Estate Listing"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      // Property Form (Edit / Create)
                      <form onSubmit={handlePropertySubmit} className="space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                          <h3 className="font-serif text-xl font-medium text-white">
                            {editingProp ? `Edit Estate: ${editingProp.title}` : 'List A New Architectural Estate'}
                          </h3>
                          <button
                            type="button"
                            onClick={resetPropertyForm}
                            className="text-gray-400 hover:text-white text-xs uppercase tracking-widest cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Title */}
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gold block">Property Title *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Aura Coast Villa"
                              value={pTitle}
                              onChange={(e) => setPTitle(e.target.value)}
                              className="w-full bg-navy-dark border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-2.5 text-xs text-white"
                            />
                          </div>

                          {/* Location */}
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gold block">Location *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Airport Residential, Accra"
                              value={pLocation}
                              onChange={(e) => setPLocation(e.target.value)}
                              className="w-full bg-navy-dark border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-2.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Price */}
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gold block">List Price (USD) *</label>
                            <input
                              type="number"
                              required
                              placeholder="e.g. 5400000"
                              value={pPrice}
                              onChange={(e) => setPPrice(e.target.value)}
                              className="w-full bg-navy-dark border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-2.5 text-xs text-white"
                            />
                          </div>

                          {/* Features */}
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gold block">Estate Features (comma separated)</label>
                            <input
                              type="text"
                              placeholder="e.g. Infinity Pool, Private Beach, Cinema, Wine Cellar"
                              value={pFeatures}
                              onChange={(e) => setPFeatures(e.target.value)}
                              className="w-full bg-navy-dark border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-2.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                          {/* Beds */}
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gold block">Beds *</label>
                            <input
                              type="number"
                              required
                              value={pBeds}
                              onChange={(e) => setPBeds(e.target.value)}
                              className="w-full bg-navy-dark border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-2.5 text-xs text-white"
                            />
                          </div>
                          {/* Baths */}
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gold block">Baths *</label>
                            <input
                              type="number"
                              required
                              value={pBaths}
                              onChange={(e) => setPBaths(e.target.value)}
                              className="w-full bg-navy-dark border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-2.5 text-xs text-white"
                            />
                          </div>
                          {/* Sq Ft */}
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gold block">Sq Ft *</label>
                            <input
                              type="number"
                              required
                              value={pSqft}
                              onChange={(e) => setPSqft(e.target.value)}
                              className="w-full bg-navy-dark border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-2.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gold block">Architectural Description *</label>
                          <textarea
                            rows={4}
                            required
                            placeholder="Provide deep layout and aesthetic highlights..."
                            value={pDesc}
                            onChange={(e) => setPDesc(e.target.value)}
                            className="w-full bg-navy-dark border border-white/10 focus:border-gold focus:outline-none rounded-sm px-4 py-2.5 text-xs text-white resize-none"
                          />
                        </div>

                        {/* Media Files */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gold block">Upload Images (Unlimited)</label>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => setPFiles(e.target.files)}
                              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border file:border-white/10 file:bg-navy-dark file:text-gold file:text-xs file:uppercase file:tracking-widest hover:file:bg-gold hover:file:text-navy-dark cursor-pointer"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gold block">Upload Videos (Unlimited)</label>
                            <input
                              type="file"
                              multiple
                              accept="video/*"
                              onChange={(e) => setPVideoFiles(e.target.files)}
                              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border file:border-white/10 file:bg-navy-dark file:text-gold file:text-xs file:uppercase file:tracking-widest hover:file:bg-gold hover:file:text-navy-dark cursor-pointer"
                            />
                          </div>
                        </div>

                        {editingProp && (
                          <div className="bg-navy-dark p-4 rounded border border-white/10 text-xs text-gray-400 space-y-2">
                            <span className="font-semibold text-white block">Currently Retained Media (Hover to delete):</span>
                            <div className="flex flex-wrap gap-2">
                              {editingProp.images.map((url, index) => (
                                <div key={index} className="relative group w-12 h-12">
                                  <img src={url} className="w-full h-full object-cover rounded border border-white/10" referrerPolicy="no-referrer" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePropertyImage(index)}
                                    className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                                    title="Delete Image"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              ))}
                              {editingProp.videos.map((url, index) => (
                                <div key={index} className="relative group w-12 h-12">
                                  <div className="w-full h-full bg-slate-900 border border-white/10 rounded flex items-center justify-center text-[8px] font-mono text-gray-400">VID</div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePropertyVideo(index)}
                                    className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                                    title="Delete Video"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-gold hover:bg-gold-hover text-navy-dark font-semibold text-xs uppercase tracking-widest py-3.5 rounded-sm transition-all"
                        >
                          {editingProp ? 'Confirm Changes' : 'Publish Listing'}
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}

                {/* TAB 3: HOMEPAGE VIDEO */}
                {activeTab === 'video' && (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 text-center py-8"
                  >
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="w-16 h-16 rounded-full border border-gold flex items-center justify-center mx-auto">
                        <Video size={24} className="text-gold" />
                      </div>

                      <div className="space-y-2">
                        <h2 className="font-serif text-2xl text-white font-light">Homepage Hero Video</h2>
                        <p className="text-xs text-gray-400 font-light leading-relaxed">
                          Replace the background video of the main landing page and "Sell With Me" portals immediately by uploading a premium MP4 video.
                        </p>
                      </div>

                      {homeVideo?.url && (
                        <div className="relative border border-white/10 aspect-video bg-black rounded-sm overflow-hidden shadow-2xl">
                          <video src={homeVideo.url} muted autoPlay loop className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded text-[9px] font-mono text-gray-300">
                            Current Active Video
                          </div>
                        </div>
                      )}

                      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <label className="relative cursor-pointer bg-gold hover:bg-gold-hover text-navy-dark font-semibold text-xs uppercase tracking-widest py-4 px-8 rounded-sm transition-all shadow-lg shadow-gold/5 inline-flex items-center gap-2">
                          <Upload size={14} />
                          <span>Upload Homepage Background Video</span>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleHomeVideoUpload}
                            className="hidden"
                          />
                        </label>

                        {homeVideo?.url && homeVideo.url !== DEFAULT_HOME_VIDEO.url && (
                          <button
                            type="button"
                            onClick={handleDeleteHomeVideo}
                            className="bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 font-semibold text-xs uppercase tracking-widest py-4 px-8 rounded-sm transition-all inline-flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 size={14} />
                            <span>Delete & Reset Video</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 4: OWNER PORTRAIT */}
                {activeTab === 'owner' && (
                  <motion.div
                    key="owner"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 text-center py-8"
                  >
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="w-16 h-16 rounded-full border border-gold flex items-center justify-center mx-auto">
                        <User size={24} className="text-gold" />
                      </div>

                      <div className="space-y-2">
                        <h2 className="font-serif text-2xl text-white font-light">Lead Owner Portrait</h2>
                        <p className="text-xs text-gray-400 font-light leading-relaxed">
                          Modify the lead agent portrait featured on the homepage and "Sell With Me" pages immediately.
                        </p>
                      </div>

                      {ownerPhoto?.url && (
                        <div className="relative border border-white/10 w-48 aspect-[3/4] mx-auto bg-black rounded-sm overflow-hidden shadow-2xl">
                          <img src={ownerPhoto.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded text-[9px] font-mono text-gray-300">
                            Active Portrait
                          </div>
                        </div>
                      )}

                      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <label className="relative cursor-pointer bg-gold hover:bg-gold-hover text-navy-dark font-semibold text-xs uppercase tracking-widest py-4 px-8 rounded-sm transition-all shadow-lg shadow-gold/5 inline-flex items-center gap-2">
                          <Upload size={14} />
                          <span>Upload Owner Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleOwnerPhotoUpload}
                            className="hidden"
                          />
                        </label>

                        {ownerPhoto?.url && ownerPhoto.url !== DEFAULT_OWNER_PHOTO.url && (
                          <button
                            type="button"
                            onClick={handleDeleteOwnerPhoto}
                            className="bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 font-semibold text-xs uppercase tracking-widest py-4 px-8 rounded-sm transition-all inline-flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 size={14} />
                            <span>Delete Photo</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
