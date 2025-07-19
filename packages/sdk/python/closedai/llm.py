"""
LLM integration for CLOSED AI flows
Supports self-hosted models and external APIs
"""

import os
import json
import tiktoken
from typing import Dict, Any, Optional, List, AsyncGenerator
from dataclasses import dataclass
from .cost import calculate_llm_cost, load_llm_pricing

@dataclass
class LLMResponse:
    """Response from LLM call"""
    content: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    model_used: str
    finish_reason: str = "stop"

class LLMClient:
    """Base class for LLM clients"""
    
    def __init__(self, model_id: str):
        self.model_id = model_id
        self.pricing = load_llm_pricing().get(model_id, {})
        
    async def complete(self, prompt: str, **kwargs) -> LLMResponse:
        """Complete a prompt"""
        raise NotImplementedError
    
    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> LLMResponse:
        """Chat completion"""
        raise NotImplementedError
    
    async def stream(self, prompt: str, **kwargs) -> AsyncGenerator[str, None]:
        """Stream completion"""
        raise NotImplementedError

class ClosedAILLMClient(LLMClient):
    """Client for self-hosted CLOSED AI models"""
    
    def __init__(self, model_id: str, endpoint: Optional[str] = None):
        super().__init__(model_id)
        self.endpoint = endpoint or os.getenv("CLOSEDAI_LLM_ENDPOINT", "http://localhost:8000")
        
    async def complete(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7, **kwargs) -> LLMResponse:
        """Complete prompt using self-hosted model"""
        try:
            import httpx
            
            payload = {
                "model": self.model_id,
                "prompt": prompt,
                "max_tokens": max_tokens,
                "temperature": temperature,
                **kwargs
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(f"{self.endpoint}/v1/completions", json=payload)
                response.raise_for_status()
                
                data = response.json()
                content = data["choices"][0]["text"]
                
                # Calculate tokens
                input_tokens = estimate_tokens(prompt)
                output_tokens = estimate_tokens(content)
                
                # Calculate cost
                cost = calculate_llm_cost(self.model_id, input_tokens, output_tokens)
                
                return LLMResponse(
                    content=content,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    cost_usd=cost,
                    model_used=self.model_id,
                    finish_reason=data["choices"][0].get("finish_reason", "stop")
                )
                
        except Exception as e:
            raise Exception(f"CLOSED AI LLM call failed: {str(e)}")
    
    async def chat(self, messages: List[Dict[str, str]], max_tokens: int = 1000, temperature: float = 0.7, **kwargs) -> LLMResponse:
        """Chat completion using self-hosted model"""
        try:
            import httpx
            
            payload = {
                "model": self.model_id,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
                **kwargs
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(f"{self.endpoint}/v1/chat/completions", json=payload)
                response.raise_for_status()
                
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                
                # Calculate tokens
                input_tokens = sum(estimate_tokens(msg["content"]) for msg in messages)
                output_tokens = estimate_tokens(content)
                
                # Calculate cost
                cost = calculate_llm_cost(self.model_id, input_tokens, output_tokens)
                
                return LLMResponse(
                    content=content,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    cost_usd=cost,
                    model_used=self.model_id,
                    finish_reason=data["choices"][0].get("finish_reason", "stop")
                )
                
        except Exception as e:
            raise Exception(f"CLOSED AI LLM chat failed: {str(e)}")

class OpenAIClient(LLMClient):
    """Client for OpenAI models"""
    
    def __init__(self, model_id: str, api_key: Optional[str] = None):
        super().__init__(model_id)
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key required")
    
    async def complete(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7, **kwargs) -> LLMResponse:
        """Complete prompt using OpenAI"""
        try:
            import openai
            
            client = openai.AsyncOpenAI(api_key=self.api_key)
            response = await client.completions.create(
                model=self.model_id,
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                **kwargs
            )
            
            content = response.choices[0].text
            input_tokens = response.usage.prompt_tokens
            output_tokens = response.usage.completion_tokens
            
            cost = calculate_llm_cost(self.model_id, input_tokens, output_tokens)
            
            return LLMResponse(
                content=content,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                cost_usd=cost,
                model_used=self.model_id,
                finish_reason=response.choices[0].finish_reason
            )
            
        except Exception as e:
            raise Exception(f"OpenAI API call failed: {str(e)}")
    
    async def chat(self, messages: List[Dict[str, str]], max_tokens: int = 1000, temperature: float = 0.7, **kwargs) -> LLMResponse:
        """Chat completion using OpenAI"""
        try:
            import openai
            
            client = openai.AsyncOpenAI(api_key=self.api_key)
            response = await client.chat.completions.create(
                model=self.model_id,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                **kwargs
            )
            
            content = response.choices[0].message.content
            input_tokens = response.usage.prompt_tokens
            output_tokens = response.usage.completion_tokens
            
            cost = calculate_llm_cost(self.model_id, input_tokens, output_tokens)
            
            return LLMResponse(
                content=content,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                cost_usd=cost,
                model_used=self.model_id,
                finish_reason=response.choices[0].finish_reason
            )
            
        except Exception as e:
            raise Exception(f"OpenAI chat failed: {str(e)}")

class AnthropicClient(LLMClient):
    """Client for Anthropic Claude models"""
    
    def __init__(self, model_id: str, api_key: Optional[str] = None):
        super().__init__(model_id)
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("Anthropic API key required")
    
    async def chat(self, messages: List[Dict[str, str]], max_tokens: int = 1000, temperature: float = 0.7, **kwargs) -> LLMResponse:
        """Chat completion using Claude"""
        try:
            import anthropic
            
            client = anthropic.AsyncAnthropic(api_key=self.api_key)
            response = await client.messages.create(
                model=self.model_id,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                **kwargs
            )
            
            content = response.content[0].text
            input_tokens = response.usage.input_tokens
            output_tokens = response.usage.output_tokens
            
            cost = calculate_llm_cost(self.model_id, input_tokens, output_tokens)
            
            return LLMResponse(
                content=content,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                cost_usd=cost,
                model_used=self.model_id,
                finish_reason=response.stop_reason
            )
            
        except Exception as e:
            raise Exception(f"Anthropic API call failed: {str(e)}")

class GoogleClient(LLMClient):
    """Client for Google Gemini models"""
    
    def __init__(self, model_id: str, api_key: Optional[str] = None):
        super().__init__(model_id)
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("Google API key required")
    
    async def chat(self, messages: List[Dict[str, str]], max_tokens: int = 1000, temperature: float = 0.7, **kwargs) -> LLMResponse:
        """Chat completion using Gemini"""
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(self.model_id)
            
            # Convert messages to Gemini format
            prompt = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
            
            response = await model.generate_content_async(
                prompt,
                generation_config=genai.GenerationConfig(
                    max_output_tokens=max_tokens,
                    temperature=temperature
                )
            )
            
            content = response.text
            
            # Estimate tokens (Gemini doesn't provide exact counts)
            input_tokens = estimate_tokens(prompt)
            output_tokens = estimate_tokens(content)
            
            cost = calculate_llm_cost(self.model_id, input_tokens, output_tokens)
            
            return LLMResponse(
                content=content,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                cost_usd=cost,
                model_used=self.model_id,
                finish_reason="stop"
            )
            
        except Exception as e:
            raise Exception(f"Google API call failed: {str(e)}")

def get_llm_client(model_id: str) -> LLMClient:
    """Get appropriate LLM client based on model ID"""
    llm_pricing = load_llm_pricing()
    model_info = llm_pricing.get(model_id, {})
    provider = model_info.get("provider", "ClosedAI")
    
    if provider == "ClosedAI":
        return ClosedAILLMClient(model_id)
    elif provider == "OpenAI":
        return OpenAIClient(model_id)
    elif provider == "Anthropic":
        return AnthropicClient(model_id)
    elif provider == "Google":
        return GoogleClient(model_id)
    else:
        # Default to ClosedAI for unknown providers
        return ClosedAILLMClient(model_id)

async def llm_call(
    model_id: str,
    prompt: Optional[str] = None,
    messages: Optional[List[Dict[str, str]]] = None,
    max_tokens: int = 1000,
    temperature: float = 0.7,
    **kwargs
) -> LLMResponse:
    """
    Universal LLM call function
    
    Args:
        model_id: ID of the model to use
        prompt: Prompt for completion models
        messages: Messages for chat models
        max_tokens: Maximum tokens to generate
        temperature: Temperature for sampling
        **kwargs: Additional model-specific parameters
    
    Returns:
        LLMResponse with content and cost information
    """
    client = get_llm_client(model_id)
    
    if messages:
        return await client.chat(messages, max_tokens=max_tokens, temperature=temperature, **kwargs)
    elif prompt:
        return await client.complete(prompt, max_tokens=max_tokens, temperature=temperature, **kwargs)
    else:
        raise ValueError("Either prompt or messages must be provided")

def estimate_tokens(text: str, model: str = "gpt-4") -> int:
    """Estimate token count for text"""
    try:
        # Use tiktoken for accurate token counting
        encoding = tiktoken.encoding_for_model(model)
        return len(encoding.encode(text))
    except:
        # Fallback to character-based estimation
        return max(1, len(text) // 4)

def get_model_pricing(model_id: str) -> Dict[str, Any]:
    """Get pricing information for a model"""
    llm_pricing = load_llm_pricing()
    return llm_pricing.get(model_id, {})

def list_available_models() -> List[Dict[str, Any]]:
    """List all available models with pricing"""
    llm_pricing = load_llm_pricing()
    return list(llm_pricing.values()) 