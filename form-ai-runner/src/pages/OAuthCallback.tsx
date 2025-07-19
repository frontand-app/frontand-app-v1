import React from 'react';
import { useParams } from 'react-router-dom';
import OAuthCallback from '@/components/oauth/OAuthCallback';

const OAuthCallbackPage: React.FC = () => {
  const { service } = useParams<{ service: string }>();
  
  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid OAuth Callback</h1>
          <p className="text-gray-600">Missing service parameter</p>
        </div>
      </div>
    );
  }

  return <OAuthCallback service={service} />;
};

export default OAuthCallbackPage; 
