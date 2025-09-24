/*
  # Sistema de Reglas Personalizadas

  1. New Tables
    - `custom_rules`
      - `id` (uuid, primary key)
      - `couple_id` (uuid, foreign key)
      - `rule_text` (text)
      - `order_index` (integer)
      - `is_active` (boolean)
      - `created_by` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on custom_rules table
    - Add policies for couples to manage their custom rules

  3. Functions
    - Function to get all rules (default + custom) for a couple
    - Function to reorder custom rules
*/

-- Custom Rules Table
CREATE TABLE IF NOT EXISTS custom_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE,
  rule_text text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE custom_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couples can read their custom rules"
  ON custom_rules
  FOR SELECT
  TO authenticated
  USING (couple_id IN (
    SELECT user_profiles.couple_id
    FROM user_profiles
    WHERE user_profiles.id = auth.uid()
  ));

CREATE POLICY "Couples can insert their custom rules"
  ON custom_rules
  FOR INSERT
  TO authenticated
  WITH CHECK (couple_id IN (
    SELECT user_profiles.couple_id
    FROM user_profiles
    WHERE user_profiles.id = auth.uid()
  ));

CREATE POLICY "Couples can update their custom rules"
  ON custom_rules
  FOR UPDATE
  TO authenticated
  USING (couple_id IN (
    SELECT user_profiles.couple_id
    FROM user_profiles
    WHERE user_profiles.id = auth.uid()
  ));

CREATE POLICY "Couples can delete their custom rules"
  ON custom_rules
  FOR DELETE
  TO authenticated
  USING (couple_id IN (
    SELECT user_profiles.couple_id
    FROM user_profiles
    WHERE user_profiles.id = auth.uid()
  ));

-- Function to get all rules for a couple (default + custom)
CREATE OR REPLACE FUNCTION get_couple_rules(p_couple_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_custom_rules jsonb := '[]';
  v_rule_record RECORD;
BEGIN
  -- Check if couple has premium custom rules feature
  IF NOT EXISTS (
    SELECT 1 FROM couple_premium_features
    WHERE couple_id = p_couple_id
    AND feature_name = 'custom_rules'
    AND is_enabled = true
    AND (expires_at IS NULL OR expires_at > now())
  ) THEN
    RETURN jsonb_build_object('custom_rules', '[]', 'has_premium', false);
  END IF;
  
  -- Get custom rules
  FOR v_rule_record IN
    SELECT rule_text, order_index
    FROM custom_rules
    WHERE couple_id = p_couple_id
    AND is_active = true
    ORDER BY order_index ASC, created_at ASC
  LOOP
    v_custom_rules := v_custom_rules || jsonb_build_object(
      'text', v_rule_record.rule_text,
      'order', v_rule_record.order_index
    );
  END LOOP;
  
  RETURN jsonb_build_object(
    'custom_rules', v_custom_rules,
    'has_premium', true
  );
END;
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_rules_couple_id ON custom_rules(couple_id);
CREATE INDEX IF NOT EXISTS idx_custom_rules_order ON custom_rules(couple_id, order_index);