import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from db.connection import get_db, fetchall
from services.ig_auth import ig_connected, get_ig_user_id, get_token, graph_get
from services.ig_sync import sync_own_posts, scan_hashtags, ig_full_sync
from services.ig_detector import detect_ig_opportunities

logger = logging.getLogger(__name__)
router = APIRouter()


class IGStatusUpdate(BaseModel):
    status: str
    status_note: Optional[str] = None


# ── status ────────────────────────────────────────────────────────────────────

@router.get("/radar/api/ig/status")
def ig_status():
    connected = ig_connected()
    ig_id = get_ig_user_id() if connected else None
    account_info = {}
    if connected and ig_id:
        try:
            info = graph_get(f"{ig_id}", {"fields": "id,username,followers_count,media_count"})
            account_info = {
                "username": info.get("username"),
                "followers": info.get("followers_count"),
                "posts": info.get("media_count"),
            }
        except Exception as e:
            logger.debug("Could not fetch IG account info: %s", e)

    # Summary from DB
    summary = {}
    try:
        rows = fetchall("""
            SELECT
                (SELECT COUNT(*) FROM radar.ig_posts) AS posts_synced,
                (SELECT COUNT(*) FROM radar.ig_tracked_hashtags WHERE active=TRUE) AS hashtags_tracked,
                (SELECT COUNT(*) FROM radar.ig_hashtag_metrics) AS metrics_rows,
                (SELECT COUNT(*) FROM radar.ig_opportunities WHERE status IN ('new','reviewed','in_progress')) AS active_opps,
                (SELECT MAX(scanned_at) FROM radar.ig_hashtag_metrics) AS last_hashtag_scan,
                (SELECT MAX(synced_at) FROM radar.ig_posts) AS last_post_sync
        """)
        if rows:
            r = rows[0]
            summary = {
                "posts_synced": r["posts_synced"],
                "hashtags_tracked": r["hashtags_tracked"],
                "metrics_rows": r["metrics_rows"],
                "active_opps": r["active_opps"],
                "last_hashtag_scan": r["last_hashtag_scan"].isoformat() if r["last_hashtag_scan"] else None,
                "last_post_sync": r["last_post_sync"].isoformat() if r["last_post_sync"] else None,
            }
    except Exception as e:
        logger.warning("ig_status db error: %s", e)

    return {"connected": connected, "ig_user_id": ig_id, "account": account_info, "summary": summary}


# ── sync endpoints ────────────────────────────────────────────────────────────

@router.post("/radar/api/ig/sync/posts")
def trigger_sync_posts():
    if not ig_connected():
        raise HTTPException(status_code=400, detail="Instagram no conectado")
    result = sync_own_posts()
    return result


@router.post("/radar/api/ig/sync/hashtags")
def trigger_scan_hashtags(limit: int = Query(25, ge=1, le=30)):
    if not ig_connected():
        raise HTTPException(status_code=400, detail="Instagram no conectado")
    result = scan_hashtags(limit=limit)
    return result


@router.post("/radar/api/ig/sync/full")
def trigger_ig_full():
    if not ig_connected():
        raise HTTPException(status_code=400, detail="Instagram no conectado")
    result = ig_full_sync()
    detect_ig_opportunities()
    return result


# ── opportunities ─────────────────────────────────────────────────────────────

@router.get("/radar/api/ig/opportunities")
def list_ig_opportunities(
    status: Optional[str] = None,
    opp_type: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    where = ["resolved_auto = FALSE"]
    params = []

    if status:
        where.append("status = %s")
        params.append(status)
    else:
        where.append("status NOT IN ('implemented','dismissed')")

    if opp_type:
        where.append("opp_type = %s")
        params.append(opp_type)

    if q:
        where.append("hashtag ILIKE %s")
        params.append(f"%{q}%")

    where_sql = "WHERE " + " AND ".join(where) if where else ""

    count_row = fetchall(f"SELECT COUNT(*) AS total FROM radar.ig_opportunities {where_sql}", params)
    total = count_row[0]["total"] if count_row else 0

    items = fetchall(
        f"""SELECT id, hashtag, opp_type, priority_score, status, recommendation_text,
                   created_at, last_seen_at, status_changed_at, status_note
            FROM radar.ig_opportunities
            {where_sql}
            ORDER BY priority_score DESC, created_at DESC
            LIMIT %s OFFSET %s""",
        params + [limit, offset],
    )

    return {
        "total": total,
        "items": [
            {
                **dict(r),
                "created_at": r["created_at"].isoformat() if r["created_at"] else None,
                "last_seen_at": r["last_seen_at"].isoformat() if r["last_seen_at"] else None,
                "status_changed_at": r["status_changed_at"].isoformat() if r["status_changed_at"] else None,
            }
            for r in items
        ],
    }


@router.patch("/radar/api/ig/opportunities/{opp_id}")
def update_ig_opportunity(opp_id: int, body: IGStatusUpdate):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, status FROM radar.ig_opportunities WHERE id=%s", (opp_id,))
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Oportunidad no encontrada")
            cur.execute("""
                UPDATE radar.ig_opportunities
                SET status=%s, status_note=%s, status_changed_at=NOW()
                WHERE id=%s
            """, (body.status, body.status_note, opp_id))
    return {"ok": True}


# ── posts ─────────────────────────────────────────────────────────────────────

@router.get("/radar/api/ig/posts")
def list_ig_posts(limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0)):
    items = fetchall(
        """SELECT ig_media_id, media_type, caption, permalink, posted_at,
                  hashtags, impressions, reach, saved, likes, comments, shares, synced_at
           FROM radar.ig_posts
           ORDER BY posted_at DESC NULLS LAST
           LIMIT %s OFFSET %s""",
        (limit, offset),
    )
    total_row = fetchall("SELECT COUNT(*) AS total FROM radar.ig_posts")
    total = total_row[0]["total"] if total_row else 0
    return {
        "total": total,
        "items": [
            {
                **dict(r),
                "posted_at": r["posted_at"].isoformat() if r["posted_at"] else None,
                "synced_at": r["synced_at"].isoformat() if r["synced_at"] else None,
            }
            for r in items
        ],
    }
