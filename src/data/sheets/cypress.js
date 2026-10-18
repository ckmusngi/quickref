import { c, BT } from './shared/code.js'

const GH = '${{' // GitHub Actions expression opener (avoids template interpolation)

export default {
  slug: 'cypress',
  title: 'Cypress',
  tech: 'Cypress',
  category: 'testing',
  minutes: 35,
  lang: 'js',
  description: 'End-to-end and component testing with Cypress: install on macOS, Linux and Windows, config, selectors, the command queue, actions and assertions, network stubbing with cy.intercept, logging in once with cy.session, tasks and DB seeding, React + Vite component tests, debugging, CI on GitHub Actions and a comparison with Playwright.',
  sections: [
    {
      id: 'install',
      title: 'Install and open Cypress',
      group: 'Setup',
      items: [
        {
          title: '1. Install',
          lang: 'bash',
          code: c`
            # same on every OS (Cypress 15 needs Node.js 20+; see the Node sheet)
            npm i -D cypress
            npx cypress verify                       # check the binary downloaded and runs
            npx cypress version                      # package, binary, Electron and Node versions
            `,
          note: 'npm downloads the Cypress app binary into a cache (~/Library/Caches/Cypress on macOS, ~/.cache/Cypress on Linux, %LOCALAPPDATA%\\Cypress\\Cache on Windows). Cypress 14 still supports Node 18; 15 dropped it.',
        },
        {
          title: '2. Linux (Ubuntu / Debian / WSL): system libraries',
          lang: 'bash',
          code: c`
            # Ubuntu 24.04+ / Debian 13+
            sudo apt-get update
            sudo apt-get install -y libgtk2.0-0t64 libgtk-3-0t64 libgbm-dev libnotify-dev libnss3 libxss1 libasound2t64 libxtst6 xauth xvfb
            `,
          then: [
            {
              label: 'Ubuntu 22.04 / Debian 12 and older',
              lang: 'bash',
              code: c`
                sudo apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libnss3 libxss1 libasound2 libxtst6 xauth xvfb
                `,
            },
          ],
          note: 'macOS and Windows need no extra packages. Xvfb gives headless Linux machines a virtual display, which cypress run starts automatically.',
        },
        {
          title: '3. Open the app (first run scaffolds the project)',
          lang: 'bash',
          code: c`
            # same on every OS
            npx cypress open                         # Launchpad: choose E2E or Component Testing
            npx cypress open --e2e --browser chrome  # skip the Launchpad choices
            `,
          note: 'On first open, Cypress creates cypress.config.js, cypress/support/e2e.js, cypress/support/commands.js and cypress/fixtures/example.json, and can generate example specs.',
        },
        {
          title: '4. Run headless (CI style)',
          lang: 'bash',
          code: c`
            # same on every OS
            npx cypress run                                    # all e2e specs in Electron, headless
            npx cypress run --browser chrome                   # chrome | firefox | edge | electron
            npx cypress run --spec "cypress/e2e/cart.cy.js"    # one spec
            npx cypress run --spec "cypress/e2e/admin/**/*"    # a folder
            npx cypress run --headed --no-exit                 # watch it and keep the window open
            npx cypress run --component                        # component tests
            `,
          then: [
            {
              label: 'package.json scripts',
              lang: 'json',
              code: c`
                {
                  "scripts": {
                    "cy:open": "cypress open",
                    "cy:run": "cypress run",
                    "cy:ct": "cypress run --component"
                  }
                }
                `,
            },
          ],
        },
        {
          title: 'Ignore generated files',
          lang: 'text',
          code: c`
            # .gitignore
            /cypress/videos/
            /cypress/screenshots/
            /cypress/downloads/
            cypress.env.json
            `,
        },
      ],
    },
    {
      id: 'config',
      title: 'cypress.config.js',
      group: 'Setup',
      items: [
        {
          title: 'A complete starting config',
          code: c`
            import { defineConfig } from 'cypress'

            export default defineConfig({
              e2e: {
                baseUrl: 'http://localhost:5173',        // cy.visit('/login') → http://localhost:5173/login
                specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
                supportFile: 'cypress/support/e2e.js',
                setupNodeEvents(on, config) {
                  // register tasks and plugins here (runs in Node, not the browser)
                  return config
                },
              },
              viewportWidth: 1280,
              viewportHeight: 800,
              defaultCommandTimeout: 4000,               // how long cy.get / should retry (ms)
              requestTimeout: 5000,                      // cy.wait('@alias') for the request
              pageLoadTimeout: 60000,
              video: false,                              // off by default since Cypress 13
              screenshotOnRunFailure: true,
              retries: { runMode: 2, openMode: 0 },      // retry failing tests in cypress run only
              env: { apiUrl: 'http://localhost:8000/api' },
            })
            `,
          note: 'If package.json has no "type": "module", use const { defineConfig } = require(\'cypress\') and module.exports instead. TypeScript projects use cypress.config.ts with the same shape.',
        },
        {
          title: 'Override config from the command line',
          lang: 'bash',
          code: c`
            # same on every OS
            npx cypress run --config baseUrl=https://staging.example.com,video=true
            npx cypress run --config-file cypress.staging.config.js
            npx cypress run --env apiUrl=https://staging.example.com/api
            `,
        },
        {
          title: 'Per-test and per-suite config',
          code: c`
            describe('slow reports page', { defaultCommandTimeout: 15000 }, () => {
              it('renders the yearly chart', { retries: 3 }, () => { /* ... */ })
            })

            it('works on mobile', { viewportWidth: 375, viewportHeight: 667 }, () => { /* ... */ })
            it('chrome only', { browser: 'chrome' }, () => { /* ... */ })
            `,
        },
        {
          title: 'Videos and screenshots',
          code: c`
            export default defineConfig({
              video: true,                         // record cypress run (Chromium browsers + Electron)
              videoCompression: true,
              screenshotsFolder: 'cypress/screenshots',
              videosFolder: 'cypress/videos',
              trashAssetsBeforeRuns: true,         // wipe old screenshots/videos on each run
            })
            `,
          note: 'Screenshots of failing tests are taken automatically in cypress run. Video recording is not supported in Firefox or WebKit.',
        },
      ],
    },
    {
      id: 'layout',
      title: 'Folder layout and first test',
      group: 'Setup',
      items: [
        {
          title: 'Project layout',
          lang: 'text',
          code: c`
            cypress.config.js
            cypress/
              e2e/                 # end-to-end specs: *.cy.js
                auth/login.cy.js
                cart.cy.js
              component/           # component specs (or next to components: Button.cy.jsx)
              fixtures/            # static JSON / files: cy.fixture('user.json')
                user.json
              support/
                e2e.js             # runs before every e2e spec: imports commands, global hooks
                component.js       # runs before every component spec: registers cy.mount
                commands.js        # Cypress.Commands.add(...)
              downloads/ screenshots/ videos/   # generated, git-ignored
            `,
        },
        {
          title: 'First test (cypress/e2e/home.cy.js)',
          code: c`
            describe('home page', () => {
              it('shows the sheet list and opens one', () => {
                cy.visit('/')
                cy.title().should('include', 'QuickRef')
                cy.contains('a', 'All Sheets').click()
                cy.location('pathname').should('eq', '/sheets')
                cy.get('[data-cy=sheet-card]').should('have.length.greaterThan', 3)
              })
            })
            `,
          note: 'No async/await and no imports: cy, describe, it and expect are globals. Each cy command is queued and retried until it passes or times out.',
        },
        {
          title: 'TypeScript and editor autocompletion',
          lang: 'json',
          code: c`
            // cypress/tsconfig.json (or jsconfig.json for plain JS)
            {
              "compilerOptions": {
                "target": "es2020",
                "lib": ["es2020", "dom"],
                "types": ["cypress", "node"]
              },
              "include": ["**/*.ts", "**/*.js"]
            }
            `,
          note: 'For JS specs without a tsconfig, put /// <reference types="cypress" /> at the top of the file for autocompletion.',
        },
      ],
    },
    {
      id: 'start-server',
      title: 'Start the app before the tests',
      group: 'Setup',
      items: [
        {
          title: 'start-server-and-test',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i -D start-server-and-test
            `,
          then: [
            {
              label: 'package.json: start dev server, wait for the URL, run Cypress, stop the server',
              lang: 'json',
              code: c`
                {
                  "scripts": {
                    "dev": "vite",
                    "cy:run": "cypress run",
                    "test:e2e": "start-server-and-test dev http://localhost:5173 cy:run",
                    "test:e2e:open": "start-server-and-test dev http://localhost:5173 'cypress open'"
                  }
                }
                `,
            },
          ],
          note: 'Unlike Playwright, Cypress does not start your server itself. Locally you can also just run npm run dev in one terminal and npx cypress open in another.',
        },
        {
          title: 'Test a Laravel, Django or Express app',
          lang: 'json',
          code: c`
            {
              "scripts": {
                "serve:laravel": "php artisan serve --port=8000",
                "serve:django": "python manage.py runserver 8000",
                "serve:express": "node --env-file=.env src/server.js",
                "test:e2e": "start-server-and-test serve:laravel http://localhost:8000 cy:run"
              }
            }
            `,
          then: [
            {
              label: 'cypress.config.js',
              lang: 'js',
              code: c`
                e2e: { baseUrl: 'http://localhost:8000' }
                `,
            },
          ],
          note: 'Cypress drives a real browser, so the backend language does not matter. Keep a package.json at the project root (Laravel already has one) and point it at a separate test database.',
        },
        {
          title: 'Laravel and Vite together',
          lang: 'bash',
          code: c`
            # same on every OS: build assets once so you only need one server
            npm run build
            php artisan migrate:fresh --seed --env=testing
            npx start-server-and-test "php artisan serve --env=testing" http://localhost:8000 "cypress run"
            `,
          note: 'Running vite dev during tests also works, but a built bundle avoids hot-reload noise and is closer to production.',
        },
      ],
    },
    {
      id: 'structure',
      title: 'Test structure and hooks',
      group: 'Writing tests',
      items: [
        {
          title: 'describe, it and hooks',
          code: c`
            describe('cart', () => {
              before(() => {
                cy.task('db:seed')                       // once before all tests in this block
              })

              beforeEach(() => {
                cy.login('ana@example.com')              // before every test
                cy.visit('/shop')
              })

              afterEach(() => { /* rarely needed: clean up in beforeEach instead */ })

              it('adds an item', () => { /* ... */ })

              context('when the cart is empty', () => {  // context is an alias of describe
                it('shows an empty message', () => { /* ... */ })
              })
            })
            `,
          note: 'Clean up state before a test, not after: an after hook does not run if the browser crashes or you stop the run, so the next test starts dirty.',
        },
        {
          title: 'Focus and skip',
          code: c`
            it.only('runs only this test', () => {})
            describe.only('runs only this block', () => {})
            it.skip('skipped for now', () => {})
            it('todo: write me')                         // no body → shown as pending
            `,
          note: 'Remove .only before committing; a lint rule such as eslint-plugin-cypress or mocha/no-exclusive-tests catches it.',
        },
        {
          title: 'cy.visit options',
          code: c`
            cy.visit('/')                                         // relative to baseUrl
            cy.visit('/search', { qs: { q: 'shoes', page: 2 } })  // → /search?q=shoes&page=2
            cy.visit('/admin', { auth: { username: 'admin', password: 'secret' } })  // HTTP basic auth
            cy.visit('/', {
              onBeforeLoad(win) {
                win.localStorage.setItem('theme', 'dark')         // before the app's JS runs
                cy.stub(win.console, 'error').as('consoleError')
              },
            })
            cy.visit('/404', { failOnStatusCode: false })         // allow non-2xx pages
            `,
        },
        {
          title: 'Viewports and devices',
          code: c`
            cy.viewport(375, 667)                       // width, height in px
            cy.viewport('iphone-x')                     // presets: ipad-2, macbook-15, samsung-s10...
            cy.viewport('ipad-2', 'landscape')

            const sizes = ['iphone-6', 'ipad-2', [1440, 900]]
            sizes.forEach(size => {
              it('nav works on ' + size, () => {
                Array.isArray(size) ? cy.viewport(size[0], size[1]) : cy.viewport(size)
                cy.visit('/')
                cy.get('[data-cy=nav]').should('be.visible')
              })
            })
            `,
          note: 'cy.viewport only resizes the window; it does not change the user agent or emulate touch like Playwright devices do.',
        },
        {
          title: 'Test isolation',
          code: c`
            // default since Cypress 12: before each test the page is blanked and
            // cookies, localStorage and sessionStorage are cleared
            export default defineConfig({
              e2e: { testIsolation: true },
            })
            `,
          note: 'Every test must be able to run on its own; do not rely on the page left behind by the previous test. Use cy.session to avoid logging in through the UI each time.',
        },
      ],
    },
    {
      id: 'selectors',
      title: 'Selecting elements',
      group: 'Writing tests',
      items: [
        {
          title: 'Best practice: dedicated data-cy attributes',
          lang: 'html',
          code: c`
            <button class="btn btn-primary" data-cy="checkout">Checkout</button>
            <span data-cy="cart-count">3</span>
            `,
          then: [
            {
              label: 'In the test',
              lang: 'js',
              code: c`
                cy.get('[data-cy=checkout]').click()       // best: survives CSS and copy changes
                cy.contains('button', 'Checkout').click()  // good if the text is part of the behaviour
                cy.get('#main button.btn-primary')         // brittle: breaks when styling changes
                `,
            },
          ],
          note: 'Cypress recommends data-cy (or data-test / data-testid). Add a helper command cy.getByCy(\'checkout\') if you use them everywhere.',
        },
        {
          title: 'get, contains, find, within',
          code: c`
            cy.get('[data-cy=todo]')                        // all matches in the document
            cy.contains('Payment received')                 // deepest element containing the text
            cy.contains('li', 'Milk')                       // a <li> containing "Milk"
            cy.contains(/^total$/i)                         // regex
            cy.get('[data-cy=order-row]').find('button')    // descendants of the previous subject
            cy.get('form[data-cy=signup]').within(() => {   // scope every command inside
              cy.get('input[name=email]').type('ana@example.com')
              cy.contains('button', 'Sign up').click()
            })
            `,
          note: 'cy.get always searches from the document root, even when chained; use .find to search inside the previous subject.',
        },
        {
          title: 'Traverse and filter',
          code: c`
            cy.get('li').first()
            cy.get('li').last()
            cy.get('li').eq(2)                              // zero-based; eq(-1) is the last
            cy.get('li').filter('.active')
            cy.get('li').not('.archived')
            cy.get('[data-cy=price]').parent()
            cy.get('[data-cy=price]').closest('tr')
            cy.get('td').siblings()
            cy.get('input').next()                          // also prev, children, parents
            cy.focused()                                    // element that currently has focus
            `,
        },
        {
          title: 'Accessible queries with Testing Library',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i -D @testing-library/cypress
            `,
          then: [
            {
              label: 'cypress/support/commands.js and a test',
              lang: 'js',
              code: c`
                import '@testing-library/cypress/add-commands'

                cy.findByRole('button', { name: 'Save' }).click()
                cy.findByLabelText('Email').type('ana@example.com')
                cy.findAllByRole('listitem').should('have.length', 3)
                `,
            },
          ],
          note: 'Gives you Playwright-style getByRole queries in Cypress.',
        },
      ],
    },
    {
      id: 'command-queue',
      title: 'The command queue, .then and aliases',
      group: 'Writing tests',
      items: [
        {
          title: 'Commands are queued, not promises',
          code: c`
            it('reads the count', () => {
              let count
              cy.get('[data-cy=cart-count]').then($el => {
                count = Number($el.text())
              })
              console.log(count)      // undefined! runs before the queued commands execute

              cy.get('[data-cy=cart-count]').then($el => {
                const n = Number($el.text())
                cy.get('[data-cy=add]').click()
                cy.get('[data-cy=cart-count]').should('have.text', String(n + 1))
              })
            })
            `,
          note: 'cy commands return a chainer, not a promise: you cannot await them or assign their result. Cypress runs the queue after the test function returns.',
        },
        {
          title: 'Aliases with .as and @',
          code: c`
            cy.get('[data-cy=todo-list] li').as('todos')
            cy.get('@todos').should('have.length', 3)        // re-queries the DOM

            cy.fixture('user.json').as('user')
            cy.get('@user').then(user => {
              cy.get('#email').type(user.email)
            })

            // in a function () {} test (not an arrow), aliases are on this
            beforeEach(() => { cy.fixture('user.json').as('user') })
            it('uses this.user', function () {
              cy.get('#email').type(this.user.email)
            })
            `,
        },
        {
          title: 'wrap, invoke, its',
          code: c`
            cy.wrap({ total: 42 }).its('total').should('eq', 42)   // put any value into the chain
            cy.wrap(apiClient.getUser(1)).its('name')              // waits for a real promise
            cy.get('input').invoke('val').should('eq', 'hello')    // call a jQuery method
            cy.get('a').invoke('removeAttr', 'target').click()     // open link in the same tab
            cy.window().its('store').invoke('getState')            // reach into the app
            cy.get('ul li').its('length').should('be.gte', 2)
            `,
        },
        {
          title: '.then vs .should',
          code: c`
            // .should(callback) is RETRIED until it passes: no cy commands inside
            cy.get('[data-cy=status]').should($el => {
              expect($el.text().trim()).to.match(/paid|shipped/)
            })

            // .then(callback) runs ONCE: use it to read values and queue more commands
            cy.get('[data-cy=order-id]').invoke('text').then(id => {
              cy.visit('/orders/' + id)
            })
            `,
        },
      ],
    },
    {
      id: 'actions',
      title: 'Actions: typing, clicking, forms',
      group: 'Writing tests',
      items: [
        {
          title: 'Type and clear',
          code: c`
            cy.get('#email').type('ana@example.com')
            cy.get('#email').clear().type('new@example.com')
            cy.get('#search').type('shoes{enter}')             // special keys in braces
            cy.get('#note').type('line 1{shift+enter}line 2')
            cy.get('#code').type('{selectall}{backspace}')
            cy.get('#password').type(Cypress.env('password'), { log: false })   // hide from the log
            cy.get('#qty').type('3', { delay: 0 })             // faster typing
            cy.get('#menu').type('{esc}{uparrow}{downarrow}{ctrl+a}')
            cy.press(Cypress.Keyboard.Keys.TAB)               // Tab key: type('{tab}') is not supported
            `,
          note: 'cy.press was added in Cypress 14.3; on older versions use the cypress-real-events plugin for Tab.',
        },
        {
          title: 'Click',
          code: c`
            cy.get('[data-cy=save]').click()
            cy.get('[data-cy=menu]').rightclick()
            cy.get('[data-cy=cell]').dblclick()
            cy.get('canvas').click(120, 45)                    // x, y within the element
            cy.get('[data-cy=card]').click('topRight')
            cy.get('[data-cy=item]').click({ multiple: true }) // click every match
            cy.get('[data-cy=hidden-btn]').click({ force: true })  // skip actionability checks (last resort)
            `,
        },
        {
          title: 'Checkboxes, radios and selects',
          code: c`
            cy.get('[type=checkbox]').check()                      // all matched checkboxes
            cy.get('[type=checkbox]').check(['news', 'offers'])    // by value
            cy.get('#terms').uncheck()
            cy.get('[type=radio]').check('express')
            cy.get('select#country').select('Philippines')         // by text or value
            cy.get('select#tags').select(['js', 'php'])            // multi-select
            cy.get('select#country').should('have.value', 'PH')
            `,
        },
        {
          title: 'Upload files with selectFile',
          code: c`
            cy.get('input[type=file]').selectFile('cypress/fixtures/avatar.png')
            cy.get('input[type=file]').selectFile(['a.pdf', 'b.pdf'].map(f => 'cypress/fixtures/' + f))
            cy.get('[data-cy=dropzone]').selectFile('cypress/fixtures/report.csv', { action: 'drag-drop' })
            cy.get('input[type=file]').selectFile({
              contents: Cypress.Buffer.from('id,name\n1,Ana'),
              fileName: 'users.csv',
              mimeType: 'text/csv',
            })
            `,
        },
        {
          title: 'trigger, hover, scroll, focus',
          code: c`
            cy.get('[data-cy=tooltip-target]').trigger('mouseover')    // no real hover in Cypress
            cy.get('[data-cy=slider]').trigger('input', { target: { value: 70 } })
            cy.get('[data-cy=handle]')
              .trigger('mousedown', { button: 0 })
              .trigger('mousemove', { clientX: 300, clientY: 0 })
              .trigger('mouseup')
            cy.get('footer').scrollIntoView()
            cy.scrollTo('bottom')
            cy.get('#email').focus().blur()
            `,
          note: 'Cypress fires simulated JS events, so CSS :hover styles do not apply. For true native events, the cypress-real-events plugin uses the Chrome DevTools Protocol (Chromium only).',
        },
      ],
    },
    {
      id: 'assertions',
      title: 'Assertions',
      group: 'Writing tests',
      items: [
        {
          title: 'should and and: common chainers',
          code: c`
            cy.get('[data-cy=alert]').should('be.visible')
            cy.get('[data-cy=alert]').should('not.exist')          // gone from the DOM
            cy.get('[data-cy=modal]').should('not.be.visible')     // in the DOM but hidden
            cy.get('h1').should('have.text', 'Orders')             // exact text
            cy.get('h1').should('contain', 'Order')                // substring
            cy.get('li').should('have.length', 3)
            cy.get('#email').should('have.value', 'ana@example.com')
            cy.get('a').should('have.attr', 'href', '/help')
            cy.get('button').should('be.disabled')                 // be.enabled, be.checked, be.focused
            cy.get('.tab').should('have.class', 'active')
            cy.get('.box').should('have.css', 'display', 'flex')
            cy.get('[data-cy=price]')
              .should('be.visible')
              .and('contain', '₱')
              .and('not.have.class', 'loading')
            `,
        },
        {
          title: 'URL, title and storage',
          code: c`
            cy.url().should('include', '/dashboard')
            cy.location('pathname').should('eq', '/dashboard')
            cy.location('search').should('eq', '?tab=billing')
            cy.title().should('eq', 'Dashboard · QuickRef')
            cy.getCookie('session').should('exist')
            cy.window().its('localStorage.theme').should('eq', 'dark')
            `,
        },
        {
          title: 'expect and assert (Chai) inside callbacks',
          code: c`
            cy.get('[data-cy=row]').should($rows => {
              expect($rows).to.have.length(3)
              expect($rows.eq(0)).to.contain('INV-1042')
              const totals = [...$rows].map(r => Number(r.dataset.total))
              expect(totals).to.deep.equal([...totals].sort((a, b) => b - a))   // sorted descending
            })

            expect(user).to.include({ role: 'admin' })
            expect(items).to.have.length.above(0)
            expect(body).to.have.property('id').that.is.a('number')
            assert.isTrue(flag, 'flag should be set')
            `,
        },
        {
          title: 'Stubs and spies (Sinon)',
          code: c`
            cy.window().then(win => {
              cy.stub(win, 'open').as('windowOpen')               // stop new tabs opening
              cy.spy(win.console, 'log').as('log')
            })
            cy.get('[data-cy=share]').click()
            cy.get('@windowOpen').should('have.been.calledOnceWith', 'https://twitter.com/share')

            cy.on('window:confirm', () => true)                    // auto-accept confirm()
            cy.on('window:alert', text => expect(text).to.eq('Saved!'))
            `,
        },
      ],
    },
    {
      id: 'retry',
      title: 'Retry-ability, timeouts and waiting',
      group: 'Writing tests',
      items: [
        {
          title: 'How retrying works',
          code: c`
            // queries (get, find, contains, its...) + the assertion after them are retried together
            cy.get('[data-cy=todo]').should('have.length', 3)    // re-queries until 3 or 4s timeout

            // actions (click, type...) are NOT retried once they have run
            cy.get('[data-cy=save]').click()

            // give one command longer
            cy.get('[data-cy=report]', { timeout: 20000 }).should('be.visible')
            cy.contains('Export ready', { timeout: 30000 })
            `,
          note: 'Put the assertion directly after the query you want retried. A command with no assertion still implicitly waits for the element to exist and be actionable.',
        },
        {
          title: 'Never wait for a fixed time',
          code: c`
            cy.wait(3000)                                      // bad: slow and still flaky

            cy.intercept('GET', '/api/orders*').as('orders')   // good: wait for the request
            cy.visit('/orders')
            cy.wait('@orders')
            cy.get('[data-cy=spinner]').should('not.exist')    // good: wait for UI state
            `,
        },
        {
          title: 'Conditional testing caveat',
          code: c`
            // risky: the banner may appear a moment AFTER this check
            cy.get('body').then($body => {
              if ($body.find('[data-cy=cookie-banner]').length) {
                cy.get('[data-cy=cookie-banner] button').click()
              }
            })

            // better: make the state deterministic before visiting
            cy.setCookie('cookie_consent', 'accepted')
            cy.visit('/')
            `,
          note: 'Cypress cannot know if an element will show up later, so if/else on the DOM is flaky. Control the state with cookies, stubs, or seeded data instead.',
        },
        {
          title: 'Control time: cy.clock and cy.tick',
          code: c`
            cy.clock(new Date('2026-01-31T09:00:00Z').getTime())  // freeze Date, setTimeout, setInterval
            cy.visit('/billing')
            cy.contains('Invoice due today')
            cy.tick(60 * 1000)                                    // jump forward one minute
            cy.contains('Session expires in 14 minutes')
            `,
        },
      ],
    },
    {
      id: 'intercept',
      title: 'Stub and spy on network requests',
      group: 'Network',
      items: [
        {
          title: 'Spy and wait on a request',
          code: c`
            cy.intercept('GET', '/api/products*').as('products')
            cy.visit('/shop')
            cy.wait('@products').its('response.statusCode').should('eq', 200)
            cy.get('[data-cy=product]').should('have.length', 12)
            `,
          note: 'Register cy.intercept BEFORE the action that triggers the request (usually before cy.visit or the click).',
        },
        {
          title: 'Stub a response with a fixture',
          code: c`
            // cypress/fixtures/products.json holds the fake body
            cy.intercept('GET', '/api/products*', { fixture: 'products.json' }).as('products')

            cy.intercept('GET', '/api/me', {
              statusCode: 200,
              body: { id: 1, name: 'Ana', role: 'admin' },
              headers: { 'x-version': '2' },
            })

            cy.intercept('GET', '/api/products', { body: [] })   // empty state
            `,
        },
        {
          title: 'Assert on the request body and headers',
          code: c`
            cy.intercept('POST', '/api/orders').as('createOrder')
            cy.get('[data-cy=place-order]').click()

            cy.wait('@createOrder').then(({ request, response }) => {
              expect(request.body).to.deep.include({ items: [{ id: 42, qty: 1 }] })
              expect(request.headers).to.have.property('authorization')
              expect(response.statusCode).to.eq(201)
            })
            `,
        },
        {
          title: 'Modify real requests and responses',
          code: c`
            cy.intercept('POST', '/api/orders', req => {
              req.headers['x-test-run'] = 'true'               // change the outgoing request
              req.body.coupon = 'TEST10'
            })

            cy.intercept('GET', '/api/products*', req => {
              req.continue(res => {                             // let it hit the server, then edit
                res.body.data[0].stock = 0
              })
            })
            `,
        },
        {
          title: 'Simulate errors, delays and offline',
          code: c`
            cy.intercept('GET', '/api/products*', { statusCode: 500, body: { message: 'Server error' } })
            cy.intercept('POST', '/api/login', { statusCode: 422, body: { errors: { email: ['Invalid'] } } })
            cy.intercept('GET', '/api/report', { fixture: 'report.json', delay: 2000 })   // test the spinner
            cy.intercept('GET', '/api/products*', { forceNetworkError: true })           // network failure
            `,
        },
        {
          title: 'GraphQL: alias by operation name',
          code: c`
            cy.intercept('POST', '/graphql', req => {
              if (req.body.operationName === 'GetCart') {
                req.alias = 'getCart'
                req.reply({ data: { cart: { items: [], total: 0 } } })
              }
            })
            cy.visit('/cart')
            cy.wait('@getCart')
            `,
        },
        {
          title: 'URL matching',
          code: c`
            cy.intercept('/api/users')                               // any method, exact path
            cy.intercept('GET', '/api/users/*')                      // glob: one path segment
            cy.intercept('GET', '/api/**')                           // glob: anything below /api
            cy.intercept({ method: 'GET', pathname: '/api/search', query: { q: 'shoes' } })
            cy.intercept('GET', /\/api\/users\/\d+$/)                // regex
            cy.intercept({ url: 'https://api.stripe.com/**' }, { statusCode: 200, body: {} })
            `,
          note: 'Intercepts from the last-defined match win, so a stub inside a test overrides a general one from beforeEach.',
        },
      ],
    },
    {
      id: 'request',
      title: 'API tests and seeding with cy.request',
      group: 'Network',
      items: [
        {
          title: 'Call your API directly',
          code: c`
            cy.request('GET', '/api/products').then(res => {
              expect(res.status).to.eq(200)
              expect(res.body.data).to.have.length.above(0)
            })

            cy.request({
              method: 'POST',
              url: Cypress.env('apiUrl') + '/orders',
              body: { items: [{ id: 42, qty: 1 }] },
              headers: { Authorization: 'Bearer ' + Cypress.env('apiToken') },
              failOnStatusCode: false,                         // allow 4xx/5xx to assert on them
            }).its('status').should('eq', 422)
            `,
          note: 'cy.request goes through Node, not the browser, so it skips CORS and shares cookies with the browser session.',
        },
        {
          title: 'Seed data before a UI test',
          code: c`
            beforeEach(() => {
              cy.request('POST', '/api/test/reset')                     // test-only endpoint
              cy.request('POST', '/api/products', { name: 'Tee', price: 499 })
                .its('body.id')
                .as('productId')
            })

            it('edits the product', function () {
              cy.visit('/admin/products/' + this.productId + '/edit')
              cy.get('#name').clear().type('Tee v2')
              cy.contains('button', 'Save').click()
              cy.contains('Saved')
            })
            `,
          note: 'Only register test-reset routes when the app runs in a testing environment; never expose them in production.',
        },
        {
          title: 'A pure API spec (cypress/e2e/api/products.cy.js)',
          code: c`
            describe('Products API', () => {
              it('creates, reads and deletes a product', () => {
                cy.request('POST', '/api/products', { name: 'Mug', price: 299 }).then(created => {
                  expect(created.status).to.eq(201)
                  const url = '/api/products/' + created.body.id

                  cy.request(url).its('body').should('include', { name: 'Mug' })
                  cy.request('DELETE', url).its('status').should('eq', 204)
                  cy.request({ url, failOnStatusCode: false }).its('status').should('eq', 404)
                })
              })
            })
            `,
          note: 'Fine for smoke-testing an API alongside UI tests; for large backend suites, PHPUnit, pytest or Jest/Supertest are faster.',
        },
      ],
    },
    {
      id: 'auth',
      title: 'Logging in: custom commands and cy.session',
      group: 'Auth & state',
      items: [
        {
          title: 'Custom command (cypress/support/commands.js)',
          code: c`
            Cypress.Commands.add('getByCy', (name, options) => {
              return cy.get('[data-cy=' + name + ']', options)
            })

            Cypress.Commands.add('loginByUi', (email, password) => {
              cy.visit('/login')
              cy.get('#email').type(email)
              cy.get('#password').type(password, { log: false })
              cy.contains('button', 'Log in').click()
              cy.location('pathname').should('eq', '/dashboard')
            })
            `,
          note: 'Make sure cypress/support/e2e.js contains import \'./commands\' so commands load before every spec.',
        },
        {
          title: 'Programmatic login + cy.session (log in once, restore after)',
          code: c`
            Cypress.Commands.add('login', (email = Cypress.env('email'), password = Cypress.env('password')) => {
              cy.session(
                ['login', email],                            // cache key
                () => {
                  cy.request('POST', '/api/login', { email, password })   // no UI: fast
                },
                {
                  validate() {
                    cy.request('/api/me').its('status').should('eq', 200)  // re-login if invalid
                  },
                  cacheAcrossSpecs: true,
                },
              )
            })

            // in a spec
            beforeEach(() => {
              cy.login()
              cy.visit('/dashboard')                         // session restores to a blank page
            })
            `,
          note: 'cy.session saves cookies, localStorage and sessionStorage after the setup function and restores them for later tests with the same key. Always cy.visit after it.',
        },
        {
          title: 'Laravel Sanctum / CSRF cookie login',
          code: c`
            cy.session(['sanctum', email], () => {
              cy.request('/sanctum/csrf-cookie')
              cy.getCookie('XSRF-TOKEN').then(cookie => {
                cy.request({
                  method: 'POST',
                  url: '/login',
                  body: { email, password },
                  headers: { 'X-XSRF-TOKEN': decodeURIComponent(cookie.value) },
                })
              })
            })
            `,
          note: 'Sanctum SPA auth needs the CSRF cookie first and the stateful domain (SANCTUM_STATEFUL_DOMAINS) to include the Cypress baseUrl host. Django works the same way with the csrftoken cookie and an X-CSRFToken header.',
        },
        {
          title: 'Types for custom commands (cypress/support/index.d.ts)',
          lang: 'ts',
          code: c`
            declare namespace Cypress {
              interface Chainable {
                login(email?: string, password?: string): Chainable<void>
                getByCy(name: string, options?: Partial<Loggable & Timeoutable>): Chainable<JQuery<HTMLElement>>
              }
            }
            `,
        },
      ],
    },
    {
      id: 'env',
      title: 'Environment variables and clearing state',
      group: 'Auth & state',
      items: [
        {
          title: 'Read values with Cypress.env',
          code: c`
            Cypress.env('apiUrl')               // one value
            Cypress.env()                       // all values

            // cypress.config.js
            export default defineConfig({
              env: { apiUrl: 'http://localhost:8000/api' },
            })
            `,
          note: 'Values passed to Cypress.env are visible in the browser, so treat them as exposed to the app under test. Newer 15.x releases add cy.env() and Cypress.expose() and start deprecating Cypress.env(); check the changelog for your version.',
        },
        {
          title: 'cypress.env.json (local secrets, git-ignored)',
          lang: 'json',
          code: c`
            {
              "email": "test@example.com",
              "password": "secret",
              "apiToken": "dev-token"
            }
            `,
        },
        {
          title: 'CYPRESS_ prefixed variables and --env',
          lang: 'bash',
          code: c`
            # macOS / Linux
            CYPRESS_password=secret CYPRESS_baseUrl=http://localhost:8000 npx cypress run
            export CYPRESS_apiToken=abc123            # for the whole shell session
            `,
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                $env:CYPRESS_password = "secret"
                $env:CYPRESS_baseUrl = "http://localhost:8000"
                npx cypress run
                `,
            },
            {
              label: 'Any OS: on the command line',
              lang: 'bash',
              code: c`
                npx cypress run --env email=test@example.com,password=secret
                `,
            },
          ],
          note: 'CYPRESS_ prefix is stripped: CYPRESS_password becomes Cypress.env(\'password\'). A CYPRESS_ variable that matches a config key (baseUrl, viewportWidth) overrides that config value.',
        },
        {
          title: 'Clear state explicitly',
          code: c`
            cy.clearCookies()
            cy.clearAllCookies()                 // all domains
            cy.clearLocalStorage()
            cy.clearAllLocalStorage()
            cy.clearAllSessionStorage()
            Cypress.session.clearAllSavedSessions()   // drop cached cy.session data
            `,
          note: 'With testIsolation on (the default) the current domain is cleared before each test automatically; you mostly need these inside a test.',
        },
      ],
    },
    {
      id: 'organization',
      title: 'Page objects, app actions and fixtures',
      group: 'Organization',
      items: [
        {
          title: 'Page object',
          code: c`
            // cypress/pages/LoginPage.js
            export const loginPage = {
              visit: () => cy.visit('/login'),
              email: () => cy.get('[data-cy=email]'),
              password: () => cy.get('[data-cy=password]'),
              submit: () => cy.get('[data-cy=submit]').click(),
              login(email, password) {
                this.visit()
                this.email().type(email)
                this.password().type(password, { log: false })
                this.submit()
              },
            }

            // in a spec
            import { loginPage } from '../pages/LoginPage'
            loginPage.login('ana@example.com', 'secret')
            `,
        },
        {
          title: 'App actions (skip the UI for setup)',
          code: c`
            // in the app (only in test builds):
            if (window.Cypress) window.store = store

            // in the test: set state directly instead of clicking through forms
            cy.window().its('store').invoke('dispatch', { type: 'cart/add', payload: { id: 42 } })
            cy.get('[data-cy=cart-count]').should('have.text', '1')
            `,
          note: 'Cypress favours app actions and custom commands over page objects: test each UI flow once through the UI, then use shortcuts (API calls, store dispatches) to set up other tests.',
        },
        {
          title: 'Fixtures',
          code: c`
            cy.fixture('user.json').then(user => {
              cy.get('#email').type(user.email)
            })
            cy.fixture('images/avatar.png', null).as('avatar')     // null encoding → Buffer
            cy.intercept('GET', '/api/me', { fixture: 'user.json' })
            `,
          note: 'Fixtures live in cypress/fixtures and are cached after the first load, so editing a fixture object in one test does not leak into another load from disk.',
        },
        {
          title: 'Files and downloads',
          code: c`
            cy.readFile('cypress/fixtures/config.json').its('version').should('eq', 2)
            cy.writeFile('cypress/tmp/state.json', { step: 3 })
            cy.contains('a', 'Export CSV').click()
            cy.readFile('cypress/downloads/orders.csv').should('contain', 'INV-1042')   // retried until it exists
            `,
          note: 'Paths are relative to the project root. Downloads land in cypress/downloads (downloadsFolder in the config) and the folder is emptied before each run.',
        },
      ],
    },
    {
      id: 'tasks',
      title: 'Node tasks, DB seeding and tags',
      group: 'Organization',
      items: [
        {
          title: 'Register tasks in setupNodeEvents',
          code: c`
            // cypress.config.js
            import { defineConfig } from 'cypress'
            import { execSync } from 'node:child_process'
            import { db } from './test/db.js'           // your Node DB helper (pg, mysql2, knex...)

            export default defineConfig({
              e2e: {
                setupNodeEvents(on, config) {
                  on('task', {
                    async 'db:reset'() {
                      await db.truncateAll()
                      return null                        // tasks must return a value or null
                    },
                    async 'db:createUser'(user) {
                      return db.insert('users', user)
                    },
                    log(message) {
                      console.log(message)               // prints in the terminal
                      return null
                    },
                  })
                  return config
                },
              },
            })
            `,
          then: [
            {
              label: 'In a spec',
              lang: 'js',
              code: c`
                beforeEach(() => {
                  cy.task('db:reset')
                  cy.task('db:createUser', { email: 'ana@example.com' }).its('id').as('userId')
                })
                `,
            },
          ],
          note: 'Tasks run in Node, so they can use the file system, databases and anything else the browser cannot reach.',
        },
        {
          title: 'Reset a Laravel or Django database with cy.exec',
          code: c`
            beforeEach(() => {
              cy.exec('php artisan migrate:fresh --seed --env=testing')
              // cy.exec('python manage.py flush --no-input && python manage.py loaddata e2e')
            })
            `,
          note: 'cy.exec runs a shell command on the machine running Cypress and fails the test if it exits non-zero. Migrating per spec is slow; reset once in before() or use a lightweight truncate route.',
        },
        {
          title: 'Tags and filtering with @cypress/grep',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i -D @cypress/grep
            npx cypress run --env grepTags=@smoke
            npx cypress run --env grep="checkout",grepFilterSpecs=true
            `,
          then: [
            {
              label: 'Register the plugin and tag tests',
              lang: 'js',
              code: c`
                // cypress/support/e2e.js
                import { register as registerCypressGrep } from '@cypress/grep'
                registerCypressGrep()

                // cypress.config.js → setupNodeEvents
                import { plugin as cypressGrepPlugin } from '@cypress/grep/plugin'
                cypressGrepPlugin(config)

                // a spec
                it('pays with card', { tags: ['@smoke', '@payments'] }, () => { /* ... */ })
                `,
            },
          ],
          note: 'The import paths shown are for @cypress/grep v4; older versions used require(\'@cypress/grep/src/plugin\'). Check the plugin README for the version you install.',
        },
      ],
    },
    {
      id: 'component',
      title: 'Component testing (React + Vite)',
      group: 'Component testing',
      items: [
        {
          title: 'Set up',
          lang: 'bash',
          code: c`
            # same on every OS
            npx cypress open --component        # Launchpad detects React + Vite and writes the config
            `,
          then: [
            {
              label: 'cypress.config.js (what the wizard adds)',
              lang: 'js',
              code: c`
                export default defineConfig({
                  component: {
                    devServer: { framework: 'react', bundler: 'vite' },
                    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
                  },
                })
                `,
            },
            {
              label: 'cypress/support/component.js',
              lang: 'js',
              code: c`
                import { mount } from 'cypress/react'
                import '../../src/index.css'          // global styles so components look real
                Cypress.Commands.add('mount', mount)
                `,
            },
          ],
          note: 'Cypress 14+ supports React 18 and 19 through cypress/react (the old cypress/react18 package was removed). The component runs in a real browser, served by your own Vite config.',
        },
        {
          title: 'Mount, props and assertions (src/components/Counter.cy.jsx)',
          lang: 'jsx',
          code: c`
            import Counter from './Counter'

            describe('<Counter />', () => {
              it('starts at the initial value and increments', () => {
                cy.mount(<Counter initial={5} />)
                cy.get('[data-cy=count]').should('have.text', '5')
                cy.contains('button', '+').click()
                cy.get('[data-cy=count]').should('have.text', '6')
              })
            })
            `,
        },
        {
          title: 'Events: spy on callback props',
          lang: 'jsx',
          code: c`
            it('calls onSave with the form values', () => {
              const onSave = cy.stub().as('onSave')
              cy.mount(<ProfileForm onSave={onSave} />)
              cy.get('#name').type('Ana')
              cy.contains('button', 'Save').click()
              cy.get('@onSave').should('have.been.calledOnceWith', { name: 'Ana' })
            })
            `,
        },
        {
          title: 'Providers, routers and network stubs',
          lang: 'jsx',
          code: c`
            import { MemoryRouter } from 'react-router'
            import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

            it('loads and lists orders', () => {
              cy.intercept('GET', '/api/orders', { fixture: 'orders.json' }).as('orders')
              cy.mount(
                <QueryClientProvider client={new QueryClient()}>
                  <MemoryRouter initialEntries={['/orders']}>
                    <OrderList />
                  </MemoryRouter>
                </QueryClientProvider>,
              )
              cy.wait('@orders')
              cy.get('[data-cy=order]').should('have.length', 3)
            })
            `,
          note: 'Wrap providers in a custom mount command (Cypress.Commands.add(\'mount\', ...)) when most components need them.',
        },
      ],
    },
    {
      id: 'debugging',
      title: 'Debugging',
      group: 'Debugging',
      items: [
        {
          title: 'Time-travel in the runner',
          lang: 'text',
          code: c`
            npx cypress open → pick a spec → it re-runs on every save
            Command log (left)   → hover a command to see the DOM snapshot at that moment
                                 → click it to pin the snapshot and print details to DevTools console
            Before / After       → toggle for actions such as click and type
            Selector playground  → crosshair icon: click an element to get a suggested cy.get selector
            `,
        },
        {
          title: 'Pause and debug',
          code: c`
            cy.pause()                                   // stop here; resume or step with the buttons
            cy.get('[data-cy=cart]').debug()             // opens a debugger breakpoint (DevTools must be open)
            cy.get('[data-cy=cart]').then($el => {
              debugger                                   // plain JS breakpoint on the resolved element
            })
            cy.log('cart loaded')                        // message in the command log
            cy.task('log', 'visible in the terminal')    // needs the log task from setupNodeEvents
            `,
        },
        {
          title: 'Screenshots and videos',
          code: c`
            cy.screenshot()                                  // whole runner viewport
            cy.screenshot('checkout-step-2')                 // named file
            cy.get('[data-cy=invoice]').screenshot()         // one element
            cy.screenshot({ capture: 'fullPage' })
            `,
          note: 'Failures are screenshotted automatically in cypress run into cypress/screenshots. Turn on video: true in the config to also record each spec to cypress/videos.',
        },
        {
          title: 'Browser DevTools and verbose logs',
          lang: 'bash',
          code: c`
            # macOS / Linux
            DEBUG=cypress:* npx cypress run              # very verbose internal logs
            DEBUG=cypress:server:browsers npx cypress open
            ELECTRON_ENABLE_LOGGING=1 npx cypress run    # browser console in the terminal (Electron)
            `,
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                $env:DEBUG = "cypress:*"; npx cypress run
                `,
            },
          ],
          note: 'In cypress open, the runner is a real browser: press F12 / Cmd+Option+I to inspect the app, the network tab and console errors.',
        },
        {
          title: 'Flaky test checklist',
          lang: 'text',
          code: c`
            Element not found / timeout       → assert on the end state; raise timeout on that one command
            Passes locally, fails in CI       → CI is slower: replace cy.wait(ms) with cy.wait('@alias')
            Request finishes after assertion  → cy.intercept(...).as() before the action, then cy.wait
            Order-dependent failures          → every test seeds its own data (cy.task / cy.request)
            Detached element errors           → re-query after the re-render instead of reusing a subject
            Random failures                   → turn on retries: { runMode: 2 } and check the Cloud flake report
            Find flaky tests                  → run one spec many times: Cypress._.times(10, () => it(...))
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
          title: '.github/workflows/cypress.yml',
          lang: 'yaml',
          code: c`
            name: Cypress
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
                  - uses: cypress-io/github-action@v6
                    with:
                      build: npm run build
                      start: npm run preview -- --port 5173
                      wait-on: 'http://localhost:5173'
                      browser: chrome
                    env:
                      CYPRESS_email: ${GH} secrets.E2E_EMAIL }}
                      CYPRESS_password: ${GH} secrets.E2E_PASSWORD }}
                  - uses: actions/upload-artifact@v4
                    if: ${GH} failure() }}
                    with:
                      name: cypress-screenshots
                      path: cypress/screenshots
                      retention-days: 14
            `,
          note: 'The Cypress action runs npm ci, caches npm and the Cypress binary, starts your server, waits for it, and runs cypress run. ubuntu-latest already has the Linux libraries and Chrome.',
        },
        {
          title: 'Component tests and videos',
          lang: 'yaml',
          code: c`
                  - uses: cypress-io/github-action@v6
                    with:
                      component: true
                  - uses: actions/upload-artifact@v4
                    if: ${GH} failure() }}
                    with:
                      name: cypress-videos
                      path: cypress/videos
            `,
          note: 'Videos only exist when video: true is set in cypress.config.js.',
        },
        {
          title: 'Run in several browsers',
          lang: 'yaml',
          code: c`
            jobs:
              e2e:
                runs-on: ubuntu-latest
                strategy:
                  fail-fast: false
                  matrix:
                    browser: [chrome, firefox, edge]
                steps:
                  - uses: actions/checkout@v4
                  - uses: cypress-io/github-action@v6
                    with:
                      start: npm run dev
                      wait-on: 'http://localhost:5173'
                      browser: ${GH} matrix.browser }}
            `,
        },
        {
          title: 'With a Laravel backend and database',
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
                  - uses: actions/checkout@v4
                  - uses: shivammathur/setup-php@v2
                    with:
                      php-version: '8.4'
                  - run: composer install --no-interaction --prefer-dist
                  - run: cp .env.ci .env && php artisan key:generate && php artisan migrate --seed
                  - uses: cypress-io/github-action@v6
                    with:
                      build: npm run build
                      start: php artisan serve --port=8000
                      wait-on: 'http://localhost:8000'
            `,
          note: 'See the CI/CD sheet for complete Laravel, Node and Python pipelines to combine with this job.',
        },
        {
          title: 'Parallel runs with Cypress Cloud',
          lang: 'yaml',
          code: c`
            jobs:
              e2e:
                runs-on: ubuntu-latest
                strategy:
                  fail-fast: false
                  matrix:
                    containers: [1, 2, 3, 4]
                steps:
                  - uses: actions/checkout@v4
                  - uses: cypress-io/github-action@v6
                    with:
                      start: npm run dev
                      wait-on: 'http://localhost:5173'
                      record: true
                      parallel: true
                    env:
                      CYPRESS_RECORD_KEY: ${GH} secrets.CYPRESS_RECORD_KEY }}
                      GITHUB_TOKEN: ${GH} secrets.GITHUB_TOKEN }}
            `,
          note: 'Parallelization and load balancing need Cypress Cloud (a projectId in the config plus a record key); the free tier has limited test results per month. Without Cloud, split specs across matrix jobs yourself with --spec.',
        },
        {
          title: 'Run in the cypress/included Docker image',
          lang: 'bash',
          code: c`
            # macOS / Linux: Node, Cypress, Chrome, Firefox and Edge preinstalled
            docker run --rm -it -v "$(pwd)":/e2e -w /e2e cypress/included:15.4.0 --browser chrome
            `,
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                docker run --rm -it ${BT}
                  -v "$($PWD.Path):/e2e" -w /e2e ${BT}
                  cypress/included:15.4.0 --browser chrome
                `,
            },
          ],
          note: 'The image entrypoint is cypress run, so extra arguments go straight to it. Match the tag to the cypress version in your package.json; 15.4.0 here is only an example.',
        },
      ],
    },
    {
      id: 'vs-playwright',
      title: 'Cypress vs Playwright',
      group: 'Reference',
      items: [
        {
          title: 'Comparison',
          lang: 'text',
          code: c`
                              Cypress                               Playwright
            Runs where        inside the browser, next to your app  outside, via browser protocols
            Code style        chained commands, auto-queued         async/await
            Browsers          Chrome, Edge, Electron, Firefox       Chromium, Firefox, WebKit (Safari)
                              (WebKit experimental)
            Languages         JavaScript / TypeScript               JS/TS, Python, Java, .NET
            Multiple tabs     no                                    yes
            Cross-origin      cy.origin() per domain                works natively
            Starts server     no (start-server-and-test)            yes (webServer in config)
            Parallel          Cypress Cloud (paid tiers) or manual  built in (workers, --shard), free
            Network stubs     cy.intercept                          page.route
            Component tests   mature (React, Vue, Angular, Svelte)  experimental
            Debugging         interactive runner, time-travel       UI mode, trace viewer, codegen
            App access        direct (window, store, stubs)         via page.evaluate
            `,
          note: 'Pick Cypress for a great interactive dev experience and component tests in a JS team; pick Playwright for Safari coverage, multi-tab or multi-domain flows, and free parallelism. See the Playwright sheet.',
        },
        {
          title: 'Same test in both',
          code: c`
            // Cypress
            cy.visit('/login')
            cy.get('[data-cy=email]').type('ana@example.com')
            cy.contains('button', 'Log in').click()
            cy.contains('h1', 'Dashboard').should('be.visible')

            // Playwright
            await page.goto('/login')
            await page.getByTestId('email').fill('ana@example.com')
            await page.getByRole('button', { name: 'Log in' }).click()
            await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
            `,
        },
      ],
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      group: 'Reference',
      items: [
        {
          title: 'Common errors',
          lang: 'text',
          code: c`
            "cy.visit() failed ... different origin"   → wrap steps on the other domain in cy.origin()
            "element is detached from the DOM"         → the app re-rendered: re-query (chain from cy.get again)
            "element is being covered by another"      → close the overlay/banner, scroll, or assert it is gone first
            "uncaught exception" fails the test        → fix the app error, or ignore it with Cypress.on('uncaught:exception')
            "Timed out retrying after 4000ms"          → wrong selector, element in an iframe, or needs { timeout }
            Can't find elements in an iframe           → use cy.get('iframe').its('0.contentDocument.body') (same origin only)
            "Your system is missing the dependency"    → Linux: install the apt packages from Setup
            "Cypress verification timed out"           → npx cypress verify again; slow first launch on CI
            Tests are slow                             → log in with cy.session, seed via cy.request/cy.task, avoid cy.wait(ms)
            Binary not found after npm ci in CI        → cache ~/.cache/Cypress or use cypress-io/github-action
            `,
        },
        {
          title: 'Cross-origin pages: cy.origin',
          code: c`
            cy.visit('/')
            cy.contains('Log in with SSO').click()

            cy.origin('https://login.example-idp.com', { args: { user: 'ana' } }, ({ user }) => {
              cy.get('#username').type(user)
              cy.get('#password').type(Cypress.env('ssoPassword'), { log: false })
              cy.contains('button', 'Sign in').click()
            })

            cy.location('pathname').should('eq', '/dashboard')   // back on your app
            `,
          note: 'Code inside cy.origin cannot see variables from the outer test; pass them via args. Prefer programmatic login over driving a third-party login page.',
        },
        {
          title: 'Ignore known app exceptions',
          code: c`
            // cypress/support/e2e.js: only for errors you cannot fix
            Cypress.on('uncaught:exception', err => {
              if (err.message.includes('ResizeObserver loop')) {
                return false                     // false = do not fail the test
              }
            })
            `,
          note: 'Returning false for every error hides real bugs; filter by message. Use cy.on(...) inside a single test to scope it to that test.',
        },
        {
          title: 'Work inside an iframe',
          code: c`
            Cypress.Commands.add('iframeBody', selector => {
              return cy.get(selector)
                .its('0.contentDocument.body')
                .should('not.be.empty')
                .then(cy.wrap)
            })

            cy.iframeBody('iframe[title=Editor]').find('p').type('Hello')
            `,
          note: 'Cypress has no first-class iframe API; this works only for same-origin iframes. Cross-origin iframes such as Stripe Elements need chromeWebSecurity: false (Chromium only) or a stubbed test mode.',
        },
        {
          title: 'Detached or covered elements',
          code: c`
            // bad: holds a reference to an element the app replaces
            cy.get('[data-cy=row]').first().then($row => {
              cy.get('[data-cy=refresh]').click()
              cy.wrap($row).click()                        // stale element: detached error
            })

            // good: query again after the change, wait for the re-render
            cy.get('[data-cy=refresh]').click()
            cy.get('[data-cy=spinner]').should('not.exist')
            cy.get('[data-cy=row]').first().click()

            // covered by a sticky header or toast
            cy.get('[data-cy=toast]').should('not.exist')
            cy.get('[data-cy=save]').scrollIntoView({ offset: { top: -100, left: 0 } }).click()
            `,
          note: 'Since Cypress 12, aliases of queries are re-run automatically, which removes most detached errors; they still happen with subjects returned from .then or actions.',
        },
      ],
    },
  ],
}
