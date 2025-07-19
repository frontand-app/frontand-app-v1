# Workflow JSON Examples & API Specification

## Complete Workflow Definition Structure

### 1. Basic Workflow JSON (`flow.json`)
```json
{
  "id": "sentiment-analysis-pro",
  "name": "Advanced Sentiment Analysis",
  "version": "1.2.0",
  "description": "Analyzes text sentiment with emotion detection and confidence scores",
  "category": "nlp",
  "tags": ["sentiment", "emotion", "nlp", "text-analysis"],
  
  "inputs": [
    {
      "name": "text",
      "type": "text",
      "description": "Text to analyze for sentiment",
      "required": true,
      "validation": {
        "minLength": 10,
        "maxLength": 10000
      },
      "ui": {
        "widget": "textarea",
        "placeholder": "Enter text to analyze...",
        "help": "Provide the text you want to analyze for sentiment and emotions",
        "rows": 6
      }
    },
    {
      "name": "language",
      "type": "string",
      "description": "Language of the input text",
      "required": false,
      "default": "auto",
      "validation": {
        "enum": ["auto", "en", "es", "fr", "de", "it", "pt"]
      },
      "ui": {
        "widget": "select",
        "options": [
          {"value": "auto", "label": "Auto-detect"},
          {"value": "en", "label": "English"},
          {"value": "es", "label": "Spanish"},
          {"value": "fr", "label": "French"},
          {"value": "de", "label": "German"}
        ]
      }
    },
    {
      "name": "include_emotions",
      "type": "boolean",
      "description": "Include detailed emotion analysis",
      "required": false,
      "default": true,
      "ui": {
        "widget": "checkbox",
        "help": "Enable to get detailed emotion breakdown"
      }
    }
  ],

  "outputs": [
    {
      "name": "sentiment",
      "type": "object",
      "description": "Overall sentiment analysis results",
      "schema": {
        "type": "object",
        "properties": {
          "label": {"type": "string", "enum": ["positive", "negative", "neutral"]},
          "score": {"type": "number", "minimum": 0, "maximum": 1},
          "confidence": {"type": "number", "minimum": 0, "maximum": 1}
        }
      }
    },
    {
      "name": "emotions",
      "type": "array",
      "description": "Detailed emotion analysis",
      "schema": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "emotion": {"type": "string"},
            "score": {"type": "number"},
            "confidence": {"type": "number"}
          }
        }
      }
    },
    {
      "name": "summary_table",
      "type": "table",
      "description": "Results in tabular format for display",
      "schema": {
        "type": "object",
        "properties": {
          "columns": {"type": "array"},
          "rows": {"type": "array"}
        }
      }
    }
  ],

  "runtime": {
    "image": "your-docker-image:latest",
    "entrypoint": "python main.py",
    "gpu_type": "l4",
    "timeout": 300,
    "memory": "4Gi",
    "env": {
      "MODEL_NAME": "sentiment-model-v2"
    }
  },

  "meta": {
    "author": "Your Name",
    "created_at": "2024-01-15T10:00:00Z",
    "cost_estimate": {
      "base_cost": 0.05,
      "per_token": 0.0001,
      "gpu_cost_per_second": 0.001
    },
    "avg_execution_time": "2.5s",
    "tags": ["nlp", "sentiment", "emotion"],
    "license": "MIT"
  }
}
```

## 2. API Request/Response Examples

### Execution Request
```json
POST /api/workflows/sentiment-analysis-pro/execute
{
  "inputs": {
    "text": "I absolutely love this product! It exceeded my expectations.",
    "language": "en",
    "include_emotions": true
  },
  "user_id": "user_123",
  "model_config": {
    "temperature": 0.1,
    "max_tokens": 1000
  }
}
```

### Execution Response
```json
{
  "success": true,
  "execution_id": "exec_456789",
  "status": "completed",
  "results": {
    "sentiment": {
      "label": "positive",
      "score": 0.89,
      "confidence": 0.94
    },
    "emotions": [
      {"emotion": "joy", "score": 0.85, "confidence": 0.92},
      {"emotion": "excitement", "score": 0.72, "confidence": 0.88},
      {"emotion": "satisfaction", "score": 0.68, "confidence": 0.85}
    ],
    "summary_table": {
      "type": "table",
      "data": {
        "columns": [
          {"key": "metric", "label": "Metric", "type": "text"},
          {"key": "value", "label": "Value", "type": "text"},
          {"key": "confidence", "label": "Confidence", "type": "number"}
        ],
        "rows": [
          {"metric": "Overall Sentiment", "value": "Positive", "confidence": 0.94},
          {"metric": "Primary Emotion", "value": "Joy", "confidence": 0.92},
          {"metric": "Sentiment Score", "value": "0.89", "confidence": 0.94}
        ],
        "metadata": {
          "totalRows": 3,
          "source": "AI Sentiment Analysis",
          "processingTime": "2.1s",
          "successCount": 3,
          "errorCount": 0
        }
      }
    }
  },
  "execution_time_ms": 2100,
  "credits_used": 0.05,
  "model_used": "sentiment-model-v2"
}
```

## 3. Table Output Examples

### Simple Table Output
```json
{
  "type": "table",
  "data": {
    "columns": [
      {"key": "keyword", "label": "Keyword", "type": "text", "sortable": true},
      {"key": "cluster", "label": "Cluster", "type": "text", "sortable": true},
      {"key": "similarity", "label": "Similarity", "type": "number", "sortable": true},
      {"key": "frequency", "label": "Frequency", "type": "number", "sortable": true}
    ],
    "rows": [
      {"keyword": "machine learning", "cluster": "AI Technology", "similarity": 0.94, "frequency": 15},
      {"keyword": "artificial intelligence", "cluster": "AI Technology", "similarity": 0.91, "frequency": 12},
      {"keyword": "data science", "cluster": "Analytics", "similarity": 0.87, "frequency": 8}
    ],
    "metadata": {
      "totalRows": 3,
      "source": "Keyword Clustering AI",
      "processingTime": "1.8s",
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  }
}
```

### Advanced Table with Status
```json
{
  "type": "table", 
  "data": {
    "columns": [
      {"key": "email", "label": "Email", "type": "email", "sortable": true},
      {"key": "status", "label": "Status", "type": "status", "sortable": true},
      {"key": "confidence", "label": "Confidence", "type": "number", "sortable": true},
      {"key": "processed_at", "label": "Processed", "type": "date", "sortable": true}
    ],
    "rows": [
      {
        "email": "john@example.com",
        "status": "success",
        "confidence": 0.95,
        "processed_at": "2024-01-15T10:30:00Z"
      },
      {
        "email": "invalid-email",
        "status": "error",
        "confidence": 0.1,
        "processed_at": "2024-01-15T10:30:01Z"
      }
    ],
    "metadata": {
      "totalRows": 2,
      "successCount": 1,
      "errorCount": 1,
      "processingTime": "0.5s"
    }
  }
}
```

## 4. API Error Response
```json
{
  "success": false,
  "error": "Invalid input: text field is required",
  "error_code": "VALIDATION_ERROR",
  "execution_id": "exec_456789",
  "status": "failed",
  "credits_used": 0,
  "details": {
    "field": "text",
    "message": "Text input cannot be empty"
  }
}
```

## 5. Cost Estimation Request/Response

### Request
```json
POST /api/workflows/sentiment-analysis-pro/estimate
{
  "inputs": {
    "text": "Sample text for estimation...",
    "language": "en"
  }
}
```

### Response
```json
{
  "total_cost_credits": 0.05,
  "breakdown": {
    "base_cost": 0.02,
    "compute_cost": 0.02,
    "token_cost": 0.01
  },
  "estimated_time_seconds": 2.5,
  "model_used": "sentiment-model-v2"
}
``` 