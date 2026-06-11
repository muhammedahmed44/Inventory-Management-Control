CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) UNIQUE,
  username   VARCHAR(100) UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'rider')),
  store_type VARCHAR(20) CHECK (store_type IN ('offline', 'online')),
  owner_id   INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id                  SERIAL PRIMARY KEY,
  owner_id            INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                VARCHAR(150) NOT NULL,
  category            VARCHAR(100),
  unit_type           VARCHAR(50),
  stock_qty           INT NOT NULL DEFAULT 0,
  low_stock_threshold INT DEFAULT 10,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id           SERIAL PRIMARY KEY,
  owner_id     INT NOT NULL REFERENCES users(id),
  rider_id     INT REFERENCES users(id),
  status       VARCHAR(30) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','completed','dispatched','delivered','cancelled')),
  total_amount NUMERIC(12,2) DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id),
  quantity   INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_transactions (
  id         SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id),
  order_id   INT REFERENCES orders(id),
  change_qty INT NOT NULL,
  reason     VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);