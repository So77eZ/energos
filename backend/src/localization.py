from fastapi import Request

MESSAGES: dict[str, dict[str, str]] = {
    "username_taken": {
        "ru": "Пользователь с таким именем уже существует",
        "en": "Username already registered",
    },
    "invalid_credentials": {
        "ru": "Неверное имя пользователя или пароль",
        "en": "Incorrect username or password",
    },
    "auth_error": {
        "ru": "Недействительные учётные данные",
        "en": "Invalid authentication credentials",
    },
    "user_not_found": {"ru": "Пользователь не найден", "en": "User not found"},
    "review_not_found": {"ru": "Отзыв не найден", "en": "Review not found"},
    "not_allowed": {"ru": "Недостаточно прав", "en": "Not allowed"},
    "drink_not_found": {"ru": "Напиток не найден", "en": "Energy drink not found"},
    "emoji_already_added": {
        "ru": "Вы уже добавили этот эмодзи к отзыву",
        "en": "You have already added this emoji to the review",
    },
    "emoji_not_found": {
        "ru": "Реакция эмодзи не найдена",
        "en": "Emoji reaction not found",
    },
    "already_in_favorites": {
        "ru": "Уже в избранном",
        "en": "Already in favorites",
    },
    "not_in_favorites": {
        "ru": "Напитка нет в избранном",
        "en": "Energy drink not in favorites",
    },
    "path_payload_mismatch": {
        "ru": "review_id в пути и в теле запроса не совпадают",
        "en": "Path review_id and payload review_id do not match",
    },
}


def get_user_language(request: Request) -> str:
    accept = request.headers.get("accept-language", "")
    return "ru" if "ru" in accept.lower() else "en"


def localize_text(key: str, request: Request) -> str:
    lang = get_user_language(request)
    return MESSAGES[key][lang]
