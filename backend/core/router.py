from collections.abc import Callable
from typing import Any

from fastapi import APIRouter, status


class AutoStatusAPIRouter(APIRouter):
    _DEFAULT_STATUS = {
        "POST": status.HTTP_201_CREATED,
        "PUT": status.HTTP_200_OK,
        "DELETE": status.HTTP_204_NO_CONTENT,
    }

    def add_api_route(self, path: str, endpoint: Callable[..., Any], **kwargs: Any) -> None:  # noqa: ANN401
        if kwargs.get("status_code") is None:
            if common_methods := self._DEFAULT_STATUS.keys() & set(kwargs.get("methods") or ()):
                kwargs["status_code"] = self._DEFAULT_STATUS[next(iter(common_methods))]

        return super().add_api_route(path, endpoint, **kwargs)
