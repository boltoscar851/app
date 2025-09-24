/*
  # Add Gallery and Daily Questions functionality

  1. New Tables
    - `gallery_items`
      - `id` (uuid, primary key)
      - `couple_id` (uuid, foreign key)
      - `uploaded_by` (uuid, foreign key)
      - `title` (text)
      - `url` (text)
      - `type` (text) - 'photo' or 'video'
      - `folder` (text) - category folder
      - `is_favorite` (boolean)
      - `created_at` (timestamp)
    
    - `daily_questions`
      - `id` (uuid, primary key)
      - `question` (text)
      - `date` (date)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    
    - `daily_question_answers`
      - `id` (uuid, primary key)
      - `question_id` (uuid, foreign key)
      - `couple_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `answer` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for couples to manage their own data
*/

-- Gallery Items Table
CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  uploaded_by uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT '',
  url text NOT NULL,
  type text NOT NULL DEFAULT 'photo',
  folder text NOT NULL DEFAULT 'general',
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can manage their gallery items"
  ON gallery_items
  FOR ALL
  TO authenticated
  USING (couple_id IN (
    SELECT user_profiles.couple_id
    FROM user_profiles
    WHERE user_profiles.id = auth.uid()
  ));

-- Daily Questions Table
CREATE TABLE IF NOT EXISTS daily_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  date date NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read active daily questions"
  ON daily_questions
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Daily Question Answers Table
CREATE TABLE IF NOT EXISTS daily_question_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES daily_questions(id) ON DELETE CASCADE NOT NULL,
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  answer text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, user_id)
);

ALTER TABLE daily_question_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own answers"
  ON daily_question_answers
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Couples can read their answers when both have answered"
  ON daily_question_answers
  FOR SELECT
  TO authenticated
  USING (
    couple_id IN (
      SELECT user_profiles.couple_id
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM daily_question_answers dqa2
      WHERE dqa2.question_id = daily_question_answers.question_id
      AND dqa2.couple_id = daily_question_answers.couple_id
      AND dqa2.user_id != daily_question_answers.user_id
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS gallery_items_couple_id_created_at_idx 
  ON gallery_items(couple_id, created_at DESC);

CREATE INDEX IF NOT EXISTS gallery_items_folder_idx 
  ON gallery_items(folder);

CREATE INDEX IF NOT EXISTS daily_questions_date_idx 
  ON daily_questions(date DESC);

CREATE INDEX IF NOT EXISTS daily_question_answers_question_couple_idx 
  ON daily_question_answers(question_id, couple_id);

-- Insert some sample daily questions
INSERT INTO daily_questions (question, date) VALUES
  ('¿Cuál es tu recuerdo favorito de nosotros?', CURRENT_DATE),
  ('¿Qué es lo que más admiras de tu pareja?', CURRENT_DATE + INTERVAL '1 day'),
  ('¿Cuál sería nuestro destino de viaje ideal?', CURRENT_DATE + INTERVAL '2 days'),
  ('¿Qué canción describe mejor nuestra relación?', CURRENT_DATE + INTERVAL '3 days'),
  ('¿Cuál es tu momento favorito del día con tu pareja?', CURRENT_DATE + INTERVAL '4 days'),
  ('¿Qué tradición te gustaría crear juntos?', CURRENT_DATE + INTERVAL '5 days'),
  ('¿Cuál es tu forma favorita de demostrar amor?', CURRENT_DATE + INTERVAL '6 days'),
  ('¿Qué sueño compartido te emociona más?', CURRENT_DATE + INTERVAL '7 days')
ON CONFLICT (date) DO NOTHING;