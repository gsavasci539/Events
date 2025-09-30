@echo off
cd /d "%~dp0backend"
echo 🚀 Starting Herbalife Events API...
echo 📍 Server will run on: http://localhost:8000
echo 📍 API documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.
python run.py
pause
