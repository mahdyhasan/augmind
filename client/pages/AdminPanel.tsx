import React, { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface User {
  id: string;
  username: string;
  name: string;
  role: "Admin" | "Business Dev User";
  tokenLimit: number;
  wordLimit: number;
  status: "Active" | "Inactive";
  createdAt: Date;
}

interface APIKey {
  id: string;
  name: string;
  service: string;
  key: string;
  status: "Active" | "Inactive";
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");

  // User Management State
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      username: "admin",
      name: "Administrator",
      role: "Admin",
      tokenLimit: 10000,
      wordLimit: 2000,
      status: "Active",
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "2",
      username: "user1",
      name: "John Smith",
      role: "Business Dev User",
      tokenLimit: 5000,
      wordLimit: 1000,
      status: "Active",
      createdAt: new Date("2024-01-15"),
    },
  ]);

  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    password: "",
    role: "Business Dev User" as "Admin" | "Business Dev User",
    tokenLimit: 5000,
    wordLimit: 1000,
  });

  // API Keys State
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: "1",
      name: "OpenAI GPT-4",
      service: "OpenAI",
      key: "sk-***************************",
      status: "Active",
    },
    {
      id: "2",
      name: "Serper Search API",
      service: "Serper",
      key: "***************************",
      status: "Active",
    },
  ]);

  const [newApiKey, setNewApiKey] = useState({
    name: "",
    service: "",
    key: "",
  });

  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  // System Limits State
  const [systemLimits, setSystemLimits] = useState({
    defaultUserTokens: 5000,
    defaultUserWords: 1000,
    maxTokensPerRequest: 2000,
    maxWordsPerResponse: 500,
    dailyRequestLimit: 100,
  });

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.name || !newUser.password) return;

    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
      tokenLimit: newUser.tokenLimit,
      wordLimit: newUser.wordLimit,
      status: "Active",
      createdAt: new Date(),
    };

    setUsers([...users, user]);
    setNewUser({
      username: "",
      name: "",
      password: "",
      role: "Business Dev User",
      tokenLimit: 5000,
      wordLimit: 1000,
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  const handleCreateApiKey = () => {
    if (!newApiKey.name || !newApiKey.service || !newApiKey.key) return;

    const apiKey: APIKey = {
      id: Date.now().toString(),
      name: newApiKey.name,
      service: newApiKey.service,
      key: newApiKey.key,
      status: "Active",
    };

    setApiKeys([...apiKeys, apiKey]);
    setNewApiKey({ name: "", service: "", key: "" });
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== keyId));
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600">
          Manage users, API keys, and system settings
        </p>
      </div>

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
            <span>System Limits</span>
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
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser({ ...newUser, username: e.target.value })
                      }
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    placeholder="Enter password"
                  />
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
                      value={newUser.tokenLimit}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          tokenLimit: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wordLimit">Word Limit</Label>
                    <Input
                      id="wordLimit"
                      type="number"
                      value={newUser.wordLimit}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          wordLimit: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleCreateUser} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </CardContent>
            </Card>

            {/* Current Users */}
            <Card>
              <CardHeader>
                <CardTitle>Current Users</CardTitle>
                <CardDescription>
                  Manage existing users and their limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium">{user.name}</h3>
                          <Badge
                            variant={
                              user.role === "Admin" ? "default" : "secondary"
                            }
                          >
                            {user.role}
                          </Badge>
                          <Badge
                            variant={
                              user.status === "Active"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {user.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          @{user.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          Tokens: {user.tokenLimit} | Words: {user.wordLimit}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.username === "admin"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add API Key */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Add API Key</span>
                </CardTitle>
                <CardDescription>
                  Configure API keys for external services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiName">API Name</Label>
                  <Input
                    id="apiName"
                    value={newApiKey.name}
                    onChange={(e) =>
                      setNewApiKey({ ...newApiKey, name: e.target.value })
                    }
                    placeholder="e.g., OpenAI GPT-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <Select
                    value={newApiKey.service}
                    onValueChange={(value) =>
                      setNewApiKey({ ...newApiKey, service: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OpenAI">OpenAI</SelectItem>
                      <SelectItem value="Serper">Serper AI</SelectItem>
                      <SelectItem value="Anthropic">Anthropic</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Textarea
                    id="apiKey"
                    value={newApiKey.key}
                    onChange={(e) =>
                      setNewApiKey({ ...newApiKey, key: e.target.value })
                    }
                    placeholder="Enter your API key"
                    rows={3}
                  />
                </div>

                <Button onClick={handleCreateApiKey} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save API Key
                </Button>
              </CardContent>
            </Card>

            {/* Current API Keys */}
            <Card>
              <CardHeader>
                <CardTitle>Current API Keys</CardTitle>
                <CardDescription>
                  Manage your configured API keys
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{key.name}</h3>
                          <Badge>{key.service}</Badge>
                          <Badge
                            variant={
                              key.status === "Active"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {key.status}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleKeyVisibility(key.id)}
                          >
                            {showKeys[key.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteApiKey(key.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 font-mono">
                        {showKeys[key.id] ? key.key : key.key}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Limits Tab */}
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
                      value={systemLimits.defaultUserTokens}
                      onChange={(e) =>
                        setSystemLimits({
                          ...systemLimits,
                          defaultUserTokens: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultWords">Default Word Limit</Label>
                    <Input
                      id="defaultWords"
                      type="number"
                      value={systemLimits.defaultUserWords}
                      onChange={(e) =>
                        setSystemLimits({
                          ...systemLimits,
                          defaultUserWords: parseInt(e.target.value),
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
                      value={systemLimits.maxTokensPerRequest}
                      onChange={(e) =>
                        setSystemLimits({
                          ...systemLimits,
                          maxTokensPerRequest: parseInt(e.target.value),
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
                      value={systemLimits.maxWordsPerResponse}
                      onChange={(e) =>
                        setSystemLimits({
                          ...systemLimits,
                          maxWordsPerResponse: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyLimit">Daily Request Limit</Label>
                    <Input
                      id="dailyLimit"
                      type="number"
                      value={systemLimits.dailyRequestLimit}
                      onChange={(e) =>
                        setSystemLimits({
                          ...systemLimits,
                          dailyRequestLimit: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <Button className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
