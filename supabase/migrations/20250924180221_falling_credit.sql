/*
  # Create wishlist table for shared couple wishlist

  1. New Tables
    - `wishlist_items`
      - `id` (uuid, primary key)
      - `couple_id` (uuid, foreign key to couples)
      - `title` (text, item title)
      - `description` (text, item description)
      - `category` (text, item category)
      - `priority` (text, priority level)
      - `estimated_cost` (decimal, estimated cost)
      - `image_url` (text, item image)
      - `is_completed` (boolean, if achieved)
      - `completed_at` (timestamp)
      - `added_by` (uuid, who added it)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `wishlist_items` table
    - Add policies for couple members to manage their wishlist
*/

CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'general' CHECK (category IN ('travel', 'experiences', 'gifts', 'goals', 'general')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_cost decimal(10,2),
  image_url text,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  added_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can read their wishlist"
  ON wishlist_items
  FOR SELECT
  TO authenticated
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Couple members can manage their wishlist"
  ON wishlist_items
  FOR ALL
  TO authenticated
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Index for better performance
CREATE INDEX IF NOT EXISTS wishlist_items_couple_id_created_at_idx ON wishlist_items(couple_id, created_at DESC);