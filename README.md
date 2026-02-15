# TerraBlinds.cl Platform

Professional web platform for custom curtains and blinds.

## Stack
- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Infrastructure**: Docker

## Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

## Setup
1. Copy `.env.example` to `.env` in `backend/` and root.
2. Run `docker-compose up -d` to start the database.
3. Install dependencies:
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`

## Development
- Backend: `npm run dev`
- Frontend: `npm run dev`
