"""
ConectaAI - Suspension Manager API
Controla activacion/suspension de dominios de clientes.
Corre en puerto 8199 (localhost only).
"""
import os
import re
import json
import hmac
import threading
import urllib.request
from pathlib import Path
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, jsonify, request, send_file, abort, make_response

app = Flask(__name__)

SUSPENSIONS_DIR = Path('/var/www/suspensions')
TEMPLATE_FILE   = SUSPENSIONS_DIR / '_template.html'
DOMAINS_FILE    = SUSPENSIONS_DIR / '_domains.json'
VISITS_FILE     = SUSPENSIONS_DIR / '_visits.json'
BANNER_FILE     = SUSPENSIONS_DIR / '_banner.json'
LOGO_FILE       = Path('/var/www/suspension-manager/logo.conectaai.png')

ADMIN_SECRET    = os.environ.get('ADMIN_SECRET',    '')
WA_NUMBER       = os.environ.get('WA_NUMBER',       '56998101891')
ADMIN_EMAIL     = os.environ.get('ADMIN_EMAIL',     'soporte@conectaai.cl')
MAILSAAS_URL    = os.environ.get('MAILSAAS_URL',    'https://mail.conectaai.cl')
MAILSAAS_KEY    = os.environ.get('MAILSAAS_API_KEY','')
EVO_URL         = os.environ.get('EVO_URL',         'http://127.0.0.1:8082')
EVO_KEY         = os.environ.get('EVO_KEY',         'evokey-conectaai-2025')
EVO_INSTANCE    = os.environ.get('EVO_INSTANCE',    'social')

DEFAULT_DOMAINS = ['ama.conectaai.cl', 'amav2.conectaai.cl']
DOMAIN_RE       = re.compile(r'^[a-z0-9][a-z0-9\-\.]+\.[a-z]{2,}$')

PIXEL_GIF = (
    b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff'
    b'\x00\x00\x00\x21\xf9\x04\x00\x00\x00\x00\x00\x2c\x00\x00\x00\x00'
    b'\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
)


# ── Storage helpers ───────────────────────────────────────────────────────────

def _empty_client():
    return {
        'email': '', 'wa': '', 'name': '',
        'scheduled_suspension': None, 'notified_5d': False,
    }


def load_clients() -> dict:
    """Returns {domain: {email, wa, name, scheduled_suspension, notified_5d}}"""
    if DOMAINS_FILE.exists():
        try:
            data = json.loads(DOMAINS_FILE.read_text())
            if isinstance(data, list):
                # Migrate old format (list of strings)
                return {d: _empty_client() for d in data}
            return data
        except Exception:
            pass
    return {d: _empty_client() for d in DEFAULT_DOMAINS}


def save_clients(clients: dict):
    DOMAINS_FILE.write_text(json.dumps(clients))


def load_visits() -> dict:
    if VISITS_FILE.exists():
        try:
            return json.loads(VISITS_FILE.read_text())
        except Exception:
            pass
    return {}


def save_visits(visits: dict):
    VISITS_FILE.write_text(json.dumps(visits))


def load_banner() -> dict:
    if BANNER_FILE.exists():
        try:
            return json.loads(BANNER_FILE.read_text())
        except Exception:
            pass
    return {'text': '', 'active': False}


def save_banner(banner: dict):
    BANNER_FILE.write_text(json.dumps(banner))


def suspension_path(domain: str) -> Path:
    return SUSPENSIONS_DIR / f'{domain}.html'


def is_suspended(domain: str) -> bool:
    return suspension_path(domain).exists()


def make_suspension_html(domain: str) -> str:
    template = TEMPLATE_FILE.read_text()
    return template.replace('{{DOMAIN}}', domain).replace(
        'https://wa.me/56998101891', f'https://wa.me/{WA_NUMBER}'
    )


def all_known_domains() -> list:
    clients = load_clients()
    visits  = load_visits()
    suspended = {
        f.stem for f in SUSPENSIONS_DIR.glob('*.html')
        if not f.name.startswith('_')
    }
    # Include any suspended domains not in persistent list
    for d in suspended:
        if d not in clients:
            clients[d] = _empty_client()

    result = []
    for d in sorted(clients):
        meta = clients[d]
        result.append({
            'domain':   d,
            'suspended': d in suspended,
            'since': (
                datetime.fromtimestamp(
                    (SUSPENSIONS_DIR / f'{d}.html').stat().st_mtime
                ).strftime('%Y-%m-%d %H:%M')
                if d in suspended else None
            ),
            'email':  meta.get('email', ''),
            'wa':     meta.get('wa', ''),
            'name':   meta.get('name', ''),
            'scheduled_suspension': meta.get('scheduled_suspension'),
            'notified_5d': meta.get('notified_5d', False),
            'visits': visits.get(d, 0),
        })
    return result


# ── Auth ──────────────────────────────────────────────────────────────────────

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        secret = request.headers.get('X-Admin-Secret', '')
        if not hmac.compare_digest(secret, ADMIN_SECRET):
            return jsonify({'error': 'No autorizado'}), 401
        return f(*args, **kwargs)
    return decorated


# ── Notifications ─────────────────────────────────────────────────────────────

def _http_post(url, body_dict, headers):
    body = json.dumps(body_dict).encode('utf-8')
    req  = urllib.request.Request(url, data=body, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status in (200, 201)
    except Exception:
        return False


def send_email(to_email: str, subject: str, html: str) -> bool:
    if not MAILSAAS_KEY or not to_email:
        return False
    return _http_post(
        f'{MAILSAAS_URL}/api/send',
        {'from': 'ConectaAI <noreply@conectaai.cl>', 'to': to_email,
         'subject': subject, 'html': html},
        {'Content-Type': 'application/json', 'Authorization': f'Bearer {MAILSAAS_KEY}'},
    )


def send_whatsapp(wa_number: str, text: str) -> bool:
    if not wa_number:
        return False
    num = wa_number.replace('+', '').replace(' ', '').replace('-', '')
    return _http_post(
        f'{EVO_URL}/message/sendText/{EVO_INSTANCE}',
        {'number': num, 'text': text},
        {'Content-Type': 'application/json', 'apikey': EVO_KEY},
    )


def _suspension_email_html(domain: str, name: str, scheduled: str, warning: bool) -> str:
    if warning:
        title   = 'Aviso: Tu servicio sera suspendido pronto'
        message = (
            f'Estimado/a <strong>{name or domain}</strong>,<br><br>'
            f'Te informamos que el servicio del dominio '
            f'<strong style="color:#a5b4fc">{domain}</strong> '
            f'sera <strong style="color:#f87171">suspendido el {scheduled}</strong> '
            f'por falta de pago.<br><br>'
            f'Para evitar la suspension, realiza tu pago antes de esa fecha.'
        )
        color = '#ef4444'
    else:
        title   = 'Tu servicio ha sido suspendido'
        message = (
            f'Estimado/a <strong>{name or domain}</strong>,<br><br>'
            f'El servicio del dominio '
            f'<strong style="color:#a5b4fc">{domain}</strong> '
            f'ha sido <strong style="color:#f87171">suspendido</strong> '
            f'por falta de pago.'
        )
        color = '#dc2626'

    wa_link = f'https://wa.me/{WA_NUMBER}?text=Hola,%20quiero%20reactivar%20el%20sitio%20{domain}'
    return (
        f'<div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;'
        f'background:#070b12;color:#e2e8f0;border-radius:16px;overflow:hidden;'
        f'border:1px solid rgba(255,255,255,.08)">'
        f'<div style="background:{color};padding:20px 32px">'
        f'<h2 style="color:#fff;margin:0;font-size:18px">{title}</h2></div>'
        f'<div style="padding:28px 32px">'
        f'<p style="color:#94a3b8;line-height:1.7;margin-bottom:24px">{message}</p>'
        f'<a href="{wa_link}" style="display:inline-block;background:#16a34a;color:#fff;'
        f'padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;'
        f'margin-bottom:12px">Escribir por WhatsApp</a><br>'
        f'<a href="mailto:soporte@conectaai.cl" style="color:#a5b4fc;font-size:13px">'
        f'soporte@conectaai.cl</a>'
        f'<hr style="border-color:rgba(255,255,255,.08);margin:24px 0">'
        f'<p style="color:#475569;font-size:12px">ConectaAI - {domain}</p>'
        f'</div></div>'
    )


def _suspension_wa_text(domain: str, name: str, scheduled: str, warning: bool) -> str:
    n = name or domain
    if warning:
        return (
            f'Hola {n}! Te avisamos que tu sitio *{domain}* sera '
            f'*suspendido el {scheduled}* por falta de pago.\n\n'
            f'Para evitarlo contactanos:\n'
            f'- WhatsApp: wa.me/{WA_NUMBER}\n'
            f'- Email: soporte@conectaai.cl'
        )
    return (
        f'Hola {n}, tu sitio *{domain}* ha sido *suspendido* por falta de pago.\n'
        f'Contactanos para reactivarlo: wa.me/{WA_NUMBER}'
    )


def notify_domain(domain: str, warning: bool = True) -> dict:
    """Send email + WA notification. Returns {email_sent, wa_sent}."""
    clients = load_clients()
    meta = clients.get(domain, _empty_client())
    name = meta.get('name', '')
    email = meta.get('email', '')
    wa = meta.get('wa', '')
    sched = meta.get('scheduled_suspension', '')
    if sched:
        try:
            dt = datetime.fromisoformat(sched)
            sched_str = dt.strftime('%d/%m/%Y a las %H:%M')
        except Exception:
            sched_str = sched
    else:
        sched_str = 'fecha programada'

    html = _suspension_email_html(domain, name, sched_str, warning)
    subj = ('Aviso de suspension proxima - ' if warning else 'Servicio suspendido - ') + domain
    email_ok = send_email(email, subj, html)

    wa_text = _suspension_wa_text(domain, name, sched_str, warning)
    wa_ok = send_whatsapp(wa, wa_text)

    return {'email_sent': email_ok, 'wa_sent': wa_ok}


def send_password_email():
    if not MAILSAAS_KEY:
        return False
    return send_email(
        ADMIN_EMAIL,
        'Contrasena - Panel de Clientes ConectaAI',
        (
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
        )
    )


# ── Background scheduler ──────────────────────────────────────────────────────

def _run_scheduler():
    """Checks every 5 minutes for pending suspensions."""
    while True:
        try:
            _check_scheduled_suspensions()
        except Exception:
            pass
        threading.Event().wait(300)  # 5 minutes


def _check_scheduled_suspensions():
    clients = load_clients()
    changed = False
    now = datetime.now()

    for domain, meta in clients.items():
        sched = meta.get('scheduled_suspension')
        if not sched:
            continue
        try:
            dt = datetime.fromisoformat(sched)
        except Exception:
            continue

        delta = dt - now
        days_left = delta.total_seconds() / 86400

        if not meta.get('notified_5d') and 0 < days_left <= 5:
            result = notify_domain(domain, warning=True)
            if result['email_sent'] or result['wa_sent']:
                meta['notified_5d'] = True
                changed = True

        if days_left <= 0 and not is_suspended(domain):
            # Auto-suspend
            html = make_suspension_html(domain)
            suspension_path(domain).write_text(html, encoding='utf-8')
            notify_domain(domain, warning=False)
            meta['scheduled_suspension'] = None
            meta['notified_5d'] = False
            changed = True

    if changed:
        save_clients(clients)


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
        return jsonify({'error': 'Dominio invalido'}), 400
    clients = load_clients()
    if domain not in clients:
        clients[domain] = _empty_client()
        save_clients(clients)
    return jsonify({'status': 'added', 'domain': domain})


@app.patch('/api/domains/<domain>')
@require_auth
def update_domain(domain):
    """Update client metadata: name, email, wa."""
    data = request.get_json(silent=True) or {}
    clients = load_clients()
    if domain not in clients:
        clients[domain] = _empty_client()
    for field in ('name', 'email', 'wa'):
        if field in data:
            clients[domain][field] = str(data[field]).strip()
    save_clients(clients)
    return jsonify({'status': 'updated', 'domain': domain})


@app.post('/api/domains/<domain>/schedule')
@require_auth
def schedule_suspension(domain):
    """Set or clear a scheduled suspension datetime (ISO format)."""
    data = request.get_json(silent=True) or {}
    dt_str = data.get('scheduled_suspension')
    clients = load_clients()
    if domain not in clients:
        clients[domain] = _empty_client()

    if dt_str:
        try:
            datetime.fromisoformat(dt_str)  # validate
        except ValueError:
            return jsonify({'error': 'Formato de fecha invalido'}), 400
        clients[domain]['scheduled_suspension'] = dt_str
        clients[domain]['notified_5d'] = False
    else:
        clients[domain]['scheduled_suspension'] = None
        clients[domain]['notified_5d'] = False

    save_clients(clients)
    return jsonify({'status': 'scheduled', 'domain': domain,
                    'scheduled_suspension': dt_str})


@app.post('/api/domains/<domain>/notify')
@require_auth
def notify_now(domain):
    """Send notification immediately."""
    result = notify_domain(domain, warning=True)
    return jsonify({'domain': domain, **result})


@app.post('/api/suspend/<domain>')
@require_auth
def suspend(domain):
    if not DOMAIN_RE.match(domain):
        return jsonify({'error': 'Dominio invalido'}), 400
    clients = load_clients()
    if domain not in clients:
        clients[domain] = _empty_client()
        save_clients(clients)
    html = make_suspension_html(domain)
    suspension_path(domain).write_text(html, encoding='utf-8')
    return jsonify({'status': 'suspended', 'domain': domain})


@app.post('/api/activate/<domain>')
@require_auth
def activate(domain):
    clients = load_clients()
    if domain not in clients:
        clients[domain] = _empty_client()
        save_clients(clients)
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
    clients = load_clients()
    clients.pop(domain, None)
    save_clients(clients)
    return jsonify({'status': 'deleted', 'domain': domain})


@app.get('/api/status/<domain>')
@require_auth
def status(domain):
    return jsonify({'domain': domain, 'suspended': is_suspended(domain)})


# ── Visit counter ─────────────────────────────────────────────────────────────

@app.get('/api/visits')
@require_auth
def get_visits():
    return jsonify(load_visits())


@app.post('/api/visits/<domain>/reset')
@require_auth
def reset_visits(domain):
    visits = load_visits()
    visits[domain] = 0
    save_visits(visits)
    return jsonify({'domain': domain, 'visits': 0})


@app.get('/track/<domain>')
def track_visit(domain):
    if DOMAIN_RE.match(domain):
        visits = load_visits()
        visits[domain] = visits.get(domain, 0) + 1
        save_visits(visits)
    resp = make_response(PIXEL_GIF)
    resp.headers['Content-Type']  = 'image/gif'
    resp.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate'
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp


# ── Banner ────────────────────────────────────────────────────────────────────

@app.get('/api/banner/public')
def banner_public():
    resp = jsonify(load_banner())
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Cache-Control'] = 'no-store'
    return resp


@app.get('/api/banner')
@require_auth
def get_banner():
    return jsonify(load_banner())


@app.put('/api/banner')
@require_auth
def update_banner():
    data = request.get_json(silent=True) or {}
    banner = {
        'text':   str(data.get('text', '')).strip(),
        'active': bool(data.get('active', False)),
    }
    save_banner(banner)
    return jsonify({'status': 'updated', **banner})


# ── Auth / misc ───────────────────────────────────────────────────────────────

@app.post('/api/forgot-password')
def forgot_password():
    ok = send_password_email()
    return jsonify({'status': 'sent'}) if ok else (jsonify({'error': 'No se pudo enviar'}), 500)


@app.get('/logo.png')
def serve_logo():
    if LOGO_FILE.exists():
        return send_file(str(LOGO_FILE), mimetype='image/png')
    abort(404)


@app.get('/')
def index():
    return send_file('/var/www/suspension-manager/panel.html')


# ── Start ─────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    SUSPENSIONS_DIR.mkdir(parents=True, exist_ok=True)
    # Migrate domain list on first run
    clients = load_clients()
    save_clients(clients)
    # Start background scheduler
    t = threading.Thread(target=_run_scheduler, daemon=True)
    t.start()
    app.run(host='127.0.0.1', port=8199)
