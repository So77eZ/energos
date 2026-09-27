import hmac

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from fastapi import Request

from config import settings


def client_ip_key(request: Request) -> str:
    """IP клиента для лимитов.

    Вход, регистрация и отзывы приходят с сервера Next, а не из браузера, и
    get_remote_address видит один IP на всех. Next передаёт реальный IP в
    X-Client-IP вместе с общим секретом; без верного секрета заголовок
    игнорируется, иначе лимит обходился бы подменой IP.
    """
    secret = settings.INTERNAL_API_SECRET
    client_ip = request.headers.get("x-client-ip")
    if secret and client_ip:
        given = request.headers.get("x-internal-secret", "")
        if hmac.compare_digest(given.encode(), secret.encode()):
            return client_ip
    return get_remote_address(request)


limiter = Limiter(key_func=client_ip_key)


async def rate_limit_exceeded_handler(request: Request, exc: Exception):
    assert isinstance(exc, RateLimitExceeded)
    return _rate_limit_exceeded_handler(request, exc)
