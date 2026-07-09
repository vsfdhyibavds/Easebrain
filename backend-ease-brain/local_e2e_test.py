import os
import json

os.environ["FLASK_ENV"] = "development"
os.environ["DATABASE_URL"] = "sqlite:////tmp/easebrain_test2.db"
os.environ["SECRET_KEY"] = "test-secret-key-local-e2e"
os.environ["JWT_SECRET_KEY"] = "test-jwt-secret-key-local-e2e"
os.environ["MOCK_EMAIL_MODE"] = "true"
os.environ["FRONTEND_URL"] = "http://localhost:5173"
os.environ["SENDER_EMAIL"] = "test@easebrain.live"
os.environ["VERIFY_BASE_URL"] = "http://localhost:5500"
os.environ["JWT_COOKIE_CSRF_PROTECT"] = "False"

# Disable rate limiting so E2E isn't throttled by the harness itself
import utils.rate_limiter as rl
rl.limiter.limit = lambda *a, **k: (lambda f: f)

if os.path.exists("/tmp/easebrain_test2.db"):
    os.remove("/tmp/easebrain_test2.db")

from app import app, db
from models.role import Role
from models.user import User
from models.user_verification import UserVerification

with app.app_context():
    db.create_all()
    for r in [
        {"name": "Patient", "role_type": "patient", "is_caregiver": False},
        {"name": "Caregiver", "role_type": "caregiver", "is_caregiver": True},
        {"name": "Admin", "role_type": "admin", "is_caregiver": False},
        {"name": "Organization", "role_type": "organization", "is_caregiver": False},
    ]:
        if not Role.query.filter_by(name=r["name"]).first():
            db.session.add(Role(**r))
    db.session.commit()

client = app.test_client()
results = []

def check(label, resp, expect_status=200):
    ok = resp.status_code == expect_status
    try:
        body = resp.get_json()
    except Exception:
        body = resp.get_data(as_text=True)[:300]
    print(f"[{'PASS' if ok else 'FAIL'}] {label} -> HTTP {resp.status_code} (expect {expect_status})")
    if not ok:
        print("   body:", json.dumps(body, default=str)[:600])
    results.append((label, ok))
    return body if ok else None

def auth_headers(token):
    return {"Authorization": f"Bearer {token}"} if token else {}

print("===== EASEBRAIN LOCAL E2E (post-CSRF-fix) =====")
check("GET /api/health", client.get("/api/health"), 200)
roles = check("GET /api/roles", client.get("/api/roles"), 200)
print("   roles:", [r["name"] for r in (roles or [])])

def signup(email, username, pw, role_id):
    return client.post("/api/signup", json={
        "username": username, "email": email, "password": pw,
        "first_name": username, "last_name": "Test", "role_id": role_id,
    })

def verify_and_login(email, pw):
    with app.app_context():
        u = User.query.filter_by(email=email).first()
        v = UserVerification.query.filter_by(user_id=u.id).first()
        tok = v.token
    client.get(f"/verify/{tok}")
    r = client.post("/api/login", json={"email": email, "password": pw})
    return r.get_json().get("access_token")

tokens = {}
for (email, uname, pw, rid, role) in [
    ("qa_patient@example.com", "qapatient", "Password123!", 1, "Patient"),
    ("qa_caregiver@example.com", "qacaregiver", "Password123!", 2, "Caregiver"),
    ("qa_admin@example.com", "qaadmin", "Password123!", 3, "Admin"),
]:
    check(f"SIGNUP {role}", signup(email, uname, pw, rid), 201)
    check(f"LOGIN pre-verify {role} (expect 401)", client.post("/api/login", json={"email": email, "password": pw}), 401)
    tokens[role] = verify_and_login(email, pw)
    check(f"LOGIN post-verify {role}", client.post("/api/login", json={"email": email, "password": pw}), 200)
    me = client.get("/api/me", headers=auth_headers(tokens[role]))
    check(f"GET /api/me {role}", me, 200)

P, C, A = tokens["Patient"], tokens["Caregiver"], tokens["Admin"]

# Conversation: caregiver (id 2) starts a conversation with dependent (patient id 1)
conv = client.post("/api/messages/conversation/start", headers=auth_headers(C),
                  json={"dependent_id": 1})
conv_id = conv.get_json().get("id") if conv.status_code in (200, 201) else None
check("POST /api/messages/conversation/start", conv, 201)

# WRITE operations (the previously CSRF-blocked paths)
m1 = client.post("/api/messages", headers=auth_headers(P),
                 json={"conversation_id": conv_id, "sender_id": 1, "receiver_id": 2, "content": "I feel great today"})
check("POST /api/messages (patient) [CSRF fix]", m1, 201)
m2 = client.post("/api/messages", headers=auth_headers(P),
                 json={"conversation_id": conv_id, "sender_id": 1, "receiver_id": 2, "content": "I want to kill myself"})
check("POST /api/messages crisis phrase [CSRF fix]", m2, 201)
note = client.post("/api/caregiver-notes", headers=auth_headers(C),
                   json={"caregiver_id": 2, "user_id": 1, "note": "Observation note"})
check("POST /api/caregiver-notes [CSRF fix]", note, 201)
rem = client.post("/api/reminders", headers=auth_headers(P),
                   json={"title": "Med", "description": "take", "remind_at": "2099-01-01T10:00:00"})
check("POST /api/reminders [CSRF fix]", rem, 201)

# READ operations by role
check("GET /api/caregiver/dashboard", client.get("/api/caregiver/dashboard", headers=auth_headers(C)), 200)
check("GET /api/admin/stats", client.get("/api/admin/stats", headers=auth_headers(A)), 200)
check("RBAC patient->admin (expect 403)", client.get("/api/admin/stats", headers=auth_headers(P)), 403)
# Moderation route now registered at /api/moderation/* ; unauth -> 401 (jwt_required)
check("GET /api/moderation/1/posts/pending (auth required)", app.test_client().get("/api/moderation/1/posts/pending"), 401)

# Auth edge cases (fresh client => no cookies)
anon = app.test_client()
bad = anon.get("/api/me", headers={"Authorization": "Bearer not.a.jwt"})
check("Invalid token /api/me (expect 401)", bad, 401)
noauth = anon.get("/api/me")
check("Missing token /api/me (expect 401)", noauth, 401)
check("Unauthenticated SIGNUP missing fields (expect 400)", anon.post("/api/signup", json={"email":"a@b.com"}), 400)

passed = sum(1 for _, ok in results if ok)
print(f"\n===== SUMMARY: {passed}/{len(results)} passed =====")
for label, ok in results:
    if not ok:
        print("  FAIL:", label)
