import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description: string;
  comingSoon?: boolean;
}

export default function PlaceholderPage({ title, description, comingSoon = true }: PlaceholderPageProps) {
  return (
    <div className="p-6 flex items-center justify-center min-h-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 bg-primary/10 p-4 rounded-full w-fit">
            <Construction className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {comingSoon && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                This feature is coming soon! Continue prompting to help build out this page.
              </p>
            </div>
          )}
          <Link to="/dashboard">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
