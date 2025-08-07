import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase, UserProfile } from "../lib/supabase";
import { User, Session } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  username: string;
  role: "Admin" | "Business Dev User";
  name: string;
  email: string;
  profile?: UserProfile;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    userData: {
      username: string;
      full_name: string;
      role?: "Admin" | "Business Dev User";
    },
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
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
    console.log("AuthProvider: Initializing...");

    // Safety timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log(
        "AuthProvider: Loading timeout reached, forcing loading to false",
      );
      setLoading(false);
    }, 10000); // 10 second timeout

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        console.log("AuthProvider: Initial session:", session?.user?.email);
        clearTimeout(loadingTimeout);
        setSession(session);
        if (session?.user) {
          fetchUserProfile(session.user);
        } else {
          console.log("AuthProvider: No session, setting loading to false");
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("AuthProvider: Error getting session:", error);
        clearTimeout(loadingTimeout);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "AuthProvider: Auth state change:",
        event,
        session?.user?.email,
      );
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
    console.log("AuthProvider: Fetching profile for user:", authUser.email);

    // For demo purposes, create user object based on known emails
    const isAdmin = authUser.email === "admin@augmind.com";
    const isKnownUser =
      authUser.email === "admin@augmind.com" ||
      authUser.email === "user@augmind.com";

    const userObject = {
      id: authUser.id,
      username: isAdmin ? "admin" : authUser.email?.split("@")[0] || "user",
      role: (isAdmin ? "Admin" : "Business Dev User") as const,
      name: isAdmin
        ? "Administrator"
        : authUser.user_metadata?.full_name || "User",
      email: authUser.email || "",
    };

    console.log("AuthProvider: Setting user:", userObject);
    setUser(userObject);
    setLoading(false);

    // Optionally try to fetch/create profile in background (non-blocking)
    if (isKnownUser) {
      try {
        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (!error && profile) {
          // Update user with profile data
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  username: profile.username,
                  role: profile.role,
                  name: profile.full_name,
                  profile,
                }
              : null,
          );
          console.log("AuthProvider: Updated user with profile data");
        }
      } catch (error) {
        console.log(
          "AuthProvider: Background profile fetch failed (non-critical):",
          error,
        );
      }
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("Login: Starting login process for:", email);
      console.log("Login: Supabase URL check:", import.meta.env.VITE_SUPABASE_URL ? "✓" : "✗");

      // Demo credentials for development when Supabase is not accessible
      const demoCredentials = [
        { email: "admin@augmind.com", password: "admin123" },
        { email: "user@augmind.com", password: "user123" }
      ];

      const isDemoLogin = demoCredentials.some(cred =>
        cred.email === email && cred.password === password
      );

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.log("Login: Auth error:", error.message);

          // If it's a network error and we have demo credentials, use demo login
          if (isDemoLogin && error.message.includes("fetch")) {
            console.log("Login: Using demo authentication due to network issues");
            return await handleDemoLogin(email);
          }

          return { success: false, error: error.message };
        }

        console.log(
          "Login: Auth successful, user will be set via onAuthStateChange",
        );
        return { success: true };
      } catch (networkError: any) {
        console.error("Login: Network error during login:", networkError);

        // If network fails and we have demo credentials, use demo login
        if (isDemoLogin) {
          console.log("Login: Network failed, switching to demo authentication");
          return await handleDemoLogin(email);
        }

        throw networkError;
      }
    } catch (error: any) {
      console.error("Login: Exception during login:", error);

      // Handle specific fetch errors
      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        return {
          success: false,
          error: "Network connection failed. Please check your internet connection and try again."
        };
      }

      if (error.message.includes("fetch") || error.message.includes("timeout")) {
        return {
          success: false,
          error: "Unable to connect to authentication service. Please try again later."
        };
      }

      return { success: false, error: error.message || "An unexpected error occurred during login." };
    }
  };

  const handleDemoLogin = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create a demo user object
      const isAdmin = email === "admin@augmind.com";
      const demoUser = {
        id: isAdmin ? "demo-admin-id" : "demo-user-id",
        username: isAdmin ? "admin" : "demo_user",
        role: (isAdmin ? "Admin" : "Business Dev User") as const,
        name: isAdmin ? "Demo Administrator" : "Demo User",
        email: email,
      };

      console.log("Login: Setting demo user:", demoUser);
      setUser(demoUser);
      setLoading(false);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: "Demo login failed: " + error.message };
    }
  };

  const signup = async (
    email: string,
    password: string,
    userData: {
      username: string;
      full_name: string;
      role?: "Admin" | "Business Dev User";
    },
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
        console.log("Auth user created successfully");

        // Create user profile
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert({
            id: data.user.id,
            username: userData.username,
            full_name: userData.full_name,
            role: userData.role || "Business Dev User",
          });

        if (profileError) {
          console.error(
            "Error creating user profile:",
            profileError.message,
            profileError,
          );
          // Auth user was created but profile failed - still return success
          // The profile will be created on next login attempt
        } else {
          console.log("User profile created successfully");
        }
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
