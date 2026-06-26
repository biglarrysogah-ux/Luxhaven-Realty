import { Property, Booking, HomeVideo, OwnerPhoto } from '../types';
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

const DEFAULT_PROPERTIES: Property[] = [];

// Helper to initialize local storage
function initLocalStorage() {
  const existingProps = localStorage.getItem('lux_properties');
  if (existingProps) {
    try {
      const parsed = JSON.parse(existingProps) as Property[];
      // Filter out pre-populated mock listings so existing browser sessions are immediately cleaned
      const filtered = parsed.filter(
        p => p.id !== 'prop-001' && p.id !== 'prop-002' && p.id !== 'prop-003'
      );
      localStorage.setItem('lux_properties', JSON.stringify(filtered));
    } catch (e) {
      localStorage.setItem('lux_properties', JSON.stringify([]));
    }
  } else {
    localStorage.setItem('lux_properties', JSON.stringify([]));
  }

  if (!localStorage.getItem('lux_bookings')) {
    localStorage.setItem('lux_bookings', JSON.stringify([]));
  }
  if (!localStorage.getItem('lux_home_video')) {
    localStorage.setItem('lux_home_video', JSON.stringify(DEFAULT_HOME_VIDEO));
  }

  const existingPhoto = localStorage.getItem('lux_owner_photo');
  if (existingPhoto) {
    try {
      const parsed = JSON.parse(existingPhoto) as OwnerPhoto;
      // Clean up pre-populated mock photo
      if (parsed.url && parsed.url.includes('unsplash.com/photo-1560250097-0b93528c311a')) {
        parsed.url = '';
        localStorage.setItem('lux_owner_photo', JSON.stringify(parsed));
      }
    } catch (e) {
      localStorage.setItem('lux_owner_photo', JSON.stringify(DEFAULT_OWNER_PHOTO));
    }
  } else {
    localStorage.setItem('lux_owner_photo', JSON.stringify(DEFAULT_OWNER_PHOTO));
  }
}

initLocalStorage();

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
      console.warn('Supabase getHomeVideo failed, falling back to LocalStorage:', e);
    }
  }
  return JSON.parse(localStorage.getItem('lux_home_video') || JSON.stringify(DEFAULT_HOME_VIDEO));
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
      console.error('Supabase updateHomeVideo failed, writing to LocalStorage:', e);
    }
  }

  localStorage.setItem('lux_home_video', JSON.stringify(newVideo));
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
      console.warn('Supabase getOwnerPhoto failed, falling back to LocalStorage:', e);
    }
  }
  return JSON.parse(localStorage.getItem('lux_owner_photo') || JSON.stringify(DEFAULT_OWNER_PHOTO));
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
      console.error('Supabase updateOwnerPhoto failed, writing to LocalStorage:', e);
    }
  }

  localStorage.setItem('lux_owner_photo', JSON.stringify(newPhoto));
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
      console.warn('Supabase getProperties failed, falling back to LocalStorage:', e);
    }
  }
  const local = localStorage.getItem('lux_properties');
  return local ? JSON.parse(local) : DEFAULT_PROPERTIES;
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
      console.error('Supabase addProperty failed, writing to LocalStorage:', e);
    }
  }

  const list = await getProperties();
  const updatedList = [newProperty, ...list];
  localStorage.setItem('lux_properties', JSON.stringify(updatedList));
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
      console.error('Supabase editProperty failed, updating LocalStorage:', e);
    }
  }

  const list = await getProperties();
  const index = list.findIndex(p => p.id === property.id);
  if (index !== -1) {
    list[index] = property;
    localStorage.setItem('lux_properties', JSON.stringify(list));
  }
  return property;
}

export async function deleteProperty(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Fetch the property to get associated files
      const { data: property, error: fetchErr } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (property && !fetchErr) {
        // Attempt to clean up storage if paths exist
        const imagePaths = property.images.filter((url: string) => url.includes('/storage/v1/object/public/'));
        const videoPaths = property.videos.filter((url: string) => url.includes('/storage/v1/object/public/'));

        // Example deletion logic (extracted bucket names)
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

      // 2. Delete database entry
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Supabase deleteProperty failed, falling back to LocalStorage:', e);
    }
  }

  const list = await getProperties();
  const filtered = list.filter(p => p.id !== id);
  localStorage.setItem('lux_properties', JSON.stringify(filtered));
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
      console.warn('Supabase getBookings failed, falling back to LocalStorage:', e);
    }
  }
  const local = localStorage.getItem('lux_bookings');
  return local ? JSON.parse(local) : [];
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
      console.error('Supabase addBooking failed, writing to LocalStorage:', e);
    }
  }

  const list = await getBookings();
  const updatedList = [newBooking, ...list];
  localStorage.setItem('lux_bookings', JSON.stringify(updatedList));
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
      console.error('Supabase deleteBooking failed, removing from LocalStorage:', e);
    }
  }

  const list = await getBookings();
  const filtered = list.filter(b => b.id !== id);
  localStorage.setItem('lux_bookings', JSON.stringify(filtered));
  return true;
}

// --- Image & Video Upload Helper ---
// Since we are running in full client mode, we implement a robust upload function that:
// - If Supabase is configured: uploads files directly to the respective storage bucket.
// - If Local mode: converts the file to base64 so that it persists in localStorage!
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

      // Retrieve public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (e) {
      console.error('Supabase uploadFile failed, falling back to Base64 read:', e);
    }
  }

  // Fallback to Base64 encoding for live demo
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
