import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthStatus } from '../lib/types';
import { AuthService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    // Get initial user
    AuthService.getCurrentUser().then((user) => {
      setUser(user);
      setStatus(user ? 'authenticated' : 'unauthenticated');
    });

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setUser(user);
      setStatus(user ? 'authenticated' : 'unauthenticated');
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setStatus('loading');
    try {
      await AuthService.signIn(email, password);
    } catch (error) {
      setStatus('unauthenticated');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setStatus('loading');
    try {
      await AuthService.signUp(email, password, fullName);
    } catch (error) {
      setStatus('unauthenticated');
      throw error;
    }
  };

  const signOut = async () => {
    setStatus('loading');
    try {
      await AuthService.signOut();
    } catch (error) {
      setStatus('authenticated');
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      await AuthService.updateProfile(updates);
      if (user) {
        setUser({ ...user, ...updates });
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      status,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
