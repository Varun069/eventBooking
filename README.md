# eventBooking

A mini event management system built with Node.js, Express and MySQL.

## What it does
- Browse upcoming events
- Book tickets (handles race conditions so no overselling)
- Check in with a booking code
- View all bookings for a user

## Stack
Node.js · Express · MySQL · Swagger (OpenAPI 3.0)

## Setup

```bash
npm install
cp .env.example .env
# fill in your MySQL credentials in .env
mysql -u root -p < schema.sql
npm run dev
```

Server runs on `http://localhost:3000`  
Swagger docs at `http://localhost:3000/api-docs`

## Or run with Docker

```bash
docker compose up --build
```

Starts both MySQL and the API in one command.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /events | List upcoming events |
| POST | /events | Create an event |
| POST | /bookings | Book a ticket |
| GET | /users/:id/bookings | Get user bookings |
| POST | /events/:id/attendance | Check in with booking code |

## Notes
- Bookings use `SELECT FOR UPDATE` inside a transaction to prevent overselling
- Each booking gets a UUID as a unique entry code
- Duplicate check-ins return 409

Questions? hr@thelattice.in