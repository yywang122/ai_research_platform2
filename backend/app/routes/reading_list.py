from flask import Blueprint, g, request
import sqlite3

from ..core.db import get_db, rows_to_dicts, utc_now_str
from ..core.errors import ApiError
from ..core.response import success_response
from ..middleware.auth import auth_required

bp = Blueprint("reading_list", __name__, url_prefix="/api/reading-list")

VALID_STATUS = {"unread", "reading", "done"}


@bp.get("")
@auth_required
def list_reading_list():
    status = (request.args.get("status") or "").strip()
    try:
        page = max(int(request.args.get("page", 1)), 1)
        page_size = min(max(int(request.args.get("page_size", 10)), 1), 100)
    except ValueError:
        raise ApiError("INVALID_PAGINATION", "page/page_size must be integers", 400)

    where = "WHERE rl.user_id = ?"
    params = [g.current_user["id"]]
    if status:
        if status not in VALID_STATUS:
            raise ApiError("INVALID_STATUS", "status must be unread/reading/done", 400)
        where += " AND rl.status = ?"
        params.append(status)

    offset = (page - 1) * page_size
    db = get_db()
    rows = db.execute(
        f"""
        SELECT p.id, p.title, p.year, p.domain, p.venue,
               rl.status, rl.priority, rl.note, rl.created_at, rl.updated_at
        FROM reading_list rl
        JOIN papers p ON p.id = rl.paper_id
        {where}
        ORDER BY rl.priority DESC, rl.updated_at DESC
        LIMIT ? OFFSET ?
        """,
        tuple(params + [page_size, offset]),
    ).fetchall()
    return success_response(rows_to_dicts(rows), meta={"page": page, "page_size": page_size})


@bp.post("")
@auth_required
def add_reading_item():
    body = request.get_json(silent=True) or {}
    paper_id = body.get("paper_id")
    priority = body.get("priority", 0)
    note = body.get("note")

    if not isinstance(paper_id, int):
        raise ApiError("INVALID_PAPER_ID", "paper_id must be integer", 400)
    if not isinstance(priority, int):
        raise ApiError("INVALID_PRIORITY", "priority must be integer", 400)

    db = get_db()
    paper = db.execute("SELECT id FROM papers WHERE id = ?", (paper_id,)).fetchone()
    if paper is None:
        raise ApiError("PAPER_NOT_FOUND", "Paper not found", 404)

    now = utc_now_str()
    try:
        db.execute(
            """
            INSERT INTO reading_list (user_id, paper_id, status, priority, note, created_at, updated_at)
            VALUES (?, ?, 'unread', ?, ?, ?, ?)
            """,
            (g.current_user["id"], paper_id, priority, note, now, now),
        )
        db.commit()
    except sqlite3.IntegrityError:
        db.execute(
            """
            UPDATE reading_list SET priority = ?, note = ?, updated_at = ?
            WHERE user_id = ? AND paper_id = ?
            """,
            (priority, note, now, g.current_user["id"], paper_id),
        )
        db.commit()

    return success_response({"paper_id": paper_id})


@bp.patch("/<int:paper_id>")
@auth_required
def update_reading_item(paper_id: int):
    body = request.get_json(silent=True) or {}
    fields = []
    params = []

    if "status" in body:
        status = body.get("status")
        if status not in VALID_STATUS:
            raise ApiError("INVALID_STATUS", "status must be unread/reading/done", 400)
        fields.append("status = ?")
        params.append(status)

    if "priority" in body:
        if not isinstance(body.get("priority"), int):
            raise ApiError("INVALID_PRIORITY", "priority must be integer", 400)
        fields.append("priority = ?")
        params.append(body.get("priority"))

    if "note" in body:
        fields.append("note = ?")
        params.append(body.get("note"))

    if not fields:
        raise ApiError("NO_UPDATES", "No update fields provided", 400)

    fields.append("updated_at = ?")
    params.append(utc_now_str())

    db = get_db()
    params.extend([g.current_user["id"], paper_id])
    cur = db.execute(
        f"UPDATE reading_list SET {', '.join(fields)} WHERE user_id = ? AND paper_id = ?",
        tuple(params),
    )
    db.commit()
    if cur.rowcount == 0:
        raise ApiError("NOT_FOUND", "Reading list item not found", 404)

    return success_response({"paper_id": paper_id})


@bp.delete("/<int:paper_id>")
@auth_required
def remove_reading_item(paper_id: int):
    db = get_db()
    db.execute(
        "DELETE FROM reading_list WHERE user_id = ? AND paper_id = ?",
        (g.current_user["id"], paper_id),
    )
    db.commit()
    return success_response({"paper_id": paper_id})

