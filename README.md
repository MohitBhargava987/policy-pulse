# Node.js Assignment Backend (Mohit)

## Overview
This project implements the technical assessment requirements:
- Upload XLSX/CSV and insert into MongoDB using Worker Threads.
- Search API to find policy info by username.
- API to provide aggregated policies by user.
- Collections: Agent, User, Account, LOB, Carrier, Policy.
- CPU monitor that restarts the server when CPU usage > 70% (supervisor process).
- POST /api/schedule: schedule a message to be inserted into DB at specific day & time.

## Setup
1. Copy `.env.example` to `.env` and fill `MONGO_URI` and other values.
2. `npm install`
3. Run `npm run dev` (requires nodemon) or `npm start`

The supervisor `start.js` spawns the server and monitors the child's CPU usage. On high CPU (>70%), it restarts the server automatically.

## Endpoints (high level)
- `POST /api/upload` - Upload CSV/XLSX file (multipart/form-data field name: file). Works via worker thread.
- `GET /api/policy/search?username=<name>` - Search policy by username (first name or email).
- `GET /api/policies/aggregated` - Aggregated policy counts grouped by user.
- `POST /api/schedule` - Schedule a message with `{ "message": "...", "day": "YYYY-MM-DD", "time": "HH:MM" }`

## Notes
- The project uses both `mongoose` (for models) and the native `mongodb` driver in worker for insertion.
- Scheduled messages are persisted to `scheduled_messages` collection so they survive restarts (scheduler loads pending messages on boot).
