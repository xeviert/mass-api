CREATE TABLE 'user' (
    'id' SERIAL PRIMARY KEY,
    'phone_number' TEXT NOT NULL UNIQUE,
    'password' TEXT NOT NULL,
)