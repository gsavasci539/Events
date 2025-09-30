#!/usr/bin/env python3

import uvicorn
import sys
import os

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

if __name__ == "__main__":
    print("🚀 Starting Herbalife Events API...")
    print("📍 Server will run on: http://localhost:8000")
    print("📍 API documentation: http://localhost:8000/docs")
    print("📍 Alternative docs: http://localhost:8000/redoc")
    print("-" * 50)

    uvicorn.run(
        "app.main:app",
        host="localhost",
        port=8000,
        reload=True,
        log_level="info"
    )
