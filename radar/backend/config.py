import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL: str     = os.getenv("DATABASE_URL", "")
GSC_CLIENT_ID: str    = os.getenv("GSC_CLIENT_ID", "")
GSC_CLIENT_SECRET: str = os.getenv("GSC_CLIENT_SECRET", "")
GSC_PROPERTY: str     = os.getenv("GSC_PROPERTY", "https://terrablinds.cl/")
SECRETS_DIR: str      = os.getenv("SECRETS_DIR", "/app/secrets")

GSC_TOKEN_FILE: str   = os.path.join(SECRETS_DIR, "gsc_refresh_token")

def gsc_connected() -> bool:
    return bool(GSC_CLIENT_ID and GSC_CLIENT_SECRET and os.path.exists(GSC_TOKEN_FILE))
