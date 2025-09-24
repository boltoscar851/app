/*
  # Fase 3 - Herramientas de Conexión

  1. New Tables
    - `messages` - Chat privado entre la pareja
      - `id` (uuid, primary key)
      - `couple_id` (uuid, foreign key)
      - `sender_id` (uuid, foreign key)
      - `content` (text)
      - `message_type` (text: 'text', 'image', 'sticker')
      - `created_at` (timestamp)
    
    - `diary_entries` - Diario de pareja
      - `id` (uuid, primary key)
      - `couple_id` (uuid, foreign key)
      - `author_id` (uuid, foreign key)
      - `title` (text)
      - `content` (text)
      - `mood` (text)
      - `photos` (text array)
      - `created_at` (timestamp)
    
    - `events` - Calendario de eventos
      - `id` (uuid, primary key)
      - `couple_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `date` (timestamp)
      - `type` (text: 'anniversary', 'date', 'special', 'reminder')
      - `created_by` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for couple members to access their data
*/

-- Messages table for private chat
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'sticker')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can read their messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (couple_id IN (
    SELECT couple_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Couple members can insert messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    ) AND sender_id = auth.uid()
  );

-- Diary entries table
CREATE TABLE IF NOT EXISTS diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT '',
  content text NOT NULL,
  mood text DEFAULT 'happy' CHECK (mood IN ('happy', 'love', 'excited', 'grateful', 'peaceful', 'sad', 'worried')),
  photos text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can read diary entries"
  ON diary_entries
  FOR SELECT
  TO authenticated
  USING (couple_id IN (
    SELECT couple_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Couple members can insert diary entries"
  ON diary_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    ) AND author_id = auth.uid()
  );

CREATE POLICY "Authors can update their diary entries"
  ON diary_entries
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

-- Events table for calendar
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  date timestamptz NOT NULL,
  type text DEFAULT 'date' CHECK (type IN ('anniversary', 'date', 'special', 'reminder')),
  created_by uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can read events"
  ON events
  FOR SELECT
  TO authenticated
  USING (couple_id IN (
    SELECT couple_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Couple members can insert events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Couple members can update events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (couple_id IN (
    SELECT couple_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Couple members can delete events"
  ON events
  FOR DELETE
  TO authenticated
  USING (couple_id IN (
    SELECT couple_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS messages_couple_id_created_at_idx ON messages(couple_id, created_at DESC);
CREATE INDEX IF NOT EXISTS diary_entries_couple_id_created_at_idx ON diary_entries(couple_id, created_at DESC);
CREATE INDEX IF NOT EXISTS events_couple_id_date_idx ON events(couple_id, date);