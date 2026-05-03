from fastapi import Request

MESSAGES: dict[str, dict[str, str]] = {
    "username_taken":      {"ru": "Пользователь с таким именем уже существует", "en": "Username already registered"},
    "invalid_credentials": {"ru": "Неверное имя пользователя или пароль",        "en": "Incorrect username or password"},
    "auth_error":          {"ru": "Недействительные учётные данные",              "en": "Invalid authentication credentials"},
    "user_not_found":      {"ru": "Пользователь не найден",                       "en": "User not found"},
    "review_not_found":    {"ru": "Отзыв не найден",                              "en": "Review not found"},
    "not_allowed":         {"ru": "Недостаточно прав",                            "en": "Not allowed"},
    "drink_not_found":     {"ru": "Напиток не найден",                            "en": "Energy drink not found"},
}


def get_lang(request: Request) -> str:
    accept = request.headers.get("accept-language", "")
    return "ru" if "ru" in accept.lower() else "en"


def t(key: str, request: Request) -> str:
    lang = get_lang(request)
    return MESSAGES[key][lang]
