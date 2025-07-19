import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Github, Star, Users, Zap, Heart, ArrowRight } from 'lucide-react';

const About = () => {
  const stats = [
    { value: "1,000+", label: "Workflows", icon: <Zap className="w-5 h-5" /> },
    { value: "50k+", label: "Executions", icon: <Star className="w-5 h-5" /> },
    { value: "2k+", label: "Creators", icon: <Users className="w-5 h-5" /> },
    { value: "Open Source", label: "Always Free", icon: <Heart className="w-5 h-5" /> }
  ];

  const team = [
    {
      name: "AI-Powered Platform",
      role: "Built with intelligence at its core",
      description: "Every workflow runs on cutting-edge AI models"
    },
    {
      name: "Community-Driven",
      role: "Created by developers, for developers",
      description: "Open source platform with global contributors"
    },
    {
      name: "Production-Ready",
      role: "Enterprise-grade reliability",
      description: "Scalable infrastructure for any workload"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6">
            <Github className="w-4 h-4 mr-2" />
            Open Source Project
          </Badge>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About Front&
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Front& is the world's first open source workflow operating system. 
            We're building the infrastructure that makes AI automation accessible to everyone.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-3 text-primary-600">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Our Mission</CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto">
              Democratizing AI workflow automation for creators, developers, and businesses worldwide
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Why Front& Exists</h3>
                <p className="text-gray-600 leading-relaxed">
                  AI automation shouldn't require a team of engineers. We believe every creator, 
                  marketer, analyst, and entrepreneur should have access to powerful AI workflows 
                  without writing a single line of code.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">How We're Different</h3>
                <p className="text-gray-600 leading-relaxed">
                  Unlike closed platforms, Front& is completely open source. Our community-driven 
                  approach means better workflows, transparent pricing, and no vendor lock-in. 
                  You own your data and your automations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What Drives Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                  <CardDescription className="text-primary-600 font-medium">
                    {item.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology */}
        <Card className="mb-16 bg-gradient-to-r from-primary-50 to-blue-50">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Built on Modern Technology
                </h3>
                <p className="text-gray-600 mb-6">
                  Our platform leverages the latest in cloud infrastructure, 
                  AI models, and developer tools to provide a seamless experience.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="outline">React</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">Python</Badge>
                  <Badge variant="outline">Docker</Badge>
                  <Badge variant="outline">Supabase</Badge>
                  <Badge variant="outline">Modal</Badge>
                </div>
                <Button asChild>
                  <a 
                    href="https://github.com/closedai/closedai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    View Source Code
                  </a>
                </Button>
              </div>
              <div className="text-center">
                <div className="inline-block p-8 bg-white rounded-2xl shadow-lg">
                  <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">F&</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Open Source</h4>
                  <p className="text-sm text-gray-600">MIT Licensed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center bg-gray-900 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the Movement
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Help us build the future of AI workflow automation. 
            Contribute, create, and collaborate with our global community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary-500 hover:bg-primary-600" asChild>
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white text-gray-900" asChild>
              <a 
                href="https://github.com/closedai/closedai" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4 mr-2" />
                Contribute on GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 