import json
import logging
from datetime import date, timedelta

from db.connection import get_db

logger = logging.getLogger(__name__)


def _windows() -> tuple[date, date, date, date]:
    end_r = date.today() - timedelta(days=3)
    start_r = end_r - timedelta(days=27)
    end_p = start_r - timedelta(days=1)
    start_p = end_p - timedelta(days=27)
    return start_r, end_r, start_p, end_p


def recalc_keyword_metrics() -> int:
    start_r, end_r, start_p, end_p = _windows()
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                WITH recent AS (
                    SELECT query,
                           SUM(clicks) AS clicks_28d,
                           SUM(impressions) AS impressions_28d,
                           CASE WHEN SUM(impressions)>0
                                THEN SUM(clicks)::numeric/SUM(impressions) ELSE 0 END AS avg_ctr_28d,
                           CASE WHEN SUM(impressions)>0
                                THEN SUM(impressions*position)/SUM(impressions) ELSE 0 END AS avg_position_28d
                    FROM radar.gsc_raw
                    WHERE date >= %(sr)s AND date <= %(er)s
                    GROUP BY query
                ),
                prev AS (
                    SELECT query,
                           SUM(clicks) AS clicks_prev,
                           SUM(impressions) AS impressions_prev,
                           CASE WHEN SUM(impressions)>0
                                THEN SUM(impressions*position)/SUM(impressions) ELSE 0 END AS avg_position_prev
                    FROM radar.gsc_raw
                    WHERE date >= %(sp)s AND date <= %(ep)s
                    GROUP BY query
                ),
                best AS (
                    SELECT query, page AS best_page
                    FROM (
                        SELECT query, page,
                               ROW_NUMBER() OVER (
                                   PARTITION BY query
                                   ORDER BY SUM(clicks) DESC, SUM(impressions) DESC
                               ) AS rn
                        FROM radar.gsc_raw
                        WHERE date >= %(sr)s AND date <= %(er)s
                        GROUP BY query, page
                    ) sub WHERE rn = 1
                ),
                pages AS (
                    SELECT query,
                           jsonb_agg(page ORDER BY total_imp DESC) AS ranking_pages
                    FROM (
                        SELECT query, page, SUM(impressions) AS total_imp
                        FROM radar.gsc_raw
                        WHERE date >= %(sr)s AND date <= %(er)s
                        GROUP BY query, page
                    ) sub
                    GROUP BY query
                )
                INSERT INTO radar.keyword_metrics
                    (query, clicks_28d, impressions_28d, avg_ctr_28d, avg_position_28d,
                     clicks_prev, impressions_prev, avg_position_prev,
                     best_page, ranking_pages, updated_at)
                SELECT r.query,
                       r.clicks_28d, r.impressions_28d, r.avg_ctr_28d, r.avg_position_28d,
                       COALESCE(p.clicks_prev, 0), COALESCE(p.impressions_prev, 0), p.avg_position_prev,
                       b.best_page,
                       COALESCE(pg.ranking_pages, '[]'::jsonb),
                       NOW()
                FROM recent r
                LEFT JOIN prev  p  USING (query)
                LEFT JOIN best  b  USING (query)
                LEFT JOIN pages pg USING (query)
                ON CONFLICT (query) DO UPDATE SET
                    clicks_28d       = EXCLUDED.clicks_28d,
                    impressions_28d  = EXCLUDED.impressions_28d,
                    avg_ctr_28d      = EXCLUDED.avg_ctr_28d,
                    avg_position_28d = EXCLUDED.avg_position_28d,
                    clicks_prev      = EXCLUDED.clicks_prev,
                    impressions_prev = EXCLUDED.impressions_prev,
                    avg_position_prev= EXCLUDED.avg_position_prev,
                    best_page        = EXCLUDED.best_page,
                    ranking_pages    = EXCLUDED.ranking_pages,
                    updated_at       = NOW()
                """,
                {"sr": start_r, "er": end_r, "sp": start_p, "ep": end_p},
            )
            upserted = cur.rowcount
    logger.info("keyword_metrics upserted: %d", upserted)
    return upserted


def recalc_page_metrics() -> int:
    start_r, end_r, _, _ = _windows()
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                WITH recent AS (
                    SELECT page,
                           SUM(clicks) AS clicks_28d,
                           SUM(impressions) AS impressions_28d,
                           CASE WHEN SUM(impressions)>0
                                THEN SUM(clicks)::numeric/SUM(impressions) ELSE 0 END AS avg_ctr_28d,
                           CASE WHEN SUM(impressions)>0
                                THEN SUM(impressions*position)/SUM(impressions) ELSE 0 END AS avg_position_28d
                    FROM radar.gsc_raw
                    WHERE date >= %(sr)s AND date <= %(er)s
                    GROUP BY page
                ),
                top_q AS (
                    SELECT page,
                           jsonb_agg(
                               jsonb_build_object('query', query, 'impressions', total_imp)
                               ORDER BY total_imp DESC
                           ) AS top_queries
                    FROM (
                        SELECT page, query, SUM(impressions) AS total_imp
                        FROM radar.gsc_raw
                        WHERE date >= %(sr)s AND date <= %(er)s
                        GROUP BY page, query
                        ORDER BY page, total_imp DESC
                    ) sub
                    GROUP BY page
                )
                INSERT INTO radar.page_metrics
                    (page, clicks_28d, impressions_28d, avg_ctr_28d, avg_position_28d, top_queries, updated_at)
                SELECT r.page, r.clicks_28d, r.impressions_28d, r.avg_ctr_28d, r.avg_position_28d,
                       COALESCE(q.top_queries, '[]'::jsonb), NOW()
                FROM recent r
                LEFT JOIN top_q q USING (page)
                ON CONFLICT (page) DO UPDATE SET
                    clicks_28d       = EXCLUDED.clicks_28d,
                    impressions_28d  = EXCLUDED.impressions_28d,
                    avg_ctr_28d      = EXCLUDED.avg_ctr_28d,
                    avg_position_28d = EXCLUDED.avg_position_28d,
                    top_queries      = EXCLUDED.top_queries,
                    updated_at       = NOW()
                """,
                {"sr": start_r, "er": end_r},
            )
            upserted = cur.rowcount
    logger.info("page_metrics upserted: %d", upserted)
    return upserted


def recalc_all() -> dict:
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO radar.sync_logs (sync_type, status) VALUES ('recalc_metrics','running') RETURNING id"
            )
            log_id = cur.fetchone()[0]
    try:
        kw = recalc_keyword_metrics()
        pg = recalc_page_metrics()
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE radar.sync_logs SET status='success', rows_upserted=%s, finished_at=NOW() WHERE id=%s",
                    (kw + pg, log_id),
                )
        return {"keywords": kw, "pages": pg, "log_id": log_id}
    except Exception as exc:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE radar.sync_logs SET status='failed', error_message=%s, finished_at=NOW() WHERE id=%s",
                    (str(exc), log_id),
                )
        logger.error("recalc_all failed: %s", exc)
        raise
