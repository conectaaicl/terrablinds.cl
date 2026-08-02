#!/bin/bash
# ============================================================
# TerraBlinds — Configuración nginx + SSL (Let's Encrypt)
# Ejecutar DESPUÉS de setup-vps.sh y DESPUÉS de apuntar DNS
# Uso: bash setup-ssl.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

header() { echo -e "\n${BLUE}══════════════════════════════${NC}\n${BLUE}  $1${NC}\n${BLUE}══════════════════════════════${NC}\n"; }
log()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()   { echo -e "${YELLOW}[!]${NC} $1"; }

header "Configuración nginx + SSL para terrablinds.cl"

read -p "Ingresa tu dominio (ej: terrablinds.cl): " DOMAIN
read -p "Ingresa tu email para SSL (ej: admin@terrablinds.cl): " EMAIL

IP_VPS=$(curl -s ifconfig.me)
echo ""
warn "Tu IP del VPS es: $IP_VPS"
warn "Asegúrate de que el DNS de terrablinds.cl apunte a esta IP antes de continuar."
warn "En HostGator: cPanel → Zone Editor → A Record → $DOMAIN → $IP_VPS"
echo ""
read -p "¿El DNS ya está apuntando? (s/n): " DNS_OK

if [ "$DNS_OK" != "s" ] && [ "$DNS_OK" != "S" ]; then
    warn "Espera a que el DNS se propague (puede tardar hasta 24h) y vuelve a ejecutar este script."
    exit 0
fi

# ──────────────────────────────────────────
# CONFIGURAR NGINX
# ──────────────────────────────────────────
header "Configurando nginx"

# Obtener el puerto del frontend desde .env
FRONTEND_PORT=$(grep FRONTEND_PORT /opt/terrablinds/.env 2>/dev/null | cut -d= -f2 | tr -d ' ' || echo "8080")

cat > /etc/nginx/sites-available/terrablinds << NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Redirect www to non-www
    if (\$host = www.${DOMAIN}) {
        return 301 https://${DOMAIN}\$request_uri;
    }

    # Needed for certbot
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to Docker frontend container
    location / {
        proxy_pass http://localhost:${FRONTEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
        client_max_body_size 20m;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/terrablinds /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && log "Configuración nginx válida"

# Obtener certificado SSL
header "Obteniendo certificado SSL (Let's Encrypt)"
mkdir -p /var/www/certbot

# Levantar nginx temporalmente en HTTP para validación
systemctl start nginx

certbot certonly \
    --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive

log "Certificado SSL obtenido para $DOMAIN"

# Reiniciar nginx con SSL
systemctl restart nginx
log "nginx reiniciado con SSL"

# Renovación automática
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -

header "✅ SSL configurado correctamente"
echo ""
echo "Tu sitio está disponible en:"
echo "  → https://${DOMAIN}"
echo ""
echo "Panel admin:"
echo "  → https://${DOMAIN}/admin"
echo ""
