
-- SEQUENCES  (GenerationType.SEQUENCE entities)
-- ─────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS user_sequence                     INCREMENT BY 50 START WITH 1;
CREATE SEQUENCE IF NOT EXISTS addresses_seq                     INCREMENT BY 50 START WITH 1;
CREATE SEQUENCE IF NOT EXISTS products_seq                      INCREMENT BY 50 START WITH 1;
CREATE SEQUENCE IF NOT EXISTS product_pricing_seq               INCREMENT BY 50 START WITH 1;
CREATE SEQUENCE IF NOT EXISTS discounts_seq                     INCREMENT BY 50 START WITH 1;
CREATE SEQUENCE IF NOT EXISTS orders_seq                        INCREMENT BY 50 START WITH 1;
CREATE SEQUENCE IF NOT EXISTS order_modification_requests_seq   INCREMENT BY 50 START WITH 1;
CREATE SEQUENCE IF NOT EXISTS reviews_seq                       INCREMENT BY 50 START WITH 1;

-- ─────────────────────────────────────────
-- TABLE: users
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT       DEFAULT nextval('user_sequence') PRIMARY KEY,
    public_id       UUID         UNIQUE,
    name            VARCHAR(255),
    phone_no        VARCHAR(255) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),
    role            VARCHAR(50),
    is_active       BOOLEAN      DEFAULT TRUE,
    created_at      TIMESTAMP
);

-- ─────────────────────────────────────────
-- TABLE: admin_users  (GenerationType.IDENTITY → BIGSERIAL)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
    id          BIGSERIAL    PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(255),
    phone_no    VARCHAR(255) UNIQUE,
    role        VARCHAR(50)  DEFAULT 'ADMIN',
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP
);

-- ─────────────────────────────────────────
-- TABLE: products
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id                BIGINT       DEFAULT nextval('products_seq') PRIMARY KEY,
    version           BIGINT       NOT NULL,        -- @Version optimistic locking
    product_name      VARCHAR(255),
    catagory          VARCHAR(50)  NOT NULL,         -- @Column(name="catagory") → stays catagory
    description       VARCHAR(255),
    frame_types       VARCHAR(50)  NOT NULL,
    is_product_active BOOLEAN      DEFAULT TRUE,
    stock_quantity    INTEGER      DEFAULT 0,
    image_url         VARCHAR(255) NOT NULL,
    created_at        TIMESTAMP
);

-- ─────────────────────────────────────────
-- TABLE: addresses  (FK → users)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
    id           BIGINT       DEFAULT nextval('addresses_seq') PRIMARY KEY,
    user_id      BIGINT       REFERENCES users(id),
    full_name    VARCHAR(255) NOT NULL,    -- @Column(name="fullName") → SpringPhysicalNaming → full_name
    phone_no     VARCHAR(255) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    landmark     VARCHAR(255),
    city         VARCHAR(255) NOT NULL,
    state        VARCHAR(255) NOT NULL,
    pin_code     INTEGER      NOT NULL,
    is_default   BOOLEAN      DEFAULT FALSE
);

-- ─────────────────────────────────────────
-- TABLE: product_pricing  (FK → products)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_pricing (
    id                  BIGINT         DEFAULT nextval('product_pricing_seq') PRIMARY KEY,
    product_id          BIGINT         REFERENCES products(id),
    product_size_inches VARCHAR(50)    NOT NULL,
    product_thickness   VARCHAR(50)    NOT NULL,
    base_price          NUMERIC(19, 2) NOT NULL,
    is_active           BOOLEAN        DEFAULT TRUE,
    CONSTRAINT uq_product_size_thickness UNIQUE (product_id, product_size_inches, product_thickness)
);

-- ─────────────────────────────────────────
-- TABLE: discounts  (FK → products)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS discounts (
    id               BIGINT        DEFAULT nextval('discounts_seq') PRIMARY KEY,
    product_id       BIGINT        REFERENCES products(id),
    discount_percent NUMERIC(5, 2) NOT NULL,
    validfrom        TIMESTAMP     NOT NULL,  -- @Column(name="validfrom") → stays validfrom
    valid_to         TIMESTAMP     NOT NULL,  -- @Column(name="validTo") → SpringPhysicalNaming → valid_to
    is_active        BOOLEAN       DEFAULT TRUE
);

-- ─────────────────────────────────────────
-- TABLE: orders  (FK → users, products, addresses)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id                        BIGINT         DEFAULT nextval('orders_seq') PRIMARY KEY,
    users_id                  BIGINT         REFERENCES users(id),      -- @JoinColumn(name="users_id")
    products_id               BIGINT         REFERENCES products(id),   -- @JoinColumn(name="products_id")
    product_size_inches       VARCHAR(50),
    product_thickness         VARCHAR(50),
    frame_types               VARCHAR(50),
    border_color              VARCHAR(255)   NOT NULL,
    base_price                NUMERIC(19, 2) NOT NULL,
    discount_applied          NUMERIC(19, 2) DEFAULT 0,
    final_price               NUMERIC(19, 2) NOT NULL,
    order_status              VARCHAR(50)    NOT NULL,
    payment_id                VARCHAR(255)   UNIQUE,
    payment_status            VARCHAR(50)    NOT NULL DEFAULT 'PENDING',
    custom_image_url          VARCHAR(255)   NOT NULL,
    address_id                BIGINT         REFERENCES addresses(id),  -- @JoinColumn(name="address_id")
    delivery_address_snapshot VARCHAR(255)   NOT NULL,
    created_at                TIMESTAMP,
    confirmed_at              TIMESTAMP
);

-- ─────────────────────────────────────────
-- TABLE: order_modification_requests  (FK → orders, users)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_modification_requests (
    modification_request_id BIGINT  DEFAULT nextval('order_modification_requests_seq') PRIMARY KEY,
    orders_id               BIGINT  REFERENCES orders(id),  -- @JoinColumn(name="orders_id")
    requested_changes       TEXT,                           -- @Column(columnDefinition="TEXT")
    order_bot_reply_status  VARCHAR(50),
    admin_acknowledged      BOOLEAN NOT NULL,
    users_id                BIGINT  REFERENCES users(id),   -- @JoinColumn(name="users_id")
    created_at              TIMESTAMP,
    processed_at            TIMESTAMP
);

-- ─────────────────────────────────────────
-- TABLE: delivery_entity  (FK → orders)   GenerationType.IDENTITY
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_entity (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id),
    awb_code VARCHAR(255),
    shiprocket_order_id VARCHAR(255),
    shiprocket_shipment_id VARCHAR(255),
    delivery_attempt_count INTEGER DEFAULT 0,
    courier_name VARCHAR(255),
    delivery_status VARCHAR(50),
    current_location VARCHAR(255),
    estimated_delivery_date TIMESTAMP,
    actual_delivery_date TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_awb_code ON delivery_entity (awb_code);

-- ─────────────────────────────────────────
-- TABLE: delivery_event  (FK → delivery_entity)   GenerationType.IDENTITY
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_event (
    id                 BIGSERIAL    PRIMARY KEY,
    delivery_entity_id BIGINT       REFERENCES delivery_entity(id),  -- @ManyToOne (no @JoinColumn)
    delivery_status    VARCHAR(50),
    location           VARCHAR(255),
    description        VARCHAR(255),
    timestamp          TIMESTAMP
);

-- ─────────────────────────────────────────
-- TABLE: reviews  (FK → users, products)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id         BIGINT   DEFAULT nextval('reviews_seq') PRIMARY KEY,
    users_id   BIGINT   REFERENCES users(id),     -- @JoinColumn(name="users_id")
    product_id BIGINT   REFERENCES products(id),  -- @JoinColumn(name="product_id")
    rating     INTEGER  NOT NULL,
    comment    VARCHAR(255),
    image_url  VARCHAR(255),
    created_at TIMESTAMP
);