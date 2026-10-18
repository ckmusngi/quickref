import { c } from './shared/code.js'

export default {
  slug: 'sql',
  title: 'SQL',
  tech: 'SQL',
  category: 'backend',
  minutes: 9,
  lang: 'sql',
  description: 'Querying, joins, grouping, window functions and changing data — portable across MySQL and PostgreSQL.',
  sections: [
    {
      id: 'project-setup',
      title: 'Database setup, step by step',
      group: 'Setup',
      items: [
        {
          title: '1. Install MySQL or PostgreSQL',
          lang: 'bash',
          code: c`
            # macOS
            brew install mysql            # or: brew install postgresql@17
            brew services start mysql     # or: brew services start postgresql@17

            # Linux (Ubuntu / Debian)
            sudo apt install -y mysql-server        # or: sudo apt install -y postgresql
            sudo systemctl enable --now mysql       # or: postgresql
            sudo mysql_secure_installation

            # Windows (PowerShell)
            winget install -e --id Oracle.MySQL                 # MySQL installer
            winget install -e --id PostgreSQL.PostgreSQL.17     # PostgreSQL
            # both install as Windows services that start automatically
            `,
        },
        {
          title: 'Or run it in Docker (any OS)',
          lang: 'bash',
          code: c`
            docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=secret -v mysqldata:/var/lib/mysql mysql:8.4
            docker run -d --name pg -p 5432:5432 -e POSTGRES_PASSWORD=secret -v pgdata:/var/lib/postgresql/data postgres:17
            `,
          note: 'Nothing to install besides Docker, and easy to throw away.',
        },
        {
          title: '2. Connect with the command-line client',
          lang: 'bash',
          code: c`
            # MySQL (all OS; on Linux right after install: sudo mysql)
            mysql -u root -p

            # PostgreSQL
            sudo -u postgres psql          # Linux
            psql postgres                  # macOS (Homebrew uses your username)
            psql -U postgres               # Windows (add C:\Program Files\PostgreSQL\17\bin to PATH)
            `,
        },
        {
          title: '3. Create a database and user',
          lang: 'sql',
          code: c`
            -- MySQL
            CREATE DATABASE shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
            CREATE USER 'shop'@'localhost' IDENTIFIED BY 'secret';
            GRANT ALL PRIVILEGES ON shop.* TO 'shop'@'localhost';

            -- PostgreSQL
            CREATE DATABASE shop;
            CREATE USER shop WITH PASSWORD 'secret';
            GRANT ALL PRIVILEGES ON DATABASE shop TO shop;
            ALTER DATABASE shop OWNER TO shop;
            `,
        },
        {
          title: '4. Practice table with sample data',
          lang: 'sql',
          code: c`
            CREATE TABLE customers (
              id INT PRIMARY KEY AUTO_INCREMENT,          -- PostgreSQL: id SERIAL PRIMARY KEY
              name VARCHAR(100) NOT NULL,
              country VARCHAR(2) NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            INSERT INTO customers (name, country) VALUES
              ('Ana', 'PH'), ('Ben', 'US'), ('Carla', 'MX'), ('Dan', 'PH');

            SELECT country, COUNT(*) FROM customers GROUP BY country;
            `,
        },
        {
          title: '5. Import / export a .sql file',
          lang: 'bash',
          code: c`
            # export
            mysqldump -u root -p shop > shop.sql
            pg_dump -U postgres shop > shop.sql

            # import — macOS / Linux / Windows cmd
            mysql -u root -p shop < shop.sql
            psql -U postgres -d shop -f shop.sql

            # import — Windows PowerShell ("<" is not supported there)
            Get-Content shop.sql | mysql -u root -p shop
            psql -U postgres -d shop -f shop.sql
            `,
        },
        {
          title: '6. GUI clients',
          note: 'TablePlus (macOS / Windows / Linux), DBeaver (free, all OS), MySQL Workbench, pgAdmin, or the VS Code "SQLTools" extension.',
        },
      ],
    },
    {
      id: 'select',
      title: 'Selecting',
      group: 'Querying',
      items: [
        {
          title: 'Filter & sort',
          code: c`
            SELECT id, email, created_at
            FROM users
            WHERE status = 'active' AND created_at >= '2026-01-01'
            ORDER BY created_at DESC
            LIMIT 20 OFFSET 40;
            `,
        },
        {
          title: 'Pattern & lists',
          code: c`
            WHERE email LIKE '%@example.com'
              AND country IN ('MX', 'AR', 'CL')
              AND deleted_at IS NULL
            `,
        },
        {
          title: 'CASE expression',
          code: c`
            SELECT id,
              CASE WHEN total >= 1000 THEN 'large'
                   WHEN total >= 100  THEN 'medium'
                   ELSE 'small' END AS size
            FROM orders;
            `,
        },
      ],
    },
    {
      id: 'joins',
      title: 'Joins (every type)',
      group: 'Querying',
      items: [
        {
          title: 'Join types at a glance',
          lang: 'text',
          code: c`
            customers                 orders
            id | name                 id | customer_id | total
            1  | Ana                  10 | 1           | 500
            2  | Ben                  11 | 1           | 120
            3  | Carla                12 | 9           | 80     ← customer 9 does not exist

            INNER JOIN        only matching rows                 Ana-10, Ana-11
            LEFT JOIN         all customers + matches            Ana-10, Ana-11, Ben-NULL, Carla-NULL
            RIGHT JOIN        all orders + matches               Ana-10, Ana-11, NULL-12
            FULL OUTER JOIN   everything from both sides         Ana-10, Ana-11, Ben-NULL, Carla-NULL, NULL-12
            CROSS JOIN        every combination (3 × 3 = 9 rows)
            SELF JOIN         a table joined to itself (e.g. employee → manager)
            SEMI JOIN         customers that HAVE orders (EXISTS)          Ana
            ANTI JOIN         customers with NO orders (NOT EXISTS)        Ben, Carla
            `,
          note: 'The examples below use these customers and orders tables.',
        },
        {
          title: 'INNER JOIN',
          code: c`
            SELECT o.id, c.name, o.total
            FROM orders o
            INNER JOIN customers c ON c.id = o.customer_id;   -- "JOIN" alone means INNER JOIN
            `,
          note: 'Only rows that match on both sides. Order 12 and customers without orders disappear.',
        },
        {
          title: 'LEFT (OUTER) JOIN',
          code: c`
            SELECT c.name, o.id AS order_id, o.total
            FROM customers c
            LEFT JOIN orders o ON o.customer_id = c.id;
            `,
          note: 'Keeps every row from the left table (customers). Order columns are NULL where there is no match. LEFT JOIN and LEFT OUTER JOIN are the same.',
        },
        {
          title: 'RIGHT (OUTER) JOIN',
          code: c`
            SELECT c.name, o.id AS order_id, o.total
            FROM customers c
            RIGHT JOIN orders o ON o.customer_id = c.id;
            `,
          note: 'Keeps every row from the right table (orders), so order 12 shows with name = NULL. Any RIGHT JOIN can be rewritten as a LEFT JOIN by swapping the tables, which most people find easier to read.',
        },
        {
          title: 'FULL OUTER JOIN',
          code: c`
            -- PostgreSQL, SQL Server, SQLite 3.39+
            SELECT c.name, o.id AS order_id
            FROM customers c
            FULL OUTER JOIN orders o ON o.customer_id = c.id;

            -- MySQL / MariaDB have no FULL JOIN: combine LEFT and RIGHT
            SELECT c.name, o.id AS order_id
            FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
            UNION
            SELECT c.name, o.id AS order_id
            FROM customers c RIGHT JOIN orders o ON o.customer_id = c.id;
            `,
          note: 'All rows from both tables, matched where possible. Handy for reconciling two data sources.',
        },
        {
          title: 'CROSS JOIN',
          code: c`
            -- every size with every color (e.g. to generate product variants)
            SELECT s.name AS size, col.name AS color
            FROM sizes s
            CROSS JOIN colors col;

            -- every day × every store, to report zero-sales days too
            SELECT d.day, st.id AS store_id
            FROM calendar d
            CROSS JOIN stores st;
            `,
          note: 'No ON clause: returns rows(a) × rows(b). Be careful with big tables.',
        },
        {
          title: 'SELF JOIN',
          code: c`
            -- employees and their managers (same table, two aliases)
            SELECT e.name AS employee, m.name AS manager
            FROM employees e
            LEFT JOIN employees m ON m.id = e.manager_id;

            -- pairs of customers in the same city
            SELECT a.name, b.name, a.city
            FROM customers a
            JOIN customers b ON a.city = b.city AND a.id < b.id;
            `,
          note: 'a.id < b.id avoids listing each pair twice and pairing a row with itself.',
        },
        {
          title: 'Anti join: rows with no match',
          code: c`
            -- customers who never ordered: LEFT JOIN + IS NULL
            SELECT c.*
            FROM customers c
            LEFT JOIN orders o ON o.customer_id = c.id
            WHERE o.id IS NULL;

            -- same with NOT EXISTS (often clearer, and safe with NULLs)
            SELECT c.*
            FROM customers c
            WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
            `,
          note: 'Avoid NOT IN (SELECT customer_id ...) when that column can be NULL: one NULL makes it return no rows at all.',
        },
        {
          title: 'Semi join: rows that have a match',
          code: c`
            -- customers with at least one order, each listed once
            SELECT c.*
            FROM customers c
            WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

            -- equivalent
            SELECT * FROM customers WHERE id IN (SELECT customer_id FROM orders);
            `,
          note: 'Unlike INNER JOIN, this does not repeat a customer once per order.',
        },
        {
          title: 'Joining several tables',
          code: c`
            SELECT o.id, c.name AS customer, p.name AS product, oi.quantity
            FROM orders o
            JOIN customers   c  ON c.id = o.customer_id
            JOIN order_items oi ON oi.order_id = o.id
            JOIN products    p  ON p.id = oi.product_id
            LEFT JOIN coupons cp ON cp.id = o.coupon_id      -- optional relation
            WHERE o.created_at >= '2026-01-01';
            `,
        },
        {
          title: 'ON vs WHERE in a LEFT JOIN',
          code: c`
            -- ✅ keeps all customers; only counts PAID orders
            SELECT c.name, COUNT(o.id) AS paid_orders
            FROM customers c
            LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
            GROUP BY c.id, c.name;

            -- ❌ the WHERE removes customers without paid orders: it became an INNER JOIN
            SELECT c.name, COUNT(o.id) AS paid_orders
            FROM customers c
            LEFT JOIN orders o ON o.customer_id = c.id
            WHERE o.status = 'paid'
            GROUP BY c.id, c.name;
            `,
          note: 'Conditions on the right-hand table of a LEFT JOIN belong in ON, not WHERE.',
        },
        {
          title: 'USING and NATURAL JOIN',
          code: c`
            -- USING: when both tables share the column name
            SELECT * FROM orders JOIN order_items USING (order_id);

            -- NATURAL JOIN: joins on ALL same-named columns automatically
            SELECT * FROM orders NATURAL JOIN order_items;
            `,
          note: 'Avoid NATURAL JOIN in real code: adding a column like "created_at" to both tables silently changes the join.',
        },
        {
          title: 'Non-equi join (ranges)',
          code: c`
            -- give each order its discount tier
            SELECT o.id, o.total, t.name AS tier
            FROM orders o
            JOIN discount_tiers t ON o.total BETWEEN t.min_total AND t.max_total;
            `,
        },
        {
          title: 'LATERAL join: top N per group',
          code: c`
            -- PostgreSQL / MySQL 8.0.14+: latest 3 orders for every customer
            SELECT c.name, recent.id, recent.created_at
            FROM customers c
            CROSS JOIN LATERAL (
              SELECT o.id, o.created_at
              FROM orders o
              WHERE o.customer_id = c.id
              ORDER BY o.created_at DESC
              LIMIT 3
            ) AS recent;
            -- LEFT JOIN LATERAL (...) recent ON true   keeps customers with no orders
            -- SQL Server: CROSS APPLY / OUTER APPLY
            `,
          note: 'The subquery can reference columns from tables earlier in FROM, like a for-each loop.',
        },
        {
          title: 'Join with aggregates',
          code: c`
            SELECT c.name, COUNT(o.id) AS orders, COALESCE(SUM(o.total), 0) AS spent
            FROM customers c
            LEFT JOIN orders o ON o.customer_id = c.id
            GROUP BY c.id, c.name
            ORDER BY spent DESC;
            `,
          note: 'COUNT(o.id) counts only matched rows (0 for no orders); COUNT(*) would count 1.',
        },
        {
          title: 'UPDATE / DELETE with a join',
          code: c`
            -- MySQL
            UPDATE orders o
            JOIN customers c ON c.id = o.customer_id
            SET o.priority = 'high'
            WHERE c.vip = 1;

            DELETE o FROM orders o
            LEFT JOIN customers c ON c.id = o.customer_id
            WHERE c.id IS NULL;                         -- orphaned orders

            -- PostgreSQL
            UPDATE orders o SET priority = 'high'
            FROM customers c
            WHERE c.id = o.customer_id AND c.vip;

            DELETE FROM orders o
            USING customers c
            WHERE c.id = o.customer_id AND c.deleted;
            `,
        },
        {
          title: 'Make joins fast',
          note: 'Index the foreign key columns you join on (orders.customer_id, order_items.order_id). Run EXPLAIN on slow queries and look for full table scans. Select only the columns you need instead of SELECT *.',
        },
      ],
    },
    {
      id: 'grouping',
      title: 'Grouping',
      group: 'Querying',
      items: [
        {
          title: 'Aggregate',
          code: c`
            SELECT customer_id, COUNT(*) AS orders, SUM(total) AS revenue
            FROM orders
            GROUP BY customer_id
            HAVING SUM(total) > 500;
            `,
          note: 'WHERE filters rows before grouping; HAVING filters groups after.',
        },
        {
          title: 'Per day',
          code: c`
            SELECT DATE(created_at) AS day, COUNT(*)
            FROM payments
            GROUP BY DATE(created_at)
            ORDER BY day;
            `,
        },
      ],
    },
    {
      id: 'advanced',
      title: 'CTEs & window functions',
      group: 'Querying',
      items: [
        {
          title: 'Common table expression',
          code: c`
            WITH recent AS (
              SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '30 days'
            )
            SELECT customer_id, COUNT(*) FROM recent GROUP BY customer_id;
            `,
          note: 'MySQL uses INTERVAL 30 DAY without quotes.',
        },
        {
          title: 'Rank within a group',
          code: c`
            SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn
            FROM orders;
            `,
        },
        {
          title: 'Running total',
          code: c`
            SELECT created_at, total,
              SUM(total) OVER (ORDER BY created_at) AS running_total
            FROM orders;
            `,
        },
      ],
    },
    {
      id: 'modify',
      title: 'Changing data',
      group: 'Changing data & schema',
      items: [
        {
          title: 'Insert',
          code: c`
            INSERT INTO customers (name, email) VALUES
              ('Ana', 'ana@example.com'),
              ('Ben', 'ben@example.com');
            `,
        },
        {
          title: 'Update & delete',
          code: c`
            UPDATE orders SET status = 'paid' WHERE id = 42;
            DELETE FROM sessions WHERE last_seen < NOW() - INTERVAL '7 days';
            `,
          note: 'Run the WHERE clause as a SELECT first.',
        },
        {
          title: 'Upsert',
          code: c`
            -- PostgreSQL
            INSERT INTO rates (code, value) VALUES ('MXN', 18.2)
            ON CONFLICT (code) DO UPDATE SET value = EXCLUDED.value;

            -- MySQL
            INSERT INTO rates (code, value) VALUES ('MXN', 18.2)
            ON DUPLICATE KEY UPDATE value = VALUES(value);
            `,
        },
        {
          title: 'Transactions',
          code: c`
            BEGIN;
            UPDATE accounts SET balance = balance - 100 WHERE id = 1;
            UPDATE accounts SET balance = balance + 100 WHERE id = 2;
            COMMIT;  -- or ROLLBACK;
            `,
        },
      ],
    },
    {
      id: 'schema',
      title: 'Schema & indexes',
      group: 'Changing data & schema',
      items: [
        {
          title: 'Create table',
          code: c`
            CREATE TABLE payments (
              id BIGSERIAL PRIMARY KEY,
              order_id BIGINT NOT NULL REFERENCES orders(id),
              amount NUMERIC(12,2) NOT NULL,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            `,
        },
        {
          title: 'Index',
          code: c`
            CREATE INDEX idx_payments_order ON payments (order_id);
            CREATE UNIQUE INDEX idx_users_email ON users (email);
            `,
        },
        {
          title: 'Check a query plan',
          code: 'EXPLAIN ANALYZE SELECT * FROM payments WHERE order_id = 42;',
        },
      ],
    },
  ],
}
