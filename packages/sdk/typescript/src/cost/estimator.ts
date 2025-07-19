/**
 * Cost estimation for flows
 */

import { FlowSpec, CostEstimate, LLMModel, GPUPricing } from '../types';

// Import pricing data
import llmRegistry from '../../data/llm-registry.json';
import gpuPricing from '../../data/gpu-pricing.json';

export async function estimateCost(
  spec: FlowSpec,
  inputs: Record<string, any>,
  modelId: string = 'llama3-8b-q4',
  gpuType: string = 'cpu'
): Promise<CostEstimate> {
  // Get model pricing
  const model = llmRegistry.find(m => m.id === modelId);
  if (!model) {
    throw new Error(`Model not found: ${modelId}`);
  }

  // Get GPU pricing
  const gpu = gpuPricing[gpuType];
  if (!gpu) {
    throw new Error(`GPU type not found: ${gpuType}`);
  }

  // Estimate tokens from inputs
  const inputTokens = estimateTokensFromInputs(inputs);
  const outputTokens = estimateOutputTokens(spec.id, inputTokens);

  // Calculate LLM cost
  const llmCost = 
    (inputTokens / 1000) * model.price_per_1k_tokens_input_usd +
    (outputTokens / 1000) * model.price_per_1k_tokens_output_usd;

  // Estimate runtime
  const tokensPerSecond = model.tokens_per_second;
  const processingTime = (inputTokens + outputTokens) / tokensPerSecond;
  const coldStartTime = 5; // seconds
  const estimatedRuntime = processingTime + coldStartTime;

  // Calculate container cost
  const containerCost = estimatedRuntime * gpu.price_per_second_usd;

  // Total cost
  const totalCost = llmCost + containerCost;

  return {
    total: totalCost,
    container: containerCost,
    llm: llmCost,
    runtime: estimatedRuntime
  };
}

function estimateTokensFromInputs(inputs: Record<string, any>): number {
  let totalChars = 0;
  
  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'string') {
      totalChars += value.length;
    } else if (typeof value === 'object' && value !== null) {
      totalChars += JSON.stringify(value).length;
    } else {
      totalChars += String(value).length;
    }
  }
  
  // Rough estimate: 4 characters per token
  return Math.max(100, Math.floor(totalChars / 4));
}

function estimateOutputTokens(flowId: string, inputTokens: number): number {
  // Flow-specific output estimates
  const flowEstimates: Record<string, (input: number) => number> = {
    'cluster-keywords': (input) => Math.min(500, Math.floor(input / 2)),
    'crawl4contacts': (input) => Math.min(2000, input * 2),
    'generate-blog': (input) => Math.min(4000, input * 3),
    'analyze-sentiment': (input) => Math.min(200, Math.floor(input / 4)),
    'extract-data': (input) => Math.min(1000, input),
    'summarize-text': (input) => Math.min(800, Math.floor(input / 3)),
    'translate-text': (input) => Math.min(1200, input),
    'classify-content': (input) => Math.min(300, Math.floor(input / 5))
  };
  
  const estimator = flowEstimates[flowId] || ((input: number) => Math.min(1000, input));
  return estimator(inputTokens);
}

export function getModelRecommendations(
  flowCategory: string,
  estimatedInputTokens: number,
  budgetUsd?: number
): LLMModel[] {
  const models = llmRegistry.filter(m => m.status === 'active');
  
  // Filter by category recommendations
  const categoryRecommendations: Record<string, string[]> = {
    'data-processing': ['keyword_clustering', 'simple_analysis', 'data_extraction'],
    'content-generation': ['content_generation', 'creative_tasks', 'draft_generation'],
    'web-scraping': ['data_extraction', 'text_processing', 'analysis'],
    'analysis': ['reasoning', 'complex_analysis', 'multi_step_agents'],
    'automation': ['quick_processing', 'batch_processing', 'simple_analysis']
  };
  
  const recommendedUseCases = categoryRecommendations[flowCategory] || [];
  
  let filteredModels = models;
  
  if (recommendedUseCases.length > 0) {
    filteredModels = models.filter(model => 
      model.recommended_for.some(useCase => recommendedUseCases.includes(useCase))
    );
  }
  
  // Filter by budget if provided
  if (budgetUsd) {
    filteredModels = filteredModels.filter(model => {
      const estimatedCost = estimateModelCost(model, estimatedInputTokens, estimatedInputTokens);
      return estimatedCost <= budgetUsd;
    });
  }
  
  // Sort by quality score (descending) and then by cost (ascending)
  filteredModels.sort((a, b) => {
    if (Math.abs(a.quality_score - b.quality_score) > 0.05) {
      return b.quality_score - a.quality_score;
    }
    const costA = estimateModelCost(a, estimatedInputTokens, estimatedInputTokens);
    const costB = estimateModelCost(b, estimatedInputTokens, estimatedInputTokens);
    return costA - costB;
  });
  
  return filteredModels.slice(0, 3); // Return top 3 recommendations
}

function estimateModelCost(model: LLMModel, inputTokens: number, outputTokens: number): number {
  return (
    (inputTokens / 1000) * model.price_per_1k_tokens_input_usd +
    (outputTokens / 1000) * model.price_per_1k_tokens_output_usd
  );
}

export function compareModels(
  models: string[],
  inputTokens: number,
  outputTokens: number
): Array<{
  model: LLMModel;
  cost: number;
  qualityScore: number;
  processingTime: number;
}> {
  return models
    .map(modelId => {
      const model = llmRegistry.find(m => m.id === modelId);
      if (!model) return null;
      
      const cost = estimateModelCost(model, inputTokens, outputTokens);
      const processingTime = (inputTokens + outputTokens) / model.tokens_per_second;
      
      return {
        model,
        cost,
        qualityScore: model.quality_score,
        processingTime
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.qualityScore - a.qualityScore);
}

export function getGPURecommendation(modelId: string): string {
  const model = llmRegistry.find(m => m.id === modelId);
  if (!model) return 'cpu';
  
  // Return the recommended GPU from the model data
  if (model.gpu && model.gpu !== 'provider') {
    return model.gpu;
  }
  
  // Fallback recommendations based on model characteristics
  if (model.model_size) {
    const size = parseInt(model.model_size);
    if (size >= 70) return 'a100';
    if (size >= 30) return 'a10g';
    if (size >= 8) return 'l4';
  }
  
  return 'cpu';
} 