/*
  # Create events table for calendar functionality

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `couple_id` (uuid, foreign key to couples)
      - `title` (text, event title)
      - `description` (text, event description)
      - `date` (date, event date)
      - `type` (text, event type: anniversary, date, special, reminder)
      - `created_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `events` table
    - Add policy for couple members to read their events
    - Add policy for couple members to create events
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  date date NOT NULL,
  type text DEFAULT 'date' CHECK (type IN ('anniversary', 'date', 'special', 'reminder')),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can read their events"
  ON events
  FOR SELECT
  TO authenticated
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Couple members can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Index for better performance
CREATE INDEX IF NOT EXISTS events_couple_id_date_idx ON events(couple_id, date);