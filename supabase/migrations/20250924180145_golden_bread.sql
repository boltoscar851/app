/*
  # Create messages table for chat functionality

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `couple_id` (uuid, foreign key to couples)
      - `sender_id` (uuid, foreign key to auth.users)
      - `content` (text, message content)
      - `message_type` (text, type of message: text, image, sticker)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `messages` table
    - Add policy for couple members to read their messages
    - Add policy for couple members to send messages
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'sticker')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can read their messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Couple members can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Index for better performance
CREATE INDEX IF NOT EXISTS messages_couple_id_created_at_idx ON messages(couple_id, created_at DESC);