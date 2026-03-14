import jwt
import datetime
from utils.send_email import send_email_notification
import os

# Use unified environment variable or fallback for secret key
# Matches app.py which reads JWT_SECRET
SECRET_KEY = os.environ.get("JWT_SECRET", os.environ.get("JWT_SECRET_KEY", "fallback_dev_key"))


def generate_token(email):
    payload = {
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def verify_token(token):
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return data["email"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def send_verification_email(email, token):
    # Make verification base URL configurable to avoid hardcoding environments
    verify_base = os.environ.get("VERIFY_BASE_URL", "http://www.easebrain.live")
    # Blueprint is mounted at /api; keep the path consistent
    verify_link = f"{verify_base.rstrip('/')}/api/verify/{token}"
    subject = "Verify Your EaseBrain Account"

    return send_email_notification(
        recipient_email=email,
        subject=subject,
        template_data={
            "recipient_name": email,  # Using email as name if no other info available
            "subject": subject,
            "verification_url": verify_link,
            "plain_text": f"Hello,\nPlease verify your account by clicking this link: {verify_link}\n\nThanks!",
        },
    )
