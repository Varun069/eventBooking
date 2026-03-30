# Event Booking System
> Lattice Innovations — Junior Node.js Developer Selection Test

A RESTful API for browsing events and booking tickets, built with **Node.js (Express)** and **MySQL**.

---

## Tech Stack
| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express.js |
| Database | MySQL 8 |
| ORM/Driver | mysql2 (promise pool) |
| Docs | Swagger UI (OpenAPI 3.0) |
| Unique codes | uuid v4 |

---

## Project Structure
```
event-booking-system/
├── src/
│   ├── app.js                  # Entry point, middleware, route wiring
│   ├── config/
│   │   └── db.js               # MySQL connection pool
│   ├── controllers/
│   │   ├── eventController.js  # GET /events, POST /events, POST /events/:id/attendance
│   │   ├── bookingController.js# POST /bookings (with transaction)
│   │   └── userController.js   # GET /users/:id/bookings
│   └── routes/
│       ├── events.js
│       ├── bookings.js
│       └── users.js
├── schema.sql                  # Full DB schema + seed data
├── swagger.yaml                # OpenAPI 3.0 spec
├── postman_collection.json     # Postman collection (import directly)
├── Dockerfile
├── docker-compose.yml          # One-click: API + MySQL
├── .env.example
└── package.json
```

---

## Option A — Run with Docker (Recommended)

### Prerequisites
- Docker + Docker Compose installed

### Steps
```bash
git clone <your-repo-url>
cd event-booking-system

docker compose up --build
```

That's it. Docker will:
1. Start a MySQL 8 container and run `schema.sql` automatically
2. Start the API server on port 3000

- **API:** http://localhost:3000
- **Swagger UI:** http://localhost:3000/api-docs

---

## Option B — Manual Setup

### Prerequisites
- Node.js 20+
- MySQL 8+ running locally

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 3. Set up the database
```bash
mysql -u root -p < schema.sql
```
This creates the `event_booking` database, all tables, and inserts seed data (3 users, 3 events).

### 4. Start the server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

- **API:** http://localhost:3000
- **Swagger UI:** http://localhost:3000/api-docs

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/events` | List all upcoming events |
| `POST` | `/events` | Create a new event |
| `POST` | `/bookings` | Book a ticket (transactional) |
| `GET` | `/users/:id/bookings` | Get all bookings for a user |
| `POST` | `/events/:id/attendance` | Check in via booking code |
| `GET` | `/health` | Health check |

Full documentation at `/api-docs` once the server is running.

---

## Key Design Decisions

### Race Condition Prevention
`POST /bookings` uses a MySQL transaction with `SELECT ... FOR UPDATE` to lock the event row before checking `remaining_tickets`. This prevents two simultaneous requests from over-booking the last available ticket.

### Unique Booking Code
Each booking gets a **UUID v4** stored in `bookings.booking_code`. This is the token used for attendance check-in.

### Duplicate Check-in Prevention
`event_attendance.booking_id` has a `UNIQUE` constraint — attempting a second check-in returns `409 Conflict`.

---

## Testing with Postman
1. Open Postman → Import → select `postman_collection.json`
2. Set the `base_url` variable to `http://localhost:3000`
3. Run requests in order: Create Event → Book Ticket → Record Attendance → Get User Bookings

---

## Questions
hr@thelattice.in
