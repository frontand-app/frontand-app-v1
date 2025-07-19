import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface OAuthCallbackProps {
  service: string;
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ service }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
          setError(errorDescription || error);
          setStatus('error');
          return;
        }

        if (!code || !state) {
          setError('Missing authorization code or state parameter');
          setStatus('error');
          return;
        }

        // Send callback data to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth_callback',
            data: { code, state, service }
          }, window.location.origin);
          
          // Close the popup window
          window.close();
        } else {
          // If not in a popup, redirect to the main app
          setStatus('success');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('An unexpected error occurred during authentication');
        setStatus('error');
      }
    };

    handleCallback();
  }, [location, navigate, service]);

  const getServiceName = (serviceId: string) => {
    const services: Record<string, string> = {
      google: 'Google',
      github: 'GitHub',
      slack: 'Slack',
      notion: 'Notion',
      airtable: 'Airtable'
    };
    return services[serviceId] || serviceId;
  };

  const getServiceIcon = (serviceId: string) => {
    const icons: Record<string, string> = {
      google: '🔵',
      github: '⚫',
      slack: '💬',
      notion: '📝',
      airtable: '🟠'
    };
    return icons[serviceId] || '🔗';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">{getServiceIcon(service)}</span>
          </div>
          <CardTitle className="text-xl">
            {status === 'processing' && `Connecting to ${getServiceName(service)}...`}
            {status === 'success' && `Successfully connected to ${getServiceName(service)}`}
            {status === 'error' && `Failed to connect to ${getServiceName(service)}`}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center">
          {status === 'processing' && (
            <div className="space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
              <p className="text-gray-600">
                Processing your authentication...
              </p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
              <p className="text-gray-600">
                You can now close this window and return to CLOSED AI.
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-left">
                  {error}
                </AlertDescription>
              </Alert>
              <p className="text-gray-600 text-sm">
                Please close this window and try again.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback; 
