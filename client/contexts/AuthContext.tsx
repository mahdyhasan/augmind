import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, UserProfile } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  username: string;
  role: 'Admin' | 'Business Dev User';
  name: string;
  email: string;
  profile?: UserProfile;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, userData: { username: string; full_name: string; role?: 'Admin' | 'Business Dev User' }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing...');

    // Safety timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('AuthProvider: Loading timeout reached, forcing loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthProvider: Initial session:', session?.user?.email);
      clearTimeout(loadingTimeout);
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        console.log('AuthProvider: No session, setting loading to false');
        setLoading(false);
      }
    }).catch(error => {
      console.error('AuthProvider: Error getting session:', error);
      clearTimeout(loadingTimeout);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Auth state change:', event, session?.user?.email);
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    console.log('AuthProvider: Fetching profile for user:', authUser.email);

    // For now, just create a basic user object based on email
    // This bypasses any database issues during development
    const isAdmin = authUser.email?.includes('admin');

    const basicUser = {
      id: authUser.id,
      username: authUser.email?.split('@')[0] || 'user',
      role: (isAdmin ? 'Admin' : 'Business Dev User') as const,
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
    };

    console.log('Setting basic user:', basicUser);
    setUser(basicUser);
    setLoading(false);

    // TODO: Re-enable profile fetching once database connection is stable
    /*
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error.message, error);
        // Handle profile creation logic here
      } else {
        // Update user with profile data
        setUser(prev => prev ? { ...prev, profile } : null);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
    */
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    userData: { username: string; full_name: string; role?: 'Admin' | 'Business Dev User' }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create auth user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData.username,
            full_name: userData.full_name,
          },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (data.user) {
        console.log('Auth user created successfully');
        // TODO: Re-enable profile creation once database connection is stable
        /*
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            username: userData.username,
            full_name: userData.full_name,
            role: userData.role || 'Business Dev User',
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError.message, profileError);
        } else {
          console.log('User profile created successfully');
        }
        */
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
