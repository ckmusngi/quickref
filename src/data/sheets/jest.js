import { c } from './shared/code.js'

const GH = '${{' // GitHub Actions expression opener (avoids template interpolation)

export default {
  slug: 'jest',
  title: 'Jest',
  tech: 'Jest',
  category: 'testing',
  minutes: 35,
  lang: 'js',
  description: 'Unit and integration testing for JavaScript and TypeScript with Jest 30: setup for CommonJS, ESM and TypeScript, matchers, async tests, mocks and spies, fake timers, snapshots, React components with Testing Library, Express APIs with Supertest, coverage and CI on GitHub Actions, plus the Vitest equivalents for Vite projects.',
  sections: [
    {
      id: 'install',
      title: 'Install & first test',
      group: 'Setup',
      items: [
        {
          title: '1. Install Jest',
          lang: 'bash',
          code: c`
            # same on every OS (Jest 30 needs Node.js 18+)
            npm i -D jest
            npx jest --init          # optional: asks a few questions and writes jest.config.js
            `,
          note: 'For a Vite project, Vitest is usually the better fit because it reuses your vite.config: see the Vitest section at the end.',
        },
        {
          title: '2. package.json scripts',
          lang: 'json',
          code: c`
            {
              "scripts": {
                "test": "jest",
                "test:watch": "jest --watch",
                "test:coverage": "jest --coverage"
              }
            }
            `,
        },
        {
          title: '3. First test (src/sum.test.js)',
          code: c`
            // src/sum.js
            function sum(a, b) {
              return a + b
            }
            module.exports = { sum }

            // src/sum.test.js
            const { sum } = require('./sum')

            test('adds 1 + 2 to equal 3', () => {
              expect(sum(1, 2)).toBe(3)
            })
            `,
          note: 'Out of the box Jest runs CommonJS (require). For import/export see the TypeScript and ESM items below.',
        },
        {
          title: '4. Run it',
          lang: 'bash',
          code: c`
            # same on every OS
            npm test
            npx jest
            `,
          note: 'Jest finds files ending in .test.js / .spec.js (also .ts, .jsx, .tsx) and anything inside __tests__ folders.',
        },
        {
          title: 'Editor autocomplete and lint globals',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i -D @types/jest          # IntelliSense for describe/test/expect, also in plain JS
            npm i -D eslint-plugin-jest   # lint rules + jest globals for ESLint
            `,
          then: [
            {
              label: 'eslint.config.js (flat config)',
              lang: 'js',
              code: c`
                import jest from 'eslint-plugin-jest'

                export default [
                  {
                    files: ['**/*.test.{js,jsx,ts,tsx}'],
                    ...jest.configs['flat/recommended'],
                  },
                ]
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'config',
      title: 'jest.config.js essentials',
      group: 'Setup',
      items: [
        {
          title: 'A typical config',
          code: c`
            // jest.config.js (CommonJS project; use "export default" in an ESM project)
            /** @type {import('jest').Config} */
            module.exports = {
              testEnvironment: 'node',                    // 'jsdom' for browser/React code
              roots: ['<rootDir>/src', '<rootDir>/tests'],
              testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
              setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],   // runs before each test file
              moduleNameMapper: {
                '^@/(.*)$': '<rootDir>/src/$1',            // import x from '@/utils/x'
                '\\.(css|less|scss)$': 'identity-obj-proxy',
                '\\.(png|jpe?g|gif|svg|webp)$': '<rootDir>/tests/fileMock.js',
              },
              clearMocks: true,
              collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts', '!src/main.*'],
              coverageDirectory: 'coverage',
            }
            `,
          note: 'The option is setupFilesAfterEnv (not "AfterEach"). Use setupFiles for code that must run before the test framework loads, such as polyfills.',
        },
        {
          title: 'testEnvironment: node vs jsdom',
          lang: 'bash',
          code: c`
            # same on every OS: jsdom is a separate package since Jest 28
            npm i -D jest-environment-jsdom
            `,
          then: [
            {
              label: 'Per-file override (top of a test file)',
              lang: 'js',
              code: c`
                /**
                 * @jest-environment jsdom
                 */
                test('uses the DOM', () => {
                  document.body.innerHTML = '<p>Hello</p>'
                  expect(document.querySelector('p').textContent).toBe('Hello')
                })
                `,
            },
          ],
          note: 'node (the default) is faster and right for APIs and utilities. jsdom gives you window and document for React and other browser code.',
        },
        {
          title: 'Mock files for CSS and images',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i -D identity-obj-proxy     # styles.button → 'button' for CSS modules
            `,
          then: [
            {
              label: 'tests/fileMock.js',
              lang: 'js',
              code: c`
                module.exports = 'test-file-stub'
                `,
            },
          ],
        },
        {
          title: 'Match tsconfig / jsconfig path aliases',
          lang: 'json',
          code: c`
            // tsconfig.json or jsconfig.json
            {
              "compilerOptions": {
                "baseUrl": ".",
                "paths": { "@/*": ["src/*"] }
              }
            }
            `,
          note: 'Jest does not read tsconfig paths: every alias needs a matching moduleNameMapper entry (or use ts-jest\'s pathsToModuleNameMapper helper).',
        },
        {
          title: 'Multiple projects in one run (frontend + backend)',
          code: c`
            // jest.config.js
            module.exports = {
              projects: [
                { displayName: 'api', testEnvironment: 'node', testMatch: ['<rootDir>/server/**/*.test.js'] },
                { displayName: 'web', testEnvironment: 'jsdom', testMatch: ['<rootDir>/client/**/*.test.jsx'] },
              ],
            }
            `,
          then: [
            {
              label: 'Run one project',
              lang: 'bash',
              code: c`
                # same on every OS
                npx jest --selectProjects api
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'typescript',
      title: 'TypeScript & JSX: ts-jest or babel-jest',
      group: 'Setup',
      items: [
        {
          title: 'Option A: ts-jest (type-checks while testing)',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i -D jest ts-jest @types/jest typescript
            npx ts-jest config:init      # writes a jest.config.js with preset: 'ts-jest'
            `,
          then: [
            {
              label: 'jest.config.js',
              lang: 'js',
              code: c`
                /** @type {import('jest').Config} */
                module.exports = {
                  preset: 'ts-jest',
                  testEnvironment: 'node',
                  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
                }
                `,
            },
          ],
          note: 'ts-jest reports type errors as test failures, which is thorough but slower. For JSX set "jsx": "react-jsx" in tsconfig.json.',
        },
        {
          title: 'Option B: babel-jest (fast, strips types only)',
          lang: 'bash',
          code: c`
            # same on every OS (babel-jest ships with jest and is used automatically when a Babel config exists)
            npm i -D @babel/core @babel/preset-env @babel/preset-typescript @babel/preset-react
            `,
          then: [
            {
              label: 'babel.config.cjs',
              lang: 'js',
              code: c`
                module.exports = {
                  presets: [
                    ['@babel/preset-env', { targets: { node: 'current' } }],
                    ['@babel/preset-react', { runtime: 'automatic' }],   // no "import React" needed
                    '@babel/preset-typescript',
                  ],
                }
                `,
            },
          ],
          note: 'Babel does not type-check, so run tsc --noEmit separately (for example in CI). @babel/preset-env also turns import/export into require for Jest.',
        },
        {
          title: 'Typed tests and typed mocks',
          lang: 'ts',
          code: c`
            import { describe, test, expect, jest } from '@jest/globals'   // optional explicit imports
            import { getUser } from './api'

            jest.mock('./api')
            const mockedGetUser = jest.mocked(getUser)        // keeps the real function's types

            test('typed mock', async () => {
              mockedGetUser.mockResolvedValue({ id: 1, name: 'Ana' })
              expect((await getUser(1)).name).toBe('Ana')
            })
            `,
          note: 'Either install @types/jest for global types or import from @jest/globals; do not mix both in one file.',
        },
        {
          title: 'jest.config.ts',
          lang: 'ts',
          code: c`
            import type { Config } from 'jest'

            const config: Config = {
              preset: 'ts-jest',
              testEnvironment: 'node',
            }

            export default config
            `,
          note: 'Jest needs ts-node installed to read a .ts config file. Newer Jest 30 releases may also load it via Node\'s built-in type stripping; check the docs for your exact version.',
        },
      ],
    },
    {
      id: 'esm',
      title: 'ESM projects ("type": "module")',
      group: 'Setup',
      items: [
        {
          title: 'Simplest route: let Babel convert imports',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i -D @babel/core @babel/preset-env
            `,
          then: [
            {
              label: 'babel.config.cjs (.cjs because the package is "type": "module")',
              lang: 'js',
              code: c`
                module.exports = {
                  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
                }
                `,
            },
            {
              label: 'jest.config.js (ESM syntax now)',
              lang: 'js',
              code: c`
                export default {
                  testEnvironment: 'node',
                }
                `,
            },
          ],
          note: 'Your source stays ESM; Jest transpiles it to CommonJS in memory. jest.mock works normally this way. Top-level await and import.meta are not supported by this route.',
        },
        {
          title: 'Native ESM: run Node with --experimental-vm-modules',
          lang: 'bash',
          code: c`
            # macOS / Linux
            NODE_OPTIONS=--experimental-vm-modules npx jest

            # Windows (PowerShell)
            $env:NODE_OPTIONS = "--experimental-vm-modules"; npx jest
            `,
          then: [
            {
              label: 'package.json: one script that works on every OS',
              lang: 'json',
              code: c`
                {
                  "type": "module",
                  "scripts": {
                    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
                  }
                }
                `,
            },
            {
              label: 'jest.config.js: turn off transforms for native ESM',
              lang: 'js',
              code: c`
                export default {
                  testEnvironment: 'node',
                  transform: {},
                }
                `,
            },
          ],
          note: 'Native ESM support in Jest is still marked experimental in Jest 30: Node prints an ExperimentalWarning, and jest.mock does not hoist above imports (use jest.unstable_mockModule, see Mocks).',
        },
        {
          title: 'Using jest globals in native ESM',
          code: c`
            import { jest, describe, test, expect } from '@jest/globals'
            import { sum } from './sum.js'          // ESM needs the file extension

            test('adds', () => {
              expect(sum(1, 2)).toBe(3)
            })
            `,
          note: 'describe/test/expect are still injected as globals, but the jest object must be imported from @jest/globals (or import.meta.jest) in ESM.',
        },
      ],
    },
    {
      id: 'running',
      title: 'Running tests (CLI)',
      group: 'Setup',
      items: [
        {
          title: 'Everyday commands',
          lang: 'bash',
          code: c`
            # same on every OS
            npx jest                               # all tests
            npx jest src/cart                      # files whose path matches (regex)
            npx jest src/cart/cart.test.js         # one file
            npx jest -t "applies coupon"           # only tests whose name matches
            npx jest --watch                       # re-run tests related to changed files (needs git)
            npx jest --watchAll                    # re-run everything on every change
            npx jest --coverage
            npx jest --runInBand                   # -i: one process, serial (DB tests, debugging)
            npx jest --onlyChanged                 # -o: tests related to uncommitted changes
            npx jest --bail                        # stop after the first failing file
            npx jest --verbose                     # list every test name
            `,
          note: 'Pass flags through npm with a double dash, e.g. npm test -- -t "coupon". Jest 30 renamed --testPathPattern to --testPathPatterns.',
        },
        {
          title: 'Watch mode keys',
          lang: 'text',
          code: c`
            a   run all tests
            f   run only failed tests
            p   filter by file name pattern
            t   filter by test name pattern
            u   update failing snapshots
            i   update snapshots interactively
            q   quit
            Enter  re-run
            `,
        },
        {
          title: 'Debug a test in Chrome DevTools or VS Code',
          lang: 'bash',
          code: c`
            # same on every OS: then open chrome://inspect, or use VS Code's "JavaScript Debug Terminal"
            node --inspect-brk node_modules/jest/bin/jest.js --runInBand src/cart.test.js
            `,
          note: 'In VS Code the simplest way is to open a JavaScript Debug Terminal and run npm test there; breakpoints and debugger statements just work.',
        },
        {
          title: 'Set an env var for one run',
          lang: 'bash',
          code: c`
            # macOS / Linux
            TZ=UTC DEBUG_SQL=1 npx jest

            # Windows (PowerShell)
            $env:TZ = "UTC"; $env:DEBUG_SQL = "1"; npx jest
            `,
          note: 'Jest sets NODE_ENV=test automatically if it is not already set.',
        },
      ],
    },
    {
      id: 'structure',
      title: 'describe, test, hooks',
      group: 'Writing tests',
      items: [
        {
          title: 'describe / test / it',
          code: c`
            describe('Cart', () => {
              test('starts empty', () => {
                expect(new Cart().items).toEqual([])
              })

              it('adds an item', () => {                   // it is an alias of test
                const cart = new Cart()
                cart.add({ sku: 'TEE', qty: 2 })
                expect(cart.items).toHaveLength(1)
              })

              describe('totals', () => {                    // nest for grouping
                test('sums line items', () => { /* ... */ })
              })
            })
            `,
        },
        {
          title: 'Setup and teardown hooks',
          code: c`
            let db

            beforeAll(async () => { db = await connect() })        // once per file / describe
            afterAll(async () => { await db.close() })

            beforeEach(() => { cart = new Cart() })                // before every test
            afterEach(() => { jest.clearAllMocks() })
            `,
          note: 'Hooks inside a describe only apply to tests in that block. Return a promise or use async so Jest waits for it.',
        },
        {
          title: 'only, skip, todo, failing',
          code: c`
            test.only('runs just this test in the file', () => {})
            describe.only('just this block', () => {})
            test.skip('temporarily disabled', () => {})
            describe.skip('whole block disabled', () => {})
            test.todo('handles refunds')                           // shows up in the summary
            test.failing('known bug #123', () => {                 // passes while it still throws
              expect(parsePrice('1,299')).toBe(1299)
            })
            `,
          note: 'Fail CI if a test.only slips through with eslint-plugin-jest\'s no-focused-tests rule, or run with --ci.',
        },
        {
          title: 'test.each (array form)',
          code: c`
            test.each([
              [1, 1, 2],
              [2, 3, 5],
              [-1, 1, 0],
            ])('sum(%i, %i) returns %i', (a, b, expected) => {
              expect(sum(a, b)).toBe(expected)
            })

            // objects read better with many columns; $name pulls a field into the title
            test.each([
              { input: 'ana@example.com', valid: true },
              { input: 'not-an-email', valid: false },
            ])('isEmail($input) → $valid', ({ input, valid }) => {
              expect(isEmail(input)).toBe(valid)
            })

            describe.each([['admin'], ['editor']])('as %s', role => {
              test('can view dashboard', () => { /* ... */ })
            })
            `,
          note: 'Title placeholders: %s string, %i integer, %d number, %p pretty-format, %# row index.',
        },
        {
          title: 'Per-test timeout and retries',
          code: c`
            test('slow import', async () => { /* ... */ }, 30_000)      // 30 s for this test

            jest.setTimeout(10_000)                                     // every test in this file
            jest.retryTimes(2, { logErrorsBeforeRetry: true })          // flaky integration tests
            `,
          note: 'The default timeout is 5 s; set testTimeout in jest.config.js to change it globally.',
        },
      ],
    },
    {
      id: 'matchers',
      title: 'Matchers cheat table',
      group: 'Writing tests',
      items: [
        {
          title: 'Equality',
          code: c`
            expect(2 + 2).toBe(4)                         // Object.is: primitives, same reference
            expect({ a: 1 }).toEqual({ a: 1 })            // deep equality, ignores undefined props
            expect({ a: 1, b: undefined }).toEqual({ a: 1 })            // passes
            expect({ a: 1, b: undefined }).not.toStrictEqual({ a: 1 })  // also checks undefined props and class types
            expect(user).toMatchObject({ name: 'Ana', role: 'admin' })  // subset of properties
            expect(user).toHaveProperty('address.city', 'Manila')       // nested path (+ optional value)
            `,
          note: 'Use toBe for numbers, strings and booleans; toEqual for objects and arrays. toBe on two equal objects fails because they are different references.',
        },
        {
          title: 'Truthiness and null',
          code: c`
            expect(value).toBeTruthy()
            expect(value).toBeFalsy()
            expect(value).toBeNull()
            expect(value).toBeUndefined()
            expect(value).toBeDefined()
            expect(value).toBeNaN()
            `,
        },
        {
          title: 'Numbers',
          code: c`
            expect(count).toBeGreaterThan(3)
            expect(count).toBeGreaterThanOrEqual(3)
            expect(count).toBeLessThan(10)
            expect(count).toBeLessThanOrEqual(10)
            expect(0.1 + 0.2).toBeCloseTo(0.3)            // floating point: never toBe here
            expect(price).toBeCloseTo(19.99, 2)           // 2 decimal places
            `,
        },
        {
          title: 'Strings, arrays, objects',
          code: c`
            expect('Order INV-1042 paid').toMatch(/INV-\d+/)
            expect('hello world').toContain('world')
            expect(['tee', 'cap']).toContain('cap')                  // === check
            expect([{ id: 1 }]).toContainEqual({ id: 1 })            // deep check
            expect(list).toHaveLength(3)
            expect(order).toBeInstanceOf(Order)
            expect(new Set([1, 2])).toEqual(new Set([2, 1]))
            `,
        },
        {
          title: 'Errors',
          code: c`
            expect(() => parse('')).toThrow()
            expect(() => parse('')).toThrow('Input is empty')         // message substring
            expect(() => parse('')).toThrow(/empty/)
            expect(() => parse('')).toThrow(ValidationError)
            expect(() => parse('')).toThrow(expect.objectContaining({ code: 'EMPTY' }))
            `,
          note: 'Wrap the call in a function: expect(parse(\'\')).toThrow() throws before expect can catch it.',
        },
        {
          title: 'Asymmetric matchers (match "any value like this")',
          code: c`
            expect(res.body).toEqual({
              id: expect.any(Number),
              createdAt: expect.any(String),
              email: expect.stringMatching(/@example\.com$/),
              tags: expect.arrayContaining(['new']),             // contains at least these
              meta: expect.objectContaining({ source: 'web' }),  // has at least these keys
              note: expect.anything(),                           // anything but null/undefined
            })

            expect(fn).toHaveBeenCalledWith(expect.any(Function))
            expect(list).toEqual(expect.not.arrayContaining(['deleted']))
            `,
          note: 'Great for API responses with generated ids and timestamps: assert the shape, not the exact value.',
        },
        {
          title: 'Custom matcher',
          code: c`
            // jest.setup.js
            expect.extend({
              toBeWithinRange(received, floor, ceiling) {
                const pass = received >= floor && received <= ceiling
                return {
                  pass,
                  message: () => 'expected ' + received + (pass ? ' not' : '') + ' to be within ' + floor + '–' + ceiling,
                }
              },
            })

            // any test
            expect(42).toBeWithinRange(1, 100)
            `,
        },
      ],
    },
    {
      id: 'async',
      title: 'Async tests',
      group: 'Writing tests',
      items: [
        {
          title: 'async / await',
          code: c`
            test('loads the user', async () => {
              const user = await fetchUser(1)
              expect(user.name).toBe('Ana')
            })

            test('rejects unknown ids', async () => {
              await expect(fetchUser(999)).rejects.toThrow('Not found')
            })
            `,
          note: 'Always await (or return) the promise. Without it the test finishes early and passes even if the assertion later fails.',
        },
        {
          title: 'resolves / rejects',
          code: c`
            await expect(fetchUser(1)).resolves.toEqual({ id: 1, name: 'Ana' })
            await expect(fetchUser(999)).rejects.toThrow(NotFoundError)
            await expect(fetchUser(999)).rejects.toMatchObject({ status: 404 })
            `,
        },
        {
          title: 'expect.assertions: make sure the catch ran',
          code: c`
            test('throws on bad input', async () => {
              expect.assertions(1)                  // fails if no assertion ran
              try {
                await createOrder({})
              } catch (err) {
                expect(err.message).toMatch(/items required/)
              }
            })

            expect.hasAssertions()                  // at least one, any number
            `,
        },
        {
          title: 'Callback-style code (done)',
          code: c`
            test('emits ready', done => {
              server.on('ready', () => {
                try {
                  expect(server.port).toBe(3000)
                  done()
                } catch (err) {
                  done(err)                          // otherwise a failure shows as a timeout
                }
              })
            })
            `,
          note: 'Prefer wrapping callbacks in a promise and using async/await. A test cannot take done and also return a promise.',
        },
      ],
    },
    {
      id: 'mock-functions',
      title: 'Mock functions: jest.fn',
      group: 'Mocks',
      items: [
        {
          title: 'Create and program a mock',
          code: c`
            const fn = jest.fn()                                    // returns undefined
            const add = jest.fn((a, b) => a + b)                    // with an implementation

            fn.mockReturnValue(42)
            fn.mockReturnValueOnce(1).mockReturnValueOnce(2)        // 1, 2, then 42
            fn.mockResolvedValue({ id: 1 })                         // async: returns Promise.resolve
            fn.mockRejectedValue(new Error('Network down'))         // async: returns Promise.reject
            fn.mockImplementation(id => ({ id, name: 'User ' + id }))
            fn.mockImplementationOnce(() => { throw new Error('first call fails') })
            fn.mockName('saveUser')                                 // nicer failure messages
            `,
        },
        {
          title: 'Assert how it was called',
          code: c`
            expect(fn).toHaveBeenCalled()
            expect(fn).toHaveBeenCalledTimes(2)
            expect(fn).toHaveBeenCalledWith('ana@example.com', expect.any(Object))
            expect(fn).toHaveBeenLastCalledWith(3)
            expect(fn).toHaveBeenNthCalledWith(1, 'first')
            expect(fn).not.toHaveBeenCalled()
            expect(fn).toHaveReturnedWith(42)
            `,
          note: 'Jest 30 removed the old aliases (toBeCalled, toBeCalledWith, lastCalledWith, toReturn...): use the toHaveBeen... names.',
        },
        {
          title: 'Inspect calls directly',
          code: c`
            fn.mock.calls             // [[arg1, arg2], [arg1, arg2], ...]
            fn.mock.calls[0][1]       // second argument of the first call
            fn.mock.results           // [{ type: 'return', value: 42 }, ...]
            fn.mock.instances         // "this" for each call (constructors)
            fn.mock.lastCall
            `,
        },
        {
          title: 'Pass a mock as a dependency (simplest mocking)',
          code: c`
            // src/signup.js
            export async function signup(user, { sendEmail }) {
              await sendEmail(user.email, 'Welcome!')
              return { ok: true }
            }

            // src/signup.test.js
            test('sends a welcome email', async () => {
              const sendEmail = jest.fn().mockResolvedValue(undefined)
              await signup({ email: 'ana@example.com' }, { sendEmail })
              expect(sendEmail).toHaveBeenCalledWith('ana@example.com', 'Welcome!')
            })
            `,
          note: 'Injecting dependencies avoids module mocking entirely and works the same in CommonJS, ESM, Jest and Vitest.',
        },
      ],
    },
    {
      id: 'spies',
      title: 'Spies: jest.spyOn',
      group: 'Mocks',
      items: [
        {
          title: 'Spy on a method, keep or replace it',
          code: c`
            const spy = jest.spyOn(mailer, 'send')                       // still calls the real send
            jest.spyOn(mailer, 'send').mockResolvedValue({ queued: true }) // replace it

            await registerUser(data)
            expect(spy).toHaveBeenCalledTimes(1)

            spy.mockRestore()                                            // put the original back
            `,
        },
        {
          title: 'Silence and check console output',
          code: c`
            test('logs a warning', () => {
              const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
              loadConfig({})
              expect(warn).toHaveBeenCalledWith(expect.stringContaining('missing API_URL'))
              warn.mockRestore()
            })
            `,
        },
        {
          title: 'Getters, properties and env vars',
          code: c`
            jest.spyOn(window, 'innerWidth', 'get').mockReturnValue(375)    // a getter

            jest.replaceProperty(process.env, 'API_URL', 'http://test.local')   // restored by restoreAllMocks

            jest.spyOn(Math, 'random').mockReturnValue(0.5)
            `,
        },
        {
          title: 'Auto-restore spies after every test',
          code: c`
            afterEach(() => {
              jest.restoreAllMocks()
            })
            `,
          note: 'Or set restoreMocks: true in jest.config.js so no spy leaks into the next test.',
        },
      ],
    },
    {
      id: 'module-mocks',
      title: 'Mocking modules: jest.mock',
      group: 'Mocks',
      items: [
        {
          title: 'Auto-mock a whole module',
          code: c`
            import { getUser } from './api'
            import { greet } from './greet'

            jest.mock('./api')                  // every export becomes a jest.fn() returning undefined

            test('greets by name', async () => {
              getUser.mockResolvedValue({ name: 'Ana' })
              expect(await greet(1)).toBe('Hello, Ana')
              expect(getUser).toHaveBeenCalledWith(1)
            })
            `,
          note: 'Babel/ts-jest hoist jest.mock calls above the imports, so the module under test receives the mock. This hoisting does not happen in native ESM.',
        },
        {
          title: 'Mock with a factory',
          code: c`
            jest.mock('./mailer', () => ({
              sendMail: jest.fn().mockResolvedValue({ id: 'msg_1' }),
              __esModule: true,                 // needed when mocking a default export
              default: { name: 'mailer' },
            }))

            // variables used inside the factory must start with "mock"
            const mockSend = jest.fn()
            jest.mock('./sms', () => ({ send: (...args) => mockSend(...args) }))
            `,
        },
        {
          title: 'Partial mock with jest.requireActual',
          code: c`
            jest.mock('./utils', () => ({
              ...jest.requireActual('./utils'),        // keep the real exports
              formatDate: jest.fn(() => '2026-01-01'), // replace just this one
            }))
            `,
        },
        {
          title: 'Manual mocks: __mocks__ folder',
          lang: 'text',
          code: c`
            src/
              api.js
              __mocks__/
                api.js          ← used by jest.mock('./api') in any test
            __mocks__/
              axios.js          ← node_modules packages: next to node_modules, used automatically
            `,
          then: [
            {
              label: 'src/__mocks__/api.js',
              lang: 'js',
              code: c`
                export const getUser = jest.fn(async id => ({ id, name: 'Test User' }))
                export const listOrders = jest.fn(async () => [])
                `,
            },
          ],
          note: 'Mocks for your own files still need jest.mock(\'./api\') in the test. Root __mocks__ for npm packages apply without calling jest.mock (except Node built-ins like fs).',
        },
        {
          title: 'Native ESM: jest.unstable_mockModule',
          code: c`
            import { jest } from '@jest/globals'

            jest.unstable_mockModule('./api.js', () => ({
              getUser: jest.fn(async () => ({ name: 'Ana' })),
            }))

            // import AFTER mocking, with dynamic import
            const { getUser } = await import('./api.js')
            const { greet } = await import('./greet.js')

            test('greets', async () => {
              expect(await greet(1)).toBe('Hello, Ana')
            })
            `,
          note: 'Still named unstable_ in Jest 30, so the API may change. If you hit friction here, the Babel route or Vitest\'s vi.mock is simpler.',
        },
        {
          title: 'Mock a class',
          code: c`
            import { Stripe } from './stripe-client'
            jest.mock('./stripe-client')

            test('charges the card', async () => {
              Stripe.prototype.charge = jest.fn().mockResolvedValue({ status: 'succeeded' })
              await checkout(cart)
              expect(Stripe.prototype.charge).toHaveBeenCalledWith(expect.objectContaining({ amount: 1299 }))
            })
            `,
          note: 'An auto-mocked class keeps its shape: the constructor and every method become jest.fn(). Check instances via Stripe.mock.instances.',
        },
      ],
    },
    {
      id: 'mock-http',
      title: 'Mocking fetch and axios',
      group: 'Mocks',
      items: [
        {
          title: 'Mock global fetch',
          code: c`
            beforeEach(() => {
              global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({ id: 1, name: 'Ana' }),
              })
            })

            test('loads a user', async () => {
              const user = await loadUser(1)
              expect(fetch).toHaveBeenCalledWith('/api/users/1', expect.anything())
              expect(user.name).toBe('Ana')
            })

            test('handles a 500', async () => {
              fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
              await expect(loadUser(1)).rejects.toThrow('HTTP 500')
            })
            `,
          note: 'Or use jest.spyOn(global, \'fetch\') so restoreMocks puts the real fetch back.',
        },
        {
          title: 'Mock axios',
          code: c`
            import axios from 'axios'
            jest.mock('axios')

            test('fetches products', async () => {
              axios.get.mockResolvedValue({ data: [{ id: 1, name: 'Tee' }] })
              const products = await getProducts()
              expect(axios.get).toHaveBeenCalledWith('/api/products')
              expect(products).toHaveLength(1)
            })
            `,
          note: 'If your code uses an instance from axios.create(), mock your own api module that exports it instead.',
        },
        {
          title: 'Network-level mocking with MSW',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i -D msw
            `,
          then: [
            {
              label: 'tests/server.js + jest.setup.js',
              lang: 'js',
              code: c`
                // tests/server.js
                import { setupServer } from 'msw/node'
                import { http, HttpResponse } from 'msw'

                export const server = setupServer(
                  http.get('/api/users/:id', ({ params }) => HttpResponse.json({ id: Number(params.id), name: 'Ana' })),
                )

                // jest.setup.js
                import { server } from './tests/server'
                beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
                afterEach(() => server.resetHandlers())
                afterAll(() => server.close())

                // in a test: override for one case
                server.use(http.get('/api/users/:id', () => new HttpResponse(null, { status: 500 })))
                `,
            },
          ],
          note: 'MSW intercepts real fetch/axios requests, so your code runs unchanged. MSW 2 under jsdom can need extra setup (TextEncoder, fetch globals); check the MSW docs for Jest.',
        },
      ],
    },
    {
      id: 'mock-config',
      title: 'Clearing mocks between tests',
      group: 'Mocks',
      items: [
        {
          title: 'clear vs reset vs restore',
          code: c`
            fn.mockClear()        // forget calls and results, keep the implementation
            fn.mockReset()        // mockClear + remove implementation / return values
            spy.mockRestore()     // mockReset + put the original method back (spyOn only)

            jest.clearAllMocks()
            jest.resetAllMocks()
            jest.restoreAllMocks()
            `,
        },
        {
          title: 'Do it automatically (jest.config.js)',
          code: c`
            module.exports = {
              clearMocks: true,      // safest default: call history never leaks
              // resetMocks: true,   // also wipes mockReturnValue set at module level
              restoreMocks: true,    // undo every jest.spyOn / replaceProperty after each test
            }
            `,
          note: 'resetMocks also clears implementations from jest.mock factories, which surprises people; set return values in beforeEach if you enable it.',
        },
        {
          title: 'Fresh module state per test',
          code: c`
            beforeEach(() => {
              jest.resetModules()                 // next require() loads a fresh copy
            })

            test('reads config from env', () => {
              process.env.FEATURE_X = 'on'
              const config = require('./config')  // re-evaluated with the new env
              expect(config.featureX).toBe(true)
            })

            jest.isolateModules(() => { require('./config') })   // fresh registry inside the callback
            `,
        },
      ],
    },
    {
      id: 'timers',
      title: 'Fake timers & dates',
      group: 'Time & snapshots',
      items: [
        {
          title: 'setTimeout / setInterval',
          code: c`
            beforeEach(() => jest.useFakeTimers())
            afterEach(() => jest.useRealTimers())

            test('debounces search', () => {
              const onSearch = jest.fn()
              const search = debounce(onSearch, 300)
              search('t'); search('te'); search('tee')

              jest.advanceTimersByTime(299)
              expect(onSearch).not.toHaveBeenCalled()
              jest.advanceTimersByTime(1)
              expect(onSearch).toHaveBeenCalledWith('tee')
            })
            `,
        },
        {
          title: 'Run timers',
          code: c`
            jest.runAllTimers()                  // run everything (loops forever on a recursive setInterval)
            jest.runOnlyPendingTimers()          // just the timers queued right now
            jest.advanceTimersToNextTimer()
            await jest.advanceTimersByTimeAsync(1000)   // also flushes promises between timers
            jest.getTimerCount()
            `,
          note: 'With async code that awaits between timers, use the ...Async variants so promise callbacks run.',
        },
        {
          title: 'Freeze the current date',
          code: c`
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2026-03-01T09:00:00Z'))

            expect(isWeekend(new Date())).toBe(false)
            expect(Date.now()).toBe(new Date('2026-03-01T09:00:00Z').getTime())

            // keep real setTimeout but fake Date
            jest.useFakeTimers({ doNotFake: ['setTimeout', 'setInterval'] })
            `,
          note: 'Also run tests with TZ=UTC (see Running tests) so date formatting does not depend on the machine.',
        },
      ],
    },
    {
      id: 'snapshots',
      title: 'Snapshots',
      group: 'Time & snapshots',
      items: [
        {
          title: 'File and inline snapshots',
          code: c`
            test('serialises an invoice', () => {
              expect(toInvoiceJson(order)).toMatchSnapshot()      // stored in __snapshots__/*.snap
            })

            test('formats a price', () => {
              expect(formatPrice(1299)).toMatchInlineSnapshot()   // Jest writes the value into this file
            })

            // ignore values that change every run
            expect(user).toMatchSnapshot({ id: expect.any(Number), createdAt: expect.any(Date) })
            `,
          note: 'Inline snapshots need Prettier installed (Jest uses it to rewrite the test file). Commit .snap files with your code.',
        },
        {
          title: 'Update snapshots',
          lang: 'bash',
          code: c`
            # same on every OS
            npx jest -u                          # rewrite all failing snapshots
            npx jest -u -t "invoice"             # only matching tests
            npx jest --ci                        # CI: never write new snapshots, fail instead
            `,
        },
        {
          title: 'When to avoid snapshots',
          lang: 'text',
          code: c`
            Good:  small, stable output — serialised data, error messages, a CLI's help text
            Bad:   whole rendered pages (huge diffs nobody reads, everyone just presses -u)
            Bad:   output with dates, random ids or ordering that changes
            Better for UI: explicit assertions — expect(screen.getByRole('alert')).toHaveTextContent('Required')
            `,
        },
      ],
    },
    {
      id: 'rtl-setup',
      title: 'React Testing Library: setup',
      group: 'React',
      items: [
        {
          title: 'Install',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
            npm i -D @babel/core @babel/preset-env @babel/preset-react   # JSX (add @babel/preset-typescript for TSX)
            npm i -D identity-obj-proxy                                  # CSS imports
            `,
          note: '@testing-library/dom is a peer dependency of @testing-library/react 16+ and must be installed explicitly. On a Vite app, prefer Vitest (same Testing Library code).',
        },
        {
          title: 'jest.config.js + jest.setup.js',
          code: c`
            // jest.config.js
            module.exports = {
              testEnvironment: 'jsdom',
              setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
              moduleNameMapper: {
                '^@/(.*)$': '<rootDir>/src/$1',
                '\\.(css|scss)$': 'identity-obj-proxy',
                '\\.(png|jpg|svg)$': '<rootDir>/tests/fileMock.js',
              },
            }

            // jest.setup.js
            import '@testing-library/jest-dom'      // adds toBeInTheDocument, toHaveTextContent, ...
            `,
          note: 'Testing Library unmounts rendered components after each test automatically, so no manual cleanup is needed.',
        },
        {
          title: 'First component test',
          lang: 'jsx',
          code: c`
            // src/Greeting.test.jsx
            import { render, screen } from '@testing-library/react'
            import Greeting from './Greeting'

            test('greets the user', () => {
              render(<Greeting name="Ana" />)
              expect(screen.getByRole('heading', { name: 'Hello, Ana' })).toBeInTheDocument()
            })
            `,
        },
        {
          title: 'jest-dom matchers',
          lang: 'jsx',
          code: c`
            expect(el).toBeInTheDocument()
            expect(el).toBeVisible()
            expect(el).toBeDisabled()       // / toBeEnabled()
            expect(el).toHaveTextContent(/total: ₱1,299/i)
            expect(input).toHaveValue('ana@example.com')
            expect(checkbox).toBeChecked()
            expect(el).toHaveClass('active')
            expect(el).toHaveAttribute('href', '/docs')
            expect(input).toHaveAccessibleName('Email')
            expect(form).toHaveFormValues({ email: 'ana@example.com', remember: true })
            `,
        },
      ],
    },
    {
      id: 'rtl-queries',
      title: 'Queries: finding elements',
      group: 'React',
      items: [
        {
          title: 'Query priority (top = best)',
          lang: 'jsx',
          code: c`
            screen.getByRole('button', { name: /save/i })          // 1. role + accessible name
            screen.getByLabelText('Email')                         // 2. form fields by label
            screen.getByPlaceholderText('Search…')
            screen.getByText('Payment received')                   // 3. non-interactive text
            screen.getByDisplayValue('Ana')                        // current input value
            screen.getByAltText('Company logo')
            screen.getByTitle('Close')
            screen.getByTestId('cart-count')                       // last resort: data-testid
            `,
          note: 'Querying the way users and screen readers find things makes tests survive markup changes and catches accessibility gaps.',
        },
        {
          title: 'getBy vs queryBy vs findBy',
          lang: 'jsx',
          code: c`
            screen.getByRole('alert')            // throws if 0 or >1 match       → element must be there
            screen.queryByRole('alert')          // returns null if missing       → assert absence
            await screen.findByRole('alert')     // waits up to 1 s (promise)     → appears later (async)

            screen.getAllByRole('listitem')      // arrays: getAllBy / queryAllBy / findAllBy

            expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
            `,
        },
        {
          title: 'Scope queries with within',
          lang: 'jsx',
          code: c`
            import { within } from '@testing-library/react'

            const row = screen.getByRole('row', { name: /INV-1042/ })
            within(row).getByRole('button', { name: 'Delete' })

            const dialog = screen.getByRole('dialog', { name: 'Confirm' })
            expect(within(dialog).getByText('Are you sure?')).toBeVisible()
            `,
        },
        {
          title: 'See what is rendered',
          lang: 'jsx',
          code: c`
            screen.debug()                           // print the DOM
            screen.debug(screen.getByRole('form'))   // just one element
            screen.logTestingPlaygroundURL()         // link that suggests the best query
            `,
        },
      ],
    },
    {
      id: 'rtl-interactions',
      title: 'User events, forms & error states',
      group: 'React',
      items: [
        {
          title: 'Click and type with user-event',
          lang: 'jsx',
          code: c`
            import { render, screen } from '@testing-library/react'
            import userEvent from '@testing-library/user-event'
            import Counter from './Counter'

            test('increments', async () => {
              const user = userEvent.setup()
              render(<Counter />)
              await user.click(screen.getByRole('button', { name: 'Add' }))
              expect(screen.getByText('Count: 1')).toBeInTheDocument()
            })
            `,
          note: 'Call userEvent.setup() before render and await every action. user-event simulates full interactions (focus, keydown, input), unlike fireEvent.',
        },
        {
          title: 'More user-event actions',
          lang: 'jsx',
          code: c`
            await user.type(screen.getByLabelText('Email'), 'ana@example.com')
            await user.clear(screen.getByLabelText('Email'))
            await user.selectOptions(screen.getByLabelText('Country'), 'PH')
            await user.click(screen.getByLabelText('I agree'))           // checkbox
            await user.upload(screen.getByLabelText('Avatar'), new File(['x'], 'a.png', { type: 'image/png' }))
            await user.keyboard('{Enter}')
            await user.tab()
            await user.hover(screen.getByText('Help'))
            `,
        },
        {
          title: 'Test a form submit',
          lang: 'jsx',
          code: c`
            test('submits the login form', async () => {
              const onSubmit = jest.fn()
              const user = userEvent.setup()
              render(<LoginForm onSubmit={onSubmit} />)

              await user.type(screen.getByLabelText('Email'), 'ana@example.com')
              await user.type(screen.getByLabelText('Password'), 'secret123')
              await user.click(screen.getByRole('button', { name: 'Log in' }))

              expect(onSubmit).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'secret123' })
            })
            `,
        },
        {
          title: 'Validation and error states',
          lang: 'jsx',
          code: c`
            test('shows errors for an empty form', async () => {
              const user = userEvent.setup()
              render(<LoginForm onSubmit={jest.fn()} />)

              await user.click(screen.getByRole('button', { name: 'Log in' }))

              expect(screen.getByText('Email is required')).toBeInTheDocument()
              expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
              expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled()
            })
            `,
        },
        {
          title: 'Wrap components that need providers',
          lang: 'jsx',
          code: c`
            // tests/render.jsx
            import { render } from '@testing-library/react'
            import { MemoryRouter } from 'react-router'
            import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

            export function renderWithProviders(ui, { route = '/' } = {}) {
              const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
              return render(
                <QueryClientProvider client={client}>
                  <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
                </QueryClientProvider>,
              )
            }
            `,
          note: 'Use a fresh QueryClient per test and turn retries off so failing requests show the error state immediately.',
        },
      ],
    },
    {
      id: 'rtl-async',
      title: 'Async UI, API calls & hooks',
      group: 'React',
      items: [
        {
          title: 'Component that fetches data',
          lang: 'jsx',
          code: c`
            import { render, screen } from '@testing-library/react'
            import UserList from './UserList'

            beforeEach(() => {
              jest.spyOn(global, 'fetch').mockResolvedValue({
                ok: true,
                json: async () => [{ id: 1, name: 'Ana' }, { id: 2, name: 'Ben' }],
              })
            })

            test('shows users after loading', async () => {
              render(<UserList />)
              expect(screen.getByText('Loading…')).toBeInTheDocument()
              expect(await screen.findByText('Ana')).toBeInTheDocument()     // waits for the fetch
              expect(screen.getAllByRole('listitem')).toHaveLength(2)
              expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
            })
            `,
        },
        {
          title: 'Error state from a failed request',
          lang: 'jsx',
          code: c`
            test('shows an error message', async () => {
              fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
              render(<UserList />)
              expect(await screen.findByRole('alert')).toHaveTextContent(/could not load users/i)
            })
            `,
        },
        {
          title: 'waitFor and waitForElementToBeRemoved',
          lang: 'jsx',
          code: c`
            import { waitFor, waitForElementToBeRemoved } from '@testing-library/react'

            await waitFor(() => expect(saveSpy).toHaveBeenCalledTimes(1))
            await waitForElementToBeRemoved(() => screen.queryByText('Loading…'))
            `,
          note: 'Put one assertion inside waitFor and no side effects (clicks, typing); waitFor re-runs the callback until it stops throwing.',
        },
        {
          title: 'Test a custom hook with renderHook',
          lang: 'jsx',
          code: c`
            import { renderHook, act } from '@testing-library/react'
            import { useCounter } from './useCounter'

            test('useCounter', () => {
              const { result } = renderHook(() => useCounter(5))
              expect(result.current.count).toBe(5)

              act(() => result.current.increment())
              expect(result.current.count).toBe(6)
            })

            // hooks that need context
            renderHook(() => useCart(), { wrapper: ({ children }) => <CartProvider>{children}</CartProvider> })
            `,
          note: 'Import renderHook from @testing-library/react; the old @testing-library/react-hooks package is deprecated.',
        },
        {
          title: 'Mock a child component or module',
          lang: 'jsx',
          code: c`
            jest.mock('./Chart', () => function MockChart(props) {
              return <div data-testid="chart">{props.data.length} points</div>
            })

            jest.mock('@/api/users', () => ({ fetchUsers: jest.fn() }))
            import { fetchUsers } from '@/api/users'
            fetchUsers.mockResolvedValue([{ id: 1, name: 'Ana' }])
            `,
          note: 'Mock heavy children (charts, maps, editors) that jsdom cannot render, but keep the component under test real.',
        },
      ],
    },
    {
      id: 'supertest',
      title: 'Express APIs with Supertest',
      group: 'Node APIs',
      items: [
        {
          title: 'Install and split app from server',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i -D jest supertest
            `,
          then: [
            {
              label: 'src/app.js exports the app, src/server.js listens',
              lang: 'js',
              code: c`
                // src/app.js
                import express from 'express'
                import productRoutes from './routes/products.js'

                const app = express()
                app.use(express.json())
                app.use('/api/products', productRoutes)
                export default app

                // src/server.js (not imported by tests)
                import app from './app.js'
                app.listen(process.env.PORT ?? 3000, () => console.log('API ready'))
                `,
            },
          ],
          note: 'Supertest binds the app to a random free port itself, so tests never import server.js and never clash on port 3000.',
        },
        {
          title: 'GET and POST requests',
          code: c`
            import request from 'supertest'
            import app from '../src/app.js'

            describe('Products API', () => {
              test('GET /api/products returns a list', async () => {
                const res = await request(app).get('/api/products').expect(200)
                expect(res.headers['content-type']).toMatch(/json/)
                expect(res.body).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Tee' })]))
              })

              test('POST /api/products creates a product', async () => {
                const res = await request(app)
                  .post('/api/products')
                  .send({ name: 'Cap', price: 15 })
                  .expect(201)
                expect(res.body).toMatchObject({ id: expect.any(Number), name: 'Cap' })
              })

              test('POST rejects invalid data', async () => {
                const res = await request(app).post('/api/products').send({}).expect(422)
                expect(res.body.errors).toBeDefined()
              })
            })
            `,
        },
        {
          title: 'Query strings, headers, files, cookies',
          code: c`
            await request(app).get('/api/products').query({ page: 2, q: 'tee' })
            await request(app).put('/api/products/1').set('Accept', 'application/json').send({ price: 12 })
            await request(app).delete('/api/products/1').expect(204)
            await request(app).post('/api/upload').attach('file', 'tests/fixtures/photo.jpg').field('alt', 'Tee')

            const agent = request.agent(app)                 // keeps cookies between requests
            await agent.post('/auth/login').send({ email: 'ana@example.com', password: 'secret123' })
            await agent.get('/api/me').expect(200)
            `,
        },
        {
          title: 'Run API tests with the right env',
          lang: 'json',
          code: c`
            {
              "type": "module",
              "scripts": {
                "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand"
              },
              "jest": {
                "testEnvironment": "node",
                "transform": {},
                "setupFiles": ["<rootDir>/tests/env.js"]
              }
            }
            `,
          then: [
            {
              label: 'tests/env.js',
              lang: 'js',
              code: c`
                process.env.JWT_ACCESS_SECRET = 'test-secret'
                process.env.DATABASE_URL = 'sqlite::memory:'
                `,
            },
          ],
          note: 'The Express sheet uses "type": "module", hence native ESM here; with Babel you can drop the node flag and transform line. --runInBand stops test files fighting over one database.',
        },
      ],
    },
    {
      id: 'api-database',
      title: 'Database strategy for API tests',
      group: 'Node APIs',
      items: [
        {
          title: 'SQLite in memory with Sequelize',
          code: c`
            // src/models/sequelize.js
            import { Sequelize } from 'sequelize'

            export const sequelize = process.env.NODE_ENV === 'test'
              ? new Sequelize('sqlite::memory:', { logging: false })
              : new Sequelize(process.env.DATABASE_URL, { logging: false })

            // tests/products.test.js
            import { sequelize, Product } from '../src/models/index.js'

            beforeAll(async () => { await sequelize.sync({ force: true }) })   // create tables
            beforeEach(async () => {
              await Product.destroy({ truncate: true, cascade: true })
              await Product.bulkCreate([{ name: 'Tee', price: 10 }, { name: 'Cap', price: 15 }])
            })
            afterAll(async () => { await sequelize.close() })
            `,
          then: [
            {
              label: 'Install the SQLite driver',
              lang: 'bash',
              code: c`
                # same on every OS
                npm i -D sqlite3
                `,
            },
          ],
          note: 'Fast and needs no server, but SQLite differs from MySQL/Postgres (ENUM, JSON, strictness). Run critical tests against the real engine in CI.',
        },
        {
          title: 'Real test database, rolled back per test',
          code: c`
            // roll back every change a test makes (Sequelize managed CLS transactions)
            import { createNamespace } from 'cls-hooked'
            import { Sequelize } from 'sequelize'
            Sequelize.useCLS(createNamespace('tests'))     // must run before new Sequelize(...)

            let tx
            beforeEach(async () => { tx = await sequelize.transaction() })
            afterEach(async () => { await tx.rollback() })
            `,
          note: 'Each test sees a clean database without truncating tables. Only works when all queries go through the same connection; Sequelize v7 changes the CLS setup, so check its docs.',
        },
        {
          title: 'Start a real database for local runs',
          lang: 'bash',
          code: c`
            # same on every OS (needs Docker; see the Docker sheet)
            docker run -d --name test-db -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=app_test -p 5433:5432 postgres:17
            `,
          then: [
            {
              label: 'Point the tests at it for one run',
              lang: 'bash',
              code: c`
                # macOS / Linux
                DATABASE_URL=postgres://postgres:secret@localhost:5433/app_test npm test

                # Windows (PowerShell)
                $env:DATABASE_URL = "postgres://postgres:secret@localhost:5433/app_test"; npm test
                `,
            },
          ],
        },
        {
          title: 'Global setup: migrate once before all files',
          code: c`
            // jest.config.js
            export default {
              globalSetup: '<rootDir>/tests/global-setup.js',
              globalTeardown: '<rootDir>/tests/global-teardown.js',
            }

            // tests/global-setup.js
            import { execSync } from 'node:child_process'
            export default async () => {
              execSync('npx sequelize-cli db:migrate --env test', { stdio: 'inherit' })
            }
            `,
          note: 'globalSetup runs in its own context: variables set there are not visible in tests (only process.env is shared).',
        },
      ],
    },
    {
      id: 'api-auth',
      title: 'Auth headers & external services',
      group: 'Node APIs',
      items: [
        {
          title: 'Sign a JWT in the test',
          code: c`
            import jwt from 'jsonwebtoken'
            import request from 'supertest'
            import app from '../src/app.js'

            const tokenFor = (user) =>
              jwt.sign({ sub: String(user.id), role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '5m' })

            test('rejects requests without a token', async () => {
              await request(app).get('/api/products').expect(401)
            })

            test('admin can delete', async () => {
              await request(app)
                .delete('/api/products/1')
                .set('Authorization', 'Bearer ' + tokenFor({ id: 1, role: 'admin' }))
                .expect(204)
            })

            test('editor gets 403', async () => {
              await request(app)
                .delete('/api/products/1')
                .set('Authorization', 'Bearer ' + tokenFor({ id: 2, role: 'editor' }))
                .expect(403)
            })
            `,
          note: 'Matches the requireAuth middleware from the Express sheet. Set JWT_ACCESS_SECRET in a setupFiles script so app and test share it.',
        },
        {
          title: 'Or log in through the API once',
          code: c`
            let token
            beforeAll(async () => {
              await User.create({ email: 'ana@example.com', password: 'secret123', role: 'admin' })
              const res = await request(app).post('/auth/login').send({ email: 'ana@example.com', password: 'secret123' })
              token = res.body.accessToken
            })

            test('GET /api/me', async () => {
              const res = await request(app).get('/api/me').set('Authorization', 'Bearer ' + token).expect(200)
              expect(res.body.email).toBe('ana@example.com')
            })
            `,
        },
        {
          title: 'Mock external services (email, payments)',
          code: c`
            jest.mock('../src/services/mailer.js', () => ({
              sendMail: jest.fn().mockResolvedValue({ id: 'test' }),
            }))
            import { sendMail } from '../src/services/mailer.js'

            test('signup sends a welcome email', async () => {
              await request(app).post('/auth/signup').send({ email: 'ben@example.com', password: 'secret123' }).expect(201)
              expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'ben@example.com' }))
            })
            `,
          note: 'Mock at your own wrapper module (services/mailer.js), not the vendor SDK, so tests stay simple when the vendor changes. In native ESM use jest.unstable_mockModule instead.',
        },
      ],
    },
    {
      id: 'coverage',
      title: 'Coverage',
      group: 'Coverage & CI',
      items: [
        {
          title: 'Collect coverage',
          lang: 'bash',
          code: c`
            # same on every OS
            npx jest --coverage
            npx jest --coverage --collectCoverageFrom="src/**/*.js"
            `,
          then: [
            {
              label: 'Open the HTML report (macOS / Linux)',
              lang: 'bash',
              code: c`
                open coverage/lcov-report/index.html        # Linux: xdg-open coverage/lcov-report/index.html
                `,
            },
            {
              label: 'Open the HTML report (Windows PowerShell)',
              lang: 'powershell',
              code: c`
                start coverage/lcov-report/index.html
                `,
            },
          ],
        },
        {
          title: 'Thresholds and reporters (jest.config.js)',
          code: c`
            module.exports = {
              collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.stories.*', '!src/main.*'],
              coverageReporters: ['text', 'text-summary', 'html', 'lcov'],   // lcov for Codecov / Sonar
              coverageThreshold: {
                global: { branches: 80, functions: 80, lines: 80, statements: 80 },
                './src/payments/': { branches: 95, lines: 95 },            // stricter for critical code
              },
              coverageProvider: 'babel',      // or 'v8' (faster, no instrumentation)
            }
            `,
          note: 'The run fails when coverage drops below a threshold. Aim coverage at code that matters rather than chasing 100%.',
        },
        {
          title: 'Ignore code on purpose',
          code: c`
            /* istanbul ignore next */          // babel provider
            /* c8 ignore next */                // v8 provider
            function devOnlyHelper() { /* ... */ }
            `,
        },
      ],
    },
    {
      id: 'ci',
      title: 'GitHub Actions',
      group: 'Coverage & CI',
      items: [
        {
          title: '.github/workflows/test.yml',
          lang: 'yaml',
          code: c`
            name: Tests
            on:
              pull_request:
              push:
                branches: [main]

            permissions:
              contents: read

            jobs:
              test:
                runs-on: ubuntu-latest
                timeout-minutes: 15
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm
                  - run: npm ci
                  - run: npm test -- --ci --coverage
                    env:
                      TZ: UTC
                  - uses: actions/upload-artifact@v4
                    if: ${GH} !cancelled() }}
                    with:
                      name: coverage
                      path: coverage/
                      retention-days: 14
            `,
          note: '--ci makes missing snapshots fail instead of being written. Download the coverage artifact from the run page and open lcov-report/index.html.',
        },
        {
          title: 'Test on several Node versions',
          lang: 'yaml',
          code: c`
            jobs:
              test:
                runs-on: ubuntu-latest
                strategy:
                  matrix:
                    node: [20, 22, 24]
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: ${GH} matrix.node }}
                      cache: npm
                  - run: npm ci
                  - run: npm test -- --ci
            `,
        },
        {
          title: 'API tests against a real Postgres',
          lang: 'yaml',
          code: c`
                services:
                  postgres:
                    image: postgres:17
                    env:
                      POSTGRES_PASSWORD: secret
                      POSTGRES_DB: app_test
                    ports: ['5432:5432']
                    options: >-
                      --health-cmd="pg_isready" --health-interval=10s --health-timeout=5s --health-retries=5
                steps:
                  # ... checkout, setup-node, npm ci ...
                  - run: npm test -- --ci --runInBand
                    env:
                      DATABASE_URL: postgres://postgres:secret@localhost:5432/app_test
                      JWT_ACCESS_SECRET: ci-test-secret
            `,
          note: 'See the CI/CD sheet for full Node pipelines, caching and deploy steps.',
        },
        {
          title: 'Shard a large suite across machines',
          lang: 'yaml',
          code: c`
                strategy:
                  matrix:
                    shard: [1/3, 2/3, 3/3]
                steps:
                  # ... checkout, setup-node, npm ci ...
                  - run: npx jest --ci --shard=${GH} matrix.shard }}
            `,
        },
      ],
    },
    {
      id: 'vitest',
      title: 'Vitest for Vite projects',
      group: 'Vitest',
      items: [
        {
          title: 'Install',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i -D vitest
            npm i -D jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event   # React
            npm i -D @vitest/coverage-v8                                                                                 # coverage
            `,
          note: 'Vitest reuses vite.config.js (aliases, plugins, JSX, TypeScript, ESM), so none of the Babel/ts-jest/moduleNameMapper setup above is needed.',
        },
        {
          title: 'Config: test block in vite.config.js',
          code: c`
            // vite.config.js
            import { defineConfig } from 'vitest/config'
            import react from '@vitejs/plugin-react'

            export default defineConfig({
              plugins: [react()],
              resolve: { alias: { '@': '/src' } },    // shared by the app and the tests
              test: {
                environment: 'jsdom',                 // 'node' (default) for APIs
                globals: true,                        // describe/test/expect without imports, like Jest
                setupFiles: ['./src/test/setup.js'],
                css: false,
                clearMocks: true,
                restoreMocks: true,
                coverage: { provider: 'v8', reporter: ['text', 'html', 'lcov'], thresholds: { lines: 80 } },
              },
            })
            `,
          then: [
            {
              label: 'src/test/setup.js',
              lang: 'js',
              code: c`
                import '@testing-library/jest-dom/vitest'
                `,
            },
            {
              label: 'tsconfig.json: types for globals: true',
              lang: 'json',
              code: c`
                {
                  "compilerOptions": { "types": ["vitest/globals", "@testing-library/jest-dom"] }
                }
                `,
            },
          ],
          note: 'A separate vitest.config.js works too and takes priority over vite.config.js. With globals: false, import describe, test, expect and vi from \'vitest\'.',
        },
        {
          title: 'Jest → Vitest API',
          lang: 'text',
          code: c`
            Jest                              Vitest
            jest.fn()                         vi.fn()
            jest.spyOn(obj, 'm')              vi.spyOn(obj, 'm')
            jest.mock('./api')                vi.mock('./api')              (hoisted, works in ESM)
            jest.requireActual('./api')       await vi.importActual('./api')
            jest.mocked(fn)                   vi.mocked(fn)
            jest.useFakeTimers()              vi.useFakeTimers()
            jest.advanceTimersByTime(1000)    vi.advanceTimersByTime(1000)
            jest.setSystemTime(date)          vi.setSystemTime(date)
            jest.clearAllMocks()              vi.clearAllMocks()
            jest.resetModules()               vi.resetModules()
            testEnvironment: 'jsdom'          test: { environment: 'jsdom' }
            setupFilesAfterEnv                test: { setupFiles }
            moduleNameMapper                  resolve.alias (from vite.config)
            expect / matchers / snapshots     same API
            `,
        },
        {
          title: 'vi.mock with a partial factory',
          code: c`
            import { vi, test, expect } from 'vitest'
            import { getUser } from './api'

            vi.mock('./api', async (importOriginal) => ({
              ...(await importOriginal()),
              getUser: vi.fn(),
            }))

            test('greets', async () => {
              vi.mocked(getUser).mockResolvedValue({ name: 'Ana' })
              expect(await greet(1)).toBe('Hello, Ana')
            })
            `,
          note: 'In a vi.mock factory, the default export must be returned as default: { ... } (there is no __esModule flag).',
        },
        {
          title: 'Commands',
          lang: 'json',
          code: c`
            {
              "scripts": {
                "test": "vitest",
                "test:run": "vitest run",
                "test:coverage": "vitest run --coverage",
                "test:ui": "vitest --ui"
              }
            }
            `,
          then: [
            {
              label: 'CLI (same on every OS)',
              lang: 'bash',
              code: c`
                npx vitest                       # watch mode by default (vitest run in CI)
                npx vitest run src/cart          # files matching a path
                npx vitest run -t "coupon"       # tests matching a name
                npx vitest run -u                # update snapshots
                `,
            },
          ],
          note: 'Unlike Jest, plain vitest starts in watch mode locally; it switches to a single run automatically when CI=true. vitest --ui needs @vitest/ui.',
        },
      ],
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      group: 'Troubleshooting',
      items: [
        {
          title: 'Error → fix',
          lang: 'text',
          code: c`
            SyntaxError: Cannot use import statement outside a module
                → no transform for ESM: add babel.config.cjs with @babel/preset-env, use ts-jest,
                  or run native ESM with --experimental-vm-modules and transform: {}
            SyntaxError: Unexpected token 'export' / '<' inside node_modules/some-lib
                → the package ships untranspiled ESM: transformIgnorePatterns (see below)
            Unexpected token '.' / '<' importing a .css, .svg or .png file
                → moduleNameMapper → identity-obj-proxy / tests/fileMock.js
            ReferenceError: document is not defined / window is not defined
                → testEnvironment: 'jsdom' (and npm i -D jest-environment-jsdom)
            Test environment jest-environment-jsdom cannot be found
                → npm i -D jest-environment-jsdom (not bundled since Jest 28)
            Cannot find module '@/components/Button'
                → add '^@/(.*)$': '<rootDir>/src/$1' to moduleNameMapper
            SyntaxError: Cannot use 'import.meta' outside a module (Vite's import.meta.env)
                → read env in one module and jest.mock it, or switch the project to Vitest
            ReferenceError: jest is not defined (native ESM)
                → import { jest } from '@jest/globals'
            The module factory of jest.mock() is not allowed to reference out-of-scope variables
                → rename the variable to start with "mock" (mockSend)
            `,
        },
        {
          title: 'Transform an ESM-only package in node_modules',
          code: c`
            // jest.config.js: node_modules is skipped by default; whitelist the packages that need Babel
            module.exports = {
              transformIgnorePatterns: ['/node_modules/(?!(nanoid|uuid|lodash-es)/)'],
            }
            `,
          note: 'This needs a babel.config.cjs (not .babelrc), because .babelrc does not apply to node_modules.',
        },
        {
          title: 'Warning: An update to X inside a test was not wrapped in act(...)',
          lang: 'jsx',
          code: c`
            // state changed after the test stopped waiting: wait for the final UI instead
            await user.click(screen.getByRole('button', { name: 'Save' }))
            expect(await screen.findByText('Saved')).toBeInTheDocument()

            // timers: advance inside act
            act(() => { jest.advanceTimersByTime(1000) })
            `,
          note: 'Testing Library\'s render, user-event and findBy already wrap act; the warning almost always means a missing await or findBy.',
        },
        {
          title: 'Jest did not exit / open handles',
          lang: 'bash',
          code: c`
            # same on every OS
            npx jest --detectOpenHandles        # shows what is still running (server, DB pool, timer)
            npx jest --forceExit                # last resort: kills the process after tests
            `,
          then: [
            {
              label: 'Usual fix: close what you opened',
              lang: 'js',
              code: c`
                afterAll(async () => {
                  await sequelize.close()      // DB pool
                  await redis.quit()
                  server?.close()              // only if a test called app.listen
                })
                `,
            },
          ],
        },
        {
          title: 'Timeouts and flaky or leaking tests',
          lang: 'text',
          code: c`
            Exceeded timeout of 5000 ms   → missing await / unresolved promise / real network call;
                                             raise with test(name, fn, 30_000) or testTimeout only if truly slow
            Passes alone, fails in suite  → shared state: clearMocks/restoreMocks: true, reset DB in beforeEach,
                                             jest.resetModules() for module-level state
            Mock from one test in another → mockReturnValue set at top level + clearMocks only clears calls;
                                             set it in beforeEach or enable resetMocks
            DB tests collide              → --runInBand, or one database / schema per worker (JEST_WORKER_ID)
            Different on CI               → TZ=UTC, fixed dates with setSystemTime, never depend on test order
            `,
        },
      ],
    },
  ],
}
