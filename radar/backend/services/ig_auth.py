import logging
import os
from pathlib import Path

import httpx

logger = logging.getLogger(__name__)

SECRETS_DIR = Path(os.getenv("SECRETS_DIR", "/app/secrets"))
_TOKEN_FILE  = SECRETS_DIR / "ig_access_token"
_IG_ID_FILE  = SECRETS_DIR / "ig_user_id"

GRAPH_URL = "https://graph.facebook.com/v19.0"


def get_token() -> str | None:
    if not _TOKEN_FILE.exists():
        return None
    return _TOKEN_FILE.read_text().strip()


def get_ig_user_id() -> str | None:
    if not _IG_ID_FILE.exists():
        return None
    return _IG_ID_FILE.read_text().strip()


def ig_connected() -> bool:
    return bool(get_token() and get_ig_user_id())


def graph_get(path: str, params: dict | None = None) -> dict:
    token = get_token()
    if not token:
        raise RuntimeError("Instagram no conectado")
    p = {"access_token": token, **(params or {})}
    r = httpx.get(f"{GRAPH_URL}/{path.lstrip('/')}", params=p, timeout=30)
    r.raise_for_status()
    return r.json()
