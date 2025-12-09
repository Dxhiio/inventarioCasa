-- 🗄️ STORAGE SETUP (ROBUST FIX) --
-- Run this in Supabase SQL Editor

-- 1. Reset Policies (Prevent conflicts by dropping them first)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
DROP POLICY IF EXISTS "User Update Own Images" ON storage.objects;
DROP POLICY IF EXISTS "User Delete Own Images" ON storage.objects;

-- 2. Create the bucket 'inventory_images' if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('inventory_images', 'inventory_images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Policy: Allow Public Read Access (Anyone can see images)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'inventory_images' );

-- 4. Policy: Allow Authenticated Uploads (Only logged in users can add images)
CREATE POLICY "Authenticated Uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'inventory_images' );

-- 5. Policy: Allow Users to Update/Delete their own images
CREATE POLICY "User Update Own Images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'inventory_images' AND owner = auth.uid() );

CREATE POLICY "User Delete Own Images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'inventory_images' AND owner = auth.uid() );