import logging
import re
import time
from datetime import datetime, timezone

from db.connection import get_db, fetchall
from services.ig_auth import get_ig_user_id, graph_get

logger = logging.getLogger(__name__)

_HASHTAG_RE = re.compile(r"#(\w+)", re.UNICODE)
GRAPH_VER = "v19.0"


# ── helpers ──────────────────────────────────────────────────────────────────

def _extract_hashtags(caption: str | None) -> list[str]:
    if not caption:
        return []
    return [h.lower() for h in _HASHTAG_RE.findall(caption)]


def _ts(s: str | None):
    if not s:
        return None
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


# ── own posts sync ────────────────────────────────────────────────────────────

def sync_own_posts() -> dict:
    ig_id = get_ig_user_id()
    if not ig_id:
        return {"error": "IG no conectado", "synced": 0}

    # Fetch all media (paginated)
    all_media = []
    cursor = None
    while True:
        params = {"fields": "id,caption,media_type,timestamp,permalink,like_count,comments_count", "limit": 50}
        if cursor:
            params["after"] = cursor
        data = graph_get(f"{ig_id}/media", params)
        all_media.extend(data.get("data", []))
        nxt = data.get("paging", {}).get("cursors", {}).get("after")
        if not nxt or nxt == cursor:
            break
        cursor = nxt

    synced = 0
    for m in all_media:
        media_id = m["id"]
        caption = m.get("caption", "")
        hashtags = _extract_hashtags(caption)

        # Try to get insights (impressions, reach, saved, shares)
        impressions = reach = saved = shares = None
        try:
            ins = graph_get(f"{media_id}/insights", {"metric": "impressions,reach,saved,shares"})
            for item in ins.get("data", []):
                name, val = item["name"], item["values"][0]["value"] if item.get("values") else item.get("value", 0)
                if name == "impressions":  impressions = val
                elif name == "reach":      reach = val
                elif name == "saved":      saved = val
                elif name == "shares":     shares = val
        except Exception as e:
            logger.debug("No insights for %s: %s", media_id, e)

        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO radar.ig_posts
                        (ig_media_id, media_type, caption, permalink, posted_at,
                         hashtags, impressions, reach, saved, likes, comments, shares)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (ig_media_id) DO UPDATE SET
                        caption=EXCLUDED.caption, hashtags=EXCLUDED.hashtags,
                        impressions=EXCLUDED.impressions, reach=EXCLUDED.reach,
                        saved=EXCLUDED.saved, likes=EXCLUDED.likes,
                        comments=EXCLUDED.comments, shares=EXCLUDED.shares,
                        synced_at=NOW()
                """, (
                    media_id, m.get("media_type"), caption,
                    m.get("permalink"), _ts(m.get("timestamp")),
                    hashtags, impressions, reach, saved,
                    m.get("like_count", 0), m.get("comments_count", 0), shares,
                ))
        synced += 1
        time.sleep(0.1)

    logger.info("ig_sync_own_posts: %d posts synced", synced)
    return {"synced": synced}


# ── hashtag scan ──────────────────────────────────────────────────────────────

def scan_hashtags(limit: int = 25) -> dict:
    """Scan up to `limit` active tracked hashtags. Meta allows 30 unique/7d."""
    ig_id = get_ig_user_id()
    if not ig_id:
        return {"error": "IG no conectado", "scanned": 0}

    tags = fetchall(
        "SELECT hashtag FROM radar.ig_tracked_hashtags WHERE active=TRUE ORDER BY hashtag LIMIT %s",
        (limit,)
    )

    scanned = errors = 0
    for row in tags:
        tag = row["hashtag"]
        try:
            # Step 1: get hashtag ID
            search = graph_get("ig_hashtag_search", {"q": tag, "user_id": ig_id})
            ids = search.get("data", [])
            if not ids:
                continue
            ht_id = ids[0]["id"]

            # Step 2: get media_count
            info = graph_get(ht_id, {"fields": "id,name"})
            media_count = None  # field not available via Basic API

            # Step 3: top_media for avg engagement
            top = graph_get(f"{ht_id}/top_media", {
                "user_id": ig_id,
                "fields": "id,like_count,comments_count",
                "limit": 20,
            })
            top_posts = top.get("data", [])
            avg_likes = avg_comments = None
            if top_posts:
                avg_likes    = sum(p.get("like_count", 0) for p in top_posts) / len(top_posts)
                avg_comments = sum(p.get("comments_count", 0) for p in top_posts) / len(top_posts)

            with get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO radar.ig_hashtag_metrics
                            (hashtag, media_count, top_post_likes_avg, top_post_comments_avg)
                        VALUES (%s, %s, %s, %s)
                    """, (tag, media_count, avg_likes, avg_comments))

            scanned += 1
            time.sleep(0.3)
        except Exception as e:
            logger.warning("Hashtag scan error for #%s: %s", tag, e)
            errors += 1

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO radar.sync_logs (sync_type, status, rows_fetched, finished_at)
                VALUES ('ig_hashtag_scan', %s, %s, NOW())
            """, ('success' if not errors else 'partial', scanned))

    logger.info("ig scan: scanned=%d errors=%d", scanned, errors)
    return {"scanned": scanned, "errors": errors}


def ig_full_sync() -> dict:
    posts = sync_own_posts()
    tags = scan_hashtags()
    return {"posts": posts, "hashtags": tags}
