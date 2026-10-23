from email.message import EmailMessage
from pathlib import Path
from typing import Any, AsyncGenerator

from aiosmtplib import SMTP
from jinja2 import Environment, FileSystemLoader, select_autoescape

from core.config import settings

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"


class EmailClient:
    def __init__(self, smtp_client: SMTP):
        self.smtp_client: SMTP = smtp_client
        self.env = Environment(
            loader=FileSystemLoader(TEMPLATES_DIR),
            autoescape=select_autoescape(["html", "xml"]),
        )

    async def send_template_email(
        self,
        subject: str,
        to_email: str,
        template_name: str,
        context: dict[str, Any],
    ) -> None:
        html_body = self.env.get_template(template_name).render(**context)

        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = settings.email.SMTP_FROM
        message["To"] = to_email
        message["Reply-To"] = settings.email.SMTP_REPLY_TO

        message.set_content(html_body, subtype="html")

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
        verification_link = f"{settings.PUBLIC_URL}/auth/verify?token={token}"

        async for smtp_client in cls.get_session():
            client = cls(smtp_client)
            await client.send_template_email(
                subject="Подтвердите ваш e-mail",
                to_email=to_email,
                template_name="welcome.html",
                context={"verification_link": verification_link},
            )

    @classmethod
    async def send_reset_password_email(cls, to_email: str, token: str) -> None:
        reset_password_link = f"{settings.PUBLIC_URL}/auth/reset-password?token={token}"

        async for smtp_client in cls.get_session():
            client = cls(smtp_client)
            await client.send_template_email(
                subject="Сброс пароля",
                to_email=to_email,
                template_name="reset_password.html",
                context={"reset_password_link": reset_password_link},
            )
