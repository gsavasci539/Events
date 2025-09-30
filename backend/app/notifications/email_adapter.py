from ..core.config import settings
import smtplib
from email.message import EmailMessage


class EmailAdapter:
    def send(self, to: str, message: str) -> tuple[bool, str]:
        if not settings.smtp_host or not settings.smtp_from:
            return False, "SMTP not configured"
        try:
            msg = EmailMessage()
            msg["From"] = settings.smtp_from
            msg["To"] = to
            msg["Subject"] = "Event Notification"
            msg.set_content(message)

            if settings.smtp_tls:
                server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
                server.starttls()
            else:
                server = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port)

            if settings.smtp_user and settings.smtp_password:
                server.login(settings.smtp_user, settings.smtp_password)

            server.send_message(msg)
            server.quit()
            return True, "Email sent"
        except Exception as e:
            return False, str(e)
