import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { firebaseService, onAuthStateChange, User, Couple } from '../lib/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize default activities
    firebaseService.initializeDefaultActivities().catch(console.error);

    // Listen to auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await loadUserProfile(firebaseUser.uid);
      } else {
        setUserProfile(null);
        setCouple(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await firebaseService.getUserProfile(userId);
      setUserProfile(profile);

      if (profile.couple_id) {
        const coupleInfo = await firebaseService.getCoupleInfo(userId);
        setCouple(coupleInfo.couple);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await firebaseService.signIn(email, password);
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
    try {
      const result = await firebaseService.signUpCouple(
        email1,
        password1,
        name1,
        email2,
        password2,
        name2,
        coupleName
      );
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
    try {
      await firebaseService.joinCouple(email, password, name, inviteCode);
    } catch (error) {
      setLoading(false);
      console.error('Join couple error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseService.signOut();
    } catch (error) {
      setLoading(false);
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.uid);
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