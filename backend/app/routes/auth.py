from flask import Blueprint, g, request
from werkzeug.security import check_password_hash, generate_password_hash

from ..core.db import get_db, row_to_dict, utc_now_str
from ..core.errors import ApiError
from ..core.response import success_response
from ..middleware.auth import auth_required, generate_token

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.post("/register")
def register():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    display_name = (body.get("display_name") or "").strip()

    if not email or "@" not in email:
        raise ApiError("INVALID_EMAIL", "Valid email is required", 400)
    if len(password) < 6:
        raise ApiError("INVALID_PASSWORD", "Password must be at least 6 chars", 400)

    db = get_db()
    exists = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if exists:
        raise ApiError("EMAIL_EXISTS", "Email already registered", 409)

    now = utc_now_str()
    cur = db.execute(
        """
        INSERT INTO users (email, password_hash, display_name, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (email, generate_password_hash(password), display_name or None, now, now),
    )
    db.commit()

    user = db.execute(
        "SELECT id, email, display_name, created_at, updated_at FROM users WHERE id = ?",
        (cur.lastrowid,),
    ).fetchone()

    return success_response(row_to_dict(user), 201)


@bp.post("/login")
def login():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not email or not password:
        raise ApiError("INVALID_CREDENTIALS", "Email and password are required", 400)

    db = get_db()
    row = db.execute(
        "SELECT id, email, display_name, password_hash, created_at, updated_at FROM users WHERE email = ?",
        (email,),
    ).fetchone()
    if row is None or not check_password_hash(row["password_hash"], password):
        raise ApiError("INVALID_CREDENTIALS", "Invalid email or password", 401)

    token = generate_token(row["id"], row["email"])
    user = {
        "id": row["id"],
        "email": row["email"],
        "display_name": row["display_name"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }
    return success_response({"access_token": token, "user": user})


@bp.get("/me")
@auth_required
def me():
    return success_response(row_to_dict(g.current_user))

