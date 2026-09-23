import logging
from contextlib import asynccontextmanager

import psycopg2
from fastapi import FastAPI
from fastapi.responses import JSONResponse

from config import DATABASE_URL, GSC_PROPERTY, gsc_connected
from routers import auth_gsc, jobs, dashboard, ig

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    from services import scheduler as sched
    sched.start()
    yield
    sched.shutdown()


app = FastAPI(title="TerraBlinds Search Radar", docs_url=None, redoc_url=None, lifespan=lifespan)

app.include_router(auth_gsc.router)
app.include_router(jobs.router)
app.include_router(dashboard.router)
app.include_router(ig.router)


@app.get("/radar/api/health")
def health():
    db_ok = False
    try:
        conn = psycopg2.connect(DATABASE_URL, connect_timeout=3)
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM radar.sync_logs")
        conn.close()
        db_ok = True
    except Exception as exc:
        logger.error("DB health check failed: %s", type(exc).__name__)
    status_code = 200 if db_ok else 503
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ok" if db_ok else "degraded",
            "db": "connected" if db_ok else "unreachable",
            "gsc_connected": gsc_connected(),
            "property": GSC_PROPERTY,
            "service": "radar",
            "version": "0.5.0",
        },
    )
