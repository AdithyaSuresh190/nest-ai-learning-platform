/*
# Fix avatar upload path authorization

## Purpose
Makes avatar uploads consistently match the authenticated Supabase user ID used by the profile page.

## Modified Storage Policies
- Replaces the avatar INSERT policy with an explicit `avatars/<auth-user-id>/...` path check.
- Replaces the avatar UPDATE policy with the same explicit path check.
- Replaces the avatar DELETE policy with the same explicit path check.
- Keeps public SELECT access because avatar URLs are intentionally public.

## Security
- Only authenticated users can create, replace, or delete files inside their own user folder.
- A user cannot write to another user's folder.
- No bucket is made private and no existing files are deleted.

## Important Notes
1. The frontend now uses the active auth session ID instead of relying only on the profile object.
2. Existing avatar files remain untouched.
3. The policy remains limited to the `avatars` bucket.
*/

DROP POLICY IF EXISTS "Avatar uploads for authenticated users" ON storage.objects;
CREATE POLICY "Avatar uploads for authenticated users"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND name LIKE (auth.uid()::text || '/%')
);

DROP POLICY IF EXISTS "Avatar updates for authenticated users" ON storage.objects;
CREATE POLICY "Avatar updates for authenticated users"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND name LIKE (auth.uid()::text || '/%')
)
WITH CHECK (
  bucket_id = 'avatars'
  AND name LIKE (auth.uid()::text || '/%')
);

DROP POLICY IF EXISTS "Avatar deletes for authenticated users" ON storage.objects;
CREATE POLICY "Avatar deletes for authenticated users"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND name LIKE (auth.uid()::text || '/%')
);
