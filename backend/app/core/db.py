import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from flask import current_app, g


def utc_now_str() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_db():
    if "db" not in g:
        db_path = Path(current_app.config["DATABASE"])
        db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        g.db = conn
    return g.db


def close_db(_=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    schema_path = Path(__file__).resolve().parent.parent / "schema.sql"
    db.executescript(schema_path.read_text(encoding="utf-8"))
    db.commit()
    _seed_papers_if_empty(db)


def _seed_papers_if_empty(db):
    row = db.execute("SELECT COUNT(*) AS cnt FROM papers").fetchone()
    if row["cnt"] > 0:
        return

    now = utc_now_str()
    seed_rows = [
        (
            "Attention Is All You Need",
            "We propose the Transformer, a model architecture based solely on attention mechanisms.",
            "Ashish Vaswani; Noam Shazeer; Niki Parmar",
            2017,
            "AI",
            "NeurIPS",
            "transformer,attention,nlp",
            "https://arxiv.org/abs/1706.03762",
            now,
        ),
        (
            "Segment Anything",
            "A foundation model for image segmentation with promptable interfaces.",
            "Alexander Kirillov; Eric Mintun",
            2023,
            "AI",
            "ICCV",
            "vision,segmentation,foundation-model",
            "https://arxiv.org/abs/2304.02643",
            now,
        ),
        (
            "A Survey of Medical Image Foundation Models",
            "This survey summarizes trends in medical image foundation models.",
            "Jane Doe; John Doe",
            2024,
            "Medical",
            "MICCAI",
            "medical,image,foundation-model",
            "https://example.org/medical-survey",
            now,
        ),
        (
            "Diffusion Policy for Robotics",
            "Using diffusion models for visuomotor policy learning in robotics.",
            "Cheng Chi; Zhenjia Xu",
            2023,
            "Robotics",
            "RSS",
            "robotics,diffusion,control",
            "https://arxiv.org/abs/2303.04137",
            now,
        ),
    ]

    db.executemany(
        """
        INSERT INTO papers
        (title, abstract, authors, year, domain, venue, keywords, source_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        seed_rows,
    )
    db.commit()


def row_to_dict(row):
    if row is None:
        return None
    return {k: row[k] for k in row.keys()}


def rows_to_dicts(rows):
    return [row_to_dict(r) for r in rows]


def dumps_json(value) -> str:
    return json.dumps(value, ensure_ascii=False)

