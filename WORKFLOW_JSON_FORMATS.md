# Front& Workflow JSON Format Specifications

## 📋 Overview

This document defines the standard JSON formats for workflow input/output data exchange between Front& and external platforms (n8n, Modal, webhooks).

## 🔄 Standard Workflow Request/Response Format

### **Workflow Execution Request**

```json
{
  "workflow_id": "google-sheets-processor",
  "execution_id": "exec_1234567890",
  "user_id": "user_abc123",
  "inputs": {
    "spreadsheet_url": "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "sheet_name": "Sheet1",
    "operation": "read_and_process",
    "range": "A1:Z1000",
    "filters": {
      "status": "active",
      "date_range": {
        "start": "2024-01-01",
        "end": "2024-12-31"
      }
    },
    "processing_options": {
      "remove_duplicates": true,
      "validate_emails": true,
      "enrich_data": true
    }
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "user_tier": "pro",
    "credits_available": 50.0,
    "estimated_cost": 2.5,
    "callback_url": "https://frontand.dev/api/webhooks/workflow-complete",
    "max_execution_time": 300
  }
}
```

### **Workflow Execution Response**

```json
{
  "execution_id": "exec_1234567890",
  "workflow_id": "google-sheets-processor",
  "status": "completed", // "pending" | "running" | "completed" | "failed"
  "started_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T10:32:45Z",
  "execution_time_ms": 165000,
  "credits_used": 2.3,
  "success": true,
  "results": {
    "type": "table", // "table" | "text" | "json" | "file" | "chart"
    "data": {
      "columns": [
        {
          "key": "name",
          "label": "Full Name",
          "type": "text",
          "sortable": true,
          "filterable": true
        },
        {
          "key": "email",
          "label": "Email Address",
          "type": "email",
          "sortable": true,
          "filterable": true
        },
        {
          "key": "status",
          "label": "Status",
          "type": "status",
          "sortable": true,
          "filterable": true
        },
        {
          "key": "last_activity",
          "label": "Last Activity",
          "type": "date",
          "sortable": true
        },
        {
          "key": "total_orders",
          "label": "Total Orders",
          "type": "number",
          "sortable": true
        }
      ],
      "rows": [
        {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com",
          "status": "active",
          "last_activity": "2024-01-14T15:30:00Z",
          "total_orders": 5
        },
        {
          "id": 2,
          "name": "Jane Smith",
          "email": "jane@example.com",
          "status": "inactive",
          "last_activity": "2024-01-10T09:15:00Z",
          "total_orders": 12
        }
      ],
      "metadata": {
        "totalRows": 150,
        "source": "Google Sheets",
        "lastUpdated": "2024-01-15T10:32:45Z",
        "processingTime": "2.7s",
        "successCount": 148,
        "errorCount": 2
      }
    }
  },
  "error": null,
  "warnings": [
    "2 rows contained invalid email addresses and were flagged"
  ],
  "logs": [
    "Connected to Google Sheets API",
    "Read 150 rows from Sheet1",
    "Applied email validation",
    "Removed 3 duplicate entries",
    "Enriched 145 records with additional data"
  ]
}
```

## 🎛️ n8n Integration Format

### **n8n Workflow Node Configuration**

```json
{
  "name": "Front& Workflow Executor",
  "type": "frontand-workflow",
  "typeVersion": 1,
  "parameters": {
    "workflow_id": "google-sheets-processor",
    "api_endpoint": "https://api.frontand.dev/v1/workflows/execute",
    "api_key": "{{$credentials.frontandApi.api_key}}",
    "inputs": {
      "spreadsheet_url": "={{$node.GoogleSheets.json.spreadsheetUrl}}",
      "sheet_name": "={{$parameter.sheetName}}",
      "operation": "read_and_process",
      "processing_options": {
        "remove_duplicates": "={{$parameter.removeDuplicates}}",
        "validate_emails": true,
        "enrich_data": "={{$parameter.enrichData}}"
      }
    },
    "webhook_url": "={{$parameter.webhookUrl}}",
    "async_execution": true
  },
  "credentials": {
    "frontandApi": {
      "api_key": "frontand_api_key_here"
    }
  }
}
```

### **n8n Output Format**

```json
{
  "json": {
    "execution_id": "exec_1234567890",
    "status": "completed",
    "frontand_data": {
      "columns": [...],
      "rows": [...],
      "metadata": {...}
    },
    "processed_count": 148,
    "error_count": 2,
    "execution_time": "2.7s"
  },
  "binary": {},
  "pairedItem": {
    "item": 0
  }
}
```

## 🚀 Modal.com Integration Format

### **Modal Function Definition**

```python
# modal_workflow.py
import modal
import json
from typing import Dict, Any, List

app = modal.App("frontand-workflows")

@app.function(
    image=modal.Image.debian_slim().pip_install(
        "pandas", "gspread", "validators", "requests"
    ),
    secrets=[
        modal.Secret.from_name("google-sheets-creds"),
        modal.Secret.from_name("frontand-api-key")
    ],
    timeout=600,
    memory=1024
)
def process_google_sheets(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process Google Sheets data according to Front& workflow specification
    """
    try:
        # Extract inputs
        inputs = request_data.get("inputs", {})
        spreadsheet_url = inputs.get("spreadsheet_url")
        sheet_name = inputs.get("sheet_name", "Sheet1")
        processing_options = inputs.get("processing_options", {})
        
        # Your processing logic here
        result_data = perform_sheets_processing(
            spreadsheet_url, 
            sheet_name, 
            processing_options
        )
        
        # Return in Front& format
        return {
            "execution_id": request_data.get("execution_id"),
            "status": "completed",
            "success": True,
            "results": {
                "type": "table",
                "data": result_data
            },
            "execution_time_ms": int((time.time() - start_time) * 1000),
            "credits_used": calculate_credits(result_data),
            "logs": ["Processing completed successfully"]
        }
        
    except Exception as e:
        return {
            "execution_id": request_data.get("execution_id"),
            "status": "failed",
            "success": False,
            "error": str(e),
            "logs": [f"Error: {str(e)}"]
        }

@app.webhook(method="POST", label="frontand-sheets-webhook")
def webhook_handler(request_data: Dict[str, Any]):
    """
    Webhook endpoint for Front& to trigger workflows
    """
    return process_google_sheets(request_data)
```

### **Modal Deployment Response**

```json
{
  "app_id": "frontand-workflows",
  "function_name": "process_google_sheets",
  "webhook_url": "https://your-modal-app.modal.run/frontand-sheets-webhook",
  "status": "deployed",
  "created_at": "2024-01-15T10:00:00Z",
  "configuration": {
    "timeout": 600,
    "memory": 1024,
    "max_concurrent": 10,
    "scaling": "auto"
  }
}
```

## 🔗 Webhook Format

### **Workflow Completion Webhook**

```json
{
  "event": "workflow.completed",
  "timestamp": "2024-01-15T10:32:45Z",
  "execution_id": "exec_1234567890",
  "workflow_id": "google-sheets-processor",
  "user_id": "user_abc123",
  "status": "completed",
  "success": true,
  "execution_time_ms": 165000,
  "credits_used": 2.3,
  "results_url": "https://api.frontand.dev/v1/executions/exec_1234567890/results",
  "metadata": {
    "total_rows_processed": 150,
    "success_count": 148,
    "error_count": 2
  }
}
```

### **Error Webhook**

```json
{
  "event": "workflow.failed",
  "timestamp": "2024-01-15T10:32:45Z",
  "execution_id": "exec_1234567890",
  "workflow_id": "google-sheets-processor",
  "user_id": "user_abc123",
  "status": "failed",
  "success": false,
  "error": {
    "code": "SHEETS_ACCESS_DENIED",
    "message": "Unable to access Google Sheets document. Check permissions.",
    "details": {
      "spreadsheet_url": "https://docs.google.com/spreadsheets/d/...",
      "http_status": 403
    }
  },
  "logs": [
    "Attempting to connect to Google Sheets",
    "Authentication successful",
    "Permission denied for spreadsheet access"
  ]
}
```

## 📊 Data Type Specifications

### **Column Types**

```typescript
interface TableColumn {
  key: string;              // Unique identifier
  label: string;            // Display name
  type: ColumnType;         // Data type
  width?: string;           // CSS width (e.g., "150px", "20%")
  sortable?: boolean;       // Enable sorting
  filterable?: boolean;     // Enable filtering
  required?: boolean;       // Required field
  validation?: ValidationRule;
}

type ColumnType = 
  | "text"           // General text
  | "number"         // Numeric values
  | "date"           // Date/datetime
  | "boolean"        // True/false
  | "email"          // Email addresses
  | "url"            // Web URLs
  | "status"         // Status badges
  | "currency"       // Monetary values
  | "percentage"     // Percentage values
  | "json"           // JSON objects
  | "file"           // File references
  | "image"          // Image URLs
  | "tags";          // Array of tags
```

### **Error Handling Format**

```json
{
  "errors": [
    {
      "row_id": 5,
      "column": "email",
      "error_type": "validation_failed",
      "message": "Invalid email format",
      "value": "invalid-email",
      "suggestion": "john@example.com"
    },
    {
      "row_id": 12,
      "column": "date",
      "error_type": "parse_error",
      "message": "Unable to parse date",
      "value": "2024-13-45",
      "suggestion": "2024-01-15"
    }
  ],
  "warnings": [
    {
      "type": "duplicate_detected",
      "message": "3 duplicate rows found and removed",
      "affected_rows": [15, 23, 87]
    }
  ]
}
```

## 🔧 Front& API Integration

### **Workflow Registration**

```json
{
  "workflow": {
    "id": "google-sheets-processor",
    "name": "Google Sheets Data Processor",
    "description": "Process and validate Google Sheets data with AI enhancement",
    "version": "1.0.0",
    "category": "data-processing",
    "pricing": {
      "base_cost": 0.2,
      "per_row_cost": 0.001,
      "per_api_call_cost": 0.01
    },
    "inputs": [
      {
        "key": "spreadsheet_url",
        "label": "Google Sheets URL",
        "type": "url",
        "required": true,
        "validation": {
          "pattern": "^https://docs\\.google\\.com/spreadsheets/",
          "message": "Must be a valid Google Sheets URL"
        }
      },
      {
        "key": "sheet_name",
        "label": "Sheet Name",
        "type": "text",
        "default": "Sheet1"
      }
    ],
    "outputs": {
      "type": "table",
      "schema": {
        "columns": "dynamic",
        "supports_export": true,
        "supports_pagination": true
      }
    },
    "endpoints": {
      "n8n": "https://your-n8n-instance.com/webhook/frontand-sheets",
      "modal": "https://your-modal-app.modal.run/frontand-sheets-webhook",
      "webhook": "https://api.frontand.dev/v1/webhooks/workflow-complete"
    }
  }
}
```

## 🎯 Integration Setup Instructions

### **For n8n:**

1. Create a new HTTP Request node
2. Set method to POST
3. URL: Your workflow endpoint
4. Headers: `{"Authorization": "Bearer YOUR_API_KEY", "Content-Type": "application/json"}`
5. Body: Use the request format above
6. Add webhook node for async responses

### **For Modal:**

1. Deploy the Modal function with webhook decorator
2. Configure secrets for API keys and credentials
3. Set up error handling and logging
4. Register webhook URL with Front&
5. Test with sample data

### **Testing Formats**

Use these curl commands to test your integrations:

```bash
# Test workflow execution
curl -X POST https://your-endpoint.com/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d @workflow_request.json

# Test webhook callback
curl -X POST https://frontand.dev/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d @webhook_response.json
```

This format ensures consistency across all Front& workflow integrations while providing flexibility for different data processing needs. 

## 📋 Overview

This document defines the standard JSON formats for workflow input/output data exchange between Front& and external platforms (n8n, Modal, webhooks).

## 🔄 Standard Workflow Request/Response Format

### **Workflow Execution Request**

```json
{
  "workflow_id": "google-sheets-processor",
  "execution_id": "exec_1234567890",
  "user_id": "user_abc123",
  "inputs": {
    "spreadsheet_url": "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "sheet_name": "Sheet1",
    "operation": "read_and_process",
    "range": "A1:Z1000",
    "filters": {
      "status": "active",
      "date_range": {
        "start": "2024-01-01",
        "end": "2024-12-31"
      }
    },
    "processing_options": {
      "remove_duplicates": true,
      "validate_emails": true,
      "enrich_data": true
    }
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "user_tier": "pro",
    "credits_available": 50.0,
    "estimated_cost": 2.5,
    "callback_url": "https://frontand.dev/api/webhooks/workflow-complete",
    "max_execution_time": 300
  }
}
```

### **Workflow Execution Response**

```json
{
  "execution_id": "exec_1234567890",
  "workflow_id": "google-sheets-processor",
  "status": "completed", // "pending" | "running" | "completed" | "failed"
  "started_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T10:32:45Z",
  "execution_time_ms": 165000,
  "credits_used": 2.3,
  "success": true,
  "results": {
    "type": "table", // "table" | "text" | "json" | "file" | "chart"
    "data": {
      "columns": [
        {
          "key": "name",
          "label": "Full Name",
          "type": "text",
          "sortable": true,
          "filterable": true
        },
        {
          "key": "email",
          "label": "Email Address",
          "type": "email",
          "sortable": true,
          "filterable": true
        },
        {
          "key": "status",
          "label": "Status",
          "type": "status",
          "sortable": true,
          "filterable": true
        },
        {
          "key": "last_activity",
          "label": "Last Activity",
          "type": "date",
          "sortable": true
        },
        {
          "key": "total_orders",
          "label": "Total Orders",
          "type": "number",
          "sortable": true
        }
      ],
      "rows": [
        {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com",
          "status": "active",
          "last_activity": "2024-01-14T15:30:00Z",
          "total_orders": 5
        },
        {
          "id": 2,
          "name": "Jane Smith",
          "email": "jane@example.com",
          "status": "inactive",
          "last_activity": "2024-01-10T09:15:00Z",
          "total_orders": 12
        }
      ],
      "metadata": {
        "totalRows": 150,
        "source": "Google Sheets",
        "lastUpdated": "2024-01-15T10:32:45Z",
        "processingTime": "2.7s",
        "successCount": 148,
        "errorCount": 2
      }
    }
  },
  "error": null,
  "warnings": [
    "2 rows contained invalid email addresses and were flagged"
  ],
  "logs": [
    "Connected to Google Sheets API",
    "Read 150 rows from Sheet1",
    "Applied email validation",
    "Removed 3 duplicate entries",
    "Enriched 145 records with additional data"
  ]
}
```

## 🎛️ n8n Integration Format

### **n8n Workflow Node Configuration**

```json
{
  "name": "Front& Workflow Executor",
  "type": "frontand-workflow",
  "typeVersion": 1,
  "parameters": {
    "workflow_id": "google-sheets-processor",
    "api_endpoint": "https://api.frontand.dev/v1/workflows/execute",
    "api_key": "{{$credentials.frontandApi.api_key}}",
    "inputs": {
      "spreadsheet_url": "={{$node.GoogleSheets.json.spreadsheetUrl}}",
      "sheet_name": "={{$parameter.sheetName}}",
      "operation": "read_and_process",
      "processing_options": {
        "remove_duplicates": "={{$parameter.removeDuplicates}}",
        "validate_emails": true,
        "enrich_data": "={{$parameter.enrichData}}"
      }
    },
    "webhook_url": "={{$parameter.webhookUrl}}",
    "async_execution": true
  },
  "credentials": {
    "frontandApi": {
      "api_key": "frontand_api_key_here"
    }
  }
}
```

### **n8n Output Format**

```json
{
  "json": {
    "execution_id": "exec_1234567890",
    "status": "completed",
    "frontand_data": {
      "columns": [...],
      "rows": [...],
      "metadata": {...}
    },
    "processed_count": 148,
    "error_count": 2,
    "execution_time": "2.7s"
  },
  "binary": {},
  "pairedItem": {
    "item": 0
  }
}
```

## 🚀 Modal.com Integration Format

### **Modal Function Definition**

```python
# modal_workflow.py
import modal
import json
from typing import Dict, Any, List

app = modal.App("frontand-workflows")

@app.function(
    image=modal.Image.debian_slim().pip_install(
        "pandas", "gspread", "validators", "requests"
    ),
    secrets=[
        modal.Secret.from_name("google-sheets-creds"),
        modal.Secret.from_name("frontand-api-key")
    ],
    timeout=600,
    memory=1024
)
def process_google_sheets(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process Google Sheets data according to Front& workflow specification
    """
    try:
        # Extract inputs
        inputs = request_data.get("inputs", {})
        spreadsheet_url = inputs.get("spreadsheet_url")
        sheet_name = inputs.get("sheet_name", "Sheet1")
        processing_options = inputs.get("processing_options", {})
        
        # Your processing logic here
        result_data = perform_sheets_processing(
            spreadsheet_url, 
            sheet_name, 
            processing_options
        )
        
        # Return in Front& format
        return {
            "execution_id": request_data.get("execution_id"),
            "status": "completed",
            "success": True,
            "results": {
                "type": "table",
                "data": result_data
            },
            "execution_time_ms": int((time.time() - start_time) * 1000),
            "credits_used": calculate_credits(result_data),
            "logs": ["Processing completed successfully"]
        }
        
    except Exception as e:
        return {
            "execution_id": request_data.get("execution_id"),
            "status": "failed",
            "success": False,
            "error": str(e),
            "logs": [f"Error: {str(e)}"]
        }

@app.webhook(method="POST", label="frontand-sheets-webhook")
def webhook_handler(request_data: Dict[str, Any]):
    """
    Webhook endpoint for Front& to trigger workflows
    """
    return process_google_sheets(request_data)
```

### **Modal Deployment Response**

```json
{
  "app_id": "frontand-workflows",
  "function_name": "process_google_sheets",
  "webhook_url": "https://your-modal-app.modal.run/frontand-sheets-webhook",
  "status": "deployed",
  "created_at": "2024-01-15T10:00:00Z",
  "configuration": {
    "timeout": 600,
    "memory": 1024,
    "max_concurrent": 10,
    "scaling": "auto"
  }
}
```

## 🔗 Webhook Format

### **Workflow Completion Webhook**

```json
{
  "event": "workflow.completed",
  "timestamp": "2024-01-15T10:32:45Z",
  "execution_id": "exec_1234567890",
  "workflow_id": "google-sheets-processor",
  "user_id": "user_abc123",
  "status": "completed",
  "success": true,
  "execution_time_ms": 165000,
  "credits_used": 2.3,
  "results_url": "https://api.frontand.dev/v1/executions/exec_1234567890/results",
  "metadata": {
    "total_rows_processed": 150,
    "success_count": 148,
    "error_count": 2
  }
}
```

### **Error Webhook**

```json
{
  "event": "workflow.failed",
  "timestamp": "2024-01-15T10:32:45Z",
  "execution_id": "exec_1234567890",
  "workflow_id": "google-sheets-processor",
  "user_id": "user_abc123",
  "status": "failed",
  "success": false,
  "error": {
    "code": "SHEETS_ACCESS_DENIED",
    "message": "Unable to access Google Sheets document. Check permissions.",
    "details": {
      "spreadsheet_url": "https://docs.google.com/spreadsheets/d/...",
      "http_status": 403
    }
  },
  "logs": [
    "Attempting to connect to Google Sheets",
    "Authentication successful",
    "Permission denied for spreadsheet access"
  ]
}
```

## 📊 Data Type Specifications

### **Column Types**

```typescript
interface TableColumn {
  key: string;              // Unique identifier
  label: string;            // Display name
  type: ColumnType;         // Data type
  width?: string;           // CSS width (e.g., "150px", "20%")
  sortable?: boolean;       // Enable sorting
  filterable?: boolean;     // Enable filtering
  required?: boolean;       // Required field
  validation?: ValidationRule;
}

type ColumnType = 
  | "text"           // General text
  | "number"         // Numeric values
  | "date"           // Date/datetime
  | "boolean"        // True/false
  | "email"          // Email addresses
  | "url"            // Web URLs
  | "status"         // Status badges
  | "currency"       // Monetary values
  | "percentage"     // Percentage values
  | "json"           // JSON objects
  | "file"           // File references
  | "image"          // Image URLs
  | "tags";          // Array of tags
```

### **Error Handling Format**

```json
{
  "errors": [
    {
      "row_id": 5,
      "column": "email",
      "error_type": "validation_failed",
      "message": "Invalid email format",
      "value": "invalid-email",
      "suggestion": "john@example.com"
    },
    {
      "row_id": 12,
      "column": "date",
      "error_type": "parse_error",
      "message": "Unable to parse date",
      "value": "2024-13-45",
      "suggestion": "2024-01-15"
    }
  ],
  "warnings": [
    {
      "type": "duplicate_detected",
      "message": "3 duplicate rows found and removed",
      "affected_rows": [15, 23, 87]
    }
  ]
}
```

## 🔧 Front& API Integration

### **Workflow Registration**

```json
{
  "workflow": {
    "id": "google-sheets-processor",
    "name": "Google Sheets Data Processor",
    "description": "Process and validate Google Sheets data with AI enhancement",
    "version": "1.0.0",
    "category": "data-processing",
    "pricing": {
      "base_cost": 0.2,
      "per_row_cost": 0.001,
      "per_api_call_cost": 0.01
    },
    "inputs": [
      {
        "key": "spreadsheet_url",
        "label": "Google Sheets URL",
        "type": "url",
        "required": true,
        "validation": {
          "pattern": "^https://docs\\.google\\.com/spreadsheets/",
          "message": "Must be a valid Google Sheets URL"
        }
      },
      {
        "key": "sheet_name",
        "label": "Sheet Name",
        "type": "text",
        "default": "Sheet1"
      }
    ],
    "outputs": {
      "type": "table",
      "schema": {
        "columns": "dynamic",
        "supports_export": true,
        "supports_pagination": true
      }
    },
    "endpoints": {
      "n8n": "https://your-n8n-instance.com/webhook/frontand-sheets",
      "modal": "https://your-modal-app.modal.run/frontand-sheets-webhook",
      "webhook": "https://api.frontand.dev/v1/webhooks/workflow-complete"
    }
  }
}
```

## 🎯 Integration Setup Instructions

### **For n8n:**

1. Create a new HTTP Request node
2. Set method to POST
3. URL: Your workflow endpoint
4. Headers: `{"Authorization": "Bearer YOUR_API_KEY", "Content-Type": "application/json"}`
5. Body: Use the request format above
6. Add webhook node for async responses

### **For Modal:**

1. Deploy the Modal function with webhook decorator
2. Configure secrets for API keys and credentials
3. Set up error handling and logging
4. Register webhook URL with Front&
5. Test with sample data

### **Testing Formats**

Use these curl commands to test your integrations:

```bash
# Test workflow execution
curl -X POST https://your-endpoint.com/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d @workflow_request.json

# Test webhook callback
curl -X POST https://frontand.dev/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d @webhook_response.json
```

This format ensures consistency across all Front& workflow integrations while providing flexibility for different data processing needs. 
 
 