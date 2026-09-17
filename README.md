# FuelFlow

FuelFlow is a MongoDB-backed fuel-station operations platform for owners, workers, and platform administrators. It starts with an empty database: no accounts, stations, reports, transactions, or analytics are seeded.

## What is included

- JWT authentication with bcrypt password hashing and role-based access controls
- Isolated owner/worker/admin station access
- Multi-station configuration and station-specific, historically captured fuel pricing
- Backend-calculated meter sales, gross revenue, expenses, and net revenue
- Payments, expenses, report review/rejection flow, and real-time Socket.IO notifications
- MongoDB-powered dashboard analytics with empty-safe zero states
- Cloudinary bill upload endpoint (Multer memory upload; files never enter MongoDB)
- Helmet, CORS, rate limiting, Zod validation, and consistent API errors

## Run locally

1. Copy .env.example to .env and configure a MongoDB Atlas connection plus a long JWT_SECRET.
2. Install dependencies: npm install
3. Start the development server: npm run dev
4. Open http://localhost:3000.

Cloudinary variables are needed only when using document uploads. The app intentionally does not silently use local file storage in production.

## Production

Run npm run build followed by npm start. Configure the same environment variables on Render/Railway and set CLIENT_URL to the Vercel frontend origin. MongoDB Atlas should permit the backend host and Cloudinary should be configured with its production credentials.

## API highlights

| Area | Endpoint |
| --- | --- |
| Auth | POST /api/auth/register, POST /api/auth/login |
| Stations | GET/POST /api/stations, PUT /api/stations/:id |
| Workers | GET/POST /api/workers |
| Reports | GET/POST /api/reports, PATCH /api/reports/:id/status |
| Financials | GET/POST /api/payments, GET/POST /api/expenses |
| Analytics | GET /api/analytics/dashboard, GET /api/analytics/:metric |
| Bills | POST /api/bills multipart form (file, stationId) |

All financial calculations are authoritative on the server. The report endpoint receives meter readings and uses the active station price at submission time; it stores those price snapshots with the report.
