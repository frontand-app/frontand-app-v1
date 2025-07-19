import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { GitFork, Users, Lock, Eye, Star, Heart } from "lucide-react";

interface ForkFlowProps {
  originalFlow: any;
  onFork: (forkData: any) => void;
  onCancel: () => void;
}

const ForkFlow = ({ originalFlow, onFork, onCancel }: ForkFlowProps) => {
  const [forkData, setForkData] = useState({
    name: `${originalFlow.name} (My Version)`,
    description: originalFlow.description,
    category: originalFlow.category,
    isPublic: false,
    attribution: 'inspired',
    modifications: ''
  });

  const handleSubmit = () => {
    onFork({
      ...forkData,
      originalFlowId: originalFlow.id,
      originalAuthor: originalFlow.author,
      inputs: originalFlow.inputs, // Start with same inputs, user can modify later
      outputs: originalFlow.outputs,
      runtime: originalFlow.runtime
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitFork className="w-5 h-5" />
            Fork "{originalFlow.name}"
          </CardTitle>
          <CardDescription>
            Create your own version of this workflow. Perfect for customizing it to your specific needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Original Flow Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Original Workflow</h3>
              <Badge variant="secondary">{originalFlow.category}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{originalFlow.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                by {originalFlow.author}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {originalFlow.metadata?.popularity_score || 4.5}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {originalFlow.metadata?.execution_count || 0} runs
              </span>
            </div>
          </div>

          {/* Fork Configuration */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Name your fork
              </label>
              <Input
                value={forkData.name}
                onChange={(e) => setForkData({...forkData, name: e.target.value})}
                placeholder="Give your workflow a unique name"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Description
              </label>
              <Textarea
                value={forkData.description}
                onChange={(e) => setForkData({...forkData, description: e.target.value})}
                placeholder="Describe what makes your version special"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Category
              </label>
              <Select
                value={forkData.category}
                onValueChange={(value) => setForkData({...forkData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Text Analysis">Text Analysis</SelectItem>
                  <SelectItem value="NLP">NLP</SelectItem>
                  <SelectItem value="Vision">Vision</SelectItem>
                  <SelectItem value="Translation">Translation</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                What changes are you planning?
              </label>
              <Textarea
                value={forkData.modifications}
                onChange={(e) => setForkData({...forkData, modifications: e.target.value})}
                placeholder="e.g., Different parameters, additional steps, improved prompts..."
                rows={3}
              />
            </div>
          </div>

          {/* Visibility & Attribution */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">
                  Make this workflow public
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Others can discover and use your improved version
                </p>
              </div>
              <Switch
                checked={forkData.isPublic}
                onCheckedChange={(checked) => setForkData({...forkData, isPublic: checked})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Attribution Style
              </label>
              <Select
                value={forkData.attribution}
                onValueChange={(value) => setForkData({...forkData, attribution: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspired">Inspired by {originalFlow.author}</SelectItem>
                  <SelectItem value="remix">Remixed from {originalFlow.author}</SelectItem>
                  <SelectItem value="improved">Improved version of {originalFlow.author}'s work</SelectItem>
                  <SelectItem value="custom">Custom attribution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Preview:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{forkData.name}</span>
                  <Badge variant="outline">{forkData.category}</Badge>
                  {forkData.isPublic ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{forkData.description}</p>
                <p className="text-xs text-gray-500">
                  {forkData.attribution === 'inspired' && `Inspired by ${originalFlow.author}`}
                  {forkData.attribution === 'remix' && `Remixed from ${originalFlow.author}`}
                  {forkData.attribution === 'improved' && `Improved version of ${originalFlow.author}'s work`}
                  {forkData.attribution === 'custom' && 'Custom attribution'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              <GitFork className="w-4 h-4 mr-2" />
              Create Fork
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForkFlow; 