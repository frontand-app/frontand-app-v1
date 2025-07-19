#!/usr/bin/env python3
"""
Simple script to run the CLOSED AI backend server
"""
import uvicorn
from app.main import app

if __name__ == "__main__":
    print("🚀 Starting CLOSED AI Backend Server...")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔗 API Base URL: http://localhost:8000")
    print("")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 