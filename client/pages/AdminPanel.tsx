import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  UserPlus,
  Key,
  Gauge,
  Save,
  Trash2,
  Edit,
  Users,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase, UserProfile } from "../lib/supabase";
import { DataStatusIndicator } from "../components/DataStatusIndicator";

interface SystemSettings {
  default_user_tokens: number;
  default_user_words: number;
  max_tokens_per_request: number;
  max_words_per_response: number;
  daily_request_limit: number;
  openai_api_key: string;
  serper_api_key: string;
  anthropic_api_key: string;
}

interface APIKeyDisplay {
  id: string;
  name: string;
  service: string;
  key: string;
  status: "Active" | "Inactive";
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  // User Management State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    username: "",
    full_name: "",
    role: "Business Dev User" as "Admin" | "Business Dev User",
    token_limit: 5000,
    word_limit: 1000,
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    default_user_tokens: 5000,
    default_user_words: 1000,
    max_tokens_per_request: 2000,
    max_words_per_response: 500,
    daily_request_limit: 100,
    openai_api_key: "",
    serper_api_key: "",
    anthropic_api_key: "",
  });

  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  // Test database connectivity
  const testDatabaseConnection = async () => {
    try {
      console.log("Testing database connection...");

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection test timeout")), 3000),
      );

      const queryPromise = supabase
        .from("user_profiles")
        .select("count", { count: "exact", head: true });

      const { data, error } = (await Promise.race([
        queryPromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        const errorMsg =
          error?.message || error?.toString() || "Unknown database error";
        console.error("Database connection test failed:", errorMsg);
        return false;
      } else {
        console.log("Database connection successful, user count:", data);
        return true;
      }
    } catch (error: any) {
      const errorMsg =
        error?.message || error?.toString() || "Unknown connection error";
      console.error("Database connection test error:", errorMsg);
      return false;
    }
  };

  useEffect(() => {
    if (user?.role === "Admin") {
      const initializeAdminPanel = async () => {
        console.log("Initializing admin panel for user:", user?.email);

        // If user is already in demo mode (has demo in ID), skip connection test
        if (user?.id?.includes("demo")) {
          console.log("User is in demo mode, loading demo data directly");
          setMessage("Demo mode: Using demo data");
          setMessageType("success");
          loadDemoUsers();
          loadDemoSystemSettings();
          return;
        }

        // Test database connection for real users
        console.log("Testing database connection...");
        const isConnected = await testDatabaseConnection();

        if (isConnected) {
          console.log("Database connected, loading real data");
          setMessage("Connected to database successfully");
          setMessageType("success");
          loadUsers();
          loadSystemSettings();
        } else {
          console.log("Database not connected, switching to demo mode");
          setMessage("Demo mode: Database not accessible, using demo data");
          setMessageType("success");
          loadDemoUsers();
          loadDemoSystemSettings();
        }
      };

      initializeAdminPanel().catch((error) => {
        console.error("Failed to initialize admin panel:", error);
        setMessage("Demo mode: Initialization failed, using demo data");
        setMessageType("success");
        loadDemoUsers();
        loadDemoSystemSettings();
      });
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      console.log("Loading users...");
      setLoading(true);

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 5000),
      );

      const queryPromise = supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = (await Promise.race([
        queryPromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        const errorMsg =
          error?.message || error?.toString() || "Unknown error loading users";
        console.error("Error loading users:", errorMsg);
        setMessage("Error loading users: " + errorMsg);
        setMessageType("error");
        return;
      } else {
        console.log("Users loaded:", data);
        setUsers(data || []);
        if (data && data.length > 0) {
          setMessage(`Loaded ${data.length} users successfully`);
          setMessageType("success");
        } else {
          setMessage("No users found in database");
          setMessageType("success");
        }
      }
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || "Network error";
      console.error("Error in loadUsers:", errorMsg);
      console.log("Network error, switching to demo data for users");
      loadDemoUsers();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoUsers = () => {
    const demoUsers: UserProfile[] = [
      {
        id: "demo-admin-id",
        username: "admin",
        full_name: "Demo Administrator",
        role: "Admin",
        token_limit: 10000,
        word_limit: 2000,
        tokens_used: 1250,
        words_used: 430,
        daily_requests: 15,
        last_request_date: new Date().toISOString(),
        status: "Active",
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "demo-user-id",
        username: "demo_user",
        full_name: "Demo User",
        role: "Business Dev User",
        token_limit: 5000,
        word_limit: 1000,
        tokens_used: 680,
        words_used: 245,
        daily_requests: 8,
        last_request_date: new Date().toISOString(),
        status: "Active",
        created_at: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "demo-user-2",
        username: "john_smith",
        full_name: "John Smith",
        role: "Business Dev User",
        token_limit: 5000,
        word_limit: 1000,
        tokens_used: 320,
        words_used: 150,
        daily_requests: 4,
        last_request_date: new Date(
          Date.now() - 2 * 60 * 60 * 1000,
        ).toISOString(),
        status: "Active",
        created_at: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    setUsers(demoUsers);
    setMessage(`Demo mode: Loaded ${demoUsers.length} demo users`);
    setMessageType("success");
    console.log("Demo users loaded:", demoUsers);
  };

  const loadSystemSettings = async () => {
    try {
      console.log("Loading system settings...");
      setLoading(true);

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Settings request timeout")), 5000),
      );

      const queryPromise = supabase
        .from("system_settings")
        .select("setting_key, setting_value");

      const { data, error } = (await Promise.race([
        queryPromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        const errorMsg =
          error?.message ||
          error?.toString() ||
          "Unknown error loading settings";
        console.error("Error loading system settings:", errorMsg);
        console.log("Switching to demo data for system settings");
        loadDemoSystemSettings();
        return;
      } else {
        console.log("System settings loaded:", data);
        const settings: any = {};
        data?.forEach((item) => {
          let value = item.setting_value;
          // Parse JSON values, handle numbers
          if (typeof value === "string") {
            try {
              value = JSON.parse(value);
            } catch (e) {
              // Keep as string if not JSON
            }
          }
          settings[item.setting_key] = value;
        });
        console.log("Parsed settings:", settings);
        setSystemSettings((prev) => ({ ...prev, ...settings }));

        if (data && data.length > 0) {
          setMessage(`Loaded ${data.length} system settings`);
          setMessageType("success");
        } else {
          setMessage("No system settings found - using defaults");
          setMessageType("success");
        }
      }
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || "Network error";
      console.error("Error in loadSystemSettings:", errorMsg);
      console.log("Network error, switching to demo data for system settings");
      loadDemoSystemSettings();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoSystemSettings = () => {
    const demoSettings: SystemSettings = {
      default_user_tokens: 5000,
      default_user_words: 1000,
      max_tokens_per_request: 2000,
      max_words_per_response: 500,
      daily_request_limit: 100,
      openai_api_key: "sk-demo-key-*********************",
      serper_api_key: "demo-serper-key-**************",
      anthropic_api_key: "demo-anthropic-key-***********",
    };

    setSystemSettings(demoSettings);
    setMessage("Demo mode: Loaded demo system settings");
    setMessageType("success");
    console.log("Demo system settings loaded:", demoSettings);
  };

  const handleCreateUser = async () => {
    if (
      !newUser.email ||
      !newUser.password ||
      !newUser.username ||
      !newUser.full_name
    ) {
      setMessage("Please fill in all required fields");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // Check if we're in demo mode (if current user has demo ID)
      if (user?.id?.includes("demo")) {
        console.log("Demo mode: Simulating user creation");

        // Create a new demo user
        const newDemoUser: UserProfile = {
          id: `demo-user-${Date.now()}`,
          username: newUser.username,
          full_name: newUser.full_name,
          role: newUser.role,
          token_limit: newUser.token_limit,
          word_limit: newUser.word_limit,
          tokens_used: 0,
          words_used: 0,
          daily_requests: 0,
          last_request_date: new Date().toISOString(),
          status: "Active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Add to existing users
        setUsers((prev) => [newDemoUser, ...prev]);
        setMessage("Demo mode: User created successfully!");
        setMessageType("success");

        // Reset form
        setNewUser({
          email: "",
          password: "",
          username: "",
          full_name: "",
          role: "Business Dev User",
          token_limit: 5000,
          word_limit: 1000,
        });

        return;
      }

      // Real database mode
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            username: newUser.username,
            full_name: newUser.full_name,
          },
        },
      });

      if (authError) {
        setMessage("Error creating user: " + authError.message);
        setMessageType("error");
        return;
      }

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert({
            id: authData.user.id,
            username: newUser.username,
            full_name: newUser.full_name,
            role: newUser.role,
            token_limit: newUser.token_limit,
            word_limit: newUser.word_limit,
          });

        if (profileError) {
          console.error("Error creating user profile:", profileError);
          setMessage(
            "User created but profile failed: " + profileError.message,
          );
          setMessageType("error");
        } else {
          setMessage("User created successfully!");
          setMessageType("success");

          // Reset form
          setNewUser({
            email: "",
            password: "",
            username: "",
            full_name: "",
            role: "Business Dev User",
            token_limit: 5000,
            word_limit: 1000,
          });

          // Reload users
          await loadUsers();
        }
      }
    } catch (error: any) {
      console.error("Error in handleCreateUser:", error);
      setMessage("Error creating user: " + error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      // Delete user profile (this will cascade to related data due to foreign keys)
      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .eq("id", userId);

      if (error) {
        console.error("Error deleting user:", error);
        setMessage("Error deleting user: " + error.message);
        setMessageType("error");
      } else {
        setMessage("User deleted successfully");
        setMessageType("success");
        await loadUsers();
      }
    } catch (error: any) {
      console.error("Error in handleDeleteUser:", error);
      setMessage("Error deleting user: " + error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSystemSettings = async () => {
    try {
      setLoading(true);
      setMessage("");
      console.log("Updating system settings...");

      // Check if we're in demo mode
      if (user?.id?.includes("demo")) {
        console.log("Demo mode: Simulating system settings update");

        // Simulate a brief delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setMessage(
          "Demo mode: System settings updated successfully! (changes are simulated)",
        );
        setMessageType("success");
        return;
      }

      // Real database mode
      // Update each setting using upsert
      const updates = [
        {
          key: "default_user_tokens",
          value: systemSettings.default_user_tokens,
        },
        { key: "default_user_words", value: systemSettings.default_user_words },
        {
          key: "max_tokens_per_request",
          value: systemSettings.max_tokens_per_request,
        },
        {
          key: "max_words_per_response",
          value: systemSettings.max_words_per_response,
        },
        {
          key: "daily_request_limit",
          value: systemSettings.daily_request_limit,
        },
        { key: "openai_api_key", value: systemSettings.openai_api_key },
        { key: "serper_api_key", value: systemSettings.serper_api_key },
        { key: "anthropic_api_key", value: systemSettings.anthropic_api_key },
      ];

      let successCount = 0;
      for (const update of updates) {
        console.log(`Updating ${update.key} with value:`, update.value);

        try {
          // Add timeout to each upsert operation
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error(`Timeout updating ${update.key}`)),
              8000,
            ),
          );

          const upsertPromise = supabase.from("system_settings").upsert(
            {
              setting_key: update.key,
              setting_value: JSON.stringify(update.value),
              description: `System setting for ${update.key}`,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "setting_key",
            },
          );

          const { error } = (await Promise.race([
            upsertPromise,
            timeoutPromise,
          ])) as any;

          if (error) {
            console.error(`Error updating ${update.key}:`, error);
            throw error;
          } else {
            console.log(`Successfully updated ${update.key}`);
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to update ${update.key}:`, error);
          throw error;
        }
      }

      console.log(`All ${successCount} settings updated successfully`);
      setMessage(`Successfully updated ${successCount} system settings!`);
      setMessageType("success");

      // Reload settings to confirm they were saved
      setTimeout(() => loadSystemSettings(), 1000);
    } catch (error: any) {
      console.error("Error updating system settings:", error);
      setMessage("Error updating settings: " + error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyVisibility = (keyName: string) => {
    setShowKeys((prev) => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const formatAPIKey = (key: string, keyName: string): string => {
    if (!key) return "Not set";
    if (showKeys[keyName]) return key;
    return key.substring(0, 8) + "***************************";
  };

  if (user?.role !== "Admin") {
    return (
      <div className="p-6 flex items-center justify-center min-h-full">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">
            Manage users, API keys, and system settings
          </p>
          <div className="mt-2">
            <DataStatusIndicator />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            setLoading(true);
            try {
              await Promise.all([loadUsers(), loadSystemSettings()]);
              setMessage("Data refreshed successfully");
              setMessageType("success");
            } catch (error: any) {
              setMessage("Error refreshing data: " + error.message);
              setMessageType("error");
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {message && (
        <Alert
          variant={messageType === "error" ? "destructive" : "default"}
          className={
            messageType === "success" ? "border-green-200 bg-green-50" : ""
          }
        >
          <AlertDescription
            className={messageType === "success" ? "text-green-800" : ""}
          >
            {message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span>API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="limits" className="flex items-center space-x-2">
            <Gauge className="h-4 w-4" />
            <span>System Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create New User */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Create New User</span>
                </CardTitle>
                <CardDescription>Add a new user to the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="user@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      placeholder="Min 6 characters"
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser({ ...newUser, username: e.target.value })
                      }
                      placeholder="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={newUser.full_name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, full_name: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: "Admin" | "Business Dev User") =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Business Dev User">
                        Business Dev User
                      </SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tokenLimit">Token Limit</Label>
                    <Input
                      id="tokenLimit"
                      type="number"
                      value={newUser.token_limit}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          token_limit: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wordLimit">Word Limit</Label>
                    <Input
                      id="wordLimit"
                      type="number"
                      value={newUser.word_limit}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          word_limit: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreateUser}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating User...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Current Users */}
            <Card>
              <CardHeader>
                <CardTitle>Current Users ({users.length})</CardTitle>
                <CardDescription>
                  Manage existing users and their limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {users.map((userProfile) => (
                    <div
                      key={userProfile.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium">
                            {userProfile.full_name}
                          </h3>
                          <Badge
                            variant={
                              userProfile.role === "Admin"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {userProfile.role}
                          </Badge>
                          <Badge
                            variant={
                              userProfile.status === "Active"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {userProfile.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          @{userProfile.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          Tokens: {userProfile.tokens_used}/
                          {userProfile.token_limit} | Words:{" "}
                          {userProfile.words_used}/{userProfile.word_limit} |
                          Daily: {userProfile.daily_requests}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(userProfile.id)}
                          disabled={userProfile.username === "admin" || loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {users.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No users found
                      </h3>
                      <p className="text-gray-600">
                        Create your first user to get started
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>API Key Management</span>
              </CardTitle>
              <CardDescription>
                Configure API keys for external services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openai_key">OpenAI API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="openai_key"
                        type={showKeys.openai ? "text" : "password"}
                        value={systemSettings.openai_api_key}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            openai_api_key: e.target.value,
                          })
                        }
                        placeholder="sk-..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleKeyVisibility("openai")}
                      >
                        {showKeys.openai ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serper_key">Serper AI API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="serper_key"
                        type={showKeys.serper ? "text" : "password"}
                        value={systemSettings.serper_api_key}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            serper_api_key: e.target.value,
                          })
                        }
                        placeholder="Enter Serper API key"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleKeyVisibility("serper")}
                      >
                        {showKeys.serper ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anthropic_key">Anthropic API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="anthropic_key"
                        type={showKeys.anthropic ? "text" : "password"}
                        value={systemSettings.anthropic_api_key}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            anthropic_api_key: e.target.value,
                          })
                        }
                        placeholder="Enter Anthropic API key"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleKeyVisibility("anthropic")}
                      >
                        {showKeys.anthropic ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">API Key Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>OpenAI:</span>
                      <Badge
                        variant={
                          systemSettings.openai_api_key
                            ? "default"
                            : "destructive"
                        }
                      >
                        {systemSettings.openai_api_key
                          ? "Configured"
                          : "Not Set"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Serper AI:</span>
                      <Badge
                        variant={
                          systemSettings.serper_api_key
                            ? "default"
                            : "destructive"
                        }
                      >
                        {systemSettings.serper_api_key
                          ? "Configured"
                          : "Not Set"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Anthropic:</span>
                      <Badge
                        variant={
                          systemSettings.anthropic_api_key
                            ? "default"
                            : "destructive"
                        }
                      >
                        {systemSettings.anthropic_api_key
                          ? "Configured"
                          : "Not Set"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleUpdateSystemSettings} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save API Keys
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="limits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gauge className="h-5 w-5" />
                <span>System Limits & Defaults</span>
              </CardTitle>
              <CardDescription>
                Configure default limits and system-wide restrictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Default User Limits</h3>
                  <div className="space-y-2">
                    <Label htmlFor="defaultTokens">Default Token Limit</Label>
                    <Input
                      id="defaultTokens"
                      type="number"
                      value={systemSettings.default_user_tokens}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          default_user_tokens: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultWords">Default Word Limit</Label>
                    <Input
                      id="defaultWords"
                      type="number"
                      value={systemSettings.default_user_words}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          default_user_words: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Request Limits</h3>
                  <div className="space-y-2">
                    <Label htmlFor="maxTokensRequest">
                      Max Tokens per Request
                    </Label>
                    <Input
                      id="maxTokensRequest"
                      type="number"
                      value={systemSettings.max_tokens_per_request}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          max_tokens_per_request: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxWordsResponse">
                      Max Words per Response
                    </Label>
                    <Input
                      id="maxWordsResponse"
                      type="number"
                      value={systemSettings.max_words_per_response}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          max_words_per_response: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyLimit">Daily Request Limit</Label>
                    <Input
                      id="dailyLimit"
                      type="number"
                      value={systemSettings.daily_request_limit}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          daily_request_limit: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <Button
                onClick={handleUpdateSystemSettings}
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving Settings...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save System Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
