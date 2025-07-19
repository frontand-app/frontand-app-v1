import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SuggestedWorkflow {
  id: string;
  name: string;
  description: string;
  confidence: number;
  autoFilledInputs: Record<string, any>;
  reasoning: string;
  category: string;
  estimatedCost: string;
}

const PromptDiscovery = () => {
  const [prompt, setPrompt] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedWorkflow[]>([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!prompt.trim()) return;
    
    setIsSearching(true);
    
    // Mock AI-powered workflow discovery
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock suggestions based on prompt
    const mockSuggestions: SuggestedWorkflow[] = [];
    
    if (prompt.toLowerCase().includes("keyword") || prompt.toLowerCase().includes("organize") || prompt.toLowerCase().includes("group")) {
      mockSuggestions.push({
        id: "cluster-keywords",
        name: "Keyword Clustering",
        description: "Group related keywords together automatically",
        confidence: 0.95,
        category: "Text Analysis",
        estimatedCost: "0.5 credits",
        autoFilledInputs: {
          text: prompt.includes("keyword") ? extractKeywordsFromPrompt(prompt) : "",
          num_clusters: 5
        },
        reasoning: "Perfect match for organizing and grouping keywords using AI clustering"
      });
    }
    
    if (prompt.toLowerCase().includes("sentiment") || prompt.toLowerCase().includes("feel") || prompt.toLowerCase().includes("emotion")) {
      mockSuggestions.push({
        id: "sentiment-analysis", 
        name: "Sentiment Analysis",
        description: "Analyze the emotional tone and sentiment in text",
        confidence: 0.88,
        category: "NLP",
        estimatedCost: "0.3 credits",
        autoFilledInputs: {
          text: extractTextFromPrompt(prompt)
        },
        reasoning: "Ideal for understanding emotional tone and sentiment in your text"
      });
    }
    
    if (prompt.toLowerCase().includes("data") || prompt.toLowerCase().includes("extract") || prompt.toLowerCase().includes("parse")) {
      mockSuggestions.push({
        id: "data-extraction",
        name: "Data Extraction",
        description: "Extract structured data from documents and text",
        confidence: 0.82,
        category: "Processing",
        estimatedCost: "0.8 credits",
        autoFilledInputs: {
          text: prompt
        },
        reasoning: "Great for extracting and structuring data from unformatted text"
      });
    }
    
    // Default suggestion for any prompt
    if (mockSuggestions.length === 0) {
      mockSuggestions.push({
        id: "cluster-keywords",
        name: "Text Processing",
        description: "General text analysis and processing",
        confidence: 0.65,
        category: "Text Analysis", 
        estimatedCost: "0.5 credits",
        autoFilledInputs: {
          text: prompt
        },
        reasoning: "General text processing workflow that can help with your request"
      });
    }
    
    setSuggestions(mockSuggestions);
    setIsSearching(false);
  };

  const extractKeywordsFromPrompt = (prompt: string): string => {
    // Simple keyword extraction logic
    const keywords = prompt.split(/[,\n]/).map(k => k.trim()).filter(k => k.length > 0);
    return keywords.join('\n');
  };

  const extractTextFromPrompt = (prompt: string): string => {
    // Extract the main text content from the prompt
    return prompt.replace(/^(analyze|sentiment|feeling|emotion|check)\s+/i, '').trim();
  };

  const handleUseWorkflow = (workflow: SuggestedWorkflow) => {
    // Navigate to the workflow with pre-filled inputs
    navigate(`/flows/${workflow.id}`, { 
      state: { 
        autoFilledInputs: workflow.autoFilledInputs,
        originalPrompt: prompt
      }
    });
  };

  const examplePrompts = [
    "Group these keywords: marketing, social media, advertising",
    "Analyze sentiment in customer reviews",
    "Extract contact information from documents",
    "Summarize this long text into key points"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Prompt Input */}
      <Card className="mb-8 shadow-sm border border-gray-200 bg-white">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              What do you want to accomplish?
            </h3>
            <p className="text-gray-600">
              Describe your task in plain English - I'll find the perfect workflow
            </p>
          </div>
          
          <div className="flex gap-3 mb-6">
            <Input
              placeholder="e.g., I need to organize these keywords: marketing, social media, content creation..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="text-base p-4 h-14 border-gray-300 focus:border-primary-500 focus:ring-primary-500"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !prompt.trim()}
              size="lg"
              className="px-8 h-14 bg-primary-500 hover:bg-primary-600 text-white"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Finding...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Find Workflow
                </>
              )}
            </Button>
          </div>
          
          {/* Example Prompts */}
          <div>
            <p className="text-sm text-gray-600 mb-3">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(example)}
                  className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary-500"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Perfect matches for you:
          </h3>
          {suggestions.map((workflow) => (
            <Card key={workflow.id} className="hover:shadow-md transition-all duration-200 border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{workflow.name}</h4>
                      <Badge 
                        variant="secondary"
                        className="bg-primary-100 text-primary-700 text-xs"
                      >
                        {workflow.category}
                      </Badge>
                      <Badge 
                        variant={workflow.confidence > 0.9 ? "default" : "secondary"}
                        className={`text-xs ${workflow.confidence > 0.9 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {Math.round(workflow.confidence * 100)}% match
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">
                      {workflow.description}
                    </p>
                    <p className="text-sm text-primary-600 bg-primary-50 p-3 rounded-lg border border-primary-200">
                      💡 {workflow.reasoning}
                    </p>
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-sm font-medium text-primary-600 mb-1">
                      {workflow.estimatedCost}
                    </div>
                    <div className="text-xs text-gray-500">
                      estimated cost
                    </div>
                  </div>
                </div>
                
                {Object.keys(workflow.autoFilledInputs).length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                    <p className="font-medium text-gray-700 mb-2 text-sm">
                      I'll pre-fill these inputs for you:
                    </p>
                    <div className="space-y-1">
                      {Object.entries(workflow.autoFilledInputs).map(([key, value]) => (
                        <div key={key} className="flex text-sm">
                          <span className="font-medium text-gray-600 capitalize w-24">
                            {key.replace('_', ' ')}:
                          </span>
                          <span className="text-gray-800 truncate">
                            {typeof value === 'string' && value.length > 50 
                              ? value.substring(0, 50) + '...' 
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={() => handleUseWorkflow(workflow)}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                  size="lg"
                >
                  Use This Workflow
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptDiscovery; 