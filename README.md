# Policy Pulse Backend

## Overview
This project implements the technical assessment requirements:
- Upload XLSX/CSV and insert into MongoDB using Worker Threads.
- Search API to find policy info by username.
- API to provide aggregated policies by user.
- Collections: Agent, User, Account, LOB, Carrier, Policy.
- CPU monitor that restarts the server when CPU usage > 70% (supervisor process).
- POST /api/schedule: schedule a message to be inserted into DB at specific day & time.

## Setup
1. Use `.env` file with my `MONGO_URI`, I have used mongodb atlas.
2. `npm install`
3. Run `npm run dev` (requires nodemon) or `npm start`

The supervisor `start.js` spawns the server and monitors the child's CPU usage. On high CPU (>70%), it restarts the server automatically.

## Endpoints
- `POST /api/upload` - Upload CSV/XLSX file (multipart/form-data field name: file). Works via worker thread.
- `GET /api/policy/search?username=<name>` - Search policy by username (first name or email).
- `GET /api/policies/aggregated` - Aggregated policy counts grouped by user.
- `POST /api/schedule` - Schedule a message with `{ "message": "...", "day": "YYYY-MM-DD", "time": "HH:MM" }`

## Notes
- The project uses both `mongoose` (for models) and the native `mongodb` driver in worker for insertion.
- Scheduled messages are persisted to `scheduled_messages` collection so they survive restarts (scheduler loads pending messages on boot).

## API Curls
1. Upload CSV file data on the mongoDb. (Please atach csv file here)

curl --location 'localhost:3000/api/upload' \
--form 'file=@"/C:/Users/Dell/Downloads/data-sheet - Node js Assesment (2) (1).csv"'

2. Search API to find policy info with the help of the username.
curl --location 'localhost:3000/api/policy/search?username=Torie%20Buchanan'

3. API to provide aggregated policy by each user.

curl --location 'localhost:3000/api/policy/aggregated'

4. Post service that takes the message, day, and time in body parameters and it inserts that message into DB at that particular day and time.

curl --location 'localhost:3000/api/schedule' \
--header 'Content-Type: application/json' \
--data '{
    "message": "Send renewal reminder to client",
    "day": "2025-09-28",
    "time": "22:37"
}'