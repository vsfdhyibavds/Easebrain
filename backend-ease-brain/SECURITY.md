# Security Guide

## Table of Contents

1. [Secrets Management](#secrets-management)
2. [SendGrid Security](#sendgrid-security)
3. [Environment Variables](#environment-variables)
4. [Authentication & Authorization](#authentication--authorization)
5. [Rate Limiting](#rate-limiting)
6. [CSRF Protection](#csrf-protection)
7. [Audit Logging](#audit-logging)
8. [Best Practices](#best-practices)
9. [Compliance & Audit](#compliance--audit)
10. [Emergency Procedures](#emergency-procedures)

---

## Secrets Management

Do NOT commit .env files or any file containing API keys, passwords or other secrets to source control. Use the provided `.env.example` as a template and set real values locally only.

### If a Secret Was Accidentally Committed

1. Add `.env` and related patterns to `.gitignore` (already done).
2. Run the helper script to remove `.env` from history (this rewrites commits):

   ```bash
   cd backend-ease-brain
   ./scripts/remove_secrets.sh
   ```

3. Force-push the cleaned history to the remote (coordinate with your team):

   ```bash
   git push --force origin main
   ```

4. Rotate any leaked credentials (e.g., SendGrid API key) immediately.

### Git Security Verification

To ensure no secrets are in your repo:

```bash
# Check for secrets in git history
git log -p | grep -i "SENDGRID_API_KEY\|api_key\|password"

# Check staged files
git diff --cached

# Check all untracked files
git status

# Check for common API key patterns
git log -p | grep -E "sk-|SG\.|api_key"
```

---

## SendGrid Security

### ⚠️ API Key Management

**CRITICAL:** Never expose SendGrid API keys in code, logs, or version control.

#### Key Rotation Procedure

1. **Revoke old key** in SendGrid Dashboard → API Keys Settings
2. **Generate new key** in SendGrid
3. **Update locally**: Edit `.env` with new key
4. **Test locally**: Verify new key works with test email
5. **Update production**: Deploy new `.env` to production server
6. **Notify team**: Let them know about the rotation
7. **Remove from git history**: Use `remove_secrets.sh` if exposed

#### Storage & Access

- Keys should only be stored in `.env` files (which are in `.gitignore`)
- Load via environment variables at runtime
- Never hardcode keys in source files
- Use password manager to share with team (1Password, LastPass, etc.)

### SendGrid Configuration

The backend securely initializes SendGrid with:

- API key from `SENDGRID_API_KEY` environment variable
- Optional EU data residency support (GDPR compliance)
- Error handling for SDK compatibility

See `utils/send_email.py` for implementation details.

### SendGrid Data Residency

- The backend can set SendGrid data residency to EU: `sg.set_sendgrid_data_residency('eu')`
- This is wrapped in try/except for compatibility with older SDKs
- If EU residency not needed, remove or comment out this call
- Configure via `SENDGRID_DATA_RESIDENCY=eu` environment variable
- Required for GDPR compliance with EU users

---

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/easebrain

# JWT Authentication
JWT_SECRET_KEY=your_secure_random_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# SendGrid Email (NEVER COMMIT ACTUAL KEY)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@easebrain.com
SENDGRID_DATA_RESIDENCY=eu  # Optional: eu or us

# App
FLASK_ENV=development
SECRET_KEY=your_app_secret_key_here
DEBUG=True
```

### Optional Variables

```bash
# Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# LLM Integration
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
OLLAMA_BASE_URL=http://localhost:11434

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Setup Instructions

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in actual values (never commit):

   ```bash
   # Edit .env with your real credentials
   vim .env
   ```

3. Verify `.env` is in `.gitignore`:

   ```bash
   grep "\.env" .gitignore
   ```

4. Load environment:
   ```bash
   # Automatically loaded by Flask/python-dotenv
   # Or manually: export $(cat .env | xargs)
   ```

### Key Variables Explained

| Variable                  | Purpose               | Example                        | Critical       |
| ------------------------- | --------------------- | ------------------------------ | -------------- |
| `SENDGRID_API_KEY`        | Email sending         | SG.FdMfK2fn...                 | 🔴 YES         |
| `SENDER_EMAIL`            | Email from address    | noreply@easebrain.com          | 🟡 YES         |
| `JWT_SECRET_KEY`          | Token signing         | random_secure_string           | 🔴 YES         |
| `DATABASE_URL`            | PostgreSQL connection | postgresql://user:pass@host/db | 🔴 YES         |
| `SECRET_KEY`              | Flask secret          | random_secure_string           | 🔴 YES         |
| `SENDGRID_DATA_RESIDENCY` | EU GDPR compliance    | eu or us                       | 🟡 CONDITIONAL |

---

## Authentication & Authorization

### JWT Authentication

**File**: `app.py` (lines 155-175)

The backend enforces hardened JWT authentication with required environment variable:

```python
jwt_secret = os.environ.get("JWT_SECRET_KEY")
if not jwt_secret:
    raise ValueError("JWT_SECRET_KEY environment variable is required")
app.config["JWT_SECRET_KEY"] = jwt_secret
```

### Role-Based Access Control (RBAC)

- **admin**: Full system access
- **caregiver**: Manage dependents
- **user/patient**: Messaging, health tracking

---

## Rate Limiting

**File**: `utils/rate_limiter.py` (34 lines)

Per-endpoint rate limiting prevents brute force attacks:

- **Login**: 5/min, 20/hour
- **Signup**: 3/min, 10/hour
- **Default**: 200/day, 50/hour

---

## CSRF Protection

**File**: `utils/csrf_protection.py` (110 lines)

Session-based CSRF protection with secure cookies (Secure, HttpOnly, SameSite=Strict).

---

## Audit Logging

**File**: `utils/audit_logger.py` (95 lines)

Comprehensive event logging for security:

- User authentication events
- Admin operations
- IP address tracking
- Log rotation: 10 MB per file, 10 backups

View logs: `tail logs/audit.log`

---

## Best Practices

### 1. Use `.env.example` as Template

Always maintain `.env.example` with:

- All required variable names
- Clear descriptions
- No actual secret values
- Placeholders like `your_api_key_here`

Example:

```bash
# .env.example (SAFE - NO SECRETS)
SENDGRID_API_KEY=your_sendgrid_api_key_here
JWT_SECRET_KEY=your_secure_random_key
DATABASE_URL=postgresql://user:password@localhost/dbname
```

### 2. Local Development Setup

```bash
# Step 1: Copy template
cp .env.example .env

# Step 2: Edit with your secrets
nano .env

# Step 3: Verify .gitignore
git check-ignore .env  # Should return: .env

# Step 4: Add to git (safely ignored)
git add .  # .env will be ignored automatically
```

### 3. Team Onboarding

- Share **ONLY** `.env.example` with team (safe, no secrets)
- Each developer creates their own `.env` locally
- Provide setup instructions for obtaining credentials
- Never share actual API keys via email/Slack/GitHub

Onboarding script example:

```bash
# Team member does this locally
cp .env.example .env

# Then contact PM/lead for actual secret values
# Update .env with those values
# Test: python -m flask run
```

### 4. Secret Rotation

When rotating credentials:

1. **Generate new credential** in external service (e.g., SendGrid, AWS)
2. **Update locally first**: Edit `.env` with new value
3. **Test locally**: Verify new credential works
4. **Notify team**: Let them know to update their `.env`
5. **Revoke old credential**: Delete from external service dashboard
6. **Update production**: Deploy new `.env` to production server
7. **Verify**: Test production integration

### 5. Credential Sharing

**NEVER Share Secrets Via:**

- Email
- Slack/Teams messages
- GitHub issues/comments
- Unencrypted messaging apps
- Code comments or documentation
- Screen sharing (visible on screen)

**DO Share Secrets Via:**

- Password manager (1Password, LastPass, Bitwarden)
- Encrypted channels (Signal, Wire)
- Secure credential management (HashiCorp Vault, AWS Secrets)
- One-on-one, in-person conversation
- Dedicated secret sharing tool (Teleport, Doppler)

### 6. Regular Audit Trail

Check for accidental secrets monthly:

```bash
# Check git history for API keys
git log -p | grep -i "api_key\|password\|secret\|sendgrid"

# Check all branches
git log --all -p | grep -i "SG\."

# Check for common key patterns
git diff HEAD~30 | grep -E "sk-[A-Za-z0-9]{20,}"
```

---

## Third-Party Integrations

### SendGrid (Email) 📧

- **Security**: API key stored in environment variable only
- **Verified Senders**: Use verified email addresses only
- **Compliance**: Support for EU data residency (GDPR)
- **Rate Limiting**: SendGrid enforces API rate limits
- **Logs**: Check SendGrid dashboard for send history

### Twilio (SMS, Optional) 📱

- **Security**: Credentials stored in environment variables
- **Configuration**: Account SID + Auth Token required
- **Rate Limiting**: Implement on backend to prevent abuse
- **Compliance**: Supports GDPR and CCPA

### OpenAI/Anthropic (LLM, Optional) 🤖

- **Security**: API keys stored in environment variables
- **Rate Limiting**: Implement on backend to prevent abuse
- **Data Privacy**: Ensure messages don't contain PII
- **Cost Control**: Monitor usage to avoid unexpected bills
- **Compliance**: Review terms for data handling

---

## Compliance & Audit

### GDPR (EU Users) 🇪🇺

- SendGrid EU data residency enabled: `SENDGRID_DATA_RESIDENCY=eu`
- Encryption at rest and in transit (TLS 1.2+)
- User data retention policies documented
- Right to be forgotten implemented
- Data processing agreements (DPA) in place

### HIPAA (If Handling Health Data) 🏥

- Secure data transmission (TLS 1.2+ with strong ciphers)
- Encryption at rest (AES-256 for sensitive data)
- Access logging for audit trails
- Regular security audits and penetration testing
- Business Associate Agreements (BAA) with vendors

### Security Checklist

- [ ] `.env` is in `.gitignore`
- [ ] `.env` is never committed
- [ ] `.env.example` has no actual secrets
- [ ] All team members have `.env.example`
- [ ] API keys rotated quarterly
- [ ] No secrets in code comments
- [ ] No secrets in git history
- [ ] Production credentials separate from development
- [ ] Data residency configured (if needed)
- [ ] CORS properly configured
- [ ] HTTPS enforced in production
- [ ] Regular security audits scheduled (monthly)
- [ ] Incident response plan documented
- [ ] Team trained on security best practices

---

## Emergency Procedures

### If You Discover a Leaked API Key

**ACTION REQUIRED - DO THIS NOW:**

1. **Revoke immediately** (within 5 minutes)
   - Go to SendGrid Dashboard → API Keys
   - Find and delete the exposed key
   - Do the same for any other leaked credentials

2. **Generate replacement**
   - Create new API key in SendGrid
   - Copy to secure location (password manager)

3. **Update locally**
   - Edit `.env` with new key
   - Test: Send test email with new key

4. **Clean git history**

   ```bash
   cd backend-ease-brain
   ./scripts/remove_secrets.sh
   git push --force origin main  # Coordinate with team!
   ```

5. **Update production**
   - Deploy new `.env` to all production servers
   - Restart services

6. **Notify team**
   - Email: "API key rotated, pull latest main"
   - Update team documentation
   - Schedule security review meeting

7. **Document incident**
   - What happened
   - When discovered
   - How remediated
   - Prevention plan

### Response Time Targets

- 🔴 CRITICAL (API exposed): < 5 minutes to revoke
- 🟠 HIGH (in git history): < 30 minutes to clean
- 🟡 MEDIUM (found in logs): < 1 hour to notify team
- 🟢 LOW (expired key): < 24 hours to rotate

---

## Quick Reference

```bash
# Setup new developer
cp .env.example .env
# Ask PM/lead for secret values
# Update .env
python -m flask run

# Rotate a secret
# 1. Generate new in SendGrid
# 2. Update .env
# 3. Test locally: python -m flask run
# 4. Commit & deploy
# 5. Notify team

# Check for exposed secrets
git log -p | grep -i "api_key"
git diff --cached | grep -E "sk-|SG\."

# Emergency revoke
# 1. Go to SendGrid dashboard
# 2. Delete the key
# 3. Generate new key
# 4. Update .env
# 5. Restart service
```

---

**Last Updated**: January 2026
**Version**: 2.0.0
**Status**: Comprehensive Security Guide (SENDGRID_SECURITY_STATUS.md consolidated)
