
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Code, Gauge, Shield, Github, Star, Sparkles } from "lucide-react";
import PromptDiscovery from "@/components/PromptDiscovery";

const Index = () => {
  const featuredFlows = [
    {
      id: "cluster-keywords",
      name: "Keyword Clustering",
      description: "Group and categorize keywords automatically",
      category: "Text Analysis",
      estimatedCost: "0.5 credits",
      popularity: 4.8,
      creator: "CLOSED AI Team"
    },
    {
      id: "sentiment-analysis", 
      name: "Sentiment Analysis",
      description: "Analyze emotional tone in text",
      category: "NLP",
      estimatedCost: "0.3 credits",
      popularity: 4.9,
      creator: "AI Labs"
    },
    {
      id: "data-extraction",
      name: "Data Extraction",
      description: "Extract structured data from documents",
      category: "Processing",
      estimatedCost: "0.8 credits",
      popularity: 4.7,
      creator: "DataPro"
    }
  ];

  const stats = [
    { value: "1,000+", label: "Workflows" },
    { value: "50k+", label: "Executions" },
    { value: "2k+", label: "Creators" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <Badge 
              variant="secondary" 
              className="mb-8 bg-gray-100 text-gray-900 border border-gray-200 px-4 py-2"
            >
              <Github className="w-4 h-4 mr-2" />
              World's First Open Source Workflow OS
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              The OS for
              <span className="text-primary-500 block">Workflows</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Tell AI what you need in plain English. Get instant results through powerful workflows 
              created by the community. No coding required.
            </p>
          </div>

          {/* Prompt Discovery */}
          <div className="max-w-5xl mx-auto mb-20">
            <PromptDiscovery />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Workflows */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Workflows
            </h2>
            <p className="text-xl text-gray-600">
              Discover popular workflows from our creator community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredFlows.map((flow) => (
              <Card 
                key={flow.id} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 bg-white"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <Badge 
                      variant="secondary" 
                      className="bg-gray-100 text-gray-700 text-xs"
                    >
                      {flow.category}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="w-4 h-4 fill-primary-500 text-primary-500 mr-1" />
                      {flow.popularity}
                    </div>
                  </div>
                  <CardTitle className="text-xl text-gray-900 mb-2">
                    {flow.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">
                    {flow.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-500">
                      by <span className="font-medium text-gray-700">{flow.creator}</span>
                    </div>
                    <div className="text-sm font-medium text-primary-600">
                      {flow.estimatedCost}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                    asChild
                  >
                    <Link to={`/flows/${flow.id}`}>
                      Try Workflow
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              asChild
            >
              <Link to="/flows">
                Explore All Workflows
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, powerful, and accessible to everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Describe Your Task
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Simply tell us what you want to accomplish in plain English. 
                No technical knowledge required.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                AI Finds the Perfect Workflow
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI matches your request with the best workflow from our 
                community of creators.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gauge className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Get Instant Results
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Execute your workflow instantly with transparent pricing 
                and real-time progress tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Join thousands of users automating their tasks with AI-powered workflows
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 text-lg"
              asChild
            >
              <Link to="/auth">
                Get Started Free
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg"
              asChild
            >
              <Link to="/docs">
                View Documentation
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
