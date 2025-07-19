import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  PlayCircle,
  Plus,
  Settings,
  Share2,
  Eye,
  BarChart3,
  Calendar,
  Download,
  CreditCard,
  Star,
  GitFork,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { monetizationManager, formatCurrency, formatCredits } from '@/lib/monetization';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from 'react-router-dom';

interface CreatorStats {
  totalRevenue: number;
  totalExecutions: number;
  totalWorkflows: number;
  pendingPayout: number;
  thisMonth: number;
}

interface WorkflowStats {
  id: string;
  name: string;
  category: string;
  revenue: number;
  executions: number;
  users: number;
  rating: number;
  isPublic: boolean;
  createdAt: Date;
  lastExecuted?: Date;
}

const CreatorsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock data for demonstration
  const revenueData = [
    { date: '2024-01-01', revenue: 120, executions: 45 },
    { date: '2024-01-02', revenue: 150, executions: 52 },
    { date: '2024-01-03', revenue: 180, executions: 63 },
    { date: '2024-01-04', revenue: 90, executions: 38 },
    { date: '2024-01-05', revenue: 210, executions: 71 },
    { date: '2024-01-06', revenue: 165, executions: 58 },
    { date: '2024-01-07', revenue: 195, executions: 67 },
  ];

  const categoryData = [
    { name: 'Text Analysis', value: 45, color: '#10a37f' },
    { name: 'Data Processing', value: 30, color: '#16a34a' },
    { name: 'Image Processing', value: 15, color: '#059669' },
    { name: 'API Integration', value: 10, color: '#047857' },
  ];

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    // Show content immediately with mock data - no loading delay
    try {
      // Get creator stats
      const creatorStats = monetizationManager.getCreatorTotalEarnings(user.id);
      setStats(creatorStats);

      // Mock workflow data
      const mockWorkflows: WorkflowStats[] = [
        {
          id: 'workflow-1',
          name: 'Keyword Clustering',
          category: 'Text Analysis',
          revenue: 245.50,
          executions: 127,
          users: 45,
          rating: 4.8,
          isPublic: true,
          createdAt: new Date('2024-01-15'),
          lastExecuted: new Date('2024-01-20')
        },
        {
          id: 'workflow-2',
          name: 'Sentiment Analysis',
          category: 'Text Analysis',
          revenue: 189.25,
          executions: 98,
          users: 34,
          rating: 4.6,
          isPublic: true,
          createdAt: new Date('2024-01-10'),
          lastExecuted: new Date('2024-01-19')
        },
        {
          id: 'workflow-3',
          name: 'Data Extraction',
          category: 'Data Processing',
          revenue: 156.75,
          executions: 76,
          users: 28,
          rating: 4.4,
          isPublic: false,
          createdAt: new Date('2024-01-08'),
          lastExecuted: new Date('2024-01-18')
        }
      ];

      setWorkflows(mockWorkflows);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!user || !stats) return;

    try {
      const payout = await monetizationManager.processCreatorPayout(user.id, 'stripe');
      console.log('Payout requested:', payout);
      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Failed to request payout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-primary-600 animate-pulse" />
          </div>
          <p className="text-gray-600">Loading your creator dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access your creator dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage your workflows and track your earnings
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => {
                // Simulate export functionality
                const data = JSON.stringify({
                  workflows: stats?.totalWorkflows || 0,
                  earnings: stats?.totalRevenue || 0,
                  executions: stats?.totalExecutions || 0,
                  exportDate: new Date().toISOString()
                }, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'creator-data.json';
                a.click();
                URL.revokeObjectURL(url);
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button asChild>
                <Link to="/creators/new">
                  <Plus className="w-4 h-4 mr-2" />
                  New Workflow
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats?.totalRevenue || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+12.5% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Executions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalExecutions?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-sm text-blue-600">+8.3% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalWorkflows || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Plus className="w-4 h-4 text-purple-600 mr-1" />
                <span className="text-sm text-purple-600">2 new this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payout</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats?.pendingPayout || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  size="sm" 
                  onClick={handleRequestPayout}
                  disabled={!stats || stats.pendingPayout < 25}
                  className="w-full"
                >
                  Request Payout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Analytics */}
          <div className="lg:col-span-2 space-y-6" id="creator-analytics">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Revenue Overview
                </CardTitle>
                <div className="flex gap-2">
                  {(['7d', '30d', '90d', '1y'] as const).map((period) => (
                    <Button
                      key={period}
                      variant={selectedPeriod === period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod(period)}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#10a37f" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Workflows Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Your Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          workflow.isPublic ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {workflow.isPublic ? (
                            <Eye className="w-5 h-5 text-green-600" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {workflow.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <PlayCircle className="w-3 h-3" />
                              {workflow.executions} runs
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {workflow.users} users
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {workflow.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(workflow.revenue)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {workflow.lastExecuted && (
                              `Last used ${new Date(workflow.lastExecuted).toLocaleDateString()}`
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={categoryData[index].color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/creators/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Workflow
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/flows">
                    <GitFork className="w-4 h-4 mr-2" />
                    Fork Public Workflow
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'My Workflows on Front&',
                      text: 'Check out my AI workflows on Front&',
                      url: window.location.origin + '/creators'
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.origin + '/creators');
                    alert('Link copied to clipboard!');
                  }
                }}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Workflow
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => {
                  const analyticsSection = document.getElementById('creator-analytics');
                  analyticsSection?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        Workflow executed successfully
                      </p>
                      <p className="text-xs text-gray-500">
                        Keyword Clustering • 2 minutes ago
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        Revenue earned: $2.50
                      </p>
                      <p className="text-xs text-gray-500">
                        Sentiment Analysis • 1 hour ago
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <GitFork className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        Workflow forked
                      </p>
                      <p className="text-xs text-gray-500">
                        Data Extraction • 3 hours ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorsDashboard; 

 
 
 
 