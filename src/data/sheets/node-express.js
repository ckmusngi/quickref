import { c, BT } from './shared/code.js'

export default {
  slug: 'node-express',
  title: 'Node',
  tech: 'Node',
  category: 'backend',
  minutes: 55,
  lang: 'js',
  description: 'Node versions, npm, built-in modules, REST APIs with Express, databases with Sequelize, and authentication with JWT access + refresh tokens, roles, cookies and sessions.',
  sections: [
    {
      id: 'project-setup',
      title: 'Project setup, step by step',
      group: 'Setup',
      items: [
        {
          title: '1. Install Node.js (with a version manager)',
          lang: 'bash',
          code: c`
            # macOS / Linux — nvm
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
            # restart the terminal, then:
            nvm install --lts
            nvm use --lts

            # Windows (PowerShell) — fnm (works like nvm)
            winget install -e --id Schniz.fnm
            fnm env --use-on-cd | Out-String | Invoke-Expression     # add this line to your $PROFILE
            fnm install --lts
            fnm use lts-latest

            # Windows alternative: nvm-windows → winget install -e --id CoreyButler.NVMforWindows
            #   nvm install lts  &&  nvm use lts       (run as Administrator)

            node -v && npm -v
            `,
        },
        {
          title: '2. Create the project',
          lang: 'bash',
          code: c`
            mkdir my-api && cd my-api
            npm init -y
            npm pkg set type=module
            npm i express
            npm i -D nodemon
            `,
        },
        {
          title: '3. Pin the Node version',
          lang: 'bash',
          code: c`
            # macOS / Linux
            echo "24" > .nvmrc
            nvm use

            # Windows (PowerShell)
            Set-Content .nvmrc "24"
            fnm use          # fnm reads .nvmrc / .node-version too
            `,
        },
        {
          title: '4. .env and .gitignore',
          lang: 'bash',
          code: c`
            # macOS / Linux
            printf "PORT=3000\nDB_HOST=127.0.0.1\nDB_USER=root\nDB_PASSWORD=\nDB_NAME=my_api\n" > .env
            printf "node_modules\n.env\ndist\n" > .gitignore

            # Windows (PowerShell)
            "PORT=3000","DB_HOST=127.0.0.1","DB_USER=root","DB_PASSWORD=","DB_NAME=my_api" | Set-Content .env
            "node_modules",".env","dist" | Set-Content .gitignore
            `,
        },
        {
          title: '5. First server',
          code: c`
            // src/server.js
            import express from 'express'

            const app = express()
            app.use(express.json())

            app.get('/health', (req, res) => res.json({ ok: true }))

            const port = process.env.PORT ?? 3000
            app.listen(port, () => console.log('API on http://localhost:' + port))
            `,
        },
        {
          title: '6. Scripts',
          lang: 'json',
          code: c`
            {
              "type": "module",
              "scripts": {
                "dev": "nodemon --env-file=.env src/server.js",
                "start": "node --env-file=.env src/server.js"
              }
            }
            `,
          note: 'Or skip nodemon and use Node\'s built-in watch mode:',
          then: [
            {
              label: 'Without nodemon',
              lang: 'json',
              code: c`
                "dev": "node --watch --env-file=.env src/server.js"
                `,
            },
          ],
        },
        {
          title: '7. Run and test it',
          lang: 'bash',
          code: c`
            npm run dev

            # in another terminal
            curl http://localhost:3000/health                      # macOS / Linux / Windows cmd
            curl.exe http://localhost:3000/health                  # Windows PowerShell 5 (curl is an alias there)
            Invoke-RestMethod http://localhost:3000/health         # Windows PowerShell
            `,
        },
        {
          title: '8. Grow the structure',
          lang: 'text',
          code: c`
            src/
              server.js        # starts the app
              app.js           # express(), middleware, routes
              routes/          # products.js, auth.js ...
              controllers/
              services/        # business logic
              models/          # Sequelize models (see the Sequelize group)
              middleware/
              db/              # Sequelize config, migrations, seeders
            tests/
            `,
        },
      ],
    },
    {
      id: 'versions',
      title: 'Versions',
      group: 'Node & npm',
      items: [
        {
          title: 'Semver ranges',
          lang: 'text',
          code: c`
            ^1.4.2  → >=1.4.2 <2.0.0
            ~1.4.2  → >=1.4.2 <1.5.0
            1.4.2   → exactly 1.4.2
            `,
        },
        {
          title: 'Bump & publish',
          lang: 'bash',
          code: c`
            npm version patch   # or minor / major
            npm publish --access public
            `,
        },
      ],
    },
    {
      id: 'packages',
      title: 'Packages',
      group: 'Node & npm',
      items: [
        {
          title: 'Install',
          lang: 'bash',
          code: c`
            npm install            # from package.json
            npm ci                 # clean, exact install for CI
            npm i express
            npm i -D vitest
            `,
        },
        {
          title: 'Remove & update',
          lang: 'bash',
          code: c`
            npm uninstall express
            npm outdated
            npm update
            `,
        },
        {
          title: 'Inspect',
          lang: 'bash',
          code: c`
            npm ls --depth=0
            npm view express versions --json
            npm why lodash
            `,
        },
        {
          title: 'Security',
          lang: 'bash',
          code: c`
            npm audit
            npm audit fix
            `,
        },
      ],
    },
    {
      id: 'scripts',
      title: 'Scripts',
      group: 'Node & npm',
      items: [
        {
          title: 'Define scripts',
          lang: 'json',
          code: c`
            {
              "scripts": {
                "dev": "node --watch server.js",
                "test": "vitest run",
                "lint": "eslint ."
              }
            }
            `,
        },
        {
          title: 'Run scripts',
          lang: 'bash',
          code: c`
            npm run dev
            npm test
            npm run lint -- --fix   # pass args after --
            `,
        },
        {
          title: 'One-off tools',
          lang: 'bash',
          code: c`
            npx create-vite@latest my-app
            npx serve dist
            `,
        },
      ],
    },
    {
      id: 'node',
      title: 'Node built-ins',
      group: 'Node & npm',
      items: [
        {
          title: 'Environment variables',
          lang: 'js',
          code: c`
            node --env-file=.env server.js

            const port = process.env.PORT ?? 3000
            `,
          note: '--env-file works the same on every OS (Node 20.6+).',
        },
        {
          title: 'Set a variable for one command',
          lang: 'bash',
          code: c`
            # macOS / Linux
            PORT=4000 NODE_ENV=production node server.js

            # Windows — PowerShell
            $env:PORT = 4000; $env:NODE_ENV = "production"; node server.js

            # Windows — cmd
            set PORT=4000 && set NODE_ENV=production && node server.js
            `,
        },
        {
          title: 'Cross-platform npm scripts',
          lang: 'json',
          code: c`
            {
              "scripts": {
                "start": "cross-env NODE_ENV=production node server.js",
                "clean": "rimraf dist"
              }
            }
            `,
          note: '"NODE_ENV=production node ..." and "rm -rf" in scripts break on Windows. These two packages work everywhere:',
          then: [
            {
              label: 'Install',
              lang: 'bash',
              code: c`
                npm i -D cross-env rimraf
                `,
            },
          ],
        },
        {
          title: 'Read & write files',
          lang: 'js',
          code: c`
            import { readFile, writeFile } from 'node:fs/promises'

            const raw = await readFile('data.json', 'utf8')
            await writeFile('out.json', JSON.stringify(JSON.parse(raw), null, 2))
            `,
        },
        {
          title: 'Paths',
          lang: 'js',
          code: c`
            import path from 'node:path'

            const file = path.join(import.meta.dirname, 'templates', 'invoice.html')
            `,
        },
        {
          title: 'Minimal HTTP server',
          lang: 'js',
          code: c`
            import http from 'node:http'

            http.createServer((req, res) => {
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: true }))
            }).listen(3000)
            `,
        },
        {
          title: 'Built-in test runner',
          lang: 'js',
          code: c`
            import { test } from 'node:test'
            import assert from 'node:assert/strict'

            test('adds', () => assert.equal(1 + 1, 2))
            `,
          note: 'Run with: node --test',
        },
      ],
    },
    {
      id: 'runtime',
      title: 'Runtime essentials',
      group: 'Node & npm',
      items: [
        {
          title: 'Calling other APIs',
          code: c`
            const res = await fetch('https://api.example.com/rates', {
              headers: { Authorization: ${BT}Bearer ${'${'}token}${BT} },
              signal: AbortSignal.timeout(10_000),
            })
            if (!res.ok) throw new Error(${BT}Upstream ${'${'}res.status}${BT})
            const data = await res.json()
            `,
        },
        {
          title: 'Stream a large file',
          code: c`
            import { createReadStream } from 'node:fs'
            import { pipeline } from 'node:stream/promises'

            app.get('/export', async (req, res) => {
              res.setHeader('Content-Type', 'text/csv')
              await pipeline(createReadStream('export.csv'), res)
            })
            `,
        },
        {
          title: 'EventEmitter',
          code: c`
            import { EventEmitter } from 'node:events'

            const bus = new EventEmitter()
            bus.on('payment', p => console.log('paid', p.id))
            bus.emit('payment', { id: 1 })
            `,
        },
        {
          title: 'Graceful shutdown',
          code: c`
            const server = app.listen(3000)

            process.on('SIGTERM', () => {
              server.close(() => {
                db.end()
                process.exit(0)
              })
            })
            `,
        },
        {
          title: 'Catch the unexpected',
          code: c`
            process.on('unhandledRejection', err => {
              console.error('Unhandled rejection', err)
              process.exit(1)
            })
            `,
        },
      ],
    },
    {
      id: 'setup',
      title: 'Setup',
      group: 'Express',
      items: [
        {
          title: 'Install',
          lang: 'bash',
          code: c`
            npm init -y
            npm i express
            npm i -D nodemon
            `,
        },
        {
          title: 'Minimal server',
          code: c`
            import express from 'express'

            const app = express()
            app.use(express.json())

            app.get('/health', (req, res) => res.json({ ok: true }))

            app.listen(process.env.PORT ?? 3000, () => console.log('listening'))
            `,
          note: 'Add "type": "module" to package.json to use import syntax.',
        },
        {
          title: 'Project layout',
          lang: 'text',
          code: c`
            src/
              app.js          # express app, middleware
              server.js       # app.listen
              routes/
              controllers/
              services/       # business logic, API clients
              middleware/
            `,
        },
      ],
    },
    {
      id: 'routing',
      title: 'Routing',
      group: 'Express',
      items: [
        {
          title: 'Params, query, body',
          code: c`
            app.get('/invoices/:id', (req, res) => {
              const { id } = req.params
              const { expand } = req.query
              res.json({ id, expand })
            })

            app.post('/invoices', (req, res) => {
              res.status(201).json(req.body)
            })
            `,
        },
        {
          title: 'Router modules',
          code: c`
            // routes/invoices.js
            const router = express.Router()
            router.get('/', listInvoices)
            router.post('/', createInvoice)
            export default router

            // app.js
            app.use('/api/invoices', invoicesRouter)
            `,
        },
        {
          title: 'Async handlers',
          code: c`
            router.get('/', async (req, res) => {
              const rows = await db.invoice.findMany()
              res.json(rows)
            })
            `,
          note: 'Express 5 forwards rejected promises to the error handler automatically.',
        },
      ],
    },
    {
      id: 'middleware',
      title: 'Middleware',
      group: 'Express',
      items: [
        {
          title: 'Write middleware',
          code: c`
            function logger(req, res, next) {
              const start = Date.now()
              res.on('finish', () => console.log(req.method, req.url, res.statusCode, Date.now() - start + 'ms'))
              next()
            }
            app.use(logger)
            `,
        },
        {
          title: 'Auth check',
          code: c`
            import jwt from 'jsonwebtoken'

            export function requireAuth(req, res, next) {
              const token = req.headers.authorization?.replace('Bearer ', '')
              try {
                req.user = jwt.verify(token, process.env.JWT_SECRET)
                next()
              } catch {
                res.status(401).json({ error: 'Unauthorized' })
              }
            }
            `,
        },
        {
          title: 'Common packages',
          lang: 'js',
          code: c`
            import cors from 'cors'
            import helmet from 'helmet'

            app.use(helmet())
            app.use(cors({ origin: ['https://app.example.com'] }))
            `,
        },
        {
          title: 'Raw body for webhooks',
          code: c`
            app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
              // req.body is a Buffer — verify the signature against it
            })
            `,
          note: 'Register this route before app.use(express.json()).',
        },
      ],
    },
    {
      id: 'validation',
      title: 'Validation & errors',
      group: 'Express',
      items: [
        {
          title: 'Validate with Zod',
          code: c`
            import { z } from 'zod'

            const CreateInvoice = z.object({
              amount: z.number().positive(),
              currency: z.enum(['USD', 'MXN', 'PHP']),
            })

            router.post('/', (req, res) => {
              const parsed = CreateInvoice.safeParse(req.body)
              if (!parsed.success) return res.status(422).json(parsed.error.flatten())
              // parsed.data is typed and clean
            })
            `,
        },
        {
          title: 'Custom error class',
          code: c`
            export class HttpError extends Error {
              constructor(status, message) {
                super(message)
                this.status = status
              }
            }

            throw new HttpError(404, 'Invoice not found')
            `,
        },
        {
          title: 'Error handler (last)',
          code: c`
            app.use((err, req, res, next) => {
              console.error(err)
              res.status(err.status ?? 500).json({ error: err.message ?? 'Server error' })
            })
            `,
          note: 'Must have four arguments so Express treats it as an error handler.',
        },
        {
          title: '404 fallback',
          code: "app.use((req, res) => res.status(404).json({ error: 'Not found' }))",
        },
      ],
    },
    {
      id: 'sequelize-setup',
      title: 'Setup',
      group: 'Sequelize',
      items: [
        {
          title: 'Install',
          lang: 'bash',
          code: c`
            # same on macOS, Linux and Windows
            npm i sequelize mysql2          # MySQL / MariaDB
            npm i sequelize pg pg-hstore    # PostgreSQL
            npm i sequelize sqlite3         # SQLite (great for tests)
            npm i -D sequelize-cli          # migrations & seeders
            `,
          note: 'Sequelize is an ORM: models map to tables, and you query with JavaScript instead of SQL strings.',
        },
        {
          title: 'Project layout',
          lang: 'text',
          code: c`
            .sequelizerc              # tells the CLI where things live
            src/
              db/
                package.json          # { "type": "commonjs" } (CLI files below use require)
                config.js             # connection settings per environment
                migrations/
                seeders/
              models/
                sequelize.js          # the Sequelize instance (connection)
                product.js            # one file per model
                category.js
                index.js              # imports models, defines associations, re-exports
            `,
          note: 'The app uses ESM (import), but sequelize-cli loads config, migrations and seeders with require(). The small package.json makes everything in src/db CommonJS, so both work.',
        },
        {
          title: '.sequelizerc (project root)',
          lang: 'js',
          code: c`
            const path = require('path')

            module.exports = {
              config: path.resolve('src/db/config.js'),
              'models-path': path.resolve('src/models'),
              'migrations-path': path.resolve('src/db/migrations'),
              'seeders-path': path.resolve('src/db/seeders'),
            }
            `,
        },
        {
          title: 'src/db/package.json',
          lang: 'json',
          code: c`
            { "type": "commonjs" }
            `,
        },
        {
          title: 'src/db/config.js',
          lang: 'js',
          code: c`
            // loaded by sequelize-cli; values come from .env / the environment
            module.exports = {
              development: {
                username: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'app_dev',
                host: process.env.DB_HOST || '127.0.0.1',
                dialect: 'mysql',
              },
              test: {
                dialect: 'sqlite',
                storage: ':memory:',
              },
              production: {
                use_env_variable: 'DATABASE_URL',    // mysql://user:pass@host:3306/app
                dialect: 'mysql',
                logging: false,
              },
            }
            `,
        },
        {
          title: 'Connection used by the app',
          lang: 'js',
          code: c`
            // src/models/sequelize.js
            import { Sequelize } from 'sequelize'

            export const sequelize = new Sequelize(
              process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
              {
                host: process.env.DB_HOST ?? '127.0.0.1',
                port: Number(process.env.DB_PORT ?? 3306),
                dialect: 'mysql',                     // 'postgres' | 'sqlite' | 'mariadb' | 'mssql'
                logging: process.env.NODE_ENV === 'development' ? console.log : false,
                pool: { max: 10, min: 0, idle: 10_000 },
                define: { underscored: true },        // camelCase fields ↔ snake_case columns
              },
            )

            // or one URL: new Sequelize(process.env.DATABASE_URL, { logging: false })
            `,
        },
        {
          title: 'Test the connection',
          lang: 'js',
          code: c`
            try {
              await sequelize.authenticate()
              console.log('Database connected')
            } catch (err) {
              console.error('Cannot connect to the database:', err.message)
              process.exit(1)
            }
            `,
        },
        {
          title: 'TLS to AWS RDS',
          lang: 'js',
          code: c`
            import fs from 'node:fs'

            new Sequelize(process.env.DATABASE_URL, {
              dialectOptions: {
                ssl: { ca: fs.readFileSync('/etc/ssl/certs/rds-global-bundle.pem') },   // MySQL (mysql2)
                // PostgreSQL: ssl: { require: true, ca: fs.readFileSync(...) }
              },
            })
            `,
          note: 'With GCP Cloud SQL via the Auth Proxy, just connect to 127.0.0.1. No TLS options are needed.',
        },
      ],
    },
    {
      id: 'sequelize-models',
      title: 'Models',
      group: 'Sequelize',
      items: [
        {
          title: 'Define a model',
          lang: 'js',
          code: c`
            // src/models/product.js
            import { DataTypes, Model } from 'sequelize'
            import { sequelize } from './sequelize.js'

            export class Product extends Model {}

            Product.init(
              {
                id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
                name: {
                  type: DataTypes.STRING(255),
                  allowNull: false,
                  validate: { notEmpty: true, len: [2, 255] },
                },
                price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
                status: { type: DataTypes.ENUM('draft', 'active', 'archived'), defaultValue: 'draft' },
                stock: { type: DataTypes.INTEGER, defaultValue: 0 },
                meta: { type: DataTypes.JSON },
                categoryId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },   // column: category_id
              },
              {
                sequelize,
                modelName: 'Product',
                tableName: 'products',
                underscored: true,     // createdAt → created_at
                paranoid: true,        // soft deletes via deleted_at
              },
            )
            `,
          note: 'Models import the instance from sequelize.js (not index.js) to avoid circular imports. The rest of the app imports from models/index.js.',
        },
        {
          title: 'Common data types',
          lang: 'text',
          code: c`
            DataTypes.STRING(255)        VARCHAR          DataTypes.TEXT           TEXT
            DataTypes.INTEGER            INT              DataTypes.BIGINT         BIGINT
            DataTypes.DECIMAL(10, 2)     money (string)   DataTypes.FLOAT / DOUBLE
            DataTypes.BOOLEAN            TINYINT(1)       DataTypes.DATE           DATETIME
            DataTypes.DATEONLY           DATE             DataTypes.JSON           JSON
            DataTypes.UUID + defaultValue: DataTypes.UUIDV4
            DataTypes.ENUM('a', 'b')     DataTypes.VIRTUAL (computed, not stored)
            `,
          note: 'DECIMAL comes back as a string to avoid rounding errors. Convert with Number() only when you need to.',
        },
        {
          title: 'Getters, setters and virtual fields',
          lang: 'js',
          code: c`
            User.init({
              firstName: DataTypes.STRING,
              lastName: DataTypes.STRING,
              email: {
                type: DataTypes.STRING,
                unique: true,
                validate: { isEmail: true },
                set(value) { this.setDataValue('email', value.trim().toLowerCase()) },
              },
              fullName: {
                type: DataTypes.VIRTUAL,
                get() { return this.firstName + ' ' + this.lastName },
              },
            }, { sequelize, modelName: 'User' })
            `,
        },
        {
          title: 'Hide fields by default (scopes)',
          lang: 'js',
          code: c`
            User.init({ /* ... */ }, {
              sequelize,
              defaultScope: { attributes: { exclude: ['password'] } },
              scopes: {
                withPassword: { attributes: { include: ['password'] } },
                active: { where: { status: 'active' } },
              },
            })

            await User.findAll()                                  // no password
            await User.scope('withPassword').findOne({ where: { email } })
            await Product.scope('active').findAll()
            `,
        },
        {
          title: 'Hooks (e.g. hash passwords)',
          lang: 'js',
          code: c`
            import bcrypt from 'bcrypt'

            User.beforeSave(async user => {
              if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 12)
              }
            })

            User.prototype.checkPassword = function (plain) {
              return bcrypt.compare(plain, this.password)
            }
            `,
          note: 'Other hooks: beforeCreate, afterCreate, beforeUpdate, beforeDestroy, afterDestroy. Bulk operations skip instance hooks unless you pass { individualHooks: true }.',
        },
      ],
    },
    {
      id: 'sequelize-migrations',
      title: 'Migrations & seeders',
      group: 'Sequelize',
      items: [
        {
          title: 'CLI commands',
          lang: 'bash',
          code: c`
            # same on macOS, Linux and Windows
            npx sequelize-cli db:create                                  # create the database
            npx sequelize-cli migration:generate --name create-products
            npx sequelize-cli db:migrate                                 # run pending migrations
            npx sequelize-cli db:migrate:status
            npx sequelize-cli db:migrate:undo                            # roll back the last one
            npx sequelize-cli db:migrate:undo:all
            npx sequelize-cli seed:generate --name demo-products
            npx sequelize-cli db:seed:all
            npx sequelize-cli db:seed:undo:all
            `,
        },
        {
          title: 'Run against another environment',
          lang: 'bash',
          code: c`
            # any OS: pick the block from config.js with --env
            npx sequelize-cli db:migrate --env production

            # with the connection string in an env var
            # macOS / Linux
            DATABASE_URL="mysql://app:secret@db-host:3306/app" npx sequelize-cli db:migrate --env production

            # Windows — PowerShell
            $env:DATABASE_URL = "mysql://app:secret@db-host:3306/app"; npx sequelize-cli db:migrate --env production

            # Windows — cmd
            set DATABASE_URL=mysql://app:secret@db-host:3306/app && npx sequelize-cli db:migrate --env production
            `,
        },
        {
          title: 'Create-table migration',
          lang: 'js',
          code: c`
            // src/db/migrations/20261017120000-create-products.js
            'use strict'

            /** @type {import('sequelize-cli').Migration} */
            module.exports = {
              async up(queryInterface, Sequelize) {
                await queryInterface.createTable('products', {
                  id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
                  category_id: {
                    type: Sequelize.INTEGER.UNSIGNED,
                    allowNull: false,
                    references: { model: 'categories', key: 'id' },
                    onUpdate: 'CASCADE',
                    onDelete: 'RESTRICT',
                  },
                  name: { type: Sequelize.STRING(255), allowNull: false },
                  price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
                  status: { type: Sequelize.ENUM('draft', 'active', 'archived'), allowNull: false, defaultValue: 'draft' },
                  stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
                  meta: { type: Sequelize.JSON },
                  created_at: { type: Sequelize.DATE, allowNull: false },
                  updated_at: { type: Sequelize.DATE, allowNull: false },
                  deleted_at: { type: Sequelize.DATE },
                })
                await queryInterface.addIndex('products', ['status'])
              },

              async down(queryInterface) {
                await queryInterface.dropTable('products')
              },
            }
            `,
        },
        {
          title: 'Change an existing table',
          lang: 'js',
          code: c`
            module.exports = {
              async up(queryInterface, Sequelize) {
                await queryInterface.addColumn('products', 'sku', { type: Sequelize.STRING(64), after: 'name' })
                await queryInterface.addIndex('products', ['sku'], { unique: true })
                await queryInterface.changeColumn('products', 'name', { type: Sequelize.STRING(500), allowNull: false })
                await queryInterface.renameColumn('products', 'stock', 'quantity')
              },
              async down(queryInterface, Sequelize) {
                await queryInterface.renameColumn('products', 'quantity', 'stock')
                await queryInterface.changeColumn('products', 'name', { type: Sequelize.STRING(255), allowNull: false })
                await queryInterface.removeIndex('products', ['sku'])
                await queryInterface.removeColumn('products', 'sku')
              },
            }
            `,
          note: 'Always write down() in reverse order of up() so rollbacks work.',
        },
        {
          title: 'Seeder',
          lang: 'js',
          code: c`
            // src/db/seeders/20261017130000-demo-products.js
            module.exports = {
              async up(queryInterface) {
                const now = new Date()
                await queryInterface.bulkInsert('categories', [
                  { id: 1, name: 'Shirts', created_at: now, updated_at: now },
                ])
                await queryInterface.bulkInsert('products', [
                  { category_id: 1, name: 'Basic tee', price: 299, status: 'active', stock: 50, created_at: now, updated_at: now },
                  { category_id: 1, name: 'Polo', price: 599, status: 'draft', stock: 0, created_at: now, updated_at: now },
                ])
              },
              async down(queryInterface) {
                await queryInterface.bulkDelete('products', null, {})
                await queryInterface.bulkDelete('categories', null, {})
              },
            }
            `,
        },
        {
          title: 'sync() vs migrations',
          lang: 'js',
          code: c`
            await sequelize.sync()                 // create missing tables only
            await sequelize.sync({ alter: true })  // try to match models (can drop data!)
            await sequelize.sync({ force: true })  // DROP and recreate every table
            `,
          note: 'Fine for quick prototypes and tests. Use migrations for any real database.',
        },
      ],
    },
    {
      id: 'sequelize-queries',
      title: 'Queries (CRUD)',
      group: 'Sequelize',
      items: [
        {
          title: 'Create',
          lang: 'js',
          code: c`
            const product = await Product.create({ name: 'Basic tee', price: 299, categoryId: 1 })

            await Product.bulkCreate([
              { name: 'Polo', price: 599, categoryId: 1 },
              { name: 'Hoodie', price: 999, categoryId: 1 },
            ], { validate: true })

            const [tag, created] = await Tag.findOrCreate({ where: { name: 'sale' } })
            await Product.upsert({ id: 5, name: 'Updated or inserted', price: 100, categoryId: 1 })
            `,
        },
        {
          title: 'Read',
          lang: 'js',
          code: c`
            const one = await Product.findByPk(42)                       // null if missing
            const first = await Product.findOne({ where: { sku: 'TEE-01' } })

            const list = await Product.findAll({
              where: { status: 'active', categoryId: 1 },
              attributes: ['id', 'name', 'price'],
              order: [['createdAt', 'DESC']],
              limit: 20,
            })

            const plain = await Product.findAll({ raw: true })           // plain objects, faster
            const total = await Product.count({ where: { status: 'active' } })
            const stock = await Product.sum('stock')
            `,
        },
        {
          title: 'Where operators (Op)',
          lang: 'js',
          code: c`
            import { Op } from 'sequelize'

            await Product.findAll({
              where: {
                price: { [Op.between]: [100, 500] },
                name: { [Op.like]: '%shirt%' },            // Postgres: Op.iLike for case-insensitive
                status: { [Op.in]: ['active', 'draft'] },
                stock: { [Op.gt]: 0 },
                deletedAt: { [Op.is]: null },
                [Op.or]: [{ featured: true }, { price: { [Op.lt]: 200 } }],
              },
            })
            `,
          note: 'Also: Op.eq, Op.ne, Op.gte, Op.lte, Op.notIn, Op.notLike, Op.startsWith, Op.endsWith, Op.substring, Op.and, Op.not.',
        },
        {
          title: 'Pagination',
          lang: 'js',
          code: c`
            const page = Math.max(1, Number(req.query.page) || 1)
            const perPage = 20

            const { rows, count } = await Product.findAndCountAll({
              where: { status: 'active' },
              order: [['id', 'DESC']],
              limit: perPage,
              offset: (page - 1) * perPage,
              distinct: true,        // correct count when using include
            })

            res.json({ data: rows, page, perPage, total: count, pages: Math.ceil(count / perPage) })
            `,
        },
        {
          title: 'Update',
          lang: 'js',
          code: c`
            // instance
            const product = await Product.findByPk(42)
            product.price = 349
            await product.save()
            await product.update({ status: 'active' })

            // many rows at once; returns [affectedCount]
            await Product.update({ status: 'archived' }, { where: { stock: 0 } })

            await product.increment('stock', { by: 5 })
            await Product.decrement('stock', { by: 1, where: { id: 42 } })
            `,
        },
        {
          title: 'Delete (and soft delete)',
          lang: 'js',
          code: c`
            await product.destroy()                                    // paranoid model: sets deleted_at
            await Product.destroy({ where: { status: 'archived' } })

            await product.restore()                                    // undo a soft delete
            await Product.findAll({ paranoid: false })                 // include soft-deleted rows
            await product.destroy({ force: true })                     // really delete
            `,
        },
        {
          title: 'Group by and aggregates',
          lang: 'js',
          code: c`
            import { fn, col } from 'sequelize'

            const perCategory = await Product.findAll({
              attributes: ['categoryId', [fn('COUNT', col('id')), 'total'], [fn('AVG', col('price')), 'avgPrice']],
              group: ['categoryId'],
              raw: true,
            })
            `,
        },
        {
          title: 'Raw SQL safely',
          lang: 'js',
          code: c`
            import { QueryTypes } from 'sequelize'

            const rows = await sequelize.query(
              'SELECT id, name FROM products WHERE price > :min AND status = :status',
              { replacements: { min: 100, status: 'active' }, type: QueryTypes.SELECT },
            )
            `,
          note: 'Never build SQL by concatenating user input. Always use replacements (or bind).',
        },
      ],
    },
    {
      id: 'sequelize-associations',
      title: 'Associations & eager loading',
      group: 'Sequelize',
      items: [
        {
          title: 'Define relationships',
          lang: 'js',
          code: c`
            // src/models/index.js
            import { sequelize } from './sequelize.js'
            import { Category } from './category.js'
            import { Product } from './product.js'
            import { Tag } from './tag.js'
            import { User } from './user.js'
            import { Profile } from './profile.js'

            Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' })
            Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' })

            User.hasOne(Profile, { foreignKey: 'userId', as: 'profile' })
            Profile.belongsTo(User, { foreignKey: 'userId', as: 'user' })

            // many-to-many through a pivot table
            Product.belongsToMany(Tag, { through: 'product_tags', foreignKey: 'productId', otherKey: 'tagId', as: 'tags' })
            Tag.belongsToMany(Product, { through: 'product_tags', foreignKey: 'tagId', otherKey: 'productId', as: 'products' })

            export { sequelize, Category, Product, Tag, User, Profile }
            `,
          note: 'Define both sides so you can query from either direction. The "as" alias must match in include.',
        },
        {
          title: 'Eager load with include (avoid N+1)',
          lang: 'js',
          code: c`
            const products = await Product.findAll({
              include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } },
              ],
            })

            products[0].category.name
            products[0].tags.map(t => t.name)
            `,
        },
        {
          title: 'Filter by a related model',
          lang: 'js',
          code: c`
            // only products in the "Shirts" category (INNER JOIN)
            await Product.findAll({
              include: [{ model: Category, as: 'category', where: { name: 'Shirts' }, required: true }],
            })

            // nested includes
            await Category.findAll({
              include: [{ model: Product, as: 'products', include: [{ model: Tag, as: 'tags' }] }],
            })
            `,
        },
        {
          title: 'Association helper methods',
          lang: 'js',
          code: c`
            const category = await Category.findByPk(1)
            const items = await category.getProducts({ where: { status: 'active' } })
            await category.createProduct({ name: 'Tank top', price: 199 })
            const n = await category.countProducts()

            const product = await Product.findByPk(42)
            await product.setTags([1, 2, 3])        // replace all tags
            await product.addTag(4)
            await product.removeTag(2)
            const has = await product.hasTag(3)
            `,
          note: 'Method names come from the alias: as: "products" → getProducts / createProduct / countProducts.',
        },
      ],
    },
    {
      id: 'sequelize-advanced',
      title: 'Transactions, errors & testing',
      group: 'Sequelize',
      items: [
        {
          title: 'Transactions',
          lang: 'js',
          code: c`
            // managed: commits on success, rolls back if anything throws
            const order = await sequelize.transaction(async t => {
              const order = await Order.create({ userId, total }, { transaction: t })
              await OrderItem.bulkCreate(items.map(i => ({ ...i, orderId: order.id })), { transaction: t })
              await Product.decrement('stock', { by: 1, where: { id: items.map(i => i.productId) }, transaction: t })
              return order
            })
            `,
          note: 'Every query inside must receive { transaction: t }, or it runs outside the transaction.',
        },
        {
          title: 'Row locking',
          lang: 'js',
          code: c`
            await sequelize.transaction(async t => {
              const product = await Product.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE })   // SELECT ... FOR UPDATE
              if (product.stock < qty) throw new HttpError(409, 'Not enough stock')
              await product.decrement('stock', { by: qty, transaction: t })
            })
            `,
        },
        {
          title: 'Turn Sequelize errors into HTTP responses',
          lang: 'js',
          code: c`
            import { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize'

            app.use((err, req, res, next) => {
              if (err instanceof UniqueConstraintError) {
                return res.status(409).json({ error: 'Already exists', fields: err.fields })
              }
              if (err instanceof ValidationError) {
                return res.status(422).json({
                  errors: err.errors.map(e => ({ field: e.path, message: e.message })),
                })
              }
              if (err instanceof ForeignKeyConstraintError) {
                return res.status(422).json({ error: 'Related record does not exist' })
              }
              console.error(err)
              res.status(err.status ?? 500).json({ error: err.message ?? 'Server error' })
            })
            `,
          note: 'Check UniqueConstraintError first: it is a subclass of ValidationError.',
        },
        {
          title: 'Test with in-memory SQLite',
          lang: 'js',
          code: c`
            // test/setup.js (node:test, vitest or jest)
            import { sequelize, Product } from '../src/models/index.js'
            // make src/models/sequelize.js use new Sequelize('sqlite::memory:', { logging: false }) when NODE_ENV=test

            before(async () => { await sequelize.sync({ force: true }) })
            after(async () => { await sequelize.close() })

            test('creates a product', async () => {
              const p = await Product.create({ name: 'Tee', price: 10, categoryId: 1 })
              assert.equal(p.status, 'draft')
            })
            `,
          note: 'SQLite skips some MySQL-specific behaviour (e.g. ENUM, strict types). Run important tests against the real engine in CI.',
        },
        {
          title: 'See the generated SQL',
          lang: 'js',
          code: c`
            new Sequelize(url, { logging: console.log })             // everything
            await Product.findAll({ where: { id: 1 }, logging: console.log })   // one query
            `,
          note: 'Use this whenever a query is slow or returns surprising results.',
        },
      ],
    },
    {
      id: 'sequelize-express',
      title: 'Using it in Express routes',
      group: 'Sequelize',
      items: [
        {
          title: 'Products router (full CRUD)',
          lang: 'js',
          code: c`
            // src/routes/products.js
            import express from 'express'
            import { Op } from 'sequelize'
            import { Product, Category } from '../models/index.js'
            import { HttpError } from '../errors.js'

            const router = express.Router()

            router.get('/', async (req, res) => {
              const where = {}
              if (req.query.q) where.name = { [Op.like]: '%' + req.query.q + '%' }
              const products = await Product.findAll({
                where,
                include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
                order: [['createdAt', 'DESC']],
                limit: 50,
              })
              res.json({ data: products })
            })

            router.get('/:id', async (req, res) => {
              const product = await Product.findByPk(req.params.id, { include: ['category', 'tags'] })
              if (!product) throw new HttpError(404, 'Product not found')
              res.json({ data: product })
            })

            router.post('/', async (req, res) => {
              const { name, price, categoryId } = req.body          // pick allowed fields only
              const product = await Product.create({ name, price, categoryId })
              res.status(201).json({ data: product })
            })

            router.put('/:id', async (req, res) => {
              const product = await Product.findByPk(req.params.id)
              if (!product) throw new HttpError(404, 'Product not found')
              await product.update(req.body, { fields: ['name', 'price', 'status', 'categoryId'] })
              res.json({ data: product })
            })

            router.delete('/:id', async (req, res) => {
              const deleted = await Product.destroy({ where: { id: req.params.id } })
              if (!deleted) throw new HttpError(404, 'Product not found')
              res.status(204).end()
            })

            export default router
            `,
          note: 'Express 5 passes errors thrown in async handlers to the error handler. On Express 4, wrap handlers or use express-async-errors.',
        },
        {
          title: 'Start the server after the DB connects',
          lang: 'js',
          code: c`
            // src/server.js
            import app from './app.js'
            import { sequelize } from './models/index.js'

            await sequelize.authenticate()
            const server = app.listen(process.env.PORT ?? 3000, () => console.log('API ready'))

            process.on('SIGTERM', () => {
              server.close(async () => {
                await sequelize.close()
                process.exit(0)
              })
            })
            `,
        },
        {
          title: 'Run migrations on deploy',
          lang: 'bash',
          code: c`
            # in deploy.sh on the server (Linux), before reloading PM2
            npx sequelize-cli db:migrate --env production
            pm2 reload ecosystem.config.cjs --update-env
            `,
          note: 'Needs sequelize-cli available in production: keep it in dependencies, or run migrations before npm prune --omit=dev.',
        },
      ],
    },
    {
      id: 'jwt-setup',
      title: 'JWT auth: setup',
      group: 'Authentication',
      items: [
        {
          title: 'How JWT authentication works',
          lang: 'text',
          code: c`
            1. POST /auth/login with email + password
            2. Server checks the bcrypt hash, then signs:
                 access token  (JWT, ~15 min)  → returned in the JSON body
                 refresh token (random, 7 days) → httpOnly cookie, hash stored in the DB
            3. Client calls the API with  Authorization: Bearer <access token>
            4. Middleware verifies the signature + expiry, no DB lookup needed
            5. When the access token expires: POST /auth/refresh (cookie) → new access token
            6. Logout deletes the refresh token, so it cannot be used again

            JWT = base64(header).base64(payload).signature   — payload is readable, NOT encrypted
            `,
          note: 'Keep access tokens short-lived: a stolen JWT is valid until it expires. Never put passwords or personal data in the payload.',
        },
        {
          title: '1. Install',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i jsonwebtoken bcrypt cookie-parser express-rate-limit
            `,
          note: 'bcrypt ships prebuilt binaries for Windows, macOS and Linux. If it fails to install, use bcryptjs (pure JavaScript, same API).',
        },
        {
          title: '2. Generate secrets',
          lang: 'bash',
          code: c`
            # same on every OS (prints a 64-byte random hex string)
            node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
            `,
          then: [
            {
              label: '.env',
              lang: 'env',
              code: c`
              JWT_ACCESS_SECRET=paste-the-first-generated-value
              JWT_ACCESS_TTL=15m
              REFRESH_TTL_DAYS=7
              `,
            },
          ],
          note: 'Never commit .env. In production keep secrets in your host\'s secret store (SSM Parameter Store, Secret Manager, GitHub environment secrets).',
        },
        {
          title: '3. Models: users and refresh tokens (Sequelize)',
          code: c`
            // src/models/user.js
            User.init({
              email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
              passwordHash: { type: DataTypes.STRING, allowNull: false },
              role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
            }, {
              sequelize, modelName: 'User', underscored: true,
              defaultScope: { attributes: { exclude: ['passwordHash'] } },
              scopes: { withPassword: { attributes: { include: ['passwordHash'] } } },
            })

            // src/models/refresh-token.js
            RefreshToken.init({
              tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
              expiresAt: { type: DataTypes.DATE, allowNull: false },
            }, { sequelize, modelName: 'RefreshToken', underscored: true })

            User.hasMany(RefreshToken, { foreignKey: 'userId', onDelete: 'CASCADE' })
            RefreshToken.belongsTo(User, { foreignKey: 'userId' })
            `,
          note: 'Create the matching tables with migrations (see the Sequelize group).',
        },
        {
          title: '4. Token helpers (src/auth/tokens.js)',
          code: c`
            import crypto from 'node:crypto'
            import jwt from 'jsonwebtoken'
            import { RefreshToken } from '../models/index.js'

            const sha256 = value => crypto.createHash('sha256').update(value).digest('hex')

            export function signAccessToken(user) {
              return jwt.sign(
                { sub: String(user.id), role: user.role },
                process.env.JWT_ACCESS_SECRET,
                { expiresIn: process.env.JWT_ACCESS_TTL || '15m', algorithm: 'HS256' },
              )
            }

            export async function issueRefreshToken(res, userId) {
              const token = crypto.randomBytes(48).toString('hex')
              const days = Number(process.env.REFRESH_TTL_DAYS || 7)
              await RefreshToken.create({ userId, tokenHash: sha256(token), expiresAt: new Date(Date.now() + days * 864e5) })
              res.cookie('refresh_token', token, {
                httpOnly: true,                                   // JavaScript cannot read it
                secure: process.env.NODE_ENV === 'production',    // HTTPS only in production
                sameSite: 'strict',
                path: '/auth',                                    // only sent to /auth/* routes
                maxAge: days * 864e5,
              })
            }

            export { sha256 }
            `,
        },
      ],
    },
    {
      id: 'jwt-routes',
      title: 'Register, login, refresh & logout',
      group: 'Authentication',
      items: [
        {
          title: 'Auth routes (src/routes/auth.js)',
          code: c`
            import express from 'express'
            import bcrypt from 'bcrypt'
            import rateLimit from 'express-rate-limit'
            import { Op } from 'sequelize'
            import { User, RefreshToken } from '../models/index.js'
            import { signAccessToken, issueRefreshToken, sha256 } from '../auth/tokens.js'

            const router = express.Router()
            const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true })

            router.post('/register', async (req, res) => {
              const { email, password } = req.body
              if (!email || !password || password.length < 8) {
                return res.status(422).json({ error: 'Email and a password of 8+ characters are required' })
              }
              const passwordHash = await bcrypt.hash(password, 12)
              const user = await User.create({ email: email.toLowerCase(), passwordHash })   // 409 via UniqueConstraintError handler
              await issueRefreshToken(res, user.id)
              res.status(201).json({ accessToken: signAccessToken(user) })
            })

            router.post('/login', loginLimiter, async (req, res) => {
              const user = await User.scope('withPassword').findOne({ where: { email: String(req.body.email).toLowerCase() } })
              const ok = user && await bcrypt.compare(String(req.body.password), user.passwordHash)
              if (!ok) return res.status(401).json({ error: 'Wrong email or password' })

              await issueRefreshToken(res, user.id)
              res.json({ accessToken: signAccessToken(user) })
            })

            router.post('/refresh', async (req, res) => {
              const token = req.cookies.refresh_token
              if (!token) return res.status(401).json({ error: 'No refresh token' })

              const stored = await RefreshToken.findOne({
                where: { tokenHash: sha256(token), expiresAt: { [Op.gt]: new Date() } },
                include: User,
              })
              if (!stored) return res.status(401).json({ error: 'Invalid refresh token' })

              await stored.destroy()                          // rotate: each refresh token works once
              await issueRefreshToken(res, stored.userId)
              res.json({ accessToken: signAccessToken(stored.User) })
            })

            router.post('/logout', async (req, res) => {
              const token = req.cookies.refresh_token
              if (token) await RefreshToken.destroy({ where: { tokenHash: sha256(token) } })
              res.clearCookie('refresh_token', { path: '/auth' })
              res.status(204).end()
            })

            export default router
            `,
        },
        {
          title: 'Wire it into the app (src/app.js)',
          code: c`
            import express from 'express'
            import cookieParser from 'cookie-parser'
            import authRoutes from './routes/auth.js'
            import productRoutes from './routes/products.js'
            import { requireAuth } from './middleware/auth.js'

            const app = express()
            app.set('trust proxy', 1)              // behind Nginx: correct IPs for rate limiting
            app.use(express.json())
            app.use(cookieParser())

            app.use('/auth', authRoutes)
            app.use('/api/products', requireAuth, productRoutes)   // everything here needs a token

            export default app
            `,
        },
      ],
    },
    {
      id: 'jwt-middleware',
      title: 'Protect routes & roles',
      group: 'Authentication',
      items: [
        {
          title: 'requireAuth middleware (src/middleware/auth.js)',
          code: c`
            import jwt from 'jsonwebtoken'

            export function requireAuth(req, res, next) {
              const [scheme, token] = (req.headers.authorization || '').split(' ')
              if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Missing token' })

              try {
                const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] })
                req.user = { id: Number(payload.sub), role: payload.role }
                next()
              } catch (err) {
                const expired = err.name === 'TokenExpiredError'
                res.status(401).json({ error: expired ? 'Token expired' : 'Invalid token', code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID' })
              }
            }

            export const requireRole = (...roles) => (req, res, next) =>
              roles.includes(req.user?.role) ? next() : res.status(403).json({ error: 'Forbidden' })
            `,
          note: 'Always pass algorithms to jwt.verify so a token cannot switch to a weaker algorithm.',
        },
        {
          title: 'Use it on routes',
          code: c`
            import { requireAuth, requireRole } from '../middleware/auth.js'

            router.get('/me', requireAuth, async (req, res) => {
              res.json(await User.findByPk(req.user.id))
            })

            router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
              await Product.destroy({ where: { id: req.params.id } })
              res.status(204).end()
            })

            // owners only: check the record belongs to the user
            router.put('/orders/:id', requireAuth, async (req, res) => {
              const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } })
              if (!order) return res.status(404).json({ error: 'Not found' })
              await order.update(req.body, { fields: ['note'] })
              res.json(order)
            })
            `,
        },
        {
          title: 'Frontend: attach the token and refresh automatically',
          code: c`
            // keep the access token in memory (not localStorage); the refresh cookie is httpOnly
            let accessToken = null

            export async function api(path, options = {}) {
              const send = () => fetch(path, {
                ...options,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', ...options.headers, Authorization: 'Bearer ' + accessToken },
              })
              let res = await send()
              if (res.status === 401) {
                const r = await fetch('/auth/refresh', { method: 'POST', credentials: 'include' })
                if (!r.ok) throw new Error('Logged out')
                accessToken = (await r.json()).accessToken
                res = await send()                          // retry once with the new token
              }
              return res
            }

            export async function login(email, password) {
              const res = await fetch('/auth/login', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
              })
              if (!res.ok) throw new Error('Login failed')
              accessToken = (await res.json()).accessToken
            }
            `,
          note: 'On page load, call /auth/refresh once to get a fresh access token from the cookie. The AJAX sheet shows the same pattern with axios interceptors.',
        },
        {
          title: 'Test with curl',
          lang: 'bash',
          code: c`
            # macOS / Linux (Windows: use Git Bash or WSL, or curl.exe with escaped quotes)
            curl -i -c cookies.txt -X POST http://localhost:3000/auth/login \
              -H "Content-Type: application/json" -d '{"email":"ana@example.com","password":"secret123"}'

            TOKEN=paste-accessToken-here
            curl -i http://localhost:3000/api/products -H "Authorization: Bearer $TOKEN"

            curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/refresh
            `,
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
              $login = Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/login -ContentType "application/json" -Body '{"email":"ana@example.com","password":"secret123"}' -SessionVariable web
              Invoke-RestMethod -Uri http://localhost:3000/api/products -Headers @{ Authorization = "Bearer " + $login.accessToken }
              Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/refresh -WebSession $web
              `,
            },
          ],
        },
      ],
    },
    {
      id: 'jwt-alternatives',
      title: 'Cookie & session alternatives',
      group: 'Authentication',
      items: [
        {
          title: 'Access token in an httpOnly cookie instead of a header',
          code: c`
            // login: set the JWT as a cookie instead of returning it
            res.cookie('access_token', signAccessToken(user), {
              httpOnly: true, secure: true, sameSite: 'lax', maxAge: 15 * 60 * 1000,
            })

            // middleware: read it from the cookie
            const token = req.cookies.access_token
            `,
          note: 'Safer against XSS (JavaScript cannot read the token), but the browser sends cookies automatically, so add CSRF protection for POST / PUT / DELETE (sameSite plus a CSRF token, e.g. the csrf-csrf package).',
        },
        {
          title: 'Classic sessions with express-session',
          lang: 'bash',
          code: c`
            npm i express-session connect-redis redis
            `,
          then: [
            {
              label: 'src/app.js',
              lang: 'js',
              code: c`
              import session from 'express-session'
              import { RedisStore } from 'connect-redis'
              import { createClient } from 'redis'

              const redis = createClient({ url: process.env.REDIS_URL })
              await redis.connect()

              app.use(session({
                store: new RedisStore({ client: redis }),       // MemoryStore is for development only
                secret: process.env.SESSION_SECRET,
                resave: false,
                saveUninitialized: false,
                cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 2 * 60 * 60 * 1000 },
              }))

              // login
              req.session.regenerate(err => {
                if (err) return next(err)
                req.session.userId = user.id
                res.json({ ok: true })
              })

              // guard
              const requireSession = (req, res, next) => (req.session.userId ? next() : res.status(401).json({ error: 'Login required' }))

              // logout
              req.session.destroy(() => res.clearCookie('connect.sid').status(204).end())
              `,
            },
          ],
          note: 'Sessions are simpler to revoke (delete the session) and fit server-rendered apps. JWTs suit separate frontends, mobile apps and service-to-service calls.',
        },
        {
          title: 'Which one to use',
          lang: 'text',
          code: c`
            Server-rendered app (EJS, Pug)        → express-session + CSRF token
            SPA on the same domain                → httpOnly cookie (session or JWT) + CSRF / sameSite
            SPA or mobile app on another domain   → short JWT in memory + refresh token in an httpOnly cookie
            Service-to-service / public API       → JWT or API keys in the Authorization header
            `,
        },
        {
          title: 'Security checklist',
          lang: 'text',
          code: c`
            ✓ bcrypt (cost 12) or argon2 for passwords, never plain hashes
            ✓ Short access tokens (5–15 min), rotating refresh tokens stored as hashes
            ✓ jwt.verify with an explicit algorithms list
            ✓ Rate limit /auth/login and /auth/register
            ✓ HTTPS everywhere; cookies httpOnly + secure + sameSite
            ✓ Same error message for unknown email and wrong password
            ✓ Delete refresh tokens on logout and password change
            ✓ Nothing sensitive in the JWT payload (it is only base64)
            `,
        },
      ],
    },
  ],
}
