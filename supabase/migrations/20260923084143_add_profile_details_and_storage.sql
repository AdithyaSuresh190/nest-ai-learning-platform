/*
# Add personal details columns and avatar storage

1. Modified Tables
   - `profiles` table gets new columns for personal details:
     - `avatar_url` (text, nullable) — URL to uploaded avatar image in Supabase Storage
     - `bio` (text, nullable) — short bio / about me
     - `date_of_birth` (date, nullable) — date of birth
     - `phone` (text, nullable) — phone number
     - `address` (text, nullable) — home address

2. Storage
   - Create `avatars` storage bucket (public read, authenticated write)
   - Add storage policies so each authenticated user can upload/read/delete only their own avatars

3. Security
   - Existing RLS policies on `profiles` already allow users to update their own row — no policy changes needed
   - Storage policies: authenticated users can upload to their own folder, everyone can read (public avatars)
*/

-- Add personal detail columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text;

-- Create avatars storage bucket (public so avatars are publicly readable)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can upload/update/delete their own avatars
DROP POLICY IF EXISTS "Avatar uploads for authenticated users" ON storage.objects;
CREATE POLICY "Avatar uploads for authenticated users"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Avatar updates for authenticated users" ON storage.objects;
CREATE POLICY "Avatar updates for authenticated users"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Avatar deletes for authenticated users" ON storage.objects;
CREATE POLICY "Avatar deletes for authenticated users"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Public read for avatars
DROP POLICY IF EXISTS "Public read for avatars" ON storage.objects;
CREATE POLICY "Public read for avatars"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars');
