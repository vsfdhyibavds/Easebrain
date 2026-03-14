#!/bin/bash

# EaseBrain Roles Troubleshooting & Fix Guide

echo "🔧 EaseBrain Roles Loading Troubleshooter"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running from backend directory
if [ ! -f "app.py" ]; then
    echo -e "${YELLOW}⚠️  Please run this from backend-ease-brain directory${NC}"
    echo "cd backend-ease-brain && bash ../fix-roles.sh"
    exit 1
fi

echo -e "${BLUE}Step 1: Checking Python environment${NC}"
echo "========================================"

# Check if venv is activated
if [[ -z "$VIRTUAL_ENV" ]]; then
    echo -e "${YELLOW}⚠️  Virtual environment not activated${NC}"
    echo "Activating venv..."
    if [ -d "venv" ]; then
        source venv/bin/activate
        echo -e "${GREEN}✓${NC} Virtual environment activated"
    else
        echo -e "${RED}✗${NC} venv directory not found"
        echo "Creating virtual environment..."
        python3 -m venv venv
        source venv/bin/activate
    fi
else
    echo -e "${GREEN}✓${NC} Virtual environment already active: $VIRTUAL_ENV"
fi

echo ""
echo -e "${BLUE}Step 2: Checking dependencies${NC}"
echo "========================================"

# Check required packages
packages=("flask" "flask-sqlalchemy" "flask-restful")
missing=false

for package in "${packages[@]}"; do
    if python -c "import ${package//-/_}" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $package"
    else
        echo -e "${YELLOW}⚠${NC}  $package missing"
        missing=true
    fi
done

if [ "$missing" = true ]; then
    echo ""
    echo "Installing missing dependencies..."
    pip install -r requirements.txt
fi

echo ""
echo -e "${BLUE}Step 3: Checking database${NC}"
echo "========================================"

# Verify database is accessible
if [ -f "easebrain_dev.db" ]; then
    echo -e "${GREEN}✓${NC} Database file found: easebrain_dev.db"
else
    echo -e "${YELLOW}⚠${NC}  SQLite database not found"
fi

echo ""
echo -e "${BLUE}Step 4: Seeding roles${NC}"
echo "========================================"

echo "Running seed_roles.py..."
python seed_roles.py

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Roles seeded successfully"
else
    echo -e "${RED}✗${NC} Failed to seed roles"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 5: Verifying roles in database${NC}"
echo "========================================"

python << 'PYTHON_EOF'
import sys
sys.path.insert(0, '.')

from app import app, db
from models.role import Role

with app.app_context():
    roles = Role.query.all()
    if roles:
        print(f"✓ Found {len(roles)} roles in database:\n")
        for role in roles:
            print(f"  ID: {role.id}, Name: {role.name}, Type: {role.role_type}, Caregiver: {role.is_caregiver}")
    else:
        print("✗ No roles found in database")
PYTHON_EOF

echo ""
echo -e "${BLUE}Step 6: Testing API endpoint${NC}"
echo "========================================"

echo ""
echo "Starting Flask backend for testing (running for 5 seconds)..."
echo "(This will show if the /api/roles endpoint works)"
echo ""

# Start Flask in background
python app.py > /tmp/flask_test.log 2>&1 &
FLASK_PID=$!

# Wait for Flask to start
sleep 2

# Test the endpoint
echo "Testing: curl http://localhost:5500/api/roles"
echo ""

response=$(curl -s http://localhost:5500/api/roles 2>&1)

if echo "$response" | grep -q "\["; then
    echo -e "${GREEN}✓${NC} API endpoint working!"
    echo "Response: $response" | head -c 200
    echo ""
else
    echo -e "${YELLOW}⚠${NC}  API not responding or error occurred"
    echo "Response: $response"
fi

# Kill Flask
kill $FLASK_PID 2>/dev/null

echo ""
echo ""
echo -e "${BLUE}Summary & Next Steps${NC}"
echo "========================================"

echo ""
echo "✅ Roles should now be loaded. To verify in your app:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   $ cd backend-ease-brain"
echo "   $ source venv/bin/activate"
echo "   $ python app.py"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   $ cd frontend-ease-brain"
echo "   $ npm run dev"
echo ""
echo "3. Open http://localhost:5173 and check if"
echo "   roles load in the Sign In dropdown"
echo ""
echo -e "${BLUE}If still not working:${NC}"
echo ""
echo "• Check browser console for errors (F12)"
echo "• Check backend logs for API errors"
echo "• Verify CORS settings in app.py"
echo "• Try clearing browser cache (Ctrl+Shift+Delete)"
echo "• Restart both servers"
echo ""

