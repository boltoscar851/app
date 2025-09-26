import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, authService, User, Couple } from '../lib/supabase';

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: User | null;
  couple: Couple | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUpCouple: (
    email1: string,
    password1: string,
    name1: string,
    email2: string,
    password2: string,
    name2: string,
    coupleName: string
  ) => Promise<{ inviteCode: string }>;
  joinCouple: (
    email: string,
    password: string,
    name: string,
    inviteCode: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setCouple(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await authService.getUserProfile(userId);
      setUserProfile(profile);

      if (profile.couple_id) {
        const coupleInfo = await authService.getCoupleInfo(userId);
        setCouple(coupleInfo.couples);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Continue execution even if there's an error
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.signIn(email, password);
    } catch (error) {
      setLoading(false);
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUpCouple = async (
    email1: string,
    password1: string,
    name1: string,
    email2: string,
    password2: string,
    name2: string,
    coupleName: string
  ) => {
    setLoading(true);
    console.log('Starting signUpCouple process...');
    try {
      const result = await authService.signUpCouple(
        email1,
        password1,
        name1,
        email2,
        password2,
        name2,
        coupleName
      );
      // No hacer auto-login aquí, dejar que el usuario haga login manualmente
      console.log('SignUpCouple successful:', result);
      setLoading(false);
      return { inviteCode: result.inviteCode };
    } catch (error) {
      setLoading(false);
      console.error('Sign up couple error:', error);
      throw error;
    }
  };

  const joinCouple = async (
    email: string,
    password: string,
    name: string,
    inviteCode: string
  ) => {
    setLoading(true);
    console.log('Starting joinCouple process...');
    try {
      await authService.joinCouple(email, password, name, inviteCode);
      console.log('JoinCouple successful');
    } catch (error) {
      setLoading(false);
      console.error('Join couple error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    console.log('Starting signOut process...');
    try {
      await authService.signOut();
      console.log('SignOut successful');
    } catch (error) {
      setLoading(false);
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const value = {
    user,
    userProfile,
    couple,
    loading,
    signIn,
    signUpCouple,
    joinCouple,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};