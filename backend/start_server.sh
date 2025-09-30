#!/bin/bash
echo "🚀 Starting Event Management Backend Server..."
echo "=" * 50
echo "📍 Server: http://localhost:8000"
echo "📍 API: http://localhost:8000/api"
echo "🌐 CORS Origins: http://88.230.79.211:5173, localhost:5173"
echo "=" * 50

# Start the server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
