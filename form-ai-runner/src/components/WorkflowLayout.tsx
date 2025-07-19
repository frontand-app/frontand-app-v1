import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Clock, User, ArrowRight } from 'lucide-react';

interface WorkflowLayoutProps {
  workflow: {
    name: string;
    description: string;
    category: string;
    creator: string;
    rating: number;
    estimatedTime: string;
    estimatedCost: string;
  };
  inputSection: React.ReactNode;
  outputSection: React.ReactNode;
  isProcessing?: boolean;
}

const WorkflowLayout: React.FC<WorkflowLayoutProps> = ({
  workflow,
  inputSection,
  outputSection,
  isProcessing = false
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Workflow Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-primary-100 text-primary-700">
                {workflow.category}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {workflow.rating}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {workflow.estimatedTime}
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {workflow.creator}
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {workflow.name}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {workflow.description}
          </p>
          
          <div className="text-sm text-primary-600 font-medium">
            Estimated cost: {workflow.estimatedCost}
          </div>
        </div>

        {/* Main Layout - Responsive Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Input Section */}
          <Card className="flex flex-col border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                Input
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 p-6">
              {inputSection}
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="flex flex-col border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Output
                {isProcessing && (
                  <div className="ml-2 flex items-center gap-1 text-sm text-primary-600">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    Processing...
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 p-6">
              {outputSection}
            </CardContent>
          </Card>
        </div>

        {/* Processing Arrow - Mobile Only */}
        <div className="xl:hidden flex items-center justify-center py-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isProcessing 
              ? 'bg-primary-500 animate-pulse' 
              : 'bg-gray-200'
          }`}>
            <ArrowRight className={`w-5 h-5 rotate-90 xl:rotate-0 ${
              isProcessing ? 'text-white' : 'text-gray-600'
            }`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowLayout; 