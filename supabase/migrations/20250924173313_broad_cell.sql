/*
  # Schema inicial para la aplicación de parejas

  1. Nuevas Tablas
    - `couples` - Información de las parejas registradas
      - `id` (uuid, primary key)
      - `name` (text) - Nombre de la pareja (ej: "Oscar y Yuritzy")
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_active` (boolean) - Si la pareja está activa
      - `special_code` (text) - Código especial para funciones premium
    
    - `couple_members` - Miembros de cada pareja
      - `id` (uuid, primary key)
      - `couple_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text) - Nombre del miembro
      - `role` (text) - Rol en la pareja ('partner_1' o 'partner_2')
      - `avatar_url` (text) - URL del avatar
      - `created_at` (timestamp)

    - `user_profiles` - Perfiles extendidos de usuarios
      - `id` (uuid, primary key, references auth.users)
      - `couple_id` (uuid, foreign key)
      - `display_name` (text)
      - `avatar_url` (text)
      - `preferences` (jsonb) - Preferencias del usuario
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para que solo los miembros de la pareja accedan a sus datos
    - Políticas de autenticación para usuarios registrados

  3. Funciones
    - Función para crear pareja automáticamente al registrarse
    - Triggers para mantener timestamps actualizados
*/

-- Crear tabla de parejas
CREATE TABLE IF NOT EXISTS couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  special_code text DEFAULT NULL
);

-- Crear tabla de miembros de pareja
CREATE TABLE IF NOT EXISTS couple_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('partner_1', 'partner_2')),
  avatar_url text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(couple_id, role),
  UNIQUE(user_id)
);

-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id uuid REFERENCES couples(id) ON DELETE SET NULL,
  display_name text NOT NULL DEFAULT '',
  avatar_url text DEFAULT NULL,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para couples
CREATE POLICY "Users can read their own couple data"
  ON couples
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own couple data"
  ON couples
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Políticas para couple_members
CREATE POLICY "Users can read their couple members"
  ON couple_members
  FOR SELECT
  TO authenticated
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert couple members"
  ON couple_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Políticas para user_profiles
CREATE POLICY "Users can read their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can read their partner's profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_couples_updated_at
  BEFORE UPDATE ON couples
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', ''));
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();