import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Zap, 
  Calendar, 
  Download, 
  Filter,
  Activity,
  Target,
  Users,
  Percent
} from 'lucide-react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data for analytics
  const usageData = [
    { date: '2024-01-10', executions: 23, cost: 1.15, avgTime: 2.3 },
    { date: '2024-01-11', executions: 31, cost: 1.55, avgTime: 2.1 },
    { date: '2024-01-12', executions: 18, cost: 0.90, avgTime: 2.8 },
    { date: '2024-01-13', executions: 42, cost: 2.10, avgTime: 1.9 },
    { date: '2024-01-14', executions: 38, cost: 1.90, avgTime: 2.2 },
    { date: '2024-01-15', executions: 45, cost: 2.25, avgTime: 2.0 },
    { date: '2024-01-16', executions: 52, cost: 2.60, avgTime: 1.8 }
  ];

  const workflowData = [
    { name: 'Cluster Keywords', executions: 156, cost: 7.80, avgCost: 0.05, success: 98.7 },
    { name: 'Sentiment Analysis', executions: 134, cost: 4.02, avgCost: 0.03, success: 99.2 },
    { name: 'Data Extraction', executions: 89, cost: 17.80, avgCost: 0.20, success: 96.6 },
    { name: 'Image to Text', executions: 67, cost: 5.36, avgCost: 0.08, success: 94.1 },
    { name: 'Text Summarization', executions: 45, cost: 2.25, avgCost: 0.05, success: 99.1 }
  ];

  const modelData = [
    { name: 'GPT-4', value: 45, cost: 15.30, color: '#3B82F6' },
    { name: 'Claude 3', value: 32, cost: 8.96, color: '#10B981' },
    { name: 'GPT-3.5', value: 28, cost: 4.20, color: '#F59E0B' },
    { name: 'Gemini Pro', value: 18, cost: 3.60, color: '#8B5CF6' }
  ];

  const performanceData = [
    { date: '2024-01-10', successRate: 96.8, avgTime: 2.3, throughput: 23 },
    { date: '2024-01-11', successRate: 98.1, avgTime: 2.1, throughput: 31 },
    { date: '2024-01-12', successRate: 94.4, avgTime: 2.8, throughput: 18 },
    { date: '2024-01-13', successRate: 97.6, avgTime: 1.9, throughput: 42 },
    { date: '2024-01-14', successRate: 98.7, avgTime: 2.2, throughput: 38 },
    { date: '2024-01-15', successRate: 99.1, avgTime: 2.0, throughput: 45 },
    { date: '2024-01-16', successRate: 98.3, avgTime: 1.8, throughput: 52 }
  ];

  const totalExecutions = usageData.reduce((sum, day) => sum + day.executions, 0);
  const totalCost = usageData.reduce((sum, day) => sum + day.cost, 0);
  const avgExecutionTime = usageData.reduce((sum, day) => sum + day.avgTime, 0) / usageData.length;
  const avgSuccessRate = performanceData.reduce((sum, day) => sum + day.successRate, 0) / performanceData.length;

  const handleExport = () => {
    const exportData = {
      summary: {
        totalExecutions,
        totalCost: totalCost.toFixed(2),
        avgExecutionTime: avgExecutionTime.toFixed(1),
        avgSuccessRate: avgSuccessRate.toFixed(1)
      },
      dailyUsage: usageData,
      workflowBreakdown: workflowData,
      modelUsage: modelData,
      performance: performanceData,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Deep insights into your workflow usage and performance
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Executions</p>
                  <p className="text-2xl font-bold text-gray-900">{totalExecutions}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+12.5% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+8.2% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Execution Time</p>
                  <p className="text-2xl font-bold text-gray-900">{avgExecutionTime.toFixed(1)}s</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600">-15.3% faster</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{avgSuccessRate.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+2.1% improvement</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics */}
        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="usage">Usage Trends</TabsTrigger>
            <TabsTrigger value="workflows">Workflow Analysis</TabsTrigger>
            <TabsTrigger value="models">Model Distribution</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Usage & Cost</CardTitle>
                <CardDescription>
                  Track your workflow executions and spending over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="executions" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                      name="Executions"
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Cost ($)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Performance</CardTitle>
                <CardDescription>
                  Compare usage and costs across different workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflowData.map((workflow, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{workflow.name}</h3>
                        <Badge variant="outline">{workflow.success}% success</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">{workflow.executions}</span> executions
                        </div>
                        <div>
                          <span className="font-medium">${workflow.cost.toFixed(2)}</span> total cost
                        </div>
                        <div>
                          <span className="font-medium">${workflow.avgCost.toFixed(3)}</span> avg cost
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Usage</CardTitle>
                <CardDescription>
                  Distribution of executions across different AI models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={modelData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {modelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {modelData.map((model, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: model.color }}
                          />
                          <span className="font-medium">{model.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{model.value} runs</div>
                          <div className="text-sm text-gray-600">${model.cost.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Monitor success rates, execution times, and throughput
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" domain={[90, 100]} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="successRate" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Success Rate (%)"
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="avgTime" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      name="Avg Time (s)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics; 