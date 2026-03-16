from typing import Any

from ..core.db import dumps_json, get_db, row_to_dict, utc_now_str


def run_analysis_stub(analysis_id: int) -> dict[str, Any]:
    db = get_db()
    row = db.execute(
        """
        SELECT ar.id, ar.paper_id, p.title, p.abstract, p.keywords, p.domain
        FROM ai_analysis_results ar
        JOIN papers p ON p.id = ar.paper_id
        WHERE ar.id = ?
        """,
        (analysis_id,),
    ).fetchone()
    if row is None:
        raise ValueError("analysis record not found")

    title = row["title"] or "Unknown title"
    abstract = row["abstract"] or "No abstract provided."
    keywords = (row["keywords"] or "").split(",")
    keywords = [k.strip() for k in keywords if k.strip()]
    domain = row["domain"] or "General"

    summary = f"[{domain}] {title}: {abstract[:240]}"
    methodology = f"Rule-based stub analysis over title/abstract with keyword extraction ({', '.join(keywords[:5])})."
    applications = f"Potential applications inferred for {domain} domain from available abstract and keywords."
    tags = [domain.lower()] + [k.lower() for k in keywords[:4]]

    db.execute(
        """
        UPDATE ai_analysis_results
        SET summary = ?, methodology = ?, applications = ?, tags_json = ?,
            model_name = ?, status = 'completed', error_message = NULL,
            completed_at = ?
        WHERE id = ?
        """,
        (
            summary,
            methodology,
            applications,
            dumps_json(tags),
            "stub-analyzer-v1",
            utc_now_str(),
            analysis_id,
        ),
    )
    db.commit()

    done = db.execute(
        "SELECT * FROM ai_analysis_results WHERE id = ?",
        (analysis_id,),
    ).fetchone()
    return row_to_dict(done)

