"""
Cost tracking and estimation for CLOSED AI flows
"""

import json
import os
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from pathlib import Path

# GPU pricing data (loaded from JSON file)
GPU_PRICING = {
    "cpu": {"price_per_second_usd": 0.0000131},
    "l4": {"price_per_second_usd": 0.000222},
    "a10g": {"price_per_second_usd": 0.000306},
    "a100": {"price_per_second_usd": 0.000583},
    "a100-80gb": {"price_per_second_usd": 0.000833}
}

@dataclass
class CostBreakdown:
    """Detailed cost breakdown for a flow"""
    container_cost_usd: float
    llm_cost_usd: float
    total_cost_usd: float
    runtime_seconds: float
    tokens_used: int
    model_used: Optional[str] = None

class CostTracker:
    """Tracks costs during flow execution"""
    
    def __init__(self, gpu_type: str = "cpu"):
        self.gpu_type = gpu_type
        self.gpu_pricing = GPU_PRICING.get(gpu_type, GPU_PRICING["cpu"])
        self.llm_costs = []
        self.total_tokens = 0
        self.last_model_used = None
        
    def calculate_container_cost(self, runtime_seconds: float) -> float:
        """Calculate container cost based on runtime"""
        return runtime_seconds * self.gpu_pricing["price_per_second_usd"]
    
    def add_llm_cost(self, model_id: str, input_tokens: int, output_tokens: int, cost_usd: float):
        """Add LLM cost to tracker"""
        self.llm_costs.append({
            "model_id": model_id,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_usd": cost_usd
        })
        self.total_tokens += input_tokens + output_tokens
        self.last_model_used = model_id
    
    def get_llm_cost(self) -> float:
        """Get total LLM cost"""
        return sum(cost["cost_usd"] for cost in self.llm_costs)
    
    def get_breakdown(self, runtime_seconds: float) -> CostBreakdown:
        """Get detailed cost breakdown"""
        container_cost = self.calculate_container_cost(runtime_seconds)
        llm_cost = self.get_llm_cost()
        
        return CostBreakdown(
            container_cost_usd=container_cost,
            llm_cost_usd=llm_cost,
            total_cost_usd=container_cost + llm_cost,
            runtime_seconds=runtime_seconds,
            tokens_used=self.total_tokens,
            model_used=self.last_model_used
        )

def load_llm_pricing() -> Dict[str, Any]:
    """Load LLM pricing data from JSON file"""
    try:
        # Try to load from package data
        current_dir = Path(__file__).parent.parent
        pricing_file = current_dir / "data" / "llm-registry.json"
        
        if pricing_file.exists():
            with open(pricing_file, 'r') as f:
                return {model["id"]: model for model in json.load(f)}
        
        # Fallback to hardcoded pricing
        return {
            "llama3-8b-q4": {
                "price_per_1k_tokens_input_usd": 0.0002,
                "price_per_1k_tokens_output_usd": 0.0002,
                "tokens_per_second": 60
            },
            "gpt-4o-mini": {
                "price_per_1k_tokens_input_usd": 0.15,
                "price_per_1k_tokens_output_usd": 0.60,
                "tokens_per_second": 140
            }
        }
    except Exception:
        # Return minimal fallback
        return {
            "llama3-8b-q4": {
                "price_per_1k_tokens_input_usd": 0.0002,
                "price_per_1k_tokens_output_usd": 0.0002,
                "tokens_per_second": 60
            }
        }

def estimate_cost(
    flow_id: str,
    inputs: Dict[str, Any],
    model_id: str = "llama3-8b-q4",
    gpu_type: str = "cpu",
    estimated_runtime_seconds: Optional[float] = None
) -> Dict[str, Any]:
    """
    Estimate cost for running a flow
    
    Args:
        flow_id: ID of the flow
        inputs: Flow inputs
        model_id: LLM model to use
        gpu_type: GPU type for container
        estimated_runtime_seconds: Expected runtime (if known)
    
    Returns:
        Cost estimate with breakdown
    """
    llm_pricing = load_llm_pricing()
    gpu_pricing = GPU_PRICING.get(gpu_type, GPU_PRICING["cpu"])
    model_pricing = llm_pricing.get(model_id, llm_pricing["llama3-8b-q4"])
    
    # Estimate tokens based on inputs
    estimated_input_tokens = estimate_tokens_from_inputs(inputs)
    estimated_output_tokens = estimate_output_tokens(flow_id, estimated_input_tokens)
    
    # Calculate LLM cost
    llm_cost = (
        (estimated_input_tokens / 1000) * model_pricing["price_per_1k_tokens_input_usd"] +
        (estimated_output_tokens / 1000) * model_pricing["price_per_1k_tokens_output_usd"]
    )
    
    # Estimate runtime if not provided
    if estimated_runtime_seconds is None:
        tokens_per_second = model_pricing.get("tokens_per_second", 60)
        estimated_runtime_seconds = (estimated_input_tokens + estimated_output_tokens) / tokens_per_second
        estimated_runtime_seconds += 5  # Add cold start buffer
    
    # Calculate container cost
    container_cost = estimated_runtime_seconds * gpu_pricing["price_per_second_usd"]
    
    total_cost = llm_cost + container_cost
    
    return {
        "total_cost_usd": total_cost,
        "container_cost_usd": container_cost,
        "llm_cost_usd": llm_cost,
        "estimated_runtime_seconds": estimated_runtime_seconds,
        "estimated_tokens": {
            "input": estimated_input_tokens,
            "output": estimated_output_tokens,
            "total": estimated_input_tokens + estimated_output_tokens
        },
        "model_used": model_id,
        "gpu_type": gpu_type
    }

def estimate_tokens_from_inputs(inputs: Dict[str, Any]) -> int:
    """Estimate token count from input data"""
    total_chars = 0
    for key, value in inputs.items():
        if isinstance(value, str):
            total_chars += len(value)
        elif isinstance(value, (list, dict)):
            total_chars += len(str(value))
        else:
            total_chars += len(str(value))
    
    # Rough estimate: 4 characters per token
    return max(100, total_chars // 4)

def estimate_output_tokens(flow_id: str, input_tokens: int) -> int:
    """Estimate output tokens based on flow type and input size"""
    # Flow-specific output estimates
    flow_estimates = {
        "cluster-keywords": lambda x: min(500, x // 2),
        "crawl4contacts": lambda x: min(2000, x * 2),
        "generate-blog": lambda x: min(4000, x * 3),
        "analyze-sentiment": lambda x: min(200, x // 4)
    }
    
    estimator = flow_estimates.get(flow_id, lambda x: min(1000, x))
    return estimator(input_tokens)

def calculate_llm_cost(model_id: str, input_tokens: int, output_tokens: int) -> float:
    """Calculate LLM cost for specific token usage"""
    llm_pricing = load_llm_pricing()
    model_pricing = llm_pricing.get(model_id, llm_pricing["llama3-8b-q4"])
    
    return (
        (input_tokens / 1000) * model_pricing["price_per_1k_tokens_input_usd"] +
        (output_tokens / 1000) * model_pricing["price_per_1k_tokens_output_usd"]
    ) 