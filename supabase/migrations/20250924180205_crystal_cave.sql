/*
  # Create activities and challenges tables for Phase 4 functionality

  1. New Tables
    - `activities`
      - `id` (uuid, primary key)
      - `title` (text, activity title)
      - `description` (text, activity description)
      - `category` (text, activity category: romantic, fun, surprise, challenge)
      - `difficulty` (text, difficulty level: easy, medium, hard)
      - `duration` (text, estimated duration)
      - `is_surprise` (boolean, if it's a surprise activity)
      - `created_at` (timestamp)

    - `couple_activities`
      - `id` (uuid, primary key)
      - `couple_id` (uuid, foreign key to couples)
      - `activity_id` (uuid, foreign key to activities)
      - `status` (text, completion status)
      - `completed_at` (timestamp, when completed)
      - `rating` (integer, couple's rating 1-5)
      - `notes` (text, couple's notes)
      - `created_at` (timestamp)

    - `weekly_challenges`
      - `id` (uuid, primary key)
      - `couple_id` (uuid, foreign key to couples)
      - `title` (text, challenge title)
      - `description` (text, challenge description)
      - `week_start` (date, start of the week)
      - `status` (text, completion status)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for couple access
*/

-- Activities table (predefined activities)
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text DEFAULT 'romantic' CHECK (category IN ('romantic', 'fun', 'surprise', 'challenge')),
  difficulty text DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  duration text DEFAULT '30 min',
  is_surprise boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Couple activities (tracking what couples have done)
CREATE TABLE IF NOT EXISTS couple_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at timestamptz,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(couple_id, activity_id)
);

-- Weekly challenges
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  week_start date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;

-- Activities policies (public read for all authenticated users)
CREATE POLICY "All authenticated users can read activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (true);

-- Couple activities policies
CREATE POLICY "Couple members can read their activities"
  ON couple_activities
  FOR SELECT
  TO authenticated
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Couple members can manage their activities"
  ON couple_activities
  FOR ALL
  TO authenticated
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Weekly challenges policies
CREATE POLICY "Couple members can read their challenges"
  ON weekly_challenges
  FOR SELECT
  TO authenticated
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Couple members can manage their challenges"
  ON weekly_challenges
  FOR ALL
  TO authenticated
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS couple_activities_couple_id_idx ON couple_activities(couple_id);
CREATE INDEX IF NOT EXISTS weekly_challenges_couple_id_week_idx ON weekly_challenges(couple_id, week_start);