/*
# Create profiles and chat_messages tables

## Purpose
Adds Supabase-backed user profiles (storing role selection) and a chat_messages table
for the interactive AI chat module. Both tables are owner-scoped with authenticated-only RLS.

## New Tables

### profiles
- `id` (uuid, primary key, references auth.users) — links to the Supabase auth user
- `name` (text, not null) — display name
- `role` (text, not null) — one of: student, teacher, parent, therapist
- `avatar` (text) — emoji avatar
- `grade_level` (text, nullable) — for students
- `linked_students` (uuid[], nullable) — for parent/therapist, array of student profile IDs
- `created_at` (timestamptz, default now)

### chat_messages
- `id` (uuid, primary key)
- `user_id` (uuid, not null, defaults to auth.uid()) — owner
- `role` (text, not null) — 'user' or 'assistant'
- `content` (text, not null) — message text
- `created_at` (timestamptz, default now)

## Security
- RLS enabled on both tables.
- profiles: users can read/update only their own profile row.
- chat_messages: users can CRUD only their own messages.
- All policies scoped TO authenticated with auth.uid() ownership checks.
- user_id on chat_messages defaults to auth.uid() so inserts that omit it still pass the WITH CHECK.

## Important Notes
1. profiles.id references auth.users.id ON DELETE CASCADE so profile is removed when auth user is deleted.
2. linked_students is an array of UUIDs pointing to other profiles (students linked to a parent/therapist).
3. chat_messages stores both user and assistant messages so the full conversation is persisted.
*/

-- ============ PROFILES TABLE ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher', 'parent', 'therapist')),
  avatar text DEFAULT '🧒',
  grade_level text,
  linked_students uuid[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ============ CHAT_MESSAGES TABLE ============
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON chat_messages;
CREATE POLICY "select_own_messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_messages" ON chat_messages;
CREATE POLICY "insert_own_messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_messages" ON chat_messages;
CREATE POLICY "update_own_messages"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_messages" ON chat_messages;
CREATE POLICY "delete_own_messages"
  ON chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for efficient message retrieval by user
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id_created_at
  ON chat_messages (user_id, created_at);
