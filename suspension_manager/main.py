"""
ConectaAI — Suspension Manager API
Controla activación/suspensión de dominios de clientes.
Corre en puerto 8199 (localhost only).
"""
import os
import re
import hashlib
import hmac
from pathlib import Path
from datetime import datetime
from functools import wraps
from flask import Flask, jsonify, request, send_file, abort

app = Flask(__name__)

SUSPENSIONS_DIR = Path('/var/www/suspensions')
TEMPLATE_FILE   = SUSPENSIONS_DIR / '_template.html'
ADMIN_SECRET    = os.environ.get('ADMIN_SECRET', 'ConectaAdmin2026!')
WA_NUMBER       = os.environ.get('WA_NUMBER', '56978873309')

# Dominios conocidos (se añaden automáticamente al suspender nuevos)
DEFAULT_DOMAINS = [
    'ama.conectaai.cl',
    'amav2.conectaai.cl',
]

DOMAIN_RE = re.compile(r'^[a-z0-9][a-z0-9\-\.]+\.[a-z]{2,}$')

# ── Auth ──────────────────────────────────────────────────────────────────────

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        secret = request.headers.get('X-Admin-Secret', '')
        if not hmac.compare_digest(secret, ADMIN_SECRET):
            return jsonify({'error': 'No autorizado'}), 401
        return f(*args, **kwargs)
    return decorated


# ── Helpers ───────────────────────────────────────────────────────────────────

def suspension_path(domain: str) -> Path:
    return SUSPENSIONS_DIR / f'{domain}.html'


def is_suspended(domain: str) -> bool:
    return suspension_path(domain).exists()


def make_suspension_html(domain: str) -> str:
    template = TEMPLATE_FILE.read_text()
    return template.replace('{{DOMAIN}}', domain).replace(
        'https://wa.me/56978873309',
        f'https://wa.me/{WA_NUMBER}'
    )


def all_known_domains() -> list[dict]:
    # Dominios con archivo de suspensión activo
    suspended = {
        f.stem for f in SUSPENSIONS_DIR.glob('*.html')
        if not f.name.startswith('_')
    }
    # Unir con defaults
    known = set(DEFAULT_DOMAINS) | suspended
    result = []
    for d in sorted(known):
        result.append({
            'domain': d,
            'suspended': d in suspended,
            'since': (
                datetime.fromtimestamp(
                    (SUSPENSIONS_DIR / f'{d}.html').stat().st_mtime
                ).strftime('%Y-%m-%d %H:%M')
                if d in suspended else None
            ),
        })
    return result


# ── API ───────────────────────────────────────────────────────────────────────

@app.get('/api/domains')
@require_auth
def list_domains():
    return jsonify(all_known_domains())


@app.post('/api/suspend/<domain>')
@require_auth
def suspend(domain):
    if not DOMAIN_RE.match(domain):
        return jsonify({'error': 'Dominio inválido'}), 400
    html = make_suspension_html(domain)
    suspension_path(domain).write_text(html, encoding='utf-8')
    return jsonify({'status': 'suspended', 'domain': domain})


@app.post('/api/activate/<domain>')
@require_auth
def activate(domain):
    path = suspension_path(domain)
    if path.exists():
        path.unlink()
    return jsonify({'status': 'active', 'domain': domain})


@app.delete('/api/domains/<domain>')
@require_auth
def delete_domain(domain):
    """Elimina un dominio del sistema (y su suspensión si existe)."""
    path = suspension_path(domain)
    if path.exists():
        path.unlink()
    DEFAULT_DOMAINS[:] = [d for d in DEFAULT_DOMAINS if d != domain]
    return jsonify({'status': 'deleted', 'domain': domain})


@app.get('/api/status/<domain>')
@require_auth
def status(domain):
    return jsonify({'domain': domain, 'suspended': is_suspended(domain)})


# ── Admin UI (sirve el HTML) ──────────────────────────────────────────────────

@app.get('/')
def index():
    return send_file('/var/www/suspension-manager/panel.html')


if __name__ == '__main__':
    SUSPENSIONS_DIR.mkdir(parents=True, exist_ok=True)
    app.run(host='127.0.0.1', port=8199)
