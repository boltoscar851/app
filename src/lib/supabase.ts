import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { Database } from '../types/database';
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env';

// Get environment variables from react-native-dotenv
const supabaseUrl = EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Log warning for missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Please check your .env file and build configuration.');
  console.warn('Make sure to configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file');
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: Platform.OS !== 'web' ? undefined : window.localStorage,
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

export type Activity = {
  id: string;
  title: string;
  description: string;
  category: 'romantic' | 'fun' | 'surprise' | 'challenge';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  is_surprise: boolean;
  created_at: string;
};

export type CoupleActivity = {
  id: string;
  couple_id: string;
  activity_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at: string | null;
  rating: number | null;
  notes: string;
  created_at: string;
  activities?: Activity;
};

export type WeeklyChallenge = {
  id: string;
  couple_id: string;
  title: string;
  description: string;
  week_start: string;
  status: 'active' | 'completed' | 'expired';
  completed_at: string | null;
  created_at: string;
};

export type WishlistItem = {
  id: string;
  couple_id: string;
  title: string;
  description: string;
  category: 'travel' | 'experiences' | 'gifts' | 'goals' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_cost: number | null;
  image_url: string | null;
  is_completed: boolean;
  completed_at: string | null;
  added_by: string;
  created_at: string;
};

export type GalleryItem = {
  id: string;
  couple_id: string;
  uploaded_by: string;
  title: string;
  url: string;
  type: 'photo' | 'video';
  folder: string;
  is_favorite: boolean;
  created_at: string;
};

export type DailyQuestion = {
  id: string;
  question: string;
  date: string;
  is_active: boolean;
  created_at: string;
};

export type DailyQuestionAnswer = {
  id: string;
  question_id: string;
  couple_id: string;
  user_id: string;
  answer: string;
  created_at: string;
};

export type PremiumCode = {
  id: string;
  code: string;
  type: string;
  benefits: any;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
};

export type PremiumFeature = {
  id: string;
  couple_id: string;
  feature_name: string;
  is_enabled: boolean;
  activated_at: string;
  expires_at: string | null;
  created_at: string;
};

export type PremiumTheme = {
  id: string;
  name: string;
  display_name: string;
  colors: any;
  is_premium: boolean;
  preview_url: string | null;
  created_at: string;
};

export type CoupleSettings = {
  id: string;
  couple_id: string;
  theme_id: string | null;
  notifications_enabled: boolean;
  privacy_level: string;
  custom_settings: any;
  created_at: string;
  updated_at: string;
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
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase no está configurado. Por favor, configura las variables de entorno.');
      }

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

      // Solo crear el segundo usuario si se proporcionan sus datos
      if (email2 && password2 && name2) {
        // Registrar segundo usuario
        const { data: user2, error: error2 } = await supabase.auth.signUp({
          email: email2,
          password: password2,
          options: {
            data: {
              display_name: name2,
            },
          },
        });

        if (error2) throw error2;

        // Actualizar perfil del segundo usuario con la pareja
        if (user2.user) {
          await supabase
            .from('user_profiles')
            .update({
              couple_id: couple.id,
              display_name: name2,
            })
            .eq('id', user2.user.id);

          // Crear miembro de pareja para el segundo usuario
          await supabase
            .from('couple_members')
            .insert({
              couple_id: couple.id,
              user_id: user2.user.id,
              name: name2,
              role: 'partner_2',
            });
        }
      }

      return {
        user1,
        couple,
        inviteCode: couple.id, // Código para que la pareja se una
      };
    } catch (error) {
      console.error('Error in signUpCouple:', error);
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
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase no está configurado. Por favor, configura las variables de entorno.');
      }

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
      console.error('Error in joinCouple:', error);
      throw error;
    }
  },

  // Iniciar sesión
  async signIn(email: string, password: string) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase no está configurado. Por favor, configura las variables de entorno.');
    }

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
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase no está configurado');
    }

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

  // Servicios de Actividades
  async getActivities() {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCoupleActivities(coupleId: string) {
    const { data, error } = await supabase
      .from('couple_activities')
      .select(`
        *,
        activities (*)
      `)
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addActivityToCouple(coupleId: string, activityId: string) {
    const { data, error } = await supabase
      .from('couple_activities')
      .insert({
        couple_id: coupleId,
        activity_id: activityId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCoupleActivity(coupleActivityId: string, updates: Partial<CoupleActivity>) {
    const { data, error } = await supabase
      .from('couple_activities')
      .update(updates)
      .eq('id', coupleActivityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getRandomActivity(category?: string, excludeCompleted: boolean = true, coupleId?: string) {
    let query = supabase
      .from('activities')
      .select('*');

    if (category) {
      query = query.eq('category', category);
    }

    const { data: activities, error } = await query;
    if (error) throw error;

    if (excludeCompleted && coupleId) {
      // Get completed activities for this couple
      const { data: completedActivities } = await supabase
        .from('couple_activities')
        .select('activity_id')
        .eq('couple_id', coupleId)
        .eq('status', 'completed');

      const completedIds = completedActivities?.map(ca => ca.activity_id) || [];
      const availableActivities = activities.filter(a => !completedIds.includes(a.id));
      
      if (availableActivities.length === 0) {
        return activities[Math.floor(Math.random() * activities.length)];
      }
      
      return availableActivities[Math.floor(Math.random() * availableActivities.length)];
    }

    return activities[Math.floor(Math.random() * activities.length)];
  },

  // Servicios de Retos Semanales
  async getWeeklyChallenges(coupleId: string) {
    const { data, error } = await supabase
      .from('weekly_challenges')
      .select('*')
      .eq('couple_id', coupleId)
      .order('week_start', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createWeeklyChallenge(coupleId: string, title: string, description: string) {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    
    const { data, error } = await supabase
      .from('weekly_challenges')
      .insert({
        couple_id: coupleId,
        title,
        description,
        week_start: startOfWeek.toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateWeeklyChallenge(challengeId: string, updates: Partial<WeeklyChallenge>) {
    const { data, error } = await supabase
      .from('weekly_challenges')
      .update(updates)
      .eq('id', challengeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Servicios de Lista de Deseos
  async getWishlistItems(coupleId: string) {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        user_profiles!added_by (display_name)
      `)
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createWishlistItem(
    coupleId: string,
    addedBy: string,
    title: string,
    description: string,
    category: 'travel' | 'experiences' | 'gifts' | 'goals' | 'general',
    priority: 'low' | 'medium' | 'high' | 'urgent',
    estimatedCost?: number,
    imageUrl?: string
  ) {
    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({
        couple_id: coupleId,
        added_by: addedBy,
        title,
        description,
        category,
        priority,
        estimated_cost: estimatedCost,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateWishlistItem(itemId: string, updates: Partial<WishlistItem>) {
    const { data, error } = await supabase
      .from('wishlist_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteWishlistItem(itemId: string) {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  // Servicios de Galería
  async getGalleryItems(coupleId: string, folder?: string) {
    let query = supabase
      .from('gallery_items')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false });

    if (folder && folder !== 'all') {
      query = query.eq('folder', folder);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async uploadGalleryItem(
    coupleId: string,
    uploadedBy: string,
    title: string,
    url: string,
    type: 'photo' | 'video',
    folder: string
  ) {
    const { data, error } = await supabase
      .from('gallery_items')
      .insert({
        couple_id: coupleId,
        uploaded_by: uploadedBy,
        title,
        url,
        type,
        folder,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleGalleryFavorite(itemId: string, isFavorite: boolean) {
    const { data, error } = await supabase
      .from('gallery_items')
      .update({ is_favorite: isFavorite })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteGalleryItem(itemId: string) {
    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  // Servicios de Preguntas Diarias
  async getTodayQuestion() {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_questions')
      .select('*')
      .eq('date', today)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getQuestionAnswers(questionId: string, coupleId: string) {
    const { data, error } = await supabase
      .from('daily_question_answers')
      .select('*')
      .eq('question_id', questionId)
      .eq('couple_id', coupleId);

    if (error) throw error;
    return data;
  },

  async submitQuestionAnswer(
    questionId: string,
    coupleId: string,
    userId: string,
    answer: string
  ) {
    const { data, error } = await supabase
      .from('daily_question_answers')
      .upsert({
        question_id: questionId,
        couple_id: coupleId,
        user_id: userId,
        answer,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPreviousQuestions(coupleId: string, limit: number = 10) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_questions')
      .select(`
        *,
        daily_question_answers!inner (
          user_id,
          answer,
          created_at
        )
      `)
      .lt('date', today)
      .eq('daily_question_answers.couple_id', coupleId)
      .order('date', { ascending: false })
      .limit(limit);

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

  // Servicios Premium
  async activatePremiumCode(coupleId: string, code: string) {
    const { data, error } = await supabase.rpc('activate_premium_code', {
      p_couple_id: coupleId,
      p_code: code,
    });

    if (error) throw error;
    return data;
  },

  async getPremiumStatus(coupleId: string) {
    const { data, error } = await supabase.rpc('get_couple_premium_status', {
      p_couple_id: coupleId,
    });

    if (error) throw error;
    return data;
  },

  async getPremiumThemes() {
    const { data, error } = await supabase
      .from('premium_themes')
      .select('*')
      .order('is_premium', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getCoupleSettings(coupleId: string) {
    const { data, error } = await supabase
      .from('couple_settings')
      .select(`
        *,
        premium_themes (*)
      `)
      .eq('couple_id', coupleId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateCoupleSettings(coupleId: string, settings: Partial<CoupleSettings>) {
    const { data, error } = await supabase
      .from('couple_settings')
      .upsert({
        couple_id: coupleId,
        ...settings,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};