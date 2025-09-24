/*
  # Add sample premium data

  1. Sample Data
    - Add sample premium themes
    - Add sample premium codes
    - Add sample activities for premium users

  2. Functions
    - Function to activate premium codes
    - Function to get couple premium status
*/

-- Insert sample premium themes
INSERT INTO premium_themes (name, display_name, colors, is_premium, preview_url) VALUES
  ('classic_pink', 'Rosa Clásico', '{"gradient": ["#ff1493", "#8b008b"], "primary": "#ff1493", "secondary": "#8b008b"}', false, null),
  ('romantic_sunset', 'Atardecer Romántico', '{"gradient": ["#ff6b6b", "#feca57"], "primary": "#ff6b6b", "secondary": "#feca57"}', true, null),
  ('ocean_love', 'Amor Oceánico', '{"gradient": ["#3742fa", "#2f3542"], "primary": "#3742fa", "secondary": "#2f3542"}', true, null),
  ('golden_dreams', 'Sueños Dorados', '{"gradient": ["#f39c12", "#e67e22"], "primary": "#f39c12", "secondary": "#e67e22"}', true, null),
  ('purple_passion', 'Pasión Púrpura', '{"gradient": ["#8b5cf6", "#7c3aed"], "primary": "#8b5cf6", "secondary": "#7c3aed"}', true, null),
  ('forest_whisper', 'Susurro del Bosque', '{"gradient": ["#27ae60", "#2ecc71"], "primary": "#27ae60", "secondary": "#2ecc71"}', true, null);

-- Insert sample premium codes
INSERT INTO premium_codes (code, type, benefits, is_active, expires_at) VALUES
  ('LOVE2024', 'basic', '{"features": {"premium_themes": {"enabled": true}, "custom_rules": {"enabled": true}}, "duration_months": 3}', true, '2024-12-31 23:59:59'),
  ('PREMIUM30', 'premium', '{"features": {"premium_themes": {"enabled": true}, "custom_rules": {"enabled": true}, "advanced_activities": {"enabled": true}, "unlimited_storage": {"enabled": true}}, "duration_months": 1}', true, '2024-12-31 23:59:59'),
  ('FOREVER', 'lifetime', '{"features": {"premium_themes": {"enabled": true}, "custom_rules": {"enabled": true}, "advanced_activities": {"enabled": true}, "unlimited_storage": {"enabled": true}}, "duration_months": null}', true, null),
  ('TRIAL7', 'trial', '{"features": {"premium_themes": {"enabled": true}}, "duration_days": 7}', true, '2024-12-31 23:59:59');

-- Insert more sample activities for premium users
INSERT INTO activities (title, description, category, difficulty, duration, is_surprise) VALUES
  ('Cena a ciegas en casa', 'Preparen una cena especial donde uno cocina y el otro come con los ojos vendados, adivinando los sabores', 'romantic', 'medium', '2 horas', true),
  ('Búsqueda del tesoro romántica', 'Creen pistas por toda la casa que lleven a sorpresas románticas y terminen en un regalo especial', 'surprise', 'hard', '3 horas', true),
  ('Clase de baile privada', 'Aprendan un baile nuevo juntos siguiendo tutoriales online, desde salsa hasta vals', 'fun', 'medium', '1 hora', false),
  ('Noche de spa en pareja', 'Conviertan su hogar en un spa con masajes, mascarillas y relajación total', 'romantic', 'easy', '2 horas', false),
  ('Competencia de cocina', 'Cada uno cocina un plato diferente con los mismos ingredientes y deciden quién gana', 'challenge', 'medium', '1.5 horas', false),
  ('Sesión de fotos temática', 'Elijan un tema (vintage, elegante, divertido) y hagan una sesión de fotos casera', 'fun', 'easy', '1 hora', false),
  ('Maratón de películas de su año', 'Vean películas del año en que se conocieron y recuerden esos momentos', 'romantic', 'easy', '4 horas', false),
  ('Construcción de fuerte', 'Construyan un fuerte con almohadas y mantas en la sala y pasen la noche ahí', 'fun', 'easy', '1 hora', false);

-- Function to activate premium code
CREATE OR REPLACE FUNCTION activate_premium_code(p_couple_id uuid, p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_record premium_codes%ROWTYPE;
  v_feature_name text;
  v_feature_config json;
  v_expires_at timestamptz;
  v_result json;
BEGIN
  -- Check if code exists and is active
  SELECT * INTO v_code_record
  FROM premium_codes
  WHERE code = p_code AND is_active = true
  AND (expires_at IS NULL OR expires_at > now());
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Código inválido o expirado'
    );
  END IF;
  
  -- Check if code was already used by this couple
  IF EXISTS (
    SELECT 1 FROM couple_premium_features 
    WHERE couple_id = p_couple_id 
    AND created_at > now() - interval '1 day'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Ya has usado un código premium recientemente'
    );
  END IF;
  
  -- Calculate expiration date
  IF v_code_record.benefits->>'duration_months' IS NOT NULL THEN
    v_expires_at := now() + (v_code_record.benefits->>'duration_months')::int * interval '1 month';
  ELSIF v_code_record.benefits->>'duration_days' IS NOT NULL THEN
    v_expires_at := now() + (v_code_record.benefits->>'duration_days')::int * interval '1 day';
  ELSE
    v_expires_at := NULL; -- Lifetime
  END IF;
  
  -- Activate features
  FOR v_feature_name IN SELECT json_object_keys(v_code_record.benefits->'features')
  LOOP
    v_feature_config := v_code_record.benefits->'features'->v_feature_name;
    
    IF (v_feature_config->>'enabled')::boolean THEN
      INSERT INTO couple_premium_features (couple_id, feature_name, is_enabled, expires_at)
      VALUES (p_couple_id, v_feature_name, true, v_expires_at)
      ON CONFLICT (couple_id, feature_name) 
      DO UPDATE SET 
        is_enabled = true,
        expires_at = GREATEST(couple_premium_features.expires_at, v_expires_at),
        activated_at = now();
    END IF;
  END LOOP;
  
  -- Update couple with special code if it's a lifetime code
  IF v_code_record.type = 'lifetime' THEN
    UPDATE couples 
    SET special_code = p_code 
    WHERE id = p_couple_id;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Código premium activado exitosamente',
    'type', v_code_record.type,
    'expires_at', v_expires_at
  );
END;
$$;

-- Function to get couple premium status
CREATE OR REPLACE FUNCTION get_couple_premium_status(p_couple_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_features json;
  v_is_premium boolean := false;
  v_expires_at timestamptz;
BEGIN
  -- Get active premium features
  SELECT json_object_agg(
    feature_name,
    json_build_object(
      'enabled', is_enabled,
      'expires_at', expires_at
    )
  ) INTO v_features
  FROM couple_premium_features
  WHERE couple_id = p_couple_id
  AND is_enabled = true
  AND (expires_at IS NULL OR expires_at > now());
  
  -- Check if couple has any premium features
  IF v_features IS NOT NULL THEN
    v_is_premium := true;
    
    -- Get earliest expiration date
    SELECT MIN(expires_at) INTO v_expires_at
    FROM couple_premium_features
    WHERE couple_id = p_couple_id
    AND is_enabled = true
    AND expires_at IS NOT NULL;
  END IF;
  
  RETURN json_build_object(
    'is_premium', v_is_premium,
    'features', COALESCE(v_features, '{}'::json),
    'expires_at', v_expires_at
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION activate_premium_code(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_couple_premium_status(uuid) TO authenticated;