import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { 
  AlertCircle, 
  CheckCircle, 
  ExternalLink, 
  RefreshCw,
  Database,
  XCircle,
  Info
} from "lucide-react";
import { testSupabaseConnection } from "../lib/supabase";

export const ConnectionSetup: React.FC = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"testing" | "connected" | "failed">("testing");
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsTestingConnection(true);
    setError(null);
    
    try {
      const isConnected = await testSupabaseConnection();
      setConnectionStatus(isConnected ? "connected" : "failed");
      if (!isConnected) {
        setError("Failed to connect to Supabase. Please check your configuration.");
      }
    } catch (err: any) {
      setConnectionStatus("failed");
      setError(err.message || "Connection test failed");
    } finally {
      setIsTestingConnection(false);
      setLastTestTime(new Date());
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const envVars = {
    url: import.meta.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <CardTitle>Database Connection</CardTitle>
            </div>
            <Badge 
              variant={
                connectionStatus === "connected" ? "default" :
                connectionStatus === "testing" ? "secondary" : "destructive"
              }
            >
              {connectionStatus === "connected" && <CheckCircle className="h-3 w-3 mr-1" />}
              {connectionStatus === "failed" && <XCircle className="h-3 w-3 mr-1" />}
              {connectionStatus === "testing" && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
              {connectionStatus === "connected" ? "Connected" :
               connectionStatus === "testing" ? "Testing..." : "Disconnected"}
            </Badge>
          </div>
          <CardDescription>
            Supabase database connection status and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Environment Variables Status */}
          <div className="space-y-2">
            <h4 className="font-medium">Environment Variables</h4>
            <div className="space-y-1 text-sm">
              <div className={`flex items-center space-x-2 ${envVars.url ? 'text-green-600' : 'text-red-600'}`}>
                {envVars.url ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span>VITE_SUPABASE_URL: {envVars.url ? 'Configured' : 'Missing'}</span>
              </div>
              <div className={`flex items-center space-x-2 ${envVars.key ? 'text-green-600' : 'text-red-600'}`}>
                {envVars.key ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span>VITE_SUPABASE_ANON_KEY: {envVars.key ? 'Configured' : 'Missing'}</span>
              </div>
            </div>
          </div>

          {/* Test Connection Button */}
          <Button 
            onClick={testConnection} 
            disabled={isTestingConnection}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isTestingConnection ? 'animate-spin' : ''}`} />
            Test Connection
          </Button>

          {/* Last Test Time */}
          {lastTestTime && (
            <p className="text-sm text-gray-500">
              Last tested: {lastTestTime.toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Setup Instructions */}
      {connectionStatus === "failed" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Setup Instructions</span>
            </CardTitle>
            <CardDescription>
              Follow these steps to configure your Supabase connection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Get Supabase Credentials</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Create a new Supabase project or access your existing one:
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Supabase Dashboard
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">2. Copy Project Details</h4>
                <p className="text-sm text-gray-600 mb-2">
                  From your Supabase project dashboard:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Go to Settings → API</li>
                  <li>• Copy the "Project URL"</li>
                  <li>• Copy the "anon/public" key</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">3. Update Environment Variables</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Contact your administrator to update these environment variables:
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                  <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                  <div>VITE_SUPABASE_ANON_KEY=your-anon-key-here</div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  After updating the environment variables, the application will need to be restarted 
                  to apply the new configuration.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {connectionStatus === "connected" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            ✅ Database connection successful! All features are now available.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
