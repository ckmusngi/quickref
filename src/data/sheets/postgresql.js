import { c, BT } from './shared/code.js'

export default {
  slug: 'postgresql',
  title: 'PostgreSQL',
  tech: 'PostgreSQL',
  category: 'backend',
  minutes: 45,
  lang: 'sql',
  description: 'PostgreSQL 17 beyond generic SQL: install and psql on every OS, roles and row-level security, types like jsonb and timestamptz, upserts, MERGE, full-text search, indexes and EXPLAIN, vacuum and monitoring, backups, replication, connecting from apps and fixing common errors.',
  sections: [
    // ───────────────────────────── Setup ─────────────────────────────
    {
      id: 'install',
      title: 'Install & run PostgreSQL 17',
      group: 'Setup',
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
      id: 'first-connection',
      title: 'First connection, app user & database',
      group: 'Setup',
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
      id: 'config-files',
      title: 'Config files & remote access',
      group: 'Setup',
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
      id: 'psql',
      title: 'psql cheat list',
      group: 'Setup',
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

    // ───────────────────────── Roles & security ─────────────────────────
    {
      id: 'roles',
      title: 'Roles & privileges',
      group: 'Roles & security',
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
      id: 'rls',
      title: 'Row-level security & SSL',
      group: 'Roles & security',
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

    // ───────────────────────── Data types & schema ─────────────────────────
    {
      id: 'types',
      title: 'Data types',
      group: 'Data types & schema',
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
      id: 'schema-design',
      title: 'Schemas, constraints & ALTER TABLE',
      group: 'Data types & schema',
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

    // ───────────────────────── PostgreSQL-specific SQL ─────────────────────────
    {
      id: 'writes',
      title: 'Upsert, RETURNING, MERGE',
      group: 'PostgreSQL SQL',
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
      id: 'pg-queries',
      title: 'Query features',
      group: 'PostgreSQL SQL',
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
      id: 'jsonb',
      title: 'jsonb',
      group: 'PostgreSQL SQL',
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
      id: 'fts',
      title: 'Full-text search',
      group: 'PostgreSQL SQL',
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
      id: 'concurrency',
      title: 'Job queues, locks & LISTEN/NOTIFY',
      group: 'PostgreSQL SQL',
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
      id: 'plpgsql',
      title: 'Functions, triggers & views',
      group: 'PostgreSQL SQL',
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

    // ───────────────────────── Indexes & performance ─────────────────────────
    {
      id: 'indexes',
      title: 'Indexes',
      group: 'Indexes & performance',
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
      id: 'explain',
      title: 'EXPLAIN & query stats',
      group: 'Indexes & performance',
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
      id: 'activity',
      title: 'Activity, locks & killing queries',
      group: 'Indexes & performance',
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
      id: 'vacuum',
      title: 'VACUUM, autovacuum & bloat',
      group: 'Indexes & performance',
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
      id: 'tuning',
      title: 'Settings & connection pooling',
      group: 'Indexes & performance',
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

    // ───────────────────────── Backup & restore ─────────────────────────
    {
      id: 'backup',
      title: 'pg_dump & pg_restore',
      group: 'Backup & restore',
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
      id: 'passwords-cron',
      title: 'Passwords for scripts & scheduled backups',
      group: 'Backup & restore',
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
      id: 'pitr-upgrade',
      title: 'Point-in-time recovery & upgrades',
      group: 'Backup & restore',
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

    // ───────────────────────── Replication & HA ─────────────────────────
    {
      id: 'replication',
      title: 'Replication & high availability',
      group: 'Replication & HA',
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

    // ───────────────────────── Connecting from apps ─────────────────────────
    {
      id: 'connect-apps',
      title: 'Connecting from apps',
      group: 'Connecting from apps',
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

    // ───────────────────────── Troubleshooting ─────────────────────────
    {
      id: 'troubleshooting',
      title: 'Common errors',
      group: 'Troubleshooting',
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
