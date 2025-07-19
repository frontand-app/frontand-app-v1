# Modal Integration Guide - Loop Over Rows

## Current State: Demo Mode with Mock Results
The Loop Over Rows workflow currently shows simulated AI processing results for demo purposes.

## Real Modal Integration Pattern

### 1. **Submit Job (Fast Response)**
```bash
POST https://federicodeponte--loop-over-rows-process-rows-batch.modal.run
```

**Request:**
```json
{
  "data": {"row1": ["AI chatbot"], "row2": ["automation"]},
  "headers": "Keyword", 
  "prompt": "Evaluate for market potential",
  "batch_size": 10
}
```

**Immediate Response (< 1 second):**
```json
{
  "job_id": "job_abc123",
  "status": "queued", 
  "message": "Job submitted successfully",
  "estimated_time": "30-60 seconds"
}
```

### 2. **Poll for Results (Background Processing)**
```bash
GET https://federicodeponte--loop-over-rows-get-results.modal.run/job_abc123
```

**While Processing:**
```json
{
  "job_id": "job_abc123",
  "status": "running",
  "progress": "Processing row 3 of 5",
  "elapsed_time": "15s"
}
```

**When Complete:**
```json
{
  "job_id": "job_abc123", 
  "status": "completed",
  "results": {
    "data": {
      "row1": ["AI chatbot", 85, "High demand in enterprise automation"],
      "row2": ["automation", 92, "Core market trend with strong growth"]
    },
    "headers": ["Keyword", "Score", "Rationale"],
    "metadata": {
      "total_rows": 2,
      "successful_rows": 2,
      "processing_time": "45s",
      "model": "gemini-2.5-flash"
    }
  }
}
```

## Implementation in FlowRunner

To connect to real Modal endpoint, update `executeWorkflowAPI`:

```typescript
const executeWorkflowAPI = async (workflowId: string, inputs: any) => {
  if (workflowId === '550e8400-e29b-41d4-a716-446655440001') {
    // 1. Submit job to Modal
    const submitResponse = await fetch('https://federicodeponte--loop-over-rows-process-rows-batch.modal.run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs)
    });
    
    const { job_id } = await submitResponse.json();
    
    // 2. Poll for results every 10 seconds
    return await pollForResults(job_id);
  }
};

const pollForResults = async (jobId: string) => {
  while (true) {
    const response = await fetch(`https://federicodeponte--loop-over-rows-get-results.modal.run/${jobId}`);
    const result = await response.json();
    
    if (result.status === 'completed') {
      return { success: true, results: result.results };
    }
    
    if (result.status === 'failed') {
      return { success: false, error: result.error };
    }
    
    // Wait 10 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
};
```

## Benefits of Async Pattern

✅ **No timeouts** - Submit immediately, process in background  
✅ **Progress tracking** - Show processing status to users  
✅ **Scalability** - Handle multiple concurrent jobs  
✅ **Reliability** - Survives network disconnections  
✅ **Cost efficiency** - Pay only for actual processing time 