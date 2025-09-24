/*
  # Create diary entries table for couple diary functionality

  1. New Tables
    - `diary_entries`
      - `id` (uuid, primary key)
      - `couple_id` (uuid, foreign key to couples)
      - `author_id` (uuid, foreign key to auth.users)
      - `title` (text, entry title)
      - `content` (text, entry content)
      - `mood` (text, author's mood)
      - `photos` (text array, photo URLs)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `diary_entries` table
    - Add policy for couple members to read their entries
    - Add policy for couple members to create entries
*/

CREATE TABLE IF NOT EXISTS diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  mood text DEFAULT 'happy',
  photos text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can read their diary entries"
  ON diary_entries
  FOR SELECT
  TO authenticated
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Couple members can create diary entries"
  ON diary_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Index for better performance
CREATE INDEX IF NOT EXISTS diary_entries_couple_id_created_at_idx ON diary_entries(couple_id, created_at DESC);