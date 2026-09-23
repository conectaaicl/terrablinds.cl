import logging
import math
import re
import unicodedata

from db.connection import get_db, fetchall

logger = logging.getLogger(__name__)

# Sweet-spot: not too competitive, not too unknown
SWEET_MIN = 5_000
SWEET_MAX = 400_000
MIN_TOP_LIKES = 30       # top posts must have some engagement

LOCAL_TAGS = {"lascondes","vitacura","providencia","lobarnechea","santiago","santiagochile","laserena","coquimbo"}


def _normalize(t: str) -> str:
    nfkd = unicodedata.normalize("NFKD", t.lower())
    return re.sub(r"\s+", " ", nfkd.encode("ascii", "ignore").decode()).strip()


def _dedup(hashtag: str, opp_type: str) -> str:
    return (f"{_normalize(hashtag)}:{opp_type}")[:250]


def _score(media_count: int | None, avg_likes: float | None, opp_type: str) -> float:
    mc = media_count or 0
    al = avg_likes or 0
    # c1: engagement component (0-35)
    c1 = min(math.log10(al + 1) / math.log10(5001) * 35, 35) if al > 0 else 0
    # c2: competition zone (0-35)
    if SWEET_MIN <= mc <= SWEET_MAX:
        c2 = 35
    elif mc < SWEET_MIN:
        c2 = 15
    else:
        c2 = max(0, 35 - (mc - SWEET_MAX) / 100_000 * 10)
    # c3: type weight (0-30)
    type_w = {"sweet_spot": 1.0, "local_unused": 0.85, "high_saves": 0.95,
              "underused_winner": 0.90, "trending": 0.80}
    c3 = type_w.get(opp_type, 0.8) * 30
    return min(100.0, round(c1 + c2 + c3, 2))


def _upsert(opp: dict) -> str:
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM radar.ig_opportunities WHERE dedup_key=%s", (opp["dedup_key"],))
            row = cur.fetchone()
            if row:
                cur.execute("""
                    UPDATE radar.ig_opportunities
                    SET last_seen_at=NOW(), priority_score=%s, recommendation_text=%s
                    WHERE dedup_key=%s AND status NOT IN ('implemented','dismissed')
                """, (opp["priority_score"], opp["recommendation_text"], opp["dedup_key"]))
                return "updated"
            else:
                cur.execute("""
                    INSERT INTO radar.ig_opportunities
                        (hashtag, opp_type, priority_score, recommendation_text, dedup_key)
                    VALUES (%s,%s,%s,%s,%s)
                """, (opp["hashtag"], opp["opp_type"], opp["priority_score"],
                      opp["recommendation_text"], opp["dedup_key"]))
                return "created"


def detect_ig_opportunities() -> dict:
    # Latest metric per hashtag
    metrics = fetchall("""
        SELECT DISTINCT ON (hashtag) hashtag, media_count, top_post_likes_avg, top_post_comments_avg, scanned_at
        FROM radar.ig_hashtag_metrics
        ORDER BY hashtag, scanned_at DESC
    """)

    # Hashtags used in own posts
    posts = fetchall("SELECT hashtags, reach, saved FROM radar.ig_posts WHERE hashtags IS NOT NULL")
    used_tags: dict[str, list] = {}
    for p in posts:
        for ht in (p["hashtags"] or []):
            used_tags.setdefault(ht, []).append({"reach": p["reach"] or 0, "saved": p["saved"] or 0})

    avg_reach = sum(p["reach"] or 0 for p in posts) / max(len(posts), 1)
    avg_saved = sum(p["saved"] or 0 for p in posts) / max(len(posts), 1)

    # Previous metrics for trending
    prev_metrics = fetchall("""
        SELECT DISTINCT ON (hashtag) hashtag, media_count
        FROM radar.ig_hashtag_metrics
        WHERE scanned_at < NOW() - INTERVAL '5 days'
        ORDER BY hashtag, scanned_at DESC
    """)
    prev_map = {r["hashtag"]: r["media_count"] for r in prev_metrics}

    created = updated = 0
    seen: set[str] = set()

    for m in metrics:
        tag = m["hashtag"]
        mc = m["media_count"] or 0
        al = m["top_post_likes_avg"] or 0
        uses = used_tags.get(tag, [])

        # 1. Sweet spot: right-sized audience, no one using it enough
        if SWEET_MIN <= mc <= SWEET_MAX and al >= MIN_TOP_LIKES:
            opp_type = "sweet_spot"
            dk = _dedup(tag, opp_type)
            seen.add(dk)
            opp = {
                "hashtag": tag,
                "opp_type": opp_type,
                "priority_score": _score(mc, al, opp_type),
                "recommendation_text": f"#{tag} tiene {mc:,} publicaciones y top posts con {al:.0f} likes promedio — zona sweet spot para ganar visibilidad.",
                "dedup_key": dk,
            }
            r = _upsert(opp)
            if r == "created": created += 1
            else: updated += 1

        # 2. Local tag not recently used
        if tag in LOCAL_TAGS:
            recent_use = sum(1 for _ in uses)  # total uses in any post
            if recent_use == 0 and al >= 10:
                opp_type = "local_unused"
                dk = _dedup(tag, opp_type)
                seen.add(dk)
                opp = {
                    "hashtag": tag,
                    "opp_type": opp_type,
                    "priority_score": _score(mc, al, opp_type),
                    "recommendation_text": f"#{tag} es un hashtag local que nunca has usado. Top posts tienen {al:.0f} likes promedio.",
                    "dedup_key": dk,
                }
                r = _upsert(opp)
                if r == "created": created += 1
                else: updated += 1

        # 3. High saves: posts with this tag have above-avg saves
        if uses and avg_saved > 0:
            tag_saves = sum(u["saved"] for u in uses) / len(uses)
            if tag_saves > avg_saved * 1.5 and len(uses) >= 2:
                opp_type = "high_saves"
                dk = _dedup(tag, opp_type)
                seen.add(dk)
                opp = {
                    "hashtag": tag,
                    "opp_type": opp_type,
                    "priority_score": _score(mc, al, opp_type),
                    "recommendation_text": f"#{tag} genera {tag_saves:.0f} saves promedio en tus posts (vs {avg_saved:.0f} tu promedio general) — audiencia con alta intención de compra.",
                    "dedup_key": dk,
                }
                r = _upsert(opp)
                if r == "created": created += 1
                else: updated += 1

        # 4. Underused winner: high reach but used rarely
        if uses and avg_reach > 0:
            tag_reach = sum(u["reach"] for u in uses) / len(uses)
            if tag_reach > avg_reach * 1.3 and len(uses) <= 3:
                opp_type = "underused_winner"
                dk = _dedup(tag, opp_type)
                seen.add(dk)
                opp = {
                    "hashtag": tag,
                    "opp_type": opp_type,
                    "priority_score": _score(mc, al, opp_type),
                    "recommendation_text": f"#{tag} aparece en {len(uses)} de tus posts pero genera {tag_reach:.0f} de reach promedio (tu media: {avg_reach:.0f}). Úsalo más.",
                    "dedup_key": dk,
                }
                r = _upsert(opp)
                if r == "created": created += 1
                else: updated += 1

        # 5. Trending: media_count grew > 20% since last scan
        prev_mc = prev_map.get(tag)
        if prev_mc and prev_mc > 0 and mc > 0:
            growth = (mc - prev_mc) / prev_mc
            if growth > 0.20:
                opp_type = "trending"
                dk = _dedup(tag, opp_type)
                seen.add(dk)
                opp = {
                    "hashtag": tag,
                    "opp_type": opp_type,
                    "priority_score": _score(mc, al, opp_type),
                    "recommendation_text": f"#{tag} creció {growth*100:.0f}% en publicaciones esta semana ({prev_mc:,} → {mc:,}). Tendencia al alza.",
                    "dedup_key": dk,
                }
                r = _upsert(opp)
                if r == "created": created += 1
                else: updated += 1

    # Auto-resolve stale
    resolved = 0
    if seen:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE radar.ig_opportunities
                    SET resolved_auto=TRUE, status_changed_at=NOW()
                    WHERE dedup_key != ALL(%s) AND status IN ('new','reviewed') AND resolved_auto=FALSE
                """, (list(seen),))
                resolved = cur.rowcount

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO radar.sync_logs (sync_type, status, opportunities_created, opportunities_updated, opportunities_resolved, finished_at)
                VALUES ('ig_detect_opportunities','success',%s,%s,%s,NOW())
            """, (created, updated, resolved))

    logger.info("ig_detect: created=%d updated=%d resolved=%d", created, updated, resolved)
    return {"created": created, "updated": updated, "resolved": resolved}
