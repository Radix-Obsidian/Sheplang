-- SQL Demo File for ShepVerify
-- Common issues that verification should catch

-- Issue 1: Missing WHERE clause on DELETE (dangerous)
DELETE FROM users;

-- Issue 2: Using SELECT * in production (performance issue)
SELECT * FROM orders WHERE user_id = 123;

-- Issue 3: Unclosed string literal
INSERT INTO products (name, price) VALUES ('Laptop, 999.99);

-- Issue 4: Invalid column reference
SELECT username, email_address FROM customers;

-- Issue 5: Missing comma in VALUES clause
INSERT INTO orders (user_id, product_id quantity) VALUES (1, 2, 3);

-- Issue 6: Using reserved keyword as table name without quotes
CREATE TABLE order (
    id INT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10,2)
);

-- Issue 7: Aggregate function without GROUP BY
SELECT user_id, COUNT(*), MAX(created_at) FROM orders;

-- Issue 8: NULL comparison should use IS NULL
SELECT * FROM users WHERE email = NULL;

-- Good example (what it should look like):
DELETE FROM users WHERE id = 1;
SELECT id, name, email FROM orders WHERE user_id = 123;
INSERT INTO products (name, price) VALUES ('Laptop', 999.99);
SELECT username, email FROM customers;
INSERT INTO orders (user_id, product_id, quantity) VALUES (1, 2, 3);
CREATE TABLE "order" (
    id INT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10,2)
);
SELECT user_id, COUNT(*), MAX(created_at) FROM orders GROUP BY user_id;
SELECT * FROM users WHERE email IS NULL;
