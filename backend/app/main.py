from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import os
from dotenv import load_dotenv
import uuid
import asyncio
from datetime import datetime, timedelta
import json
import httpx

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="CLOSED AI API",
    description="Open source task automation platform for AI workflows",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://klethzffhbnkpflbfufs.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZXRoemZmaGJua3BmbGJmdWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMzA5NTIsImV4cCI6MjA2NzkwNjk1Mn0.ojgULbT0x-x-3iTOwYRhs4ERkOxp8Lh225ENpuufSqM")

# Initialize Supabase client when needed
def get_supabase_client():
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Warning: Could not connect to Supabase: {e}")
        return None

# Security
security = HTTPBearer()

# Pydantic models
class FlowInput(BaseModel):
    name: str
    type: str
    label: Optional[str] = None
    description: Optional[str] = None
    required: bool = False
    default: Any = None
    validation: Optional[Dict[str, Any]] = None
    ui: Optional[Dict[str, Any]] = None

class FlowOutput(BaseModel):
    name: str
    type: str
    description: Optional[str] = None

class FlowRuntime(BaseModel):
    gpu_type: str = "cpu"
    timeout: int = 300
    memory: int = 1024

class FlowMetadata(BaseModel):
    cost_estimate: float
    avg_execution_time: str
    popularity_score: float
    tags: List[str]
    execution_count: int = 0

class FlowDefinition(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    category: str
    author: Optional[str] = None
    version: str = "1.0.0"
    inputs: List[FlowInput]
    outputs: List[FlowOutput]
    runtime: FlowRuntime
    metadata: FlowMetadata
    is_public: bool = True
    original_flow_id: Optional[str] = None

class ExecutionRequest(BaseModel):
    flow_id: str
    inputs: Dict[str, Any]
    model_id: str
    runtime_config: Optional[Dict[str, Any]] = None

class ExecutionResponse(BaseModel):
    execution_id: str
    status: str
    outputs: Optional[Dict[str, Any]] = None
    cost: float
    execution_time: Optional[str] = None
    error: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

class CostEstimateRequest(BaseModel):
    flow_id: str
    inputs: Dict[str, Any]
    model_id: str

class CostEstimateResponse(BaseModel):
    estimated_cost: float
    estimated_tokens: int
    model_cost_per_token: float
    base_cost: float
    total_cost: float

class ScheduleRequest(BaseModel):
    flow_id: str
    inputs: Dict[str, Any]
    model_id: str
    schedule_type: str  # 'once', 'hourly', 'daily', 'weekly', 'custom'
    cron_expression: Optional[str] = None
    next_run_at: Optional[datetime] = None

class ForkRequest(BaseModel):
    original_flow_id: str
    name: str
    description: str
    category: str
    is_public: bool = True
    modifications: Optional[str] = None
    attribution: str = "inspired"

# Authentication helper
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # Verify JWT token with Supabase
        supabase = get_supabase_client()
        if not supabase:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection unavailable"
            )
        
        response = supabase.auth.get_user(credentials.credentials)
        if response.user:
            return response.user
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

# Mock AI models data
AI_MODELS = [
    {
        "id": "gpt-4",
        "name": "GPT-4",
        "provider": "OpenAI",
        "cost_per_token": 0.00003,
        "capabilities": ["text", "vision"],
        "max_tokens": 4096,
        "speed": "medium",
        "quality": "highest"
    },
    {
        "id": "gpt-3.5-turbo",
        "name": "GPT-3.5 Turbo",
        "provider": "OpenAI",
        "cost_per_token": 0.000002,
        "capabilities": ["text"],
        "max_tokens": 4096,
        "speed": "fast",
        "quality": "high"
    },
    {
        "id": "claude-3",
        "name": "Claude 3",
        "provider": "Anthropic",
        "cost_per_token": 0.000025,
        "capabilities": ["text"],
        "max_tokens": 4096,
        "speed": "medium",
        "quality": "highest"
    },
    {
        "id": "gemini-pro",
        "name": "Gemini Pro",
        "provider": "Google",
        "cost_per_token": 0.0000005,
        "capabilities": ["text", "vision"],
        "max_tokens": 4096,
        "speed": "fast",
        "quality": "high"
    }
]

# Sample flows for testing
SAMPLE_FLOWS = [
    {
        "id": "cluster-keywords",
        "name": "Cluster Keywords",
        "description": "Automatically group and categorize keywords using AI clustering algorithms",
        "category": "Text Analysis",
        "author": "CLOSED AI Team",
        "version": "1.2.0",
        "inputs": [
            {
                "name": "text",
                "type": "text",
                "label": "Text to Analyze",
                "description": "Enter the text containing keywords you want to cluster",
                "required": True,
                "ui": {
                    "widget": "textarea",
                    "placeholder": "Enter text to analyze...",
                    "rows": 8
                }
            },
            {
                "name": "num_clusters",
                "type": "number",
                "label": "Number of Clusters",
                "description": "How many groups should the keywords be organized into?",
                "default": 5,
                "required": True,
                "validation": {
                    "min": 2,
                    "max": 20
                },
                "ui": {
                    "widget": "slider"
                }
            },
            {
                "name": "similarity_threshold",
                "type": "number",
                "label": "Similarity Threshold",
                "description": "Minimum similarity score for grouping (0.0 - 1.0)",
                "default": 0.7,
                "validation": {
                    "min": 0.1,
                    "max": 1.0,
                    "step": 0.1
                },
                "ui": {
                    "widget": "slider"
                }
            }
        ],
        "outputs": [
            {
                "name": "clusters",
                "type": "array",
                "description": "Grouped keyword clusters"
            }
        ],
        "runtime": {
            "gpu_type": "cpu",
            "timeout": 300,
            "memory": 1024
        },
        "metadata": {
            "cost_estimate": 2.5,
            "avg_execution_time": "2.3s",
            "popularity_score": 4.8,
            "tags": ["clustering", "keywords", "nlp"],
            "execution_count": 12500
        },
        "is_public": True
    }
]

# API Routes

@app.get("/")
async def root():
    return {"message": "CLOSED AI API is running!", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Flow Management Endpoints

@app.get("/api/flows", response_model=List[FlowDefinition])
async def get_flows():
    """Get all available flows"""
    try:
        # For now, return sample flows
        # In production, this would query the database
        return SAMPLE_FLOWS
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/flows/{flow_id}", response_model=FlowDefinition)
async def get_flow(flow_id: str):
    """Get specific flow by ID"""
    try:
        # Find flow in sample data
        for flow in SAMPLE_FLOWS:
            if flow["id"] == flow_id:
                return flow
        
        raise HTTPException(status_code=404, detail="Flow not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/flows/search", response_model=List[FlowDefinition])
async def search_flows(q: Optional[str] = None, category: Optional[str] = None):
    """Search flows by query and/or category"""
    try:
        filtered_flows = SAMPLE_FLOWS.copy()
        
        if q:
            filtered_flows = [
                flow for flow in filtered_flows
                if q.lower() in flow["name"].lower() or 
                   q.lower() in flow["description"].lower() or
                   any(q.lower() in tag.lower() for tag in flow["metadata"]["tags"])
            ]
        
        if category:
            filtered_flows = [
                flow for flow in filtered_flows
                if flow["category"] == category
            ]
        
        return filtered_flows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/flows", response_model=FlowDefinition)
async def create_flow(flow: FlowDefinition, user=Depends(get_current_user)):
    """Create a new flow"""
    try:
        # Generate ID for new flow
        flow.id = str(uuid.uuid4())
        flow.author = user.email
        
        # In production, save to database
        # For now, add to sample data
        SAMPLE_FLOWS.append(flow.dict())
        
        return flow
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Model Management Endpoints

@app.get("/api/models")
async def get_models():
    """Get all available AI models"""
    return AI_MODELS

@app.get("/api/models/{model_id}/pricing")
async def get_model_pricing(model_id: str):
    """Get pricing for specific model"""
    try:
        model = next((m for m in AI_MODELS if m["id"] == model_id), None)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
        
        return {
            "model_id": model_id,
            "cost_per_token": model["cost_per_token"],
            "cost_per_1k_tokens": model["cost_per_token"] * 1000,
            "cost_per_request": 0.001,
            "pricing_tier": "premium" if model["cost_per_token"] > 0.00001 else "standard"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Execution Endpoints

@app.post("/api/execute", response_model=ExecutionResponse)
async def execute_flow(request: ExecutionRequest, background_tasks: BackgroundTasks):
    """Execute a flow with given parameters"""
    try:
        execution_id = str(uuid.uuid4())
        
        # Find the flow
        flow = next((f for f in SAMPLE_FLOWS if f["id"] == request.flow_id), None)
        if not flow:
            raise HTTPException(status_code=404, detail="Flow not found")
        
        # Find the model
        model = next((m for m in AI_MODELS if m["id"] == request.model_id), None)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
        
        # Calculate cost
        text_input = request.inputs.get("text", "")
        estimated_tokens = len(text_input.split()) * 1.3  # Rough estimate
        cost = estimated_tokens * model["cost_per_token"]
        
        # Create execution record
        execution = {
            "execution_id": execution_id,
            "status": "pending",
            "cost": cost,
            "created_at": datetime.utcnow()
        }
        
        # Start background task for execution
        background_tasks.add_task(process_execution, execution_id, request)
        
        return ExecutionResponse(**execution)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/executions/{execution_id}", response_model=ExecutionResponse)
async def get_execution_status(execution_id: str):
    """Get execution status and results"""
    try:
        # In production, query database
        # For now, return mock completed execution
        await asyncio.sleep(0.1)  # Simulate database query
        
        return ExecutionResponse(
            execution_id=execution_id,
            status="completed",
            outputs={
                "clusters": [
                    {
                        "id": 1,
                        "name": "Digital Marketing",
                        "keywords": ["social media marketing", "digital marketing"],
                        "similarity": 0.85
                    },
                    {
                        "id": 2,
                        "name": "Content Strategy",
                        "keywords": ["content creation", "influencer partnerships"],
                        "similarity": 0.72
                    }
                ],
                "total_keywords": 4,
                "processing_time": "2.1s"
            },
            cost=2.5,
            execution_time="2.1s",
            created_at=datetime.utcnow() - timedelta(seconds=3),
            completed_at=datetime.utcnow()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Cost Estimation Endpoint

@app.post("/api/estimate", response_model=CostEstimateResponse)
async def estimate_cost(request: CostEstimateRequest):
    """Get cost estimation for a flow execution"""
    try:
        # Find the model
        model = next((m for m in AI_MODELS if m["id"] == request.model_id), None)
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
        
        # Estimate tokens based on input
        text_input = str(request.inputs.get("text", ""))
        estimated_tokens = max(10, len(text_input.split()) * 1.3)  # Rough estimate
        
        model_cost = estimated_tokens * model["cost_per_token"]
        base_cost = 0.1  # Base processing cost
        total_cost = model_cost + base_cost
        
        return CostEstimateResponse(
            estimated_cost=total_cost,
            estimated_tokens=int(estimated_tokens),
            model_cost_per_token=model["cost_per_token"],
            base_cost=base_cost,
            total_cost=total_cost
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# User Management Endpoints

@app.get("/api/user/profile")
async def get_user_profile(user=Depends(get_current_user)):
    """Get user profile information"""
    return {
        "user_id": user.id,
        "email": user.email,
        "name": user.user_metadata.get("full_name", ""),
        "credits_balance": 87.5,
        "tier": "pro",
        "created_at": user.created_at
    }

@app.get("/api/user/usage")
async def get_user_usage(user=Depends(get_current_user)):
    """Get user usage statistics"""
    return {
        "current_month": {
            "total_executions": 247,
            "total_spent": 12.45,
            "total_tokens": 45230
        },
        "daily_usage": [
            {
                "date": "2024-01-15",
                "executions": 12,
                "cost": 2.4,
                "tokens": 1200
            }
        ],
        "model_usage": [
            {
                "model_id": "gpt-3.5-turbo",
                "executions": 150,
                "cost": 8.50,
                "percentage": 65
            }
        ],
        "recent_executions": [
            {
                "execution_id": "exec_001",
                "flow_name": "Cluster Keywords",
                "status": "completed",
                "cost": 2.5,
                "duration": "2.1s",
                "timestamp": datetime.utcnow() - timedelta(minutes=30)
            }
        ]
    }

# Fork Flow Endpoint

@app.post("/api/flows/fork")
async def fork_flow(request: ForkRequest, user=Depends(get_current_user)):
    """Fork an existing flow"""
    try:
        # Find original flow
        original_flow = next((f for f in SAMPLE_FLOWS if f["id"] == request.original_flow_id), None)
        if not original_flow:
            raise HTTPException(status_code=404, detail="Original flow not found")
        
        # Create forked flow
        forked_flow = original_flow.copy()
        forked_flow["id"] = str(uuid.uuid4())
        forked_flow["name"] = request.name
        forked_flow["description"] = request.description
        forked_flow["category"] = request.category
        forked_flow["author"] = user.email
        forked_flow["is_public"] = request.is_public
        forked_flow["original_flow_id"] = request.original_flow_id
        forked_flow["version"] = "1.0.0"
        
        # Reset metrics for forked flow
        forked_flow["metadata"]["execution_count"] = 0
        forked_flow["metadata"]["popularity_score"] = 0.0
        
        # Add to sample data
        SAMPLE_FLOWS.append(forked_flow)
        
        return forked_flow
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Background task for processing executions
async def process_execution(execution_id: str, request: ExecutionRequest):
    """Background task to process flow execution"""
    try:
        # Simulate processing time
        await asyncio.sleep(2)
        
        # In production, this would:
        # 1. Call Modal deployment
        # 2. Execute the actual flow
        # 3. Save results to database
        # 4. Update execution status
        
        print(f"Processed execution {execution_id} for flow {request.flow_id}")
    except Exception as e:
        print(f"Error processing execution {execution_id}: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 