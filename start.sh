#!/bin/bash

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# 1. Check for .env
if [ ! -f "backend/.env" ]; then
    echo "⚠️  WARNING: backend/.env file not found!"
    echo "   Please create it from backend/.env.example and add your GOOGLE_API_KEY."
    echo "   The app may fail to function without it."
    read -p "   Press Enter to continue anyway, or Ctrl+C to stop..."
fi

# 1b. Create User Data Directory
if [ ! -d "backend/data/users" ]; then
    echo "Creating backend/data/users directory..."
    mkdir -p backend/data/users
fi

# 2. Setup Backend
echo "🔵 Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "   Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies (quietly)
echo "   Installing/Updating Python dependencies..."
pip install -r requirements.txt > /dev/null

# Start Backend
echo "🚀 Starting FastAPI Backend..."
python3 -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# 3. Setup Frontend
echo "🔵 Setting up Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "   Installing Node dependencies (this may take a minute)..."
    npm install > /dev/null 2>&1
fi

echo "🚀 Starting React Frontend..."
npm run dev -- --host & 
FRONTEND_PID=$!
cd ..

echo "------------------------------------------------"
echo "✅ CareerOps is running!"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo "------------------------------------------------"
echo "   Press Ctrl+C to stop both servers."

# 4. Cleanup
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

trap cleanup SIGINT

# Keep script running
wait
