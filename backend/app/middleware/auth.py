from functools import wraps

from flask import current_app, g, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from ..core.errors import ApiError
from ..core.db import get_db


def _serializer():
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"])


def generate_token(user_id: int, email: str) -> str:
    return _serializer().dumps({"user_id": user_id, "email": email})


def decode_token(token: str):
    max_age = current_app.config.get("TOKEN_EXPIRES_SECONDS", 60 * 60 * 24)
    return _serializer().loads(token, max_age=max_age)


def _extract_bearer_token() -> str:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise ApiError("UNAUTHORIZED", "Missing or invalid Authorization header", 401)
    token = auth.removeprefix("Bearer ").strip()
    if not token:
        raise ApiError("UNAUTHORIZED", "Empty bearer token", 401)
    return token


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _extract_bearer_token()
        try:
            payload = decode_token(token)
        except SignatureExpired:
            raise ApiError("TOKEN_EXPIRED", "Token expired", 401)
        except BadSignature:
            raise ApiError("UNAUTHORIZED", "Invalid token", 401)

        db = get_db()
        user = db.execute(
            "SELECT id, email, display_name, created_at, updated_at FROM users WHERE id = ?",
            (payload.get("user_id"),),
        ).fetchone()
        if user is None:
            raise ApiError("UNAUTHORIZED", "User not found", 401)

        g.current_user = user
        return fn(*args, **kwargs)

    return wrapper


def get_optional_user_id():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.removeprefix("Bearer ").strip()
    if not token:
        return None
    try:
        payload = decode_token(token)
        return payload.get("user_id")
    except Exception:
        return None

