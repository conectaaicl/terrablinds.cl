import json
import logging
import math
import re
import unicodedata
from typing import Any

from db.connection import get_db, fetchall

logger = logging.getLogger(__name__)

# ── Thresholds (calibrated for new sites with low traffic) ──────────────────

_CTR_BENCH = {1: 0.28, 2: 0.15, 3: 0.11, 4: 0.08, 5: 0.07,
              6: 0.06, 7: 0.05, 8: 0.05, 9: 0.04, 10: 0.04}

LOCAL_TERMS = [
    "las condes", "vitacura", "providencia", "santiago", "lo barnechea",
    "huechuraba", "colina", "la serena", "coquimbo", "ñuñoa", "nuñoa",
    "recoleta", "la florida", "maipu", "maipú", "barrio alto", "sector oriente",
    "chicureo", "pudahuel", "quilicura",
]
PRODUCT_TERMS = [
    "cortina", "persiana", "roller", "screen", "toldo", "terraza",
    "blackout", "sheer", "dia noche", "día noche", "instalacion", "instalación",
    "a medida", "enrollable", "cierre", "cerramiento", "motorizada",
]

ACTION_MAP = {
    "low_ctr": "optimize_meta",
    "position_gap": "improve_content",
    "no_page": "create_landing",
    "high_impressions_low_clicks": "optimize_meta",
    "local_opportunity": "add_local_section",
    "product_opportunity": "create_product_page",
}
TYPE_W = {
    "low_ctr": 0.85, "position_gap": 0.90, "no_page": 0.75,
    "high_impressions_low_clicks": 1.0, "local_opportunity": 0.70,
    "product_opportunity": 0.85,
}


# ── Helpers ──────────────────────────────────────────────────────────────────

def _normalize(text: str) -> str:
    nfkd = unicodedata.normalize("NFKD", text.lower())
    ascii_t = nfkd.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"\s+", " ", ascii_t).strip()


def _dedup(query: str, opp_type: str) -> str:
    return (_normalize(query) + ":" + opp_type)[:250]


def _bench_ctr(position: float) -> float:
    p = max(1, min(10, round(position)))
    return _CTR_BENCH.get(p, 0.02 if position <= 20 else 0.01)


def _priority(imp: int, pos: float, ctr: float, opp_type: str, imp_prev: int) -> float:
    c1 = math.log10(max(imp, 1) + 1) / math.log10(5001) * 25
    if pos <= 3:
        c2 = 5.0
    elif pos <= 10:
        c2 = 25.0
    elif pos <= 20:
        c2 = 15.0
    else:
        c2 = 5.0
    bench = _bench_ctr(pos)
    gap = max(0.0, bench - ctr)
    c3 = min(gap / max(bench, 0.01) * 25, 25.0)
    trend = (imp - imp_prev) / max(imp_prev, 1) if imp_prev > 0 else 0.0
    trend_bonus = min(5.0, max(-5.0, trend * 20))
    c4 = TYPE_W.get(opp_type, 0.8) * 20 + trend_bonus
    return min(100.0, round(c1 + c2 + c3 + c4, 2))


def _snapshot(kw: dict, opp_type: str) -> dict:
    pos = float(kw["avg_position_28d"] or 0)
    ctr = float(kw["avg_ctr_28d"] or 0)
    return {
        "query": kw["query"],
        "impressions_28d": kw["impressions_28d"],
        "clicks_28d": kw["clicks_28d"],
        "avg_ctr_28d": round(ctr, 6),
        "avg_position_28d": round(pos, 2),
        "best_page": kw.get("best_page"),
        "benchmark_ctr": round(_bench_ctr(pos), 4),
        "opp_type": opp_type,
    }


def _rec_text(kw: dict, opp_type: str) -> str:
    q = kw["query"]
    pos = float(kw["avg_position_28d"] or 0)
    imp = kw["impressions_28d"]
    ctr = float(kw["avg_ctr_28d"] or 0)
    bench = _bench_ctr(pos)
    if opp_type == "low_ctr":
        return (f"'{q}': {imp} impresiones pero CTR {ctr:.1%} vs {bench:.1%} esperado "
                f"(posición {pos:.0f}). Mejorar title/meta description.")
    if opp_type == "position_gap":
        return (f"'{q}': en posición {pos:.1f} con {imp} impresiones. "
                f"Un push de contenido puede alcanzar top-3.")
    if opp_type == "no_page":
        return (f"'{q}': {imp} impresiones pero 0 clics (posición {pos:.0f}). "
                f"No existe landing dedicada. Crear página específica.")
    if opp_type == "high_impressions_low_clicks":
        return (f"'{q}': {imp} impresiones, {kw['clicks_28d']} clics. "
                f"CTR {ctr:.1%}. Optimizar snippet para aumentar clics.")
    if opp_type == "local_opportunity":
        return (f"'{q}': término local en posición {pos:.1f}. "
                f"Reforzar landing de comuna correspondiente.")
    if opp_type == "product_opportunity":
        return (f"'{q}': término de producto en posición {pos:.1f} con {imp} impresiones. "
                f"Crear/mejorar página de producto.")
    return f"Oportunidad detectada para '{q}'."


# ── Per-keyword detection ─────────────────────────────────────────────────────

def _detect_for_kw(kw: dict) -> list[dict]:
    results = []
    q = kw["query"]
    imp = int(kw["impressions_28d"] or 0)
    clicks = int(kw["clicks_28d"] or 0)
    pos = float(kw["avg_position_28d"] or 0)
    ctr = float(kw["avg_ctr_28d"] or 0)
    imp_prev = int(kw["impressions_prev"] or 0)
    q_lower = q.lower()

    def _opp(opp_type: str) -> dict:
        score = _priority(imp, pos, ctr, opp_type, imp_prev)
        return {
            "query": q,
            "opp_type": opp_type,
            "priority_score": score,
            "data_snapshot": _snapshot(kw, opp_type),
            "recommended_action": ACTION_MAP[opp_type],
            "recommendation_text": _rec_text(kw, opp_type),
            "dedup_key": _dedup(q, opp_type),
        }

    bench = _bench_ctr(pos)

    # 1. high_impressions_low_clicks (most impactful, check first)
    if imp >= 10 and clicks == 0:
        results.append(_opp("high_impressions_low_clicks"))

    # 2. low_ctr (impressions but CTR well below benchmark)
    if imp >= 5 and pos <= 30 and ctr < bench * 0.5 and clicks > 0:
        results.append(_opp("low_ctr"))

    # 3. position_gap (close to page 1 but not there)
    if 4.0 <= pos <= 20.0 and imp >= 3:
        results.append(_opp("position_gap"))

    # 4. no_page (appearing but not converting, likely no relevant page)
    if clicks == 0 and imp >= 5 and pos > 20:
        results.append(_opp("no_page"))

    # 5. local_opportunity
    if any(term in q_lower for term in LOCAL_TERMS):
        if pos > 5 or imp >= 3:
            results.append(_opp("local_opportunity"))

    # 6. product_opportunity
    if any(term in q_lower for term in PRODUCT_TERMS):
        if pos > 10 and imp >= 3:
            results.append(_opp("product_opportunity"))

    return results


# ── Upsert + auto-resolve ─────────────────────────────────────────────────────

def _upsert_opp(opp: dict) -> str:
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM radar.opportunities WHERE dedup_key = %s",
                (opp["dedup_key"],),
            )
            row = cur.fetchone()
            snap_json = json.dumps(opp["data_snapshot"])
            if row:
                cur.execute(
                    """
                    UPDATE radar.opportunities SET
                        last_seen_at      = NOW(),
                        data_snapshot     = %s,
                        priority_score    = %s,
                        recommendation_text = %s
                    WHERE dedup_key = %s
                      AND status NOT IN ('implemented','dismissed')
                    """,
                    (snap_json, opp["priority_score"], opp["recommendation_text"], opp["dedup_key"]),
                )
                return "updated"
            else:
                cur.execute(
                    """
                    INSERT INTO radar.opportunities
                        (query, opp_type, priority_score, data_snapshot,
                         recommended_action, recommendation_text, dedup_key)
                    VALUES (%s,%s,%s,%s,%s,%s,%s)
                    """,
                    (
                        opp["query"], opp["opp_type"], opp["priority_score"],
                        snap_json, opp["recommended_action"],
                        opp["recommendation_text"], opp["dedup_key"],
                    ),
                )
                return "created"


def _auto_resolve(seen_keys: set[str]) -> int:
    if len(seen_keys) == 0:
        return 0
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE radar.opportunities
                SET resolved_auto = TRUE, status_changed_at = NOW()
                WHERE dedup_key != ALL(%s)
                  AND status IN ('new','reviewed')
                  AND resolved_auto = FALSE
                """,
                (list(seen_keys),),
            )
            return cur.rowcount


# ── Public API ────────────────────────────────────────────────────────────────

def detect_all() -> dict:
    kws = fetchall(
        "SELECT * FROM radar.keyword_metrics WHERE impressions_28d > 0 ORDER BY impressions_28d DESC"
    )
    if not kws:
        return {"error": "No hay keyword_metrics. Ejecuta /jobs/metrics primero.", "created": 0, "updated": 0}

    seen_keys: set[str] = set()
    created = updated = 0

    for kw in kws:
        for opp in _detect_for_kw(kw):
            seen_keys.add(opp["dedup_key"])
            result = _upsert_opp(opp)
            if result == "created":
                created += 1
            else:
                updated += 1

    resolved = _auto_resolve(seen_keys)

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO radar.sync_logs
                    (sync_type, status, opportunities_created, opportunities_updated,
                     opportunities_resolved, finished_at)
                VALUES ('detect_opportunities','success',%s,%s,%s,NOW())
                """,
                (created, updated, resolved),
            )

    logger.info("detect_all: created=%d updated=%d resolved=%d over %d keywords", created, updated, resolved, len(kws))
    return {"keywords_processed": len(kws), "created": created, "updated": updated, "resolved": resolved}
