/*
# Create Daily Routine and Sleep Companion tables

## Purpose
Adds durable, owner-scoped data for two new accessibility-focused modules:
- My Daily Routine: a simple timetable of personal activities and breaks.
- Calm Corner & Sleep Companion: bedtime settings and customizable bedtime steps.

## New Tables

### routine_activities
- `id` (uuid, primary key) — activity identifier.
- `user_id` (uuid, not null, defaults to auth.uid()) — signed-in owner.
- `title` (text, not null) — activity label.
- `start_time` (time, not null) — scheduled start time.
- `duration_minutes` (integer, not null, default 15) — planned length.
- `icon` (text, not null, default 'star') — visual icon key.
- `is_break` (boolean, not null, default false) — whether the item is a scheduled break.
- `reminder_enabled` (boolean, not null, default true) — whether the app should show an in-app reminder.
- `created_at` and `updated_at` (timestamptz) — record timestamps.

### sleep_companion_settings
- `id` (uuid, primary key) — settings identifier.
- `user_id` (uuid, unique, defaults to auth.uid()) — signed-in owner.
- `bedtime` and `wake_time` (time) — preferred sleep schedule.
- `reminder_enabled` (boolean) — bedtime reminder toggle.
- `sound_option` (text) — rain, ocean, nature, music, or silence.
- `volume` (integer) — sound volume from 0 to 100.
- `reduced_motion` (boolean) — sensory-friendly animation setting.
- `color_mode` (text) — soft, blue, green, or warm.
- `updated_at` (timestamptz) — last settings update.

### sleep_routine_steps
- `id` (uuid, primary key) — step identifier.
- `user_id` (uuid, not null, defaults to auth.uid()) — signed-in owner.
- `title` (text, not null) — bedtime step label.
- `position` (integer, not null) — display order.
- `enabled` (boolean, not null, default true) — whether the step is active.

## Security
- RLS is enabled on every table.
- Authenticated users receive only the CRUD permissions required by the UI.
- Every policy checks `auth.uid()` against `user_id`.
- No anonymous access is granted because this app has a sign-in screen.

## Important Notes
1. Settings use one row per user and are saved with an upsert on `user_id`.
2. Routine activities and bedtime steps are independently editable and deletable.
3. Database checks keep times, volumes, and option values within the supported UI choices.
*/

CREATE TABLE IF NOT EXISTS routine_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(trim(title)) > 0),
  start_time time NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 15 CHECK (duration_minutes BETWEEN 1 AND 480),
  icon text NOT NULL DEFAULT 'star' CHECK (icon IN ('sun', 'book', 'utensils', 'heart', 'star', 'music', 'home', 'walk', 'break')),
  is_break boolean NOT NULL DEFAULT false,
  reminder_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE routine_activities ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON routine_activities TO authenticated;

DROP POLICY IF EXISTS "select_own_routine_activities" ON routine_activities;
CREATE POLICY "select_own_routine_activities" ON routine_activities FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_routine_activities" ON routine_activities;
CREATE POLICY "insert_own_routine_activities" ON routine_activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_routine_activities" ON routine_activities;
CREATE POLICY "update_own_routine_activities" ON routine_activities FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_routine_activities" ON routine_activities;
CREATE POLICY "delete_own_routine_activities" ON routine_activities FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_routine_activities_user_time ON routine_activities(user_id, start_time);

CREATE TABLE IF NOT EXISTS sleep_companion_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  bedtime time NOT NULL DEFAULT '20:30',
  wake_time time NOT NULL DEFAULT '07:00',
  reminder_enabled boolean NOT NULL DEFAULT true,
  sound_option text NOT NULL DEFAULT 'silence' CHECK (sound_option IN ('rain', 'ocean', 'nature', 'music', 'silence')),
  volume integer NOT NULL DEFAULT 45 CHECK (volume BETWEEN 0 AND 100),
  reduced_motion boolean NOT NULL DEFAULT false,
  color_mode text NOT NULL DEFAULT 'soft' CHECK (color_mode IN ('soft', 'blue', 'green', 'warm')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sleep_companion_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON sleep_companion_settings TO authenticated;

DROP POLICY IF EXISTS "select_own_sleep_settings" ON sleep_companion_settings;
CREATE POLICY "select_own_sleep_settings" ON sleep_companion_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_sleep_settings" ON sleep_companion_settings;
CREATE POLICY "insert_own_sleep_settings" ON sleep_companion_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_sleep_settings" ON sleep_companion_settings;
CREATE POLICY "update_own_sleep_settings" ON sleep_companion_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_sleep_settings" ON sleep_companion_settings;
CREATE POLICY "delete_own_sleep_settings" ON sleep_companion_settings FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS sleep_routine_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(trim(title)) > 0),
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  enabled boolean NOT NULL DEFAULT true
);

ALTER TABLE sleep_routine_steps ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON sleep_routine_steps TO authenticated;

DROP POLICY IF EXISTS "select_own_sleep_steps" ON sleep_routine_steps;
CREATE POLICY "select_own_sleep_steps" ON sleep_routine_steps FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_sleep_steps" ON sleep_routine_steps;
CREATE POLICY "insert_own_sleep_steps" ON sleep_routine_steps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_sleep_steps" ON sleep_routine_steps;
CREATE POLICY "update_own_sleep_steps" ON sleep_routine_steps FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_sleep_steps" ON sleep_routine_steps;
CREATE POLICY "delete_own_sleep_steps" ON sleep_routine_steps FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sleep_routine_steps_user_position ON sleep_routine_steps(user_id, position);
