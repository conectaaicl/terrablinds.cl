#!/bin/bash
# =============================================================
# TerraBlinds - PostgreSQL Backup Script
# =============================================================
# Cron diario a las 3:00 AM:
#   0 3 * * * /opt/terrablinds/backup/pg_backup.sh >> /var/log/terrablinds_backup.log 2>&1
# =============================================================

set -euo pipefail

CONTAINER="terrablinds_db"
DB_USER="${DB_USER:-terrablinds}"
DB_NAME="${DB_NAME:-terrablinds_db}"
BACKUP_DIR="/var/backups/terrablinds"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

# Crear directorio si no existe
mkdir -p "${BACKUP_DIR}"

echo "[${TIMESTAMP}] Iniciando backup de ${DB_NAME}..."

# Verificar que el contenedor está corriendo
if ! docker inspect --format='{{.State.Running}}' "${CONTAINER}" 2>/dev/null | grep -q true; then
    echo "[ERROR] Contenedor ${CONTAINER} no está corriendo. Abortando."
    exit 1
fi

# Ejecutar pg_dump y comprimir
docker exec "${CONTAINER}" pg_dump \
    -U "${DB_USER}" \
    --no-password \
    --format=plain \
    "${DB_NAME}" \
    | gzip > "${BACKUP_FILE}"

BACKUP_SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
echo "[OK] Backup creado: ${BACKUP_FILE} (${BACKUP_SIZE})"

# Eliminar backups más antiguos que RETENTION_DAYS días
DELETED=$(find "${BACKUP_DIR}" -name "backup_*.sql.gz" -mtime +${RETENTION_DAYS} -print -delete | wc -l)
if [ "${DELETED}" -gt 0 ]; then
    echo "[OK] Eliminados ${DELETED} backup(s) con más de ${RETENTION_DAYS} días."
fi

echo "[OK] Backup completado exitosamente."
