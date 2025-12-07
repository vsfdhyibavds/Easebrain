#!/bin/bash

# EaseBrain Authentication & Authorization System - Setup Script
# Run this script to complete the one-time setup of the auth system

echo "🔐 EaseBrain Auth System Setup"
echo "================================"
echo ""

# Navigate to backend
cd backend-ease-brain || { echo "❌ Failed to cd into backend-ease-brain"; exit 1; }

echo "📦 Setting up database tables and initial roles..."
echo ""

# Run Python to set up tables and roles
python3 << 'EOF'
import sys
from extensions import db
from app import app

try:
    with app.app_context():
        # Create all tables
        print("📝 Creating database tables...")
        db.create_all()
        print("✅ Tables created successfully!")
        print("")

        # Seed initial roles
        print("🎭 Seeding initial roles...")
        from migrations.session_migration import seed_initial_roles, create_test_users_with_roles

        seed_initial_roles()
        print("✅ Initial roles created!")
        print("")

        # Create test users
        print("👥 Creating test users...")
        create_test_users_with_roles()
        print("✅ Test users created!")
        print("")

        # Verify setup
        print("🔍 Verifying setup...")
        from models.role import Role
        from models.user import User
        from utils.auth_helpers import get_user_roles

        roles = Role.query.all()
        users = User.query.all()

        print(f"   - Roles: {len(roles)}")
        print(f"   - Users: {len(users)}")

        # Show test user details
        if users:
            admin_user = User.query.filter_by(username='admin_test').first()
            if admin_user:
                print(f"\n👤 Test Admin User:")
                print(f"   - Email: admin@test.com")
                print(f"   - Password: AdminTest123!")
                print(f"   - Roles: {get_user_roles(admin_user.id)}")

        print("\n✅ Setup completed successfully!")

except Exception as e:
    print(f"\n❌ Setup failed with error:")
    print(f"   {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

EOF

if [ $? -ne 0 ]; then
    echo "❌ Setup failed. See errors above."
    exit 1
fi

echo ""
echo "================================"
echo "🎉 Setup Complete!"
echo "================================"
echo ""
echo "📚 Next steps:"
echo "   1. Read: AUTH_QUICKSTART.md - Quick reference guide"
echo "   2. Read: AUTHENTICATION_GUIDE.md - Detailed documentation"
echo "   3. Test: Login with admin@test.com / AdminTest123!"
echo "   4. View: Navigate to /admin after login"
echo "   5. Code: Check src/components/AuthExample.jsx for examples"
echo ""
echo "🔗 Important files:"
echo "   Backend:"
echo "     - backend-ease-brain/utils/auth_helpers.py"
echo "     - backend-ease-brain/models/session.py"
echo "   Frontend:"
echo "     - src/features/auth/AuthContext.jsx"
echo "     - src/hooks/useAuthz.js"
echo "     - src/components/RoleProtectedRoute.jsx"
echo ""
echo "✨ System Features:"
echo "   ✅ JWT with role claims"
echo "   ✅ Role-based access control"
echo "   ✅ Protected routes (frontend & backend)"
echo "   ✅ Session management"
echo "   ✅ Audit logging"
echo "   ✅ Authorization hooks and components"
echo ""
echo "Happy coding! 🚀"
