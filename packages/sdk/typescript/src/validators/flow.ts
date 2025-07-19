/**
 * Flow validation utilities
 */

import { FlowSpec, ValidationResult } from '../types';

export function validateFlowSpec(spec: FlowSpec): ValidationResult {
  const errors: string[] = [];
  
  // Validate required fields
  if (!spec.id) {
    errors.push('Flow ID is required');
  } else if (!/^[a-z0-9-]{3,64}$/.test(spec.id)) {
    errors.push('Flow ID must be 3-64 characters, lowercase letters, numbers, and hyphens only');
  }
  
  if (!spec.name) {
    errors.push('Flow name is required');
  } else if (spec.name.length < 3 || spec.name.length > 100) {
    errors.push('Flow name must be 3-100 characters');
  }
  
  if (!spec.version) {
    errors.push('Flow version is required');
  } else if (!/^\d+\.\d+\.\d+$/.test(spec.version)) {
    errors.push('Flow version must be semantic version (e.g., 1.0.0)');
  }
  
  if (!spec.inputs || !Array.isArray(spec.inputs)) {
    errors.push('Flow inputs must be an array');
  } else {
    spec.inputs.forEach((input, index) => {
      const inputErrors = validateParameter(input, `inputs[${index}]`);
      errors.push(...inputErrors);
    });
  }
  
  if (!spec.outputs || !Array.isArray(spec.outputs)) {
    errors.push('Flow outputs must be an array');
  } else {
    spec.outputs.forEach((output, index) => {
      const outputErrors = validateParameter(output, `outputs[${index}]`);
      errors.push(...outputErrors);
    });
  }
  
  if (!spec.runtime) {
    errors.push('Flow runtime is required');
  } else {
    const runtimeErrors = validateRuntime(spec.runtime);
    errors.push(...runtimeErrors);
  }
  
  if (!spec.meta) {
    errors.push('Flow meta is required');
  } else {
    const metaErrors = validateMeta(spec.meta);
    errors.push(...metaErrors);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function validateParameter(param: any, path: string): string[] {
  const errors: string[] = [];
  
  if (!param.name) {
    errors.push(`${path}.name is required`);
  } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(param.name)) {
    errors.push(`${path}.name must be a valid identifier`);
  }
  
  if (!param.type) {
    errors.push(`${path}.type is required`);
  } else if (!['string', 'text', 'number', 'boolean', 'url', 'file', 'json', 'array', 'object'].includes(param.type)) {
    errors.push(`${path}.type must be one of: string, text, number, boolean, url, file, json, array, object`);
  }
  
  if (param.validation) {
    if (param.validation.min !== undefined && typeof param.validation.min !== 'number') {
      errors.push(`${path}.validation.min must be a number`);
    }
    if (param.validation.max !== undefined && typeof param.validation.max !== 'number') {
      errors.push(`${path}.validation.max must be a number`);
    }
    if (param.validation.minLength !== undefined && typeof param.validation.minLength !== 'number') {
      errors.push(`${path}.validation.minLength must be a number`);
    }
    if (param.validation.maxLength !== undefined && typeof param.validation.maxLength !== 'number') {
      errors.push(`${path}.validation.maxLength must be a number`);
    }
  }
  
  if (param.ui) {
    if (param.ui.widget && !['input', 'textarea', 'select', 'checkbox', 'file', 'url', 'json-editor'].includes(param.ui.widget)) {
      errors.push(`${path}.ui.widget must be one of: input, textarea, select, checkbox, file, url, json-editor`);
    }
    if (param.ui.rows !== undefined && typeof param.ui.rows !== 'number') {
      errors.push(`${path}.ui.rows must be a number`);
    }
  }
  
  return errors;
}

function validateRuntime(runtime: any): string[] {
  const errors: string[] = [];
  
  if (!runtime.image) {
    errors.push('runtime.image is required');
  }
  
  if (runtime.gpu && !['cpu', 'l4', 'a10g', 'a100', 'a100-80gb'].includes(runtime.gpu)) {
    errors.push('runtime.gpu must be one of: cpu, l4, a10g, a100, a100-80gb');
  }
  
  if (runtime.timeout !== undefined) {
    if (typeof runtime.timeout !== 'number' || runtime.timeout < 10 || runtime.timeout > 3600) {
      errors.push('runtime.timeout must be a number between 10 and 3600');
    }
  }
  
  if (runtime.memory !== undefined) {
    if (typeof runtime.memory !== 'number' || runtime.memory < 128 || runtime.memory > 32768) {
      errors.push('runtime.memory must be a number between 128 and 32768');
    }
  }
  
  return errors;
}

function validateMeta(meta: any): string[] {
  const errors: string[] = [];
  
  if (!meta.author) {
    errors.push('meta.author is required');
  }
  
  if (!meta.category) {
    errors.push('meta.category is required');
  } else if (!['data-processing', 'content-generation', 'web-scraping', 'analysis', 'automation', 'other'].includes(meta.category)) {
    errors.push('meta.category must be one of: data-processing, content-generation, web-scraping, analysis, automation, other');
  }
  
  if (!meta.tags || !Array.isArray(meta.tags)) {
    errors.push('meta.tags must be an array');
  }
  
  if (meta.repository && typeof meta.repository !== 'string') {
    errors.push('meta.repository must be a string');
  }
  
  return errors;
} 