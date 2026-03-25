#!/bin/bash
# Local simulation of Render build for testing before deployment

set -e

echo "======================================================================"
echo "EaseBrain Local Build Simulation (for Render.com)"
echo "======================================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

# Step 1: Install Python dependencies
echo -e "\n${BLUE}Step 1: Installing Python dependencies...${NC}"
cd backend-ease-brain
pip install -r requirements.txt

# Step 2: Install Node dependencies
echo -e "\n${BLUE}Step 2: Installing Node dependencies...${NC}"
cd ../frontend-ease-brain
npm install

# Step 3: Build frontend
echo -e "\n${BLUE}Step 3: Building frontend...${NC}"
VITE_BASE_URL=http://localhost:5000/api npm run build

# Step 4: Run database migrations
echo -e "\n${BLUE}Step 4: Running database migrations...${NC}"
cd ../backend-ease-brain
FLASK_ENV=production python -m flask db upgrade

echo -e "\n${GREEN}======================================================================"
echo "Build simulation complete!"
echo "======================================================================"
echo "Next steps:"
echo "1. Set environment variables in .env files"
echo "2. Run: cd backend-ease-brain && gunicorn -c gunicorn_config.py app:app"
echo "3. In another terminal: npm --prefix frontend-ease-brain run preview -- --host 0.0.0.0"
echo "4. Open http://localhost:3000"
echo "======================================================================"
