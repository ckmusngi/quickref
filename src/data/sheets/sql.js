import { c, BT } from './shared/code.js'

export default {
  slug: 'sql',
  title: 'SQL',
  tech: 'SQL',
  category: 'backend',
  minutes: 90,
  lang: 'sql',
  description: 'SQL from first query to production: portable querying, joins, grouping, window functions and schema changes, plus MySQL 8.4 and PostgreSQL 17 setup, users and security, indexes and performance, engine-specific features, backups, replication and connecting from apps.',
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
    {
      id: 'mysql-project-setup',
      title: 'Install & connect, step by step',
      group: 'MySQL',
      items: [
        {
          title: '1. Install MySQL 8.4 LTS',
          lang: 'bash',
          code: c`
            # macOS (Homebrew) — "mysql" is the newest Innovation release, mysql@8.4 is the LTS
            brew install mysql@8.4
            echo 'export PATH="$(brew --prefix)/opt/mysql@8.4/bin:$PATH"' >> ~/.zshrc
            source ~/.zshrc

            # Linux (Ubuntu / Debian)
            sudo apt update && sudo apt install -y mysql-server

            # Windows (PowerShell) — choose "Server only" and 8.4 in the installer
            winget install -e --id Oracle.MySQL
            # then add C:\Program Files\MySQL\MySQL Server 8.4\bin to PATH
            `,
          note: 'Ubuntu 24.04 ships MySQL 8.0 and Debian ships MariaDB; for real 8.4 on Linux add Oracle\'s MySQL APT repository (mysql-apt-config package from dev.mysql.com) first, or use Docker.',
          then: [
            {
              label: 'Linux: Oracle APT repository for 8.4',
              lang: 'bash',
              code: c`
                wget https://dev.mysql.com/get/mysql-apt-config_0.8.33-1_all.deb   # check the site for the latest file name
                sudo dpkg -i mysql-apt-config_0.8.33-1_all.deb                     # pick "mysql-8.4-lts"
                sudo apt update && sudo apt install -y mysql-server
                `,
            },
          ],
        },
        {
          title: 'Or run it in Docker (any OS)',
          lang: 'bash',
          code: c`
            docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=shop -e MYSQL_USER=shop -e MYSQL_PASSWORD=secret -v mysqldata:/var/lib/mysql mysql:8.4

            docker exec -it mysql mysql -u root -p      # open a client inside the container
            `,
          then: [
            {
              label: 'docker-compose.yml',
              lang: 'yaml',
              code: c`
                services:
                  db:
                    image: mysql:8.4
                    restart: unless-stopped
                    environment:
                      MYSQL_ROOT_PASSWORD: secret
                      MYSQL_DATABASE: shop
                      MYSQL_USER: shop
                      MYSQL_PASSWORD: secret
                    ports:
                      - "3306:3306"
                    volumes:
                      - mysqldata:/var/lib/mysql
                      - ./my.cnf:/etc/mysql/conf.d/custom.cnf:ro
                volumes:
                  mysqldata:
                `,
            },
          ],
        },
        {
          title: '2. Start, stop and enable the service',
          lang: 'bash',
          code: c`
            # macOS
            brew services start mysql@8.4      # start now and at login
            brew services stop mysql@8.4
            brew services restart mysql@8.4

            # Linux (Ubuntu / Debian)
            sudo systemctl start mysql
            sudo systemctl stop mysql
            sudo systemctl restart mysql
            sudo systemctl enable mysql         # start at boot
            systemctl status mysql

            # Windows (PowerShell as Administrator) — service name is MySQL84 by default
            Start-Service MySQL84
            Stop-Service MySQL84
            Restart-Service MySQL84
            Set-Service MySQL84 -StartupType Automatic
            Get-Service MySQL*
            `,
        },
        {
          title: '3. Secure the installation',
          lang: 'bash',
          code: c`
            # macOS / Windows
            mysql_secure_installation

            # Linux
            sudo mysql_secure_installation
            `,
          note: 'Sets the root password (or keeps socket auth), removes anonymous users and the test database, and disables remote root login.',
        },
        {
          title: '4. Connect with the mysql client',
          lang: 'bash',
          code: c`
            mysql -u root -p                          # local, prompts for password
            mysql -u shop -p -h 127.0.0.1 -P 3306 shop  # TCP to a specific database
            sudo mysql                                # Ubuntu: root uses auth_socket, no password

            # inside the client
            SHOW DATABASES;
            USE shop;
            SHOW TABLES;
            \s                                        # connection status
            exit
            `,
          note: '-h localhost uses the Unix socket on macOS / Linux, while -h 127.0.0.1 forces TCP; that difference explains many "works in terminal, fails in app" problems.',
        },
        {
          title: '5. Create an app database and user',
          code: c`
            CREATE DATABASE shop CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
            CREATE USER 'shop'@'localhost' IDENTIFIED BY 'a-long-random-password';
            GRANT ALL PRIVILEGES ON shop.* TO 'shop'@'localhost';
            `,
          note: 'Give each app its own user limited to its own database, never root. General querying is covered on the SQL sheet.',
        },
        {
          title: '6. Check version and server status',
          lang: 'bash',
          code: c`
            mysql --version                  # client version
            mysql -u root -p -e "SELECT VERSION();"
            mysqladmin -u root -p status     # uptime, threads, queries
            mysqladmin -u root -p ping       # "mysqld is alive"
            `,
        },
        {
          title: '7. GUI clients',
          note: 'MySQL Workbench (free, all OS), DBeaver, TablePlus, DataGrip, or the VS Code "SQLTools" extension with the MySQL driver.',
        },
      ],
    },
    {
      id: 'mysql-config',
      title: 'Configuration file (my.cnf / my.ini)',
      group: 'MySQL',
      items: [
        {
          title: 'Where the config file lives',
          lang: 'text',
          code: c`
            macOS (Homebrew, Apple silicon)   /opt/homebrew/etc/my.cnf
            macOS (Homebrew, Intel)           /usr/local/etc/my.cnf
            Linux (Ubuntu / Debian)           /etc/mysql/mysql.conf.d/mysqld.cnf   (also /etc/mysql/my.cnf)
            Linux (RHEL / Fedora)             /etc/my.cnf  and  /etc/my.cnf.d/
            Windows                           C:\ProgramData\MySQL\MySQL Server 8.4\my.ini
            Docker (mysql image)              /etc/my.cnf  and  /etc/mysql/conf.d/*.cnf
            `,
          then: [
            {
              label: 'Ask mysqld which files it reads',
              lang: 'bash',
              code: c`
                # macOS / Linux
                mysqld --verbose --help | grep -A 1 "Default options"

                # Windows (PowerShell)
                mysqld --verbose --help | Select-String -Context 0,1 "Default options"
                `,
            },
          ],
        },
        {
          title: 'A sensible starting config',
          lang: 'ini',
          code: c`
            [mysqld]
            bind-address            = 127.0.0.1
            character-set-server    = utf8mb4
            collation-server        = utf8mb4_0900_ai_ci
            default-time-zone       = '+00:00'
            innodb_buffer_pool_size = 1G          # 50-70% of RAM on a dedicated DB server
            max_connections         = 200
            slow_query_log          = ON
            long_query_time         = 1

            [client]
            default-character-set   = utf8mb4
            `,
          note: 'Restart the service after editing the file. Windows Notepad may save my.ini with a BOM, which MySQL rejects, so save as UTF-8 without BOM or ANSI.',
        },
        {
          title: 'Change settings at runtime',
          code: c`
            SHOW VARIABLES LIKE 'max_connections';
            SET GLOBAL max_connections = 300;        -- until restart
            SET PERSIST max_connections = 300;       -- survives restart (mysqld-auto.cnf)
            RESET PERSIST max_connections;           -- remove the persisted value
            SET SESSION sql_mode = 'STRICT_TRANS_TABLES';  -- this connection only
            `,
        },
        {
          title: 'Default sql_mode in 8.4',
          lang: 'text',
          code: c`
            ONLY_FULL_GROUP_BY, STRICT_TRANS_TABLES, NO_ZERO_IN_DATE, NO_ZERO_DATE,
            ERROR_FOR_DIVISION_BY_ZERO, NO_ENGINE_SUBSTITUTION
            `,
          note: 'Strict mode turns silent truncation into errors. Keep it on and fix the queries rather than removing modes.',
        },
      ],
    },
    {
      id: 'mysql-users',
      title: 'Users, privileges & roles',
      group: 'MySQL',
      items: [
        {
          title: 'Create users',
          code: c`
            CREATE USER 'app'@'localhost' IDENTIFIED BY 'secret';
            CREATE USER 'app'@'10.0.1.%' IDENTIFIED BY 'secret';     -- a subnet
            CREATE USER 'reporter'@'%' IDENTIFIED BY 'secret';       -- any host
            SELECT user, host, plugin FROM mysql.user;
            DROP USER 'app'@'10.0.1.%';
            `,
          note: 'A MySQL account is user plus host, so app@localhost and app@% are two different accounts with separate passwords and grants.',
        },
        {
          title: 'Grant least privilege',
          code: c`
            -- typical web app: data only, no schema changes
            GRANT SELECT, INSERT, UPDATE, DELETE ON shop.* TO 'app'@'localhost';

            -- migrations user
            GRANT ALL PRIVILEGES ON shop.* TO 'migrator'@'localhost';

            -- read-only on one table
            GRANT SELECT ON shop.orders TO 'reporter'@'%';

            REVOKE DELETE ON shop.* FROM 'app'@'localhost';
            SHOW GRANTS FOR 'app'@'localhost';
            SHOW GRANTS;                               -- current user
            `,
          note: 'Grants take effect immediately; FLUSH PRIVILEGES is only needed after editing the mysql.* tables by hand.',
        },
        {
          title: 'Roles',
          code: c`
            CREATE ROLE 'app_read', 'app_write';
            GRANT SELECT ON shop.* TO 'app_read';
            GRANT INSERT, UPDATE, DELETE ON shop.* TO 'app_write';

            GRANT 'app_read', 'app_write' TO 'app'@'localhost';
            GRANT 'app_read' TO 'reporter'@'%';

            SET DEFAULT ROLE ALL TO 'app'@'localhost', 'reporter'@'%';
            SHOW GRANTS FOR 'reporter'@'%' USING 'app_read';
            SELECT CURRENT_ROLE();
            `,
          note: 'Roles are inactive at login unless set as default roles (or activate_all_roles_on_login = ON), which is the usual reason a role "does not work".',
        },
        {
          title: 'Change or reset a password',
          code: c`
            ALTER USER 'app'@'localhost' IDENTIFIED BY 'new-secret';
            ALTER USER USER() IDENTIFIED BY 'new-secret';              -- yourself
            ALTER USER 'app'@'localhost' PASSWORD EXPIRE INTERVAL 90 DAY;
            ALTER USER 'app'@'localhost' ACCOUNT LOCK;                 -- or UNLOCK
            `,
        },
        {
          title: 'Authentication plugins in 8.4',
          code: c`
            -- default for new users
            CREATE USER 'app'@'%' IDENTIFIED WITH caching_sha2_password BY 'secret';

            -- check what each account uses
            SELECT user, host, plugin FROM mysql.user;
            `,
          note: 'caching_sha2_password is the default and mysql_native_password is disabled by default in 8.4. Upgrade old drivers instead of downgrading; only if you truly cannot, enable the old plugin as shown.',
          then: [
            {
              label: 'Last resort for old clients: my.cnf / my.ini, then restart',
              lang: 'ini',
              code: c`
                [mysqld]
                mysql_native_password = ON
                `,
            },
            {
              label: 'Then switch only that account',
              lang: 'sql',
              code: c`
                ALTER USER 'legacy'@'%' IDENTIFIED WITH mysql_native_password BY 'secret';
                `,
            },
          ],
        },
        {
          title: 'Enforce strong passwords',
          code: c`
            INSTALL COMPONENT 'file://component_validate_password';
            SHOW VARIABLES LIKE 'validate_password%';
            SET PERSIST validate_password.policy = 'MEDIUM';
            `,
        },
      ],
    },
    {
      id: 'mysql-remote',
      title: 'Remote access & TLS',
      group: 'MySQL',
      items: [
        {
          title: '1. Listen on the network',
          lang: 'ini',
          code: c`
            [mysqld]
            bind-address = 0.0.0.0        # or the server's private IP, e.g. 10.0.1.5
            `,
          note: 'Default is 127.0.0.1 on Ubuntu and Homebrew installs, so nothing outside the machine can connect. Restart MySQL after the change.',
        },
        {
          title: '2. Create a user for the remote host',
          code: c`
            CREATE USER 'app'@'203.0.113.10' IDENTIFIED BY 'secret';   -- one app server
            GRANT SELECT, INSERT, UPDATE, DELETE ON shop.* TO 'app'@'203.0.113.10';
            `,
          note: "Prefer a specific IP or subnet over '%'. Never open root to remote hosts.",
        },
        {
          title: '3. Open port 3306 in the firewall',
          lang: 'bash',
          code: c`
            # Linux (Ubuntu / Debian, ufw) — only from the app server
            sudo ufw allow from 203.0.113.10 to any port 3306 proto tcp

            # Windows (PowerShell as Administrator)
            New-NetFirewallRule -DisplayName "MySQL 3306" -Direction Inbound -Protocol TCP -LocalPort 3306 -RemoteAddress 203.0.113.10 -Action Allow

            # macOS: allow mysqld when the Application Firewall prompts (System Settings → Network → Firewall)

            # test from the client machine
            mysql -u app -p -h db.example.com -P 3306
            `,
          note: 'On cloud VMs also open 3306 in the security group / VPC firewall, limited to your app servers. An SSH tunnel is a safer option for ad-hoc admin access.',
          then: [
            {
              label: 'SSH tunnel instead of opening the port',
              lang: 'bash',
              code: c`
                ssh -N -L 3307:127.0.0.1:3306 user@db.example.com     # all OS (OpenSSH)
                mysql -u app -p -h 127.0.0.1 -P 3307                    # in another terminal
                `,
            },
          ],
        },
        {
          title: 'Require TLS',
          code: c`
            ALTER USER 'app'@'%' REQUIRE SSL;                 -- one account
            SET PERSIST require_secure_transport = ON;        -- every TCP connection
            SHOW STATUS LIKE 'Ssl_cipher';                    -- non-empty = this session is encrypted
            `,
          note: 'MySQL 8.4 generates self-signed certificates at first start, so TLS works out of the box; use a CA-signed cert and VERIFY_IDENTITY when clients must verify the server.',
          then: [
            {
              label: 'Client side',
              lang: 'bash',
              code: c`
                mysql -u app -p -h db.example.com --ssl-mode=VERIFY_IDENTITY --ssl-ca=ca.pem
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'mysql-databases',
      title: 'Databases, charset & engine',
      group: 'MySQL',
      items: [
        {
          title: 'Create a database the right way',
          code: c`
            CREATE DATABASE IF NOT EXISTS shop
              CHARACTER SET utf8mb4
              COLLATE utf8mb4_0900_ai_ci;

            ALTER DATABASE shop CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;  -- default for NEW tables only
            SHOW CREATE DATABASE shop;
            DROP DATABASE IF EXISTS shop_old;
            `,
          note: 'Always utf8mb4 (full Unicode, emoji included); "utf8" is an alias for the old 3-byte utf8mb3. _ai_ci means accent- and case-insensitive comparisons.',
        },
        {
          title: 'Collations at a glance',
          lang: 'text',
          code: c`
            utf8mb4_0900_ai_ci     8.x default; accent + case insensitive ("é" = "E")
            utf8mb4_0900_as_cs     accent + case sensitive
            utf8mb4_unicode_ci     older Unicode rules; Laravel default; works on MariaDB too
            utf8mb4_bin            byte comparison, exact match (tokens, hashes)
            `,
          note: 'Joining columns with different collations can raise "Illegal mix of collations" and skip indexes, so keep one collation per database.',
        },
        {
          title: 'Convert an existing table to utf8mb4',
          code: c`
            ALTER TABLE posts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
            `,
        },
        {
          title: 'Storage engine: InnoDB',
          code: c`
            SHOW ENGINES;
            SELECT table_name, engine FROM information_schema.tables WHERE table_schema = 'shop';
            ALTER TABLE legacy_table ENGINE = InnoDB;     -- convert old MyISAM tables
            `,
          note: 'InnoDB is the default and the only sensible choice for app data: transactions, row locks, foreign keys and crash recovery.',
        },
      ],
    },
    {
      id: 'mysql-types',
      title: 'Data types cheat table',
      group: 'MySQL',
      items: [
        {
          title: 'Which type to use',
          lang: 'text',
          code: c`
            Need                     Type                         Notes
            ids                      BIGINT UNSIGNED              INT UNSIGNED caps at ~4.29 billion
            small counters / flags   TINYINT / SMALLINT           TINYINT range -128..127 (0..255 UNSIGNED)
            true / false             BOOLEAN                      alias for TINYINT(1); stores 0 / 1
            money                    DECIMAL(12,2)                exact; never FLOAT / DOUBLE for money
            measurements             DOUBLE                       approximate
            short text               VARCHAR(255)                 max length in characters; can be indexed fully
            long text                TEXT / MEDIUMTEXT            64 KB / 16 MB; index needs a prefix length
            fixed codes              CHAR(2)                      country, currency
            date only                DATE
            point in time            DATETIME or TIMESTAMP        see below
            JSON documents           JSON                         validated, binary storage
            fixed set of values      ENUM('draft','paid')         changing the list = ALTER TABLE
            UUID                     BINARY(16)                   UUID_TO_BIN(UUID(), 1) keeps inserts ordered
            files                    store a path / URL           not BLOB in the database
            `,
        },
        {
          title: 'DATETIME vs TIMESTAMP and time zones',
          lang: 'text',
          code: c`
            DATETIME    1000-01-01 .. 9999-12-31   stored exactly as given, no time zone conversion
            TIMESTAMP   1970-01-01 .. 2038-01-19   converted from session time_zone to UTC and back
            `,
          note: 'Simplest rule: run the server and every connection in UTC, use DATETIME, and convert to local time in the app. TIMESTAMP hits the year-2038 limit.',
          then: [
            {
              label: 'Time zone settings',
              lang: 'sql',
              code: c`
                SELECT @@global.time_zone, @@session.time_zone, NOW(), UTC_TIMESTAMP();
                SET time_zone = '+00:00';                    -- this connection
                SELECT CONVERT_TZ('2026-10-17 12:00:00', '+00:00', '+08:00');
                `,
            },
            {
              label: 'Load named time zones (macOS / Linux) so "Asia/Manila" works',
              lang: 'bash',
              code: c`
                mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
                `,
            },
          ],
        },
        {
          title: 'Fractional seconds and auto timestamps',
          code: c`
            created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
            `,
          note: 'The (3) keeps milliseconds; the precision in DEFAULT must match the column.',
        },
      ],
    },
    {
      id: 'mysql-tables',
      title: 'Create & inspect tables',
      group: 'MySQL',
      items: [
        {
          title: 'A complete InnoDB table',
          code: c`
            CREATE TABLE orders (
              id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
              customer_id BIGINT UNSIGNED NOT NULL,
              status      ENUM('pending','paid','shipped','cancelled') NOT NULL DEFAULT 'pending',
              qty         INT UNSIGNED NOT NULL,
              unit_price  DECIMAL(10,2) NOT NULL,
              total       DECIMAL(12,2) AS (qty * unit_price) STORED,
              meta        JSON NULL,
              created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (id),
              KEY idx_customer_created (customer_id, created_at),
              CONSTRAINT chk_qty CHECK (qty > 0),
              CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id)
                REFERENCES customers (id) ON DELETE RESTRICT ON UPDATE CASCADE
            ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
            `,
          note: 'Reserved words used as names need backticks around them in MySQL; it is easier to avoid names like order, group or key altogether.',
        },
        {
          title: 'AUTO_INCREMENT',
          code: c`
            INSERT INTO orders (customer_id, qty, unit_price) VALUES (1, 2, 9.99);
            SELECT LAST_INSERT_ID();                       -- id generated on THIS connection
            ALTER TABLE orders AUTO_INCREMENT = 100000;    -- next id
            `,
          note: 'Gaps are normal (rollbacks, failed inserts, INSERT IGNORE), so never rely on ids being consecutive.',
        },
        {
          title: 'Generated columns',
          code: c`
            ALTER TABLE customers
              ADD full_name VARCHAR(201) AS (CONCAT(first_name, ' ', last_name)) VIRTUAL,
              ADD email_domain VARCHAR(255) AS (SUBSTRING_INDEX(email, '@', -1)) STORED,
              ADD INDEX idx_email_domain (email_domain);
            `,
          note: 'VIRTUAL is computed on read and costs no space; STORED is written to disk. Both can be indexed.',
        },
        {
          title: 'Foreign keys and ON DELETE',
          lang: 'text',
          code: c`
            ON DELETE RESTRICT   block deleting a parent that still has children (default)
            ON DELETE CASCADE    delete the children too
            ON DELETE SET NULL   set the child column to NULL (column must be nullable)
            `,
          note: 'Parent and child columns must have exactly the same type and signedness (BIGINT UNSIGNED on both), or the CREATE fails with error 3780.',
          then: [
            {
              label: 'Add one later / skip checks during a bulk import',
              lang: 'sql',
              code: c`
                ALTER TABLE order_items ADD CONSTRAINT fk_items_order
                  FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE;

                SET FOREIGN_KEY_CHECKS = 0;   -- this session only; turn back on afterwards
                SET FOREIGN_KEY_CHECKS = 1;
                `,
            },
          ],
        },
        {
          title: 'Inspect tables',
          code: c`
            SHOW TABLES;
            DESCRIBE orders;                 -- columns, types, keys
            SHOW CREATE TABLE orders\G       -- full DDL (\G = vertical output)
            SHOW INDEX FROM orders;
            SHOW TABLE STATUS LIKE 'orders'; -- rows estimate, size, auto_increment

            -- table sizes in MB
            SELECT table_name,
                   ROUND((data_length + index_length) / 1024 / 1024, 1) AS size_mb
            FROM information_schema.tables
            WHERE table_schema = 'shop'
            ORDER BY size_mb DESC;
            `,
        },
      ],
    },
    {
      id: 'mysql-alter',
      title: 'Changing tables (ALTER TABLE)',
      group: 'MySQL',
      items: [
        {
          title: 'Columns',
          code: c`
            ALTER TABLE orders ADD COLUMN note VARCHAR(500) NULL AFTER status;
            ALTER TABLE orders MODIFY COLUMN note TEXT NULL;          -- change type, keep name
            ALTER TABLE orders CHANGE COLUMN note notes TEXT NULL;    -- rename + redefine
            ALTER TABLE orders RENAME COLUMN notes TO remarks;        -- rename only
            ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'paid';
            ALTER TABLE orders DROP COLUMN remarks;
            RENAME TABLE orders TO sales_orders;
            `,
          note: 'MODIFY and CHANGE replace the whole column definition, so repeat NOT NULL, DEFAULT and COMMENT or they are lost.',
        },
        {
          title: 'Online DDL: INSTANT and INPLACE',
          code: c`
            ALTER TABLE orders ADD COLUMN source VARCHAR(20) NULL, ALGORITHM = INSTANT;
            ALTER TABLE orders DROP COLUMN source, ALGORITHM = INSTANT;
            ALTER TABLE orders ADD INDEX idx_status (status), ALGORITHM = INPLACE, LOCK = NONE;
            `,
          note: 'INSTANT changes only metadata (adding / dropping columns, renaming, defaults) and finishes immediately; naming the algorithm makes MySQL fail rather than silently copy a huge table.',
        },
        {
          title: 'Big tables in production',
          note: 'For changes that need a full table copy on large tables, use gh-ost or pt-online-schema-change (Percona Toolkit), which copy in the background and swap at the end.',
        },
        {
          title: 'Indexes',
          code: c`
            ALTER TABLE orders ADD INDEX idx_status_created (status, created_at);
            ALTER TABLE customers ADD UNIQUE INDEX uq_email (email);
            ALTER TABLE orders RENAME INDEX idx_status TO idx_order_status;
            ALTER TABLE orders DROP INDEX idx_order_status;
            `,
        },
      ],
    },
    {
      id: 'mysql-indexes',
      title: 'Index types',
      group: 'MySQL',
      items: [
        {
          title: 'Composite indexes and the leftmost prefix',
          code: c`
            CREATE INDEX idx_cust_status_created ON orders (customer_id, status, created_at);

            -- can use the index
            WHERE customer_id = 7
            WHERE customer_id = 7 AND status = 'paid'
            WHERE customer_id = 7 AND status = 'paid' ORDER BY created_at DESC

            -- cannot (skips the first column)
            WHERE status = 'paid'
            `,
          note: 'Put equality columns first and the range or ORDER BY column last; a range condition stops the index being used for the columns after it.',
        },
        {
          title: 'Covering index',
          code: c`
            CREATE INDEX idx_cust_total ON orders (customer_id, created_at, total);

            SELECT created_at, total FROM orders WHERE customer_id = 7;   -- EXPLAIN Extra: Using index
            `,
          note: 'When every needed column is in the index, MySQL never reads the table rows. InnoDB secondary indexes always include the primary key too.',
        },
        {
          title: 'Unique, prefix, descending, functional',
          code: c`
            CREATE UNIQUE INDEX uq_customer_email ON customers (email);
            CREATE INDEX idx_body_prefix ON posts (body(100));           -- TEXT needs a prefix length
            CREATE INDEX idx_created_desc ON orders (created_at DESC);  -- real descending index in 8.x
            CREATE INDEX idx_email_lower ON customers ((LOWER(email)));  -- functional: note the double parentheses
            `,
          note: 'A UNIQUE index allows many NULLs. A functional index is used only when the query uses the exact same expression.',
        },
        {
          title: 'FULLTEXT index',
          code: c`
            CREATE FULLTEXT INDEX ft_posts ON posts (title, body);
            CREATE FULLTEXT INDEX ft_posts_cjk ON posts (body) WITH PARSER ngram;   -- Chinese / Japanese / Korean
            `,
          note: 'Queries use MATCH ... AGAINST (see the MySQL-specific SQL section). Words shorter than innodb_ft_min_token_size (3) are ignored.',
        },
        {
          title: 'Invisible indexes: test before dropping',
          code: c`
            ALTER TABLE orders ALTER INDEX idx_status INVISIBLE;   -- optimizer ignores it, still maintained
            -- watch for slow queries, then either:
            ALTER TABLE orders ALTER INDEX idx_status VISIBLE;
            ALTER TABLE orders DROP INDEX idx_status;
            `,
        },
        {
          title: 'Index rules of thumb',
          lang: 'text',
          code: c`
            index columns used in WHERE, JOIN ... ON and ORDER BY of frequent queries
            every foreign key column should be indexed (InnoDB creates one if missing)
            don't wrap indexed columns in functions:  WHERE DATE(created_at) = '2026-10-17'   -- full scan
                                         use a range:  WHERE created_at >= '2026-10-17' AND created_at < '2026-10-18'
            LIKE 'abc%' can use an index, LIKE '%abc' cannot
            compare same types: WHERE phone = 5551234 on a VARCHAR column skips the index
            each extra index slows INSERT / UPDATE and uses RAM
            `,
        },
      ],
    },
    {
      id: 'mysql-explain',
      title: 'EXPLAIN & EXPLAIN ANALYZE',
      group: 'MySQL',
      items: [
        {
          title: 'Run it',
          code: c`
            EXPLAIN SELECT * FROM orders WHERE customer_id = 7 ORDER BY created_at DESC LIMIT 10;
            EXPLAIN FORMAT=TREE SELECT ...;     -- plan as a tree, easier to read
            EXPLAIN ANALYZE SELECT ...;         -- actually runs the query, shows real times and rows
            `,
          note: 'EXPLAIN ANALYZE executes the statement, so be careful with slow queries on production.',
        },
        {
          title: 'Reading the type column (best → worst)',
          lang: 'text',
          code: c`
            const / system   one row by primary key or unique index
            eq_ref           one row per joined row via primary / unique key — ideal for joins
            ref              several rows via a non-unique index
            range            index range: BETWEEN, <, >, IN, LIKE 'abc%'
            index            reads the whole index (better than ALL, still a scan)
            ALL              full table scan — usually needs an index
            `,
        },
        {
          title: 'Other columns that matter',
          lang: 'text',
          code: c`
            possible_keys          indexes MySQL considered
            key                    index actually used (NULL = none)
            key_len                bytes of the index used → how many composite columns were used
            rows                   estimated rows examined (lower is better)
            filtered               % of rows left after the WHERE
            Extra: Using index     covering index, no table lookup (good)
            Extra: Using where     filter applied after reading rows
            Extra: Using filesort  extra sort step — consider an index matching ORDER BY
            Extra: Using temporary temp table for GROUP BY / DISTINCT — often slow
            `,
        },
        {
          title: 'Reading EXPLAIN ANALYZE',
          lang: 'text',
          code: c`
            -> Limit: 10 row(s)  (actual time=0.05..0.09 rows=10 loops=1)
                -> Index lookup on orders using idx_cust_status_created (customer_id=7)
                   (cost=3.1 rows=25) (actual time=0.04..0.08 rows=10 loops=1)
            `,
          note: 'Read from the innermost line outwards. Compare the estimated rows with the actual rows: a big difference means stale statistics, so run ANALYZE TABLE orders.',
        },
      ],
    },
    {
      id: 'mysql-monitoring',
      title: 'Slow queries & monitoring',
      group: 'MySQL',
      items: [
        {
          title: 'Enable the slow query log',
          code: c`
            SET PERSIST slow_query_log = ON;
            SET PERSIST long_query_time = 1;                  -- seconds
            SET PERSIST log_queries_not_using_indexes = ON;   -- optional, noisy
            SHOW VARIABLES LIKE 'slow_query_log_file';
            `,
          then: [
            {
              label: 'Summarize it (macOS / Linux; on Windows run inside WSL or use pt-query-digest)',
              lang: 'bash',
              code: c`
                mysqldumpslow -s t -t 10 /var/lib/mysql/myhost-slow.log      # top 10 by total time
                pt-query-digest /var/lib/mysql/myhost-slow.log               # Percona Toolkit, more detail
                `,
            },
          ],
        },
        {
          title: 'What is running right now / kill a query',
          code: c`
            SHOW FULL PROCESSLIST;

            SELECT id, user, host, db, command, time, state, LEFT(info, 80) AS query
            FROM information_schema.processlist
            WHERE command <> 'Sleep'
            ORDER BY time DESC;

            KILL QUERY 1234;   -- stop the statement, keep the connection
            KILL 1234;         -- close the connection
            `,
        },
        {
          title: 'sys schema: ready-made diagnostics',
          code: c`
            SELECT * FROM sys.statement_analysis LIMIT 10;               -- heaviest statements
            SELECT * FROM sys.statements_with_full_table_scans LIMIT 10;
            SELECT * FROM sys.statements_with_sorting LIMIT 10;
            SELECT * FROM sys.schema_unused_indexes WHERE object_schema = 'shop';
            SELECT * FROM sys.schema_redundant_indexes WHERE table_schema = 'shop';
            SELECT * FROM sys.innodb_lock_waits;                         -- who blocks whom
            SELECT * FROM sys.host_summary;
            `,
          note: 'The sys views read performance_schema, which is on by default. Counters reset at restart, so check unused indexes after the server has run a full business cycle.',
        },
        {
          title: 'Quick health numbers',
          code: c`
            SHOW GLOBAL STATUS LIKE 'Threads_connected';
            SHOW GLOBAL STATUS LIKE 'Max_used_connections';
            SHOW GLOBAL STATUS LIKE 'Slow_queries';
            SHOW ENGINE INNODB STATUS\G       -- includes LATEST DETECTED DEADLOCK
            `,
        },
        {
          title: 'Key server settings',
          lang: 'text',
          code: c`
            innodb_buffer_pool_size         cache for data + indexes; 50-70% of RAM on a dedicated server
            innodb_dedicated_server = ON    let MySQL size the buffer pool and redo log from RAM
            innodb_redo_log_capacity        redo log size (default 100M); raise for write-heavy loads
            max_connections                 default 151; each connection costs memory — use app pools
            wait_timeout                    seconds before idle connections close (default 28800)
            innodb_flush_log_at_trx_commit  1 = durable (default); 2 = faster, may lose ~1 s on OS crash
            tmp_table_size / max_heap_table_size   in-memory temp table limit
            table_open_cache                raise when you have many tables
            `,
          note: 'Change one setting at a time and measure. Most slowness is missing indexes, not configuration.',
        },
        {
          title: 'Refresh statistics and defragment',
          code: c`
            ANALYZE TABLE orders;      -- update index statistics (fast)
            OPTIMIZE TABLE orders;     -- rebuild the table to reclaim space after big deletes
            `,
        },
      ],
    },
    {
      id: 'mysql-upserts',
      title: 'Upserts & MySQL-only DML',
      group: 'MySQL',
      items: [
        {
          title: 'INSERT ... ON DUPLICATE KEY UPDATE (8.4 row alias)',
          code: c`
            INSERT INTO inventory (sku, qty, updated_at)
            VALUES ('A-1', 5, NOW()), ('B-2', 3, NOW()) AS new
            ON DUPLICATE KEY UPDATE
              qty = inventory.qty + new.qty,
              updated_at = new.updated_at;
            `,
          note: 'Fires when a PRIMARY KEY or UNIQUE index would be violated. The old VALUES(col) form is deprecated in favour of the AS new row alias.',
        },
        {
          title: 'INSERT IGNORE and REPLACE',
          code: c`
            INSERT IGNORE INTO tags (name) VALUES ('mysql'), ('sql');   -- skip duplicates silently
            REPLACE INTO settings (k, v) VALUES ('theme', 'dark');      -- delete old row, insert new
            `,
          note: 'INSERT IGNORE also hides other errors as warnings, and REPLACE deletes then inserts (new auto id, fires ON DELETE CASCADE), so ON DUPLICATE KEY UPDATE is usually safer.',
        },
        {
          title: 'Multi-table UPDATE and DELETE',
          code: c`
            UPDATE orders o
            JOIN customers c ON c.id = o.customer_id
            SET o.status = 'cancelled'
            WHERE c.is_banned = 1 AND o.status = 'pending';

            DELETE o, oi                       -- delete from both tables
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            WHERE o.created_at < '2020-01-01';

            DELETE s FROM sessions s           -- delete from one table using a join
            LEFT JOIN users u ON u.id = s.user_id
            WHERE u.id IS NULL;
            `,
        },
        {
          title: 'LIMIT with offset and on UPDATE / DELETE',
          code: c`
            SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 40;   -- same as LIMIT 40, 20
            DELETE FROM logs WHERE created_at < NOW() - INTERVAL 90 DAY ORDER BY id LIMIT 5000;   -- purge in batches
            `,
          note: 'Large offsets get slow; for deep pages use keyset pagination, e.g. WHERE id > last_seen_id ORDER BY id LIMIT 20.',
        },
        {
          title: 'GROUP_CONCAT',
          code: c`
            SELECT o.id, GROUP_CONCAT(p.name ORDER BY p.name SEPARATOR ', ') AS products
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            JOIN products p ON p.id = oi.product_id
            GROUP BY o.id;

            SET SESSION group_concat_max_len = 100000;   -- default 1024 chars, silently truncates
            `,
        },
        {
          title: 'Handy MySQL functions',
          code: c`
            SELECT IFNULL(nickname, name), IF(qty > 0, 'in stock', 'sold out'),
                   DATE_FORMAT(created_at, '%Y-%m-%d %H:%i'), NOW() - INTERVAL 7 DAY,
                   TIMESTAMPDIFF(DAY, created_at, NOW()), UUID(), UUID_TO_BIN(UUID(), 1),
                   FIND_IN_SET('b', 'a,b,c'), INET_ATON('10.0.0.1')
            FROM customers;
            `,
        },
      ],
    },
    {
      id: 'mysql-json',
      title: 'JSON columns',
      group: 'MySQL',
      items: [
        {
          title: 'Read values: -> and ->>',
          code: c`
            SELECT meta->'$.address.city'  AS city_json,   -- JSON value: "Manila" (with quotes)
                   meta->>'$.address.city' AS city,        -- unquoted text: Manila
                   JSON_EXTRACT(meta, '$.tags[0]') AS first_tag
            FROM orders
            WHERE meta->>'$.channel' = 'web';
            `,
          note: 'Use ->> for comparisons and display; -> is short for JSON_EXTRACT and returns JSON.',
        },
        {
          title: 'Build and modify JSON',
          code: c`
            INSERT INTO orders (customer_id, qty, unit_price, meta)
            VALUES (1, 1, 10, JSON_OBJECT('channel', 'web', 'tags', JSON_ARRAY('gift', 'promo')));

            UPDATE orders SET meta = JSON_SET(meta, '$.channel', 'app') WHERE id = 1;
            UPDATE orders SET meta = JSON_REMOVE(meta, '$.tags') WHERE id = 1;
            UPDATE orders SET meta = JSON_ARRAY_APPEND(meta, '$.tags', 'vip') WHERE id = 2;

            SELECT JSON_PRETTY(meta), JSON_KEYS(meta), JSON_LENGTH(meta, '$.tags') FROM orders;
            SELECT JSON_ARRAYAGG(id), JSON_OBJECTAGG(sku, qty) FROM inventory;
            `,
        },
        {
          title: 'Search inside arrays',
          code: c`
            SELECT * FROM orders WHERE 'gift' MEMBER OF (meta->'$.tags');
            SELECT * FROM orders WHERE JSON_CONTAINS(meta->'$.tags', '"gift"');
            SELECT * FROM orders WHERE JSON_OVERLAPS(meta->'$.tags', '["gift", "vip"]');
            `,
        },
        {
          title: 'Index JSON: functional and multi-valued indexes',
          code: c`
            -- a scalar field
            ALTER TABLE orders ADD INDEX idx_channel ((CAST(meta->>'$.channel' AS CHAR(20)) COLLATE utf8mb4_bin));

            -- every element of an array (multi-valued index)
            ALTER TABLE orders ADD INDEX idx_tags ((CAST(meta->'$.tags' AS CHAR(32) ARRAY)));
            `,
          note: 'Multi-valued indexes are used by MEMBER OF, JSON_CONTAINS and JSON_OVERLAPS. A STORED or VIRTUAL generated column with a normal index is the simpler alternative for scalar fields.',
        },
        {
          title: 'JSON_TABLE: turn JSON into rows',
          code: c`
            SELECT o.id, t.tag
            FROM orders o,
                 JSON_TABLE(o.meta, '$.tags[*]' COLUMNS (tag VARCHAR(32) PATH '$')) AS t;

            SELECT *
            FROM JSON_TABLE(
              '[{"sku":"A-1","qty":2},{"sku":"B-2","qty":1}]',
              '$[*]' COLUMNS (sku VARCHAR(20) PATH '$.sku', qty INT PATH '$.qty')
            ) AS items;
            `,
        },
      ],
    },
    {
      id: 'mysql-fulltext',
      title: 'Full-text search',
      group: 'MySQL',
      items: [
        {
          title: 'Natural language mode',
          code: c`
            SELECT id, title, MATCH(title, body) AGAINST ('database tuning') AS score
            FROM posts
            WHERE MATCH(title, body) AGAINST ('database tuning' IN NATURAL LANGUAGE MODE)
            ORDER BY score DESC
            LIMIT 20;
            `,
          note: 'The column list in MATCH must exactly match a FULLTEXT index. Words in more than half the rows score low.',
        },
        {
          title: 'Boolean mode',
          code: c`
            SELECT id, title FROM posts
            WHERE MATCH(title, body) AGAINST ('+mysql -oracle "query cache" tun*' IN BOOLEAN MODE);
            `,
          lang: 'sql',
          then: [
            {
              label: 'Operators',
              lang: 'text',
              code: c`
                +word      must be present
                -word      must not be present
                word*      prefix match
                "a phrase" exact phrase
                >word <word  raise / lower its weight
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'mysql-cte-vars',
      title: 'Window functions, CTEs & variables',
      group: 'MySQL',
      items: [
        {
          title: 'Availability',
          note: 'Window functions (ROW_NUMBER, RANK, LAG, SUM() OVER) and CTEs work in MySQL 8.0+ exactly as shown on the SQL sheet; MySQL 5.7 had neither. LATERAL derived tables also work since 8.0.14.',
        },
        {
          title: 'Recursive CTE: walk a category tree',
          code: c`
            WITH RECURSIVE tree AS (
              SELECT id, parent_id, name, 0 AS depth, CAST(name AS CHAR(1000)) AS path
              FROM categories
              WHERE parent_id IS NULL
              UNION ALL
              SELECT c.id, c.parent_id, c.name, t.depth + 1, CONCAT(t.path, ' > ', c.name)
              FROM categories c
              JOIN tree t ON c.parent_id = t.id
            )
            SELECT * FROM tree ORDER BY path;
            `,
          note: 'The CAST in the anchor sets the column width for the whole result, otherwise longer paths get truncated. cte_max_recursion_depth (default 1000) stops runaway loops.',
        },
        {
          title: 'Generate a date series',
          code: c`
            WITH RECURSIVE days AS (
              SELECT DATE('2026-10-01') AS d
              UNION ALL
              SELECT d + INTERVAL 1 DAY FROM days WHERE d < '2026-10-31'
            )
            SELECT days.d, COUNT(o.id) AS orders
            FROM days
            LEFT JOIN orders o ON DATE(o.created_at) = days.d
            GROUP BY days.d;
            `,
        },
        {
          title: 'User and system variables',
          code: c`
            SET @min_total = 100;
            SELECT * FROM orders WHERE total >= @min_total;
            SELECT @last := MAX(id) FROM orders;

            SELECT @@version, @@sql_mode, @@transaction_isolation;   -- system variables
            `,
          note: '@name variables live only for the current connection. Assigning inside SELECT with := is deprecated, so prefer SET or SELECT ... INTO @var.',
        },
      ],
    },
    {
      id: 'mysql-transactions',
      title: 'Transactions & locking',
      group: 'MySQL',
      items: [
        {
          title: 'Transaction basics and autocommit',
          code: c`
            START TRANSACTION;
            UPDATE accounts SET balance = balance - 50 WHERE id = 1;
            UPDATE accounts SET balance = balance + 50 WHERE id = 2;
            COMMIT;          -- or ROLLBACK;

            SELECT @@autocommit;   -- 1 = every statement commits on its own
            `,
          note: 'DDL such as CREATE, ALTER and DROP commits implicitly, so it cannot be rolled back inside a transaction.',
        },
        {
          title: 'Isolation levels',
          code: c`
            SELECT @@transaction_isolation;                          -- REPEATABLE-READ by default
            SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;  -- this connection
            SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;            -- next transaction only
            `,
          note: 'REPEATABLE READ gives each transaction a consistent snapshot but uses gap locks; many apps switch to READ COMMITTED for fewer lock conflicts.',
        },
        {
          title: 'Locking reads',
          code: c`
            START TRANSACTION;
            SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;      -- exclusive row lock
            UPDATE accounts SET balance = balance - 50 WHERE id = 1;
            COMMIT;

            SELECT * FROM products WHERE id = 5 FOR SHARE;             -- others can read, not write
            SELECT * FROM products WHERE id = 5 FOR UPDATE NOWAIT;     -- error instead of waiting
            `,
          note: 'Locks are held until COMMIT or ROLLBACK, and only rows reached through an index are locked precisely; without an index, InnoDB locks far more rows.',
        },
        {
          title: 'Job queue with SKIP LOCKED',
          code: c`
            START TRANSACTION;
            SELECT id, payload FROM jobs
            WHERE status = 'pending'
            ORDER BY id
            LIMIT 10
            FOR UPDATE SKIP LOCKED;          -- each worker gets different rows

            UPDATE jobs SET status = 'running', started_at = NOW() WHERE id IN (101, 102, 103);
            COMMIT;
            `,
          note: 'Add an index on (status, id) so the worker only locks the rows it picks.',
        },
        {
          title: 'Deadlocks and lock waits',
          code: c`
            SHOW ENGINE INNODB STATUS\G                    -- see "LATEST DETECTED DEADLOCK"
            SET PERSIST innodb_print_all_deadlocks = ON;   -- log every deadlock to the error log
            SET SESSION innodb_lock_wait_timeout = 10;     -- default 50 seconds
            `,
          note: 'InnoDB resolves a deadlock by rolling back one transaction (error 1213), so the app should simply retry it. Keep transactions short and touch rows in the same order everywhere.',
        },
      ],
    },
    {
      id: 'mysql-backup',
      title: 'Backup & restore',
      group: 'MySQL',
      items: [
        {
          title: 'Dump with mysqldump',
          lang: 'bash',
          code: c`
            # macOS / Linux
            mysqldump -u root -p --single-transaction --routines --triggers --events shop > shop.sql
            mysqldump -u root -p --single-transaction --routines --triggers --events --all-databases > all.sql
            mysqldump -u root -p --no-data shop > schema.sql            # structure only

            # Windows (PowerShell) — use --result-file; ">" can write UTF-16 in Windows PowerShell 5.1
            mysqldump -u root -p --single-transaction --routines --triggers --events --result-file=shop.sql shop
            `,
          note: '--single-transaction takes a consistent snapshot of InnoDB tables without locking them; routines, triggers and events are not all included by default.',
        },
        {
          title: 'Restore a dump',
          lang: 'bash',
          code: c`
            # macOS / Linux / Windows cmd
            mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS shop CHARACTER SET utf8mb4"
            mysql -u root -p shop < shop.sql

            # Windows (PowerShell) — no "<" input redirection
            mysql -u root -p shop -e "source shop.sql"
            Get-Content shop.sql | mysql -u root -p shop      # works too, slower for big files
            `,
        },
        {
          title: 'Compressed dumps',
          lang: 'bash',
          code: c`
            # macOS / Linux
            mysqldump -u root -p --single-transaction --routines --triggers --events shop | gzip > shop.sql.gz
            gunzip < shop.sql.gz | mysql -u root -p shop

            # Windows (PowerShell) — dump to a file, then compress with the built-in tar
            mysqldump -u root -p --single-transaction --routines --triggers --events --result-file=shop.sql shop
            tar -czf shop.sql.tgz shop.sql
            tar -xzf shop.sql.tgz
            mysql -u root -p shop -e "source shop.sql"
            `,
        },
        {
          title: 'Store credentials for scripts',
          lang: 'bash',
          code: c`
            mysql_config_editor set --login-path=backup --host=localhost --user=backup --password
            mysqldump --login-path=backup --single-transaction shop > shop.sql
            `,
          note: 'Keeps passwords off the command line and out of shell history; the obfuscated file is ~/.mylogin.cnf (%APPDATA%\\MySQL on Windows).',
          then: [
            {
              label: 'A minimal backup user',
              lang: 'sql',
              code: c`
                CREATE USER 'backup'@'localhost' IDENTIFIED BY 'secret';
                GRANT SELECT, SHOW VIEW, TRIGGER, EVENT, LOCK TABLES, RELOAD, PROCESS ON *.* TO 'backup'@'localhost';
                `,
            },
          ],
        },
        {
          title: 'Scheduled nightly backup',
          lang: 'bash',
          code: c`
            # macOS / Linux: crontab -e  (% must be escaped as \% inside crontab)
            0 2 * * * mysqldump --login-path=backup --single-transaction --routines --triggers --events shop | gzip > /backups/shop-$(date +\%F).sql.gz
            30 2 * * * find /backups -name "shop-*.sql.gz" -mtime +14 -delete

            # Windows (PowerShell as Administrator): run a .ps1 script daily at 02:00
            $action  = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\scripts\mysql-backup.ps1"
            $trigger = New-ScheduledTaskTrigger -Daily -At 2am
            Register-ScheduledTask -TaskName "MySQL backup" -Action $action -Trigger $trigger -User "SYSTEM"
            `,
          note: 'A backup you never restored is not a backup: restore into a scratch database regularly and copy the files off the server.',
        },
        {
          title: 'MySQL Shell dump utilities (fast, parallel)',
          lang: 'bash',
          code: c`
            # install: macOS  brew install --cask mysql-shell
            #          Linux  sudo apt install mysql-shell        (Oracle APT repository)
            #          Windows winget install -e --id Oracle.MySQLShell

            mysqlsh root@localhost --js -e "util.dumpInstance('/backups/full', {threads: 4})"
            mysqlsh root@localhost --js -e "util.dumpSchemas(['shop'], '/backups/shop')"
            mysqlsh root@newhost --js -e "util.loadDump('/backups/shop', {threads: 4})"
            `,
          note: 'mysqlpump was removed in 8.4, so use mysqldump or these utilities. loadDump needs local_infile = ON on the target server.',
        },
        {
          title: 'Binary logs and point-in-time recovery',
          lang: 'bash',
          code: c`
            # binary logging is ON by default in 8.4
            mysql -u root -p -e "SHOW BINARY LOGS; SHOW BINARY LOG STATUS;"

            # 1. restore last night's full dump, then 2. replay the binlog up to just before the mistake
            mysqlbinlog --start-datetime="2026-10-17 02:00:00" --stop-datetime="2026-10-17 14:59:00" binlog.000041 binlog.000042 | mysql -u root -p
            `,
          note: 'Add --source-data=2 to mysqldump so the dump records the binlog position it was taken at. SHOW MASTER STATUS was removed in 8.4; use SHOW BINARY LOG STATUS.',
          then: [
            {
              label: 'Keep binlogs long enough',
              lang: 'sql',
              code: c`
                SET PERSIST binlog_expire_logs_seconds = 604800;   -- 7 days (default 30 days)
                PURGE BINARY LOGS BEFORE NOW() - INTERVAL 3 DAY;
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'mysql-replication',
      title: 'Replication (source / replica with GTID)',
      group: 'MySQL',
      items: [
        {
          title: '1. Config on both servers',
          lang: 'ini',
          code: c`
            [mysqld]
            server_id                = 1          # unique per server: 2 on the replica
            gtid_mode                = ON
            enforce_gtid_consistency = ON
            # replica only:
            # read_only        = ON
            # super_read_only  = ON
            `,
        },
        {
          title: '2. Replication user on the source',
          code: c`
            CREATE USER 'repl'@'10.0.1.%' IDENTIFIED BY 'secret' REQUIRE SSL;
            GRANT REPLICATION SLAVE ON *.* TO 'repl'@'10.0.1.%';
            `,
          note: 'The privilege keeps its old name even though 8.4 uses source / replica everywhere else.',
        },
        {
          title: '3. Seed the replica',
          lang: 'bash',
          code: c`
            # on the source
            mysqldump -u root -p --all-databases --single-transaction --source-data=2 --triggers --routines --events > seed.sql
            # copy seed.sql to the replica, then load it there
            mysql -u root -p < seed.sql
            `,
          note: 'For large databases use MySQL Shell (util.dumpInstance / util.loadDump) or the CLONE plugin instead.',
        },
        {
          title: '4. Point the replica at the source and start',
          code: c`
            CHANGE REPLICATION SOURCE TO
              SOURCE_HOST = '10.0.1.5',
              SOURCE_PORT = 3306,
              SOURCE_USER = 'repl',
              SOURCE_PASSWORD = 'secret',
              SOURCE_SSL = 1,
              SOURCE_AUTO_POSITION = 1;

            START REPLICA;
            SHOW REPLICA STATUS\G
            `,
          note: 'Healthy when Replica_IO_Running and Replica_SQL_Running are both Yes and Seconds_Behind_Source stays near 0. CHANGE MASTER / START SLAVE are removed in 8.4.',
        },
        {
          title: 'Day-to-day commands',
          code: c`
            STOP REPLICA;
            START REPLICA;
            RESET REPLICA ALL;                    -- forget the source (promote to standalone)
            SELECT * FROM performance_schema.replication_applier_status_by_worker\G   -- last error
            `,
        },
        {
          title: 'High availability options',
          note: 'Read replicas scale reads but failover is manual. For automatic failover use InnoDB Cluster (Group Replication + MySQL Router), or a managed service: AWS RDS Multi-AZ and read replicas, Cloud SQL HA, or Azure Flexible Server zone-redundant HA.',
        },
        {
          title: 'Reads from replicas in the app',
          note: 'Replicas lag slightly behind, so read your own writes from the primary. Laravel supports this with "read" / "write" hosts and the "sticky" option in config/database.php.',
        },
      ],
    },
    {
      id: 'mysql-apps',
      title: 'Connecting from apps',
      group: 'MySQL',
      items: [
        {
          title: 'Connection string formats',
          lang: 'text',
          code: c`
            URL (Node, Prisma, many tools)   mysql://app:secret@127.0.0.1:3306/shop
            SQLAlchemy (PyMySQL)             mysql+pymysql://app:secret@127.0.0.1:3306/shop?charset=utf8mb4
            Django (mysqlclient)             ENGINE django.db.backends.mysql
            PHP PDO DSN                      mysql:host=127.0.0.1;port=3306;dbname=shop;charset=utf8mb4
            JDBC                             jdbc:mysql://127.0.0.1:3306/shop?sslMode=REQUIRED
            .NET                             Server=127.0.0.1;Port=3306;Database=shop;User ID=app;Password=secret;SslMode=Required
            `,
          note: 'URL-encode special characters in passwords (@ becomes %40, # becomes %23).',
        },
        {
          title: 'Laravel',
          lang: 'env',
          code: c`
            DB_CONNECTION=mysql
            DB_HOST=127.0.0.1
            DB_PORT=3306
            DB_DATABASE=shop
            DB_USERNAME=shop
            DB_PASSWORD=secret
            `,
          note: 'config/database.php defaults to utf8mb4 and strict => true; keep strict on so bad data errors instead of being truncated.',
          then: [
            {
              label: 'Check and migrate',
              lang: 'bash',
              code: c`
                php artisan db:show
                php artisan migrate
                `,
            },
          ],
        },
        {
          title: 'Node: mysql2 pool with prepared statements',
          lang: 'bash',
          code: c`
            npm install mysql2
            `,
          then: [
            {
              label: 'db.js',
              lang: 'js',
              code: c`
                import mysql from 'mysql2/promise'

                export const pool = mysql.createPool({
                  host: process.env.DB_HOST,
                  user: process.env.DB_USER,
                  password: process.env.DB_PASSWORD,
                  database: process.env.DB_NAME,
                  connectionLimit: 10,
                  charset: 'utf8mb4',
                  timezone: 'Z',
                })

                // execute() = server-side prepared statement; values never concatenated into SQL
                const [rows] = await pool.execute('SELECT id, email FROM users WHERE id = ?', [userId])
                const [result] = await pool.execute('INSERT INTO users (email) VALUES (?)', [email])
                console.log(result.insertId)
                `,
            },
            {
              label: 'Sequelize',
              lang: 'js',
              code: c`
                // npm install sequelize mysql2
                import { Sequelize } from 'sequelize'

                export const sequelize = new Sequelize(process.env.DATABASE_URL, {
                  dialect: 'mysql',
                  pool: { max: 10 },
                  logging: false,
                })
                `,
            },
          ],
          note: 'Use mysql2, not the old "mysql" package, which cannot authenticate with caching_sha2_password.',
        },
        {
          title: 'Python: Django (mysqlclient)',
          lang: 'bash',
          code: c`
            # macOS
            brew install mysql-client pkg-config
            export PKG_CONFIG_PATH="$(brew --prefix)/opt/mysql-client/lib/pkgconfig"
            pip install mysqlclient

            # Linux (Ubuntu / Debian)
            sudo apt install -y python3-dev default-libmysqlclient-dev build-essential pkg-config
            pip install mysqlclient

            # Windows (PowerShell) — prebuilt wheels
            pip install mysqlclient
            `,
          then: [
            {
              label: 'settings.py',
              lang: 'python',
              code: c`
                DATABASES = {
                    "default": {
                        "ENGINE": "django.db.backends.mysql",
                        "NAME": "shop",
                        "USER": "shop",
                        "PASSWORD": os.environ["DB_PASSWORD"],
                        "HOST": "127.0.0.1",
                        "PORT": "3306",
                        "OPTIONS": {
                            "charset": "utf8mb4",
                            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
                        },
                    }
                }
                `,
            },
          ],
        },
        {
          title: 'Python: PyMySQL and SQLAlchemy',
          lang: 'bash',
          code: c`
            pip install pymysql sqlalchemy cryptography     # cryptography is needed for caching_sha2_password
            `,
          then: [
            {
              label: 'Code',
              lang: 'python',
              code: c`
                from sqlalchemy import create_engine, text

                engine = create_engine(
                    "mysql+pymysql://app:secret@127.0.0.1:3306/shop?charset=utf8mb4",
                    pool_size=10,
                    pool_recycle=3600,      # avoid "MySQL server has gone away"
                    pool_pre_ping=True,
                )

                with engine.connect() as conn:
                    rows = conn.execute(text("SELECT id, email FROM users WHERE id = :id"), {"id": 7}).all()
                `,
            },
          ],
        },
        {
          title: 'PHP: PDO',
          lang: 'php',
          code: c`
            $pdo = new PDO(
                'mysql:host=127.0.0.1;port=3306;dbname=shop;charset=utf8mb4',
                getenv('DB_USER'),
                getenv('DB_PASSWORD'),
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );

            $stmt = $pdo->prepare('SELECT id, email FROM users WHERE id = ?');
            $stmt->execute([$id]);
            $user = $stmt->fetch();
            `,
          note: 'charset=utf8mb4 in the DSN is what makes emoji and other 4-byte characters save correctly.',
        },
      ],
    },
    {
      id: 'mysql-managed',
      title: 'Managed MySQL in the cloud',
      group: 'MySQL',
      items: [
        {
          title: 'Options',
          lang: 'text',
          code: c`
            AWS RDS for MySQL / Aurora MySQL      parameter groups instead of my.cnf; Multi-AZ, read replicas
            Google Cloud SQL for MySQL            database flags; connect via Cloud SQL Auth Proxy or private IP
            Azure Database for MySQL (Flexible)   server parameters; TLS required by default
            `,
          note: 'There is no SUPER privilege or my.cnf on managed services, so change settings through the console, parameter groups or flags.',
        },
        {
          title: 'AWS RDS with TLS',
          lang: 'bash',
          code: c`
            curl -o global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
            mysql -h mydb.abc123.us-east-1.rds.amazonaws.com -u admin -p --ssl-mode=VERIFY_IDENTITY --ssl-ca=global-bundle.pem
            `,
        },
        {
          title: 'Google Cloud SQL Auth Proxy',
          lang: 'bash',
          code: c`
            cloud-sql-proxy my-project:us-central1:my-instance --port 3306
            mysql -u app -p -h 127.0.0.1 -P 3306     # in another terminal; the proxy handles TLS and IAM
            `,
        },
        {
          title: 'Azure Flexible Server',
          lang: 'bash',
          code: c`
            mysql -h myserver.mysql.database.azure.com -u app -p --ssl-mode=REQUIRED
            `,
          note: 'Allow your client IP under Networking first; for VERIFY_IDENTITY download the CA certificate linked in the Azure docs.',
        },
      ],
    },
    {
      id: 'mysql-troubleshooting',
      title: 'Common errors & fixes',
      group: 'MySQL',
      items: [
        {
          title: 'Error table',
          lang: 'text',
          code: c`
            1045 Access denied for user        wrong password, or wrong host part: app@localhost ≠ app@%
            2002 Can't connect through socket  server not running, or wrong socket → start service / use -h 127.0.0.1
            2003 Can't connect to server       bind-address = 127.0.0.1, firewall, wrong port
            1251 / 2059 auth plugin errors     old client vs caching_sha2_password → upgrade driver (mysql2, PyMySQL + cryptography)
            1205 Lock wait timeout exceeded    another transaction holds the row → find it in sys.innodb_lock_waits, shorten transactions
            1213 Deadlock found                retry the transaction; lock rows in a consistent order
            1366 Incorrect string value        emoji in utf8mb3 column / connection → utf8mb4 table AND connection charset
            1452 Foreign key constraint fails  parent row does not exist → insert the parent first or fix the id
            3780 Incompatible FK columns       types differ (INT vs BIGINT UNSIGNED) → make them identical
            1040 Too many connections          raise max_connections, use a pool, close leaked connections
            1055 ONLY_FULL_GROUP_BY            select only grouped columns or aggregates (or ANY_VALUE(col))
            1364 Field doesn't have a default  strict mode: supply the value or add a DEFAULT
            1406 Data too long for column      widen the column or validate input length
            1062 Duplicate entry               unique key violated → upsert with ON DUPLICATE KEY UPDATE
            2006 / 2013 Server has gone away   idle connection closed (wait_timeout) or packet > max_allowed_packet
            3159 Insecure transport            require_secure_transport = ON → connect with TLS
            `,
        },
        {
          title: 'Diagnose "Access denied"',
          code: c`
            SELECT user, host, plugin, account_locked FROM mysql.user WHERE user = 'app';
            SELECT USER(), CURRENT_USER();   -- what you asked for vs the account that matched
            `,
          note: "An anonymous ''@'localhost' account can match before app@'%'; mysql_secure_installation removes it.",
        },
        {
          title: 'Fix emoji / utf8mb4 end to end',
          code: c`
            SHOW VARIABLES LIKE 'character_set%';
            ALTER DATABASE shop CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
            ALTER TABLE posts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
            SET NAMES utf8mb4;   -- or charset=utf8mb4 in the app connection settings
            `,
        },
        {
          title: 'Find the server error log',
          lang: 'bash',
          code: c`
            mysql -u root -p -e "SELECT @@log_error, @@datadir;"

            # macOS (Homebrew)
            tail -f "$(brew --prefix)/var/mysql/$(hostname).err"

            # Linux (Ubuntu / Debian)
            sudo tail -f /var/log/mysql/error.log
            sudo journalctl -u mysql -e

            # Windows (PowerShell)
            Get-Content "C:\ProgramData\MySQL\MySQL Server 8.4\Data\$env:COMPUTERNAME.err" -Tail 50 -Wait
            `,
          note: 'When the service will not start, the last lines of the error log almost always name the cause (bad config line, port in use, permissions on the data directory).',
        },
        {
          title: 'Forgot the root password',
          lang: 'bash',
          code: c`
            # Linux (Ubuntu / Debian): root uses socket auth, so this usually still works
            sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'new-secret';"
            `,
          note: 'Otherwise stop the server, start it once with --init-file pointing to a file containing the ALTER USER statement, then restart normally (see "Resetting the Root Password" in the MySQL manual).',
        },
      ],
    },
    {
      id: 'postgresql-install',
      title: 'Install & run PostgreSQL 17',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Install',
          lang: 'bash',
          code: c`
            # macOS (Homebrew; postgresql@17 is keg-only, so add it to PATH)
            brew install postgresql@17
            echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zshrc   # Intel: /usr/local/opt/...
            brew services start postgresql@17

            # Linux (Ubuntu / Debian) — distro package (Debian 13 ships 17, Ubuntu 24.04 ships 16)
            sudo apt update && sudo apt install -y postgresql postgresql-contrib

            # Linux — exact version 17 from the official PGDG repository (any Ubuntu / Debian)
            sudo apt install -y postgresql-common
            sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh
            sudo apt install -y postgresql-17

            # Windows (PowerShell) — EDB installer, asks for the postgres password
            winget install -e --id PostgreSQL.PostgreSQL.17

            # check (any OS)
            psql --version
            `,
          note: 'The Linux package creates a "postgres" OS user and database superuser. Homebrew instead creates a superuser named after your macOS username.',
        },
        {
          title: 'Or run it in Docker (any OS)',
          lang: 'bash',
          code: c`
            docker run -d --name pg -p 5432:5432 -e POSTGRES_PASSWORD=secret -e POSTGRES_USER=app -e POSTGRES_DB=app -v pgdata:/var/lib/postgresql/data postgres:17

            docker exec -it pg psql -U app app     # psql inside the container
            `,
          then: [
            {
              label: 'docker-compose.yml',
              lang: 'yaml',
              code: c`
                services:
                  db:
                    image: postgres:17
                    environment:
                      POSTGRES_USER: app
                      POSTGRES_PASSWORD: secret
                      POSTGRES_DB: app
                    ports: ["5432:5432"]
                    volumes: ["pgdata:/var/lib/postgresql/data"]
                    healthcheck:
                      test: ["CMD-SHELL", "pg_isready -U app -d app"]
                      interval: 5s
                volumes:
                  pgdata:
                `,
            },
          ],
        },
        {
          title: 'Windows: put psql on PATH',
          lang: 'powershell',
          code: c`
            # current user, permanent (open a new terminal afterwards)
            [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\PostgreSQL\17\bin", "User")

            # this session only
            $env:Path += ";C:\Program Files\PostgreSQL\17\bin"
            psql --version
            `,
          note: 'The installer does not add psql, pg_dump and friends to PATH.',
        },
        {
          title: 'Start / stop / restart / enable the service',
          lang: 'bash',
          code: c`
            # macOS (Homebrew)
            brew services start postgresql@17      # start now and at login
            brew services stop postgresql@17
            brew services restart postgresql@17
            brew services list

            # Linux (Ubuntu / Debian)
            sudo systemctl enable --now postgresql   # start now and at boot
            sudo systemctl restart postgresql
            sudo systemctl status postgresql
            pg_lsclusters                            # Debian tool: versions, ports, status
            sudo systemctl reload postgresql         # re-read config without restart

            # Windows (PowerShell as Administrator)
            Get-Service postgresql*
            Start-Service postgresql-x64-17
            Stop-Service postgresql-x64-17
            Restart-Service postgresql-x64-17
            Set-Service postgresql-x64-17 -StartupType Automatic
            `,
        },
        {
          title: 'Is it up?',
          lang: 'bash',
          code: c`
            pg_isready                       # "accepting connections" (exit code 0)
            pg_isready -h localhost -p 5432
            `,
        },
      ],
    },
    {
      id: 'postgresql-first-connection',
      title: 'First connection, app user & database',
      group: 'PostgreSQL',
      items: [
        {
          title: '1. Connect as the superuser',
          lang: 'bash',
          code: c`
            # Linux: "peer" auth — your OS user must match the DB role
            sudo -u postgres psql

            # macOS (Homebrew): superuser is your macOS username
            psql postgres

            # Windows (PowerShell): password set during install
            psql -U postgres -h localhost

            # Docker
            docker exec -it pg psql -U postgres
            `,
        },
        {
          title: '2. Set a password for postgres',
          code: c`
            \password postgres
            -- or: ALTER ROLE postgres PASSWORD 'strong-secret';
            `,
          note: 'Use \\password so the password is not stored in psql history or server logs in plain text.',
        },
        {
          title: '3. Create the app user and its database',
          code: c`
            CREATE ROLE app LOGIN PASSWORD 'change-me';
            CREATE DATABASE app OWNER app;
            -- optional: a separate test database
            CREATE DATABASE app_test OWNER app;
            `,
          note: 'Making the app role the database owner gives it CREATE on the public schema, which PostgreSQL 15+ no longer grants to everyone.',
          then: [
            {
              label: 'Same thing from the shell',
              lang: 'bash',
              code: c`
                # Linux
                sudo -u postgres createuser --pwprompt app
                sudo -u postgres createdb -O app app

                # macOS / Windows
                createuser -U postgres --pwprompt app
                createdb -U postgres -O app app
                `,
            },
          ],
        },
        {
          title: '4. Connect as the app user',
          lang: 'bash',
          code: c`
            psql -h localhost -U app -d app
            psql "postgresql://app:change-me@localhost:5432/app"
            `,
          note: 'Using -h localhost goes over TCP with password auth; without -h on Linux you use the Unix socket and peer auth.',
        },
      ],
    },
    {
      id: 'postgresql-config-files',
      title: 'Config files & remote access',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Where the config files live',
          lang: 'bash',
          code: c`
            # ask the server (works everywhere)
            psql -c "SHOW config_file" -c "SHOW hba_file" -c "SHOW data_directory"

            # Linux (Ubuntu / Debian)
            /etc/postgresql/17/main/postgresql.conf
            /etc/postgresql/17/main/pg_hba.conf

            # macOS (Homebrew, Apple Silicon; Intel: /usr/local/var/...)
            /opt/homebrew/var/postgresql@17/postgresql.conf
            /opt/homebrew/var/postgresql@17/pg_hba.conf

            # Windows
            C:\Program Files\PostgreSQL\17\data\postgresql.conf
            C:\Program Files\PostgreSQL\17\data\pg_hba.conf

            # Docker
            /var/lib/postgresql/data/postgresql.conf
            `,
        },
        {
          title: 'Change a setting without editing files',
          code: c`
            SHOW work_mem;
            ALTER SYSTEM SET work_mem = '32MB';     -- written to postgresql.auto.conf
            SELECT pg_reload_conf();                 -- apply settings that do not need a restart
            SELECT name, setting, pending_restart FROM pg_settings WHERE pending_restart;
            `,
          note: 'Settings like shared_buffers, listen_addresses and shared_preload_libraries need a full service restart.',
        },
        {
          title: 'pg_hba.conf: who may connect, and how',
          lang: 'text',
          code: c`
            # TYPE   DATABASE  USER   ADDRESS          METHOD
            local    all       postgres                peer            # OS user must match role
            local    all       all                     scram-sha-256   # password over the socket
            host     all       all    127.0.0.1/32     scram-sha-256
            host     all       all    ::1/128          scram-sha-256
            host     app       app    10.0.0.0/24      scram-sha-256   # app servers on the LAN
            hostssl  app       app    0.0.0.0/0        scram-sha-256   # internet: TLS only

            # methods: peer (local OS user) · scram-sha-256 (password, default) · md5 (legacy)
            #          trust (no password — never outside a throwaway dev box) · reject · cert
            `,
          note: 'Lines are checked top to bottom and the first match wins. Reload after editing with SELECT pg_reload_conf(); or a service reload.',
        },
        {
          title: 'Allow remote connections',
          lang: 'bash',
          code: c`
            # 1. postgresql.conf — listen on all interfaces (needs a restart)
            listen_addresses = '*'          # default 'localhost'

            # 2. pg_hba.conf — allow the client network
            host  app  app  203.0.113.0/24  scram-sha-256

            # 3. restart, then open the firewall
            # Linux (Ubuntu / Debian)
            sudo systemctl restart postgresql
            sudo ufw allow from 203.0.113.0/24 to any port 5432 proto tcp

            # macOS
            brew services restart postgresql@17

            # Windows (PowerShell as Administrator)
            Restart-Service postgresql-x64-17
            New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -Protocol TCP -LocalPort 5432 -RemoteAddress 203.0.113.0/24 -Action Allow
            `,
          note: 'Never expose 5432 to the whole internet; prefer a private network, an SSH tunnel or a VPN.',
          then: [
            {
              label: 'SSH tunnel instead of opening the port',
              lang: 'bash',
              code: c`
                ssh -N -L 5433:localhost:5432 deploy@db.example.com
                psql -h localhost -p 5433 -U app app
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'postgresql-psql',
      title: 'psql cheat list',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Meta-commands',
          lang: 'text',
          code: c`
            \?             help for meta-commands       \h CREATE INDEX   SQL syntax help
            \l             list databases               \c app            connect to database app
            \dn            list schemas                 \dt               list tables (\dt+ with sizes)
            \d users       describe table / view        \di \dv \dm \ds   indexes, views, mat. views, sequences
            \du            list roles                   \df               list functions
            \dx            installed extensions         \dp users         privileges on a table
            \x             toggle expanded output       \x auto           expand only wide rows
            \timing        show query duration          \conninfo         who / where am I connected
            \i file.sql    run a file                   \e                edit last query in $EDITOR
            \watch 2       re-run last query every 2s   \gx               run query with expanded output
            \set ON_ERROR_STOP on                       stop a script at the first error
            \q             quit
            `,
        },
        {
          title: '\\copy: CSV import / export from your machine',
          code: c`
            \copy users TO 'users.csv' WITH (FORMAT csv, HEADER)
            \copy (SELECT id, email FROM users WHERE active) TO 'active.csv' WITH (FORMAT csv, HEADER)
            \copy users (email, name) FROM 'import.csv' WITH (FORMAT csv, HEADER)

            -- PostgreSQL 17: skip bad rows instead of aborting the whole load
            \copy users (email, name) FROM 'import.csv' WITH (FORMAT csv, HEADER, ON_ERROR ignore)
            `,
          note: '\\copy reads and writes files on the client; plain COPY ... FROM \'/path\' reads files on the database server and needs extra privileges.',
        },
        {
          title: 'One-off commands from the shell',
          lang: 'bash',
          code: c`
            psql -U app -d app -c "SELECT count(*) FROM users"
            psql -U app -d app -f migrate.sql -v ON_ERROR_STOP=1
            psql -U app -d app -At -c "SELECT email FROM users" > emails.txt   # unaligned, tuples only
            `,
        },
        {
          title: '~/.psqlrc (Windows: %APPDATA%\\postgresql\\psqlrc.conf)',
          lang: 'text',
          code: c`
            \set QUIET 1
            \pset null '∅'
            \x auto
            \timing on
            \set HISTCONTROL ignoredups
            \set QUIET 0
            `,
        },
      ],
    },
    {
      id: 'postgresql-roles',
      title: 'Roles & privileges',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Roles vs users',
          code: c`
            CREATE ROLE readonly;                                 -- a group (no LOGIN)
            CREATE ROLE alice LOGIN PASSWORD 'secret';            -- a "user" = role with LOGIN
            CREATE USER bob PASSWORD 'secret';                    -- same as CREATE ROLE ... LOGIN
            GRANT readonly TO alice;                              -- membership
            ALTER ROLE alice VALID UNTIL '2026-12-31';
            ALTER ROLE alice CONNECTION LIMIT 10;
            DROP ROLE bob;                                        -- after REASSIGN OWNED / DROP OWNED
            `,
          note: 'PostgreSQL has only roles; a user is just a role that can log in. Roles are cluster-wide, not per database.',
        },
        {
          title: 'GRANT on database, schema and tables',
          code: c`
            GRANT CONNECT ON DATABASE app TO alice;
            GRANT USAGE ON SCHEMA public TO alice;                   -- needed to see objects
            GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO alice;
            GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO alice;
            GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO alice;
            REVOKE DELETE ON orders FROM alice;
            `,
          note: 'ON ALL TABLES only covers tables that exist now; use ALTER DEFAULT PRIVILEGES for future ones.',
        },
        {
          title: 'ALTER DEFAULT PRIVILEGES for future tables',
          code: c`
            -- tables later created BY role app in schema public get these grants
            ALTER DEFAULT PRIVILEGES FOR ROLE app IN SCHEMA public
              GRANT SELECT ON TABLES TO readonly;
            ALTER DEFAULT PRIVILEGES FOR ROLE app IN SCHEMA public
              GRANT USAGE, SELECT ON SEQUENCES TO readonly;
            `,
          note: 'Defaults are tied to the role that creates the objects, usually the migration user.',
        },
        {
          title: 'Read-only role, complete',
          code: c`
            CREATE ROLE readonly NOLOGIN;
            GRANT CONNECT ON DATABASE app TO readonly;
            GRANT USAGE ON SCHEMA public TO readonly;
            GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
            ALTER DEFAULT PRIVILEGES FOR ROLE app IN SCHEMA public GRANT SELECT ON TABLES TO readonly;

            CREATE ROLE analyst LOGIN PASSWORD 'secret' IN ROLE readonly;
            ALTER ROLE analyst SET default_transaction_read_only = on;
            `,
          then: [
            {
              label: 'Shortcut: predefined roles (14+)',
              lang: 'sql',
              code: c`
                GRANT pg_read_all_data TO analyst;     -- SELECT on everything, every schema
                GRANT pg_write_all_data TO etl;        -- INSERT / UPDATE / DELETE on everything
                GRANT pg_monitor TO grafana;           -- read stats views
                GRANT pg_maintain TO ops;              -- 17: VACUUM, ANALYZE, REINDEX, REFRESH MATVIEW
                `,
            },
          ],
        },
        {
          title: 'The public schema since PostgreSQL 15',
          code: c`
            -- 15+: only the database owner can CREATE in public; fix "permission denied for schema public"
            ALTER DATABASE app OWNER TO app;           -- preferred
            -- or
            GRANT CREATE ON SCHEMA public TO app;

            -- harden older databases the same way
            REVOKE CREATE ON SCHEMA public FROM PUBLIC;
            `,
          note: 'PUBLIC (uppercase, no quotes) means "every role", unrelated to the schema named public.',
        },
        {
          title: 'Who owns / can do what',
          code: c`
            \du
            \dp orders
            SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'orders';
            REASSIGN OWNED BY bob TO app;    -- before dropping a role (run in each database)
            DROP OWNED BY bob;
            `,
        },
      ],
    },
    {
      id: 'postgresql-rls',
      title: 'Row-level security & SSL',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Row-level security (multi-tenant)',
          code: c`
            ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
            ALTER TABLE documents FORCE ROW LEVEL SECURITY;   -- apply to the table owner too

            CREATE POLICY tenant_isolation ON documents
              USING (tenant_id = current_setting('app.tenant_id')::bigint)
              WITH CHECK (tenant_id = current_setting('app.tenant_id')::bigint);

            CREATE POLICY own_rows ON documents FOR UPDATE
              USING (owner_id = current_setting('app.user_id')::bigint);
            `,
          note: 'USING filters rows you can see; WITH CHECK validates rows you write. Superusers and roles with BYPASSRLS skip policies.',
        },
        {
          title: 'Set the user per request / transaction',
          code: c`
            BEGIN;
            SELECT set_config('app.user_id', '42', true);    -- true = local to this transaction
            SELECT set_config('app.tenant_id', '7', true);
            SELECT * FROM documents;                          -- only tenant 7 rows
            COMMIT;
            `,
          note: 'Transaction-local settings are safe with connection pools; a session-level SET would leak to the next request using that connection.',
        },
        {
          title: 'Require SSL',
          lang: 'bash',
          code: c`
            # postgresql.conf (server)
            ssl = on
            ssl_cert_file = 'server.crt'
            ssl_key_file = 'server.key'

            # pg_hba.conf: hostssl lines only accept TLS connections
            hostssl  all  all  0.0.0.0/0  scram-sha-256

            # client: verify the certificate and host name
            psql "host=db.example.com dbname=app user=app sslmode=verify-full sslrootcert=ca.pem"
            `,
          note: 'sslmode values: disable, prefer (default, no verification), require (encrypt, no verification), verify-ca, verify-full (encrypt and check host name). Use verify-full in production.',
        },
        {
          title: 'Check who is on SSL',
          code: c`
            SELECT a.usename, a.client_addr, s.ssl, s.version
            FROM pg_stat_ssl s JOIN pg_stat_activity a USING (pid);
            `,
        },
      ],
    },
    {
      id: 'postgresql-types',
      title: 'Data types',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Which type to pick',
          lang: 'text',
          code: c`
            Need                    Use                                    Avoid / notes
            ids                     bigint GENERATED ALWAYS AS IDENTITY    serial / bigserial (legacy)
            public / random ids     uuid DEFAULT gen_random_uuid()         built in since 13
            whole numbers           integer (4 B), bigint (8 B)            smallint rarely worth it
            money, exact decimals   numeric(12,2)                          real / double precision, money
            text                    text (+ CHECK on length if needed)     varchar(n) has no speed benefit
            case-insensitive text   citext (extension)                     lower() everywhere
            points in time          timestamptz                            timestamp (no time zone)
            calendar date           date
            durations               interval                               '2 hours', '3 days'
            yes / no                boolean                                0/1 integers
            documents, flexible     jsonb                                  json (keeps whitespace, slower)
            lists                   text[], integer[]                      a join table is often better
            fixed set of values     enum type or CHECK constraint
            IP / network            inet, cidr
            ranges                  tstzrange, daterange, int4range
            `,
        },
        {
          title: 'Identity columns vs serial',
          code: c`
            CREATE TABLE users (
              id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
              email citext NOT NULL UNIQUE,
              created_at timestamptz NOT NULL DEFAULT now()
            );

            -- after a bulk import with explicit ids, move the sequence forward
            SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT max(id) FROM users));
            `,
          note: 'GENERATED ALWAYS rejects manual ids unless you write OVERRIDING SYSTEM VALUE; BY DEFAULT allows them. Both are SQL-standard, unlike serial.',
        },
        {
          title: 'timestamptz: always',
          code: c`
            SHOW timezone;
            SET timezone = 'America/Mexico_City';                -- per session
            ALTER DATABASE app SET timezone = 'UTC';              -- default for the database

            SELECT now();                                         -- timestamptz, transaction start
            SELECT clock_timestamp();                             -- real current time
            SELECT created_at AT TIME ZONE 'Europe/Madrid' FROM orders;   -- local wall time
            SELECT date_trunc('day', created_at), now() - interval '7 days';
            `,
          note: 'timestamptz stores an absolute UTC instant and converts on display; timestamp stores a wall-clock value with no zone, which breaks across servers and DST.',
        },
        {
          title: 'UUIDs, enums, citext, arrays',
          code: c`
            CREATE EXTENSION IF NOT EXISTS citext;

            CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped');
            ALTER TYPE order_status ADD VALUE 'refunded' AFTER 'paid';

            CREATE TABLE orders (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              status order_status NOT NULL DEFAULT 'pending',
              tags text[] NOT NULL DEFAULT '{}',
              total numeric(12,2) NOT NULL CHECK (total >= 0)
            );
            `,
          note: 'Enum values cannot be removed or easily renamed; a text column with a CHECK constraint is easier to change later.',
        },
        {
          title: 'Casts and handy literals',
          code: c`
            SELECT '42'::int, 3.5::numeric(10,2), '2026-10-17'::date, 'yes'::boolean;
            SELECT '{"a": 1}'::jsonb, ARRAY[1, 2, 3], '{red,blue}'::text[];
            SELECT '[2026-01-01, 2026-02-01)'::daterange;
            SELECT pg_typeof(now());
            `,
        },
      ],
    },
    {
      id: 'postgresql-schema-design',
      title: 'Schemas, constraints & ALTER TABLE',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Schemas and search_path',
          code: c`
            CREATE SCHEMA billing AUTHORIZATION app;
            CREATE TABLE billing.invoices (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY);

            SHOW search_path;                                  -- "$user", public
            SET search_path = billing, public;                 -- session
            ALTER ROLE app SET search_path = billing, public;  -- default for a role
            `,
          note: 'Unqualified names are looked up in search_path order; a schema is a namespace inside one database.',
        },
        {
          title: 'Constraints',
          code: c`
            CREATE TABLE bookings (
              id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
              room_id bigint NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
              guest_email text NOT NULL CHECK (guest_email LIKE '%@%'),
              during tstzrange NOT NULL,
              code text UNIQUE NULLS NOT DISTINCT,               -- 15+: only one NULL allowed
              CONSTRAINT no_overlap EXCLUDE USING gist (room_id WITH =, during WITH &&)
            );
            -- EXCLUDE with "=" on a plain column needs: CREATE EXTENSION btree_gist;
            `,
          note: 'EXCLUDE generalises UNIQUE: no two rows may match on all the listed operators, here "same room and overlapping time".',
        },
        {
          title: 'Deferrable foreign keys',
          code: c`
            ALTER TABLE employees ADD CONSTRAINT fk_manager
              FOREIGN KEY (manager_id) REFERENCES employees (id)
              DEFERRABLE INITIALLY IMMEDIATE;

            BEGIN;
            SET CONSTRAINTS fk_manager DEFERRED;    -- checked at COMMIT instead of per statement
            -- insert rows that reference each other ...
            COMMIT;
            `,
        },
        {
          title: 'Generated columns',
          code: c`
            CREATE TABLE line_items (
              qty integer NOT NULL,
              unit_price numeric(12,2) NOT NULL,
              total numeric(12,2) GENERATED ALWAYS AS (qty * unit_price) STORED
            );
            `,
          note: 'Stored generated columns are computed on write and can be indexed; the expression must be immutable.',
        },
        {
          title: 'Safe ALTER TABLE patterns',
          code: c`
            SET lock_timeout = '5s';      -- fail fast instead of queueing behind long queries

            -- fast since 11: adding a column with a constant default does not rewrite the table
            ALTER TABLE users ADD COLUMN plan text NOT NULL DEFAULT 'free';

            -- add NOT NULL to a big existing column without a long exclusive lock
            ALTER TABLE users ADD CONSTRAINT email_not_null CHECK (email IS NOT NULL) NOT VALID;
            ALTER TABLE users VALIDATE CONSTRAINT email_not_null;     -- scans, but allows writes
            ALTER TABLE users ALTER COLUMN email SET NOT NULL;        -- 12+: uses the check, no scan
            ALTER TABLE users DROP CONSTRAINT email_not_null;

            -- same idea for foreign keys
            ALTER TABLE orders ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id) NOT VALID;
            ALTER TABLE orders VALIDATE CONSTRAINT fk_user;
            `,
          note: 'Changing a column type (e.g. int to bigint) rewrites the whole table under an exclusive lock; plan it for a maintenance window or use a new column plus backfill.',
        },
        {
          title: 'Rename and comment',
          code: c`
            ALTER TABLE users RENAME COLUMN name TO full_name;
            ALTER TABLE users RENAME TO accounts;
            COMMENT ON COLUMN accounts.plan IS 'free | pro | team';
            `,
        },
      ],
    },
    {
      id: 'postgresql-writes',
      title: 'Upsert, RETURNING, MERGE',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Generic querying lives elsewhere',
          note: 'SELECT, joins, GROUP BY, CTEs and window functions are covered in the SQL sheet; this group only shows PostgreSQL-specific syntax.',
        },
        {
          title: 'INSERT ... ON CONFLICT',
          code: c`
            -- upsert on a unique column / constraint
            INSERT INTO products (sku, name, price) VALUES ('A1', 'Mug', 9.50)
            ON CONFLICT (sku) DO UPDATE
              SET name = EXCLUDED.name, price = EXCLUDED.price, updated_at = now()
              WHERE products.price IS DISTINCT FROM EXCLUDED.price;

            -- ignore duplicates
            INSERT INTO tags (name) VALUES ('sql'), ('pg') ON CONFLICT DO NOTHING;

            -- target a named constraint or a partial unique index
            INSERT INTO subscriptions (user_id, plan) VALUES (1, 'pro')
            ON CONFLICT ON CONSTRAINT subscriptions_user_id_key DO NOTHING;
            `,
          note: 'EXCLUDED is the row you tried to insert. The conflict target needs a unique index or constraint on exactly those columns.',
        },
        {
          title: 'RETURNING',
          code: c`
            INSERT INTO users (email) VALUES ('ana@example.com') RETURNING id, created_at;
            UPDATE orders SET status = 'paid' WHERE id = 42 RETURNING *;
            DELETE FROM sessions WHERE expires_at < now() RETURNING user_id;
            `,
          note: 'Saves a second round trip to fetch generated ids or defaults.',
        },
        {
          title: 'UPDATE ... FROM / DELETE ... USING',
          code: c`
            UPDATE products p SET price = s.price
            FROM staging_prices s
            WHERE s.sku = p.sku;

            DELETE FROM carts c
            USING users u
            WHERE u.id = c.user_id AND u.deleted_at IS NOT NULL;

            -- bulk update from a VALUES list
            UPDATE products p SET stock = v.stock
            FROM (VALUES ('A1', 5), ('B2', 0)) AS v (sku, stock)
            WHERE v.sku = p.sku;
            `,
        },
        {
          title: 'MERGE (15+, RETURNING in 17)',
          code: c`
            MERGE INTO inventory i
            USING incoming n ON n.sku = i.sku
            WHEN MATCHED AND n.qty = 0 THEN DELETE
            WHEN MATCHED THEN UPDATE SET qty = n.qty
            WHEN NOT MATCHED THEN INSERT (sku, qty) VALUES (n.sku, n.qty)
            WHEN NOT MATCHED BY SOURCE THEN DELETE        -- 17: rows missing from incoming
            RETURNING merge_action(), i.*;                -- 17: 'INSERT' | 'UPDATE' | 'DELETE'
            `,
          note: 'MERGE syncs a table from a source in one statement. Under concurrent inserts ON CONFLICT is safer, because MERGE can still raise unique violations.',
        },
      ],
    },
    {
      id: 'postgresql-pg-queries',
      title: 'Query features',
      group: 'PostgreSQL',
      items: [
        {
          title: 'DISTINCT ON: first row per group',
          code: c`
            -- latest order per customer
            SELECT DISTINCT ON (customer_id) customer_id, id, total, created_at
            FROM orders
            ORDER BY customer_id, created_at DESC;
            `,
          note: 'ORDER BY must start with the DISTINCT ON columns; the next sort keys decide which row is kept.',
        },
        {
          title: 'FILTER on aggregates',
          code: c`
            SELECT
              count(*)                                   AS total,
              count(*) FILTER (WHERE status = 'paid')    AS paid,
              sum(total) FILTER (WHERE created_at >= now() - interval '30 days') AS last_30d
            FROM orders;
            `,
        },
        {
          title: 'string_agg / array_agg / json_agg',
          code: c`
            SELECT customer_id,
                   string_agg(sku, ', ' ORDER BY sku)   AS skus,
                   array_agg(DISTINCT status)           AS statuses,
                   jsonb_agg(jsonb_build_object('id', id, 'total', total)) AS orders
            FROM orders
            GROUP BY customer_id;
            `,
        },
        {
          title: 'generate_series',
          code: c`
            -- every day of the month, even days with no orders
            SELECT d::date AS day, count(o.id)
            FROM generate_series('2026-10-01'::date, '2026-10-31', interval '1 day') AS d
            LEFT JOIN orders o ON o.created_at >= d AND o.created_at < d + interval '1 day'
            GROUP BY d ORDER BY d;

            SELECT generate_series(1, 5);    -- 1..5, handy for test data
            `,
        },
        {
          title: 'LATERAL',
          code: c`
            SELECT u.email, last.created_at
            FROM users u
            LEFT JOIN LATERAL (
              SELECT created_at FROM logins WHERE logins.user_id = u.id ORDER BY created_at DESC LIMIT 1
            ) last ON true;
            `,
          note: 'Top-N-per-group with LATERAL is explained in the SQL sheet; LEFT JOIN LATERAL ... ON true keeps rows with no match.',
        },
        {
          title: 'Arrays: ANY, contains, unnest',
          code: c`
            SELECT * FROM users WHERE id = ANY (ARRAY[1, 2, 3]);    -- also: = ANY ($1) from apps
            SELECT * FROM posts WHERE tags @> ARRAY['postgres'];     -- has all of these
            SELECT * FROM posts WHERE tags && ARRAY['sql', 'pg'];     -- has any of these
            SELECT id, unnest(tags) AS tag FROM posts;               -- one row per element
            UPDATE posts SET tags = array_append(tags, 'new') WHERE id = 1;
            SELECT cardinality(tags), tags[1] FROM posts;            -- arrays are 1-based
            `,
        },
        {
          title: 'ILIKE, regex and pg_trgm fuzzy search',
          code: c`
            SELECT * FROM users WHERE name ILIKE '%ana%';           -- case-insensitive LIKE
            SELECT * FROM users WHERE email ~* '@example\.(com|org)$';   -- regex, case-insensitive

            CREATE EXTENSION IF NOT EXISTS pg_trgm;
            CREATE INDEX users_name_trgm ON users USING gin (name gin_trgm_ops);  -- speeds up ILIKE '%x%'

            SELECT name, similarity(name, 'jon smith') AS score
            FROM users
            WHERE name % 'jon smith'                                -- similar enough (default 0.3)
            ORDER BY score DESC LIMIT 10;
            `,
        },
      ],
    },
    {
      id: 'postgresql-jsonb',
      title: 'jsonb',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Read values',
          code: c`
            SELECT data -> 'address'          AS address_json,   -- jsonb
                   data ->> 'email'           AS email,          -- text
                   data -> 'tags' ->> 0       AS first_tag,
                   data #>> '{address,city}'  AS city,           -- by path, as text
                   (data ->> 'age')::int      AS age
            FROM profiles;
            `,
        },
        {
          title: 'Filter',
          code: c`
            SELECT * FROM profiles WHERE data @> '{"plan": "pro"}';          -- contains
            SELECT * FROM profiles WHERE data ? 'phone';                     -- key exists
            SELECT * FROM profiles WHERE data ?| ARRAY['phone', 'mobile'];   -- any key exists
            SELECT * FROM profiles WHERE data @? '$.orders[*] ? (@.total > 100)';   -- JSON path

            CREATE INDEX profiles_data_gin ON profiles USING gin (data);             -- @> ? ?| @?
            CREATE INDEX profiles_data_path ON profiles USING gin (data jsonb_path_ops);  -- smaller, @> only
            CREATE INDEX profiles_email ON profiles ((data ->> 'email'));            -- one key, B-tree
            `,
        },
        {
          title: 'Modify',
          code: c`
            UPDATE profiles SET data = jsonb_set(data, '{address,city}', '"Lima"') WHERE id = 1;
            UPDATE profiles SET data = data || '{"verified": true}' WHERE id = 1;    -- merge keys
            UPDATE profiles SET data = data - 'legacy_field';                        -- remove key
            UPDATE profiles SET data = data #- '{address,zip}';                      -- remove by path
            `,
        },
        {
          title: 'Expand and query with JSON path',
          code: c`
            SELECT key, value FROM profiles, jsonb_each(data) WHERE id = 1;
            SELECT elem ->> 'sku' FROM orders, jsonb_array_elements(items) AS elem;
            SELECT jsonb_path_query(items, '$[*] ? (@.price > 10).sku') FROM orders;
            SELECT jsonb_pretty(data) FROM profiles WHERE id = 1;
            `,
          then: [
            {
              label: 'JSON_TABLE (new in 17): JSON to rows and columns',
              lang: 'sql',
              code: c`
                SELECT o.id, jt.*
                FROM orders o,
                  JSON_TABLE(o.items, '$[*]' COLUMNS (
                    sku   text    PATH '$.sku',
                    qty   integer PATH '$.qty',
                    price numeric PATH '$.price'
                  )) AS jt;
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'postgresql-fts',
      title: 'Full-text search',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Basics',
          code: c`
            SELECT to_tsvector('english', 'The quick brown foxes jumped');   -- 'brown':3 'fox':4 'jump':5 'quick':2
            SELECT to_tsquery('english', 'fox & (jump | run) & !cat');
            SELECT websearch_to_tsquery('english', '"brown fox" -cat or dog');   -- Google-style user input
            SELECT to_tsvector('english', body) @@ websearch_to_tsquery('english', 'brown fox') FROM posts;
            `,
          note: 'Use websearch_to_tsquery or plainto_tsquery for user input; to_tsquery raises errors on bad syntax.',
        },
        {
          title: 'Indexed search column + ranking',
          code: c`
            ALTER TABLE posts ADD COLUMN search tsvector GENERATED ALWAYS AS (
              setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
              setweight(to_tsvector('english', coalesce(body, '')), 'B')
            ) STORED;
            CREATE INDEX posts_search_gin ON posts USING gin (search);

            SELECT id, title,
                   ts_rank(search, q) AS rank,
                   ts_headline('english', body, q) AS snippet
            FROM posts, websearch_to_tsquery('english', 'postgres indexes') AS q
            WHERE search @@ q
            ORDER BY rank DESC
            LIMIT 20;
            `,
          note: 'Weight A (title) ranks higher than B (body). For typo tolerance combine with pg_trgm.',
        },
      ],
    },
    {
      id: 'postgresql-concurrency',
      title: 'Job queues, locks & LISTEN/NOTIFY',
      group: 'PostgreSQL',
      items: [
        {
          title: 'FOR UPDATE SKIP LOCKED job queue',
          code: c`
            -- each worker claims one job; concurrent workers never get the same row
            WITH next AS (
              SELECT id FROM jobs
              WHERE status = 'queued' AND run_at <= now()
              ORDER BY id
              FOR UPDATE SKIP LOCKED
              LIMIT 1
            )
            UPDATE jobs SET status = 'running', started_at = now()
            FROM next WHERE jobs.id = next.id
            RETURNING jobs.*;

            CREATE INDEX jobs_queued ON jobs (id) WHERE status = 'queued';
            `,
          note: 'Locking variants: FOR UPDATE (exclusive), FOR SHARE, NOWAIT (error instead of waiting), SKIP LOCKED (ignore locked rows).',
        },
        {
          title: 'Advisory locks (app-level mutex)',
          code: c`
            SELECT pg_try_advisory_lock(42);          -- true if acquired, session-level
            SELECT pg_advisory_unlock(42);
            SELECT pg_advisory_xact_lock(hashtext('nightly-report'));   -- released at COMMIT
            `,
          note: 'Useful to make sure only one instance runs a cron job. Session-level advisory locks do not work through PgBouncer transaction mode.',
        },
        {
          title: 'Isolation levels',
          code: c`
            BEGIN ISOLATION LEVEL REPEATABLE READ;    -- snapshot for the whole transaction
            BEGIN ISOLATION LEVEL SERIALIZABLE;       -- as if run one at a time; may fail with 40001
            SHOW default_transaction_isolation;       -- read committed
            `,
          note: 'With REPEATABLE READ or SERIALIZABLE your app must retry transactions that fail with "could not serialize access".',
        },
        {
          title: 'LISTEN / NOTIFY',
          code: c`
            LISTEN order_events;                                    -- session 1
            NOTIFY order_events, '{"id": 42, "status": "paid"}';     -- session 2
            SELECT pg_notify('order_events', json_build_object('id', 42)::text);   -- from SQL / triggers
            `,
          note: 'Notifications are delivered on COMMIT, are not stored, and payloads are limited to 8000 bytes; send ids, not whole rows.',
          then: [
            {
              label: 'Node (pg): listen on a dedicated client',
              lang: 'js',
              code: c`
                const client = await pool.connect()
                await client.query('LISTEN order_events')
                client.on('notification', msg => {
                  console.log(msg.channel, JSON.parse(msg.payload))
                })
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'postgresql-plpgsql',
      title: 'Functions, triggers & views',
      group: 'PostgreSQL',
      items: [
        {
          title: 'SQL and PL/pgSQL functions',
          code: c`
            CREATE OR REPLACE FUNCTION order_total(p_order_id bigint)
            RETURNS numeric
            LANGUAGE sql STABLE
            AS $$
              SELECT coalesce(sum(qty * unit_price), 0) FROM line_items WHERE order_id = p_order_id;
            $$;

            CREATE OR REPLACE FUNCTION transfer(p_from bigint, p_to bigint, p_amount numeric)
            RETURNS void
            LANGUAGE plpgsql
            AS $$
            BEGIN
              IF p_amount <= 0 THEN
                RAISE EXCEPTION 'amount must be positive, got %', p_amount;
              END IF;
              UPDATE accounts SET balance = balance - p_amount WHERE id = p_from;
              UPDATE accounts SET balance = balance + p_amount WHERE id = p_to;
            END;
            $$;

            SELECT order_total(42);
            SELECT transfer(1, 2, 100);
            `,
          note: '$$ ... $$ is dollar quoting, so the body needs no escaped quotes. Mark functions IMMUTABLE / STABLE when true so the planner can optimise them.',
        },
        {
          title: 'updated_at trigger',
          code: c`
            CREATE OR REPLACE FUNCTION set_updated_at()
            RETURNS trigger
            LANGUAGE plpgsql
            AS $$
            BEGIN
              NEW.updated_at := now();
              RETURN NEW;
            END;
            $$;

            CREATE TRIGGER users_set_updated_at
              BEFORE UPDATE ON users
              FOR EACH ROW EXECUTE FUNCTION set_updated_at();
            `,
          note: 'One function can be reused by a trigger on every table that has an updated_at column.',
        },
        {
          title: 'Audit / notify trigger',
          code: c`
            CREATE OR REPLACE FUNCTION notify_order_change()
            RETURNS trigger
            LANGUAGE plpgsql
            AS $$
            BEGIN
              PERFORM pg_notify('order_events', json_build_object('op', TG_OP, 'id', NEW.id)::text);
              RETURN NEW;
            END;
            $$;

            CREATE TRIGGER orders_notify
              AFTER INSERT OR UPDATE ON orders
              FOR EACH ROW EXECUTE FUNCTION notify_order_change();

            DROP TRIGGER orders_notify ON orders;
            `,
        },
        {
          title: 'Procedures and anonymous blocks',
          code: c`
            CREATE OR REPLACE PROCEDURE archive_old_orders()
            LANGUAGE plpgsql
            AS $$
            BEGIN
              INSERT INTO orders_archive SELECT * FROM orders WHERE created_at < now() - interval '1 year';
              DELETE FROM orders WHERE created_at < now() - interval '1 year';
              COMMIT;                           -- procedures may commit
            END;
            $$;
            CALL archive_old_orders();

            DO $$
            BEGIN
              RAISE NOTICE 'users: %', (SELECT count(*) FROM users);
            END;
            $$;
            `,
        },
        {
          title: 'Views and materialized views',
          code: c`
            CREATE OR REPLACE VIEW active_users AS
              SELECT id, email FROM users WHERE deleted_at IS NULL;

            CREATE MATERIALIZED VIEW daily_sales AS
              SELECT date_trunc('day', created_at) AS day, sum(total) AS revenue
              FROM orders GROUP BY 1;

            CREATE UNIQUE INDEX ON daily_sales (day);              -- required for CONCURRENTLY
            REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales;    -- readers are not blocked
            `,
          note: 'A view is a saved query that runs every time; a materialized view stores the result and is only as fresh as its last REFRESH.',
        },
      ],
    },
    {
      id: 'postgresql-indexes',
      title: 'Indexes',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Index types: when to use which',
          lang: 'text',
          code: c`
            B-tree (default)   =, <, >, BETWEEN, ORDER BY, LIKE 'abc%'      almost everything
            GIN                jsonb, arrays, full-text, pg_trgm            "contains" searches
            GiST               ranges, geometry (PostGIS), EXCLUDE, nearest-neighbour
            BRIN               huge append-only tables ordered by time      tiny index, coarse
            Hash               = only                                       rarely better than B-tree
            `,
        },
        {
          title: 'B-tree, composite, partial, expression, covering',
          code: c`
            CREATE INDEX orders_customer_idx ON orders (customer_id);
            CREATE INDEX orders_cust_created ON orders (customer_id, created_at DESC);  -- WHERE customer_id = ? ORDER BY created_at
            CREATE INDEX orders_pending ON orders (created_at) WHERE status = 'pending'; -- partial: small and fast
            CREATE UNIQUE INDEX users_email_lower ON users (lower(email));              -- expression: WHERE lower(email) = ?
            CREATE INDEX orders_cust_cover ON orders (customer_id) INCLUDE (total);     -- index-only scans
            CREATE INDEX events_time_brin ON events USING brin (created_at);
            `,
          note: 'A composite index serves queries on its leftmost columns; put equality columns first, then the range or sort column.',
        },
        {
          title: 'Build and rebuild without blocking writes',
          code: c`
            CREATE INDEX CONCURRENTLY orders_status_idx ON orders (status);
            DROP INDEX CONCURRENTLY orders_status_idx;
            REINDEX INDEX CONCURRENTLY orders_customer_idx;

            -- a failed CONCURRENTLY build leaves an INVALID index: find and drop it
            SELECT indexrelid::regclass FROM pg_index WHERE NOT indisvalid;
            `,
          note: 'CONCURRENTLY cannot run inside a transaction block, so disable the wrapping transaction in your migration tool.',
        },
        {
          title: 'Unused and oversized indexes',
          code: c`
            SELECT relname AS table, indexrelname AS index, idx_scan,
                   pg_size_pretty(pg_relation_size(indexrelid)) AS size
            FROM pg_stat_user_indexes
            ORDER BY idx_scan, pg_relation_size(indexrelid) DESC
            LIMIT 20;
            `,
          note: 'Indexes with idx_scan = 0 since the last stats reset only slow down writes (check replicas too before dropping).',
        },
      ],
    },
    {
      id: 'postgresql-explain',
      title: 'EXPLAIN & query stats',
      group: 'PostgreSQL',
      items: [
        {
          title: 'EXPLAIN (ANALYZE, BUFFERS)',
          code: c`
            EXPLAIN (ANALYZE, BUFFERS)
            SELECT * FROM orders WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 10;

            -- for writes, measure without keeping the changes
            BEGIN;
            EXPLAIN (ANALYZE, BUFFERS) UPDATE orders SET status = 'x' WHERE id = 1;
            ROLLBACK;
            `,
          note: 'ANALYZE really executes the query. EXPLAIN alone only shows the estimated plan.',
        },
        {
          title: 'Reading a plan',
          lang: 'text',
          code: c`
            Limit  (cost=0.43..8.9 rows=10 width=64) (actual time=0.03..0.09 rows=10 loops=1)
              ->  Index Scan using orders_cust_created on orders  (... rows=10 ...)
                    Index Cond: (customer_id = 42)
                    Buffers: shared hit=4
            Planning Time: 0.1 ms
            Execution Time: 0.12 ms

            Read inside-out (deepest node runs first). Look for:
            Seq Scan on a big table + Filter           missing index (fine for small tables)
            rows=10 estimated vs rows=50000 actual     stale stats → ANALYZE the table
            Sort Method: external merge  Disk          work_mem too small for this sort
            Nested Loop with high loops=               join on an unindexed column
            Buffers: shared read= (vs hit=)            pages read from disk, not cache
            Rows Removed by Filter: large              index not selective / not used
            Heap Fetches: high on Index Only Scan      table needs VACUUM (visibility map)
            `,
        },
        {
          title: 'pg_stat_statements: slowest queries',
          code: c`
            -- postgresql.conf (restart required)
            -- shared_preload_libraries = 'pg_stat_statements'

            CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

            SELECT calls,
                   round(total_exec_time::numeric, 0) AS total_ms,
                   round(mean_exec_time::numeric, 2)  AS mean_ms,
                   rows,
                   left(query, 120)                   AS query
            FROM pg_stat_statements
            ORDER BY total_exec_time DESC
            LIMIT 20;

            SELECT pg_stat_statements_reset();
            `,
          note: 'Sort by total_exec_time to find what costs the server most overall, and by mean_exec_time for the slowest single queries.',
        },
        {
          title: 'Log slow queries',
          lang: 'ini',
          code: c`
            # postgresql.conf (reload is enough)
            log_min_duration_statement = 500ms     # log every statement slower than this
            log_lock_waits = on
            auto_explain.log_min_duration = 1s     # needs shared_preload_libraries = 'auto_explain'
            `,
        },
        {
          title: 'Table and database sizes',
          code: c`
            SELECT pg_size_pretty(pg_database_size(current_database()));
            SELECT relname,
                   pg_size_pretty(pg_total_relation_size(relid)) AS total,   -- incl. indexes + TOAST
                   pg_size_pretty(pg_relation_size(relid))       AS table_only
            FROM pg_stat_user_tables
            ORDER BY pg_total_relation_size(relid) DESC LIMIT 10;
            `,
        },
      ],
    },
    {
      id: 'postgresql-activity',
      title: 'Activity, locks & killing queries',
      group: 'PostgreSQL',
      items: [
        {
          title: 'What is running right now',
          code: c`
            SELECT pid, usename, state, wait_event_type, wait_event,
                   now() - query_start AS running_for, left(query, 100) AS query
            FROM pg_stat_activity
            WHERE state <> 'idle' AND pid <> pg_backend_pid()
            ORDER BY query_start;
            `,
        },
        {
          title: 'Cancel or terminate',
          code: c`
            SELECT pg_cancel_backend(12345);       -- stop the current query, keep the connection
            SELECT pg_terminate_backend(12345);    -- close the whole connection

            -- terminate everything running longer than 10 minutes
            SELECT pg_terminate_backend(pid) FROM pg_stat_activity
            WHERE state = 'active' AND now() - query_start > interval '10 minutes' AND pid <> pg_backend_pid();
            `,
        },
        {
          title: 'Who is blocking whom',
          code: c`
            SELECT pid, pg_blocking_pids(pid) AS blocked_by, wait_event_type,
                   now() - query_start AS waiting, left(query, 80) AS query
            FROM pg_stat_activity
            WHERE cardinality(pg_blocking_pids(pid)) > 0;

            SELECT l.locktype, l.mode, l.granted, l.relation::regclass, a.pid, left(a.query, 60)
            FROM pg_locks l JOIN pg_stat_activity a USING (pid)
            WHERE a.pid <> pg_backend_pid();
            `,
        },
        {
          title: 'Guard rails',
          code: c`
            ALTER ROLE app SET statement_timeout = '30s';
            ALTER ROLE app SET idle_in_transaction_session_timeout = '60s';   -- kill forgotten BEGINs
            ALTER ROLE app SET lock_timeout = '10s';
            ALTER ROLE app SET transaction_timeout = '5min';                  -- new in 17
            `,
          note: '"idle in transaction" sessions hold locks and block vacuum; a timeout is the cheapest fix.',
        },
      ],
    },
    {
      id: 'postgresql-vacuum',
      title: 'VACUUM, autovacuum & bloat',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Why vacuum exists',
          note: 'UPDATE and DELETE leave dead row versions behind (MVCC). Autovacuum reclaims that space for reuse and ANALYZE refreshes planner statistics; leave autovacuum on.',
        },
        {
          title: 'Manual commands',
          code: c`
            VACUUM (VERBOSE, ANALYZE) orders;    -- reclaim dead rows + update stats, no blocking
            ANALYZE orders;                       -- stats only (run after big imports)
            VACUUM FULL orders;                   -- rewrites the table, returns disk to the OS, LOCKS it
            `,
          note: 'VACUUM FULL blocks all access to the table; pg_repack (extension) does the same rewrite online.',
          then: [
            {
              label: 'Whole database from the shell',
              lang: 'bash',
              code: c`
                vacuumdb -U postgres --all --analyze-in-stages -j 4    # e.g. after pg_upgrade
                `,
            },
          ],
        },
        {
          title: 'Dead rows and last autovacuum per table',
          code: c`
            SELECT relname, n_live_tup, n_dead_tup,
                   round(100.0 * n_dead_tup / nullif(n_live_tup + n_dead_tup, 0), 1) AS dead_pct,
                   last_autovacuum, last_autoanalyze
            FROM pg_stat_user_tables
            ORDER BY n_dead_tup DESC LIMIT 15;
            `,
        },
        {
          title: 'Tune autovacuum for a hot table',
          code: c`
            ALTER TABLE events SET (
              autovacuum_vacuum_scale_factor = 0.02,     -- default 0.2 = 20% of rows must be dead
              autovacuum_analyze_scale_factor = 0.01
            );
            `,
          note: 'Large tables need lower scale factors; otherwise autovacuum waits until millions of rows are dead.',
        },
        {
          title: 'Transaction ID wraparound check',
          code: c`
            SELECT datname, age(datfrozenxid) FROM pg_database ORDER BY 2 DESC;
            `,
          note: 'Values approaching 2 billion are an emergency; healthy autovacuum keeps them far lower (alerts around 500 million are common).',
        },
      ],
    },
    {
      id: 'postgresql-tuning',
      title: 'Settings & connection pooling',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Key settings (starting points)',
          lang: 'ini',
          code: c`
            # postgresql.conf — example for a dedicated 16 GB server
            max_connections = 100              # keep low; use a pooler for many clients (restart)
            shared_buffers = 4GB               # ~25% of RAM (restart)
            effective_cache_size = 12GB        # ~75% of RAM; planner hint only
            work_mem = 32MB                    # per sort / hash, per query node — multiply carefully
            maintenance_work_mem = 1GB         # VACUUM, CREATE INDEX
            random_page_cost = 1.1             # SSD storage (default 4 assumes spinning disks)
            wal_compression = on
            `,
          note: 'pgtune.leopard.in.ua generates a full config from RAM, CPU and workload. Check current values with SHOW or the pg_settings view.',
        },
        {
          title: 'PgBouncer in front of PostgreSQL',
          lang: 'ini',
          code: c`
            ; /etc/pgbouncer/pgbouncer.ini
            [databases]
            app = host=127.0.0.1 port=5432 dbname=app

            [pgbouncer]
            listen_addr = 0.0.0.0
            listen_port = 6432
            auth_type = scram-sha-256
            auth_file = /etc/pgbouncer/userlist.txt
            pool_mode = transaction
            default_pool_size = 20
            max_client_conn = 1000
            max_prepared_statements = 100     ; 1.21+: protocol-level prepared statements in transaction mode
            `,
          note: 'Apps connect to port 6432. In transaction mode a client only owns a server connection during a transaction, so session state (SET, session advisory locks, LISTEN, temp tables) does not survive between transactions.',
          then: [
            {
              label: 'Install',
              lang: 'bash',
              code: c`
                # Linux (Ubuntu / Debian)
                sudo apt install -y pgbouncer
                sudo systemctl enable --now pgbouncer

                # macOS
                brew install pgbouncer

                # Docker (any OS, incl. Windows)
                docker run -d --name pgbouncer -p 6432:6432 -e DATABASE_URL="postgres://app:secret@host.docker.internal:5432/app" edoburu/pgbouncer
                `,
            },
          ],
        },
        {
          title: 'How many connections are in use',
          code: c`
            SELECT count(*), state FROM pg_stat_activity GROUP BY state;
            SHOW max_connections;
            `,
        },
      ],
    },
    {
      id: 'postgresql-backup',
      title: 'pg_dump & pg_restore',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Custom-format dump + restore (recommended)',
          lang: 'bash',
          code: c`
            # dump (same on every OS; -f works in PowerShell too)
            pg_dump -h localhost -U app -d app -Fc -f app.dump

            # restore into an existing (empty) database, 4 parallel jobs
            pg_restore -h localhost -U app -d app -j 4 --no-owner app.dump

            # restore over an existing database: drop objects first
            pg_restore -h localhost -U app -d app --clean --if-exists --no-owner app.dump

            # create the database from the dump (connect to postgres first)
            pg_restore -h localhost -U postgres -d postgres --create app.dump
            `,
          note: '-Fc is compressed and lets pg_restore pick tables, reorder and run in parallel. --no-owner avoids errors when role names differ between servers.',
        },
        {
          title: 'Plain SQL dump',
          lang: 'bash',
          code: c`
            pg_dump -U app -d app -f app.sql                 # whole database as SQL
            pg_dump -U app -d app --schema-only -f schema.sql
            pg_dump -U app -d app --data-only -t users -f users.sql

            # restore — macOS / Linux
            psql -U app -d app -v ON_ERROR_STOP=1 < app.sql

            # restore — Windows (PowerShell has no "<" redirection)
            psql -U app -d app -v ON_ERROR_STOP=1 -f app.sql
            `,
        },
        {
          title: 'Roles and the whole cluster',
          lang: 'bash',
          code: c`
            pg_dumpall -U postgres --globals-only -f globals.sql   # roles + tablespaces (pg_dump skips them)
            pg_dumpall -U postgres -f cluster.sql                   # every database, plain SQL

            # Linux, as the postgres OS user
            sudo -u postgres pg_dumpall --globals-only > globals.sql
            `,
        },
        {
          title: 'Docker',
          lang: 'bash',
          code: c`
            docker exec pg pg_dump -U app -Fc app > app.dump
            docker exec -i pg pg_restore -U app -d app --clean --if-exists < app.dump
            `,
          note: 'In PowerShell, binary data through ">" can be corrupted in Windows PowerShell 5; use docker cp to copy the dump file instead.',
          then: [
            {
              label: 'Windows (PowerShell) safe variant',
              lang: 'powershell',
              code: c`
                docker exec pg pg_dump -U app -Fc -f /tmp/app.dump app
                docker cp pg:/tmp/app.dump .\app.dump
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'postgresql-passwords-cron',
      title: 'Passwords for scripts & scheduled backups',
      group: 'PostgreSQL',
      items: [
        {
          title: 'PGPASSWORD (one-off)',
          lang: 'bash',
          code: c`
            # macOS / Linux
            PGPASSWORD=secret pg_dump -h localhost -U app -Fc -f app.dump app

            # Windows (PowerShell)
            $env:PGPASSWORD = "secret"
            pg_dump -h localhost -U app -Fc -f app.dump app
            Remove-Item Env:PGPASSWORD
            `,
          note: 'Environment variables can be visible to other processes; prefer a .pgpass file for anything scheduled.',
        },
        {
          title: '.pgpass file',
          lang: 'bash',
          code: c`
            # format: hostname:port:database:username:password  (* = any)
            # macOS / Linux: ~/.pgpass, must be private
            echo "localhost:5432:app:app:secret" >> ~/.pgpass
            chmod 600 ~/.pgpass

            # Windows (PowerShell): %APPDATA%\postgresql\pgpass.conf
            New-Item -ItemType Directory -Force "$env:APPDATA\postgresql" | Out-Null
            Add-Content "$env:APPDATA\postgresql\pgpass.conf" "localhost:5432:app:app:secret"
            `,
        },
        {
          title: 'Nightly backup with cron (Linux / macOS)',
          lang: 'bash',
          code: c`
            #!/usr/bin/env bash
            # /usr/local/bin/pg-backup.sh
            set -euo pipefail
            DIR=/var/backups/postgres
            mkdir -p "$DIR"
            pg_dump -h localhost -U app -Fc -f "$DIR/app-$(date +%F).dump" app
            find "$DIR" -name 'app-*.dump' -mtime +14 -delete     # keep 14 days

            # crontab -e  (runs at 02:30 every day)
            30 2 * * * /usr/local/bin/pg-backup.sh >> /var/log/pg-backup.log 2>&1
            `,
          note: 'A backup you have never restored is not a backup; restore into a scratch database regularly and copy dumps off the server (e.g. to S3).',
          then: [
            {
              label: 'Windows: Task Scheduler (PowerShell as Administrator)',
              lang: 'powershell',
              code: c`
                $action = New-ScheduledTaskAction -Execute "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" ${BT}
                  -Argument "-h localhost -U app -Fc -f C:\backups\app.dump app"
                $trigger = New-ScheduledTaskTrigger -Daily -At 2:30am
                Register-ScheduledTask -TaskName "pg-backup" -Action $action -Trigger $trigger
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'postgresql-pitr-upgrade',
      title: 'Point-in-time recovery & upgrades',
      group: 'PostgreSQL',
      items: [
        {
          title: 'PITR overview',
          lang: 'ini',
          code: c`
            # postgresql.conf on the primary (restart)
            wal_level = replica
            archive_mode = on
            archive_command = 'test ! -f /mnt/wal-archive/%f && cp %p /mnt/wal-archive/%f'
            `,
          note: 'A base backup plus every archived WAL file lets you restore to any moment, e.g. one second before a bad DELETE. Tools like pgBackRest or Barman manage this for you.',
          then: [
            {
              label: 'Base backup (17 also supports --incremental)',
              lang: 'bash',
              code: c`
                pg_basebackup -h db1 -U replicator -D /backups/base-$(date +%F) -Ft -z -X stream -P
                `,
            },
            {
              label: 'Restore to a point in time',
              lang: 'ini',
              code: c`
                # 1. stop the server, replace the data directory with the base backup
                # 2. postgresql.conf:
                restore_command = 'cp /mnt/wal-archive/%f %p'
                recovery_target_time = '2026-10-17 14:05:00+00'
                recovery_target_action = 'promote'
                # 3. create an empty file named recovery.signal in the data directory, then start
                `,
            },
          ],
        },
        {
          title: 'Major upgrade: dump and restore',
          lang: 'bash',
          code: c`
            # simplest and works across machines; downtime grows with database size
            pg_dumpall -U postgres --globals-only -f globals.sql
            pg_dump -U postgres -Fc -f app.dump app
            # on the 17 server:
            psql -U postgres -f globals.sql
            pg_restore -U postgres -d postgres --create -j 4 app.dump
            `,
        },
        {
          title: 'Major upgrade: pg_upgrade (in place, fast)',
          lang: 'bash',
          code: c`
            # Linux (Ubuntu / Debian) wrapper: upgrades cluster 16/main to the newest installed version
            sudo apt install -y postgresql-17
            sudo pg_dropcluster 17 main --stop        # remove the empty cluster the package created
            sudo pg_upgradecluster 16 main
            sudo pg_dropcluster 16 main               # after checking 17 works

            # generic (run as the postgres user, both servers stopped)
            pg_upgrade -b /usr/lib/postgresql/16/bin -B /usr/lib/postgresql/17/bin \
              -d /var/lib/postgresql/16/main -D /var/lib/postgresql/17/main --link --check
            # drop --check to run it for real, then: vacuumdb --all --analyze-in-stages
            `,
          note: 'Homebrew and Windows installs use the same pg_upgrade with their own bin and data paths. Docker volumes are easiest to upgrade by dump and restore.',
        },
      ],
    },
    {
      id: 'postgresql-replication',
      title: 'Replication & high availability',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Streaming replication (physical read replica)',
          lang: 'bash',
          code: c`
            # primary: a replication role + pg_hba.conf entry
            psql -U postgres -c "CREATE ROLE replicator REPLICATION LOGIN PASSWORD 'secret'"
            # pg_hba.conf:  host  replication  replicator  10.0.0.12/32  scram-sha-256

            # replica (Linux): empty data dir, clone the primary, -R writes the standby config
            sudo systemctl stop postgresql
            sudo rm -rf /var/lib/postgresql/17/main
            sudo -u postgres pg_basebackup -h 10.0.0.11 -U replicator -D /var/lib/postgresql/17/main -R -X stream -P
            sudo systemctl start postgresql
            `,
          note: 'The replica is a read-only byte-for-byte copy of the whole cluster. Promote it with SELECT pg_promote(); when the primary is lost.',
        },
        {
          title: 'Check replication health',
          code: c`
            -- on the primary
            SELECT client_addr, state, sync_state, replay_lag FROM pg_stat_replication;

            -- on the replica
            SELECT pg_is_in_recovery(), now() - pg_last_xact_replay_timestamp() AS lag;
            `,
        },
        {
          title: 'Logical replication (selected tables)',
          code: c`
            -- publisher: postgresql.conf wal_level = logical (restart)
            CREATE PUBLICATION app_pub FOR TABLE users, orders;    -- or FOR ALL TABLES

            -- subscriber: create the same tables first (pg_dump --schema-only)
            CREATE SUBSCRIPTION app_sub
              CONNECTION 'host=10.0.0.11 dbname=app user=replicator password=secret'
              PUBLICATION app_pub;

            SELECT * FROM pg_stat_subscription;
            `,
          note: 'Logical replication copies row changes, so it works across major versions; it is a common way to upgrade with near-zero downtime. It does not replicate DDL or sequences.',
        },
        {
          title: 'High availability options',
          note: 'Managed services (RDS / Aurora, Cloud SQL, Azure Flexible Server) offer one-click standby failover and read replicas. Self-hosted, Patroni with etcd is the usual automatic-failover setup.',
        },
      ],
    },
    {
      id: 'postgresql-connect-apps',
      title: 'Connecting from apps',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Connection URL format',
          lang: 'text',
          code: c`
            postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require&application_name=web

            postgresql://app:p%40ss@localhost/app          # URL-encode special chars (@ → %40)
            postgresql:///app?host=/var/run/postgresql      # Unix socket
            `,
          note: 'Most libraries also read the standard libpq variables PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD and PGSSLMODE.',
        },
        {
          title: 'Laravel',
          lang: 'env',
          code: c`
            DB_CONNECTION=pgsql
            DB_HOST=127.0.0.1
            DB_PORT=5432
            DB_DATABASE=app
            DB_USERNAME=app
            DB_PASSWORD=change-me
            DB_SSLMODE=prefer          # require / verify-full in production
            `,
          note: 'Needs the pdo_pgsql PHP extension. Schema search_path and sslmode are set in the pgsql block of config/database.php.',
          then: [
            {
              label: 'config/database.php (pgsql block)',
              lang: 'php',
              code: c`
                'search_path' => env('DB_SCHEMA', 'public'),
                'sslmode' => env('DB_SSLMODE', 'prefer'),
                `,
            },
            {
              label: 'Install the PHP extension',
              lang: 'bash',
              code: c`
                # Linux (Ubuntu / Debian)
                sudo apt install -y php8.3-pgsql

                # macOS (Homebrew PHP includes pdo_pgsql)
                php -m | grep pgsql

                # Windows: in php.ini uncomment
                # extension=pdo_pgsql
                # extension=pgsql
                `,
            },
          ],
        },
        {
          title: 'PHP PDO',
          lang: 'php',
          code: c`
            $pdo = new PDO(
                'pgsql:host=localhost;port=5432;dbname=app;sslmode=prefer',
                'app',
                getenv('DB_PASSWORD'),
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
            $stmt->execute(['email' => $email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // id of the new row
            $id = $pdo->query("INSERT INTO users (email) VALUES ('a@b.c') RETURNING id")->fetchColumn();
            `,
        },
        {
          title: 'Node: pg Pool',
          lang: 'js',
          code: c`
            // npm install pg
            import pg from 'pg'

            const pool = new pg.Pool({
              connectionString: process.env.DATABASE_URL,
              max: 10,
              ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
            })

            // always parameterize: $1, $2 ... never concatenate user input
            const { rows } = await pool.query(
              'SELECT id, email FROM users WHERE email = $1 AND active = $2',
              [email, true],
            )

            // transaction on one client
            const client = await pool.connect()
            try {
              await client.query('BEGIN')
              await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [100, 1])
              await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [100, 2])
              await client.query('COMMIT')
            } catch (err) {
              await client.query('ROLLBACK')
              throw err
            } finally {
              client.release()
            }
            `,
          note: 'bigint and numeric come back as strings by default so no precision is lost.',
          then: [
            {
              label: 'Sequelize',
              lang: 'js',
              code: c`
                // npm install sequelize pg pg-hstore
                import { Sequelize } from 'sequelize'

                const sequelize = new Sequelize(process.env.DATABASE_URL, {
                  dialect: 'postgres',
                  logging: false,
                  dialectOptions: { ssl: { require: true, rejectUnauthorized: true } },  // managed DBs
                })
                await sequelize.authenticate()
                `,
            },
          ],
        },
        {
          title: 'Python: psycopg 3',
          lang: 'python',
          code: c`
            # pip install "psycopg[binary,pool]"
            import os
            import psycopg

            with psycopg.connect(os.environ["DATABASE_URL"]) as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT id, email FROM users WHERE email = %s", (email,))
                    row = cur.fetchone()
                    cur.execute("INSERT INTO users (email) VALUES (%s) RETURNING id", ("a@b.c",))
                    new_id = cur.fetchone()[0]
            # leaving the "with conn" block commits (or rolls back on exception)
            `,
          note: 'psycopg uses %s placeholders, not $1; never build SQL with f-strings.',
          then: [
            {
              label: 'Django settings.py',
              lang: 'python',
              code: c`
                DATABASES = {
                    "default": {
                        "ENGINE": "django.db.backends.postgresql",
                        "NAME": "app",
                        "USER": "app",
                        "PASSWORD": os.environ["DB_PASSWORD"],
                        "HOST": "localhost",
                        "PORT": "5432",
                        "CONN_MAX_AGE": 60,
                        "OPTIONS": {"sslmode": "prefer"},
                    }
                }
                `,
            },
            {
              label: 'SQLAlchemy',
              lang: 'python',
              code: c`
                from sqlalchemy import create_engine, text

                engine = create_engine("postgresql+psycopg://app:change-me@localhost:5432/app", pool_pre_ping=True)
                with engine.connect() as conn:
                    rows = conn.execute(text("SELECT * FROM users WHERE id = :id"), {"id": 1}).all()
                `,
            },
          ],
        },
        {
          title: 'Managed PostgreSQL',
          lang: 'text',
          code: c`
            AWS RDS / Aurora
              host: mydb.abc123.us-east-1.rds.amazonaws.com   SSL forced by default (rds.force_ssl = 1 on 15+)
              CA:   https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
              URL:  postgresql://app:pw@HOST:5432/app?sslmode=verify-full&sslrootcert=global-bundle.pem

            GCP Cloud SQL
              connect via the Cloud SQL Auth Proxy (TLS + IAM), then use host 127.0.0.1
              cloud-sql-proxy my-project:us-central1:mydb --port 5432
              Cloud Run: unix socket /cloudsql/my-project:us-central1:mydb

            Azure Database for PostgreSQL – Flexible Server
              host: mydb.postgres.database.azure.com          require_secure_transport = on
              user: plain "app" (not app@server like the old Single Server)
              URL:  postgresql://app:pw@HOST:5432/app?sslmode=require
            `,
          note: 'You get no superuser on managed services; extensions are enabled per server (e.g. shared_preload_libraries via parameter groups / flags / server parameters).',
        },
      ],
    },
    {
      id: 'postgresql-troubleshooting',
      title: 'Common errors',
      group: 'PostgreSQL',
      items: [
        {
          title: 'Error → cause → fix',
          lang: 'text',
          code: c`
            Peer authentication failed for user "app"
              → local socket uses peer auth      → add -h localhost, or change pg_hba.conf "local" line to scram-sha-256
            password authentication failed for user "app"
              → wrong password / role missing    → ALTER ROLE app PASSWORD '...'; check \du and the URL encoding
            connection refused  (is the server running ... port 5432?)
              → service down or not listening    → start service; listen_addresses = '*'; firewall; right port (pg_lsclusters)
            no pg_hba.conf entry for host "1.2.3.4", user "app", database "app", no encryption
              → client IP not allowed            → add a host / hostssl line, then SELECT pg_reload_conf();
            permission denied for schema public
              → PostgreSQL 15+ default           → ALTER DATABASE app OWNER TO app;  or GRANT CREATE ON SCHEMA public TO app;
            permission denied for table users
              → missing GRANT                    → GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app;
            sorry, too many clients already / remaining connection slots are reserved
              → max_connections reached          → use a pool (PgBouncer, smaller app pools); find idle sessions in pg_stat_activity
            deadlock detected
              → two transactions lock rows in opposite order → lock in a consistent order (ORDER BY id FOR UPDATE); retry
            relation "Users" does not exist
              → quoted identifiers are case-sensitive / wrong schema → use lowercase names; SHOW search_path; schema.table
            could not serialize access due to concurrent update
              → REPEATABLE READ / SERIALIZABLE conflict (40001) → retry the whole transaction
            could not extend file / No space left on device
              → disk full (data, WAL or logs)    → free space, check bloat + VACUUM, failing archive_command or stale replication slot
            `,
        },
        {
          title: 'Identifier case trap',
          code: c`
            CREATE TABLE "Users" (id int);   -- created with quotes: name is exactly Users
            SELECT * FROM Users;             -- ERROR: unquoted names fold to lowercase → users
            SELECT * FROM "Users";           -- works
            ALTER TABLE "Users" RENAME TO users;   -- fix it once
            `,
          note: 'ORMs and GUI tools sometimes create mixed-case quoted names; stick to snake_case lowercase.',
        },
        {
          title: 'WAL piling up: stale replication slots',
          code: c`
            SELECT slot_name, active, pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS retained
            FROM pg_replication_slots;
            SELECT pg_drop_replication_slot('old_slot');    -- only if nothing uses it any more
            `,
        },
        {
          title: 'Read the server log',
          lang: 'bash',
          code: c`
            # Linux (Ubuntu / Debian)
            sudo tail -f /var/log/postgresql/postgresql-17-main.log
            sudo journalctl -u postgresql -f

            # macOS (Homebrew)
            tail -f /opt/homebrew/var/log/postgresql@17.log

            # Windows (PowerShell)
            Get-ChildItem "C:\Program Files\PostgreSQL\17\data\log" | Sort-Object LastWriteTime | Select-Object -Last 1 | Get-Content -Wait

            # Docker
            docker logs -f pg
            `,
        },
      ],
    },
  ],
}
