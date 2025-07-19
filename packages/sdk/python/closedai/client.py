"""
CLOSED AI Client
Main client for interacting with the CLOSED AI platform
"""

import os
import json
import asyncio
from typing import Dict, Any, List, Optional, Union
from dataclasses import asdict
import httpx

from .types import FlowSpec, FlowExecution, CostEstimate, LLMModel
from .cost import estimate_cost

class ClosedAIClient:
    """Main client for CLOSED AI platform"""
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = 30.0
    ):
        self.api_key = api_key or os.getenv("CLOSEDAI_API_KEY")
        self.base_url = base_url or os.getenv("CLOSEDAI_BASE_URL", "https://api.closedai.com")
        self.timeout = timeout
        
        if not self.api_key:
            raise ValueError("CLOSED AI API key is required")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "closedai-python/1.0.0"
        }
    
    async def run_flow(
        self,
        flow_id: str,
        inputs: Dict[str, Any],
        model_id: Optional[str] = None,
        gpu_type: Optional[str] = None,
        wait_for_completion: bool = True
    ) -> Dict[str, Any]:
        """
        Run a flow on the CLOSED AI platform
        
        Args:
            flow_id: ID of the flow to run
            inputs: Input data for the flow
            model_id: LLM model to use (optional)
            gpu_type: GPU type to use (optional)
            wait_for_completion: Whether to wait for completion
            
        Returns:
            Flow execution result
        """
        payload = {
            "flow_id": flow_id,
            "inputs": inputs
        }
        
        if model_id:
            payload["model_id"] = model_id
        if gpu_type:
            payload["gpu_type"] = gpu_type
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/v1/flows/run",
                json=payload,
                headers=self._get_headers()
            )
            response.raise_for_status()
            
            execution = response.json()
            
            if wait_for_completion and execution.get("status") == "running":
                execution_id = execution["id"]
                return await self.wait_for_completion(execution_id)
            
            return execution
    
    async def wait_for_completion(self, execution_id: str, poll_interval: float = 1.0) -> Dict[str, Any]:
        """Wait for flow execution to complete"""
        while True:
            execution = await self.get_execution(execution_id)
            
            if execution["status"] in ["completed", "failed", "cancelled"]:
                return execution
            
            await asyncio.sleep(poll_interval)
    
    async def get_execution(self, execution_id: str) -> Dict[str, Any]:
        """Get flow execution by ID"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/v1/executions/{execution_id}",
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
    
    async def list_executions(
        self,
        flow_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """List flow executions"""
        params = {"limit": limit, "offset": offset}
        if flow_id:
            params["flow_id"] = flow_id
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/v1/executions",
                params=params,
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()["executions"]
    
    async def get_flow(self, flow_id: str) -> Dict[str, Any]:
        """Get flow specification"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/v1/flows/{flow_id}",
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
    
    async def list_flows(
        self,
        category: Optional[str] = None,
        tags: Optional[List[str]] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """List available flows"""
        params = {"limit": limit, "offset": offset}
        if category:
            params["category"] = category
        if tags:
            params["tags"] = ",".join(tags)
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/v1/flows",
                params=params,
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()["flows"]
    
    async def estimate_flow_cost(
        self,
        flow_id: str,
        inputs: Dict[str, Any],
        model_id: Optional[str] = None,
        gpu_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """Estimate cost for running a flow"""
        payload = {
            "flow_id": flow_id,
            "inputs": inputs
        }
        
        if model_id:
            payload["model_id"] = model_id
        if gpu_type:
            payload["gpu_type"] = gpu_type
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/v1/flows/estimate",
                json=payload,
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
    
    async def get_models(self) -> List[Dict[str, Any]]:
        """Get available LLM models"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/v1/models",
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()["models"]
    
    async def get_user_balance(self) -> Dict[str, Any]:
        """Get user credit balance"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/v1/user/balance",
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
    
    async def get_user_usage(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get user usage statistics"""
        params = {}
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/v1/user/usage",
                params=params,
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
    
    async def publish_flow(
        self,
        flow_spec: Union[FlowSpec, Dict[str, Any]],
        source_code: Optional[str] = None,
        dockerfile: Optional[str] = None
    ) -> Dict[str, Any]:
        """Publish a flow to the CLOSED AI platform"""
        if isinstance(flow_spec, FlowSpec):
            spec_dict = asdict(flow_spec)
        else:
            spec_dict = flow_spec
        
        payload = {
            "spec": spec_dict
        }
        
        if source_code:
            payload["source_code"] = source_code
        if dockerfile:
            payload["dockerfile"] = dockerfile
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/v1/flows/publish",
                json=payload,
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
    
    async def update_flow(
        self,
        flow_id: str,
        flow_spec: Union[FlowSpec, Dict[str, Any]],
        source_code: Optional[str] = None,
        dockerfile: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update an existing flow"""
        if isinstance(flow_spec, FlowSpec):
            spec_dict = asdict(flow_spec)
        else:
            spec_dict = flow_spec
        
        payload = {
            "spec": spec_dict
        }
        
        if source_code:
            payload["source_code"] = source_code
        if dockerfile:
            payload["dockerfile"] = dockerfile
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.put(
                f"{self.base_url}/v1/flows/{flow_id}",
                json=payload,
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
    
    async def delete_flow(self, flow_id: str) -> Dict[str, Any]:
        """Delete a flow"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.delete(
                f"{self.base_url}/v1/flows/{flow_id}",
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
    
    # Synchronous wrappers for convenience
    def run_flow_sync(self, *args, **kwargs):
        """Synchronous wrapper for run_flow"""
        return asyncio.run(self.run_flow(*args, **kwargs))
    
    def get_execution_sync(self, *args, **kwargs):
        """Synchronous wrapper for get_execution"""
        return asyncio.run(self.get_execution(*args, **kwargs))
    
    def list_flows_sync(self, *args, **kwargs):
        """Synchronous wrapper for list_flows"""
        return asyncio.run(self.list_flows(*args, **kwargs))
    
    def estimate_flow_cost_sync(self, *args, **kwargs):
        """Synchronous wrapper for estimate_flow_cost"""
        return asyncio.run(self.estimate_flow_cost(*args, **kwargs))
    
    def get_models_sync(self, *args, **kwargs):
        """Synchronous wrapper for get_models"""
        return asyncio.run(self.get_models(*args, **kwargs))
    
    def get_user_balance_sync(self, *args, **kwargs):
        """Synchronous wrapper for get_user_balance"""
        return asyncio.run(self.get_user_balance(*args, **kwargs)) 