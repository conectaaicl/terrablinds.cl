import logging

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse, JSONResponse

from services.gsc_auth import get_auth_url, handle_callback, get_credentials
from config import GSC_CLIENT_ID, GSC_CLIENT_SECRET, GSC_PROPERTY

logger = logging.getLogger(__name__)
router = APIRouter()

REDIRECT_URI = "https://terrablinds.cl/radar/api/auth/gsc/callback"


@router.get("/radar/api/auth/gsc/setup")
def gsc_setup():
    if not GSC_CLIENT_ID or not GSC_CLIENT_SECRET:
        raise HTTPException(503, detail="Credenciales GSC no configuradas")
    try:
        auth_url = get_auth_url(REDIRECT_URI)
        return RedirectResponse(url=auth_url)
    except Exception as exc:
        logger.error("gsc_setup error: %s", exc)
        raise HTTPException(500, detail="Error al generar URL de autorización")


@router.get("/radar/api/auth/gsc/callback")
def gsc_callback(
    code: str = Query(...),
    state: str = Query(...),
    error: str | None = Query(default=None),
):
    if error:
        logger.warning("GSC OAuth error from Google: %s", error)
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": f"Google rechazó el acceso: {error}"},
        )
    try:
        handle_callback(code, state, REDIRECT_URI)
        return JSONResponse({
            "status": "ok",
            "message": "GSC conectado exitosamente. Puedes cerrar esta ventana.",
            "property": GSC_PROPERTY,
        })
    except ValueError as exc:
        logger.warning("GSC callback validation error: %s", exc)
        raise HTTPException(400, detail=str(exc))
    except Exception as exc:
        logger.error("GSC callback unexpected error: %s", exc)
        raise HTTPException(500, detail="Error al procesar la autorización de Google")


@router.get("/radar/api/auth/gsc/status")
def gsc_status():
    try:
        creds = get_credentials()
        if creds and creds.valid:
            return {"connected": True, "property": GSC_PROPERTY}
        return {"connected": False}
    except Exception as exc:
        logger.warning("gsc_status error: %s", exc)
        return {"connected": False, "error": str(exc)}
