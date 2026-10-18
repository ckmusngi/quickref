import { c } from './shared/code.js'

const GH = '${{' // GitHub Actions expression opener (avoids template interpolation)

export default {
  slug: 'playwright',
  title: 'Playwright',
  tech: 'Playwright',
  category: 'testing',
  minutes: 35,
  lang: 'ts',
  description: 'End-to-end testing with Playwright: setup on Windows, macOS and Linux, config and web server, locators, actions and assertions, logging in once, network mocking, API tests, page objects, visual and accessibility checks, debugging with UI mode and traces, CI on GitHub Actions, and pytest-playwright for Python.',
  sections: [
    {
      id: 'project-setup',
      title: 'Project setup, step by step',
      group: 'Setup',
      items: [
        {
          title: '1. Install Playwright',
          lang: 'bash',
          code: c`
            # same on every OS (needs Node.js 18+; see the Node sheet)
            npm init playwright@latest
            #   TypeScript or JavaScript · tests folder: tests (or e2e) · GitHub Actions workflow: yes/no · install browsers: yes
            `,
          note: 'Creates playwright.config.ts, an example test and (optionally) .github/workflows/playwright.yml, then downloads Chromium, Firefox and WebKit.',
        },
        {
          title: '2. Add to an existing project / install browsers again',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i -D @playwright/test
            npx playwright install                 # download the browsers
            npx playwright install chromium        # just one browser (faster in CI)
            `,
          then: [
            {
              label: 'Linux (Ubuntu / Debian / WSL): also install system libraries',
              lang: 'bash',
              code: c`
                npx playwright install --with-deps
                `,
            },
          ],
          note: 'macOS and Windows need no extra system packages. Browsers are cached in ~/Library/Caches/ms-playwright (macOS), ~/.cache/ms-playwright (Linux) or %USERPROFILE%\\AppData\\Local\\ms-playwright (Windows).',
        },
        {
          title: '3. playwright.config.ts',
          code: c`
            import { defineConfig, devices } from '@playwright/test'

            export default defineConfig({
              testDir: './tests',
              fullyParallel: true,
              forbidOnly: !!process.env.CI,          // fail CI if a test.only was left in
              retries: process.env.CI ? 2 : 0,
              workers: process.env.CI ? 1 : undefined,
              reporter: [['html', { open: 'never' }], ['list']],
              use: {
                baseURL: 'http://localhost:5173',     // page.goto('/login') → http://localhost:5173/login
                trace: 'on-first-retry',              // record a trace when a test is retried
                screenshot: 'only-on-failure',
                video: 'retain-on-failure',
              },
              projects: [
                { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
                { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
                { name: 'webkit', use: { ...devices['Desktop Safari'] } },
                { name: 'mobile', use: { ...devices['Pixel 7'] } },
              ],
              webServer: {
                command: 'npm run dev',               // started before the tests, stopped after
                url: 'http://localhost:5173',
                reuseExistingServer: !process.env.CI,
                timeout: 120_000,
              },
            })
            `,
        },
        {
          title: '4. First test (tests/home.spec.ts)',
          code: c`
            import { test, expect } from '@playwright/test'

            test('home page shows the product list', async ({ page }) => {
              await page.goto('/')
              await expect(page).toHaveTitle(/QuickRef/)
              await page.getByRole('link', { name: 'All Sheets' }).click()
              await expect(page).toHaveURL(/\/sheets/)
              await expect(page.getByRole('heading', { name: 'All sheets' })).toBeVisible()
            })
            `,
        },
        {
          title: '5. Run the tests',
          lang: 'bash',
          code: c`
            # same on every OS
            npx playwright test                        # all tests, headless, all projects
            npx playwright test tests/home.spec.ts     # one file
            npx playwright test -g "product list"      # tests whose title matches
            npx playwright test --project=chromium     # one browser
            npx playwright test --headed               # watch the browser
            npx playwright test --ui                   # UI mode: pick, watch, time-travel
            npx playwright show-report                 # open the last HTML report
            `,
          then: [
            {
              label: 'package.json scripts',
              lang: 'json',
              code: c`
                {
                  "scripts": {
                    "test:e2e": "playwright test",
                    "test:e2e:ui": "playwright test --ui"
                  }
                }
                `,
            },
          ],
        },
        {
          title: '6. Test a Laravel, Django or Express app',
          code: c`
            // playwright.config.ts → webServer for your backend
            webServer: {
              command: 'php artisan serve --port=8000',            // Laravel
              // command: 'python manage.py runserver 8000',       // Django
              // command: 'uvicorn app.main:app --port 8000',      // FastAPI
              // command: 'node --env-file=.env src/server.js',    // Express
              url: 'http://localhost:8000',
              reuseExistingServer: !process.env.CI,
            },
            use: { baseURL: 'http://localhost:8000' },
            `,
          note: 'Playwright tests the app through a real browser, whatever language the backend uses. Keep the JS test project in an e2e/ folder next to your PHP or Python code.',
        },
        {
          title: 'Ignore generated files',
          lang: 'text',
          code: c`
            # .gitignore
            /test-results/
            /playwright-report/
            /blob-report/
            /playwright/.cache/
            /playwright/.auth/
            `,
        },
      ],
    },
    {
      id: 'locators',
      title: 'Locators: finding elements',
      group: 'Writing tests',
      items: [
        {
          title: 'Prefer user-facing locators',
          code: c`
            page.getByRole('button', { name: 'Save' })             // best: how users and screen readers see it
            page.getByRole('heading', { name: 'Orders', level: 1 })
            page.getByRole('link', { name: /sign up/i })
            page.getByLabel('Email')                               // <label for="email">Email</label>
            page.getByPlaceholder('Search…')
            page.getByText('Payment received')                     // visible text (substring)
            page.getByText('Total', { exact: true })
            page.getByAltText('Company logo')
            page.getByTitle('Close')
            page.getByTestId('cart-count')                         // data-testid="cart-count"
            `,
          note: 'Order of preference: role → label → text → test id → CSS. CSS and XPath selectors break when markup or classes change.',
        },
        {
          title: 'Narrow down: chain, filter, nth',
          code: c`
            const row = page.getByRole('row').filter({ hasText: 'INV-1042' })
            await row.getByRole('button', { name: 'Delete' }).click()

            page.getByRole('listitem').filter({ has: page.getByText('Out of stock') })
            page.getByRole('listitem').filter({ hasNotText: 'Archived' })
            page.getByRole('listitem').first()
            page.getByRole('listitem').nth(2)                      // zero-based
            page.getByRole('listitem').last()

            await expect(page.getByRole('listitem')).toHaveCount(5)
            `,
        },
        {
          title: 'CSS, XPath and frames when you must',
          code: c`
            page.locator('.product-card >> text=Tee')
            page.locator('#checkout form input[name="zip"]')
            page.locator('xpath=//table//tr[2]/td[3]')

            const frame = page.frameLocator('iframe[title="Payment"]')
            await frame.getByLabel('Card number').fill('4242 4242 4242 4242')
            `,
        },
        {
          title: 'Add test ids to your markup',
          lang: 'html',
          code: c`
            <span data-testid="cart-count">3</span>
            `,
          then: [
            {
              label: 'Use a different attribute name (playwright.config.ts)',
              lang: 'ts',
              code: c`
                use: { testIdAttribute: 'data-test' }
                `,
            },
          ],
          note: 'Use test ids for elements with no stable role or text (counters, charts, icons).',
        },
      ],
    },
    {
      id: 'actions',
      title: 'Actions',
      group: 'Writing tests',
      items: [
        {
          title: 'Click, type, select, check',
          code: c`
            await page.getByRole('button', { name: 'Add to cart' }).click()
            await page.getByRole('button', { name: 'Menu' }).dblclick()
            await page.getByLabel('Email').fill('ana@example.com')     // clears then types
            await page.getByLabel('Search').pressSequentially('tee', { delay: 50 })   // key by key
            await page.getByLabel('Search').press('Enter')
            await page.getByLabel('Country').selectOption('PH')
            await page.getByLabel('I agree').check()
            await page.getByLabel('Newsletter').uncheck()
            await page.getByText('Profile').hover()
            await page.keyboard.press('Control+A')
            `,
          note: 'Actions auto-wait: Playwright waits until the element is visible, enabled and stable before acting, so you rarely need manual waits.',
        },
        {
          title: 'Upload and download files',
          code: c`
            await page.getByLabel('Avatar').setInputFiles('tests/fixtures/avatar.png')
            await page.getByLabel('Attachments').setInputFiles(['a.pdf', 'b.pdf'])

            const downloadPromise = page.waitForEvent('download')
            await page.getByRole('button', { name: 'Export CSV' }).click()
            const download = await downloadPromise
            await download.saveAs('test-results/' + download.suggestedFilename())
            `,
        },
        {
          title: 'Dialogs, new tabs and drag & drop',
          code: c`
            page.once('dialog', dialog => dialog.accept())          // confirm() / alert()
            await page.getByRole('button', { name: 'Delete' }).click()

            const popupPromise = page.context().waitForEvent('page')
            await page.getByRole('link', { name: 'Open docs' }).click()
            const docs = await popupPromise
            await expect(docs).toHaveURL(/docs/)

            await page.getByText('Task 1').dragTo(page.getByTestId('done-column'))
            `,
        },
        {
          title: 'Navigation and waiting',
          code: c`
            await page.goto('/products?page=2')
            await page.goBack()
            await page.reload()
            await page.waitForURL('**/checkout/success')
            await page.waitForLoadState('networkidle')             // use sparingly
            const res = await page.waitForResponse(r => r.url().includes('/api/cart') && r.ok())
            `,
          note: 'Avoid page.waitForTimeout(): fixed sleeps make tests slow and flaky. Wait for a URL, response or assertion instead.',
        },
      ],
    },
    {
      id: 'assertions',
      title: 'Assertions',
      group: 'Writing tests',
      items: [
        {
          title: 'Web-first assertions (auto-retrying)',
          code: c`
            await expect(page.getByText('Saved')).toBeVisible()
            await expect(page.getByRole('dialog')).toBeHidden()
            await expect(page.getByRole('button', { name: 'Pay' })).toBeEnabled()
            await expect(page.getByLabel('Email')).toHaveValue('ana@example.com')
            await expect(page.getByTestId('total')).toHaveText('₱1,299.00')
            await expect(page.getByTestId('total')).toContainText('1,299')
            await expect(page.getByRole('listitem')).toHaveCount(3)
            await expect(page.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs')
            await expect(page.locator('.alert')).toHaveClass(/alert-success/)
            await expect(page).toHaveURL('/dashboard')
            await expect(page).toHaveTitle(/Dashboard/)
            `,
          note: 'These keep retrying until they pass or time out (5 s by default), so they work with loading states and animations.',
        },
        {
          title: 'Negation, soft assertions and timeouts',
          code: c`
            await expect(page.getByText('Error')).not.toBeVisible()

            await expect.soft(page.getByTestId('tax')).toHaveText('₱139.00')   // records failure, keeps going
            await expect.soft(page.getByTestId('total')).toHaveText('₱1,299.00')

            await expect(page.getByText('Report ready')).toBeVisible({ timeout: 30_000 })
            `,
        },
        {
          title: 'Plain value assertions',
          code: c`
            const count = await page.getByRole('listitem').count()
            expect(count).toBeGreaterThan(0)
            expect(await page.getByTestId('sku').textContent()).toMatch(/^TEE-\d+$/)
            expect(json).toEqual({ id: 42, status: 'paid' })
            expect(json).toMatchObject({ status: 'paid' })
            `,
          note: 'expect(value) checks once and does not retry. Prefer the locator assertions above for anything on the page.',
        },
      ],
    },
    {
      id: 'structure',
      title: 'Organising tests: hooks, steps, fixtures',
      group: 'Writing tests',
      items: [
        {
          title: 'describe, hooks, skip and only',
          code: c`
            import { test, expect } from '@playwright/test'

            test.describe('checkout', () => {
              test.beforeEach(async ({ page }) => {
                await page.goto('/cart')
              })

              test('applies a coupon', async ({ page }) => { /* ... */ })

              test('shows shipping options', async ({ page, browserName }) => {
                test.skip(browserName === 'webkit', 'Not supported on Safari yet')
                /* ... */
              })

              test.fixme('refund flow', async () => {})      // marked as broken, skipped
            })
            `,
          note: 'test.only runs a single test while you work on it. forbidOnly in the config stops it slipping into CI.',
        },
        {
          title: 'test.step for readable reports',
          code: c`
            test('buy a product', async ({ page }) => {
              await test.step('add to cart', async () => {
                await page.goto('/products/tee')
                await page.getByRole('button', { name: 'Add to cart' }).click()
              })
              await test.step('pay', async () => {
                await page.goto('/checkout')
                await page.getByRole('button', { name: 'Pay now' }).click()
                await expect(page.getByText('Thank you')).toBeVisible()
              })
            })
            `,
        },
        {
          title: 'Custom fixtures',
          code: c`
            // tests/fixtures.ts
            import { test as base } from '@playwright/test'
            import { CartPage } from './pages/cart-page'

            export const test = base.extend<{ cartPage: CartPage }>({
              cartPage: async ({ page }, use) => {
                const cart = new CartPage(page)
                await cart.goto()
                await use(cart)              // the test runs here
                // teardown after the test (optional)
              },
            })
            export { expect } from '@playwright/test'

            // tests/cart.spec.ts
            import { test, expect } from './fixtures'
            test('empty cart message', async ({ cartPage }) => {
              await expect(cartPage.emptyMessage).toBeVisible()
            })
            `,
        },
      ],
    },
    {
      id: 'auth',
      title: 'Log in once, reuse in every test',
      group: 'Advanced',
      items: [
        {
          title: 'Setup project that saves the logged-in state',
          code: c`
            // tests/auth.setup.ts
            import { test as setup, expect } from '@playwright/test'

            const authFile = 'playwright/.auth/user.json'

            setup('log in', async ({ page }) => {
              await page.goto('/login')
              await page.getByLabel('Email').fill(process.env.E2E_EMAIL!)
              await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!)
              await page.getByRole('button', { name: 'Log in' }).click()
              await expect(page).toHaveURL('/dashboard')
              await page.context().storageState({ path: authFile })   // cookies + localStorage
            })
            `,
        },
        {
          title: 'Use it in the config',
          code: c`
            // playwright.config.ts
            projects: [
              { name: 'setup', testMatch: /.*\.setup\.ts/ },
              {
                name: 'chromium',
                use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
                dependencies: ['setup'],               // runs auth.setup.ts first
              },
            ],
            `,
          note: 'Every test now starts already logged in, which saves seconds per test. Add playwright/.auth to .gitignore: the file contains real session cookies.',
        },
        {
          title: 'A test that must start logged out',
          code: c`
            test.describe('guest', () => {
              test.use({ storageState: { cookies: [], origins: [] } })

              test('redirects to login', async ({ page }) => {
                await page.goto('/dashboard')
                await expect(page).toHaveURL(/login/)
              })
            })
            `,
        },
        {
          title: 'Test credentials from environment variables',
          lang: 'bash',
          code: c`
            # macOS / Linux
            E2E_EMAIL=test@example.com E2E_PASSWORD=secret npx playwright test

            # Windows (PowerShell)
            $env:E2E_EMAIL = "test@example.com"; $env:E2E_PASSWORD = "secret"; npx playwright test
            `,
          note: 'Use a dedicated test user and a seeded test database, never real customer accounts.',
        },
      ],
    },
    {
      id: 'network',
      title: 'Network mocking & API tests',
      group: 'Advanced',
      items: [
        {
          title: 'Mock an API response',
          code: c`
            test('shows an empty state', async ({ page }) => {
              await page.route('**/api/products*', route =>
                route.fulfill({ status: 200, json: { data: [], total: 0 } }),
              )
              await page.goto('/products')
              await expect(page.getByText('No products yet')).toBeVisible()
            })

            test('shows an error message', async ({ page }) => {
              await page.route('**/api/products*', route => route.fulfill({ status: 500 }))
              await page.goto('/products')
              await expect(page.getByRole('alert')).toContainText('Something went wrong')
            })
            `,
        },
        {
          title: 'Modify or block requests',
          code: c`
            // change a real response
            await page.route('**/api/user', async route => {
              const response = await route.fetch()
              const json = await response.json()
              await route.fulfill({ response, json: { ...json, plan: 'pro' } })
            })

            // block images and analytics to speed up tests
            await page.route(/\.(png|jpe?g|webp)$/, route => route.abort())
            await page.route('**/analytics/**', route => route.abort())
            `,
        },
        {
          title: 'Assert on a request the page sends',
          code: c`
            const requestPromise = page.waitForRequest(r => r.url().endsWith('/api/orders') && r.method() === 'POST')
            await page.getByRole('button', { name: 'Place order' }).click()
            const request = await requestPromise
            expect(request.postDataJSON()).toMatchObject({ items: [{ id: 42, qty: 1 }] })
            `,
        },
        {
          title: 'API testing without a browser',
          code: c`
            import { test, expect } from '@playwright/test'

            test('create and fetch an order', async ({ request }) => {
              const created = await request.post('/api/orders', {
                data: { product_id: 42, qty: 1 },
                headers: { Authorization: 'Bearer ' + process.env.API_TOKEN },
              })
              expect(created.status()).toBe(201)
              const { id } = await created.json()

              const fetched = await request.get('/api/orders/' + id)
              await expect(fetched).toBeOK()
              expect(await fetched.json()).toMatchObject({ id, status: 'pending' })
            })
            `,
          note: 'request uses baseURL from the config. Great for seeding data before UI tests, or testing a Laravel / Express / FastAPI API directly.',
        },
      ],
    },
    {
      id: 'pom',
      title: 'Page Object Model',
      group: 'Advanced',
      items: [
        {
          title: 'A page object',
          code: c`
            // tests/pages/login-page.ts
            import { type Page, type Locator, expect } from '@playwright/test'

            export class LoginPage {
              readonly email: Locator
              readonly password: Locator
              readonly submit: Locator

              constructor(private readonly page: Page) {
                this.email = page.getByLabel('Email')
                this.password = page.getByLabel('Password')
                this.submit = page.getByRole('button', { name: 'Log in' })
              }

              async goto() {
                await this.page.goto('/login')
              }

              async login(email: string, password: string) {
                await this.email.fill(email)
                await this.password.fill(password)
                await this.submit.click()
              }

              async expectError(message: string) {
                await expect(this.page.getByRole('alert')).toHaveText(message)
              }
            }
            `,
        },
        {
          title: 'Use it in tests',
          code: c`
            import { test, expect } from '@playwright/test'
            import { LoginPage } from './pages/login-page'

            test('wrong password shows an error', async ({ page }) => {
              const login = new LoginPage(page)
              await login.goto()
              await login.login('ana@example.com', 'wrong')
              await login.expectError('Wrong email or password')
            })
            `,
          note: 'When the login markup changes, you fix one file instead of every test.',
        },
      ],
    },
    {
      id: 'visual',
      title: 'Screenshots, visual & accessibility checks',
      group: 'Advanced',
      items: [
        {
          title: 'Screenshots and visual comparison',
          code: c`
            await page.screenshot({ path: 'test-results/home.png', fullPage: true })
            await page.getByTestId('chart').screenshot({ path: 'test-results/chart.png' })

            // visual regression: first run saves the baseline, later runs compare
            await expect(page).toHaveScreenshot('home.png', { maxDiffPixelRatio: 0.01 })
            await expect(page.getByTestId('pricing')).toHaveScreenshot()
            `,
          then: [
            {
              label: 'Update baselines after an intended design change',
              lang: 'bash',
              code: c`
                npx playwright test --update-snapshots
                `,
            },
          ],
          note: 'Fonts render slightly differently per OS, so generate and compare baselines on the same OS (usually the Linux CI image or the official Playwright Docker image).',
        },
        {
          title: 'Accessibility scan with axe',
          lang: 'bash',
          code: c`
            npm i -D @axe-core/playwright
            `,
          then: [
            {
              label: 'tests/a11y.spec.ts',
              lang: 'ts',
              code: c`
                import { test, expect } from '@playwright/test'
                import AxeBuilder from '@axe-core/playwright'

                test('home page has no detectable a11y violations', async ({ page }) => {
                  await page.goto('/')
                  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
                  expect(results.violations).toEqual([])
                })
                `,
            },
          ],
        },
        {
          title: 'Emulate devices, locale, dark mode and geolocation',
          code: c`
            test.use({
              viewport: { width: 390, height: 844 },
              locale: 'en-PH',
              timezoneId: 'Asia/Manila',
              colorScheme: 'dark',
              geolocation: { latitude: 14.5995, longitude: 120.9842 },
              permissions: ['geolocation'],
            })
            `,
        },
      ],
    },
    {
      id: 'debugging',
      title: 'Debugging',
      group: 'Debugging',
      items: [
        {
          title: 'Debugging tools',
          lang: 'bash',
          code: c`
            # same on every OS
            npx playwright test --ui                   # UI mode: watch mode, DOM snapshots per step
            npx playwright test --debug                # Playwright Inspector: step through line by line
            npx playwright test --headed --workers=1   # watch one browser at a time
            npx playwright show-trace test-results/<test>/trace.zip   # open a recorded trace
            `,
          note: 'Put await page.pause() in a test to stop there and open the inspector.',
        },
        {
          title: 'Record tests with codegen',
          lang: 'bash',
          code: c`
            npx playwright codegen http://localhost:5173
            npx playwright codegen --device="iPhone 15" http://localhost:5173
            npx playwright codegen --save-storage=playwright/.auth/user.json http://localhost:5173/login
            `,
          note: 'Click through your app and Playwright writes the test code with good locators. Clean it up and add assertions afterwards.',
        },
        {
          title: 'Debug mode from the environment',
          lang: 'bash',
          code: c`
            # macOS / Linux
            PWDEBUG=1 npx playwright test tests/cart.spec.ts
            DEBUG=pw:api npx playwright test           # log every Playwright call

            # Windows (PowerShell)
            $env:PWDEBUG = "1"; npx playwright test tests/cart.spec.ts
            `,
        },
        {
          title: 'Flaky test checklist',
          lang: 'text',
          code: c`
            Element not found / timeout       → use getByRole / getByText, check it is not inside an iframe
            Passes locally, fails in CI       → CI is slower: never waitForTimeout; assert on the end state
            Order-dependent failures          → each test must create its own data; no shared state
            Fails only in WebKit / Firefox    → real browser difference: check console errors in the trace
            Random failures in parallel runs  → tests share a user or DB rows: use separate test users / data
            Find flaky tests                  → npx playwright test --repeat-each=10
            `,
        },
      ],
    },
    {
      id: 'ci',
      title: 'Run in CI (GitHub Actions)',
      group: 'CI',
      items: [
        {
          title: '.github/workflows/playwright.yml',
          lang: 'yaml',
          code: c`
            name: Playwright
            on:
              pull_request:
              push:
                branches: [main]

            permissions:
              contents: read

            jobs:
              e2e:
                runs-on: ubuntu-latest
                timeout-minutes: 30
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm
                  - run: npm ci
                  - run: npx playwright install --with-deps chromium
                  - run: npx playwright test --project=chromium
                    env:
                      E2E_EMAIL: ${GH} secrets.E2E_EMAIL }}
                      E2E_PASSWORD: ${GH} secrets.E2E_PASSWORD }}
                  - uses: actions/upload-artifact@v4
                    if: ${GH} !cancelled() }}
                    with:
                      name: playwright-report
                      path: playwright-report/
                      retention-days: 14
            `,
          note: 'The HTML report (with traces of failed tests) is attached to the run: download it from the run page and open it with npx playwright show-report.',
        },
        {
          title: 'Split a big suite across machines (sharding)',
          lang: 'yaml',
          code: c`
            jobs:
              e2e:
                runs-on: ubuntu-latest
                strategy:
                  fail-fast: false
                  matrix:
                    shard: [1/4, 2/4, 3/4, 4/4]
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm
                  - run: npm ci
                  - run: npx playwright install --with-deps chromium
                  - run: npx playwright test --shard=${GH} matrix.shard }}
            `,
          note: 'Four machines each run a quarter of the tests. Use the blob reporter plus npx playwright merge-reports to combine them into one HTML report.',
        },
        {
          title: 'With a backend and database in CI',
          lang: 'yaml',
          code: c`
                services:
                  mysql:
                    image: mysql:8.4
                    env:
                      MYSQL_ROOT_PASSWORD: secret
                      MYSQL_DATABASE: testing
                    ports: ['3306:3306']
                    options: >-
                      --health-cmd="mysqladmin ping -h 127.0.0.1" --health-interval=10s --health-timeout=5s --health-retries=5
                steps:
                  # ... checkout, setup-php / setup-node, install, migrate + seed the test DB ...
                  - run: npx playwright test        # webServer in the config starts the app
            `,
          note: 'See the CI/CD sheet for complete Laravel, Node and Python pipelines to combine with this job.',
        },
        {
          title: 'Run in the official Docker image',
          lang: 'bash',
          code: c`
            # any OS with Docker: same browsers and fonts as Linux CI (consistent screenshots)
            docker run --rm --ipc=host -v "$(pwd)":/work -w /work mcr.microsoft.com/playwright:v1.56.0-noble /bin/bash -c "npm ci && npx playwright test"
            `,
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                docker run --rm --ipc=host -v "$($PWD.Path):/work" -w /work mcr.microsoft.com/playwright:v1.56.0-noble /bin/bash -c "npm ci && npx playwright test"
                `,
            },
          ],
          note: 'Match the image tag to the @playwright/test version in your package.json (npx playwright --version).',
        },
      ],
    },
    {
      id: 'python',
      title: 'Playwright for Python (pytest)',
      group: 'Python',
      items: [
        {
          title: 'Install',
          lang: 'bash',
          code: c`
            # inside your virtual environment (see the Python sheet), same on every OS
            pip install pytest-playwright
            playwright install            # Linux: playwright install --with-deps
            `,
        },
        {
          title: 'A test (tests/test_home.py)',
          lang: 'python',
          code: c`
            import re
            from playwright.sync_api import Page, expect


            def test_login_shows_dashboard(page: Page):
                page.goto("http://localhost:8000/login")
                page.get_by_label("Email").fill("ana@example.com")
                page.get_by_label("Password").fill("secret123")
                page.get_by_role("button", name="Log in").click()
                expect(page).to_have_url(re.compile(r".*/dashboard"))
                expect(page.get_by_role("heading", name="Dashboard")).to_be_visible()
            `,
        },
        {
          title: 'Run',
          lang: 'bash',
          code: c`
            pytest                                   # headless
            pytest --headed --browser firefox
            pytest --base-url http://localhost:8000  # then page.goto("/login")
            pytest --tracing retain-on-failure
            `,
          note: 'Django has a live server for tests: subclass StaticLiveServerTestCase and use self.live_server_url as the base URL.',
        },
      ],
    },
  ],
}
