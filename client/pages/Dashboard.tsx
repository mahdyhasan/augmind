import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  MessageSquare, 
  Upload, 
  TrendingUp, 
  Users, 
  Target, 
  MessageCircle,
  ArrowRight,
  BarChart3,
  FileText,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  conversations: number;
  documents: number;
  prospects: number;
  totalTokens: number;
  totalRequests: number;
  presetQuestions: number;
}

interface RecentActivity {
  id: string;
  action: string;
  time: string;
  icon: any;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    conversations: 0,
    documents: 0,
    prospects: 0,
    totalTokens: 0,
    totalRequests: 0,
    presetQuestions: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) {
      console.log('Dashboard: No user found');
      return;
    }

    try {
      console.log('Dashboard: Fetching data for user:', user.email, 'ID:', user.id);
      setLoading(true);

      // Fetch conversations count
      console.log('Dashboard: Fetching conversations...');
      const { count: conversationsCount, error: conversationsError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (conversationsError) {
        console.error('Dashboard: Error fetching conversations:', conversationsError);
      } else {
        console.log('Dashboard: Conversations count:', conversationsCount);
      }

      // Fetch documents count (admin sees all, users see their own)
      console.log('Dashboard: Fetching documents...');
      const documentsQuery = supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      if (user.role !== 'Admin') {
        documentsQuery.eq('uploaded_by', user.id);
      }
      const { count: documentsCount, error: documentsError } = await documentsQuery;

      if (documentsError) {
        console.error('Dashboard: Error fetching documents:', documentsError);
      } else {
        console.log('Dashboard: Documents count:', documentsCount);
      }

      // Fetch client prospects count
      console.log('Dashboard: Fetching prospects...');
      const { count: prospectsCount, error: prospectsError } = await supabase
        .from('client_prospects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (prospectsError) {
        console.error('Dashboard: Error fetching prospects:', prospectsError);
      } else {
        console.log('Dashboard: Prospects count:', prospectsCount);
      }

      // Fetch usage analytics for tokens and requests
      console.log('Dashboard: Fetching analytics...');
      const { data: analytics, error: analyticsError } = await supabase
        .from('usage_analytics')
        .select('tokens_consumed')
        .eq('user_id', user.id);

      if (analyticsError) {
        console.error('Dashboard: Error fetching analytics:', analyticsError);
      } else {
        console.log('Dashboard: Analytics data:', analytics);
      }

      const totalTokens = analytics?.reduce((sum, item) => sum + (item.tokens_consumed || 0), 0) || 0;

      // Fetch daily summary for requests
      console.log('Dashboard: Fetching daily summary...');
      const { data: dailySummary, error: dailyError } = await supabase
        .from('daily_usage_summary')
        .select('total_requests')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(7);

      if (dailyError) {
        console.error('Dashboard: Error fetching daily summary:', dailyError);
      } else {
        console.log('Dashboard: Daily summary data:', dailySummary);
      }

      const totalRequests = dailySummary?.reduce((sum, item) => sum + (item.total_requests || 0), 0) || 0;

      // Fetch preset questions count (admin only)
      let presetQuestionsCount = 0;
      if (user.role === 'Admin') {
        const { count } = await supabase
          .from('preset_questions')
          .select('*', { count: 'exact', head: true });
        presetQuestionsCount = count || 0;
      }

      setStats({
        conversations: conversationsCount || 0,
        documents: documentsCount || 0,
        prospects: prospectsCount || 0,
        totalTokens,
        totalRequests,
        presetQuestions: presetQuestionsCount,
      });

      // Fetch recent activity
      const { data: recentMessages } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender,
          conversation_id,
          conversations!inner(user_id)
        `)
        .eq('conversations.user_id', user.id)
        .eq('sender', 'user')
        .order('created_at', { ascending: false })
        .limit(4);

      const { data: recentUploads } = await supabase
        .from('documents')
        .select('id, filename, created_at')
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: recentProspects } = await supabase
        .from('client_prospects')
        .select('id, company_name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);

      // Combine and format recent activity
      const activities: RecentActivity[] = [];

      recentMessages?.forEach(msg => {
        activities.push({
          id: msg.id,
          action: `Started AI conversation: "${msg.content.substring(0, 50)}..."`,
          time: formatTimeAgo(new Date(msg.created_at)),
          icon: MessageSquare,
        });
      });

      recentUploads?.forEach(doc => {
        activities.push({
          id: doc.id,
          action: `Uploaded document: ${doc.filename}`,
          time: formatTimeAgo(new Date(doc.created_at)),
          icon: Upload,
        });
      });

      recentProspects?.forEach(prospect => {
        activities.push({
          id: prospect.id,
          action: `Added prospect: ${prospect.company_name}`,
          time: formatTimeAgo(new Date(prospect.created_at)),
          icon: Users,
        });
      });

      // Sort by time and take most recent
      activities.sort((a, b) => {
        const timeA = parseTimeAgo(a.time);
        const timeB = parseTimeAgo(b.time);
        return timeA - timeB;
      });

      setRecentActivity(activities.slice(0, 6));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const parseTimeAgo = (timeStr: string): number => {
    if (timeStr === 'Just now') return 0;
    const match = timeStr.match(/(\d+) (hour|day)s? ago/);
    if (!match) return 0;
    const value = parseInt(match[1]);
    const unit = match[2];
    return unit === 'day' ? value * 24 : value;
  };

  const quickActions = [
    {
      title: 'Start AI Chat',
      description: 'Get strategic insights from your AI assistant',
      icon: MessageSquare,
      href: '/chat',
      color: 'bg-blue-500',
    },
    {
      title: 'Upload Documents',
      description: 'Add new files for AI analysis',
      icon: Upload,
      href: '/uploads',
      color: 'bg-green-500',
    },
    {
      title: 'Client Prospect',
      description: 'Analyze potential clients',
      icon: Users,
      href: '/client-prospect',
      color: 'bg-purple-500',
    },
    {
      title: user?.role === 'Admin' ? 'Admin Panel' : 'View Insights',
      description: user?.role === 'Admin' ? 'Manage users and settings' : 'Review market insights',
      icon: user?.role === 'Admin' ? BarChart3 : TrendingUp,
      href: user?.role === 'Admin' ? '/admin' : '/competitors',
      color: 'bg-orange-500',
    },
  ];

  const dashboardStats = [
    {
      title: 'AI Conversations',
      value: stats.conversations.toString(),
      icon: MessageSquare,
      change: '+12%',
    },
    {
      title: user?.role === 'Admin' ? 'Total Documents' : 'My Documents',
      value: stats.documents.toString(),
      icon: FileText,
      change: '+5%',
    },
    {
      title: 'Tokens Used',
      value: stats.totalTokens.toLocaleString(),
      icon: Zap,
      change: '+23%',
    },
    {
      title: user?.role === 'Admin' ? 'Preset Questions' : 'Total Requests',
      value: user?.role === 'Admin' ? stats.presetQuestions.toString() : stats.totalRequests.toString(),
      icon: user?.role === 'Admin' ? MessageCircle : BarChart3,
      change: '+2%',
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-blue-100 mb-4">
          Your AI-powered strategic assistant is ready to help you make informed decisions.
        </p>
        <div className="flex items-center text-sm text-blue-100">
          <span className="mr-2">Role:</span>
          <span className="bg-white/20 px-2 py-1 rounded-full">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-green-600">{stat.change} from last week</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                <Link to={action.href}>
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest interactions with Augmind</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-white p-2 rounded-full">
                    <activity.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
              <p className="text-gray-600 mb-4">Start using Augmind to see your activity here</p>
              <Link to="/chat">
                <Button>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Start AI Chat
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
