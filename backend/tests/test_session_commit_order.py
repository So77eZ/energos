from typing import AsyncGenerator

from fastapi import FastAPI
from starlette.types import Message

from core.database import SessionDep, get_session


async def test_session_commits_before_response_is_sent() -> None:
    """Запись должна быть закоммичена до того, как клиент получит ответ: иначе чтение сразу
    после 201/204 видит старые данные (фронт так кешировал старый счётчик отзывов)."""
    events: list[str] = []

    async def fake_session() -> AsyncGenerator[object, None]:
        yield object()
        events.append("commit")

    app = FastAPI()
    app.dependency_overrides[get_session] = fake_session

    @app.post("/write")
    async def write(session: SessionDep) -> dict:
        return {}

    async def receive() -> Message:
        return {"type": "http.request", "body": b"", "more_body": False}

    async def send(message: Message) -> None:
        if message["type"] == "http.response.start":
            events.append(f"response {message['status']}")

    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": "POST",
        "scheme": "http",
        "path": "/write",
        "raw_path": b"/write",
        "root_path": "",
        "query_string": b"",
        "headers": [],
        "client": ("test", 1),
        "server": ("test", 80),
    }
    await app(scope, receive, send)

    assert events == ["commit", "response 200"]
