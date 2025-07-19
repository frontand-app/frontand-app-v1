"""
Type definitions for CLOSED AI SDK
"""

from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass
from enum import Enum

class GPUType(Enum):
    """Available GPU types"""
    CPU = "cpu"
    L4 = "l4"
    A10G = "a10g"
    A100 = "a100"
    A100_80GB = "a100-80gb"

class FlowCategory(Enum):
    """Flow categories"""
    DATA_PROCESSING = "data-processing"
    CONTENT_GENERATION = "content-generation"
    WEB_SCRAPING = "web-scraping"
    ANALYSIS = "analysis"
    AUTOMATION = "automation"
    OTHER = "other"

class ParameterType(Enum):
    """Parameter types"""
    STRING = "string"
    TEXT = "text"
    NUMBER = "number"
    BOOLEAN = "boolean"
    URL = "url"
    FILE = "file"
    JSON = "json"
    ARRAY = "array"
    OBJECT = "object"

class WidgetType(Enum):
    """UI widget types"""
    INPUT = "input"
    TEXTAREA = "textarea"
    SELECT = "select"
    CHECKBOX = "checkbox"
    FILE = "file"
    URL = "url"
    JSON_EDITOR = "json-editor"

@dataclass
class ParameterValidation:
    """Parameter validation rules"""
    min: Optional[float] = None
    max: Optional[float] = None
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    pattern: Optional[str] = None
    enum: Optional[List[Any]] = None

@dataclass
class ParameterUI:
    """Parameter UI configuration"""
    widget: Optional[WidgetType] = None
    placeholder: Optional[str] = None
    help: Optional[str] = None
    rows: Optional[int] = None

@dataclass
class FlowParameter:
    """Flow parameter definition"""
    name: str
    type: ParameterType
    description: Optional[str] = None
    required: bool = True
    default: Optional[Any] = None
    validation: Optional[ParameterValidation] = None
    ui: Optional[ParameterUI] = None

@dataclass
class FlowRuntime:
    """Flow runtime configuration"""
    image: str
    entrypoint: str = "main:run"
    gpu: GPUType = GPUType.CPU
    timeout: int = 300
    memory: int = 1024

@dataclass
class FlowMeta:
    """Flow metadata"""
    author: str
    category: FlowCategory
    tags: List[str]
    license: str = "MIT"
    repository: Optional[str] = None
    estimated_cost: Optional[Dict[str, float]] = None

@dataclass
class FlowLLMConfig:
    """LLM configuration for flows"""
    default_model: Optional[str] = None
    supported_models: Optional[List[str]] = None
    estimated_tokens: Optional[Dict[str, int]] = None

@dataclass
class FlowSpec:
    """Complete flow specification"""
    id: str
    name: str
    version: str
    description: Optional[str] = None
    inputs: List[FlowParameter] = None
    outputs: List[FlowParameter] = None
    runtime: Optional[FlowRuntime] = None
    meta: Optional[FlowMeta] = None
    llm: Optional[FlowLLMConfig] = None

class FlowInput:
    """Flow input container"""
    
    def __init__(self, **kwargs):
        self.data = kwargs
    
    def __getitem__(self, key):
        return self.data[key]
    
    def __setitem__(self, key, value):
        self.data[key] = value
    
    def get(self, key, default=None):
        return self.data.get(key, default)
    
    def keys(self):
        return self.data.keys()
    
    def values(self):
        return self.data.values()
    
    def items(self):
        return self.data.items()
    
    def to_dict(self) -> Dict[str, Any]:
        return self.data.copy()

class FlowOutput:
    """Flow output container"""
    
    def __init__(self, **kwargs):
        self.data = kwargs
    
    def __getitem__(self, key):
        return self.data[key]
    
    def __setitem__(self, key, value):
        self.data[key] = value
    
    def get(self, key, default=None):
        return self.data.get(key, default)
    
    def keys(self):
        return self.data.keys()
    
    def values(self):
        return self.data.values()
    
    def items(self):
        return self.data.items()
    
    def to_dict(self) -> Dict[str, Any]:
        return self.data.copy()

@dataclass
class LLMModel:
    """LLM model information"""
    id: str
    name: str
    provider: str
    quality_score: float
    price_per_1k_tokens_input_usd: float
    price_per_1k_tokens_output_usd: float
    gpu: str
    tokens_per_second: int
    context_window_tokens: int
    recommended_for: List[str]
    description: str
    model_size: Optional[str] = None
    quantization: Optional[str] = None
    status: str = "active"

@dataclass
class CostEstimate:
    """Cost estimate for flow execution"""
    total_cost_usd: float
    container_cost_usd: float
    llm_cost_usd: float
    estimated_runtime_seconds: float
    estimated_tokens: Dict[str, int]
    model_used: str
    gpu_type: str

@dataclass
class FlowExecution:
    """Flow execution record"""
    id: str
    flow_id: str
    user_id: Optional[str]
    inputs: Dict[str, Any]
    outputs: Optional[Dict[str, Any]]
    success: bool
    error: Optional[str]
    cost_usd: Optional[float]
    runtime_seconds: Optional[float]
    tokens_used: Optional[int]
    model_used: Optional[str]
    gpu_type: str
    created_at: str
    completed_at: Optional[str] = None 