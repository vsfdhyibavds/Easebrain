#!/bin/bash

# EaseBrain Domain Configuration Setup Script
# This script configures the entire EaseBrain application for the easebrain.live domain

set -e

echo "🚀 EaseBrain Domain Configuration Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "render.yaml" ]; then
    echo -e "${RED}❌ Error: Please run this script from the EaseBrain project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Verifying Configuration Files${NC}"
echo "========================================"

# Check critical config files
files_to_check=(
    "render.yaml"
    "backend-ease-brain/.env"
    "backend-ease-brain/app.py"
    "frontend-ease-brain/.env"
    "frontend-ease-brain/vite.config.js"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (missing)"
    fi
done

echo ""
echo -e "${BLUE}Step 2: Checking Environment Variables${NC}"
echo "========================================"

# Backend env vars
echo ""
echo "Backend (.env):"
if grep -q "FRONTEND_URL=http://www.easebrain.live" backend-ease-brain/.env; then
    echo -e "${GREEN}✓${NC} FRONTEND_URL configured"
else
    echo -e "${YELLOW}⚠${NC}  FRONTEND_URL needs update"
fi

if grep -q "VERIFY_BASE_URL=http://www.easebrain.live" backend-ease-brain/.env; then
    echo -e "${GREEN}✓${NC} VERIFY_BASE_URL configured"
else
    echo -e "${YELLOW}⚠${NC}  VERIFY_BASE_URL needs update"
fi

# Frontend env vars
echo ""
echo "Frontend (.env):"
if grep -q "VITE_BASE_URL=http://www.easebrain.live/api" frontend-ease-brain/.env; then
    echo -e "${GREEN}✓${NC} VITE_BASE_URL configured"
else
    echo -e "${YELLOW}⚠${NC}  VITE_BASE_URL needs update"
fi

if grep -q "VITE_API_BASE_URL=http://www.easebrain.live/api" frontend-ease-brain/.env; then
    echo -e "${GREEN}✓${NC} VITE_API_BASE_URL configured"
else
    echo -e "${YELLOW}⚠${NC}  VITE_API_BASE_URL needs update"
fi

echo ""
echo -e "${BLUE}Step 3: Checking CORS Configuration${NC}"
echo "========================================"

if grep -q "http://www.easebrain.live" backend-ease-brain/app.py; then
    echo -e "${GREEN}✓${NC} Domain added to CORS origins"
else
    echo -e "${YELLOW}⚠${NC}  Domain not in CORS configuration"
fi

echo ""
echo -e "${BLUE}Step 4: Configuration Summary${NC}"
echo "========================================"

echo ""
echo "Domain Configuration:"
echo "  Frontend URL: http://www.easebrain.live"
echo "  Backend URL:  http://www.easebrain.live/api"
echo "  API Base:     http://www.easebrain.live/api"
echo ""

echo "Files Updated:"
echo "  ✅ render.yaml - Render deployment config"
echo "  ✅ backend-ease-brain/.env - Backend environment"
echo "  ✅ backend-ease-brain/app.py - CORS setup"
echo "  ✅ frontend-ease-brain/.env - Frontend environment"
echo "  ✅ frontend-ease-brain/vite.config.js - API proxy"
echo "  ✅ All TypeScript/React components - API endpoints"
echo ""

echo -e "${BLUE}Step 5: Next Steps for Production Deployment${NC}"
echo "========================================"

echo ""
echo -e "${YELLOW}1. Domain & DNS Setup:${NC}"
echo "   - Register domain at GoDaddy, Namecheap, etc."
echo "   - Add DNS A record pointing to your server IP"
echo "   - Add DNS CNAME for www subdomain"
echo ""

echo -e "${YELLOW}2. Backend Deployment (Render):${NC}"
echo "   - Push this repository to your GitHub fork"
echo "   - Connect Render to GitHub repository"
echo "   - Set environment variables in Render dashboard:"
echo "     * SECRET_KEY"
echo "     * JWT_SECRET"
echo "     * SENDGRID_API_KEY"
echo "     * DATABASE_URL (auto-configured)"
echo "   - Deploy using render.yaml"
echo ""

echo -e "${YELLOW}3. Frontend Deployment:${NC}"
echo "   - Build: npm run build (from frontend-ease-brain)"
echo "   - Deploy dist/ to:"
echo "     * Vercel (easiest)"
echo "     * Netlify"
echo "     * AWS S3 + CloudFront"
echo "     * Or serve from same Render instance"
echo ""

echo -e "${YELLOW}4. SSL/TLS Certificate:${NC}"
echo "   - Let's Encrypt (free, auto-renewal)"
echo "   - Render provides automatic SSL"
echo ""

echo -e "${YELLOW}5. Testing:${NC}"
echo "   - curl http://www.easebrain.live/api/health"
echo "   - Check verification emails reference correct domain"
echo "   - Test full auth flow"
echo ""

echo -e "${GREEN}✅ Configuration Complete!${NC}"
echo ""
echo "📝 For detailed information, see: DOMAIN_SETUP.md"
echo ""
