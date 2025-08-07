import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Database, Wifi, WifiOff } from "lucide-react";

export const DataStatusIndicator: React.FC = () => {
  const { user } = useAuth();

  // Check if we're in demo mode
  const isDemoMode = user?.id?.includes("demo") || false;
  
  if (!isDemoMode) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <Database className="w-3 h-3 mr-1" />
        Live Data
      </Badge>
    );
  }

  return (
    <div className="space-y-2">
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <WifiOff className="w-3 h-3 mr-1" />
        Demo Mode
      </Badge>
      <Alert variant="destructive" className="border-yellow-200 bg-yellow-50">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="text-yellow-800">
          <strong>Demo Mode Active:</strong> You're viewing simulated data. 
          For production use, ensure proper database connectivity is configured.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export const DatabaseConnectionStatus: React.FC<{ 
  isConnected?: boolean;
  showDetails?: boolean;
}> = ({ isConnected, showDetails = false }) => {
  if (isConnected === undefined) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600">Database Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600">Database Disconnected</span>
        </>
      )}
      
      {showDetails && !isConnected && (
        <div className="ml-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Using Demo Data
          </Badge>
        </div>
      )}
    </div>
  );
};
