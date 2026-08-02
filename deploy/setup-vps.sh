#!/bin/bash
# ============================================================
# TerraBlinds — Script de instalación automática en VPS
# Ubuntu 22.04 LTS | Ejecutar como root o con sudo
# Uso: bash setup-vps.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()   { echo -e "${YELLOW}[!]${NC} $1"; }
error()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }
header() { echo -e "\n${BLUE}══════════════════════════════════════${NC}"; echo -e "${BLUE}  $1${NC}"; echo -e "${BLUE}══════════════════════════════════════${NC}\n"; }

header "TerraBlinds — Instalación en VPS"
echo "Este script instala Docker, configura el proyecto y levanta todos los servicios."
echo ""

# ──────────────────────────────────────────
# 1. ACTUALIZAR SISTEMA
# ──────────────────────────────────────────
header "1/7 — Actualizando sistema"
apt-get update -qq && apt-get upgrade -y -qq
log "Sistema actualizado"

# ──────────────────────────────────────────
# 2. INSTALAR DEPENDENCIAS
# ──────────────────────────────────────────
header "2/7 — Instalando dependencias"
apt-get install -y -qq \
    curl git wget nano ufw fail2ban \
    ca-certificates gnupg lsb-release
log "Dependencias instaladas"

# ──────────────────────────────────────────
# 3. INSTALAR DOCKER
# ──────────────────────────────────────────
header "3/7 — Instalando Docker"

if command -v docker &> /dev/null; then
    warn "Docker ya está instalado: $(docker --version)"
else
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
        gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
        tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    log "Docker instalado: $(docker --version)"
fi

# ──────────────────────────────────────────
# 4. CONFIGURAR FIREWALL
# ──────────────────────────────────────────
header "4/7 — Configurando firewall UFW"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
log "Firewall configurado (SSH + HTTP + HTTPS)"

# ──────────────────────────────────────────
# 5. INSTALAR CERTBOT (SSL gratuito)
# ──────────────────────────────────────────
header "5/7 — Instalando Certbot para SSL"
if ! command -v certbot &> /dev/null; then
    apt-get install -y -qq certbot python3-certbot-nginx
    log "Certbot instalado"
else
    warn "Certbot ya está instalado"
fi

# ──────────────────────────────────────────
# 6. INSTALAR NGINX EN HOST (SSL termination)
# ──────────────────────────────────────────
header "6/7 — Instalando nginx en host"
if ! command -v nginx &> /dev/null; then
    apt-get install -y -qq nginx
    systemctl enable nginx
    systemctl start nginx
    log "nginx instalado"
else
    warn "nginx ya está instalado"
fi

# ──────────────────────────────────────────
# 7. CLONAR / COPIAR PROYECTO
# ──────────────────────────────────────────
header "7/7 — Configurando proyecto"

PROJECT_DIR="/opt/terrablinds"

if [ -d "$PROJECT_DIR" ]; then
    warn "Directorio $PROJECT_DIR ya existe. Actualizando..."
    cd "$PROJECT_DIR"
    git pull 2>/dev/null || warn "No es un repo git o no hay cambios."
else
    echo ""
    echo "Opciones para subir el proyecto:"
    echo "  A) git clone (si tienes el repo en GitHub)"
    echo "  B) scp (subir desde tu PC)"
    echo ""
    read -p "¿Tienes el proyecto en GitHub? (s/n): " HAS_GITHUB

    if [ "$HAS_GITHUB" = "s" ] || [ "$HAS_GITHUB" = "S" ]; then
        read -p "URL del repositorio (ej: https://github.com/usuario/terrablinds): " REPO_URL
        git clone "$REPO_URL" "$PROJECT_DIR"
    else
        mkdir -p "$PROJECT_DIR"
        warn "Directorio creado en $PROJECT_DIR"
        warn "Sube los archivos con SCP desde tu PC:"
        warn "  scp -r ./terrablinds.cl/* root@TU_IP_VPS:/opt/terrablinds/"
        echo ""
        read -p "Presiona ENTER cuando hayas subido los archivos..." DUMMY
    fi
fi

cd "$PROJECT_DIR"
log "Proyecto en $PROJECT_DIR"

# ──────────────────────────────────────────
# CREAR .env SI NO EXISTE
# ──────────────────────────────────────────
if [ ! -f ".env" ]; then
    warn "No existe .env — creando uno de ejemplo..."
    cp .env.production.example .env 2>/dev/null || cat > .env << 'ENVEOF'
# ============================
# TerraBlinds — Variables de entorno
# ============================

# Base de datos
DB_USER=terrablinds
DB_PASSWORD=CAMBIAR_PASSWORD_SEGURO
DB_NAME=terrablinds_db

# App
JWT_SECRET=CAMBIAR_SECRET_MUY_LARGO_Y_ALEATORIO
NODE_ENV=production
PORT=5000

# URLs (reemplaza con tu dominio)
VITE_API_URL=https://terrablinds.cl
BASE_URL=https://terrablinds.cl
FRONTEND_URL=https://terrablinds.cl
SITE_URL=https://terrablinds.cl
CORS_ORIGINS=https://terrablinds.cl,https://www.terrablinds.cl

# Puertos Docker
FRONTEND_PORT=8080

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=TerraBlinds <noreply@terrablinds.cl>

# Flow.cl
FLOW_API_KEY=
FLOW_SECRET_KEY=
FLOW_API_URL=https://www.flow.cl/api

# Mercado Pago
MP_ACCESS_TOKEN=
ENVEOF
    warn "IMPORTANTE: Edita el archivo .env antes de continuar"
    warn "  nano /opt/terrablinds/.env"
    echo ""
    read -p "Presiona ENTER cuando hayas editado el .env..." DUMMY
fi

# ──────────────────────────────────────────
# LEVANTAR DOCKER COMPOSE
# ──────────────────────────────────────────
header "Levantando servicios con Docker Compose"

docker compose down 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

log "Contenedores levantados"
echo ""
docker compose ps

# ──────────────────────────────────────────
# MIGRACIÓN BASE DE DATOS
# ──────────────────────────────────────────
header "Ejecutando migración de base de datos"
sleep 10  # Esperar que postgres esté listo

docker compose exec -T postgres psql \
    -U "${DB_USER:-terrablinds}" \
    -d "${DB_NAME:-terrablinds_db}" \
    -f /dev/stdin < backend/src/scripts/migrate_new_fields.sql 2>/dev/null || \
    warn "Migración ya fue ejecutada o hubo un error menor."

# Seed admin si no existe
docker compose exec backend node src/scripts/seedAdmin.js 2>/dev/null || true

log "Base de datos configurada"

# ──────────────────────────────────────────
# RESULTADO FINAL
# ──────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ INSTALACIÓN COMPLETADA${NC}"
echo -e "${GREEN}══════════════════════════════════════${NC}"
echo ""
echo "Servicios corriendo en:"
echo "  → Aplicación: http://$(curl -s ifconfig.me):8080"
echo ""
echo "Próximo paso: configurar nginx + SSL"
echo "  bash /opt/terrablinds/deploy/setup-ssl.sh"
echo ""
