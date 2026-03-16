from flask import Blueprint, g, request
import sqlite3

from ..core.db import get_db, rows_to_dicts, utc_now_str
from ..core.errors import ApiError
from ..core.response import success_response
from ..middleware.auth import auth_required

bp = Blueprint("favorites", __name__, url_prefix="/api/favorites")


@bp.get("")
@auth_required
def list_favorites():
    db = get_db()
    rows = db.execute(
        """
        SELECT p.id, p.title, p.abstract, p.authors, p.year, p.domain, p.venue, p.keywords, p.source_url,
               f.created_at AS favorited_at
        FROM favorites f
        JOIN papers p ON p.id = f.paper_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
        """,
        (g.current_user["id"],),
    ).fetchall()
    return success_response(rows_to_dicts(rows))


@bp.post("")
@auth_required
def add_favorite():
    body = request.get_json(silent=True) or {}
    paper_id = body.get("paper_id")
    if not isinstance(paper_id, int):
        raise ApiError("INVALID_PAPER_ID", "paper_id must be integer", 400)

    db = get_db()
    paper = db.execute("SELECT id FROM papers WHERE id = ?", (paper_id,)).fetchone()
    if paper is None:
        raise ApiError("PAPER_NOT_FOUND", "Paper not found", 404)

    try:
        db.execute(
            "INSERT INTO favorites (user_id, paper_id, created_at) VALUES (?, ?, ?)",
            (g.current_user["id"], paper_id, utc_now_str()),
        )
        db.commit()
    except sqlite3.IntegrityError:
        pass

    return success_response({"paper_id": paper_id})


@bp.delete("/<int:paper_id>")
@auth_required
def remove_favorite(paper_id: int):
    db = get_db()
    db.execute(
        "DELETE FROM favorites WHERE user_id = ? AND paper_id = ?",
        (g.current_user["id"], paper_id),
    )
    db.commit()
    return success_response({"paper_id": paper_id})

