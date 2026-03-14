def send_sms_notification(phone_number, message):
    """
    Send a notification via SendGrid email instead of SMS.
    The phone_number argument will be treated as the recipient's email address.
    """
    import os
    import logging
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
    from dotenv import load_dotenv

    load_dotenv()
    sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
    sender_email = os.getenv("SENDER_EMAIL")
    if not all([sendgrid_api_key, sender_email]):
        logging.error("SendGrid credentials missing")
        return False
    try:
        message_obj = Mail(
            from_email=sender_email,
            to_emails=phone_number,
            subject="Notification",
            plain_text_content=message,
        )
        sg = SendGridAPIClient(sendgrid_api_key)
        response = sg.send(message_obj)
        logging.info(f"Email sent to {phone_number}: {response.status_code}")
        logging.debug(f"Response body: {response.body}")
        logging.debug(f"Response headers: {response.headers}")
        return True
    except Exception as e:
        logging.error(f"Error sending email: {e}")
        return False
