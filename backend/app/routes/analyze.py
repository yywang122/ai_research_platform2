from flask import Blueprint, g, request

from ..core.db import get_db, row_to_dict, rows_to_dicts, utc_now_str
from ..core.errors import ApiError
from ..core.response import success_response
from ..middleware.auth import auth_required
from ..services.analysis_service import run_analysis_stub

bp = Blueprint("analyze", __name__, url_prefix="/api/analyze")


@bp.post("")
@auth_required
def submit_analyze():
    body = request.get_json(silent=True) or {}
    paper_id = body.get("paper_id")
    force_refresh = bool(body.get("force_refresh", False))
    if not isinstance(paper_id, int):
        raise ApiError("INVALID_PAPER_ID", "paper_id must be integer", 400)

    db = get_db()
    paper = db.execute("SELECT id FROM papers WHERE id = ?", (paper_id,)).fetchone()
    if paper is None:
        raise ApiError("PAPER_NOT_FOUND", "Paper not found", 404)

    if not force_refresh:
        latest = db.execute(
            """
            SELECT * FROM ai_analysis_results
            WHERE paper_id = ? AND status = 'completed'
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (paper_id,),
        ).fetchone()
        if latest is not None:
            return success_response(row_to_dict(latest))

    now = utc_now_str()
    cur = db.execute(
        """
        INSERT INTO ai_analysis_results
        (paper_id, requested_by, status, created_at)
        VALUES (?, ?, 'pending', ?)
        """,
        (paper_id, g.current_user["id"], now),
    )
    db.commit()

    result = run_analysis_stub(cur.lastrowid)
    return success_response(result, 201)


@bp.get("/<int:paper_id>")
@auth_required
def latest_by_paper(paper_id: int):
    db = get_db()
    row = db.execute(
        """
        SELECT * FROM ai_analysis_results
        WHERE paper_id = ?
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (paper_id,),
    ).fetchone()
    if row is None:
        raise ApiError("ANALYSIS_NOT_FOUND", "No analysis found for paper", 404)
    return success_response(row_to_dict(row))


@bp.get("/history")
@auth_required
def history():
    status = (request.args.get("status") or "").strip()
    try:
        page = max(int(request.args.get("page", 1)), 1)
        page_size = min(max(int(request.args.get("page_size", 10)), 1), 100)
    except ValueError:
        raise ApiError("INVALID_PAGINATION", "page/page_size must be integers", 400)

    where = "WHERE ar.requested_by = ?"
    params = [g.current_user["id"]]
    if status:
        if status not in {"pending", "completed", "failed"}:
            raise ApiError("INVALID_STATUS", "status must be pending/completed/failed", 400)
        where += " AND ar.status = ?"
        params.append(status)

    offset = (page - 1) * page_size
    db = get_db()
    rows = db.execute(
        f"""
        SELECT ar.*, p.title
        FROM ai_analysis_results ar
        JOIN papers p ON p.id = ar.paper_id
        {where}
        ORDER BY ar.created_at DESC
        LIMIT ? OFFSET ?
        """,
        tuple(params + [page_size, offset]),
    ).fetchall()
    return success_response(rows_to_dicts(rows), meta={"page": page, "page_size": page_size})

