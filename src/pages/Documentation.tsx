import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { 
  Book, 
  Code, 
  Zap, 
  Play, 
  Settings, 
  CreditCard, 
  GitBranch, 
  ExternalLink,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const Documentation = () => {
  const quickStart = [
    {
      step: 1,
      title: "Sign Up for Free",
      description: "Create your account and get 100 free credits to start exploring",
      action: "Go to Sign Up",
      link: "/auth"
    },
    {
      step: 2,
      title: "Browse Workflows",
      description: "Explore our library of pre-built AI workflows created by the community",
      action: "View Flow Library",
      link: "/flows"
    },
    {
      step: 3,
      title: "Run Your First Workflow",
      description: "Try the Keyword Clustering workflow to see how easy automation can be",
      action: "Try Keyword Clustering",
      link: "/flows/cluster-keywords"
    },
    {
      step: 4,
      title: "Track Your Usage",
      description: "Monitor your credit usage and execution history in your dashboard",
      action: "View Dashboard",
      link: "/dashboard"
    }
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Execution",
      description: "Run AI workflows with a single click and get results in seconds"
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Transparent Pricing",
      description: "See exact costs before running workflows. Pay only for what you use"
    },
    {
      icon: <GitBranch className="w-6 h-6" />,
      title: "Community-Driven",
      description: "Access workflows created by experts or build your own to share"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "No Setup Required",
      description: "No installations, dependencies, or complex configurations needed"
    }
  ];

  const workflows = [
    {
      name: "Cluster Keywords",
      description: "Group related keywords using AI clustering algorithms",
      category: "Text Analysis",
      cost: "~0.1 credits"
    },
    {
      name: "Sentiment Analysis",
      description: "Analyze emotional tone and sentiment in text content",
      category: "NLP",
      cost: "~0.05 credits"
    },
    {
      name: "Data Extraction",
      description: "Extract structured data from unstructured text",
      category: "Processing",
      cost: "~0.2 credits"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Book className="w-4 h-4 mr-2" />
            Documentation
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Getting Started with Front&
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how to automate your tasks with AI-powered workflows. 
            No coding experience required.
          </p>
        </div>

        <Tabs defaultValue="quickstart" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart" className="space-y-8">
            {/* Quick Start Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Quick Start Guide
                </CardTitle>
                <CardDescription>
                  Get up and running with Front& in just a few minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {quickStart.map((item) => (
                    <div key={item.step} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-gray-600 mb-3">{item.description}</p>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={item.link}>
                            {item.action}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
                <CardDescription>
                  What makes Front& the best choice for workflow automation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Popular Workflows</CardTitle>
                <CardDescription>
                  Explore the most commonly used workflows in our library
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.map((workflow, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                        <Badge variant="outline">{workflow.category}</Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{workflow.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-primary-600 font-medium">{workflow.cost}</span>
                        <Button size="sm" asChild>
                          <Link to="/flows">
                            Try Now
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How Workflows Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Settings className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Configure</h3>
                    <p className="text-sm text-gray-600">Fill in the workflow parameters with your data</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Play className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Execute</h3>
                    <p className="text-sm text-gray-600">Click run and watch the AI process your request</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Results</h3>
                    <p className="text-sm text-gray-600">Get your processed results ready to download</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Credit System</CardTitle>
                <CardDescription>
                  Understand how our transparent pricing works
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Free Plan</h3>
                    <p className="text-3xl font-bold text-primary-600 mb-2">100</p>
                    <p className="text-sm text-gray-600">Free credits to start</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Pro Plan</h3>
                    <p className="text-3xl font-bold text-primary-600 mb-2">$25</p>
                    <p className="text-sm text-gray-600">500 credits/month</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Enterprise</h3>
                    <p className="text-3xl font-bold text-primary-600 mb-2">$99</p>
                    <p className="text-sm text-gray-600">2,500 credits/month</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">How Credits Work</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Each workflow execution costs a small number of credits</li>
                    <li>• Cost depends on the complexity and AI models used</li>
                    <li>• See exact cost before running any workflow</li>
                    <li>• Unused credits don't expire within your billing cycle</li>
                  </ul>
                </div>

                <Button asChild>
                  <Link to="/billing">
                    View Detailed Pricing
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  API Reference
                </CardTitle>
                <CardDescription>
                  Integrate Front& workflows into your applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Coming Soon</h4>
                  <p className="text-gray-600 mb-4">
                    We're working on a comprehensive API that will allow you to:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li>• Execute workflows programmatically</li>
                    <li>• Integrate with your existing applications</li>
                    <li>• Build custom workflow automation</li>
                    <li>• Access real-time execution status</li>
                  </ul>
                  <Badge variant="secondary">
                    API Beta - Q2 2024
                  </Badge>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Example Usage (Preview)</h4>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{`# Execute a workflow via API
curl -X POST https://api.fronta.dev/v1/workflows/run \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflow_id": "cluster-keywords",
    "inputs": {
      "keywords": "marketing, advertising, promotion",
      "num_clusters": 3
    }
  }'`}
                  </pre>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" asChild>
                    <a href="mailto:support@fronta.dev">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Request API Access
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/flows">
                      Try Workflows First
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Automating?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of users who are already saving time with AI workflows
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">
                Get Started Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/flows">
                Browse Workflows
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation; 
 
 