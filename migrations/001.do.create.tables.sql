DROP TABLE IF EXISTS 'users';
DROP TABLE IF EXISTS 'items';
DROP TABLE IF EXISTS 'orders';
DROP TABLE IF EXISTS 'order_items';

CREATE TABLE 'users' (
    'id' SERIAL PRIMARY KEY,
    'phone_number' TEXT NOT NULL UNIQUE,
    'password' TEXT NOT NULL,
    'role' TEXT DEFAULT 'user'
);

CREATE TABLE 'items' (
    'id' SERIAL PRIMARY KEY,
    'product' TEXT NOT NULL
);

CREATE TABLE 'orders' (
    'id' SERIAL PRIMARY KEY,
    'posted' TIMESTAMP DEFAULT now() NOT NULL
    'user_id' INTEGER REFERENCES 'users'(id),
);

CREATE TABLE 'order_items' (
    'order_id' INTEGER REFERENCES 'orders'(id),
    'item_id' INTEGER REFERENCES 'items'(id),
    'quantity' INTEGER NOT NULL
);