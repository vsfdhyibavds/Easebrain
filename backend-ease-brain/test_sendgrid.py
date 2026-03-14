from sendgrid.helpers.mail import Mail


def build_test_message():
    return Mail(
        from_email="from_email@example.com",
        to_emails="to@example.com",
        subject="Sending with Twilio SendGrid is Fun",
        html_content="<strong>and easy to do anywhere, even with Python</strong>",
    )


def safe_send(sendgrid_client, message):
    """Wrapper used by tests so failures are returned as strings, not crashes."""
    try:
        response = sendgrid_client.send(message)
        return response.status_code
    except Exception as err:
        return str(err)


def test_build_test_message_subject():
    message = build_test_message()
    assert message.get().get("subject") == "Sending with Twilio SendGrid is Fun"


def test_safe_send_handles_exceptions_without_crashing():
    class FailingClient:
        def send(self, _message):
            raise RuntimeError("network disabled in test")

    result = safe_send(FailingClient(), build_test_message())
    assert "network disabled in test" in result
