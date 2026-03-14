#!/usr/bin/env python3
"""
Test SendGrid functionality using the official SendGrid Python Library
Reference: https://github.com/sendgrid/sendgrid-python

Run this to test SendGrid email sending with full response details.
"""

import os
import logging
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


def send_test_email():
    """Send a test email and print full response details."""

    # Get credentials from environment
    sendgrid_api_key = os.environ.get("SENDGRID_API_KEY")
    from_email = os.environ.get("SENDER_EMAIL")
    to_email = os.environ.get("TEST_EMAIL", "test@example.com")

    if not sendgrid_api_key:
        logger.error("SENDGRID_API_KEY environment variable not set")
        return False

    if not from_email:
        logger.error("SENDER_EMAIL environment variable not set")
        return False

    try:
        # Create email message
        message = Mail(
            from_email=from_email,
            to_emails=to_email,
            subject="Sending with Twilio SendGrid is Fun",
            html_content="<strong>and easy to do anywhere, even with Python</strong>",
        )

        # Initialize SendGrid client and send
        sg = SendGridAPIClient(sendgrid_api_key)
        # sg.set_sendgrid_data_residency("eu")  # Uncomment if using regional EU subuser

        response = sg.send(message)

        # Print response details
        logger.info(f"Status Code: {response.status_code}")
        logger.info(f"Response Body: {response.body}")
        logger.info(f"Response Headers: {response.headers}")

        return response.status_code in [200, 201, 202]

    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        if hasattr(e, "message"):
            logger.error(f"Error message: {e.message}")
        return False


if __name__ == "__main__":
    success = send_test_email()
    exit(0 if success else 1)
