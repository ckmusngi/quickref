import { c, BT } from './shared/code.js'

export default {
  slug: 'javascript',
  title: 'JavaScript',
  tech: 'JavaScript',
  category: 'frontend',
  minutes: 20,
  lang: 'js',
  description: 'Modern JS from syntax to async: destructuring, array and object methods, classes, modules, the DOM, promises, async/await, parallel work and cancellation.',
  sections: [
    {
      id: 'project-setup',
      title: 'Project setup, step by step',
      group: 'Setup',
      items: [
        {
          title: '1. Run JavaScript in the browser',
          lang: 'html',
          code: c`
            <!-- index.html -->
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="utf-8"><title>My app</title></head>
            <body>
              <h1 id="title">Hello</h1>
              <script type="module" src="./main.js"></script>
            </body>
            </html>
            `,
          note: 'Open it through a local server, because modules do not load from file://. Use the VS Code "Live Server" extension, or run this in the folder:',
          then: [
            {
              label: 'Start a local server',
              lang: 'bash',
              code: c`
                npx serve .
                `,
            },
          ],
        },
        {
          title: '2. Install Node.js (to run JS outside the browser)',
          lang: 'bash',
          code: c`
            # macOS
            brew install node

            # Linux (Ubuntu / Debian)
            curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
            sudo apt install -y nodejs

            # Windows (PowerShell)
            winget install -e --id OpenJS.NodeJS.LTS

            node -v && npm -v
            `,
          note: 'For switching versions per project, use nvm / fnm. See the Node sheet.',
        },
        {
          title: '3. Run a script with Node',
          lang: 'bash',
          code: c`
            echo "console.log('hi from node')" > app.js    # macOS / Linux
            Set-Content app.js "console.log('hi from node')"   # Windows PowerShell

            node app.js
            node --watch app.js        # re-run on save
            `,
        },
        {
          title: '4. Start a project with Vite (dev server + bundler)',
          lang: 'bash',
          code: c`
            npm create vite@latest my-app -- --template vanilla
            cd my-app
            npm install
            npm run dev                # http://localhost:5173
            npm run build              # production files in dist/
            `,
          note: 'Same commands on every OS.',
        },
        {
          title: '5. package.json essentials',
          lang: 'json',
          code: c`
            {
              "name": "my-app",
              "type": "module",
              "scripts": {
                "dev": "vite",
                "build": "vite build",
                "lint": "eslint .",
                "format": "prettier --write ."
              }
            }
            `,
          note: '"type": "module" lets Node use import / export.',
        },
        {
          title: '6. Linting and formatting',
          lang: 'bash',
          code: c`
            npm init @eslint/config@latest
            npm i -D prettier
            npm run lint
            npm run format
            `,
          note: 'In VS Code install the ESLint and Prettier extensions and turn on "Format on Save".',
        },
      ],
    },
    {
      id: 'syntax',
      title: 'Syntax',
      group: 'Language',
      items: [
        {
          title: 'Variables',
          code: c`
            const rate = 0.12   // can't be reassigned
            let count = 0       // can be reassigned
            // avoid var
            `,
          note: 'const prevents reassignment, not mutation of objects.',
        },
        {
          title: 'Template literals',
          code: 'const msg = `Hello ${user.name}, you owe ${total.toFixed(2)}`',
        },
        {
          title: 'Optional chaining & nullish',
          code: c`
            const city = user?.address?.city ?? 'Unknown'
            const first = list?.[0]
            obj.cb?.()
            `,
        },
        {
          title: 'Equality',
          code: c`
            0 == ''    // true  (coerces)
            0 === ''   // false (strict)
            Object.is(NaN, NaN) // true
            `,
          note: 'Use === everywhere.',
        },
        {
          title: 'Truthy & falsy',
          code: c`
            // falsy: false, 0, -0, 0n, '', null, undefined, NaN
            if (items.length) { /* non-empty */ }
            `,
        },
      ],
    },
    {
      id: 'destructuring',
      title: 'Destructuring & spread',
      group: 'Language',
      items: [
        {
          title: 'Objects',
          code: "const { id, name: fullName, role = 'user' } = user",
        },
        {
          title: 'Arrays',
          code: c`
            const [first, second, ...rest] = items
            ;[a, b] = [b, a] // swap
            `,
        },
        {
          title: 'Function params',
          code: 'function createUser({ name, email, admin = false }) {}',
        },
        {
          title: 'Spread',
          code: c`
            const merged = { ...defaults, ...options }
            const all = [...listA, ...listB]
            Math.max(...numbers)
            `,
        },
      ],
    },
    {
      id: 'arrays',
      title: 'Array methods',
      group: 'Language',
      items: [
        {
          title: 'map / filter / reduce',
          code: c`
            const names = users.map(u => u.name)
            const active = users.filter(u => u.active)
            const total = lines.reduce((sum, l) => sum + l.amount, 0)
            `,
        },
        {
          title: 'Find & test',
          code: c`
            users.find(u => u.id === 3)
            users.findIndex(u => u.id === 3)
            users.some(u => u.admin)
            users.every(u => u.verified)
            users.includes('x')
            `,
        },
        {
          title: 'Non-mutating versions',
          code: c`
            const sorted = list.toSorted((a, b) => a.total - b.total)
            const reversed = list.toReversed()
            const updated = list.with(2, newItem)
            const last = list.at(-1)
            `,
          note: 'sort() and reverse() mutate the original array; toSorted() and toReversed() do not.',
        },
        {
          title: 'Group & flatten',
          code: c`
            const byStatus = Object.groupBy(invoices, i => i.status)
            const flat = nested.flat()
            const tags = posts.flatMap(p => p.tags)
            `,
        },
        {
          title: 'Remove duplicates',
          code: 'const unique = [...new Set(ids)]',
        },
      ],
    },
    {
      id: 'objects',
      title: 'Objects',
      group: 'Language',
      items: [
        {
          title: 'Iterate',
          code: c`
            Object.keys(obj)
            Object.values(obj)
            Object.entries(obj).forEach(([key, value]) => {})
            `,
        },
        {
          title: 'Transform',
          code: c`
            const doubled = Object.fromEntries(
              Object.entries(prices).map(([k, v]) => [k, v * 2])
            )
            `,
        },
        {
          title: 'Copy',
          code: c`
            const shallow = { ...obj }
            const deep = structuredClone(obj)
            `,
        },
        {
          title: 'Shorthand',
          code: c`
            const name = 'Kiel'
            const user = { name, greet() { return 'hi' }, [dynamicKey]: true }
            `,
        },
      ],
    },
    {
      id: 'classes',
      title: 'Classes & modules',
      group: 'Language',
      items: [
        {
          title: 'Class',
          code: c`
            class Invoice {
              #secret = 1          // private field
              static count = 0

              constructor(total) {
                this.total = total
                Invoice.count++
              }

              get withTax() {
                return this.total * 1.12
              }
            }
            `,
        },
        {
          title: 'Inheritance',
          code: c`
            class PaidInvoice extends Invoice {
              constructor(total, paidAt) {
                super(total)
                this.paidAt = paidAt
              }
            }
            `,
        },
        {
          title: 'ES modules',
          code: c`
            // math.js
            export const add = (a, b) => a + b
            export default function sub(a, b) { return a - b }

            // app.js
            import sub, { add } from './math.js'
            const { heavy } = await import('./heavy.js') // lazy load
            `,
        },
      ],
    },
    {
      id: 'dom',
      title: 'DOM & browser',
      group: 'Browser',
      items: [
        {
          title: 'Select & change',
          code: c`
            const btn = document.querySelector('#save')
            const rows = document.querySelectorAll('.row')
            btn.textContent = 'Saving…'
            btn.classList.toggle('active')
            btn.dataset.id // reads data-id
            `,
        },
        {
          title: 'Events',
          code: c`
            btn.addEventListener('click', e => {
              e.preventDefault()
            })

            // delegation
            list.addEventListener('click', e => {
              const item = e.target.closest('li')
              if (item) select(item.dataset.id)
            })
            `,
        },
        {
          title: 'Storage',
          code: c`
            localStorage.setItem('theme', 'dark')
            localStorage.getItem('theme')
            sessionStorage.clear()
            `,
        },
        {
          title: 'Dates & numbers',
          code: c`
            new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(1234.5)
            new Date().toISOString()
            new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)
            `,
        },
      ],
    },
    {
      id: 'promises',
      title: 'Promises',
      group: 'Async',
      items: [
        {
          title: 'Create a promise',
          code: c`
            const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

            await wait(500)
            `,
        },
        {
          title: 'Chain',
          code: c`
            fetch('/api/user')
              .then(res => res.json())
              .then(user => console.log(user))
              .catch(err => console.error(err))
              .finally(() => setLoading(false))
            `,
        },
        {
          title: 'Already-settled values',
          code: c`
            Promise.resolve(42)
            Promise.reject(new Error("nope"))
            `,
        },
      ],
    },
    {
      id: 'await',
      title: 'async / await',
      group: 'Async',
      items: [
        {
          title: 'Basic usage',
          code: c`
            async function loadUser(id) {
              const res = await fetch(${BT}/api/users/${'${'}id}${BT})
              if (!res.ok) throw new Error(${BT}HTTP ${'${'}res.status}${BT})
              return res.json()
            }
            `,
        },
        {
          title: 'Error handling',
          code: c`
            try {
              const user = await loadUser(1)
            } catch (err) {
              showToast(err.message)
            }
            `,
          note: 'fetch only rejects on network errors — check res.ok for 4xx/5xx.',
        },
        {
          title: 'Top-level await (ES modules)',
          code: "const config = await (await fetch('/config.json')).json()",
        },
      ],
    },
    {
      id: 'combinators',
      title: 'Running things together',
      group: 'Async',
      items: [
        {
          title: 'Parallel — fail fast',
          code: c`
            const [user, orders] = await Promise.all([
              loadUser(id),
              loadOrders(id),
            ])
            `,
          note: 'Rejects as soon as any promise rejects.',
        },
        {
          title: 'Parallel — collect every result',
          code: c`
            const results = await Promise.allSettled(ids.map(loadUser))
            const ok = results.filter(r => r.status === 'fulfilled').map(r => r.value)
            `,
        },
        {
          title: 'First to settle',
          code: 'const winner = await Promise.race([fetchA(), fetchB()])',
        },
        {
          title: 'First to succeed',
          code: 'const fastest = await Promise.any([mirror1(), mirror2(), mirror3()])',
        },
        {
          title: 'Sequential loop',
          code: c`
            for (const id of ids) {
              await syncRecord(id) // one at a time
            }
            `,
          note: 'Array.forEach does not wait for async callbacks — use for…of.',
        },
      ],
    },
    {
      id: 'control',
      title: 'Timeouts & cancellation',
      group: 'Async',
      items: [
        {
          title: 'Abort a fetch',
          code: c`
            const controller = new AbortController()
            fetch(url, { signal: controller.signal })
            controller.abort()
            `,
        },
        {
          title: 'Built-in timeout',
          code: 'const res = await fetch(url, { signal: AbortSignal.timeout(5000) })',
        },
        {
          title: 'Retry with backoff',
          code: c`
            async function retry(fn, tries = 3, delay = 300) {
              try {
                return await fn()
              } catch (err) {
                if (tries <= 1) throw err
                await wait(delay)
                return retry(fn, tries - 1, delay * 2)
              }
            }
            `,
        },
        {
          title: 'Limit concurrency',
          code: c`
            async function mapLimit(items, limit, fn) {
              const out = []
              for (let i = 0; i < items.length; i += limit) {
                const batch = items.slice(i, i + limit)
                out.push(...(await Promise.all(batch.map(fn))))
              }
              return out
            }
            `,
        },
      ],
    },
  ],
}
