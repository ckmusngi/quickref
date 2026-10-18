import { c } from './shared/code.js'

export default {
  slug: 'mysql',
  title: 'MySQL',
  tech: 'MySQL',
  category: 'backend',
  minutes: 45,
  lang: 'sql',
  description: 'MySQL 8.4 LTS beyond plain SQL: installing and configuring the server, users and roles, InnoDB tables and data types, indexes and EXPLAIN, MySQL-only syntax (upserts, JSON, full-text, locking reads), backups, replication, connecting from Laravel / Node / Python / PHP and fixing common errors.',
  sections: [
    {
      id: 'project-setup',
      title: 'Install & connect, step by step',
      group: 'Setup',
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
      id: 'config',
      title: 'Configuration file (my.cnf / my.ini)',
      group: 'Setup',
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
      id: 'users',
      title: 'Users, privileges & roles',
      group: 'Users & security',
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
      id: 'remote',
      title: 'Remote access & TLS',
      group: 'Users & security',
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
      id: 'databases',
      title: 'Databases, charset & engine',
      group: 'Databases & tables',
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
      id: 'types',
      title: 'Data types cheat table',
      group: 'Databases & tables',
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
      id: 'tables',
      title: 'Create & inspect tables',
      group: 'Databases & tables',
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
      id: 'alter',
      title: 'Changing tables (ALTER TABLE)',
      group: 'Databases & tables',
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
      id: 'indexes',
      title: 'Index types',
      group: 'Indexes & performance',
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
      id: 'explain',
      title: 'EXPLAIN & EXPLAIN ANALYZE',
      group: 'Indexes & performance',
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
      id: 'monitoring',
      title: 'Slow queries & monitoring',
      group: 'Indexes & performance',
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
      id: 'upserts',
      title: 'Upserts & MySQL-only DML',
      group: 'MySQL-specific SQL',
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
      id: 'json',
      title: 'JSON columns',
      group: 'MySQL-specific SQL',
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
      id: 'fulltext',
      title: 'Full-text search',
      group: 'MySQL-specific SQL',
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
      id: 'cte-vars',
      title: 'Window functions, CTEs & variables',
      group: 'MySQL-specific SQL',
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
      id: 'transactions',
      title: 'Transactions & locking',
      group: 'MySQL-specific SQL',
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
      id: 'backup',
      title: 'Backup & restore',
      group: 'Backup & restore',
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
      id: 'replication',
      title: 'Replication (source / replica with GTID)',
      group: 'Replication & HA',
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
      id: 'apps',
      title: 'Connecting from apps',
      group: 'Connecting from apps',
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
      id: 'managed',
      title: 'Managed MySQL in the cloud',
      group: 'Connecting from apps',
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
      id: 'troubleshooting',
      title: 'Common errors & fixes',
      group: 'Troubleshooting',
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
  ],
}
