"""
SQLite Database Layer for Kisan AI Backend.
Uses Python's built-in sqlite3 — zero extra dependencies.
"""
import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'kisanai.db')


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")  # Better concurrency
    return conn


def init_db():
    """Create all tables if they don't exist. Called on startup."""
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS push_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            expo_push_token TEXT NOT NULL,
            location_lat REAL,
            location_lon REAL,
            language TEXT DEFAULT 'hi',
            registered_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS mandi_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            state TEXT UNIQUE NOT NULL,
            data TEXT NOT NULL,
            cached_at TEXT DEFAULT (datetime('now'))
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS chat_rate_limits (
            ip TEXT PRIMARY KEY,
            timestamps TEXT NOT NULL DEFAULT '[]',
            updated_at TEXT DEFAULT (datetime('now'))
        )
    """)

    conn.commit()
    conn.close()
    print("✅ Kisan AI DB initialized at:", DB_PATH)


# ─── Push Token Operations ────────────────────────────────────────────────────

def upsert_push_token(user_id: str, token: str, lat: float = None, lon: float = None, language: str = 'hi'):
    conn = get_db()
    conn.execute("""
        INSERT INTO push_tokens (user_id, expo_push_token, location_lat, location_lon, language, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id) DO UPDATE SET
            expo_push_token = excluded.expo_push_token,
            location_lat    = excluded.location_lat,
            location_lon    = excluded.location_lon,
            language        = excluded.language,
            updated_at      = datetime('now')
    """, (user_id, token, lat, lon, language))
    conn.commit()
    conn.close()


def get_all_push_tokens() -> list[dict]:
    conn = get_db()
    rows = conn.execute("SELECT * FROM push_tokens").fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ─── Mandi Cache Operations ───────────────────────────────────────────────────

def get_mandi_cache(state: str) -> list | None:
    conn = get_db()
    row = conn.execute(
        "SELECT data, cached_at FROM mandi_cache WHERE state = ?", (state,)
    ).fetchone()
    conn.close()
    if not row:
        return None
    # Cache valid for 30 minutes
    cached_at = datetime.fromisoformat(row['cached_at'])
    age_mins = (datetime.utcnow() - cached_at).total_seconds() / 60
    if age_mins > 30:
        return None
    return json.loads(row['data'])


def set_mandi_cache(state: str, data: list):
    conn = get_db()
    conn.execute("""
        INSERT INTO mandi_cache (state, data, cached_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(state) DO UPDATE SET
            data      = excluded.data,
            cached_at = datetime('now')
    """, (state, json.dumps(data)))
    conn.commit()
    conn.close()
