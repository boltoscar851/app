import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tipos para la aplicación
export type User = Database['public']['Tables']['user_profiles']['Row'];
export type Couple = Database['public']['Tables']['couples']['Row'];
export type CoupleMember = Database['public']['Tables']['couple_members']['Row'];
export type Message = {
  id: string;
  couple_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'sticker';
  created_at: string;
  sender_name?: string;
};

export type DiaryEntry = {
  id: string;
  couple_id: string;
  author_id: string;
  title: string;
  content: string;
  mood: string;
  photos: string[];
  created_at: string;
  author_name?: string;
};

export type Event = {
  id: string;
  couple_id: string;
  title: string;
  description: string;
  date: string;
  type: 'anniversary' | 'date' | 'special' | 'reminder';
  created_by: string;
  created_at: string;
};

// Funciones de autenticación
export const authService = {
  // Registrar nueva pareja
  async signUpCouple(
    email1: string,
    password1: string,
    name1: string,
    email2: string,
    password2: string,
    name2: string,
    coupleName: string
  ) {
    try {
      // Registrar primer usuario
      const { data: user1, error: error1 } = await supabase.auth.signUp({
        email: email1,
        password: password1,
        options: {
          data: {
            display_name: name1,
          },
        },
      });

      if (error1) throw error1;

      // Crear la pareja
      const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .insert({
          name: coupleName,
        })
        .select()
        .single();

      if (coupleError) throw coupleError;

      // Actualizar perfil del primer usuario con la pareja
      if (user1.user) {
        await supabase
          .from('user_profiles')
          .update({
            couple_id: couple.id,
            display_name: name1,
          })
          .eq('id', user1.user.id);

        // Crear miembro de pareja para el primer usuario
        await supabase
          .from('couple_members')
          .insert({
            couple_id: couple.id,
            user_id: user1.user.id,
            name: name1,
            role: 'partner_1',
          });
      }

      return {
        user1,
        couple,
        inviteCode: couple.id, // Código para que la pareja se una
      };
    } catch (error) {
      throw error;
    }
  },

  // Unirse a pareja existente
  async joinCouple(
    email: string,
    password: string,
    name: string,
    inviteCode: string
  ) {
    try {
      // Registrar segundo usuario
      const { data: user, error: userError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            display_name: name,
          },
        },
      });

      if (userError) throw userError;

      // Verificar que la pareja existe
      const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .select()
        .eq('id', inviteCode)
        .single();

      if (coupleError) throw coupleError;

      // Verificar que no hay ya un segundo miembro
      const { data: existingMembers } = await supabase
        .from('couple_members')
        .select()
        .eq('couple_id', inviteCode);

      if (existingMembers && existingMembers.length >= 2) {
        throw new Error('Esta pareja ya está completa');
      }

      // Actualizar perfil del usuario con la pareja
      if (user.user) {
        await supabase
          .from('user_profiles')
          .update({
            couple_id: couple.id,
            display_name: name,
          })
          .eq('id', user.user.id);

        // Crear miembro de pareja para el segundo usuario
        await supabase
          .from('couple_members')
          .insert({
            couple_id: couple.id,
            user_id: user.user.id,
            name: name,
            role: 'partner_2',
          });
      }

      return { user, couple };
    } catch (error) {
      throw error;
    }
  },

  // Iniciar sesión
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Cerrar sesión
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obtener usuario actual
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Obtener perfil del usuario
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        couples (*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener información de la pareja
  async getCoupleInfo(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        couple_id,
        couples (
          *,
          couple_members (
            *,
            user_profiles (*)
          )
        )
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar perfil del usuario
  async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Servicios de Chat
  async getMessages(coupleId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        user_profiles!sender_id (display_name)
      `)
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data.map(msg => ({
      ...msg,
      sender_name: msg.user_profiles?.display_name || 'Usuario'
    }));
  },

  async sendMessage(coupleId: string, senderId: string, content: string, messageType: 'text' | 'image' | 'sticker' = 'text') {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        couple_id: coupleId,
        sender_id: senderId,
        content,
        message_type: messageType,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Servicios de Diario
  async getDiaryEntries(coupleId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('diary_entries')
      .select(`
        *,
        user_profiles!author_id (display_name)
      `)
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data.map(entry => ({
      ...entry,
      author_name: entry.user_profiles?.display_name || 'Usuario'
    }));
  },

  async createDiaryEntry(coupleId: string, authorId: string, title: string, content: string, mood: string, photos: string[] = []) {
    const { data, error } = await supabase
      .from('diary_entries')
      .insert({
        couple_id: coupleId,
        author_id: authorId,
        title,
        content,
        mood,
        photos,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Servicios de Calendario
  async getEvents(coupleId: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('couple_id', coupleId)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createEvent(coupleId: string, createdBy: string, title: string, description: string, date: string, type: 'anniversary' | 'date' | 'special' | 'reminder') {
    const { data, error } = await supabase
      .from('events')
      .insert({
        couple_id: coupleId,
        created_by: createdBy,
        title,
        description,
        date,
        type,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Suscripciones en tiempo real
  subscribeToMessages(coupleId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`messages:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `couple_id=eq.${coupleId}`,
        },
        callback
      )
      .subscribe();
  },
};