# MASS API - Mutual Aid & Shared Services

API server for the MASS app — a mutual aid platform where users can request supplies and admins can fulfill orders.

## Storage (demo)

This is a demo build. Data is persisted as **JSON files** in `./data/`:
- `users.json`
- `items.json`
- `orders.json`

Files are seeded on first start (the catalog of supply items comes from `src/store/seed.js`). The `data/` directory is gitignored and recreated as needed.

## Running locally

```
cp example.env .env
# edit .env, set JWT_SECRET (and optionally SEED_ADMIN_PHONE)
npm install
npm run dev
```

The server boots on `http://localhost:8080`.

### Bootstrapping an admin

Set `SEED_ADMIN_PHONE` in `.env` to a phone number, register that account via `POST /api/user`, then restart the server. The user with that phone number will be promoted to `role: "admin"`.

## API Endpoints

### Auth
```
POST /api/user
  body: { phone_number, password }
  -> 201 { id, phone_number, role }

POST /api/auth/token
  body: { phone_number, password }
  -> { authToken }

PUT  /api/auth/token            (auth required — refresh)
  -> { authToken }

GET  /api/user/me               (auth required)
  -> { id, phone_number, role }
```

### Items (catalog)
```
GET    /api/items                       (public)
POST   /api/items                       (admin)
  body: { slug, name, blurb, icon, category }
PATCH  /api/items/:id                   (admin)
DELETE /api/items/:id                   (admin)
GET    /api/items/:id                   (public)
```

### Orders
```
GET    /api/orders                      (auth — user's own orders)
POST   /api/orders                      (auth)
  body: {
    location: string,
    note?: string,
    items: [{ item_id: number, quantity: number }, ...]
  }
GET    /api/orders/:id                  (auth — owner or admin)
PATCH  /api/orders/:id                  (auth — owner or admin)
  body: { status: "open" | "fulfilled" }
```

### Admin
```
GET    /api/admin/orders                (admin)
GET    /api/admin/orders/:id            (admin)
DELETE /api/admin/orders/:id            (admin)
```

## Stack
Node + Express 5, JSON-file storage, JWT auth (bcrypt + jsonwebtoken).
