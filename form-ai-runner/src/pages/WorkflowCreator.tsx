import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  X, 
  Code, 
  Save, 
  Play, 
  FileText, 
  Settings,
  Database,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Coins
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { parseCSVFile, formatCSVForModal, validateCSVFile } from '@/lib/csvParser';



interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  tags: string[];
  runtime: {
    endpoint: string;
    auth_method?: string;
    auth_value?: string;
    curl_example: string;
    post_response: string;
    get_curl: string;
    get_response: string;
  };
  meta: {
    cost_estimate: {
      base_cost: number;
    };
  };
}

const WorkflowCreator = () => {
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<WorkflowDefinition>({
    id: '',
    name: '',
    version: '1.0.0',
    description: '',
    category: '',
    tags: [],
    runtime: {
      endpoint: '',
      auth_method: 'none',
      auth_value: '',
      curl_example: '',
      post_response: '',
      get_curl: '',
      get_response: ''
    },
    meta: {
      cost_estimate: {
        base_cost: 0.01
      }
    }
  });
  

  
  const [newTag, setNewTag] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const categories = [
    'nlp', 'vision', 'audio', 'data-processing', 'automation', 'analysis', 'generation'
  ];

  const generateWorkflowId = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 64);
  };



  const addTag = () => {
    if (newTag && !workflow.tags.includes(newTag)) {
      setWorkflow(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setWorkflow(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const validateWorkflow = (): boolean => {
    const errors: string[] = [];

    if (!workflow.name) errors.push('Workflow name is required');
    if (!workflow.description) errors.push('Description is required');
    if (!workflow.category) errors.push('Category is required');
    // Validate curl and response examples
    if (!workflow.runtime.curl_example) errors.push('POST curl example is required');
    if (!workflow.runtime.post_response) errors.push('POST response example is required');
    if (!workflow.runtime.get_curl) errors.push('GET curl example is required');
    if (!workflow.runtime.get_response) errors.push('GET response example is required');
    
    // Validate response examples are valid JSON
    try {
      if (workflow.runtime.post_response) {
        JSON.parse(workflow.runtime.post_response);
      }
    } catch {
      errors.push('POST response example must be valid JSON');
    }
    
    try {
      if (workflow.runtime.get_response) {
        JSON.parse(workflow.runtime.get_response);
      }
    } catch {
      errors.push('GET response example must be valid JSON');
    }
    
    // Extract endpoint from curl if not provided separately
    if (!workflow.runtime.endpoint && workflow.runtime.curl_example) {
      const urlMatch = workflow.runtime.curl_example.match(/["']([^"']*\/\/[^"']+)["']/);
      if (!urlMatch) {
        errors.push('Could not extract endpoint URL from curl command');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const saveWorkflow = () => {
    if (!validateWorkflow()) return;

    const workflowData = {
      ...workflow,
      id: generateWorkflowId(workflow.name)
    };

    // Here you would save to your backend
    console.log('Saving workflow:', workflowData);
    
    // Show success message and redirect
    alert('Workflow saved successfully!');
    navigate('/creators');
  };

  const estimateCost = async () => {
    if (!workflow.runtime.curl_example) {
      alert('Please provide a POST curl example first');
      return;
    }

    try {
      // For async workflows, cost estimation is more complex
      // We'll estimate based on typical job submission overhead + estimated processing time
      const baseJobCost = 0.01; // Cost to submit and track a job
      const estimatedProcessingCost = 0.05; // Average cost for AI processing
      const totalEstimated = baseJobCost + estimatedProcessingCost;
      
      setWorkflow(prev => ({
        ...prev,
        meta: {
          ...prev.meta,
          cost_estimate: {
            base_cost: totalEstimated
          }
        }
      }));

      alert(`💰 Async Workflow Cost Estimate:

📝 Job Submission: ${baseJobCost.toFixed(3)} credits
🤖 Processing (estimated): ${estimatedProcessingCost.toFixed(3)} credits
📊 Result Polling: Included

💵 Total Estimated: ${totalEstimated.toFixed(3)} credits

ℹ️ Actual cost depends on:
• AI model used
• Processing complexity  
• Data size
• Execution time

💡 Tip: Test with real data for accurate cost measurement!`);
      
    } catch (error) {
      alert(`❌ Cost estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const previewResults = () => {
    if (!workflow.runtime.get_response) {
      alert('Please provide a GET response example first');
      return;
    }

    try {
      const resultData = JSON.parse(workflow.runtime.get_response);
      let resultPreview = 'Result Format Preview:\n\n';
      
      // Check if the result contains table data
      const result = resultData.result || resultData;
      let hasTableData = false;
      
      if (Array.isArray(result)) {
        hasTableData = true;
        resultPreview += '📊 TABLE FORMAT - Will display in interactive table with:\n';
        resultPreview += '   • Search and filter functionality\n';
        resultPreview += '   • Column sorting\n';
        resultPreview += '   • Export to CSV/JSON options\n\n';
      } else if (result && typeof result === 'object' && (result.headers || result.rows)) {
        hasTableData = true;
        resultPreview += '📊 CSV-LIKE FORMAT - Will display in table with:\n';
        resultPreview += '   • Automatic column detection\n';
        resultPreview += '   • Data type formatting\n';
        resultPreview += '   • Export options\n\n';
      }
      
      resultPreview += '📥 DOWNLOAD OPTIONS:\n';
      resultPreview += '   • JSON Download - Raw API response\n';
      resultPreview += '   • CSV Download - Structured data (if tabular)\n';
      if (hasTableData) {
        resultPreview += '   • Excel Export - Formatted spreadsheet\n';
      }
      resultPreview += '\n';
      
      resultPreview += '🖥️ UI DISPLAY:\n';
      if (hasTableData) {
        resultPreview += '   • Interactive table with search/sort/filter\n';
        resultPreview += '   • Pagination for large datasets\n';
        resultPreview += '   • Column type detection (text, number, date)\n';
      } else {
        resultPreview += '   • JSON viewer with syntax highlighting\n';
        resultPreview += '   • Collapsible object/array sections\n';
      }
      
      alert(resultPreview);
    } catch (error) {
      alert(`Could not parse GET response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testAsync = async () => {
    if (!workflow.runtime.curl_example || !workflow.runtime.get_curl) {
      alert('Please provide both POST and GET curl examples');
      return;
    }

    try {
      alert('🚀 Testing Async Workflow...\n\n1. Submitting job via POST...');
      
      // Test POST submission
      const mockData = generateMockDataFromCurl(workflow.runtime.curl_example);
      const postUrl = extractUrlFromCurl(workflow.runtime.curl_example);
      const postAuth = extractAuthFromCurl(workflow.runtime.curl_example);
      
      const postResponse = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...postAuth
        },
        body: JSON.stringify(mockData)
      });
      
      if (!postResponse.ok) {
        alert(`❌ POST failed: ${postResponse.status} ${postResponse.statusText}`);
        return;
      }
      
      const postResult = await postResponse.json();
      alert(`✅ Job submitted successfully!\n\nResponse: ${JSON.stringify(postResult, null, 2)}\n\n2. Now testing GET endpoint...`);
      
      // Test GET endpoint
      const getUrl = extractUrlFromCurl(workflow.runtime.get_curl);
      const getAuth = extractAuthFromCurl(workflow.runtime.get_curl);
      
      const getResponse = await fetch(getUrl, {
        method: 'GET',
        headers: {
          ...getAuth
        }
      });
      
      if (!getResponse.ok) {
        alert(`⚠️ GET test returned: ${getResponse.status} ${getResponse.statusText}\n(This is normal if job doesn't exist yet)`);
        return;
      }
      
      const getResult = await getResponse.json();
      alert(`✅ Async flow test complete!\n\nPOST → Job submitted\nGET → ${JSON.stringify(getResult, null, 2)}\n\n🎉 Your async workflow is working!`);
      
    } catch (error) {
      alert(`❌ Async test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const extractUrlFromCurl = (curlCommand: string): string => {
    const urlMatch = curlCommand.match(/["']([^"']*\/\/[^"']+)["']/);
    return urlMatch ? urlMatch[1] : '';
  };

  const extractAuthFromCurl = (curlCommand: string): Record<string, string> => {
    const headers: Record<string, string> = {};
    
    // Extract Authorization header
    const authMatch = curlCommand.match(/-H\s*["']Authorization:\s*([^"']+)["']/i);
    if (authMatch) {
      headers['Authorization'] = authMatch[1];
    }
    
    // Extract other headers
    const headerMatches = curlCommand.matchAll(/-H\s*["']([^:]+):\s*([^"']+)["']/gi);
    for (const match of headerMatches) {
      if (match[1].toLowerCase() !== 'authorization') {
        headers[match[1]] = match[2];
      }
    }
    
    return headers;
  };

  const previewForm = () => {
    if (!workflow.runtime.curl_example) {
      alert('Please provide a curl example first');
      return;
    }

    try {
      // Extract JSON data from curl command
      const dataMatch = workflow.runtime.curl_example.match(/-d\s*['"]({.*})['"]|--data\s*['"]({.*})['"]|--data-raw\s*['"]({.*})['"]/)?.slice(1).find(Boolean);
      
      if (!dataMatch) {
        alert('Could not extract JSON data from curl command. Make sure you have -d \'{"key": "value"}\' in your curl.');
        return;
      }

      const requestData = JSON.parse(dataMatch);
      let formPreview = 'Form Preview (based on your curl example):\n\n';
      
      Object.keys(requestData).forEach(key => {
        const value = requestData[key];
        
        if (key === 'csv_data' || (typeof value === 'object' && value?.headers && value?.rows)) {
          formPreview += `📊 ${key}: CSV File Upload\n`;
          formPreview += `   → Automatically parsed to: {headers: [...], rows: [[...]]}\n`;
        } else if (typeof value === 'boolean') {
          formPreview += `☑️ ${key}: Checkbox (${value})\n`;
        } else if (typeof value === 'number') {
          formPreview += `🔢 ${key}: Number Input (${value})\n`;
        } else if (Array.isArray(value)) {
          formPreview += `📋 ${key}: Multi-select or Array Input\n`;
        } else if (typeof value === 'string' && value.length > 50) {
          formPreview += `📝 ${key}: Text Area\n`;
        } else {
          formPreview += `✏️ ${key}: Text Input (${value})\n`;
        }
        formPreview += '\n';
      });
      
      formPreview += '\nCSV files will be automatically parsed and sent as structured JSON data to your Modal endpoint.';
      
      alert(formPreview);
    } catch (error) {
      alert(`Could not parse curl command: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateMockDataFromCurl = (curlCommand: string) => {
    try {
      // Extract JSON data from curl command
      const dataMatch = curlCommand.match(/-d\s*['"]({.*})['"]|--data\s*['"]({.*})['"]|--data-raw\s*['"]({.*})['"]/)?.slice(1).find(Boolean);
      
      if (!dataMatch) {
        // Return basic mock data if we can't parse curl
        return { 
          text: 'test_input',
          csv_data: {
            headers: ['Name', 'Age', 'City'],
            rows: [
              ['John Doe', 25, 'New York'],
              ['Jane Smith', 30, 'Los Angeles'],
              ['Bob Johnson', 35, 'Chicago']
            ],
            meta: {
              total_rows: 3,
              total_columns: 3,
              delimiter: ','
            }
          }
        };
      }
      
      const mockData = JSON.parse(dataMatch);
      
      // Enhance CSV data fields if they exist
      Object.keys(mockData).forEach(key => {
        if (key === 'csv_data' || (typeof mockData[key] === 'object' && mockData[key]?.headers && mockData[key]?.rows)) {
          mockData[key] = {
            headers: ['Name', 'Age', 'City'],
            rows: [
              ['John Doe', 25, 'New York'],
              ['Jane Smith', 30, 'Los Angeles'],
              ['Bob Johnson', 35, 'Chicago']
            ],
            meta: {
              total_rows: 3,
              total_columns: 3,
              delimiter: ','
            }
          };
        }
      });
      
      return mockData;
    } catch {
      return { 
        text: 'test_input',
        csv_data: {
          headers: ['Name', 'Age', 'City'],
          rows: [['John', 25, 'NYC'], ['Jane', 30, 'LA']],
          meta: { total_rows: 2, total_columns: 3, delimiter: ',' }
        }
      };
    }
  };

  const testWorkflow = () => {
    if (!validateWorkflow()) return;

    const workflowId = generateWorkflowId(workflow.name);
    navigate(`/flows/${workflowId}`, { 
      state: { 
        testMode: true, 
        workflowDefinition: workflow 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Workflow</h1>
          <p className="text-gray-600">
            Design your AI workflow with a visual interface
          </p>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Card className="mb-6 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Please fix the following errors:</h3>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="runtime">Modal Connection</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Define the basic properties of your workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Workflow Name *</Label>
                    <Input
                      id="name"
                      value={workflow.name}
                      onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Awesome Workflow"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={workflow.version}
                      onChange={(e) => setWorkflow(prev => ({ ...prev, version: e.target.value }))}
                      placeholder="1.0.0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={workflow.description}
                    onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what your workflow does..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={workflow.category}
                    onValueChange={(value) => setWorkflow(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {workflow.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag..."
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag}>Add</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value="runtime" className="space-y-6">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Async Job Pattern (Recommended)</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• <strong>POST:</strong> Submit job → Get job ID immediately (no timeout issues)</li>
                      <li>• <strong>GET:</strong> Poll for results every 10 minutes → Better UX with progress</li>
                      <li>• <strong>No Connection Limits:</strong> Works for long-running AI workflows</li>
                      <li>• <strong>Multiple Jobs:</strong> Users can submit multiple workflows concurrently</li>
                      <li>• <strong>Robust:</strong> Handles network issues and Modal auto-scaling gracefully</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Modal App Connection</CardTitle>
                <CardDescription>
                  Connect your existing Modal app endpoint
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Modal Endpoint URL *</Label>
                  <Input
                    id="endpoint"
                    value={workflow.runtime.endpoint || ''}
                    onChange={(e) => setWorkflow(prev => ({
                      ...prev,
                      runtime: { ...prev.runtime, endpoint: e.target.value }
                    }))}
                    placeholder="https://your-app--function-serve.modal.run"
                  />
                  <p className="text-xs text-gray-500">
                    Your Modal app's HTTP endpoint URL
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auth_method">Authentication</Label>
                  <Select
                    value={workflow.runtime.auth_method || 'none'}
                    onValueChange={(value) => setWorkflow(prev => ({
                      ...prev,
                      runtime: { ...prev.runtime, auth_method: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Authentication</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="custom">Custom Header</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {workflow.runtime.auth_method && workflow.runtime.auth_method !== 'none' && (
                  <div className="space-y-2">
                    <Label htmlFor="auth_value">
                      {workflow.runtime.auth_method === 'bearer' ? 'Bearer Token' :
                       workflow.runtime.auth_method === 'api_key' ? 'API Key' : 'Auth Header Value'}
                    </Label>
                    <Input
                      id="auth_value"
                      type="password"
                      value={workflow.runtime.auth_value || ''}
                      onChange={(e) => setWorkflow(prev => ({
                        ...prev,
                        runtime: { ...prev.runtime, auth_value: e.target.value }
                      }))}
                      placeholder={
                        workflow.runtime.auth_method === 'bearer' ? 'your-bearer-token' :
                        workflow.runtime.auth_method === 'api_key' ? 'your-api-key' : 'your-auth-value'
                      }
                    />
                  </div>
                )}

                                <div className="space-y-2">
                  <Label htmlFor="curl_example">POST Request - Submit Job (curl) *</Label>
                  <Textarea
                    id="curl_example"
                    value={workflow.runtime.curl_example || ''}
                    onChange={(e) => setWorkflow(prev => ({
                      ...prev,
                      runtime: { ...prev.runtime, curl_example: e.target.value }
                    }))}
                    placeholder={`curl -X POST "https://your-app--submit-job.modal.run" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-token" \\
  -d '{
    "text": "Hello world",
    "csv_data": {
      "headers": ["Name", "Age", "City"],
      "rows": [["John", 25, "NYC"], ["Jane", 30, "LA"]]
    },
    "model_choice": "gpt-4",
    "temperature": 0.7
  }'`}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    POST endpoint to submit workflow job (should return job ID immediately)
                  </p>
                  
                  {/* CSV Parsing Help */}
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <h5 className="text-sm font-medium text-blue-800 mb-2">
                      📊 CSV File Handling
                    </h5>
                    <div className="text-xs text-blue-700 space-y-1">
                                      <p><strong>Frontend Processing:</strong> CSV files are automatically parsed and sent as:</p>
                <code className="block bg-blue-100 p-1 rounded">{'"csv_data": {"headers": [...], "rows": [[...]]}'}</code>
                <p>Just include <code>csv_data</code> in your curl example above ↗️</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="post_response">POST Response - Job Submitted *</Label>
                  <Textarea
                    id="post_response"
                    value={workflow.runtime.post_response || ''}
                    onChange={(e) => setWorkflow(prev => ({
                      ...prev,
                      runtime: { ...prev.runtime, post_response: e.target.value }
                    }))}
                    placeholder={`{
  "job_id": "job_abc123",
  "status": "queued",
  "estimated_time": "5-10 minutes",
  "message": "Job submitted successfully"
}`}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    What your POST endpoint returns immediately (job ID for polling)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="get_curl">GET Request - Check Results (curl) *</Label>
                  <Textarea
                    id="get_curl"
                    value={workflow.runtime.get_curl || ''}
                    onChange={(e) => setWorkflow(prev => ({
                      ...prev,
                      runtime: { ...prev.runtime, get_curl: e.target.value }
                    }))}
                    placeholder={`curl -X GET "https://your-app--get-results.modal.run/job_abc123" \\
  -H "Authorization: Bearer your-token"`}
                    rows={3}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    GET endpoint to poll for job results (we'll poll every 10 minutes)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="get_response">GET Response - Final Results *</Label>
                  <Textarea
                    id="get_response"
                    value={workflow.runtime.get_response || ''}
                    onChange={(e) => setWorkflow(prev => ({
                      ...prev,
                      runtime: { ...prev.runtime, get_response: e.target.value }
                    }))}
                    placeholder={`{
  "job_id": "job_abc123",
  "status": "completed",
  "result": {
    "processed_text": "Your processed result here",
    "confidence": 0.95,
    "processing_time": 423.5
  },
  "completed_at": "2024-01-15T10:30:00Z"
}`}
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    What your GET endpoint returns when job is complete
                  </p>
                  
                  {/* Result Format Help */}
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                    <h5 className="text-sm font-medium text-green-800 mb-2">
                      📥 How Results Are Delivered to Users
                    </h5>
                    <div className="text-xs text-green-700 space-y-2">
                      <div>
                        <strong>🖥️ UI Display:</strong>
                        <div className="ml-3">
                          • Array data → Interactive table with search/sort/filter
                          <br />• Object data → JSON viewer with syntax highlighting
                          <br />• Mixed data → Smart format detection
                        </div>
                      </div>
                      <div>
                        <strong>📥 Download Options:</strong>
                        <div className="ml-3">
                          • <strong>JSON Download</strong> - Raw API response as .json file
                          <br />• <strong>CSV Export</strong> - Tabular data as .csv (if applicable)
                          <br />• <strong>Excel Export</strong> - Formatted .xlsx with styling
                        </div>
                      </div>
                      <div>
                        <strong>🔄 Auto-Detection:</strong>
                        <div className="ml-3">
                          • Table format: Arrays of objects → CSV + Excel export
                          <br />• Raw format: Single objects → JSON download only
                          <br />• Users get the most relevant export options
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => previewForm()}
                    disabled={!workflow.runtime.curl_example}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Preview Form
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => previewResults()}
                    disabled={!workflow.runtime.get_response}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Preview Results
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => testAsync()}
                    disabled={!workflow.runtime.curl_example || !workflow.runtime.get_curl}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Test Async Flow
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => estimateCost()}
                    disabled={!workflow.runtime.curl_example}
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    Estimate Cost
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => navigate('/creators')}>
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={testWorkflow}>
              <Play className="h-4 w-4 mr-2" />
              Test Workflow
            </Button>
            <Button onClick={saveWorkflow}>
              <Save className="h-4 w-4 mr-2" />
              Save Workflow
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCreator; 