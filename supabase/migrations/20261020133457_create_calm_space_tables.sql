/*
# Create CalmSpace preferences and mood log tables

## Purpose
Adds two Supabase-backed tables for the CalmSpace module:
1. `calm_space_prefs` — stores each user's CalmSpace settings (theme, text size, quiet mode, sound toggle).
2. `calm_mood_logs` — records each mood check-in so users and caregivers can see emotional trends over time.

Both tables are owner-scoped with authenticated-only RLS, matching the existing profiles/chat_messages pattern.

## New Tables

### calm_space_prefs
- `id` (uuid, primary key, defaults to gen_random_uuid())
- `user_id` (uuid, not null, defaults to auth.uid(), references auth.users ON DELETE CASCADE) — owner
- `theme` (text, not null, default 'meadow') — one of: meadow, ocean, sunset, twilight
- `text_size` (text, not null, default 'medium') — one of: small, medium, large, x-large
- `quiet_mode` (boolean, not null, default false) — dims surrounding UI for sensory comfort
- `sound_enabled` (boolean, not null, default true) — gentle sound effects toggle
- `updated_at` (timestamptz, default now()) — last modification timestamp

### calm_mood_logs
- `id` (uuid, primary key, defaults to gen_random_uuid())
- `user_id` (uuid, not null, defaults to auth.uid(), references auth.users ON DELETE CASCADE) — owner
- `mood` (text, not null) — one of: great, okay, tired, stressed, sad
- `created_at` (timestamptz, default now()) — when the check-in happened

## Security
- RLS enabled on both tables.
- calm_space_prefs: each authenticated user can CRUD only their own preferences row.
- calm_mood_logs: each authenticated user can INSERT and SELECT only their own mood entries (no update/delete needed — moods are append-only logs).
- All policies scoped TO authenticated with auth.uid() ownership checks.
- user_id on both tables defaults to auth.uid() so inserts that omit it still pass WITH CHECK.

## Important Notes
1. calm_space_prefs is designed as a single row per user (upsert by user_id). The frontend will use upsert to create-or-update.
2. calm_mood_logs is append-only — users log a new entry each time they do a mood check-in. No update or delete policies are provided since mood history should not be editable.
3. A CHECK constraint on theme and text_size prevents invalid values from being stored.
4. Indexes on user_id for efficient lookups on both tables.
*/

-- ============ CALM_SPACE_PREFS TABLE ============
CREATE TABLE IF NOT EXISTS calm_space_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme text NOT NULL DEFAULT 'meadow' CHECK (theme IN ('meadow', 'ocean', 'sunset', 'twilight')),
  text_size text NOT NULL DEFAULT 'medium' CHECK (text_size IN ('small', 'medium', 'large', 'x-large')),
  quiet_mode boolean NOT NULL DEFAULT false,
  sound_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE calm_space_prefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_calm_prefs" ON calm_space_prefs;
CREATE POLICY "select_own_calm_prefs"
  ON calm_space_prefs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_calm_prefs" ON calm_space_prefs;
CREATE POLICY "insert_own_calm_prefs"
  ON calm_space_prefs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_calm_prefs" ON calm_space_prefs;
CREATE POLICY "update_own_calm_prefs"
  ON calm_space_prefs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_calm_prefs" ON calm_space_prefs;
CREATE POLICY "delete_own_calm_prefs"
  ON calm_space_prefs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_calm_space_prefs_user_id ON calm_space_prefs(user_id);

-- ============ CALM_MOOD_LOGS TABLE ============
CREATE TABLE IF NOT EXISTS calm_mood_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  mood text NOT NULL CHECK (mood IN ('great', 'okay', 'tired', 'stressed', 'sad')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE calm_mood_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_mood_logs" ON calm_mood_logs;
CREATE POLICY "select_own_mood_logs"
  ON calm_mood_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_mood_logs" ON calm_mood_logs;
CREATE POLICY "insert_own_mood_logs"
  ON calm_mood_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_calm_mood_logs_user_id_created_at
  ON calm_mood_logs (user_id, created_at);
