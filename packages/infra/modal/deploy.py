"""
Modal deployment script for CLOSED AI flows
"""

import os
import json
import modal
import importlib.util
from pathlib import Path
from typing import Dict, Any, Optional

# Modal setup
stub = modal.Stub("closedai-flows")

# Environment variables
CLOSEDAI_API_KEY = os.getenv("CLOSEDAI_API_KEY")
CLOSEDAI_LEDGER_URL = os.getenv("CLOSEDAI_LEDGER_URL", "https://api.closedai.com/v1/ledger")

# GPU configurations
GPU_CONFIGS = {
    "cpu": None,
    "l4": modal.gpu.L4(),
    "a10g": modal.gpu.A10G(),
    "a100": modal.gpu.A100(memory=40),
    "a100-80gb": modal.gpu.A100(memory=80)
}

# Cost tracking
COST_RATES = {
    "cpu": 0.0000131,
    "l4": 0.000222,
    "a10g": 0.000306,
    "a100": 0.000583,
    "a100-80gb": 0.000833
}

def create_image_for_flow(flow_dir: Path, flow_spec: Dict[str, Any]) -> modal.Image:
    """Create a Modal image for a flow"""
    
    # Start with base Python image
    image = modal.Image.debian_slim(python_version="3.11")
    
    # Install CLOSED AI SDK
    image = image.pip_install("closedai")
    
    # Install flow requirements
    requirements_path = flow_dir / "requirements.txt"
    if requirements_path.exists():
        image = image.pip_install_from_requirements(str(requirements_path))
    
    # Copy flow code
    image = image.copy_local_dir(str(flow_dir), "/app")
    
    # Set working directory
    image = image.workdir("/app")
    
    return image

def deploy_flow(flow_dir: str) -> Dict[str, Any]:
    """Deploy a flow to Modal"""
    
    flow_path = Path(flow_dir)
    flow_json_path = flow_path / "flow.json"
    
    if not flow_json_path.exists():
        raise ValueError(f"flow.json not found in {flow_dir}")
    
    # Load flow specification
    with open(flow_json_path, 'r') as f:
        flow_spec = json.load(f)
    
    flow_id = flow_spec["id"]
    gpu_type = flow_spec["runtime"].get("gpu", "cpu")
    timeout = flow_spec["runtime"].get("timeout", 300)
    memory = flow_spec["runtime"].get("memory", 1024)
    
    # Create image
    image = create_image_for_flow(flow_path, flow_spec)
    
    # Configure GPU
    gpu_config = GPU_CONFIGS.get(gpu_type)
    
    # Create Modal function
    @stub.function(
        image=image,
        gpu=gpu_config,
        timeout=timeout,
        memory=memory,
        secrets=[modal.Secret.from_name("closedai-secrets")]
    )
    def run_flow(inputs: Dict[str, Any], metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Run the flow with cost tracking"""
        import time
        import sys
        import traceback
        
        start_time = time.time()
        
        try:
            # Import the flow module
            sys.path.insert(0, '/app')
            
            # Load the flow function
            entrypoint = flow_spec["runtime"].get("entrypoint", "main:run")
            module_name, function_name = entrypoint.split(":")
            
            spec = importlib.util.spec_from_file_location(
                module_name, 
                f"/app/{module_name}.py"
            )
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            # Get the flow function
            flow_function = getattr(module, function_name)
            
            # Run the flow
            result = flow_function(inputs)
            
            # Calculate runtime and cost
            runtime = time.time() - start_time
            container_cost = runtime * COST_RATES[gpu_type]
            
            # Record cost to ledger
            cost_data = {
                "flow_id": flow_id,
                "execution_id": metadata.get("execution_id"),
                "user_id": metadata.get("user_id"),
                "container_cost_usd": container_cost,
                "runtime_seconds": runtime,
                "gpu_type": gpu_type,
                "success": True
            }
            
            # TODO: Send cost data to ledger API
            
            return {
                "success": True,
                "data": result,
                "runtime_seconds": runtime,
                "cost_usd": container_cost,
                "gpu_type": gpu_type
            }
            
        except Exception as e:
            runtime = time.time() - start_time
            error_msg = str(e)
            
            # Record failed execution cost
            container_cost = runtime * COST_RATES[gpu_type]
            cost_data = {
                "flow_id": flow_id,
                "execution_id": metadata.get("execution_id"),
                "user_id": metadata.get("user_id"),
                "container_cost_usd": container_cost,
                "runtime_seconds": runtime,
                "gpu_type": gpu_type,
                "success": False,
                "error": error_msg
            }
            
            # TODO: Send cost data to ledger API
            
            return {
                "success": False,
                "error": error_msg,
                "runtime_seconds": runtime,
                "cost_usd": container_cost,
                "gpu_type": gpu_type,
                "traceback": traceback.format_exc()
            }
    
    # Store the function reference
    stub.functions[flow_id] = run_flow
    
    return {
        "flow_id": flow_id,
        "status": "deployed",
        "gpu_type": gpu_type,
        "endpoint": f"https://modal.com/apps/{stub.app_id}/functions/{flow_id}"
    }

# API endpoints for flow management
@stub.function(
    image=modal.Image.debian_slim(python_version="3.11").pip_install("fastapi", "uvicorn", "httpx"),
    secrets=[modal.Secret.from_name("closedai-secrets")]
)
@modal.web_endpoint(method="POST", label="run-flow")
def run_flow_endpoint(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """API endpoint to run a flow"""
    
    flow_id = request_data.get("flow_id")
    inputs = request_data.get("inputs", {})
    metadata = request_data.get("metadata", {})
    
    if not flow_id:
        return {"success": False, "error": "flow_id is required"}
    
    # Get the flow function
    flow_function = stub.functions.get(flow_id)
    if not flow_function:
        return {"success": False, "error": f"Flow {flow_id} not found"}
    
    # Run the flow
    result = flow_function.remote(inputs, metadata)
    return result

@stub.function(
    image=modal.Image.debian_slim(python_version="3.11").pip_install("fastapi", "uvicorn"),
    secrets=[modal.Secret.from_name("closedai-secrets")]
)
@modal.web_endpoint(method="GET", label="list-flows")
def list_flows_endpoint() -> Dict[str, Any]:
    """API endpoint to list deployed flows"""
    
    flows = []
    for flow_id, function in stub.functions.items():
        flows.append({
            "id": flow_id,
            "status": "active",
            "endpoint": f"https://modal.com/apps/{stub.app_id}/functions/{flow_id}"
        })
    
    return {"flows": flows}

@stub.function(
    image=modal.Image.debian_slim(python_version="3.11").pip_install("fastapi", "uvicorn"),
    secrets=[modal.Secret.from_name("closedai-secrets")]
)
@modal.web_endpoint(method="POST", label="estimate-cost")
def estimate_cost_endpoint(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """API endpoint to estimate flow cost"""
    
    flow_id = request_data.get("flow_id")
    inputs = request_data.get("inputs", {})
    model_id = request_data.get("model_id", "llama3-8b-q4")
    gpu_type = request_data.get("gpu_type", "cpu")
    
    if not flow_id:
        return {"success": False, "error": "flow_id is required"}
    
    # TODO: Implement actual cost estimation
    # For now, return a simple estimate
    
    estimated_runtime = 30  # seconds
    container_cost = estimated_runtime * COST_RATES.get(gpu_type, 0.0000131)
    
    return {
        "flow_id": flow_id,
        "estimated_cost_usd": container_cost,
        "estimated_runtime_seconds": estimated_runtime,
        "gpu_type": gpu_type,
        "model_id": model_id
    }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python deploy.py <flow_directory>")
        sys.exit(1)
    
    flow_dir = sys.argv[1]
    
    try:
        result = deploy_flow(flow_dir)
        print(f"✅ Flow deployed successfully: {result}")
    except Exception as e:
        print(f"❌ Deployment failed: {e}")
        sys.exit(1) 