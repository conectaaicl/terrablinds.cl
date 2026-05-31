"""
ConectaAI — Suspension Manager API
Controla activación/suspensión de dominios de clientes.
Corre en puerto 8199 (localhost only).
"""
import os
import re
import json
import hmac
import urllib.request
from pathlib import Path
from datetime import datetime
from functools import wraps
from flask import Flask, jsonify, request, send_file, abort

app = Flask(__name__)

SUSPENSIONS_DIR = Path('/var/www/suspensions')
TEMPLATE_FILE   = SUSPENSIONS_DIR / '_template.html'
DOMAINS_FILE    = SUSPENSIONS_DIR / '_domains.json'
LOGO_FILE       = Path('/var/www/suspension-manager/logo.conectaai.png')
ADMIN_SECRET    = os.environ.get('ADMIN_SECRET', 'ConectaAdmin2026!')
WA_NUMBER       = os.environ.get('WA_NUMBER', '56998101891')
ADMIN_EMAIL     = os.environ.get('ADMIN_EMAIL', 'soporte@conectaai.cl')
MAILSAAS_URL    = os.environ.get('MAILSAAS_URL', 'https://mail.conectaai.cl')
MAILSAAS_KEY    = os.environ.get('MAILSAAS_API_KEY', '')

DEFAULT_DOMAINS = [
    'ama.conectaai.cl',
    'amav2.conectaai.cl',
]

DOMAIN_RE = re.compile(r'^[a-z0-9][a-z0-9\-\.]+\.[a-z]{2,}$')


# ── Persistent domain list ────────────────────────────────────────────────────

def load_domain_list() -> set:
    if DOMAINS_FILE.exists():
        try:
            return set(json.loads(DOMAINS_FILE.read_text()))
        except Exception:
            pass
    return set(DEFAULT_DOMAINS)


def save_domain_list(domains: set):
    DOMAINS_FILE.write_text(json.dumps(sorted(domains)))


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
        'https://wa.me/56998101891',
        f'https://wa.me/{WA_NUMBER}'
    )


def all_known_domains() -> list:
    known = load_domain_list()
    suspended = {
        f.stem for f in SUSPENSIONS_DIR.glob('*.html')
        if not f.name.startswith('_')
    }
    known |= suspended
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


def send_password_email():
    if not MAILSAAS_KEY:
        return False
    try:
        body = json.dumps({
            'from': 'ConectaAI <noreply@conectaai.cl>',
            'to': ADMIN_EMAIL,
            'subject': 'Contrasena - Panel de Clientes ConectaAI',
            'html': (
                '<div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;'
                'background:#070b12;color:#e2e8f0;padding:32px;border-radius:16px;'
                'border:1px solid rgba(255,255,255,.08)">'
                '<h2 style="color:#fff;margin-bottom:16px">Contrasena del Panel</h2>'
                '<p style="color:#94a3b8;margin-bottom:24px">Recuperacion de acceso a clientes.conectaai.cl</p>'
                '<div style="background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.25);'
                'border-radius:10px;padding:16px 20px;font-family:monospace;font-size:18px;'
                'color:#a5b4fc;text-align:center;letter-spacing:2px">' + ADMIN_SECRET + '</div>'
                '<p style="color:#475569;font-size:12px;margin-top:20px">'
                'Si no solicitaste esto, ignora este email. - ConectaAI</p>'
                '</div>'
            ),
        }).encode('utf-8')
        req = urllib.request.Request(
            f'{MAILSAAS_URL}/api/send',
            data=body,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {MAILSAAS_KEY}',
            },
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status in (200, 201)
    except Exception:
        return False


# ── API ───────────────────────────────────────────────────────────────────────

@app.get('/api/domains')
@require_auth
def list_domains():
    return jsonify(all_known_domains())


@app.post('/api/domains')
@require_auth
def add_domain():
    data = request.get_json(silent=True) or {}
    domain = (data.get('domain') or '').strip().lower()
    if not domain or not DOMAIN_RE.match(domain):
        return jsonify({'error': 'Dominio inválido'}), 400
    known = load_domain_list()
    known.add(domain)
    save_domain_list(known)
    return jsonify({'status': 'added', 'domain': domain})


@app.post('/api/suspend/<domain>')
@require_auth
def suspend(domain):
    if not DOMAIN_RE.match(domain):
        return jsonify({'error': 'Dominio inválido'}), 400
    known = load_domain_list()
    known.add(domain)
    save_domain_list(known)
    html = make_suspension_html(domain)
    suspension_path(domain).write_text(html, encoding='utf-8')
    return jsonify({'status': 'suspended', 'domain': domain})


@app.post('/api/activate/<domain>')
@require_auth
def activate(domain):
    known = load_domain_list()
    known.add(domain)
    save_domain_list(known)
    path = suspension_path(domain)
    if path.exists():
        path.unlink()
    return jsonify({'status': 'active', 'domain': domain})


@app.delete('/api/domains/<domain>')
@require_auth
def delete_domain(domain):
    path = suspension_path(domain)
    if path.exists():
        path.unlink()
    known = load_domain_list()
    known.discard(domain)
    save_domain_list(known)
    return jsonify({'status': 'deleted', 'domain': domain})


@app.get('/api/status/<domain>')
@require_auth
def status(domain):
    return jsonify({'domain': domain, 'suspended': is_suspended(domain)})


@app.post('/api/forgot-password')
def forgot_password():
    ok = send_password_email()
    if ok:
        return jsonify({'status': 'sent'})
    return jsonify({'error': 'No se pudo enviar'}), 500


@app.get('/logo.png')
def serve_logo():
    if LOGO_FILE.exists():
        return send_file(str(LOGO_FILE), mimetype='image/png')
    abort(404)


# ── Admin UI ──────────────────────────────────────────────────────────────────

@app.get('/')
def index():
    return send_file('/var/www/suspension-manager/panel.html')


if __name__ == '__main__':
    SUSPENSIONS_DIR.mkdir(parents=True, exist_ok=True)
    if not DOMAINS_FILE.exists():
        save_domain_list(set(DEFAULT_DOMAINS))
    app.run(host='127.0.0.1', port=8199)
