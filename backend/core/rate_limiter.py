from fastapi import FastAPI
from fastapi_limitex import Limiter
from fastapi_limitex.keys import get_ip_from_header

limiter = Limiter(get_ip_from_header())


def setup_rate_limiter(app: FastAPI) -> None:
    limiter.attach(app)
