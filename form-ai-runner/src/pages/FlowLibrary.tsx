
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Search, Filter, Star, TrendingUp, Clock, DollarSign } from "lucide-react";

const FlowLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");

  const flows = [
    {
      id: "cluster-keywords",
      name: "Cluster Keywords",
      description: "Automatically group and categorize keywords using AI clustering algorithms",
      category: "Text Analysis",
      author: "CLOSED AI Team",
      popularity: 4.8,
      executions: 12500,
      avgCost: 0.05,
      avgTime: "2.3s",
      tags: ["clustering", "keywords", "nlp"]
    },
    {
      id: "sentiment-analysis",
      name: "Sentiment Analysis",
      description: "Analyze text sentiment with detailed emotional breakdown and confidence scores",
      category: "NLP",
      author: "DataScience Corp",
      popularity: 4.9,
      executions: 18700,
      avgCost: 0.03,
      avgTime: "1.8s",
      tags: ["sentiment", "emotion", "text"]
    },
    {
      id: "image-to-text",
      name: "Image to Text",
      description: "Extract and analyze text from images with OCR and content understanding",
      category: "Vision",
      author: "AI Vision Labs",
      popularity: 4.7,
      executions: 8900,
      avgCost: 0.08,
      avgTime: "3.1s",
      tags: ["ocr", "vision", "extraction"]
    },
    {
      id: "summarize-content",
      name: "Content Summarizer",
      description: "Generate concise summaries of long-form content with key point extraction",
      category: "Text Analysis",
      author: "TextAI Inc",
      popularity: 4.6,
      executions: 15200,
      avgCost: 0.04,
      avgTime: "2.7s",
      tags: ["summary", "content", "extraction"]
    },
    {
      id: "translate-text",
      name: "Multi-Language Translator",
      description: "Translate text between 100+ languages with context preservation",
      category: "Translation",
      author: "GlobalAI",
      popularity: 4.8,
      executions: 22100,
      avgCost: 0.02,
      avgTime: "1.5s",
      tags: ["translation", "languages", "i18n"]
    },
    {
      id: "code-review",
      name: "AI Code Review",
      description: "Automated code review with bug detection and optimization suggestions",
      category: "Development",
      author: "DevTools AI",
      popularity: 4.5,
      executions: 6800,
      avgCost: 0.12,
      avgTime: "4.2s",
      tags: ["code", "review", "bugs"]
    }
  ];

  const categories = [
    "all",
    "Text Analysis",
    "NLP",
    "Vision",
    "Translation",
    "Development"
  ];

  const filteredFlows = flows
    .filter(flow => {
      const matchesSearch = flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           flow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           flow.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === "all" || flow.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return b.popularity - a.popularity;
        case "executions":
          return b.executions - a.executions;
        case "cost":
          return a.avgCost - b.avgCost;
        case "speed":
          return parseFloat(a.avgTime) - parseFloat(b.avgTime);
        default:
          return 0;
      }
    });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Flow Library</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover and run powerful AI workflows created by the community
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search flows, descriptions, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full lg:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Most Popular</SelectItem>
            <SelectItem value="executions">Most Used</SelectItem>
            <SelectItem value="cost">Lowest Cost</SelectItem>
            <SelectItem value="speed">Fastest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredFlows.length} of {flows.length} flows
        </p>
      </div>

      {/* Flow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFlows.map((flow) => (
          <Card key={flow.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary">{flow.category}</Badge>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {flow.popularity}
                </div>
              </div>
              <CardTitle className="group-hover:text-blue-600 transition-colors">
                {flow.name}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {flow.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {flow.executions.toLocaleString()}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-3 h-3 mr-1" />
                    {flow.avgTime}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-3 h-3 mr-1" />
                    ${flow.avgCost.toFixed(3)}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {flow.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {flow.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{flow.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Author */}
                <p className="text-xs text-gray-500">
                  by {flow.author}
                </p>

                {/* Action */}
                <Button size="sm" asChild className="w-full">
                  <Link to={`/flows/${flow.id}`}>
                    Run Flow
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results */}
      {filteredFlows.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No flows found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button variant="outline" onClick={() => {
            setSearchQuery("");
            setCategoryFilter("all");
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default FlowLibrary;
