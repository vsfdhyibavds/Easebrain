#!/bin/bash
# Build script for unified deployment (frontend + backend)
# This script prepares the project for deployment where the backend serves the frontend

set -e

echo "🚀 Starting unified build process..."

# Check if we're in the right directory
if [ ! -d "backend-ease-brain" ] || [ ! -d "frontend-ease-brain" ]; then
    echo "❌ Error: This script must be run from the project root"
    echo "   Expected: backend-ease-brain/ and frontend-ease-brain/ directories"
    exit 1
fi

# Step 1: Build Frontend
echo ""
echo "📦 Building frontend..."
cd frontend-ease-brain
npm install
npm run build

# Step 2: Copy frontend build to backend public directory
echo ""
echo "📁 Copying frontend build to backend..."
cd ..
mkdir -p backend-ease-brain/public
rm -rf backend-ease-brain/public/*
cp -r frontend-ease-brain/dist/* backend-ease-brain/public/

# Step 3: Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend-ease-brain
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "✅ Build complete!"
echo ""
echo "📋 Next steps:"
echo "   Development: cd backend-ease-brain && python app.py"
echo "   Production:  cd backend-ease-brain && gunicorn app:app"
echo ""
echo "   Access at: http://localhost:5000 (development) or configured domain (production)"
