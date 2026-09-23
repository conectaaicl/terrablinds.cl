import logging
from datetime import date, timedelta

import pytz
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler(timezone=pytz.utc)


def _daily_job() -> None:
    logger.info("Scheduler: daily job starting")
    try:
        from services.gsc_sync import sync_date
        from services.metrics import recalc_all
        from services.detector import detect_all
        from db.connection import get_db

        target = date.today() - timedelta(days=3)
        sync_result = sync_date(target)
        logger.info("Scheduler sync_date(%s): %d rows", target, sync_result.get("rows", 0))

        metrics_result = recalc_all()
        logger.info("Scheduler recalc_all: %s", metrics_result)

        detect_result = detect_all()
        logger.info("Scheduler detect_all: %s", detect_result)
    except Exception as exc:
        logger.error("Scheduler daily job failed: %s", exc, exc_info=True)



def _ig_daily_posts() -> None:
    logger.info("Scheduler: IG daily post sync starting")
    try:
        from services.ig_auth import ig_connected
        from services.ig_sync import sync_own_posts
        from services.ig_detector import detect_ig_opportunities
        if not ig_connected():
            logger.info("Scheduler: IG not connected, skip")
            return
        sync_result = sync_own_posts()
        logger.info("Scheduler ig posts: %s", sync_result)
        detect_result = detect_ig_opportunities()
        logger.info("Scheduler ig detect: %s", detect_result)
    except Exception as exc:
        logger.error("Scheduler IG daily failed: %s", exc, exc_info=True)


def _ig_weekly_hashtags() -> None:
    logger.info("Scheduler: IG weekly hashtag scan starting")
    try:
        from services.ig_auth import ig_connected
        from services.ig_sync import scan_hashtags
        from services.ig_detector import detect_ig_opportunities
        if not ig_connected():
            logger.info("Scheduler: IG not connected, skip")
            return
        scan_result = scan_hashtags(limit=25)
        logger.info("Scheduler ig hashtags: %s", scan_result)
        detect_result = detect_ig_opportunities()
        logger.info("Scheduler ig detect after hashtags: %s", detect_result)
    except Exception as exc:
        logger.error("Scheduler IG weekly failed: %s", exc, exc_info=True)


def start() -> None:
    tz = pytz.timezone("America/Santiago")
    scheduler.add_job(
        _daily_job,
        CronTrigger(hour=6, minute=0, timezone=tz),
        id="daily_radar",
        replace_existing=True,
        misfire_grace_time=3600,
    )
    # IG daily post sync at 07:00
    scheduler.add_job(
        _ig_daily_posts,
        CronTrigger(hour=7, minute=0, timezone=tz),
        id="ig_daily_posts",
        replace_existing=True,
        misfire_grace_time=3600,
    )
    # IG weekly hashtag scan on Sunday at 08:00
    scheduler.add_job(
        _ig_weekly_hashtags,
        CronTrigger(day_of_week="sun", hour=8, minute=0, timezone=tz),
        id="ig_weekly_hashtags",
        replace_existing=True,
        misfire_grace_time=7200,
    )
    scheduler.start()
    logger.info("Scheduler started — daily at 06:00, IG posts 07:00, IG hashtags Sun 08:00 (America/Santiago)")


def shutdown() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
