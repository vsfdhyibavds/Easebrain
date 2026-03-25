#!/bin/bash
# Pre-deployment validation script for EaseBrain on Render
# This script checks that everything is configured correctly before deployment

set -e

echo "🔍 EaseBrain Pre-Deployment Validation"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

failed=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $1"
        failed=$((failed + 1))
        return 1
    fi
}

# Function to check if value is set in file
check_env_var() {
    if grep -q "^$1=" "$2" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 configured in $2"
        return 0
    else
        echo -e "${RED}✗${NC} $1 NOT configured in $2"
        failed=$((failed + 1))
        return 1
    fi
}

echo "📋 Checking Required Files..."
check_file "render.yaml"
check_file "backend-ease-brain/requirements.txt"
check_file "backend-ease-brain/app.py"
check_file "backend-ease-brain/gunicorn_config.py"
check_file "frontend-ease-brain/package.json"
check_file "RENDER_DEPLOYMENT.md"
echo ""

echo "🔧 Checking Python Configuration..."
check_file "backend-ease-brain/requirements.txt" && {
    if grep -q "gunicorn" backend-ease-brain/requirements.txt; then
        echo -e "${GREEN}✓${NC} Gunicorn in requirements.txt"
    else
        echo -e "${RED}✗${NC} Gunicorn missing from requirements.txt"
        failed=$((failed + 1))
    fi

    if grep -q "flask" backend-ease-brain/requirements.txt; then
        echo -e "${GREEN}✓${NC} Flask in requirements.txt"
    else
        echo -e "${RED}✗${NC} Flask missing from requirements.txt"
        failed=$((failed + 1))
    fi

    if grep -q "sqlalchemy" backend-ease-brain/requirements.txt; then
        echo -e "${GREEN}✓${NC} SQLAlchemy in requirements.txt"
    else
        echo -e "${RED}✗${NC} SQLAlchemy missing from requirements.txt"
        failed=$((failed + 1))
    fi

    if grep -q "psycopg2" backend-ease-brain/requirements.txt; then
        echo -e "${GREEN}✓${NC} psycopg2 in requirements.txt"
    else
        echo -e "${RED}✗${NC} psycopg2 missing from requirements.txt"
        failed=$((failed + 1))
    fi
}
echo ""

echo "📦 Checking Node/Frontend Configuration..."
check_file "frontend-ease-brain/package.json" && {
    if grep -q '"build"' frontend-ease-brain/package.json; then
        echo -e "${GREEN}✓${NC} build script in package.json"
    else
        echo -e "${RED}✗${NC} build script missing from package.json"
        failed=$((failed + 1))
    fi
}
echo ""

echo "🔐 Checking Environment Configuration..."
check_file ".env.render.example" && {
    check_env_var "SECRET_KEY" ".env.render.example"
    check_env_var "JWT_SECRET_KEY" ".env.render.example"
    check_env_var "SENDGRID_API_KEY" ".env.render.example"
    check_env_var "SENDER_EMAIL" ".env.render.example"
}
echo ""

echo "📝 Checking Documentation..."
check_file "RENDER_DEPLOYMENT.md"
check_file "PRODUCTION_CHECKLIST.md"
check_file "backend-ease-brain/requirements.txt"
echo ""

echo "🔄 Checking render.yaml Configuration..."
check_file "render.yaml" && {
    if grep -q "easebrain-backend" render.yaml; then
        echo -e "${GREEN}✓${NC} Backend service configured"
    else
        echo -e "${RED}✗${NC} Backend service not configured"
        failed=$((failed + 1))
    fi

    if grep -q "easebrain-db" render.yaml; then
        echo -e "${GREEN}✓${NC} Database service configured"
    else
        echo -e "${RED}✗${NC} Database service not configured"
        failed=$((failed + 1))
    fi

    if grep -q "npm install" render.yaml && grep -q "npm run build" render.yaml; then
        echo -e "${GREEN}✓${NC} Frontend build in build command"
    else
        echo -e "${YELLOW}!${NC} Frontend build might not be in build command"
    fi

    if grep -q "flask db upgrade" render.yaml; then
        echo -e "${GREEN}✓${NC} Database migrations in build command"
    else
        echo -e "${YELLOW}!${NC} Database migrations not in build command"
    fi

    if grep -q "gunicorn" render.yaml; then
        echo -e "${GREEN}✓${NC} Gunicorn in start command"
    else
        echo -e "${RED}✗${NC} Gunicorn not in start command"
        failed=$((failed + 1))
    fi
}
echo ""

echo "🗄️ Checking Database Configuration..."
check_file "backend-ease-brain/migrations/env.py" && {
    echo -e "${GREEN}✓${NC} Alembic migrations configured"
}
if [ -d "backend-ease-brain/migrations/versions" ]; then
    count=$(ls -1 backend-ease-brain/migrations/versions/*.py 2>/dev/null | wc -l)
    if [ $count -gt 0 ]; then
        echo -e "${GREEN}✓${NC} Migration files exist ($count files)"
    else
        echo -e "${YELLOW}!${NC} No migration files yet (might be first deploy)"
    fi
else
    echo -e "${YELLOW}!${NC} Migrations directory not found (might be first deploy)"
fi
echo ""

echo "========================================"
if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for deployment${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Connect repository to Render"
    echo "3. Set environment variables in Render dashboard:"
    echo "   - SECRET_KEY (generate with: python -c \"import secrets; print(secrets.token_hex(32))\")"
    echo "   - JWT_SECRET_KEY (generate with: python -c \"import secrets; print(secrets.token_hex(32))\")"
    echo "   - SENDGRID_API_KEY"
    echo "   - SENDER_EMAIL"
    echo "4. Deploy!"
    exit 0
else
    echo -e "${RED}❌ $failed check(s) failed. Fix above issues before deployment.${NC}"
    exit 1
fi
