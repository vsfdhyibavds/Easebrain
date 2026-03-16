# EaseBrain Backend - Flask API

A comprehensive RESTful API for mental health support, crisis detection, and caregiving management built with Flask, SQLAlchemy, and PostgreSQL.

## 🏗️ Architecture

```
backend-ease-brain/
├── app.py                    # Flask application factory
├── models/                   # SQLAlchemy ORM models
│   ├── user.py
│   ├── role.py
│   ├── message.py
│   ├── conversation.py
│   ├── safety_plan.py
│   └── ...
├── resources/                # Flask-RESTful endpoints
│   ├── auth_resource.py
│   ├── role_resource.py
│   ├── message_resource.py
│   ├── caregiver_resource.py
│   ├── moderation_resource.py
│   └── ...
├── routes/                   # Blueprint routes
├── utils/                    # Helper functions
│   ├── danger_detector.py    # AI crisis detection
│   ├── send_email.py         # SendGrid integration
│   ├── rate_limiter.py
│   ├── csrf_protection.py
│   ├── audit_logger.py
│   └── ...
├── migrations/               # Alembic database migrations
└── requirements.txt          # Python dependencies
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL (or SQLite for development)
- pip or conda

### Setup

```bash
cd backend-ease-brain
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
FRONTEND_URL=http://localhost:5173
VERIFY_BASE_URL=http://localhost:5173
FLASK_ENV=development
FLASK_DEBUG=1
DATABASE_URL=sqlite:///easebrain_dev.db
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-secret-change-in-production
SENDGRID_API_KEY=your-sendgrid-api-key
SENDER_EMAIL=your-email@example.com
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
EOF

# Initialize database
flask db upgrade

# Seed initial roles
python seed_roles.py

# Start development server
python app.py
```

Server runs on: `http://localhost:5500`

## 🔐 Security & Authentication

### JWT Authentication

- **Tokens**: Issued on login/signup, include user ID and role
- **Expiration**: 24 hours (configurable via `JWT_EXPIRATION_HOURS`)
- **Refresh**: Password reset invalidates all tokens
- **Claims**: User ID, email, role info

### Password Security

- **Hashing**: bcrypt with cost factor of 12
- **Verification**: Constant-time comparison to prevent timing attacks
- **Reset**: Email-based reset with time-limited tokens

### CORS Protection

```python
# Configured in app.py
cors_origins = [
    "http://localhost:5173",      # Development
    "http://localhost:3000",
    "http://www.easebrain.live",  # Production
    "https://www.easebrain.live",
]
```

### Rate Limiting

Per-endpoint configuration:
- Login: 5/minute (prevent brute force)
- Signup: 5/minute
- Other endpoints: 200/day, 50/hour
- Configurable via environment variables

### CSRF Protection

- Session-based token generation
- Secure HttpOnly cookies
- SameSite=Strict for same-origin-only behavior
- Secret key rotation on app restart

### Secrets Management

⚠️ **CRITICAL**: Never commit `.env` files or API keys to git.

**If a secret was exposed:**
```bash
# 1. Rotate the credential (e.g., SendGrid API key)
# 2. Remove from git history
./scripts/remove_secrets.sh
# 3. Force push (coordinate with team)
git push --force origin main
```

### Audit Logging

All significant actions logged:
- User authentication (login, signup, password reset)
- Admin actions
- Danger detection triggers
- API errors

Location: See logs in runtime console or check backend logs.

## 🚨 Danger Detection System

### Rule-Based Detection (Phase A)

**29 regex patterns** across 5 categories:
- **Suicidal Ideation**: 8 patterns (highest weight)
- **Means/Method**: 6 patterns
- **Plan**: 5 patterns
- **Self-Harm**: 5 patterns
- **Crisis/Hopelessness**: 5 patterns

### Severity Scoring

- **CRITICAL** (0.8-1.0): Immediate human review required
- **HIGH** (0.6-0.8): Escalate to caregiver/admin
- **MEDIUM** (0.4-0.6): Monitor and log
- **LOW** (0.2-0.4): Informational only

### LLM Enhancement (Phase B - Optional)

Supported models:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Ollama (self-hosted)

Toggle via environment variable in settings.

### Integration Points

- Message moderation (`/api/moderation` endpoint)
- Community post screening
- Caregiver notifications on detection
- Admin dashboard escalation queue

## 📊 Performance & Caching

### Database Optimization

- 18 strategic indexes on foreign keys
- O(1) lookups for common queries
- Connection pooling with SQLAlchemy

### Response Caching

- **Stats endpoints**: 10 minutes
- **User data**: 5 minutes
- **Community posts**: 15 minutes
- Cache invalidation on updates

### Health Monitoring

```bash
curl http://localhost:5500/api/health
```

Response includes:
- Server status
- Database connection status
- Cache status
- Email service status

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - User login
- `POST /api/auth/password-reset` - Initiate password reset
- `POST /api/auth/password-reset-confirm` - Confirm reset
- `POST /api/auth/verify-email` - Verify email

### Users

- `GET /api/users/<id>` - Get user profile
- `PUT /api/users/<id>` - Update profile
- `GET /api/current-user` - Get current user
- `POST /api/update-email` - Change email

### Roles

- `GET /api/roles` - List all roles
- `GET /api/roles/<id>` - Get role details
- `POST /api/roles` - Create role (admin only)
- `PUT /api/roles/<id>` - Update role (admin only)

### Messages & Conversations

- `GET /api/conversations` - List user's conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/<id>/messages` - Get messages
- `POST /api/conversations/<id>/messages` - Send message
- `POST /api/messages/<id>/reactions` - React to message

### Caregiver Features

- `GET /api/caregiver/dependents` - List dependents
- `POST /api/caregiver/dependents` - Add dependent
- `GET /api/caregiver/notes` - Get care notes
- `POST /api/caregiver/notes` - Create note
- `GET /api/caregiver/activities` - Get activities
- `POST /api/caregiver/alerts` - Send health alert

### Admin

- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - Manage users (paginated)
- `GET /api/admin/reports` - System reports
- `GET /api/admin/activity-feed` - Activity timeline
- `PUT /api/admin/users/<id>` - Update user (admin)
- `DELETE /api/admin/users/<id>` - Delete user (admin)

### Moderation

- `GET /api/moderation/queue` - Flagged content
- `POST /api/moderation/resolve` - Resolve flag
- `GET /api/moderation/stats` - Moderation statistics

### Health & System

- `GET /api/health` - System health status
- `GET /api/docs` - Swagger UI documentation
- `GET /api/openapi.json` - OpenAPI specification

## 📖 Complete API Documentation

Interactive API documentation available at:
```
http://localhost:5500/api/docs
```

Includes:
- All endpoints with descriptions
- Request/response examples
- Error codes and meanings
- Authentication requirements
- Try-it-out functionality

## 🐛 Error Handling

Structured error responses:

```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid input provided",
  "details": {
    "email": "Email must be valid"
  }
}
```

Error codes:
- `VALIDATION_ERROR` - Input validation failed (400)
- `AUTHENTICATION_ERROR` - Missing/invalid JWT (401)
- `AUTHORIZATION_ERROR` - Insufficient permissions (403)
- `NOT_FOUND` - Resource not found (404)
- `RATE_LIMIT_ERROR` - Rate limit exceeded (429)
- `INTERNAL_ERROR` - Server error (500)

## ✅ Testing

### Run Tests

```bash
# Run all tests
python -m pytest

# Run specific test file
python -m pytest tests/test_danger_detector.py

# Run with coverage
python -m pytest --cov=.
```

### Danger Detection Tests

- 20+ tests for rule-based detection
- Pattern matching validation
- Severity scoring verification
- Confidence scoring accuracy

### LLM Integration Tests

- 15+ tests for LLM enhancement
- Model response handling
- Fallback behavior
- Error recovery

## 📋 Development Workflow

### Database Migrations

```bash
# Create new migration (auto-detect changes)
flask db migrate -m "Description of change"

# Review migration file and adjust if needed
# migrations/versions/xxxxx_description.py

# Apply migration
flask db upgrade

# Rollback migration if needed
flask db downgrade
```

### Adding New Endpoints

1. Create model in `models/`:
   ```python
   class MyModel(db.Model):
       id = db.Column(db.Integer, primary_key=True)
       name = db.Column(db.String(255), nullable=False)
   ```

2. Create resource in `resources/`:
   ```python
   from flask_restful import Resource
   class MyResource(Resource):
       def get(self):
           return {"data": []}, 200
   ```

3. Register in `app.py`:
   ```python
   api.add_resource(MyResource, "/my-endpoint")
   ```

4. Test via Swagger UI or curl

### Code Style

- Follow PEP 8
- Use type hints for function signatures
- Document complex functions with docstrings
- Use meaningful variable names

## 🚀 Production Deployment

### Render.com

Configuration in `render.yaml`:

```yaml
buildCommand: pip install -r backend-ease-brain/requirements.txt
startCommand: cd backend-ease-brain && gunicorn app:app
```

Environment variables set in Render dashboard:
- `SECRET_KEY` - Flask secret for sessions
- `JWT_SECRET` - JWT signing key
- `SENDGRID_API_KEY` - Email service
- `DATABASE_URL` - PostgreSQL connection string

### Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] CORS origins updated
- [ ] SSL/TLS enabled
- [ ] Rate limiting enabled
- [ ] Audit logging enabled
- [ ] Error monitoring configured
- [ ] Backup strategy in place

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Lines of Code | 8000+ |
| API Endpoints | 50+ |
| Database Tables | 15+ |
| Test Cases | 35+ |
| Coverage | 85%+ |
| Detection Patterns | 29 |
| Documented Endpoints | 100% |

## 📞 Troubleshooting

### Database Connection Error
```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
# Reset database: rm easebrain_dev.db
# Re-apply migrations: flask db upgrade
```

### Roles Not Loading
```bash
# Seed roles
python seed_roles.py

# Or run auto-fix script from parent directory
bash fix-roles.sh
```

### Email Not Sending
```bash
# Check SENDGRID_API_KEY in .env
# Verify SENDER_EMAIL is set
# Check SendGrid dashboard for errors
```

### CORS Errors
```python
# Update cors_origins in app.py
cors_origins.append("your-frontend-domain")
```

## 📚 Related Documentation

- **Frontend**: See `../frontend-ease-brain/README.md`
- **Infrastructure**: See `../DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: See `../ROLES_TROUBLESHOOTING.md`
- **Domain Setup**: See `../DOMAIN_SETUP.md`

## 🔗 Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [SendGrid Documentation](https://docs.sendgrid.com/)

---

**Last Updated**: March 2026
**Status**: Production Ready
**Version**: 2.0.0
