import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, Users } from 'lucide-react';
import { createDemoAdmin, createDemoBusinessUser } from '../lib/seedData';

export default function AdminSetup() {
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleCreateDemoData = async () => {
    setIsCreating(true);
    setMessage('');

    try {
      const adminResult = await createDemoAdmin();
      const userResult = await createDemoBusinessUser();

      if (adminResult.success && userResult.success) {
        setMessage('Demo accounts created successfully! You can now sign in with:\n\nAdmin: admin@augmind.com / admin123\nUser: user@augmind.com / user123');
        setMessageType('success');
      } else {
        setMessage(`Errors occurred:\nAdmin: ${adminResult.error || 'Success'}\nUser: ${userResult.error || 'Success'}`);
        setMessageType('error');
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Initial Setup</CardTitle>
          <CardDescription>
            Create demo accounts to get started with Augmind
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Admin account with full access</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-500" />
              <span>Business Dev User account for client prospect tools</span>
            </div>
          </div>

          {message && (
            <Alert variant={messageType === 'error' ? 'destructive' : 'default'} className={messageType === 'success' ? 'border-green-200 bg-green-50' : ''}>
              <AlertDescription className={messageType === 'success' ? 'text-green-800' : ''} style={{ whiteSpace: 'pre-line' }}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleCreateDemoData}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Demo Accounts...
              </div>
            ) : (
              'Create Demo Accounts'
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            This will create demo accounts for testing. In production, admins would create accounts through the admin panel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
