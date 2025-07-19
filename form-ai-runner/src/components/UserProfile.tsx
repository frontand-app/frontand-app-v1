import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Calendar, 
  Coins, 
  CreditCard, 
  History, 
  Settings,
  Star,
  RefreshCw,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CreditsService, UserProfile as UserProfileType, CreditTransaction } from '@/lib/credits';

interface UserProfileProps {
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ className }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadProfileData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);
      
      // Get user profile
      const userProfile = await CreditsService.getUserProfile(user);
      setProfile(userProfile);

      // Get recent transactions
      const recentTransactions = await CreditsService.getCreditHistory(user.id, 10);
      setTransactions(recentTransactions);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'pro': return 'bg-blue-500 text-white';
      case 'enterprise': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'execution': return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'bonus': return <Star className="h-4 w-4 text-yellow-600" />;
      case 'refund': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default: return <Coins className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCredits = (amount: number) => {
    return amount.toFixed(4);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sign in Required
            </h3>
            <p className="text-gray-600">
              Please sign in to view your profile and credit information.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-600" />
            <span className="ml-2 text-gray-600">Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <Mail className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Profile Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              Unable to load your profile information.
            </p>
            <Button onClick={loadProfileData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || profile.email} />
              <AvatarFallback className="text-lg">
                {(profile.full_name || profile.email).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {profile.full_name || 'User'}
                </h2>
                <Badge className={getTierColor(profile.tier)}>
                  {profile.tier.toUpperCase()}
                </Badge>
                {profile.is_verified && (
                  <Badge variant="outline" className="border-green-200 text-green-700">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {profile.email}
              </p>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                Member since {formatDate(profile.created_at)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadProfileData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Credits Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Coins className="h-5 w-5 mr-2 text-yellow-500" />
            Credits Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {formatCredits(profile.credits_balance)}
              </div>
              <div className="text-sm text-green-600">Available Credits</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">
                {transactions.filter(t => t.transaction_type === 'execution').length}
              </div>
              <div className="text-sm text-blue-600">Workflows Run</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">
                {formatCredits(
                  transactions
                    .filter(t => t.transaction_type === 'execution')
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                )}
              </div>
              <div className="text-sm text-purple-600">Credits Used</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2 text-gray-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium text-sm ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCredits(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {transaction.transaction_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
              
              {transactions.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm">
                    View All Transactions
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent activity</p>
              <p className="text-sm text-gray-500">
                Your workflow executions and credit purchases will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-gray-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Purchase Credits
            </Button>
            <Button variant="outline" className="justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
