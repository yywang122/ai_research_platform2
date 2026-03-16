import json

from ..core.db import get_db, rows_to_dicts, utc_now_str


def generate_recommendations_for_user(user_id: int, top_k: int = 10):
    db = get_db()

    domain_rows = db.execute(
        """
        SELECT p.domain, COUNT(*) AS c
        FROM favorites f
        JOIN papers p ON p.id = f.paper_id
        WHERE f.user_id = ?
        GROUP BY p.domain
        ORDER BY c DESC
        """,
        (user_id,),
    ).fetchall()

    search_rows = db.execute(
        """
        SELECT filters_json
        FROM search_history
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 20
        """,
        (user_id,),
    ).fetchall()

    preferred_domains = {r["domain"] for r in domain_rows if r["domain"]}
    for sr in search_rows:
        if not sr["filters_json"]:
            continue
        try:
            payload = json.loads(sr["filters_json"])
            d = payload.get("domain")
            if d:
                preferred_domains.add(d)
        except Exception:
            continue

    placeholders = ",".join("?" for _ in preferred_domains) if preferred_domains else ""
    blocked = db.execute("SELECT paper_id FROM favorites WHERE user_id = ?", (user_id,)).fetchall()
    blocked_ids = {r["paper_id"] for r in blocked}

    if preferred_domains:
        candidate_sql = f"""
            SELECT * FROM papers
            WHERE domain IN ({placeholders})
            ORDER BY year DESC, id DESC
            LIMIT 50
        """
        candidates = db.execute(candidate_sql, tuple(preferred_domains)).fetchall()
    else:
        candidates = db.execute(
            "SELECT * FROM papers ORDER BY year DESC, id DESC LIMIT 50"
        ).fetchall()

    now = utc_now_str()
    result_rows = []
    db.execute("DELETE FROM recommendations WHERE user_id = ?", (user_id,))

    for c in candidates:
        if c["id"] in blocked_ids:
            continue
        score = 0.5
        if c["domain"] in preferred_domains:
            score += 0.3
        if c["year"]:
            score += min(max((c["year"] - 2018) * 0.02, 0), 0.2)
        reason = f"Matched domain preference ({c['domain']}) and recency heuristics."
        db.execute(
            """
            INSERT INTO recommendations (user_id, paper_id, reason, score, generated_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, c["id"], reason, score, now),
        )
        result_rows.append({
            "paper_id": c["id"],
            "score": round(score, 4),
            "reason": reason,
        })
        if len(result_rows) >= top_k:
            break

    db.commit()

    rows = db.execute(
        """
        SELECT r.id, r.user_id, r.paper_id, r.reason, r.score, r.generated_at,
               p.title, p.year, p.domain, p.venue
        FROM recommendations r
        JOIN papers p ON p.id = r.paper_id
        WHERE r.user_id = ?
        ORDER BY r.score DESC, r.generated_at DESC
        LIMIT ?
        """,
        (user_id, top_k),
    ).fetchall()

    return rows_to_dicts(rows)

