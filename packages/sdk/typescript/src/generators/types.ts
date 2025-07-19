/**
 * TypeScript types generator
 */

import { FlowSpec, FlowParameter } from '../types';

export function generateTypeScriptTypes(spec: FlowSpec): string {
  const inputTypes = generateInputTypes(spec.inputs);
  const outputTypes = generateOutputTypes(spec.outputs);
  const specType = generateSpecType(spec);
  
  return `/**
 * Generated TypeScript types for ${spec.name}
 * Flow ID: ${spec.id}
 * Version: ${spec.version}
 */

// Input types
${inputTypes}

// Output types
${outputTypes}

// Flow specification type
${specType}

// Runtime types
export interface ${toPascalCase(spec.id)}ExecutionResult {
  success: boolean;
  data?: ${toPascalCase(spec.id)}Output;
  error?: string;
  cost_usd?: number;
  runtime_seconds?: number;
  tokens_used?: number;
  model_used?: string;
}

export interface ${toPascalCase(spec.id)}ExecutionRequest {
  inputs: ${toPascalCase(spec.id)}Input;
  model_id?: string;
  gpu_type?: 'cpu' | 'l4' | 'a10g' | 'a100' | 'a100-80gb';
  wait_for_completion?: boolean;
}

export interface ${toPascalCase(spec.id)}CostEstimate {
  total_cost_usd: number;
  container_cost_usd: number;
  llm_cost_usd: number;
  estimated_runtime_seconds: number;
  estimated_tokens: {
    input: number;
    output: number;
    total: number;
  };
  model_used: string;
  gpu_type: string;
}

// API client types
export interface ${toPascalCase(spec.id)}Client {
  run(request: ${toPascalCase(spec.id)}ExecutionRequest): Promise<${toPascalCase(spec.id)}ExecutionResult>;
  estimate(inputs: ${toPascalCase(spec.id)}Input, model_id?: string, gpu_type?: string): Promise<${toPascalCase(spec.id)}CostEstimate>;
}

// Utility types
export type ${toPascalCase(spec.id)}InputKey = keyof ${toPascalCase(spec.id)}Input;
export type ${toPascalCase(spec.id)}OutputKey = keyof ${toPascalCase(spec.id)}Output;

// Validation types
export interface ${toPascalCase(spec.id)}ValidationResult {
  valid: boolean;
  errors: {
    [K in ${toPascalCase(spec.id)}InputKey]?: string[];
  };
}

// Form state types (for React components)
export interface ${toPascalCase(spec.id)}FormState extends ${toPascalCase(spec.id)}Input {
  _isValid?: boolean;
  _errors?: { [key: string]: string };
}

// Event types
export interface ${toPascalCase(spec.id)}Events {
  onStart?: (inputs: ${toPascalCase(spec.id)}Input) => void;
  onProgress?: (progress: number) => void;
  onComplete?: (result: ${toPascalCase(spec.id)}ExecutionResult) => void;
  onError?: (error: string) => void;
}

// Flow metadata
export const ${toPascalCase(spec.id)}Meta = {
  id: '${spec.id}',
  name: '${spec.name}',
  version: '${spec.version}',
  description: ${spec.description ? `'${spec.description}'` : 'undefined'},
  category: '${spec.meta.category}',
  tags: ${JSON.stringify(spec.meta.tags)},
  author: '${spec.meta.author}',
  license: '${spec.meta.license || 'MIT'}',
  ${spec.meta.repository ? `repository: '${spec.meta.repository}',` : ''}
  ${spec.llm?.default_model ? `defaultModel: '${spec.llm.default_model}',` : ''}
  ${spec.llm?.supported_models ? `supportedModels: ${JSON.stringify(spec.llm.supported_models)},` : ''}
} as const;
`;
}

function generateInputTypes(inputs: FlowParameter[]): string {
  if (inputs.length === 0) {
    return `export interface ${toPascalCase(inputs[0]?.name || 'Flow')}Input {
  // No inputs defined
}`.replace(/Flow/, '');
  }
  
  const fields = inputs.map(input => {
    const optional = input.required === false ? '?' : '';
    const type = getTypeScriptType(input.type);
    const comment = input.description ? `  /** ${input.description} */\n` : '';
    
    return `${comment}  ${input.name}${optional}: ${type};`;
  });
  
  return `export interface ${toPascalCase(inputs[0]?.name || 'Flow')}Input {
${fields.join('\n')}
}`.replace(/Flow/, '');
}

function generateOutputTypes(outputs: FlowParameter[]): string {
  if (outputs.length === 0) {
    return `export interface ${toPascalCase(outputs[0]?.name || 'Flow')}Output {
  // No outputs defined
}`.replace(/Flow/, '');
  }
  
  const fields = outputs.map(output => {
    const type = getTypeScriptType(output.type);
    const comment = output.description ? `  /** ${output.description} */\n` : '';
    
    return `${comment}  ${output.name}: ${type};`;
  });
  
  return `export interface ${toPascalCase(outputs[0]?.name || 'Flow')}Output {
${fields.join('\n')}
}`.replace(/Flow/, '');
}

function generateSpecType(spec: FlowSpec): string {
  const pascalName = toPascalCase(spec.id);
  
  return `export interface ${pascalName}Spec {
  id: '${spec.id}';
  name: '${spec.name}';
  version: '${spec.version}';
  description?: '${spec.description || ''}';
  inputs: ${pascalName}InputParameter[];
  outputs: ${pascalName}OutputParameter[];
  runtime: {
    image: '${spec.runtime.image}';
    entrypoint: '${spec.runtime.entrypoint || 'main:run'}';
    gpu: '${spec.runtime.gpu || 'cpu'}';
    timeout: ${spec.runtime.timeout || 300};
    memory: ${spec.runtime.memory || 1024};
  };
  meta: {
    author: '${spec.meta.author}';
    category: '${spec.meta.category}';
    tags: ${JSON.stringify(spec.meta.tags)};
    license: '${spec.meta.license || 'MIT'}';
    ${spec.meta.repository ? `repository: '${spec.meta.repository}';` : ''}
    ${spec.meta.estimated_cost ? `estimated_cost: ${JSON.stringify(spec.meta.estimated_cost)};` : ''}
  };
  ${spec.llm ? `llm: {
    ${spec.llm.default_model ? `default_model: '${spec.llm.default_model}';` : ''}
    ${spec.llm.supported_models ? `supported_models: ${JSON.stringify(spec.llm.supported_models)};` : ''}
    ${spec.llm.estimated_tokens ? `estimated_tokens: ${JSON.stringify(spec.llm.estimated_tokens)};` : ''}
  };` : ''}
}

export interface ${pascalName}InputParameter {
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

export interface ${pascalName}OutputParameter {
  name: string;
  type: 'string' | 'text' | 'number' | 'boolean' | 'url' | 'file' | 'json' | 'array' | 'object';
  description?: string;
}`;
}

function getTypeScriptType(type: string): string {
  switch (type) {
    case 'string':
    case 'text':
    case 'url':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'file':
      return 'File | string'; // Could be File object or URL string
    case 'json':
    case 'object':
      return 'Record<string, any>';
    case 'array':
      return 'any[]';
    default:
      return 'any';
  }
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
} 