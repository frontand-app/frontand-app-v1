"""
Flow decorator and core flow functionality
"""

import time
import json
import os
import logging
from typing import Dict, Any, Optional, Callable, TypeVar, Union
from functools import wraps
from dataclasses import dataclass
from .cost import CostTracker
from .types import FlowInput, FlowOutput

logger = logging.getLogger(__name__)

F = TypeVar('F', bound=Callable[..., Any])

@dataclass
class FlowResult:
    """Result of a flow execution"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    cost_usd: Optional[float] = None
    runtime_seconds: Optional[float] = None
    tokens_used: Optional[int] = None
    model_used: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "data": self.data,
            "error": self.error,
            "cost_usd": self.cost_usd,
            "runtime_seconds": self.runtime_seconds,
            "tokens_used": self.tokens_used,
            "model_used": self.model_used
        }

class FlowContext:
    """Context object passed to flows with utilities and cost tracking"""
    
    def __init__(self, flow_id: str, gpu_type: str = "cpu"):
        self.flow_id = flow_id
        self.gpu_type = gpu_type
        self.cost_tracker = CostTracker(gpu_type)
        self.start_time = time.time()
        
    def get_runtime(self) -> float:
        return time.time() - self.start_time
    
    def log(self, message: str, level: str = "info"):
        """Log a message from the flow"""
        log_func = getattr(logger, level, logger.info)
        log_func(f"[{self.flow_id}] {message}")

def flow(
    gpu: str = "cpu",
    timeout: int = 300,
    memory: int = 1024,
    track_costs: bool = True
) -> Callable[[F], F]:
    """
    Decorator to create a CLOSED AI flow
    
    Args:
        gpu: GPU type to use (cpu, l4, a10g, a100)
        timeout: Maximum runtime in seconds
        memory: Memory limit in MB
        track_costs: Whether to track costs automatically
    """
    def decorator(func: F) -> F:
        @wraps(func)
        async def wrapper(inputs: Union[Dict[str, Any], FlowInput]) -> FlowResult:
            # Convert inputs to dict if needed
            if isinstance(inputs, FlowInput):
                input_dict = inputs.to_dict()
            else:
                input_dict = inputs
            
            # Create flow context
            flow_id = getattr(func, '__name__', 'unknown')
            context = FlowContext(flow_id, gpu)
            
            try:
                # Validate inputs (if flow has validation)
                if hasattr(func, '__annotations__') and 'inputs' in func.__annotations__:
                    # TODO: Add input validation based on flow.json schema
                    pass
                
                # Execute the flow
                context.log(f"Starting flow with inputs: {list(input_dict.keys())}")
                
                # Pass context to flow if it accepts it
                import inspect
                sig = inspect.signature(func)
                if 'context' in sig.parameters:
                    result = await func(input_dict, context)
                else:
                    result = await func(input_dict)
                
                # Calculate final costs
                runtime = context.get_runtime()
                if track_costs:
                    container_cost = context.cost_tracker.calculate_container_cost(runtime)
                    llm_cost = context.cost_tracker.get_llm_cost()
                    total_cost = container_cost + llm_cost
                    
                    context.log(f"Flow completed - Runtime: {runtime:.2f}s, Cost: ${total_cost:.6f}")
                    
                    # Record cost if in production
                    if os.getenv("CLOSEDAI_ENVIRONMENT") == "production":
                        await record_cost_to_ledger(
                            flow_id=flow_id,
                            cost_usd=total_cost,
                            runtime_seconds=runtime,
                            gpu_type=gpu
                        )
                else:
                    total_cost = None
                
                return FlowResult(
                    success=True,
                    data=result,
                    cost_usd=total_cost,
                    runtime_seconds=runtime,
                    tokens_used=context.cost_tracker.total_tokens,
                    model_used=context.cost_tracker.last_model_used
                )
                
            except Exception as e:
                runtime = context.get_runtime()
                error_msg = str(e)
                context.log(f"Flow failed after {runtime:.2f}s: {error_msg}", "error")
                
                return FlowResult(
                    success=False,
                    error=error_msg,
                    runtime_seconds=runtime,
                    cost_usd=context.cost_tracker.calculate_container_cost(runtime) if track_costs else None
                )
        
        # Store metadata on the function
        wrapper.__flow_metadata__ = {
            "gpu": gpu,
            "timeout": timeout,
            "memory": memory,
            "track_costs": track_costs
        }
        
        return wrapper
    
    return decorator

async def record_cost_to_ledger(
    flow_id: str,
    cost_usd: float,
    runtime_seconds: float,
    gpu_type: str,
    user_id: Optional[str] = None
):
    """Record cost to the ledger (production only)"""
    # TODO: Implement actual cost recording to database
    # This would typically call the CLOSED AI API
    pass

def validate_flow_inputs(inputs: Dict[str, Any], schema: Dict[str, Any]) -> bool:
    """Validate flow inputs against schema"""
    # TODO: Implement JSON schema validation
    return True

def get_flow_metadata(func: Callable) -> Optional[Dict[str, Any]]:
    """Get flow metadata from decorated function"""
    return getattr(func, '__flow_metadata__', None) 