# 📋 INSTRUCCIONES: Configurar PostgreSQL

## Opción 1: Instalar PostgreSQL Localmente (RECOMENDADO)

### Windows:
1. Descarga PostgreSQL 16: https://www.postgresql.org/download/windows/
2. Ejecuta el instalador
3. Durante la instalación:
   - Usuario: `postgres`
   - Contraseña: `terrablinds123` (o la que prefieras)
   - Puerto: `5432`
4. Abre pgAdmin 4 (se instala automáticamente)
5. Crea una base de datos llamada `terrablinds_db`

### Crear la base de datos:
```sql
CREATE DATABASE terrablinds_db;
CREATE USER terrablinds WITH PASSWORD 'terrablinds123';
GRANT ALL PRIVILEGES ON DATABASE terrablinds_db TO terrablinds;
```

## Opción 2: Usar SQLite (Más Rápido para Desarrollo)

Si quieres algo más simple para desarrollo, puedo configurar SQLite que no requiere instalación.

## Después de instalar PostgreSQL:

1. Verifica que esté corriendo:
```powershell
psql --version
```

2. Ejecuta el seed:
```powershell
cd backend
node src/scripts/seed.js
```

3. Reinicia el backend:
```powershell
# Mata el proceso actual
taskkill /F /IM node.exe

# Inicia de nuevo
node src/index.js
```

## ¿Qué prefieres?

A) Instalar PostgreSQL (5-10 minutos)
B) Usar SQLite (2 minutos, más simple)
C) Continuar sin BD por ahora (usar mocks temporalmente)

Dime cuál opción prefieres y continúo.
