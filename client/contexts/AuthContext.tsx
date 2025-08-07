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
        console.log(
          "AuthProvider: Continuing with no session due to network issues",
        );
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

    try {
      // Fetch user profile from database
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("AuthProvider: Error fetching profile:", error);

        // If profile doesn't exist, create a basic user object from auth metadata
        const userObject = {
          id: authUser.id,
          username: authUser.email?.split("@")[0] || "user",
          role: "Business Dev User" as const,
          name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
          email: authUser.email || "",
        };

        console.log("AuthProvider: Profile not found, using auth metadata:", userObject);
        setUser(userObject);
        setLoading(false);
        return;
      }

      if (profile) {
        // Create user object from database profile
        const userObject = {
          id: profile.id,
          username: profile.username,
          role: profile.role,
          name: profile.full_name,
          email: authUser.email || "",
          profile,
        };

        console.log("AuthProvider: Setting user from database profile:", userObject);
        setUser(userObject);
        setLoading(false);
      }
    } catch (error) {
      console.error("AuthProvider: Exception fetching profile:", error);

      // Fallback to basic user object from auth
      const userObject = {
        id: authUser.id,
        username: authUser.email?.split("@")[0] || "user",
        role: "Business Dev User" as const,
        name: authUser.user_metadata?.full_name || "User",
        email: authUser.email || "",
      };

      console.log("AuthProvider: Using fallback user object:", userObject);
      setUser(userObject);
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    console.log("Login: Starting login process for:", email);
    console.log(
      "Login: Supabase URL check:",
      import.meta.env.VITE_SUPABASE_URL ? "✓" : "✗",
    );

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log("Login: Auth error:", error.message);
        return { success: false, error: error.message };
      }

      console.log(
        "Login: Auth successful, user will be set via onAuthStateChange",
      );
      return { success: true };
    } catch (error: any) {
      console.error("Login: Exception during login:", error);

      // Handle specific fetch errors
      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        return {
          success: false,
          error:
            "Unable to connect to the authentication service. Please check your internet connection and verify the database configuration.",
        };
      }

      if (
        error.message.includes("fetch") ||
        error.message.includes("timeout") ||
        error.message.includes("connection")
      ) {
        return {
          success: false,
          error:
            "Authentication service unavailable. Please verify your database configuration or try again later.",
        };
      }

      return {
        success: false,
        error: error.message || "An unexpected error occurred during login.",
      };
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
      console.log("Signup: Starting signup process for:", email);

      // Add timeout for signup requests
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Signup request timeout")), 10000),
      );

      const signupPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData.username,
            full_name: userData.full_name,
          },
        },
      });

      const { data, error: authError } = (await Promise.race([
        signupPromise,
        timeoutPromise,
      ])) as any;

      if (authError) {
        console.error("Signup: Auth error:", authError.message);
        return { success: false, error: authError.message };
      }

      if (data.user) {
        console.log("Auth user created successfully");

        try {
          // Create user profile with timeout
          const profileTimeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Profile creation timeout")),
              8000,
            ),
          );

          const profilePromise = supabase.from("user_profiles").insert({
            id: data.user.id,
            username: userData.username,
            full_name: userData.full_name,
            role: userData.role || "Business Dev User",
          });

          const { error: profileError } = (await Promise.race([
            profilePromise,
            profileTimeoutPromise,
          ])) as any;

          if (profileError) {
            console.error("Error creating user profile:", profileError.message);
            // Auth user was created but profile failed - still return success
            // The profile will be created on next login attempt
            return {
              success: true,
              error:
                "Account created successfully, but profile setup incomplete. You can still log in.",
            };
          } else {
            console.log("User profile created successfully");
          }
        } catch (profileError: any) {
          console.error("Profile creation failed:", profileError.message);
          // Auth user was created but profile failed - still return success
          return {
            success: true,
            error:
              "Account created successfully, but profile setup incomplete. You can still log in.",
          };
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error("Signup: Exception during signup:", error);

      // Handle specific fetch errors
      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        return {
          success: false,
          error:
            "Network connection failed. Please check your internet connection and try again.",
        };
      }

      if (
        error.message.includes("fetch") ||
        error.message.includes("timeout") ||
        error.message.includes("connection")
      ) {
        return {
          success: false,
          error:
            "Unable to connect to authentication service. Please try again later.",
        };
      }

      return {
        success: false,
        error: error.message || "An unexpected error occurred during signup.",
      };
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
