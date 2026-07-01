import { Property, Booking, HomeVideo, OwnerPhoto, Review } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export { supabase, isSupabaseConfigured };

// ==========================================
// PRE-POPULATED MOCK DATA (High-End Luxury)
// ==========================================

export const DEFAULT_HOME_VIDEO: HomeVideo = {
  id: 'current',
  url: 'https://assets.mixkit.co/videos/preview/mixkit-luxury-home-with-swimming-pool-and-palm-trees-41584-large.mp4',
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_OWNER_PHOTO: OwnerPhoto = {
  id: 'current',
  url: '', // Start empty so user can upload via admin dashboard
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    name: 'Victoria Sterling',
    role: 'Global Asset Manager',
    quote: 'The service was absolute perfection. From the discrete, off-market viewing to the final signature of the Obsidian Pavilion, Luxhaven Realty treated our transaction with precision and absolute sophistication.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    dateAdded: new Date().toISOString()
  },
  {
    id: 'rev-002',
    name: 'Dr. Julian Sterling-vance',
    role: 'Venture Capitalist',
    quote: 'Luxhaven Realty is the gold standard of real estate. Their attention to detail, design literacy, and deep understanding of high-end architecture enabled us to find our coastal dream villa in Malibu in record time.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    dateAdded: new Date().toISOString()
  },
  {
    id: 'rev-003',
    name: 'Helena & Marcus Thorne',
    role: 'Founders, Thorne & Co.',
    quote: 'A breathtakingly smooth experience. They executed the marketing of our multi-million dollar estate on Amalfi with utmost class. WhatsApp communication was instant, responsive, and of the highest caliber.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    dateAdded: new Date().toISOString()
  }
];

const DEFAULT_PROPERTIES: Property[] = [];

// ==========================================
// INDEXEDDB CONFIGURATION (Robust Local DB)
// ==========================================
const DB_NAME = 'LuxhavenDB';
const DB_VERSION = 1;

function initIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('properties')) db.createObjectStore('properties', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('bookings')) db.createObjectStore('bookings', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('reviews')) db.createObjectStore('reviews', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('home_video')) db.createObjectStore('home_video', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('owner_photo')) db.createObjectStore('owner_photo', { keyPath: 'id' });
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

function getIDBStore(storeName: string, mode: 'readonly' | 'readwrite'): Promise<IDBObjectStore> {
  return initIndexedDB().then(db => {
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  });
}

// Helper functions for IndexedDB
async function idbGetAll<T>(storeName: string): Promise<T[]> {
  try {
    const store = await getIDBStore(storeName, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    const local = localStorage.getItem(`lux_${storeName}`);
    return local ? JSON.parse(local) : [];
  }
}

async function idbPut<T>(storeName: string, item: T): Promise<T> {
  try {
    const store = await getIDBStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    const local = localStorage.getItem(`lux_${storeName}`);
    let list = local ? JSON.parse(local) : [];
    const id = (item as any).id;
    const idx = list.findIndex((x: any) => x.id === id);
    if (idx !== -1) list[idx] = item;
    else list.push(item);
    localStorage.setItem(`lux_${storeName}`, JSON.stringify(list));
    return item;
  }
}

async function idbDelete(storeName: string, id: string): Promise<boolean> {
  try {
    const store = await getIDBStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    const local = localStorage.getItem(`lux_${storeName}`);
    if (local) {
      let list = JSON.parse(local);
      list = list.filter((x: any) => x.id !== id);
      localStorage.setItem(`lux_${storeName}`, JSON.stringify(list));
    }
    return true;
  }
}

// Migrate legacy LocalStorage data to IndexedDB on startup for compatibility
async function migrateLocalStorageToIDB() {
  try {
    // 1. Properties
    const propLocal = localStorage.getItem('lux_properties');
    if (propLocal) {
      const parsed = JSON.parse(propLocal) as Property[];
      const filtered = parsed.filter(p => p.id !== 'prop-001' && p.id !== 'prop-002' && p.id !== 'prop-003');
      for (const p of filtered) {
        await idbPut('properties', p);
      }
      localStorage.removeItem('lux_properties');
    }

    // 2. Bookings
    const bookingsLocal = localStorage.getItem('lux_bookings');
    if (bookingsLocal) {
      const parsed = JSON.parse(bookingsLocal) as Booking[];
      for (const b of parsed) {
        await idbPut('bookings', b);
      }
      localStorage.removeItem('lux_bookings');
    }

    // 3. Reviews
    const reviewsLocal = localStorage.getItem('lux_reviews');
    if (reviewsLocal) {
      const parsed = JSON.parse(reviewsLocal) as Review[];
      for (const r of parsed) {
        await idbPut('reviews', r);
      }
      localStorage.removeItem('lux_reviews');
    }

    // 4. Home Video
    const videoLocal = localStorage.getItem('lux_home_video');
    if (videoLocal) {
      const parsed = JSON.parse(videoLocal) as HomeVideo;
      await idbPut('home_video', parsed);
      localStorage.removeItem('lux_home_video');
    } else {
      const existing = await idbGetAll<HomeVideo>('home_video');
      if (existing.length === 0) {
        await idbPut('home_video', DEFAULT_HOME_VIDEO);
      }
    }

    // 5. Owner Photo
    const photoLocal = localStorage.getItem('lux_owner_photo');
    if (photoLocal) {
      const parsed = JSON.parse(photoLocal) as OwnerPhoto;
      if (parsed.url && parsed.url.includes('unsplash.com/photo-1560250097-0b93528c311a')) {
        parsed.url = '';
      }
      await idbPut('owner_photo', parsed);
      localStorage.removeItem('lux_owner_photo');
    } else {
      const existing = await idbGetAll<OwnerPhoto>('owner_photo');
      if (existing.length === 0) {
        await idbPut('owner_photo', DEFAULT_OWNER_PHOTO);
      }
    }
  } catch (err) {
    console.warn('Migration to IndexedDB failed or already completed', err);
  }
}

if (typeof window !== 'undefined') {
  migrateLocalStorageToIDB();
}

// ==========================================
// DATABASE INTERFACE FUNCTIONS
// ==========================================

// --- Home Video Management ---
export async function getHomeVideo(): Promise<HomeVideo> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('home_video')
        .select('*')
        .single();
      if (error || !data) throw error;
      return data;
    } catch (e) {
      console.warn('Supabase getHomeVideo failed, falling back to local DB:', e);
    }
  }
  const list = await idbGetAll<HomeVideo>('home_video');
  return list.find(v => v.id === 'current') || DEFAULT_HOME_VIDEO;
}

export async function updateHomeVideo(url: string): Promise<HomeVideo> {
  const newVideo: HomeVideo = {
    id: 'current',
    url,
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('home_video')
        .upsert(newVideo)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Supabase updateHomeVideo failed, writing to local DB:', e);
    }
  }

  await idbPut('home_video', newVideo);
  return newVideo;
}

// --- Owner Photo Management ---
export async function getOwnerPhoto(): Promise<OwnerPhoto> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('owner_photo')
        .select('*')
        .single();
      if (error || !data) throw error;
      return data;
    } catch (e) {
      console.warn('Supabase getOwnerPhoto failed, falling back to local DB:', e);
    }
  }
  const list = await idbGetAll<OwnerPhoto>('owner_photo');
  return list.find(p => p.id === 'current') || DEFAULT_OWNER_PHOTO;
}

export async function updateOwnerPhoto(url: string): Promise<OwnerPhoto> {
  const newPhoto: OwnerPhoto = {
    id: 'current',
    url,
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('owner_photo')
        .upsert(newPhoto)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Supabase updateOwnerPhoto failed, writing to local DB:', e);
    }
  }

  await idbPut('owner_photo', newPhoto);
  return newPhoto;
}

// --- Properties Management ---
export async function getProperties(): Promise<Property[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('dateAdded', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getProperties failed, falling back to local DB:', e);
    }
  }
  return idbGetAll<Property>('properties');
}

export async function addProperty(property: Omit<Property, 'id' | 'dateAdded'>): Promise<Property> {
  const newProperty: Property = {
    ...property,
    id: 'prop-' + Math.random().toString(36).substr(2, 9),
    dateAdded: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert(newProperty)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Supabase addProperty failed, writing to local DB:', e);
    }
  }

  await idbPut('properties', newProperty);
  return newProperty;
}

export async function editProperty(property: Property): Promise<Property> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(property)
        .eq('id', property.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Supabase editProperty failed, updating local DB:', e);
    }
  }

  await idbPut('properties', property);
  return property;
}

export async function deleteProperty(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: property, error: fetchErr } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (property && !fetchErr) {
        const imagePaths = property.images.filter((url: string) => url.includes('/storage/v1/object/public/'));
        const videoPaths = property.videos.filter((url: string) => url.includes('/storage/v1/object/public/'));
        const allPaths = [...imagePaths, ...videoPaths];
        for (const url of allPaths) {
          const parts = url.split('/storage/v1/object/public/');
          if (parts.length > 1) {
            const bucketAndPath = parts[1];
            const slashIndex = bucketAndPath.indexOf('/');
            const bucket = bucketAndPath.substring(0, slashIndex);
            const path = bucketAndPath.substring(slashIndex + 1);
            await supabase.storage.from(bucket).remove([path]);
          }
        }
      }

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Supabase deleteProperty failed, falling back to local DB:', e);
    }
  }

  await idbDelete('properties', id);
  return true;
}

// --- Bookings Management ---
export async function getBookings(): Promise<Booking[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('dateAdded', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getBookings failed, falling back to local DB:', e);
    }
  }
  return idbGetAll<Booking>('bookings');
}

export async function addBooking(booking: Omit<Booking, 'id' | 'dateAdded'>): Promise<Booking> {
  const newBooking: Booking = {
    ...booking,
    id: 'book-' + Math.random().toString(36).substr(2, 9),
    dateAdded: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(newBooking)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Supabase addBooking failed, writing to local DB:', e);
    }
  }

  await idbPut('bookings', newBooking);
  return newBooking;
}

export async function deleteBooking(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Supabase deleteBooking failed, removing from local DB:', e);
    }
  }

  await idbDelete('bookings', id);
  return true;
}

// --- Reviews Management ---
export async function getReviews(): Promise<Review[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('dateAdded', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getReviews failed, falling back to local DB:', e);
    }
  }
  const list = await idbGetAll<Review>('reviews');
  if (list.length > 0) {
    return list;
  } else {
    // Populate default reviews
    for (const r of DEFAULT_REVIEWS) {
      await idbPut('reviews', r);
    }
    return DEFAULT_REVIEWS;
  }
}

export async function addReview(review: Omit<Review, 'id' | 'dateAdded'>): Promise<Review> {
  const newReview: Review = {
    ...review,
    id: 'rev-' + Math.random().toString(36).substr(2, 9),
    dateAdded: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(newReview)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Supabase addReview failed, writing to local DB:', e);
    }
  }

  await idbPut('reviews', newReview);
  return newReview;
}

export async function deleteReview(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Supabase deleteReview failed, removing from local DB:', e);
    }
  }

  await idbDelete('reviews', id);
  return true;
}

// --- Image & Video Upload Helper ---
export async function uploadFile(
  file: File,
  bucket: 'property-images' | 'property-videos' | 'homepage-videos' | 'owner-photos'
): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (e) {
      console.error('Supabase uploadFile failed, falling back to local DB:', e);
    }
  }

  // Fallback to Base64 encoding saved in our local DB
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}
