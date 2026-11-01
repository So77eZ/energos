from __future__ import annotations

from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send


class ContentTooLargeResponseMiddleware:
    def __init__(self, app: ASGIApp, response: JSONResponse) -> None:
        self.app = app
        self.response = response

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        async def send_wrapper(message: Message) -> None:
            if message["type"] == "http.response.start" and message["status"] == 413:
                await self.response(scope, receive, send)
                raise _ResponseReplaced
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        except _ResponseReplaced:
            pass


class _ResponseReplaced(Exception):
    pass
