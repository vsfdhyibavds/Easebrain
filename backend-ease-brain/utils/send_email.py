import os

try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, Email, To, Content

    _SENDGRID_AVAILABLE = True
except Exception:
    # SendGrid may not be installed in local/dev environments used for tests
    SendGridAPIClient = None
    Mail = None
    Email = None
    To = None
    Content = None
    _SENDGRID_AVAILABLE = False
from jinja2 import Environment, FileSystemLoader, select_autoescape
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up Jinja2 environment

# template_env = Environment(
#     loader=FileSystemLoader("email_templates"),
#     autoescape=select_autoescape(["html", "xml"]),
# )


template_dir = os.path.join(os.path.dirname(__file__), "email_templates")
template_env = Environment(
    loader=FileSystemLoader(template_dir), autoescape=select_autoescape(["html", "xml"])
)


def _create_sendgrid_client(api_key: str):
    """Create a SendGrid client and optionally set data residency from env.

    The SENDGRID_DATA_RESIDENCY environment variable may be set to a value
    like "eu". The SendGrid SDK method to set residency is only available
    in newer versions; wrap the call in try/except to remain compatible.
    """
    # If using mock email mode (dev/test), return None early
    if os.getenv("MOCK_EMAIL_MODE", "").lower() == "true":
        return None
    sg = SendGridAPIClient(api_key)
    residency = os.getenv("SENDGRID_DATA_RESIDENCY", "").strip().lower()
    if residency:
        try:
            sg.set_sendgrid_data_residency(residency)
            logger.info(f"Set SendGrid data residency to '{residency}'")
        except AttributeError:
            logger.warning(
                "SendGrid SDK does not support set_sendgrid_data_residency(); continuing without residency"
            )
        except Exception:
            logger.exception("Error while setting SendGrid data residency")
    return sg


def send_email_notification(recipient_email, subject, template_data):
    try:
        # Check if mock email mode is enabled (useful for development/testing)
        if os.getenv("MOCK_EMAIL_MODE", "").lower() == "true":
            verification_url = template_data.get("verification_url", "")
            logger.info(
                f"[MOCK EMAIL] Would send to {recipient_email}\n"
                f"Subject: {subject}\n"
                f"Verification URL: {verification_url}"
            )
            return True

        # Load SendGrid API key and sender email
        api_key = os.getenv("SENDGRID_API_KEY")
        sender_email = os.getenv("SENDER_EMAIL")

        # If SendGrid isn't available, log and return False (no-op for dev)
        if not _SENDGRID_AVAILABLE:
            logger.warning("SendGrid not installed; skipping email send (dev mode)")
            return False

        if not api_key:
            logger.error(
                "❌ SENDGRID_API_KEY is missing. "
                "Email cannot be sent. "
                "Ensure SENDGRID_API_KEY is set in your environment variables or .env file."
            )
            return False

        if not sender_email:
            logger.error(
                "❌ SENDER_EMAIL is missing. "
                "Email cannot be sent. "
                "Ensure SENDER_EMAIL is set in your environment variables or .env file."
            )
            return False

        # Warn if using Service Account key (starts with "SK") instead of Mail API key (starts with "SG")
        if api_key.startswith("SK"):
            logger.error(
                "SENDGRID_API_KEY appears to be a Service Account key (starts with 'SK'). "
                "Emails cannot be sent with Service Account keys. "
                "You need a Mail API key that starts with 'SG'. "
                "Generate one at: https://app.sendgrid.com/settings/api_keys"
            )
            return False

        # Validate sender email domain is verified in SendGrid
        if "@gmail.com" in sender_email.lower() and not os.getenv(
            "ALLOW_UNVERIFIED_SENDER"
        ):
            logger.warning(
                f"Sending from {sender_email}. "
                "Gmail addresses may not work with SendGrid unless the domain is verified. "
                "Consider using a domain you own and have verified in SendGrid."
            )

        #  Load and Render HTML email from Jinja2 template with data
        template = template_env.get_template("notification.html")
        html_content = template.render(**template_data)

        # Optional: fallback plain-text version
        plain_text = template_data.get(
            "plain_text",
            f"Please verify your email: {template_data.get('verification_url', '')}",
        )

        # Create SendGrid Mail object/ Build the email
        message = Mail(
            from_email=Email(sender_email),
            to_emails=To(recipient_email),
            subject=subject,
            html_content=html_content,
            plain_text_content=plain_text,
        )

        # Send the email via SendGrid (client created via helper that applies residency)
        sg = _create_sendgrid_client(api_key)
        if sg is None:
            logger.error("SendGrid client creation failed")
            return False
        response = sg.send(message)

        # Log full response details for easier diagnosis
        status = getattr(response, "status_code", None)
        headers = getattr(response, "headers", None)
        body = getattr(response, "body", None)

        logger.info(
            f"SendGrid response for {recipient_email} - status={status} headers={headers} body={body}"
        )

        # Return boolean success, but keep detailed logs for debugging
        if not (200 <= (status or 0) < 300):
            logger.error(
                f"SendGrid returned non-2xx for {recipient_email}: status={status} body={body} headers={headers}"
            )
            return False

        return True

    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return False


# Example usage
if __name__ == "__main__":
    recipient_email = "recipient@example.com"
    recipient_name = "Jane"
    subject = "Welcome to Our Platform!"
    verification_url = "https://example.com/verify-email?token=example-token-123"

    template_data = {
        "recipient_name": recipient_name,
        "subject": subject,
        "verification_url": verification_url,
        "plain_text": f"Hello {recipient_name},\nPlease verify your email: {verification_url}",
    }

    send_email_notification(
        recipient_email=recipient_email, subject=subject, template_data=template_data
    )
