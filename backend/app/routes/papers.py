from flask import Blueprint, request

from ..core.db import dumps_json, get_db, row_to_dict, rows_to_dicts, utc_now_str
from ..core.errors import ApiError
from ..core.response import success_response
from ..middleware.auth import get_optional_user_id

bp = Blueprint("papers", __name__, url_prefix="/api/papers")


@bp.get("")
def list_papers():
    q = (request.args.get("q") or "").strip()
    year = request.args.get("year")
    domain = (request.args.get("domain") or "").strip()
    venue = (request.args.get("venue") or "").strip()

    try:
        page = max(int(request.args.get("page", 1)), 1)
        page_size = min(max(int(request.args.get("page_size", 10)), 1), 100)
    except ValueError:
        raise ApiError("INVALID_PAGINATION", "page/page_size must be integers", 400)

    where_clauses = []
    params = []

    if q:
        where_clauses.append("(title LIKE ? OR abstract LIKE ? OR keywords LIKE ?)")
        like = f"%{q}%"
        params.extend([like, like, like])

    if year:
        try:
            year_i = int(year)
            where_clauses.append("year = ?")
            params.append(year_i)
        except ValueError:
            raise ApiError("INVALID_YEAR", "year must be integer", 400)

    if domain:
        where_clauses.append("domain = ?")
        params.append(domain)
    if venue:
        where_clauses.append("venue = ?")
        params.append(venue)

    where_sql = ""
    if where_clauses:
        where_sql = "WHERE " + " AND ".join(where_clauses)

    db = get_db()
    count_row = db.execute(
        f"SELECT COUNT(*) AS cnt FROM papers {where_sql}",
        tuple(params),
    ).fetchone()
    total = count_row["cnt"]

    offset = (page - 1) * page_size
    rows = db.execute(
        f"""
        SELECT id, title, abstract, authors, year, domain, venue, keywords, source_url, created_at
        FROM papers
        {where_sql}
        ORDER BY year DESC, id DESC
        LIMIT ? OFFSET ?
        """,
        tuple(params + [page_size, offset]),
    ).fetchall()

    user_id = get_optional_user_id()
    db.execute(
        """
        INSERT INTO search_history (user_id, query_text, filters_json, result_count, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            user_id,
            q,
            dumps_json({"year": year, "domain": domain, "venue": venue}),
            total,
            utc_now_str(),
        ),
    )
    db.commit()

    return success_response(
        rows_to_dicts(rows),
        meta={
            "page": page,
            "page_size": page_size,
            "total": total,
        },
    )


@bp.get("/<int:paper_id>")
def paper_detail(paper_id: int):
    db = get_db()
    row = db.execute(
        """
        SELECT id, title, abstract, authors, year, domain, venue, keywords, source_url, created_at
        FROM papers WHERE id = ?
        """,
        (paper_id,),
    ).fetchone()
    if row is None:
        raise ApiError("PAPER_NOT_FOUND", "Paper not found", 404)
    return success_response(row_to_dict(row))

