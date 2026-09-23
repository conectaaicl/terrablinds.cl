import logging
from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from db.connection import get_db, fetchall

logger = logging.getLogger(__name__)
router = APIRouter()

OPP_STATUSES = ("new", "reviewed", "in_progress", "implemented", "dismissed")


@router.get("/radar/api/dashboard/summary")
def summary():
    stats = fetchall(
        """
        SELECT
            (SELECT COUNT(*) FROM radar.gsc_raw)                                                AS gsc_rows,
            (SELECT COUNT(DISTINCT date) FROM radar.gsc_raw)                                    AS days_synced,
            (SELECT MAX(date) FROM radar.gsc_raw)                                               AS last_sync_date,
            (SELECT COUNT(*) FROM radar.keyword_metrics)                                        AS keyword_count,
            (SELECT COUNT(*) FROM radar.page_metrics)                                           AS page_count,
            (SELECT COUNT(*) FROM radar.opportunities WHERE resolved_auto=FALSE
                AND status NOT IN ('implemented','dismissed'))                                  AS active_opp,
            (SELECT COUNT(*) FROM radar.opportunities WHERE status='new' AND resolved_auto=FALSE) AS new_opp,
            (SELECT SUM(impressions_28d) FROM radar.keyword_metrics)                            AS total_impressions,
            (SELECT SUM(clicks_28d) FROM radar.keyword_metrics)                                 AS total_clicks
        """
    )
    stat = stats[0] if stats else {}

    by_type = fetchall(
        """
        SELECT opp_type, COUNT(*) as count, ROUND(AVG(priority_score),1) as avg_score
        FROM radar.opportunities
        WHERE resolved_auto=FALSE AND status NOT IN ('implemented','dismissed')
        GROUP BY opp_type ORDER BY count DESC
        """
    )

    top_opps = fetchall(
        """
        SELECT id, query, opp_type, priority_score, recommended_action,
               recommendation_text, status, first_seen_at
        FROM radar.opportunities
        WHERE resolved_auto=FALSE AND status NOT IN ('implemented','dismissed')
        ORDER BY priority_score DESC LIMIT 10
        """
    )

    last_sync = fetchall(
        """
        SELECT sync_type, status, started_at, finished_at, rows_fetched, error_message
        FROM radar.sync_logs ORDER BY started_at DESC LIMIT 5
        """
    )

    return {
        "stats": stat,
        "by_type": by_type,
        "top_opportunities": top_opps,
        "last_syncs": last_sync,
    }


@router.get("/radar/api/dashboard/opportunities")
def list_opportunities(
    status: str | None = Query(default=None),
    opp_type: str | None = Query(default=None),
    q: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    where = ["resolved_auto = FALSE"]
    params: list = []

    if status:
        where.append("status = %s")
        params.append(status)
    else:
        where.append("status NOT IN ('implemented','dismissed')")

    if opp_type:
        where.append("opp_type = %s")
        params.append(opp_type)

    if q:
        where.append("query ILIKE %s")
        params.append(f"%{q}%")

    clause = " AND ".join(where)

    rows = fetchall(
        f"""
        SELECT id, query, opp_type, priority_score, recommended_action,
               recommendation_text, status, status_note,
               first_seen_at, last_seen_at, data_snapshot
        FROM radar.opportunities
        WHERE {clause}
        ORDER BY priority_score DESC
        LIMIT %s OFFSET %s
        """,
        params + [limit, offset],
    )

    total = fetchall(
        f"SELECT COUNT(*) as n FROM radar.opportunities WHERE {clause}",
        params,
    )

    return {"items": rows, "total": total[0]["n"] if total else 0, "limit": limit, "offset": offset}


class StatusUpdate(BaseModel):
    status: Literal["new", "reviewed", "in_progress", "implemented", "dismissed"]
    status_note: str | None = None


@router.patch("/radar/api/dashboard/opportunities/{opp_id}")
def update_opportunity(opp_id: int, body: StatusUpdate):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE radar.opportunities
                SET status=%s, status_note=%s, status_changed_at=NOW()
                WHERE id=%s AND resolved_auto=FALSE
                """,
                (body.status, body.status_note, opp_id),
            )
            if cur.rowcount == 0:
                raise HTTPException(404, detail="Oportunidad no encontrada")
    return {"ok": True, "id": opp_id, "status": body.status}


@router.get("/radar/api/dashboard/keywords")
def list_keywords(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    sort: str = Query(default="impressions_28d"),
):
    allowed_sort = {"impressions_28d", "clicks_28d", "avg_position_28d", "avg_ctr_28d", "updated_at"}
    if sort not in allowed_sort:
        sort = "impressions_28d"
    rows = fetchall(
        f"""
        SELECT query, clicks_28d, impressions_28d, avg_ctr_28d, avg_position_28d,
               clicks_prev, impressions_prev, best_page, updated_at
        FROM radar.keyword_metrics
        WHERE impressions_28d > 0
        ORDER BY {sort} DESC
        LIMIT %s OFFSET %s
        """,
        (limit, offset),
    )
    return {"items": rows, "limit": limit, "offset": offset}
