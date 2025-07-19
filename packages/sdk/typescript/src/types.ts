/**
 * TypeScript types for CLOSED AI SDK
 */

export interface FlowParameter {
  name: string;
  type: 'string' | 'text' | 'number' | 'boolean' | 'url' | 'file' | 'json' | 'array' | 'object';
  description?: string;
  required?: boolean;
  default?: any;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    enum?: any[];
  };
  ui?: {
    widget?: 'input' | 'textarea' | 'select' | 'checkbox' | 'file' | 'url' | 'json-editor';
    placeholder?: string;
    help?: string;
    rows?: number;
  };
}

export interface FlowRuntime {
  image: string;
  entrypoint?: string;
  gpu?: 'cpu' | 'l4' | 'a10g' | 'a100' | 'a100-80gb';
  timeout?: number;
  memory?: number;
}

export interface FlowMeta {
  author: string;
  category: 'data-processing' | 'content-generation' | 'web-scraping' | 'analysis' | 'automation' | 'other';
  tags: string[];
  license?: string;
  repository?: string;
  estimated_cost?: {
    min_usd?: number;
    max_usd?: number;
    typical_usd?: number;
  };
}

export interface FlowLLMConfig {
  default_model?: string;
  supported_models?: string[];
  estimated_tokens?: {
    input_min?: number;
    input_max?: number;
    output_min?: number;
    output_max?: number;
  };
}

export interface FlowSpec {
  id: string;
  name: string;
  version: string;
  description?: string;
  inputs: FlowParameter[];
  outputs: FlowParameter[];
  runtime: FlowRuntime;
  meta: FlowMeta;
  llm?: FlowLLMConfig;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface CostEstimate {
  total: number;
  container: number;
  llm: number;
  runtime: number;
}

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  quality_score: number;
  price_per_1k_tokens_input_usd: number;
  price_per_1k_tokens_output_usd: number;
  gpu: string;
  tokens_per_second: number;
  context_window_tokens: number;
  recommended_for: string[];
  description: string;
  model_size?: string;
  quantization?: string;
  status: string;
}

export interface GPUPricing {
  [key: string]: {
    name: string;
    price_per_second_usd: number;
    price_per_minute_usd: number;
    price_per_hour_usd: number;
    vcpu_count: number;
    memory_gb: number;
    gpu_memory_gb?: number;
    description: string;
  };
} 