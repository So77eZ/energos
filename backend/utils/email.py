from email.message import EmailMessage
from typing import AsyncGenerator

from aiosmtplib import SMTP

from core.config import settings


class EmailClient:
    def __init__(self, smtp_client: SMTP):
        self.smtp_client: SMTP = smtp_client

    async def send_email(self, subject: str, body: str, to_email: str) -> None:
        message = EmailMessage()
        message.set_content(body)
        message["Subject"] = subject
        message["From"] = settings.email.SMTP_FROM
        message["To"] = to_email
        await self.smtp_client.send_message(message)

    @classmethod
    async def get_session(cls) -> AsyncGenerator[SMTP, None]:
        async with SMTP(
            hostname=settings.email.SMTP_HOST,
            password=settings.email.SMTP_PASSWORD,
            port=settings.email.SMTP_PORT,
            use_tls=settings.email.SMTP_USE_TLS,
        ) as smtp_client:
            await smtp_client.login(settings.email.SMTP_USERNAME, settings.email.SMTP_PASSWORD)
            yield smtp_client

    @classmethod
    async def send_verification_email(cls, to_email: str, token: str) -> None:
        # Страница фронта (frontend/src/app/auth/verify): она отправляет токен POST-ом на /api/v1/auth/verify.
        # Прямая ссылка на API не работает — эндпоинт принимает только POST.
        verification_link = f"{settings.PUBLIC_URL}/auth/verify?token={token}"

        async for smtp_client in cls.get_session():
            client = cls(smtp_client)
            await client.send_email(
                subject="Verify your email",
                body=f"Please click the following link to verify your email: {verification_link}",
                to_email=to_email,
            )

    @classmethod
    async def send_reset_password_email(cls, to_email: str, token: str) -> None:
        reset_password_link = f"{settings.PUBLIC_URL}/api/v1/auth/reset-password?token={token}"

        async for smtp_client in cls.get_session():
            client = cls(smtp_client)
            await client.send_email(
                subject="Reset your password",
                body=f"Please click the following link to reset your password: {reset_password_link}",
                to_email=to_email,
            )
