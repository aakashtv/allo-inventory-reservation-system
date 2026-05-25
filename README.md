# Allo Reserve: Scalable Inventory Reservation System

## Project Overview
Allo Reserve is a production-grade inventory reservation engine and frontend system. Designed for high-concurrency e-commerce environments, this platform strictly prevents overselling while gracefully handling simultaneous traffic bursts for highly sought-after inventory units. 

## Problem Statement
When dealing with limited-stock items (e.g., concert tickets, hype fashion drops), multiple users often attempt to reserve the final unit of inventory simultaneously. Naive database operations result in race conditions and overselling. This system requires an architecture that can confidently resolve inventory conflicts securely at the database level while providing real-time UX feedback.

## System Architecture
The application follows a modular monolith architecture built on Next.js 15 (App Router). 
- **Frontend**: React Server Components (RSC) with TanStack Query for dynamic client-side hydration.
- **Backend Services**: Strict separation of concerns (Repositories, Services, Zod Validators).
- **Database Layer**: PostgreSQL managed by Prisma v5.
- **Caching & Idempotency**: Upstash Redis for distributed request idempotency and caching.

## Database Design
- **Products**: The master catalog.
- **Warehouses**: Physical or logical distribution centers.
- **Inventory**: Tracks `totalUnits` and `reservedUnits` uniquely by `[productId, warehouseId]`.
- **Reservations**: Ephemeral records tracking checkout state (`PENDING`, `CONFIRMED`, `CANCELLED`, `EXPIRED`).

## Concurrency Strategy
This project adopts a **Pessimistic Concurrency Control** approach using database-native serialization. 

### Row-Level Locking
During reservation creation, the transaction explicitly issues a `SELECT ... FOR UPDATE` raw query via PostgreSQL. This creates an exclusive row lock on the specific `Inventory` record, preventing any other concurrent transaction from reading or mutating the row until the current transaction commits or rolls back.

### Transaction Flow
1. Open Prisma `$transaction`.
2. Find corresponding `Inventory` ID.
3. Lock the row using `$queryRaw` `FOR UPDATE`.
4. Fetch locked values. Calculate `availableUnits = totalUnits - reservedUnits`.
5. Validate `availableUnits >= requested quantity`. (If false, throw `InventoryConflictError`).
6. Atomically increment `reservedUnits`.
7. Insert `Reservation` record with `PENDING` state and a 10-minute expiry.
8. Commit transaction and release lock.

## Reservation Lifecycle
- **PENDING**: User has locked the inventory temporarily.
- **CONFIRMED**: User completed checkout. `reservedUnits` and `totalUnits` are permanently decremented.
- **CANCELLED**: User explicitly cancelled. `reservedUnits` are decremented safely back to the pool.
- **EXPIRED**: The reservation timed out. `reservedUnits` are automatically reclaimed by the expiry cron engine.

## Expiry Strategy
Reservations are reclaimed using a two-pronged strategy:
1. **Lazy Evaluation**: The `confirm` API naturally rejects confirmations if `new Date() > expiresAt`, yielding an HTTP 410.
2. **Cron Engine**: A dedicated `/api/cron/expiry` endpoint sweeps the database for stale `PENDING` items, issuing atomic lock-and-release transactions to return inventory to the available pool.

## Idempotency
To prevent accidental double-reservations on network retries, clients generate a cryptographic `Idempotency-Key` sent via HTTP headers. Upstash Redis verifies and caches the key with a 24-hour TTL, blocking duplicate side-effects.

## API Documentation
- `GET /api/products`: Lists products with calculated `availableUnits`.
- `GET /api/warehouses`: Lists fulfillment centers.
- `POST /api/reservations`: Creates a reservation (Expects `productId`, `warehouseId`, `quantity`).
- `POST /api/reservations/:id/confirm`: Finalizes the transaction.
- `POST /api/reservations/:id/release`: Cancels the transaction.
- `POST /api/cron/expiry`: Cleans up expired reservations.

## Setup Instructions
1. Clone the repository.
2. Install dependencies: `npm install`
3. Duplicate `.env.example` to `.env` and fill in credentials.
4. Run migrations: `npx prisma migrate dev`
5. Seed database: `npm run seed`
6. Start dev server: `npm run dev`

## Environment Variables
- `DATABASE_URL`: Connection string for Supabase PostgreSQL.
- `UPSTASH_REDIS_REST_URL`: Upstash connection URL.
- `UPSTASH_REDIS_REST_TOKEN`: Upstash access token.

## Migration Instructions
Prisma schemas are tracked in `prisma/schema.prisma`. 
Run `npx prisma db push` or `npx prisma migrate dev` to synchronize your database.

## Seed Instructions
The database can be pre-populated with random realistic data by running:
`npm run seed`

## Deployment Instructions
This project is built natively for **Vercel**. 
1. Link the repository to your Vercel project.
2. Ensure Build Command is `npm run build` and Install Command is `npm install`.
3. Map all environment variables inside the Vercel dashboard.
4. Optionally attach Vercel Cron to the `/api/cron/expiry` endpoint.

## Tradeoffs
- **Pessimistic vs Optimistic Locking**: We chose pessimistic locking for strict safety guarantees at the cost of slight potential bottlenecking on single-row hotspots. Optimistic locking with a `version` column could provide higher throughput but introduces application-side retry complexities.
- **Prisma Limitations**: Prisma's native methods do not natively expose `FOR UPDATE` elegantly, requiring us to mix `findUnique` with `$queryRaw` to guarantee PG-native transactional row locks. 

## Future Improvements
- **Outbox Pattern**: Emitting Domain Events (e.g., `ReservationCreatedEvent`) to a Kafka/RabbitMQ queue for asynchronous analytics or email receipts.
- **WebSocket Synchronization**: Replacing the 5-second TanStack polling with live Socket.io or Supabase Realtime subscriptions.

## Scaling Strategy
For immense global scale, the single PostgreSQL database could be sharded by `warehouseId`. Redis can be elevated to handle a distributed queuing system (e.g., BullMQ) to rate-limit incoming checkout requests into a sequential processing pipeline to prevent database connection exhaustion.

## Testing Strategy
Execute `npm run simulate` to run a heavy programmatic concurrency script. This script forces 10 simultaneous promises against exactly 1 unit of physical inventory, mathematically proving that exactly 1 request succeeds and 9 gracefully fail with HTTP 409 boundaries intact.
