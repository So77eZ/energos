import copy
import json
import logging
import sys
from contextvars import ContextVar
from datetime import UTC, datetime

request_id_var: ContextVar[str] = ContextVar("request_id", default="")


class RequestContextFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> logging.LogRecord:
        record = copy.copy(record)
        record.request_id = request_id_var.get()
        return record


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, object] = {
            "timestamp": datetime.fromtimestamp(record.created, UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": getattr(record, "request_id", "-"),
        }

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, ensure_ascii=False, default=str)


def setup_logging() -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(RequestContextFilter())
    handler.setFormatter(JsonFormatter())

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(handler)

    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        uvicorn_logger = logging.getLogger(name)
        uvicorn_logger.setLevel(logging.INFO)

        for uvicorn_handler in uvicorn_logger.handlers:
            uvicorn_logger.removeHandler(uvicorn_handler)

        uvicorn_logger.propagate = True

    for name in ("sqlalchemy.engine", "sqlalchemy.pool"):
        sqlalchemy_logger = logging.getLogger(name)
        sqlalchemy_logger.setLevel(logging.INFO)

        for sqlalchemy_handler in sqlalchemy_logger.handlers:
            sqlalchemy_logger.removeHandler(sqlalchemy_handler)

        sqlalchemy_logger.propagate = True
