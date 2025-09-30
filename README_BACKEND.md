# 🚀 FastAPI Backend Startup Guide

## Start the Backend Server

### Option 1: Using the run script (Recommended)
```bash
cd backend
python run.py
```

### Option 2: Using uvicorn directly
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## Test the Connection

### Quick Test
1. Open your browser
2. Go to: http://localhost:8000/health
3. You should see: `{"status": "healthy", "cors_origins": [...], "api_prefix": "/api"}`

### API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## If No Data Is Coming

### 1. Check if Backend is Running
Run this test:
```bash
python test_api_connection.py
```

### 2. Check Database Connection
Run this test:
```bash
python test_db_simple.py
```

### 3. Common Issues & Solutions

#### Issue: "Connection refused"
**Solution**: Start the backend server first:
```bash
cd backend && python run.py
```

#### Issue: "Database connection failed"
**Possible causes**:
- Database server is down
- Wrong credentials in `.env` file
- Firewall blocking connection
- Network connectivity issues

**Solution**: Check your `.env` file and database server status.

#### Issue: "CORS errors in browser"
**Solution**: The CORS is now properly configured in `config.py`. Restart the backend server.

## Environment Variables (.env file)

Make sure your `backend/.env` file has:
```
DB_SERVER=104.247.167.130,57673
DB_NAME=yazil112_events
DB_USER=yazil112_test2
DB_PASSWORD=GURkan5391
JWT_SECRET=your_secret_key_here
```

## Frontend Configuration

Make sure your React app is configured to call:
- API Base URL: http://localhost:8000/api
- CORS should work automatically with the new configuration

## Need Help?

If you're still getting "no data", please:
1. Start the backend server: `cd backend && python run.py`
2. Run the connection test: `python test_api_connection.py`
3. Check the database test: `python test_db_simple.py`
4. Share any error messages you see
