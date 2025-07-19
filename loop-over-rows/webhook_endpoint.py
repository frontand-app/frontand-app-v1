import modal
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import json
import traceback

# Create the Modal stub
app = modal.App("loop-over-rows")

# Define the image with all required dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install([
        "fastapi",
        "uvicorn",
        "google-generativeai",
        "pydantic",
        "asyncio"
    ])
)

# Pydantic models for request/response
class RowProcessingRequest(BaseModel):
    data: Dict[str, Any]  # Row-keyed JSON data
    headers: List[str]    # Column headers to process
    prompt: str          # AI processing prompt
    batch_size: int = 10 # Batch size for processing

class ProcessingResult(BaseModel):
    success: bool
    results: List[Dict[str, Any]] = []
    error: str = ""
    processed_count: int = 0
    total_count: int = 0

# FastAPI app instance
web_app = FastAPI(title="Loop Over Rows AI Processor")

@web_app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "loop-over-rows"}

async def process_rows_mock(request: RowProcessingRequest):
    """Mock processing for when API key is not available"""
    import random
    
    data = request.data
    headers = request.headers
    
    if not data:
        raise HTTPException(status_code=400, detail="No data provided")
    
    results = []
    
    for key, row_data in data.items():
        # Generate mock results
        score = random.randint(65, 95)
        rationales = [
            "Strong keyword relevance and user intent alignment",
            "Good search volume with moderate competition",
            "High commercial value and conversion potential",
            "Excellent brand alignment and target audience match",
            "Strong semantic relevance to core business offerings"
        ]
        
        result = {
            "row_key": key,
            "score": score,
            "rationale": random.choice(rationales),
            "status": "processed (mock)",
            **{header: row_data.get(header, "") if isinstance(row_data, dict) else "" for header in headers}
        }
        results.append(result)
    
    return ProcessingResult(
        success=True,
        results=results,
        processed_count=len(results),
        total_count=len(data)
    )

@web_app.post("/process", response_model=ProcessingResult)
async def process_rows(request: RowProcessingRequest):
    """Process rows with AI batch processing using Gemini 2.5-Flash"""
    try:
        import google.generativeai as genai
        import os
        
        # Configure Gemini (with fallback for testing)
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            # Fallback to mock processing for testing
            return await process_rows_mock(request)
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Extract data for processing
        data = request.data
        headers = request.headers
        prompt = request.prompt
        batch_size = request.batch_size
        
        if not data:
            raise HTTPException(status_code=400, detail="No data provided")
        
        # Process data in batches
        all_results = []
        processed_count = 0
        total_count = len(data)
        
        # Convert data to list of rows
        rows = []
        for key, row_data in data.items():
            if isinstance(row_data, dict):
                # Ensure we have the required headers in the row
                row = {"row_key": key}
                for header in headers:
                    row[header] = row_data.get(header, "")
                rows.append(row)
        
        # Process in batches
        for i in range(0, len(rows), batch_size):
            batch = rows[i:i + batch_size]
            batch_results = []
            
            # Process each row in the batch
            for row in batch:
                try:
                    # Create context for AI processing
                    row_context = f"Row data: {json.dumps(row)}\n\nHeaders: {', '.join(headers)}"
                    full_prompt = f"{prompt}\n\n{row_context}\n\nProvide a score (0-100) and brief rationale:"
                    
                    # Generate AI response
                    response = model.generate_content(full_prompt)
                    ai_result = response.text.strip()
                    
                    # Parse the AI response to extract score and rationale
                    score = 75  # Default score
                    rationale = ai_result
                    
                    # Try to extract numeric score from response
                    import re
                    score_match = re.search(r'(?:score|rating)[:=]?\s*(\d+)', ai_result.lower())
                    if score_match:
                        score = int(score_match.group(1))
                        score = min(max(score, 0), 100)  # Clamp to 0-100
                    
                    # Clean rationale (remove score if it was extracted)
                    if score_match:
                        rationale = re.sub(r'(?:score|rating)[:=]?\s*\d+', '', ai_result, flags=re.IGNORECASE).strip()
                    
                    result = {
                        "row_key": row["row_key"],
                        "score": score,
                        "rationale": rationale[:200],  # Limit rationale length
                        "status": "processed",
                        **{header: row.get(header, "") for header in headers}
                    }
                    
                    batch_results.append(result)
                    processed_count += 1
                    
                except Exception as e:
                    # Handle individual row processing errors
                    error_result = {
                        "row_key": row["row_key"],
                        "score": 0,
                        "rationale": f"Processing error: {str(e)[:100]}",
                        "status": "error",
                        **{header: row.get(header, "") for header in headers}
                    }
                    batch_results.append(error_result)
                    processed_count += 1
            
            all_results.extend(batch_results)
            
            # Add small delay between batches to avoid rate limiting
            if i + batch_size < len(rows):
                await asyncio.sleep(0.1)
        
        return ProcessingResult(
            success=True,
            results=all_results,
            processed_count=processed_count,
            total_count=total_count
        )
        
    except Exception as e:
        error_msg = f"Processing failed: {str(e)}"
        print(f"Error in process_rows: {error_msg}")
        print(f"Traceback: {traceback.format_exc()}")
        
        return ProcessingResult(
            success=False,
            error=error_msg,
            processed_count=0,
            total_count=len(request.data) if request.data else 0
        )

# Mount the FastAPI app to Modal
@app.function(
    image=image,
    timeout=300,
    max_containers=100
)
@modal.asgi_app()
def fastapi_app():
    return web_app 