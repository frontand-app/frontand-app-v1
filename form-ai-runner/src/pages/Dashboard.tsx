
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Zap, 
  Play, 
  CheckCircle, 
  XCircle,
  Activity,
  CreditCard,
  Calendar
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock data for dashboard
  const stats = {
    totalExecutions: 247,
    totalSpent: 12.45,
    creditsRemaining: 87.55,
    avgExecutionTime: "2.3s"
  };

  const recentExecutions = [
    { 
      id: "exec_001", 
      flowName: "Cluster Keywords", 
      status: "completed", 
      timestamp: "2024-01-15T10:30:00Z", 
      cost: 0.05, 
      duration: "2.1s",
      model: "GPT-3.5 Turbo"
    },
    { 
      id: "exec_002", 
      flowName: "Sentiment Analysis", 
      status: "completed", 
      timestamp: "2024-01-15T09:15:00Z", 
      cost: 0.03, 
      duration: "1.8s",
      model: "Claude 3"
    },
    { 
      id: "exec_003", 
      flowName: "Image to Text", 
      status: "failed", 
      timestamp: "2024-01-15T08:45:00Z", 
      cost: 0.00, 
      duration: "0s",
      model: "GPT-4"
    },
    { 
      id: "exec_004", 
      flowName: "Content Summarizer", 
      status: "completed", 
      timestamp: "2024-01-14T16:20:00Z", 
      cost: 0.04, 
      duration: "2.7s",
      model: "GPT-4"
    },
    { 
      id: "exec_005", 
      flowName: "Multi-Language Translator", 
      status: "completed", 
      timestamp: "2024-01-14T14:10:00Z", 
      cost: 0.02, 
      duration: "1.5s",
      model: "Gemini Pro"
    }
  ];

  const usageData = [
    { date: "Jan 8", executions: 12, cost: 0.48 },
    { date: "Jan 9", executions: 19, cost: 0.73 },
    { date: "Jan 10", executions: 15, cost: 0.62 },
    { date: "Jan 11", executions: 28, cost: 1.15 },
    { date: "Jan 12", executions: 22, cost: 0.89 },
    { date: "Jan 13", executions: 35, cost: 1.42 },
    { date: "Jan 14", executions: 41, cost: 1.68 },
  ];

  const modelUsage = [
    { name: "GPT-3.5 Turbo", value: 45, color: "#3B82F6" },
    { name: "GPT-4", value: 30, color: "#10B981" },
    { name: "Claude 3", value: 15, color: "#F59E0B" },
    { name: "Gemini Pro", value: 10, color: "#EF4444" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your AI workflow usage and performance</p>
        </div>
        <Button>
          <CreditCard className="w-4 h-4 mr-2" />
          Add Credits
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Play className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExecutions}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.creditsRemaining}</div>
            <Progress value={87.55} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgExecutionTime}</div>
            <p className="text-xs text-muted-foreground">
              -5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="usage" className="w-full" id="analytics-section">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="usage">Usage Over Time</TabsTrigger>
              <TabsTrigger value="models">Model Usage</TabsTrigger>
            </TabsList>
            
            <TabsContent value="usage">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Daily Usage
                  </CardTitle>
                  <CardDescription>
                    Your executions and costs over the past week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="executions" fill="#3B82F6" name="Executions" />
                      <Bar yAxisId="right" dataKey="cost" fill="#10B981" name="Cost ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="models">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Model Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of AI models used in your executions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={modelUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {modelUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Executions
              </CardTitle>
              <CardDescription>
                Your latest AI workflow runs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExecutions.map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(execution.status)}
                      <div>
                        <p className="font-medium text-sm">{execution.flowName}</p>
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(execution.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ${execution.cost.toFixed(3)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {execution.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
              <Link to="/flows">
                <Play className="w-6 h-6" />
                <span>Run New Flow</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => {
              const analyticsSection = document.getElementById('analytics-section');
              analyticsSection?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <TrendingUp className="w-6 h-6" />
              <span>View Analytics</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
              <Link to="/billing">
                <CreditCard className="w-6 h-6" />
                <span>Manage Billing</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
