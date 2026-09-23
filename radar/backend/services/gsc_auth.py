import os
import secrets
import logging
from pathlib import Path

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

from config import GSC_CLIENT_ID, GSC_CLIENT_SECRET, GSC_TOKEN_FILE, GSC_PROPERTY

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
_STATE_FILE = Path(GSC_TOKEN_FILE).parent / "gsc_oauth_state"


def _client_config(redirect_uri: str) -> dict:
    return {
        "web": {
            "client_id": GSC_CLIENT_ID,
            "client_secret": GSC_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [redirect_uri],
        }
    }


def get_auth_url(redirect_uri: str) -> str:
    flow = Flow.from_client_config(_client_config(redirect_uri), scopes=SCOPES, redirect_uri=redirect_uri)
    state = secrets.token_urlsafe(32)
    _STATE_FILE.write_text(state)
    _STATE_FILE.chmod(0o600)
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        state=state,
        prompt="consent",
    )
    return auth_url


def handle_callback(code: str, state: str, redirect_uri: str) -> None:
    if not _STATE_FILE.exists():
        raise ValueError("No hay flujo OAuth pendiente")
    expected = _STATE_FILE.read_text().strip()
    if not secrets.compare_digest(state, expected):
        raise ValueError("State inválido — posible ataque CSRF")

    flow = Flow.from_client_config(_client_config(redirect_uri), scopes=SCOPES, redirect_uri=redirect_uri)
    flow.fetch_token(code=code)
    creds = flow.credentials

    token_path = Path(GSC_TOKEN_FILE)
    token_path.write_text(creds.refresh_token)
    token_path.chmod(0o600)
    _STATE_FILE.unlink(missing_ok=True)
    logger.info("GSC refresh token guardado en %s", token_path)


def get_credentials() -> Credentials | None:
    token_path = Path(GSC_TOKEN_FILE)
    if not token_path.exists():
        return None
    refresh_token = token_path.read_text().strip()
    if not refresh_token:
        return None
    creds = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GSC_CLIENT_ID,
        client_secret=GSC_CLIENT_SECRET,
        scopes=SCOPES,
    )
    if not creds.valid:
        creds.refresh(Request())
    return creds


def get_gsc_service():
    creds = get_credentials()
    if not creds:
        return None
    return build("searchconsole", "v1", credentials=creds, cache_discovery=False)
