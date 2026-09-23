import logging
from datetime import date, timedelta

from tenacity import retry, stop_after_attempt, wait_exponential

from services.gsc_auth import get_gsc_service
from db.connection import get_db, fetchall
from config import GSC_PROPERTY

logger = logging.getLogger(__name__)

DIMENSIONS = ["query", "page", "date", "device", "country"]
ROW_LIMIT = 25000
VALID_DEVICES = {"MOBILE", "DESKTOP", "TABLET"}


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=4, max=60))
def _fetch_day_raw(target_date: date) -> list[dict]:
    service = get_gsc_service()
    if not service:
        raise RuntimeError("GSC no está conectado")

    all_rows: list[dict] = []
    start_row = 0

    while True:
        body = {
            "startDate": target_date.isoformat(),
            "endDate": target_date.isoformat(),
            "dimensions": DIMENSIONS,
            "rowLimit": ROW_LIMIT,
            "startRow": start_row,
            "dataState": "final",
        }
        resp = service.searchanalytics().query(siteUrl=GSC_PROPERTY, body=body).execute()
        rows = resp.get("rows", [])
        if not rows:
            break

        for row in rows:
            keys = row["keys"]
            device = keys[3].upper()
            if device not in VALID_DEVICES:
                device = "DESKTOP"
            all_rows.append({
                "query": keys[0][:500],
                "page": keys[1][:1000],
                "date": keys[2],
                "device": device,
                "country": keys[4][:10].upper(),
                "clicks": max(0, int(row.get("clicks", 0))),
                "impressions": max(0, int(row.get("impressions", 0))),
                "ctr": max(0.0, min(1.0, float(row.get("ctr", 0)))),
                "position": max(0.0, float(row.get("position", 0))),
            })

        if len(rows) < ROW_LIMIT:
            break
        start_row += ROW_LIMIT

    return all_rows


def _upsert_rows(rows: list[dict]) -> int:
    if not rows:
        return 0
    upserted = 0
    with get_db() as conn:
        with conn.cursor() as cur:
            for row in rows:
                cur.execute(
                    """
                    INSERT INTO radar.gsc_raw
                        (query, page, date, device, country, clicks, impressions, ctr, position)
                    VALUES
                        (%(query)s, %(page)s, %(date)s, %(device)s, %(country)s,
                         %(clicks)s, %(impressions)s, %(ctr)s, %(position)s)
                    ON CONFLICT (query, page, date, device, country) DO UPDATE SET
                        clicks      = EXCLUDED.clicks,
                        impressions = EXCLUDED.impressions,
                        ctr         = EXCLUDED.ctr,
                        position    = EXCLUDED.position,
                        synced_at   = NOW()
                    """,
                    row,
                )
                upserted += cur.rowcount
    return upserted


def sync_date(target_date: date) -> dict:
    result = {"date": target_date.isoformat(), "rows": 0, "error": None}
    try:
        rows = _fetch_day_raw(target_date)
        result["rows"] = len(rows)
        if rows:
            _upsert_rows(rows)
            with get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO radar.synced_dates (date, synced_at, row_count)
                        VALUES (%s, NOW(), %s)
                        ON CONFLICT (date) DO UPDATE SET synced_at = NOW(), row_count = EXCLUDED.row_count
                        """,
                        (target_date, len(rows)),
                    )
    except Exception as exc:
        result["error"] = str(exc)
        logger.error("sync_date(%s) failed: %s", target_date, exc)
    return result


def sync_historical(log_id: int, days: int = 90) -> None:
    today = date.today()
    end_date = today - timedelta(days=3)
    start_date = end_date - timedelta(days=days - 1)

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT date FROM radar.synced_dates WHERE date >= %s AND date <= %s",
                (start_date, end_date),
            )
            already_synced = {r[0] for r in cur.fetchall()}

    pending = []
    d = start_date
    while d <= end_date:
        if d not in already_synced:
            pending.append(d)
        d += timedelta(days=1)

    total_rows = 0
    errors: list[str] = []

    for target in pending:
        res = sync_date(target)
        total_rows += res["rows"]
        if res["error"]:
            errors.append(f"{target}: {res['error']}")
        logger.info("Synced %s → %d rows", target, res["rows"])

    status = "success" if not errors else ("partial" if total_rows > 0 else "failed")
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE radar.sync_logs
                SET status = %s, rows_fetched = %s, rows_upserted = %s,
                    error_message = %s, finished_at = NOW()
                WHERE id = %s
                """,
                (status, total_rows, total_rows, "\n".join(errors) or None, log_id),
            )
    logger.info("Historical sync done: %d dates, %d rows, status=%s", len(pending), total_rows, status)
