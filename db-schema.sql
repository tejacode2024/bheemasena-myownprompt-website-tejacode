-- ═══════════════════════════════════════════════════
--  BHEEMASENA — Database Schema (Neon / Postgres)
-- ═══════════════════════════════════════════════════
-- Idempotent: safe to re-run.
-- Run this once in the Neon SQL Editor on a fresh database.
-- Auth is enforced at the API layer (x-admin-secret header) — no RLS.

-- 1. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id              BIGSERIAL    PRIMARY KEY,
  token_number    BIGINT       NOT NULL UNIQUE,
  customer_name   TEXT         NOT NULL,
  customer_phone  TEXT         NOT NULL,
  items           JSONB        NOT NULL,
  payment_mode    TEXT         NOT NULL DEFAULT 'cod',
  total           INTEGER      NOT NULL,
  pay_status      TEXT         NOT NULL DEFAULT 'pending',
  pending_amount  INTEGER      DEFAULT NULL,
  deliver_status  TEXT         NOT NULL DEFAULT 'pending',
  session_type    TEXT         NOT NULL DEFAULT 'lunch',
  archived        BOOLEAN      NOT NULL DEFAULT FALSE,
  archived_at     TIMESTAMPTZ  DEFAULT NULL,
  delivered_at    TIMESTAMPTZ  DEFAULT NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_archived_idx   ON orders(archived, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_phone_idx      ON orders(customer_phone);

-- 2. TOKEN SEQUENCE
CREATE SEQUENCE IF NOT EXISTS order_token_seq START 1 INCREMENT 1;

CREATE OR REPLACE FUNCTION next_order_token()
RETURNS BIGINT LANGUAGE SQL AS $$
  SELECT nextval('order_token_seq');
$$;

CREATE OR REPLACE FUNCTION reset_token_sequence()
RETURNS VOID LANGUAGE PLPGSQL AS $$
BEGIN
  PERFORM setval('order_token_seq', 1, FALSE);
END;
$$;

-- 3. CONFIG (single row, id = 1)
CREATE TABLE IF NOT EXISTS config (
  id                        INTEGER      PRIMARY KEY DEFAULT 1,
  site_online               BOOLEAN      NOT NULL DEFAULT TRUE,
  closed_message            TEXT         NOT NULL DEFAULT 'The website is temporarily closed — come back soon.',
  item_flags                JSONB        NOT NULL DEFAULT '{}'::JSONB,
  price_overrides           JSONB        NOT NULL DEFAULT '{}'::JSONB,
  original_price_overrides  JSONB        NOT NULL DEFAULT '{}'::JSONB,
  hidden_items              JSONB        NOT NULL DEFAULT '[]'::JSONB,
  category_headings         JSONB        NOT NULL DEFAULT '{}'::JSONB,
  updated_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
INSERT INTO config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
-- Idempotent column add for existing databases that pre-date the
-- closed_message column.
ALTER TABLE config
  ADD COLUMN IF NOT EXISTS closed_message TEXT
  NOT NULL DEFAULT 'The website is temporarily closed — come back soon.';

-- 4. MENU_ITEMS (admin-added dynamic items)
CREATE TABLE IF NOT EXISTS menu_items (
  id                BIGSERIAL    PRIMARY KEY,
  category_key      TEXT         NOT NULL,
  category_label    TEXT         NOT NULL,
  category_heading  TEXT         DEFAULT NULL,
  name              TEXT         NOT NULL,
  "desc"            TEXT         DEFAULT NULL,
  price             INTEGER      NOT NULL,
  original_price    INTEGER      DEFAULT NULL,
  veg               BOOLEAN      NOT NULL DEFAULT FALSE,
  img               TEXT         DEFAULT NULL,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS menu_items_category_key_idx ON menu_items(category_key);
CREATE INDEX IF NOT EXISTS menu_items_created_at_idx   ON menu_items(created_at ASC);

-- 5. USERS
CREATE TABLE IF NOT EXISTS users (
  id             BIGSERIAL    PRIMARY KEY,
  name           TEXT         NOT NULL,
  phone          TEXT         NOT NULL UNIQUE,
  email          TEXT         DEFAULT NULL,
  password_hash  TEXT         DEFAULT NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS users_phone_idx ON users(phone);

-- 6. RATINGS
CREATE TABLE IF NOT EXISTS ratings (
  id           BIGSERIAL    PRIMARY KEY,
  order_token  TEXT         NOT NULL,
  phone        TEXT         NOT NULL,
  item_id      TEXT         NOT NULL,
  rating       INTEGER      NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (order_token, item_id)
);
CREATE INDEX IF NOT EXISTS ratings_item_id_idx ON ratings(item_id);

-- 7. OTP_STORE
CREATE TABLE IF NOT EXISTS otp_store (
  email       TEXT         PRIMARY KEY,
  otp         TEXT         NOT NULL,
  expires_at  TIMESTAMPTZ  NOT NULL,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS otp_store_expires_idx ON otp_store(expires_at);
