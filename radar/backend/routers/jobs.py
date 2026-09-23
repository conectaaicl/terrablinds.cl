import logging
from datetime import date, timedelta

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query

from db.connection import get_db, fetchall
from services.gsc_sync import sync_historical, sync_date
from services.gsc_auth import get_credentials
from services.metrics import recalc_all
from services.detector import detect_all

logger = logging.getLogger(__name__)
router = APIRouter()


def _create_log(sync_type: str, date_from: date | None, date_to: date | None) -> int:
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO radar.sync_logs (sync_type, status, date_from, date_to) VALUES (%s,'running',%s,%s) RETURNING id",
                (sync_type, date_from, date_to),
            )
            return cur.fetchone()[0]


# ── GSC Sync ─────────────────────────────────────────────────────────────────

@router.post("/radar/api/jobs/sync/historical")
def trigger_historical(background_tasks: BackgroundTasks, days: int = Query(default=90, ge=1, le=365)):
    creds = get_credentials()
    if not creds or not creds.valid:
        raise HTTPException(503, detail="GSC no conectado. Ve a /radar/api/auth/gsc/setup")
    today = date.today()
    end_date = today - timedelta(days=3)
    start_date = end_date - timedelta(days=days - 1)
    log_id = _create_log("gsc_historical", start_date, end_date)
    background_tasks.add_task(sync_historical, log_id, days)
    return {"status": "started", "log_id": log_id, "days": days,
            "date_from": start_date.isoformat(), "date_to": end_date.isoformat()}


@router.post("/radar/api/jobs/sync/daily")
def trigger_daily(background_tasks: BackgroundTasks):
    creds = get_credentials()
    if not creds or not creds.valid:
        raise HTTPException(503, detail="GSC no conectado.")
    target = date.today() - timedelta(days=3)
    log_id = _create_log("gsc_daily", target, target)
    background_tasks.add_task(_run_daily, log_id, target)
    return {"status": "started", "log_id": log_id, "date": target.isoformat()}


def _run_daily(log_id: int, target: date) -> None:
    res = sync_date(target)
    status = "success" if not res["error"] else "failed"
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE radar.sync_logs SET status=%s, rows_fetched=%s, rows_upserted=%s, error_message=%s, finished_at=NOW() WHERE id=%s",
                (status, res["rows"], res["rows"], res["error"], log_id),
            )


# ── Metrics & Detection ───────────────────────────────────────────────────────

@router.post("/radar/api/jobs/metrics")
def trigger_metrics(background_tasks: BackgroundTasks):
    background_tasks.add_task(_run_metrics)
    return {"status": "started"}


def _run_metrics() -> None:
    try:
        recalc_all()
    except Exception as exc:
        logger.error("Background metrics job failed: %s", exc)


@router.post("/radar/api/jobs/detect")
def trigger_detect(background_tasks: BackgroundTasks):
    background_tasks.add_task(_run_detect)
    return {"status": "started"}


def _run_detect() -> None:
    try:
        detect_all()
    except Exception as exc:
        logger.error("Background detect job failed: %s", exc)


@router.post("/radar/api/jobs/full")
def trigger_full(background_tasks: BackgroundTasks):
    """Sync today + recalc metrics + detect opportunities in one shot."""
    creds = get_credentials()
    if not creds or not creds.valid:
        raise HTTPException(503, detail="GSC no conectado.")
    background_tasks.add_task(_run_full)
    return {"status": "started", "steps": ["sync_daily", "metrics", "detect"]}


def _run_full() -> None:
    try:
        target = date.today() - timedelta(days=3)
        sync_date(target)
        recalc_all()
        detect_all()
    except Exception as exc:
        logger.error("Full pipeline job failed: %s", exc)


# ── Logs & Status ─────────────────────────────────────────────────────────────

@router.get("/radar/api/jobs/logs")
def get_logs(limit: int = Query(default=20, ge=1, le=100)):
    rows = fetchall(
        """
        SELECT id, sync_type, status, date_from, date_to,
               rows_fetched, rows_upserted, opportunities_created,
               opportunities_updated, opportunities_resolved,
               error_message, started_at, finished_at
        FROM radar.sync_logs
        ORDER BY started_at DESC LIMIT %s
        """,
        (limit,),
    )
    return {"logs": rows}


@router.get("/radar/api/jobs/status/{log_id}")
def get_log_status(log_id: int):
    rows = fetchall("SELECT * FROM radar.sync_logs WHERE id=%s", (log_id,))
    if not rows:
        raise HTTPException(404, detail="Log no encontrado")
    return rows[0]


@router.get("/radar/api/jobs/stats")
def get_stats():
    rows = fetchall(
        """
        SELECT
            (SELECT COUNT(*) FROM radar.gsc_raw) AS gsc_raw_rows,
            (SELECT COUNT(DISTINCT date) FROM radar.gsc_raw) AS days_synced,
            (SELECT MAX(date) FROM radar.gsc_raw) AS last_sync_date,
            (SELECT COUNT(*) FROM radar.keyword_metrics) AS keyword_count,
            (SELECT COUNT(*) FROM radar.page_metrics) AS page_count,
            (SELECT COUNT(*) FROM radar.opportunities WHERE status NOT IN ('implemented','dismissed') AND resolved_auto=FALSE) AS active_opportunities,
            (SELECT COUNT(*) FROM radar.opportunities WHERE status='new' AND resolved_auto=FALSE) AS new_opportunities
        """
    )
    return rows[0] if rows else {}
