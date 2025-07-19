/**
 * React component generator
 */

import { FlowSpec, FlowParameter } from '../types';

export function generateReactComponent(spec: FlowSpec, template: string = 'default'): string {
  const componentName = toPascalCase(spec.id);
  const formStateType = generateFormStateType(spec.inputs);
  const inputFields = generateInputFields(spec.inputs);
  const defaultFormState = generateDefaultFormState(spec.inputs);
  
  return `'use client';

import React, { useState, useEffect } from 'react';

// Types
${formStateType}

interface ${componentName}Props {
  onSubmit?: (data: ${componentName}FormState) => void;
  onResult?: (result: any) => void;
  className?: string;
  disabled?: boolean;
}

interface ExecutionState {
  isRunning: boolean;
  result: any;
  error: string | null;
  cost: number | null;
}

// Main component
export default function ${componentName}({ 
  onSubmit, 
  onResult, 
  className = '',
  disabled = false 
}: ${componentName}Props) {
  const [formState, setFormState] = useState<${componentName}FormState>(${defaultFormState});
  const [execution, setExecution] = useState<ExecutionState>({
    isRunning: false,
    result: null,
    error: null,
    cost: null
  });
  const [costEstimate, setCostEstimate] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState('llama3-8b-q4');

  // Estimate cost when form changes
  useEffect(() => {
    const estimateCost = async () => {
      try {
        const response = await fetch('/api/flows/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flow_id: '${spec.id}',
            inputs: formState,
            model_id: selectedModel
          })
        });
        const data = await response.json();
        setCostEstimate(data.total_cost_usd);
      } catch (error) {
        console.error('Cost estimation failed:', error);
      }
    };

    const debounceTimer = setTimeout(estimateCost, 500);
    return () => clearTimeout(debounceTimer);
  }, [formState, selectedModel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (disabled || execution.isRunning) return;
    
    setExecution({
      isRunning: true,
      result: null,
      error: null,
      cost: null
    });

    try {
      const response = await fetch('/api/flows/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flow_id: '${spec.id}',
          inputs: formState,
          model_id: selectedModel
        })
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      const result = await response.json();
      
      setExecution({
        isRunning: false,
        result: result.data,
        error: null,
        cost: result.cost_usd
      });

      if (onResult) {
        onResult(result);
      }
    } catch (error) {
      setExecution({
        isRunning: false,
        result: null,
        error: error.message || 'An error occurred',
        cost: null
      });
    }

    if (onSubmit) {
      onSubmit(formState);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={\`bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto \${className}\`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">${spec.name}</h2>
        {${spec.description ? `<p className="text-gray-600">${spec.description}</p>` : ''}}
      </div>

      {/* Model Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model
        </label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="llama3-8b-q4">Llama-3-8B-Q4 (Fast, $)</option>
          <option value="llama3-70b-q4">Llama-3-70B-Q4 (Better, $$)</option>
          <option value="claude-3-haiku">Claude 3 Haiku (Fast, $$$)</option>
          <option value="claude-3-sonnet">Claude 3 Sonnet (Balanced, $$$$)</option>
          <option value="gpt-4o-mini">GPT-4o Mini (Good, $$$)</option>
          <option value="gpt-4o">GPT-4o (Best, $$$$$)</option>
        </select>
      </div>

      {/* Cost Estimate */}
      {costEstimate !== null && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Estimated cost:</span> \${costEstimate.toFixed(6)}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        ${inputFields}
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={disabled || execution.isRunning}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {execution.isRunning ? 'Running...' : 'Run Flow'}
        </button>
      </form>

      {/* Results */}
      {execution.error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{execution.error}</p>
        </div>
      )}

      {execution.result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-green-800">Result</h3>
            {execution.cost && (
              <span className="text-sm text-green-700">
                Cost: \${execution.cost.toFixed(6)}
              </span>
            )}
          </div>
          <pre className="text-sm text-green-700 whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(execution.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}`;
}

function generateFormStateType(inputs: FlowParameter[]): string {
  const fields = inputs.map(input => {
    const optional = input.required === false ? '?' : '';
    const type = getTypeScriptType(input.type);
    return `  ${input.name}${optional}: ${type};`;
  });
  
  return `interface ${toPascalCase(inputs[0]?.name || 'Flow')}FormState {
${fields.join('\n')}
}`.replace(/Flow/, '');
}

function generateInputFields(inputs: FlowParameter[]): string {
  return inputs.map(input => {
    const widget = input.ui?.widget || getDefaultWidget(input.type);
    return generateInputField(input, widget);
  }).join('\n        ');
}

function generateInputField(input: FlowParameter, widget: string): string {
  const label = input.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  const helpText = input.ui?.help || input.description;
  
  switch (widget) {
    case 'textarea':
      return `<div>
          <label htmlFor="${input.name}" className="block text-sm font-medium text-gray-700 mb-1">
            ${label}${input.required !== false ? ' *' : ''}
          </label>
          <textarea
            id="${input.name}"
            value={formState.${input.name} || ''}
            onChange={(e) => handleInputChange('${input.name}', e.target.value)}
            placeholder="${input.ui?.placeholder || ''}"
            rows={${input.ui?.rows || 3}}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ${input.required !== false ? 'required' : ''}
          />
          ${helpText ? `<p className="text-xs text-gray-500 mt-1">${helpText}</p>` : ''}
        </div>`;
    
    case 'select':
      const options = input.validation?.enum || [];
      return `<div>
          <label htmlFor="${input.name}" className="block text-sm font-medium text-gray-700 mb-1">
            ${label}${input.required !== false ? ' *' : ''}
          </label>
          <select
            id="${input.name}"
            value={formState.${input.name} || ''}
            onChange={(e) => handleInputChange('${input.name}', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ${input.required !== false ? 'required' : ''}
          >
            <option value="">Select...</option>
            ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('\n            ')}
          </select>
          ${helpText ? `<p className="text-xs text-gray-500 mt-1">${helpText}</p>` : ''}
        </div>`;
    
    case 'checkbox':
      return `<div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formState.${input.name} || false}
              onChange={(e) => handleInputChange('${input.name}', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              ${label}${input.required !== false ? ' *' : ''}
            </span>
          </label>
          ${helpText ? `<p className="text-xs text-gray-500 mt-1 ml-6">${helpText}</p>` : ''}
        </div>`;
    
    case 'file':
      return `<div>
          <label htmlFor="${input.name}" className="block text-sm font-medium text-gray-700 mb-1">
            ${label}${input.required !== false ? ' *' : ''}
          </label>
          <input
            type="file"
            id="${input.name}"
            onChange={(e) => handleInputChange('${input.name}', e.target.files?.[0] || null)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ${input.required !== false ? 'required' : ''}
          />
          ${helpText ? `<p className="text-xs text-gray-500 mt-1">${helpText}</p>` : ''}
        </div>`;
    
    case 'json-editor':
      return `<div>
          <label htmlFor="${input.name}" className="block text-sm font-medium text-gray-700 mb-1">
            ${label}${input.required !== false ? ' *' : ''}
          </label>
          <textarea
            id="${input.name}"
            value={typeof formState.${input.name} === 'string' ? formState.${input.name} : JSON.stringify(formState.${input.name} || {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleInputChange('${input.name}', parsed);
              } catch {
                handleInputChange('${input.name}', e.target.value);
              }
            }}
            placeholder="${input.ui?.placeholder || '{}'}"
            rows={${input.ui?.rows || 4}}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            ${input.required !== false ? 'required' : ''}
          />
          ${helpText ? `<p className="text-xs text-gray-500 mt-1">${helpText}</p>` : ''}
        </div>`;
    
    default: // input
      const inputType = input.type === 'number' ? 'number' : input.type === 'url' ? 'url' : 'text';
      return `<div>
          <label htmlFor="${input.name}" className="block text-sm font-medium text-gray-700 mb-1">
            ${label}${input.required !== false ? ' *' : ''}
          </label>
          <input
            type="${inputType}"
            id="${input.name}"
            value={formState.${input.name} || ''}
            onChange={(e) => handleInputChange('${input.name}', ${input.type === 'number' ? 'parseFloat(e.target.value)' : 'e.target.value'})}
            placeholder="${input.ui?.placeholder || ''}"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ${input.required !== false ? 'required' : ''}
            ${input.validation?.min !== undefined ? `min="${input.validation.min}"` : ''}
            ${input.validation?.max !== undefined ? `max="${input.validation.max}"` : ''}
            ${input.validation?.minLength !== undefined ? `minLength="${input.validation.minLength}"` : ''}
            ${input.validation?.maxLength !== undefined ? `maxLength="${input.validation.maxLength}"` : ''}
            ${input.validation?.pattern ? `pattern="${input.validation.pattern}"` : ''}
          />
          ${helpText ? `<p className="text-xs text-gray-500 mt-1">${helpText}</p>` : ''}
        </div>`;
  }
}

function generateDefaultFormState(inputs: FlowParameter[]): string {
  const fields = inputs.map(input => {
    const defaultValue = input.default !== undefined ? JSON.stringify(input.default) : getDefaultValue(input.type);
    return `    ${input.name}: ${defaultValue}`;
  });
  
  return `{\n${fields.join(',\n')}\n  }`;
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
      return 'File | null';
    case 'json':
    case 'object':
      return 'any';
    case 'array':
      return 'any[]';
    default:
      return 'any';
  }
}

function getDefaultWidget(type: string): string {
  switch (type) {
    case 'text':
      return 'textarea';
    case 'boolean':
      return 'checkbox';
    case 'file':
      return 'file';
    case 'json':
    case 'object':
      return 'json-editor';
    default:
      return 'input';
  }
}

function getDefaultValue(type: string): string {
  switch (type) {
    case 'string':
    case 'text':
    case 'url':
      return "''";
    case 'number':
      return '0';
    case 'boolean':
      return 'false';
    case 'file':
      return 'null';
    case 'json':
    case 'object':
      return '{}';
    case 'array':
      return '[]';
    default:
      return "''";
  }
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
} 