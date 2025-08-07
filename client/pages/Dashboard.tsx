import React from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
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
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: "Start AI Chat",
      description: "Get strategic insights from your AI assistant",
      icon: MessageSquare,
      href: "/chat",
      color: "bg-blue-500",
    },
    {
      title: "Upload Documents",
      description: "Add new files for AI analysis",
      icon: Upload,
      href: "/uploads",
      color: "bg-green-500",
    },
    {
      title: "Client Prospect",
      description: "Analyze potential clients",
      icon: Users,
      href: "/client-prospect",
      color: "bg-purple-500",
    },
    {
      title: "Competitor Analysis",
      description: "Review market insights",
      icon: TrendingUp,
      href: "/competitors",
      color: "bg-orange-500",
    },
  ];

  const stats = [
    {
      title: "AI Conversations",
      value: "47",
      icon: MessageSquare,
      change: "+12%",
    },
    {
      title: "Documents Uploaded",
      value: "23",
      icon: FileText,
      change: "+5%",
    },
    {
      title: "Insights Generated",
      value: "156",
      icon: Zap,
      change: "+23%",
    },
    {
      title: "Active Projects",
      value: "8",
      icon: BarChart3,
      change: "+2%",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100 mb-4">
          Your AI-powered strategic assistant is ready to help you make informed
          decisions.
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
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-green-600">
                    {stat.change} from last week
                  </p>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardContent className="p-6">
                <div
                  className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                >
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {action.description}
                </p>
                <Link to={action.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                  >
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
          <CardDescription>
            Your latest interactions with Augmind
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "Started AI conversation about market analysis",
                time: "2 hours ago",
                icon: MessageSquare,
              },
              {
                action: "Uploaded competitor research document",
                time: "4 hours ago",
                icon: Upload,
              },
              {
                action: "Generated client prospect strategy",
                time: "1 day ago",
                icon: Users,
              },
              {
                action: "Reviewed USP recommendations",
                time: "2 days ago",
                icon: Target,
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="bg-white p-2 rounded-full">
                  <activity.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
