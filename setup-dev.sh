#!/bin/bash
# Setup script for local development

set -e

echo "======================================================================"
echo "EaseBrain Local Development Setup"
echo "======================================================================"

cd "$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Python venv
echo -e "\n${BLUE}Setting up Python virtual environment...${NC}"
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo -e "${GREEN}Virtual environment created${NC}"
else
    echo -e "${GREEN}Virtual environment already exists${NC}"
fi

source .venv/bin/activate

# Step 2: Install backend dependencies
echo -e "\n${BLUE}Installing backend dependencies...${NC}"
cd backend-ease-brain
pip install -r requirements.txt
cd ..

# Step 3: Install frontend dependencies
echo -e "\n${BLUE}Installing frontend dependencies...${NC}"
cd frontend-ease-brain
npm install
cd ..

# Step 4: Setup backend .env
echo -e "\n${BLUE}Setting up backend environment...${NC}"
if [ ! -f "backend-ease-brain/.env" ]; then
    cp backend-ease-brain/.env.example backend-ease-brain/.env
    echo -e "${GREEN}Created backend-ease-brain/.env (please update with real values)${NC}"
else
    echo -e "${GREEN}backend-ease-brain/.env already exists${NC}"
fi

# Step 5: Setup frontend .env
echo -e "\n${BLUE}Setting up frontend environment...${NC}"
if [ ! -f "frontend-ease-brain/.env.local" ]; then
    cp frontend-ease-brain/.env.example frontend-ease-brain/.env.local
    echo -e "${GREEN}Created frontend-ease-brain/.env.local${NC}"
else
    echo -e "${GREEN}frontend-ease-brain/.env.local already exists${NC}"
fi

echo -e "\n${GREEN}======================================================================"
echo "Setup complete!"
echo "======================================================================"
echo "Next steps:"
echo "1. Update environment variables:"
echo "   - backend-ease-brain/.env"
echo "   - frontend-ease-brain/.env.local"
echo ""
echo "2. Generate secure keys (run in backend-ease-brain):"
echo "   python -c \"import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))\""
echo "   python -c \"import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))\""
echo ""
echo "3. Create PostgreSQL database locally or use:"
echo "   - Set DATABASE_URL in .env"
echo ""
echo "4. Run migrations:"
echo "   cd backend-ease-brain"
echo "   flask db upgrade"
echo ""
echo "5. Start development servers:"
echo "   Terminal 1: cd backend-ease-brain && python app.py"
echo "   Terminal 2: cd frontend-ease-brain && npm run dev"
echo "======================================================================"
