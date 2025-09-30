from ..core.config import settings


class WhatsAppAdapter:
    def send(self, to: str, message: str) -> tuple[bool, str]:
        if not settings.twilio_account_sid or not settings.twilio_auth_token or not settings.twilio_whatsapp_from:
            return False, "Twilio WhatsApp not configured"
        # Placeholder for Twilio integration
        # from twilio.rest import Client
        # client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        # client.messages.create(from_=f"whatsapp:{settings.twilio_whatsapp_from}", to=f"whatsapp:{to}", body=message)
        return True, "Simulated WhatsApp sent"
