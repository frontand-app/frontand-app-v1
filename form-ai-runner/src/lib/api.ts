// API client for CLOSED AI backend
import { config } from '../config';

const API_BASE_URL = config.api.baseUrl;

interface FlowDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  version: string;
  inputs: FormField[];
  outputs: any[];
  runtime: {
    gpu_type?: string;
    timeout?: number;
    memory?: number;
  };
  metadata: {
    cost_estimate: number;
    avg_execution_time: string;
    popularity_score: number;
    tags: string[];
  };
}

interface FormField {
  name: string;
  type: "text" | "number" | "boolean" | "select";
  label?: string;
  description?: string;
  required?: boolean;
  default?: any;
  validation?: {
    min?: number;
    max?: number;
    step?: number;
    pattern?: string;
  };
  ui?: {
    widget?: "input" | "textarea" | "slider" | "switch" | "select";
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    rows?: number;
  };
}

interface ExecutionRequest {
  flow_id: string;
  inputs: Record<string, any>;
  model_id: string;
  runtime_config?: {
    gpu_type?: string;
    timeout?: number;
  };
}

interface ExecutionResponse {
  execution_id: string;
  status: "pending" | "running" | "completed" | "failed";
  outputs?: Record<string, any>;
  cost: number;
  execution_time?: string;
  error?: string;
}

class APIClient {
  private baseURL: string;
  private apiKey?: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.apiKey = localStorage.getItem('closedai_api_key') || undefined;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Flow Management
  async getFlows(): Promise<FlowDefinition[]> {
    return this.request<FlowDefinition[]>('/api/flows');
  }

  async getFlow(id: string): Promise<FlowDefinition> {
    return this.request<FlowDefinition>(`/api/flows/${id}`);
  }

  async searchFlows(query: string, category?: string): Promise<FlowDefinition[]> {
    const params = new URLSearchParams({ q: query });
    if (category) params.append('category', category);
    return this.request<FlowDefinition[]>(`/api/flows/search?${params}`);
  }

  // LLM Model Management
  async getModels() {
    return this.request('/api/models');
  }

  async getModelPricing(modelId: string) {
    return this.request(`/api/models/${modelId}/pricing`);
  }

  // Flow Execution
  async executeFlow(request: ExecutionRequest): Promise<ExecutionResponse> {
    return this.request<ExecutionResponse>('/api/execute', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getExecutionStatus(executionId: string): Promise<ExecutionResponse> {
    return this.request<ExecutionResponse>(`/api/executions/${executionId}`);
  }

  // User Management
  async getUserProfile() {
    return this.request('/api/user/profile');
  }

  async getUserUsage() {
    return this.request('/api/user/usage');
  }

  async addCredits(amount: number) {
    return this.request('/api/user/credits', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Cost Estimation
  async estimateCost(flowId: string, inputs: Record<string, any>, modelId: string) {
    return this.request('/api/estimate', {
      method: 'POST',
      body: JSON.stringify({ flow_id: flowId, inputs, model_id: modelId }),
    });
  }

  // Authentication
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('closedai_api_key', apiKey);
  }

  clearApiKey() {
    this.apiKey = undefined;
    localStorage.removeItem('closedai_api_key');
  }
}

export const apiClient = new APIClient();
export type { FlowDefinition, FormField, ExecutionRequest, ExecutionResponse }; 