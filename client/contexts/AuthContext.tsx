import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface User {
  username: string;
  role: "Admin" | "Business Dev User";
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem("augmind-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    // Mock authentication - in real app this would be an API call
    const mockUsers: { [key: string]: { password: string; user: User } } = {
      admin: {
        password: "admin123",
        user: { username: "admin", role: "Admin", name: "Administrator" },
      },
      user1: {
        password: "user123",
        user: {
          username: "user1",
          role: "Business Dev User",
          name: "John Smith",
        },
      },
    };

    const userRecord = mockUsers[username];
    if (userRecord && userRecord.password === password) {
      setUser(userRecord.user);
      localStorage.setItem("augmind-user", JSON.stringify(userRecord.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("augmind-user");
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
