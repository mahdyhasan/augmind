import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { 
  Settings as SettingsIcon, 
  Key, 
  BarChart3, 
  Save, 
  User, 
  Shield,
  Zap,
  MessageSquare,
  Upload,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UsageStats {
  totalTokens: number;
  totalWords: number;
  totalRequests: number;
  conversationsCount: number;
  documentsCount: number;
  prospectsCount: number;
  dailyUsage: Array<{
    date: string;
    requests: number;
    tokens: number;
  }>;
}

interface UserLimits {
  tokenLimit: number;
  wordLimit: number;
  tokensUsed: number;
  wordsUsed: number;
  dailyRequests: number;
  lastRequestDate: string;
}

export default function Settings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Usage stats state
  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalTokens: 0,
    totalWords: 0,
    totalRequests: 0,
    conversationsCount: 0,
    documentsCount: 0,
    prospectsCount: 0,
    dailyUsage: []
  });

  // User limits state
  const [userLimits, setUserLimits] = useState<UserLimits>({
    tokenLimit: 0,
    wordLimit: 0,
    tokensUsed: 0,
    wordsUsed: 0,
    dailyRequests: 0,
    lastRequestDate: ''
  });

  useEffect(() => {
    if (user) {
      loadUsageStats();
      loadUserLimits();
    }
  }, [user]);

  const loadUsageStats = async () => {
    if (!user) return;

    try {
      // Get total usage analytics
      const { data: analytics } = await supabase
        .from('usage_analytics')
        .select('tokens_consumed, words_generated, action_type')
        .eq('user_id', user.id);

      const totalTokens = analytics?.reduce((sum, item) => sum + (item.tokens_consumed || 0), 0) || 0;
      const totalWords = analytics?.reduce((sum, item) => sum + (item.words_generated || 0), 0) || 0;
      const totalRequests = analytics?.length || 0;

      // Get conversations count
      const { count: conversationsCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get documents count
      const documentsQuery = supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });
      
      if (user.role !== 'Admin') {
        documentsQuery.eq('uploaded_by', user.id);
      }
      const { count: documentsCount } = await documentsQuery;

      // Get prospects count
      const { count: prospectsCount } = await supabase
        .from('client_prospects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get daily usage for last 7 days
      const { data: dailySummary } = await supabase
        .from('daily_usage_summary')
        .select('date, total_requests, total_tokens')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(7);

      const dailyUsage = dailySummary?.map(day => ({
        date: day.date,
        requests: day.total_requests || 0,
        tokens: day.total_tokens || 0
      })) || [];

      setUsageStats({
        totalTokens,
        totalWords,
        totalRequests,
        conversationsCount: conversationsCount || 0,
        documentsCount: documentsCount || 0,
        prospectsCount: prospectsCount || 0,
        dailyUsage
      });

    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const loadUserLimits = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('token_limit, word_limit, tokens_used, words_used, daily_requests, last_request_date')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserLimits({
          tokenLimit: profile.token_limit || 0,
          wordLimit: profile.word_limit || 0,
          tokensUsed: profile.tokens_used || 0,
          wordsUsed: profile.words_used || 0,
          dailyRequests: profile.daily_requests || 0,
          lastRequestDate: profile.last_request_date || ''
        });
      }
    } catch (error) {
      console.error('Error loading user limits:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage('Please fill in all password fields');
      setMessageType('error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        setMessage('Error changing password: ' + error.message);
        setMessageType('error');
      } else {
        setMessage('Password changed successfully!');
        setMessageType('success');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      setMessage('Error changing password: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and view your usage statistics</p>
      </div>

      {message && (
        <Alert variant={messageType === 'error' ? 'destructive' : 'default'} className={messageType === 'success' ? 'border-green-200 bg-green-50' : ''}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={messageType === 'success' ? 'text-green-800' : ''}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Usage Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>Your account details and role information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={user?.name || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={user?.username || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user?.role === 'Admin' ? 'default' : 'secondary'}>
                      {user?.role}
                    </Badge>
                    {user?.role === 'Admin' && (
                      <span className="text-sm text-gray-600">Full system access</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Your Limits</span>
                </CardTitle>
                <CardDescription>Current usage against your allocated limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Token Usage</Label>
                    <span className="text-sm text-gray-600">
                      {userLimits.tokensUsed.toLocaleString()} / {userLimits.tokenLimit.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(userLimits.tokensUsed, userLimits.tokenLimit)} 
                    className="w-full"
                  />
                  <div className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(userLimits.tokensUsed, userLimits.tokenLimit))}`} 
                       style={{ width: `${getUsagePercentage(userLimits.tokensUsed, userLimits.tokenLimit)}%` }}>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Word Generation</Label>
                    <span className="text-sm text-gray-600">
                      {userLimits.wordsUsed.toLocaleString()} / {userLimits.wordLimit.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(userLimits.wordsUsed, userLimits.wordLimit)} 
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Daily Requests</Label>
                    <span className="text-sm text-gray-600">
                      {userLimits.dailyRequests}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Last activity: {userLimits.lastRequestDate ? formatDate(userLimits.lastRequestDate) : 'Never'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Statistics Tab */}
        <TabsContent value="usage" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tokens</p>
                    <p className="text-2xl font-bold text-gray-900">{usageStats.totalTokens.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversations</p>
                    <p className="text-2xl font-bold text-gray-900">{usageStats.conversationsCount}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Documents</p>
                    <p className="text-2xl font-bold text-gray-900">{usageStats.documentsCount}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Upload className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{usageStats.totalRequests}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Daily Usage (Last 7 Days)</span>
              </CardTitle>
              <CardDescription>Your daily activity and token consumption</CardDescription>
            </CardHeader>
            <CardContent>
              {usageStats.dailyUsage.length > 0 ? (
                <div className="space-y-4">
                  {usageStats.dailyUsage.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{formatDate(day.date)}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">{day.requests} requests</span>
                        <span className="text-gray-600">{day.tokens.toLocaleString()} tokens</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No usage data yet</h3>
                  <p className="text-gray-600">Start using Augmind to see your usage statistics here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Change Password</span>
                </CardTitle>
                <CardDescription>Update your account password for security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                </div>

                <Button onClick={handlePasswordChange} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Information</span>
                </CardTitle>
                <CardDescription>Your account security status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Email Verified</p>
                    <p className="text-sm text-gray-600">Your email address is verified</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Secure Authentication</p>
                    <p className="text-sm text-gray-600">Using Supabase secure authentication</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Data Encryption</p>
                    <p className="text-sm text-gray-600">All data is encrypted in transit and at rest</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Session Management</Label>
                  <Button variant="outline" onClick={logout} className="w-full">
                    Sign Out All Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
