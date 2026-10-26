#!/usr/bin/env python3
"""Upload parsed energy drinks and their images to the Energos API."""

from __future__ import annotations

import json
import mimetypes
import os
import uuid
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen


SOURCE = Path(__file__).with_name("parsed_items.json")
IMAGES_DIR = Path(__file__).with_name("images")
API_URL = "https://energos.fun/api/v1/energy-drinks/"


def request_json(url: str, token: str, payload: dict[str, object]) -> dict[str, object]:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = Request(
        url,
        data=body,
        headers={
            "Accept": "*/*",
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urlopen(request, timeout=30) as response:
        result = json.loads(response.read().decode("utf-8"))
    if not isinstance(result, dict):
        raise ValueError(f"API вернул неожиданный ответ для {url}")
    return result


def upload_image(url: str, token: str, image_path: Path) -> None:
    content_type = mimetypes.guess_type(image_path.name)[0] or "application/octet-stream"
    boundary = f"----EnergosBoundary{uuid.uuid4().hex}"
    file_data = image_path.read_bytes()
    header = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="image"; filename="{image_path.name}"\r\n'
        f"Content-Type: {content_type}\r\n\r\n"
    ).encode("utf-8")
    body = header + file_data + f"\r\n--{boundary}--\r\n".encode("utf-8")
    request = Request(
        url,
        data=body,
        headers={
            "Accept": "*/*",
            "Authorization": f"Bearer {token}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )
    with urlopen(request, timeout=30):
        pass


def main() -> None:
    token = os.environ.get("ENERGOS_TOKEN")
    if not token:
        raise SystemExit("Ошибка: задайте токен в переменной окружения ENERGOS_TOKEN")
    start_source_id = int(os.environ.get("ENERGOS_START_SOURCE_ID", "1"))

    try:
        items = json.loads(SOURCE.read_text(encoding="utf-8"))
        if not isinstance(items, list):
            raise ValueError(f"{SOURCE} должен содержать массив товаров")

        for item in items:
            source_id = item.get("id")
            if not isinstance(source_id, int):
                raise ValueError("У товара отсутствует числовой id")
            if source_id < start_source_id:
                continue

            payload = {
                "name": item["name"],
                "price": item["price"],
                "no_sugar": item["no_sugar"],
            }
            response = request_json(API_URL, token, payload)
            created_id = response.get("id")
            if not isinstance(created_id, int):
                raise ValueError(f"API не вернул числовой id для товара {source_id}")

            image_path = IMAGES_DIR / f"{source_id}.png"
            if image_path.exists():
                upload_image(urljoin(API_URL, f"{created_id}/image"), token, image_path)
                print(f"Готово: товар {created_id} и {image_path}")
            else:
                print(f"Готово: товар {created_id}; изображение не найдено: {image_path}")
    except (OSError, KeyError, TypeError, ValueError, HTTPError, URLError, json.JSONDecodeError) as error:
        raise SystemExit(f"Ошибка загрузки: {error}") from error


if __name__ == "__main__":
    main()
