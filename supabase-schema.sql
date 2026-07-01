-- ==============================================================
-- LUXHAVEN REALTY - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================
-- Run this script in your Supabase SQL Editor to provision
-- all tables, storage buckets, and security rules.

-- 1. Create Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    price BIGINT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    videos TEXT[] NOT NULL DEFAULT '{}',
    beds INT NOT NULL,
    baths INT NOT NULL,
    sqft INT NOT NULL,
    features TEXT[] NOT NULL DEFAULT '{}',
    "dateAdded" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Properties RLS Policies
-- Allow anyone (public anon/authenticated) to read property listings
CREATE POLICY "Allow public read access to properties" 
ON public.properties FOR SELECT 
USING (true);

-- Allow authenticated users (Owner) to insert property listings
CREATE POLICY "Allow auth insert access to properties" 
ON public.properties FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users (Owner) to update property listings
CREATE POLICY "Allow auth update access to properties" 
ON public.properties FOR UPDATE 
TO authenticated 
USING (true);

-- Allow authenticated users (Owner) to delete property listings
CREATE POLICY "Allow auth delete access to properties" 
ON public.properties FOR DELETE 
TO authenticated 
USING (true);


-- 2. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "propertyName" TEXT NOT NULL,
    "preferredDate" TEXT NOT NULL,
    "preferredTime" TEXT NOT NULL,
    "additionalNotes" TEXT DEFAULT '',
    "dateAdded" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Bookings RLS Policies
-- Allow public (anonymous) users to create/submit bookings
CREATE POLICY "Allow public insert access to bookings" 
ON public.bookings FOR INSERT 
WITH CHECK (true);

-- Allow authenticated users (Owner) to view bookings
CREATE POLICY "Allow auth read access to bookings" 
ON public.bookings FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users (Owner) to delete bookings
CREATE POLICY "Allow auth delete access to bookings" 
ON public.bookings FOR DELETE 
TO authenticated 
USING (true);


-- 3. Create Homepage Video Table
CREATE TABLE IF NOT EXISTS public.home_video (
    id TEXT PRIMARY KEY DEFAULT 'current',
    url TEXT NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Homepage Video
ALTER TABLE public.home_video ENABLE ROW LEVEL SECURITY;

-- Homepage Video RLS Policies
CREATE POLICY "Allow public read access to home_video" 
ON public.home_video FOR SELECT 
USING (true);

CREATE POLICY "Allow auth upsert access to home_video" 
ON public.home_video FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);


-- 4. Create Owner Photo Table
CREATE TABLE IF NOT EXISTS public.owner_photo (
    id TEXT PRIMARY KEY DEFAULT 'current',
    url TEXT NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Owner Photo
ALTER TABLE public.owner_photo ENABLE ROW LEVEL SECURITY;

-- Owner Photo RLS Policies
CREATE POLICY "Allow public read access to owner_photo" 
ON public.owner_photo FOR SELECT 
USING (true);

CREATE POLICY "Allow auth upsert access to owner_photo" 
ON public.owner_photo FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);


-- ==============================================================
-- 5. STORAGE BUCKETS PROVISIONING
-- ==============================================================
-- To set up storage buckets and policies, you can run the following
-- commands. (Note: Ensure the storage extension is loaded/enabled).

-- Create buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('property-images', 'property-images', true),
  ('property-videos', 'property-videos', true),
  ('homepage-videos', 'homepage-videos', true),
  ('owner-photos', 'owner-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage Buckets
-- Allow anyone to read files in property-images
CREATE POLICY "Allow public read property-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'property-images');

-- Allow authenticated users to manage files in property-images
CREATE POLICY "Allow auth manage property-images" 
ON storage.objects FOR ALL 
TO authenticated 
USING (bucket_id = 'property-images')
WITH CHECK (bucket_id = 'property-images');

-- Allow anyone to read files in property-videos
CREATE POLICY "Allow public read property-videos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'property-videos');

-- Allow authenticated users to manage files in property-videos
CREATE POLICY "Allow auth manage property-videos" 
ON storage.objects FOR ALL 
TO authenticated 
USING (bucket_id = 'property-videos')
WITH CHECK (bucket_id = 'property-videos');

-- Allow anyone to read files in homepage-videos
CREATE POLICY "Allow public read homepage-videos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'homepage-videos');

-- Allow authenticated users to manage files in homepage-videos
CREATE POLICY "Allow auth manage homepage-videos" 
ON storage.objects FOR ALL 
TO authenticated 
USING (bucket_id = 'homepage-videos')
WITH CHECK (bucket_id = 'homepage-videos');

-- Allow anyone to read files in owner-photos
CREATE POLICY "Allow public read owner-photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'owner-photos');

-- Allow authenticated users to manage files in owner-photos
CREATE POLICY "Allow auth manage owner-photos" 
ON storage.objects FOR ALL 
TO authenticated 
USING (bucket_id = 'owner-photos')
WITH CHECK (bucket_id = 'owner-photos');
