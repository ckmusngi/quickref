import { c, BT } from './shared/code.js'

export default {
  slug: 'typescript',
  title: 'TypeScript',
  tech: 'TypeScript',
  category: 'frontend',
  minutes: 13,
  lang: 'ts',
  description: 'Types, interfaces, unions, generics, narrowing, utility types and the tsconfig settings that matter.',
  sections: [
    {
      id: 'project-setup',
      title: 'Project setup, step by step',
      group: 'Setup',
      items: [
        {
          title: '1. Install Node.js',
          note: 'TypeScript runs on Node.js. Full instructions (version managers, pinning versions) are in the Node sheet.',
          then: [
            {
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
            },
          ],
        },
        {
          title: '2. New Node + TypeScript project',
          lang: 'bash',
          code: c`
            mkdir my-app && cd my-app
            npm init -y
            npm i -D typescript @types/node tsx
            npx tsc --init
            `,
          note: 'Same on every OS. tsx runs .ts files directly during development.',
        },
        {
          title: '3. tsconfig.json essentials',
          lang: 'json',
          code: c`
            {
              "compilerOptions": {
                "target": "ES2022",
                "module": "NodeNext",
                "moduleResolution": "NodeNext",
                "strict": true,
                "outDir": "dist",
                "rootDir": "src",
                "esModuleInterop": true,
                "skipLibCheck": true,
                "sourceMap": true
              },
              "include": ["src"]
            }
            `,
        },
        {
          title: '4. Scripts',
          lang: 'json',
          code: c`
            {
              "type": "module",
              "scripts": {
                "dev": "tsx watch src/index.ts",
                "build": "tsc",
                "start": "node dist/index.js",
                "typecheck": "tsc --noEmit"
              }
            }
            `,
        },
        {
          title: '5. Write and run',
          lang: 'bash',
          code: c`
            mkdir src
            echo "const msg: string = 'hello'; console.log(msg)" > src/index.ts          # macOS / Linux
            Set-Content src/index.ts "const msg: string = 'hello'; console.log(msg)"    # Windows PowerShell

            npm run dev          # run with reload
            npm run build        # compile to dist/
            npm start
            `,
          note: 'Node 22.18+ / 24 can also run simple .ts files directly (node src/index.ts) by stripping types. It does not type-check, so keep tsc --noEmit in CI.',
        },
        {
          title: '6. React / frontend projects',
          lang: 'bash',
          code: c`
            npm create vite@latest my-app -- --template react-ts
            cd my-app && npm install && npm run dev
            `,
        },
        {
          title: '7. Types for libraries',
          lang: 'bash',
          code: c`
            npm i -D @types/express @types/node
            `,
          note: 'Most modern packages ship their own types. For older ones, look for @types/<package>.',
        },
      ],
    },
    {
      id: 'config',
      title: 'tsconfig & tooling',
      group: 'Setup',
      items: [
        {
          title: 'Sensible tsconfig',
          lang: 'json',
          code: c`
            {
              "compilerOptions": {
                "target": "ES2022",
                "module": "ESNext",
                "moduleResolution": "Bundler",
                "strict": true,
                "noUncheckedIndexedAccess": true,
                "skipLibCheck": true,
                "jsx": "react-jsx"
              }
            }
            `,
        },
        {
          title: 'Type-check only',
          lang: 'bash',
          code: c`
            npx tsc --noEmit
            npx tsc --noEmit --watch
            `,
        },
        {
          title: 'Run TS directly',
          lang: 'bash',
          code: c`
            npx tsx src/script.ts
            node --experimental-strip-types src/script.ts
            `,
        },
        {
          title: 'Typing untyped modules',
          code: c`
            // src/types/legacy.d.ts
            declare module 'legacy-lib' {
              export function doThing(x: string): number
            }
            `,
        },
      ],
    },
    {
      id: 'basics',
      title: 'Basic types',
      group: 'Types',
      items: [
        {
          title: 'Primitives & arrays',
          code: c`
            let name: string = 'Kiel'
            let count: number = 3
            let done: boolean = false
            let ids: number[] = [1, 2]
            let pair: [string, number] = ['a', 1] // tuple
            `,
        },
        {
          title: 'Functions',
          code: c`
            function greet(name: string, greeting = 'Hi'): string {
              return ${BT}${'${'}greeting} ${'${'}name}${BT}
            }

            const add = (a: number, b: number): number => a + b
            `,
        },
        {
          title: 'Optional & default params',
          code: 'function log(msg: string, level?: \'info\' | \'warn\') {}',
        },
        {
          title: 'any vs unknown',
          code: c`
            let a: any = JSON.parse(raw)     // no checks at all
            let u: unknown = JSON.parse(raw) // must narrow before use
            if (typeof u === 'string') u.toUpperCase()
            `,
          note: 'Prefer unknown for data you have not validated yet.',
        },
      ],
    },
    {
      id: 'objects',
      title: 'Objects: type & interface',
      group: 'Types',
      items: [
        {
          title: 'Interface',
          code: c`
            interface User {
              id: number
              email: string
              name?: string          // optional
              readonly createdAt: Date
            }
            `,
        },
        {
          title: 'Type alias',
          code: c`
            type Status = 'draft' | 'sent' | 'paid'

            type Invoice = {
              id: number
              status: Status
              total: number
            }
            `,
        },
        {
          title: 'Extending',
          code: c`
            interface Admin extends User {
              permissions: string[]
            }

            type Paid = Invoice & { paidAt: Date }
            `,
        },
        {
          title: 'Index signatures & Record',
          code: c`
            type Rates = { [currency: string]: number }
            type Rates2 = Record<string, number>
            `,
        },
      ],
    },
    {
      id: 'unions',
      title: 'Unions & narrowing',
      group: 'Types',
      items: [
        {
          title: 'Discriminated union',
          code: c`
            type Result =
              | { ok: true; data: Invoice }
              | { ok: false; error: string }

            function handle(r: Result) {
              if (r.ok) console.log(r.data.total)
              else console.error(r.error)
            }
            `,
        },
        {
          title: 'Narrowing tools',
          code: c`
            typeof x === 'string'
            x instanceof Date
            'email' in obj
            Array.isArray(x)
            `,
        },
        {
          title: 'Custom type guard',
          code: c`
            function isUser(x: unknown): x is User {
              return typeof x === 'object' && x !== null && 'email' in x
            }
            `,
        },
        {
          title: 'Exhaustive switch',
          code: c`
            function label(s: Status): string {
              switch (s) {
                case 'draft': return 'Draft'
                case 'sent': return 'Sent'
                case 'paid': return 'Paid'
                default: {
                  const never: never = s
                  return never
                }
              }
            }
            `,
          note: 'Adding a new Status makes this fail to compile until you handle it.',
        },
      ],
    },
    {
      id: 'generics',
      title: 'Generics',
      group: 'Advanced types',
      items: [
        {
          title: 'Generic function',
          code: c`
            function first<T>(items: T[]): T | undefined {
              return items[0]
            }

            first([1, 2, 3]) // number | undefined
            `,
        },
        {
          title: 'Constraints',
          code: c`
            function byId<T extends { id: number }>(items: T[], id: number) {
              return items.find(i => i.id === id)
            }
            `,
        },
        {
          title: 'Generic types',
          code: c`
            type ApiResponse<T> = {
              data: T
              meta: { page: number; total: number }
            }

            const res: ApiResponse<Invoice[]> = await getInvoices()
            `,
        },
        {
          title: 'keyof & indexed access',
          code: c`
            function pick<T, K extends keyof T>(obj: T, key: K): T[K] {
              return obj[key]
            }

            type Total = Invoice['total'] // number
            `,
        },
      ],
    },
    {
      id: 'utility',
      title: 'Utility types',
      group: 'Advanced types',
      items: [
        {
          title: 'Shape changers',
          code: c`
            Partial<User>          // all optional
            Required<User>         // all required
            Readonly<User>
            Pick<User, 'id' | 'email'>
            Omit<User, 'createdAt'>
            `,
        },
        {
          title: 'From functions',
          code: c`
            ReturnType<typeof getUser>
            Parameters<typeof createInvoice>
            Awaited<ReturnType<typeof fetchUser>>
            `,
        },
        {
          title: 'Unions',
          code: c`
            Exclude<Status, 'draft'>     // 'sent' | 'paid'
            Extract<Status, 'paid'>
            NonNullable<string | null>   // string
            `,
        },
        {
          title: 'Derive types from values',
          code: c`
            const STATUSES = ['draft', 'sent', 'paid'] as const
            type Status = typeof STATUSES[number]

            const config = { retries: 3 } satisfies Record<string, number>
            `,
        },
      ],
    },
  ],
}
