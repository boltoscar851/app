/*
  # Sistema Premium - Códigos y Funcionalidades Exclusivas

  1. New Tables
    - `premium_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `type` (text) - tipo de código premium
      - `benefits` (jsonb) - beneficios incluidos
      - `is_active` (boolean)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)
    
    - `couple_premium_features`
      - `id` (uuid, primary key)
      - `couple_id` (uuid, foreign key)
      - `feature_name` (text)
      - `is_enabled` (boolean)
      - `activated_at` (timestamp)
      - `expires_at` (timestamp)
    
    - `premium_themes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `display_name` (text)
      - `colors` (jsonb) - esquema de colores
      - `is_premium` (boolean)
      - `preview_url` (text)
    
    - `couple_settings`
      - `id` (uuid, primary key)
      - `couple_id` (uuid, foreign key)
      - `theme_id` (uuid, foreign key)
      - `notifications_enabled` (boolean)
      - `privacy_level` (text)
      - `custom_settings` (jsonb)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their premium features
    - Add policies for couples to access their settings

  3. Functions
    - Function to activate premium code
    - Function to check premium status
    - Function to get available themes
*/

-- Premium Codes Table
CREATE TABLE IF NOT EXISTS premium_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL DEFAULT 'basic',
  benefits jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE premium_codes ENABLE ROW LEVEL SECURITY;

-- Only admins can manage premium codes (for now, no policies - will be managed server-side)

-- Couple Premium Features Table
CREATE TABLE IF NOT EXISTS couple_premium_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE,
  feature_name text NOT NULL,
  is_enabled boolean DEFAULT true,
  activated_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE couple_premium_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can read their premium features"
  ON couple_premium_features
  FOR SELECT
  TO authenticated
  USING (couple_id IN (
    SELECT user_profiles.couple_id
    FROM user_profiles
    WHERE user_profiles.id = auth.uid()
  ));

-- Premium Themes Table
CREATE TABLE IF NOT EXISTS premium_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  colors jsonb DEFAULT '{}',
  is_premium boolean DEFAULT false,
  preview_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE premium_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read themes"
  ON premium_themes
  FOR SELECT
  TO authenticated
  USING (true);

-- Couple Settings Table
CREATE TABLE IF NOT EXISTS couple_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid UNIQUE REFERENCES couples(id) ON DELETE CASCADE,
  theme_id uuid REFERENCES premium_themes(id),
  notifications_enabled boolean DEFAULT true,
  privacy_level text DEFAULT 'private',
  custom_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE couple_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can read their settings"
  ON couple_settings
  FOR SELECT
  TO authenticated
  USING (couple_id IN (
    SELECT user_profiles.couple_id
    FROM user_profiles
    WHERE user_profiles.id = auth.uid()
  ));

CREATE POLICY "Couples can update their settings"
  ON couple_settings
  FOR UPDATE
  TO authenticated
  USING (couple_id IN (
    SELECT user_profiles.couple_id
    FROM user_profiles
    WHERE user_profiles.id = auth.uid()
  ));

CREATE POLICY "Couples can insert their settings"
  ON couple_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (couple_id IN (
    SELECT user_profiles.couple_id
    FROM user_profiles
    WHERE user_profiles.id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_couple_settings_updated_at
  BEFORE UPDATE ON couple_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default themes
INSERT INTO premium_themes (name, display_name, colors, is_premium) VALUES
('romantic_pink', 'Rosa Romántico', '{"primary": "#ff1493", "secondary": "#ff69b4", "accent": "#8b008b", "background": "#000000"}', false),
('golden_love', 'Amor Dorado', '{"primary": "#ffd700", "secondary": "#ffb347", "accent": "#ff8c00", "background": "#1a0f00"}', true),
('purple_passion', 'Pasión Púrpura', '{"primary": "#8b5cf6", "secondary": "#a78bfa", "accent": "#7c3aed", "background": "#0f0a1a"}', true),
('emerald_dream', 'Sueño Esmeralda', '{"primary": "#10b981", "secondary": "#34d399", "accent": "#059669", "background": "#0a1a0f"}', true),
('sunset_romance', 'Romance del Atardecer', '{"primary": "#f97316", "secondary": "#fb923c", "accent": "#ea580c", "background": "#1a0f0a"}', true);

-- Insert some premium codes for testing
INSERT INTO premium_codes (code, type, benefits, expires_at) VALUES
('AMOR2024', 'annual', '{"themes": true, "unlimited_photos": true, "priority_support": true, "custom_rules": true}', '2025-12-31 23:59:59'),
('PREMIUM30', 'monthly', '{"themes": true, "unlimited_photos": true}', '2024-11-30 23:59:59'),
('FOREVER', 'lifetime', '{"themes": true, "unlimited_photos": true, "priority_support": true, "custom_rules": true, "exclusive_features": true}', null);

-- Function to activate premium code
CREATE OR REPLACE FUNCTION activate_premium_code(
  p_couple_id uuid,
  p_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_premium_code premium_codes%ROWTYPE;
  v_feature_record RECORD;
  v_result jsonb;
BEGIN
  -- Get the premium code
  SELECT * INTO v_premium_code
  FROM premium_codes
  WHERE code = p_code AND is_active = true
  AND (expires_at IS NULL OR expires_at > now());
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código inválido o expirado');
  END IF;
  
  -- Update couple with special code
  UPDATE couples
  SET special_code = p_code
  WHERE id = p_couple_id;
  
  -- Activate premium features based on benefits
  IF (v_premium_code.benefits->>'themes')::boolean = true THEN
    INSERT INTO couple_premium_features (couple_id, feature_name, expires_at)
    VALUES (p_couple_id, 'premium_themes', v_premium_code.expires_at)
    ON CONFLICT (couple_id, feature_name) DO UPDATE SET
      is_enabled = true,
      expires_at = EXCLUDED.expires_at;
  END IF;
  
  IF (v_premium_code.benefits->>'unlimited_photos')::boolean = true THEN
    INSERT INTO couple_premium_features (couple_id, feature_name, expires_at)
    VALUES (p_couple_id, 'unlimited_photos', v_premium_code.expires_at)
    ON CONFLICT (couple_id, feature_name) DO UPDATE SET
      is_enabled = true,
      expires_at = EXCLUDED.expires_at;
  END IF;
  
  IF (v_premium_code.benefits->>'custom_rules')::boolean = true THEN
    INSERT INTO couple_premium_features (couple_id, feature_name, expires_at)
    VALUES (p_couple_id, 'custom_rules', v_premium_code.expires_at)
    ON CONFLICT (couple_id, feature_name) DO UPDATE SET
      is_enabled = true,
      expires_at = EXCLUDED.expires_at;
  END IF;
  
  -- Create default settings if not exists
  INSERT INTO couple_settings (couple_id)
  VALUES (p_couple_id)
  ON CONFLICT (couple_id) DO NOTHING;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Código premium activado exitosamente',
    'benefits', v_premium_code.benefits,
    'expires_at', v_premium_code.expires_at
  );
END;
$$;

-- Function to check premium status
CREATE OR REPLACE FUNCTION get_couple_premium_status(p_couple_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_features jsonb := '{}';
  v_feature_record RECORD;
BEGIN
  -- Get all active premium features
  FOR v_feature_record IN
    SELECT feature_name, is_enabled, expires_at
    FROM couple_premium_features
    WHERE couple_id = p_couple_id
    AND is_enabled = true
    AND (expires_at IS NULL OR expires_at > now())
  LOOP
    v_features := v_features || jsonb_build_object(
      v_feature_record.feature_name,
      jsonb_build_object(
        'enabled', v_feature_record.is_enabled,
        'expires_at', v_feature_record.expires_at
      )
    );
  END LOOP;
  
  RETURN jsonb_build_object(
    'is_premium', jsonb_object_keys(v_features) IS NOT NULL,
    'features', v_features
  );
END;
$$;

-- Add unique constraint for couple_premium_features
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'couple_premium_features_couple_id_feature_name_key'
  ) THEN
    ALTER TABLE couple_premium_features
    ADD CONSTRAINT couple_premium_features_couple_id_feature_name_key
    UNIQUE (couple_id, feature_name);
  END IF;
END $$;