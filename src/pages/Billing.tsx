import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, CreditCard, Crown, Zap, Star, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CreditsService, UserProfile, CreditTransaction } from "@/lib/credits";

const Billing = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBillingData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await CreditsService.getUserProfile(user);
        setUserProfile(profile);

        const history = await CreditsService.getCreditHistory(user.id, 20);
        setTransactions(history);
      } catch (error) {
        console.error('Error loading billing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBillingData();
  }, [user]);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      credits: 100,
      period: 'one-time',
      description: 'Perfect for getting started',
      features: [
        '100 free credits',
        'Access to all workflows',
        'Community support',
        'Basic analytics'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 25,
      credits: 500,
      period: 'month',
      description: 'For regular workflow automation',
      features: [
        '500 credits per month',
        'Priority execution',
        'Advanced analytics',
        'Email support',
        'Custom domains',
        'Export results'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      credits: 2500,
      period: 'month',
      description: 'For teams and businesses',
      features: [
        '2,500 credits per month',
        'Team collaboration',
        'Priority support',
        'Custom workflows',
        'SLA guarantee',
        'Advanced security'
      ],
      popular: false
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'execution': return <Clock className="h-4 w-4 text-red-600" />;
      case 'bonus': return <Star className="h-4 w-4 text-yellow-600" />;
      case 'refund': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default: return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 mb-8">
            Sign in to manage your billing and upgrade your plan
          </p>
          <Button size="lg" className="bg-primary-500 hover:bg-primary-600">
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Plans</h1>
        <p className="text-lg text-gray-600">
          Manage your subscription and view your usage history
        </p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
          <TabsTrigger value="usage">Current Usage</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          {/* Current Plan Status */}
          {userProfile && (
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-900">
                      Current Plan: {userProfile.tier.charAt(0).toUpperCase() + userProfile.tier.slice(1)}
                    </h3>
                    <p className="text-emerald-700">
                      {userProfile.credits_balance.toFixed(0)} credits remaining
                    </p>
                  </div>
                  <Badge className="bg-emerald-500 text-white">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary-500 shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary-500 text-white px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    {plan.id === 'free' && <Zap className="h-8 w-8 text-gray-500" />}
                    {plan.id === 'pro' && <Star className="h-8 w-8 text-primary-500" />}
                    {plan.id === 'enterprise' && <Crown className="h-8 w-8 text-purple-500" />}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    {plan.period !== 'one-time' && <span className="text-lg font-normal text-gray-500">/{plan.period}</span>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center mb-4">
                    <span className="text-lg font-semibold">{plan.credits.toLocaleString()} credits</span>
                    {plan.period !== 'one-time' && <span className="text-gray-500"> per month</span>}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-6 ${
                      userProfile?.tier === plan.id 
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed' 
                        : plan.popular 
                          ? 'bg-primary-500 hover:bg-primary-600' 
                          : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                    disabled={userProfile?.tier === plan.id}
                  >
                    {userProfile?.tier === plan.id ? 'Current Plan' : 
                     plan.id === 'free' ? 'Get Started' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          {userProfile ? (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Credit Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {userProfile.credits_balance.toFixed(0)}
                  </div>
                  <p className="text-gray-600">Credits remaining</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Plan Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {userProfile.tier.charAt(0).toUpperCase() + userProfile.tier.slice(1)}
                  </div>
                  <p className="text-gray-600">Current subscription</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">Loading usage information...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your recent credit transactions and billing history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.transaction_type)}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className={`text-right ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <p className="font-medium">
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(4)} credits
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No transactions yet. Start using workflows to see your history here.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Billing; 
 
 