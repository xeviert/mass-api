# MASS API - Mutual Aid & Shared Services

Portfolio demo API for MASS, a mutual aid app where requesters ask for supplies, donors pledge support, and dispatchers coordinate fulfillment.

## Demo Notes

This is intentionally a demo backend. Data is persisted as JSON files in `./data/`:

- `users.json`
- `items.json`
- `inventory.json`
- `donations.json`
- `orders.json`

The `data/` directory is gitignored and seeded on first start. On hosts with ephemeral filesystems, demo data may reset after a deploy, restart, or dyno recycle. That is acceptable for the portfolio version.

Seeded demo accounts:

- Requester: `5555551111` / `demo`
- Dispatcher/admin: `5555550000` / `demo`

## Running Locally

```sh
cp example.env .env
npm install
npm run dev
```

The server runs on `http://localhost:8080`.

## Deployment Env Vars

- `NODE_ENV=production`
- `PORT=<provided-by-host>`
- `JWT_SECRET=<strong-demo-secret>`
- `JWT_EXPIRY=3h`
- `CLIENT_ORIGIN=https://<deployed-client-url>`
- `SEED_ADMIN_PHONE=5555550000`
- `DATA_DIR=./data` optional

Production requires `JWT_SECRET`. Browser CORS requests are limited to `CLIENT_ORIGIN`; localhost origins are allowed in development.

## Admin Bootstrap

For a clean deploy, the seeded admin account is `5555550000` / `demo`. If you change `SEED_ADMIN_PHONE`, register that phone through the client once, then restart or redeploy the API so the seed step can promote it to admin.

## Portfolio Walkthrough

1. Sign up or log in as a requester.
2. Request supplies for a location.
3. Donate supplies or money.
4. Log in as the dispatcher/admin.
5. Review open orders and mark one fulfilled.

## API Endpoints

### Health

```txt
GET /api/health
  -> { ok: true, service: "mass-api" }
```

### Auth

```txt
POST /api/user
  body: { phone_number, password }
  -> 201 { id, phone_number, role }

POST /api/auth/token
  body: { phone_number, password }
  -> { authToken }

PUT /api/auth/token                  (auth)
GET /api/user/me                     (auth)
```

### Catalog, Inventory, Donations

```txt
GET /api/items                       (public)
POST /api/items                      (admin)
PATCH /api/items/:id                 (admin)
DELETE /api/items/:id                (admin)

GET /api/inventory                   (public)
GET /api/inventory/:item_id          (public)
PATCH /api/inventory/:item_id        (admin)

POST /api/donations                  (optional auth)
GET /api/donations                   (admin)
GET /api/donations/mine              (auth)
```

### Orders and Admin

```txt
GET /api/orders                      (auth, own orders)
POST /api/orders                     (auth)
GET /api/orders/:id                  (owner or admin)
PATCH /api/orders/:id                (owner or admin)

GET /api/admin/orders                (admin)
GET /api/admin/orders/:id            (admin)
DELETE /api/admin/orders/:id         (admin)
```

## Stack

Node, Express 5, TypeScript, JSON-file storage, JWT auth, bcrypt, helmet, and CORS.
