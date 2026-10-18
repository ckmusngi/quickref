import { c, BT } from './shared/code.js'

const GH = '${{' // GitHub Actions expression opener (avoids template interpolation)

export default {
  slug: 'nextjs',
  title: 'Next.js',
  tech: 'Next.js',
  category: 'frontend',
  minutes: 50,
  lang: 'tsx',
  description: 'Next.js 16 with the App Router and React 19: routing and layouts, server and client components, data fetching and caching ("use cache", revalidation), Server Actions, route handlers, proxy.ts and Auth.js, Prisma, styling, images, metadata, testing, and deploying to Vercel, a Linux server or Docker.',
  sections: [
    // ───────────────────────── Setup ─────────────────────────
    {
      id: 'setup-create',
      title: 'Create a project, step by step',
      group: 'Setup',
      items: [
        {
          title: '1. Install Node.js',
          lang: 'bash',
          code: c`
            # macOS
            brew install node
            # Linux: see the Node sheet (nvm or NodeSource)
            # Windows (PowerShell)
            winget install -e --id OpenJS.NodeJS.LTS

            node -v      # Next.js 16 needs Node 20.9+ (see nextjs.org for the current minimum)
            `,
          note: 'Use an active LTS release (22 or 24) for new projects. TypeScript 5.1+ is required if you use TypeScript.',
        },
        {
          title: '2. Create the app',
          lang: 'bash',
          code: c`
            # same on every OS
            npx create-next-app@latest my-app
            # answer the prompts: TypeScript, ESLint, Tailwind CSS, src/ directory,
            # App Router (yes), import alias (@/*), React Compiler
            cd my-app
            `,
          note: 'Turbopack is the default bundler in Next.js 16, so there is no longer a Turbopack question; older versions asked "Use Turbopack for next dev?".',
          then: [
            {
              label: 'Non-interactive (CI, scripts)',
              lang: 'bash',
              code: c`
                npx create-next-app@latest my-app --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm
                npx create-next-app@latest my-app --yes      # accept all defaults
                `,
            },
          ],
        },
        {
          title: '3. Run, build, start',
          lang: 'bash',
          code: c`
            # same on every OS
            npm run dev          # next dev   → http://localhost:3000 (Turbopack, hot reload)
            npm run build        # next build → production build in .next/ (Turbopack)
            npm run start        # next start → serve the production build
            npx next dev -p 4000 # another port
            npx next info        # versions and system info for bug reports
            `,
          note: 'Since Next.js 16 both dev and build use Turbopack by default. Pass --webpack (next dev --webpack, next build --webpack) if a custom webpack config or plugin still needs it.',
        },
        {
          title: '4. Set an environment variable for one command',
          lang: 'bash',
          code: c`
            # macOS / Linux (Ubuntu / Debian)
            PORT=4000 npm run start
            NEXT_TELEMETRY_DISABLED=1 npm run build
            `,
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                $env:PORT = "4000"; npm run start
                $env:NEXT_TELEMETRY_DISABLED = "1"; npm run build
                Remove-Item Env:PORT          # unset it again for this session
                `,
            },
          ],
        },
        {
          title: '5. Lint and type-check',
          lang: 'bash',
          code: c`
            # same on every OS
            npx eslint .                 # package.json: "lint": "eslint ."
            npx tsc --noEmit             # type errors without building
            npx next typegen             # generate route types (PageProps, LayoutProps, RouteContext)
            `,
          note: 'Next.js 16 removed the next lint command and no longer lints during next build; run ESLint (or Biome) directly. In Next.js 15 and older, npm run lint called next lint.',
        },
      ],
    },
    {
      id: 'setup-structure',
      title: 'Project structure & special files',
      group: 'Setup',
      items: [
        {
          title: 'Folder layout',
          lang: 'text',
          code: c`
            app/                     # (or src/app/) the App Router: folders = URL segments
              layout.tsx             # root layout: <html> and <body>, required
              page.tsx               # /
              globals.css
              blog/
                page.tsx             # /blog
                [slug]/page.tsx      # /blog/hello-world
              api/products/route.ts  # /api/products (route handler)
            components/              # shared UI (not routes)
            lib/                     # db.ts, auth helpers, utils
            public/                  # served as-is: /favicon.ico, /robots.txt
            proxy.ts                 # runs before requests (formerly middleware.ts)
            next.config.ts
            .env.local               # secrets, git-ignored
            `,
          note: 'Only a folder that contains page.tsx or route.ts becomes a URL, so you can keep components next to routes. Prefix a folder with _ (app/_components) to opt it out of routing entirely.',
        },
        {
          title: 'Special file names inside app/',
          lang: 'text',
          code: c`
            layout.tsx        shared UI that wraps child segments, keeps state on navigation
            page.tsx          the UI of a route, makes the segment public
            loading.tsx       instant loading UI (Suspense boundary for the segment)
            error.tsx         error boundary for the segment ('use client')
            global-error.tsx  error boundary for the root layout
            not-found.tsx     UI for notFound() and unmatched URLs
            route.ts          API endpoint (GET, POST, ...) — cannot share a folder with page.tsx
            template.tsx      like layout, but re-mounts on every navigation
            default.tsx       fallback for parallel route slots
            opengraph-image.tsx, icon.tsx, sitemap.ts, robots.ts, manifest.ts   metadata files
            `,
        },
        {
          title: 'Absolute imports with @/',
          lang: 'json',
          code: c`
            // tsconfig.json (create-next-app sets this up)
            {
              "compilerOptions": {
                "baseUrl": ".",
                "paths": { "@/*": ["./src/*"] }
              }
            }
            `,
          note: 'Then import { db } from "@/lib/db" from any depth. Without a src/ folder the path is ["./*"].',
        },
      ],
    },
    {
      id: 'setup-config',
      title: 'next.config.ts',
      group: 'Setup',
      items: [
        {
          title: 'A typical config',
          lang: 'ts',
          code: c`
            // next.config.ts
            import type { NextConfig } from 'next'

            const nextConfig: NextConfig = {
              reactStrictMode: true,
              typedRoutes: true,               // type-checked <Link href> (stable in 16)
              images: {
                remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com', pathname: '/uploads/**' }],
              },
              async redirects() {
                return [{ source: '/old-blog/:slug', destination: '/blog/:slug', permanent: true }]
              },
              async headers() {
                return [{ source: '/(.*)', headers: [{ key: 'X-Frame-Options', value: 'DENY' }] }]
              },
            }

            export default nextConfig
            `,
          note: 'Restart next dev after changing this file. next.config.ts is supported since Next.js 15; older projects use next.config.js or next.config.mjs.',
        },
        {
          title: 'Opt-in features worth knowing',
          lang: 'ts',
          code: c`
            const nextConfig: NextConfig = {
              cacheComponents: true,   // "use cache" + Partial Prerendering (Next 16)
              reactCompiler: true,     // automatic memoization; npm i -D babel-plugin-react-compiler
              output: 'standalone',    // self-hosting / Docker (see Deployment)
              turbopack: {             // Turbopack options (top-level key since 15.3)
                resolveAlias: { underscore: 'lodash' },
              },
            }
            `,
          note: 'cacheComponents replaces the older experimental.dynamicIO and experimental.ppr flags. The turbopack key used to be experimental.turbo.',
        },
      ],
    },
    {
      id: 'setup-env',
      title: 'Environment variables',
      group: 'Setup',
      items: [
        {
          title: 'Env files',
          lang: 'env',
          code: c`
            # .env              defaults for every environment (may be committed, no secrets)
            # .env.local        your machine, overrides .env (git-ignored)
            # .env.development / .env.production / .env.test   per NODE_ENV

            DATABASE_URL=postgresql://app:secret@localhost:5432/shop   # server only
            AUTH_SECRET=change-me                                      # server only
            NEXT_PUBLIC_SITE_URL=http://localhost:3000                 # also sent to the browser
            `,
          note: 'Only NEXT_PUBLIC_ variables reach client components, and they are inlined at build time, so changing them needs a rebuild. Everything else is readable only on the server via process.env.',
        },
        {
          title: 'Read them',
          lang: 'tsx',
          code: c`
            // server component, route handler, server action: any variable
            const url = process.env.DATABASE_URL

            // client component: only NEXT_PUBLIC_, written out in full (no destructuring)
            const site = process.env.NEXT_PUBLIC_SITE_URL
            `,
          note: 'Dynamic lookups like process.env[name] are not inlined for the browser. Production hosts (Vercel, Docker, PM2) set real values instead of shipping .env.local.',
        },
        {
          title: 'Validate env at startup with zod',
          lang: 'ts',
          code: c`
            // lib/env.ts
            import 'server-only'
            import { z } from 'zod'

            export const env = z.object({
              DATABASE_URL: z.string().url(),
              AUTH_SECRET: z.string().min(32),
              NODE_ENV: z.enum(['development', 'test', 'production']),
            }).parse(process.env)
            `,
          note: 'A missing variable then fails loudly with a clear message instead of as undefined deep inside a query.',
        },
      ],
    },

    // ───────────────────────── Routing ─────────────────────────
    {
      id: 'routing-layouts',
      title: 'Pages & layouts',
      group: 'Routing',
      items: [
        {
          title: 'Root layout (app/layout.tsx)',
          code: c`
            import type { Metadata } from 'next'
            import './globals.css'

            export const metadata: Metadata = {
              title: { default: 'Shop', template: '%s | Shop' },
              description: 'Hand-made goods',
            }

            export default function RootLayout({ children }: { children: React.ReactNode }) {
              return (
                <html lang="en">
                  <body>{children}</body>
                </html>
              )
            }
            `,
          note: 'The root layout is required and is the only place for html and body tags. It stays mounted while users navigate.',
        },
        {
          title: 'A page (app/page.tsx)',
          code: c`
            export default async function HomePage() {
              const res = await fetch('https://api.example.com/featured')
              const products: { id: number; name: string }[] = await res.json()

              return (
                <main>
                  <h1>Featured</h1>
                  <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>
                </main>
              )
            }
            `,
          note: 'Pages are server components by default, so they can be async and fetch data directly.',
        },
        {
          title: 'Nested layout (app/dashboard/layout.tsx)',
          code: c`
            import Link from 'next/link'

            export default function DashboardLayout({ children }: { children: React.ReactNode }) {
              return (
                <div className="grid grid-cols-[220px_1fr]">
                  <nav>
                    <Link href="/dashboard">Overview</Link>
                    <Link href="/dashboard/orders">Orders</Link>
                  </nav>
                  <section>{children}</section>
                </div>
              )
            }
            `,
          note: 'Wraps every page under /dashboard. Layouts do not re-render on navigation between their children and cannot read searchParams.',
        },
      ],
    },
    {
      id: 'routing-dynamic',
      title: 'Dynamic routes & params',
      group: 'Routing',
      items: [
        {
          title: '[slug]: params is a Promise (app/blog/[slug]/page.tsx)',
          code: c`
            import { notFound } from 'next/navigation'
            import { getPost } from '@/lib/posts'

            export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
              const { slug } = await params
              const post = await getPost(slug)
              if (!post) notFound()

              return <article><h1>{post.title}</h1></article>
            }
            `,
          note: 'Since Next.js 15 params and searchParams are Promises, and Next.js 16 removed the temporary synchronous access. In Next.js 14 you wrote ({ params }: { params: { slug: string } }) and used params.slug directly.',
          then: [
            {
              label: 'Or use the generated PageProps helper (after next dev / next build / next typegen)',
              lang: 'tsx',
              code: c`
                export default async function PostPage(props: PageProps<'/blog/[slug]'>) {
                  const { slug } = await props.params
                  // ...
                }
                `,
            },
          ],
        },
        {
          title: 'Catch-all and optional catch-all',
          lang: 'text',
          code: c`
            app/docs/[...slug]/page.tsx     /docs/a, /docs/a/b      params: { slug: ['a', 'b'] }
            app/shop/[[...slug]]/page.tsx   /shop too               params: { slug?: string[] }
            app/[locale]/blog/[id]/page.tsx two params              params: { locale: string; id: string }
            `,
        },
        {
          title: 'searchParams (page only)',
          code: c`
            // app/products/page.tsx → /products?q=shirt&page=2
            type Search = { q?: string; page?: string }

            export default async function Products({ searchParams }: { searchParams: Promise<Search> }) {
              const { q = '', page = '1' } = await searchParams
              const products = await searchProducts(q, Number(page))
              return <ProductList products={products} />
            }
            `,
          note: 'Reading searchParams makes the page dynamic (rendered per request). In client components use useSearchParams() instead.',
        },
        {
          title: 'Pre-render dynamic pages with generateStaticParams',
          code: c`
            // app/blog/[slug]/page.tsx
            export async function generateStaticParams() {
              const posts = await getAllPosts()
              return posts.map(post => ({ slug: post.slug }))
            }

            export const dynamicParams = true   // false → unknown slugs return 404
            `,
          note: 'Listed slugs are built at next build time; others render on first request and are then cached. This replaces getStaticPaths from the Pages Router.',
        },
      ],
    },
    {
      id: 'routing-special',
      title: 'Loading, errors & 404',
      group: 'Routing',
      items: [
        {
          title: 'loading.tsx',
          code: c`
            // app/dashboard/loading.tsx
            export default function Loading() {
              return <p aria-busy="true">Loading dashboard…</p>
            }
            `,
          note: 'Shown instantly while the segment’s page streams in; Next.js wraps the page in a Suspense boundary for you.',
        },
        {
          title: 'error.tsx (must be a client component)',
          code: c`
            // app/dashboard/error.tsx
            'use client'

            import { useEffect } from 'react'

            export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
              useEffect(() => { console.error(error) }, [error])

              return (
                <div role="alert">
                  <p>Something went wrong.</p>
                  <button onClick={() => reset()}>Try again</button>
                </div>
              )
            }
            `,
          note: 'In production the message of server errors is hidden; error.digest matches the entry in your server logs. Errors in the root layout need app/global-error.tsx, which must render its own html and body.',
        },
        {
          title: 'not-found.tsx and notFound()',
          code: c`
            // app/not-found.tsx
            import Link from 'next/link'

            export default function NotFound() {
              return (
                <main>
                  <h1>Page not found</h1>
                  <Link href="/">Back home</Link>
                </main>
              )
            }

            // anywhere on the server
            import { notFound } from 'next/navigation'
            if (!product) notFound()      // renders the nearest not-found.tsx with status 404
            `,
        },
      ],
    },
    {
      id: 'routing-navigation',
      title: 'Navigation & redirects',
      group: 'Routing',
      items: [
        {
          title: 'Link',
          code: c`
            import Link from 'next/link'

            <Link href="/blog">Blog</Link>
            <Link href={'/blog/' + post.slug}>{post.title}</Link>
            <Link href={{ pathname: '/products', query: { q: 'shirt' } }}>Shirts</Link>
            <Link href="/terms" prefetch={false} replace scroll={false}>Terms</Link>
            `,
          note: 'Links in the viewport are prefetched in production, which makes navigation feel instant. Use a plain a tag for external URLs.',
        },
        {
          title: 'useRouter, usePathname, useSearchParams (client only)',
          code: c`
            'use client'

            import { useRouter, usePathname, useSearchParams } from 'next/navigation'

            export function SearchBox() {
              const router = useRouter()
              const pathname = usePathname()          // '/products'
              const searchParams = useSearchParams()  // read-only URLSearchParams

              function onSearch(q: string) {
                const params = new URLSearchParams(searchParams)
                params.set('q', q)
                router.replace(pathname + '?' + params.toString())
              }

              return <input defaultValue={searchParams.get('q') ?? ''} onChange={e => onSearch(e.target.value)} />
            }
            `,
          note: 'Import from next/navigation, not next/router (that is the Pages Router). Wrap a component that uses useSearchParams in Suspense, or the whole page falls back to client rendering at build time.',
          then: [
            {
              label: 'Other router methods',
              lang: 'tsx',
              code: c`
                router.push('/dashboard')
                router.back()
                router.refresh()       // re-run server components for the current route, keep client state
                router.prefetch('/checkout')
                `,
            },
          ],
        },
        {
          title: 'redirect() and permanentRedirect() on the server',
          code: c`
            import { redirect, permanentRedirect } from 'next/navigation'

            export default async function AccountPage() {
              const session = await auth()
              if (!session) redirect('/login')            // 307 (303 inside a Server Action)
              // ...
            }

            // moved content: 308
            permanentRedirect('/blog/' + newSlug)
            `,
          note: 'redirect() throws internally, so do not wrap it in try/catch and call it after the try block. Fixed redirects belong in next.config.ts redirects().',
        },
      ],
    },
    {
      id: 'routing-advanced',
      title: 'Route groups, parallel & intercepting routes',
      group: 'Routing',
      items: [
        {
          title: 'Route groups: organise without changing the URL',
          lang: 'text',
          code: c`
            app/
              (marketing)/
                layout.tsx        # header + footer for public pages
                page.tsx          # /
                pricing/page.tsx  # /pricing
              (app)/
                layout.tsx        # sidebar layout, auth check
                dashboard/page.tsx   # /dashboard
            `,
          note: 'Parentheses remove the folder name from the URL. Two groups must not resolve to the same path.',
        },
        {
          title: 'Parallel routes (@slot)',
          lang: 'tsx',
          code: c`
            // app/dashboard/@stats/page.tsx, app/dashboard/@feed/page.tsx
            // app/dashboard/layout.tsx receives each slot as a prop
            export default function Layout({ children, stats, feed }: {
              children: React.ReactNode; stats: React.ReactNode; feed: React.ReactNode
            }) {
              return <>{children}<aside>{stats}</aside>{feed}</>
            }
            `,
          note: 'Each slot loads and errors independently. Since Next.js 16 every slot needs a default.tsx (return null or notFound()), otherwise the build fails.',
        },
        {
          title: 'Intercepting routes (modal over a list)',
          lang: 'text',
          code: c`
            app/
              @modal/(.)photos/[id]/page.tsx   # shown as a modal when navigating from the feed
              @modal/default.tsx               # returns null
              photos/[id]/page.tsx             # full page on refresh or direct link
              layout.tsx                       # renders {children}{modal}

            (.) same level   (..) one level up   (...) from the app root
            `,
        },
      ],
    },

    // ───────────────────────── Server & client components ─────────────────────────
    {
      id: 'rsc-basics',
      title: 'Server vs client components',
      group: 'Server & client components',
      items: [
        {
          title: 'Server components are the default',
          code: c`
            // app/products/page.tsx — runs only on the server, ships no JS for itself
            import { db } from '@/lib/db'

            export default async function Products() {
              const products = await db.product.findMany()   // direct DB access, secrets are safe
              return <ProductGrid products={products} />
            }
            `,
          note: 'Server components cannot use state, effects, event handlers or browser APIs.',
        },
        {
          title: "'use client' marks a boundary",
          code: c`
            // components/AddToCart.tsx
            'use client'

            import { useState } from 'react'

            export function AddToCart({ productId }: { productId: number }) {
              const [qty, setQty] = useState(1)
              return <button onClick={() => addToCart(productId, qty)}>Add {qty}</button>
            }
            `,
          note: 'The directive goes at the very top of the file, and everything that file imports also becomes client code. Put it on small interactive leaves, not on layouts or pages.',
        },
        {
          title: 'Which one to use',
          lang: 'text',
          code: c`
            Need                                         Server   Client
            fetch data, query the DB, use secrets          ✓
            keep large libraries off the browser           ✓
            useState, useReducer, useEffect, useRef                  ✓
            onClick, onChange, form state while typing               ✓
            browser APIs (localStorage, window, geolocation)         ✓
            context providers, most UI libraries with hooks          ✓
            SEO content, static text, markdown rendering   ✓
            `,
        },
      ],
    },
    {
      id: 'rsc-composition',
      title: 'Passing data across the boundary',
      group: 'Server & client components',
      items: [
        {
          title: 'Props from server to client must be serializable',
          code: c`
            // app/products/[id]/page.tsx (server)
            const product = await db.product.findUnique({ where: { id } })

            <Gallery
              images={product.images}              // ✓ arrays, objects, strings, numbers, Date
              price={product.price.toString()}     // ✓ convert Decimal / class instances first
              onSelect={() => {}}                  // ✗ plain functions cannot be passed
            />
            `,
          note: 'Server Actions are the exception: a function marked "use server" can be passed to a client component as a prop.',
        },
        {
          title: 'Server components inside client components (children)',
          code: c`
            // components/Tabs.tsx
            'use client'
            export function Tabs({ children }: { children: React.ReactNode }) {
              const [open, setOpen] = useState(true)
              return <div>{open && children}<button onClick={() => setOpen(!open)}>Toggle</button></div>
            }

            // app/page.tsx (server)
            <Tabs>
              <ServerRenderedReviews />   {/* still rendered on the server */}
            </Tabs>
            `,
          note: 'A client component cannot import a server component, but it can render one passed in as children or another prop.',
        },
        {
          title: 'Context providers in a client wrapper',
          code: c`
            // app/providers.tsx
            'use client'
            import { ThemeProvider } from 'next-themes'

            export function Providers({ children }: { children: React.ReactNode }) {
              return <ThemeProvider attribute="class">{children}</ThemeProvider>
            }

            // app/layout.tsx
            <body><Providers>{children}</Providers></body>
            `,
        },
        {
          title: "Keep server code out of the browser: 'server-only'",
          lang: 'ts',
          code: c`
            // npm i server-only
            // lib/db.ts
            import 'server-only'     // build error if a client component imports this file

            // lib/use-media.ts
            import 'client-only'     // the opposite guard
            `,
        },
      ],
    },

    // ───────────────────────── Data fetching & caching ─────────────────────────
    {
      id: 'data-fetching',
      title: 'Fetching data',
      group: 'Data fetching & caching',
      items: [
        {
          title: 'fetch in a server component',
          code: c`
            async function getProduct(id: string) {
              const res = await fetch('https://api.example.com/products/' + id, {
                headers: { Authorization: 'Bearer ' + process.env.API_TOKEN },
              })
              if (!res.ok) throw new Error('Failed to load product ' + id)   // caught by error.tsx
              return res.json()
            }

            export default async function Page({ params }: { params: Promise<{ id: string }> }) {
              const { id } = await params
              const product = await getProduct(id)
              return <h1>{product.name}</h1>
            }
            `,
          note: 'For your own database, query it directly here instead of calling your own route handler over HTTP.',
        },
        {
          title: 'Fetch in parallel',
          code: c`
            const [user, orders] = await Promise.all([getUser(id), getOrders(id)])
            `,
          note: 'Two awaits in a row run one after the other (a waterfall). Start independent requests together.',
        },
        {
          title: 'Stream slow parts with Suspense',
          code: c`
            import { Suspense } from 'react'

            export default function Page() {
              return (
                <>
                  <ProductInfo />                              {/* fast */}
                  <Suspense fallback={<p>Loading reviews…</p>}>
                    <Reviews />                                {/* async, slow: streamed in later */}
                  </Suspense>
                </>
              )
            }
            `,
        },
        {
          title: 'Pass a promise to a client component and read it with use()',
          code: c`
            // server
            const reviewsPromise = getReviews(id)          // do not await
            <Suspense fallback={<Spinner />}><Reviews reviewsPromise={reviewsPromise} /></Suspense>

            // client
            'use client'
            import { use } from 'react'
            export function Reviews({ reviewsPromise }: { reviewsPromise: Promise<Review[]> }) {
              const reviews = use(reviewsPromise)
              return <ul>{reviews.map(r => <li key={r.id}>{r.text}</li>)}</ul>
            }
            `,
        },
        {
          title: 'Client-side fetching (SWR or TanStack Query)',
          code: c`
            'use client'
            import useSWR from 'swr'                       // npm i swr

            const fetcher = (url: string) => fetch(url).then(r => r.json())

            export function Cart() {
              const { data, error, isLoading } = useSWR('/api/cart', fetcher)
              if (isLoading) return <p>Loading…</p>
              if (error) return <p>Could not load cart</p>
              return <p>{data.items.length} items</p>
            }
            `,
          note: 'Use it for data that changes while the page is open (polling, infinite scroll). TanStack Query works the same way; see the React sheet.',
        },
      ],
    },
    {
      id: 'data-caching',
      title: 'Static vs dynamic & fetch caching',
      group: 'Data fetching & caching',
      items: [
        {
          title: 'How rendering is decided',
          lang: 'text',
          code: c`
            Static   HTML built at next build (or on first request), served from cache
                     → pages with no request-specific data
            Dynamic  rendered on every request
                     → cookies(), headers(), connection(), searchParams, draftMode(),
                       fetch with cache: 'no-store', uncached data with Cache Components

            next build prints ○ (static), ● (SSG with params) or ƒ (dynamic) for each route
            `,
        },
        {
          title: 'fetch cache options',
          code: c`
            fetch(url)                                          // not cached by default since Next 15
            fetch(url, { cache: 'force-cache' })                // cache until revalidated
            fetch(url, { cache: 'no-store' })                   // always fresh, makes the route dynamic
            fetch(url, { next: { revalidate: 3600 } })          // refresh at most once an hour
            fetch(url, { next: { tags: ['products'] } })        // revalidateTag('products', 'max') later
            `,
          note: 'Caching is opt-in since Next.js 15: in Next.js 14, fetch defaulted to force-cache. With cacheComponents enabled, prefer "use cache" over these options.',
        },
        {
          title: 'Route segment config (without cacheComponents)',
          code: c`
            // app/blog/page.tsx
            export const revalidate = 3600            // ISR: rebuild in the background at most hourly
            export const dynamic = 'force-dynamic'    // or 'force-static'
            `,
          note: 'These exports are not used when cacheComponents is enabled in Next.js 16; there "use cache" with cacheLife() controls freshness instead.',
        },
        {
          title: 'Request APIs are async',
          code: c`
            import { cookies, headers } from 'next/headers'
            import { connection } from 'next/server'

            const cookieStore = await cookies()
            const theme = cookieStore.get('theme')?.value
            const ua = (await headers()).get('user-agent')

            await connection()   // opt into dynamic rendering without reading anything
            `,
          note: 'cookies(), headers() and draftMode() return Promises since Next.js 15 (synchronous use removed in 16). connection() replaces the older unstable_noStore().',
        },
      ],
    },
    {
      id: 'data-use-cache',
      title: '"use cache" & Cache Components (Next 16)',
      group: 'Data fetching & caching',
      items: [
        {
          title: 'Turn it on',
          lang: 'ts',
          code: c`
            // next.config.ts
            const nextConfig: NextConfig = {
              cacheComponents: true,
            }
            `,
          note: 'With this flag everything is dynamic unless cached with "use cache", and uncached data must sit inside a Suspense boundary so a static shell can still be prerendered. It was experimental.dynamicIO / experimental.useCache in Next.js 15.',
        },
        {
          title: 'Cache a data function',
          lang: 'ts',
          code: c`
            // lib/products.ts
            import { cacheLife, cacheTag } from 'next/cache'

            export async function getProducts(category: string) {
              'use cache'
              cacheLife('hours')              // 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'max'
              cacheTag('products', 'category-' + category)
              return db.product.findMany({ where: { category } })
            }
            `,
          note: 'Arguments become part of the cache key, so they must be serializable. In Next.js 15 these were imported as unstable_cacheLife and unstable_cacheTag.',
        },
        {
          title: 'Cache a component or a whole page',
          code: c`
            export default async function Footer() {
              'use cache'
              const links = await getFooterLinks()
              return <footer>{links.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}</footer>
            }

            // or at the top of a file: 'use cache' caches every export
            `,
        },
        {
          title: 'Mix cached shell and per-request parts',
          code: c`
            export default function ProductPage() {
              return (
                <>
                  <CachedProductDetails />                 {/* "use cache": in the static shell */}
                  <Suspense fallback={<CartSkeleton />}>
                    <UserCart />                           {/* reads cookies(): streamed per request */}
                  </Suspense>
                </>
              )
            }
            `,
          note: 'You cannot call cookies() or headers() inside a "use cache" scope; read them outside and pass the values in as arguments.',
        },
      ],
    },
    {
      id: 'data-revalidate',
      title: 'Revalidation',
      group: 'Data fetching & caching',
      items: [
        {
          title: 'revalidatePath and revalidateTag',
          lang: 'ts',
          code: c`
            import { revalidatePath, revalidateTag } from 'next/cache'

            revalidatePath('/products')                 // one path
            revalidatePath('/blog/[slug]', 'page')      // every page of a dynamic route
            revalidatePath('/', 'layout')               // everything
            revalidateTag('products', 'max')            // stale-while-revalidate for tagged data
            `,
          note: 'In Next.js 16 revalidateTag takes a cacheLife profile as the second argument and serves stale data while it refreshes; the one-argument form from older versions is deprecated.',
        },
        {
          title: 'updateTag: read-your-own-writes in Server Actions',
          lang: 'ts',
          code: c`
            'use server'
            import { updateTag } from 'next/cache'

            export async function renameProduct(id: number, name: string) {
              await db.product.update({ where: { id }, data: { name } })
              updateTag('products')     // expire now; the next render waits for fresh data
            }
            `,
          note: 'updateTag is new in Next.js 16 and only works inside Server Actions; use revalidateTag in route handlers. Next.js 16 also added refresh() in next/cache to refresh uncached data from an action (check the docs for its exact behaviour).',
        },
        {
          title: 'On-demand revalidation from a CMS webhook',
          lang: 'ts',
          code: c`
            // app/api/revalidate/route.ts
            import { revalidateTag } from 'next/cache'

            export async function POST(request: Request) {
              if (request.headers.get('x-secret') !== process.env.REVALIDATE_SECRET) {
                return Response.json({ error: 'Unauthorized' }, { status: 401 })
              }
              const { tag } = await request.json()
              revalidateTag(tag, 'max')
              return Response.json({ revalidated: true })
            }
            `,
        },
      ],
    },

    // ───────────────────────── Mutations ─────────────────────────
    {
      id: 'actions-basics',
      title: 'Server Actions',
      group: 'Mutations',
      items: [
        {
          title: "An actions file ('use server')",
          lang: 'ts',
          code: c`
            // app/actions.ts
            'use server'

            import { revalidatePath } from 'next/cache'
            import { db } from '@/lib/db'

            export async function createTodo(formData: FormData) {
              const title = String(formData.get('title') ?? '').trim()
              if (!title) return
              await db.todo.create({ data: { title } })
              revalidatePath('/todos')
            }
            `,
          note: 'Every exported async function in a "use server" file becomes an RPC endpoint the browser can call.',
        },
        {
          title: 'Use it as a form action (works without JS)',
          code: c`
            // app/todos/page.tsx (server component)
            import { createTodo } from '@/app/actions'

            export default function Todos() {
              return (
                <form action={createTodo}>
                  <input name="title" required />
                  <button type="submit">Add</button>
                </form>
              )
            }
            `,
        },
        {
          title: 'Pass extra arguments with bind',
          code: c`
            // action: export async function deleteTodo(id: number, formData: FormData) { ... }
            const deleteWithId = deleteTodo.bind(null, todo.id)

            <form action={deleteWithId}><button>Delete</button></form>
            `,
          note: 'Bound values are serialized and sent from the client, so treat them as user input and check permissions in the action.',
        },
        {
          title: 'Call an action from an event handler',
          code: c`
            'use client'
            import { useTransition } from 'react'
            import { toggleTodo } from '@/app/actions'

            export function Toggle({ id, done }: { id: number; done: boolean }) {
              const [isPending, startTransition] = useTransition()
              return (
                <input type="checkbox" checked={done} disabled={isPending}
                  onChange={() => startTransition(() => toggleTodo(id))} />
              )
            }
            `,
        },
      ],
    },
    {
      id: 'actions-forms',
      title: 'Forms: validation & pending state',
      group: 'Mutations',
      items: [
        {
          title: 'Validate with zod and return errors',
          lang: 'ts',
          code: c`
            // app/signup/actions.ts
            'use server'
            import { z } from 'zod'
            import { redirect } from 'next/navigation'

            const Schema = z.object({
              email: z.string().email(),
              password: z.string().min(8, 'At least 8 characters'),
            })

            export type State = { errors?: Record<string, string[]>; message?: string }

            export async function signup(prev: State, formData: FormData): Promise<State> {
              const parsed = Schema.safeParse(Object.fromEntries(formData))
              if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

              const exists = await db.user.findUnique({ where: { email: parsed.data.email } })
              if (exists) return { message: 'Email already registered' }

              await createUser(parsed.data)
              redirect('/welcome')
            }
            `,
          note: 'With useActionState the action receives the previous state as its first argument. Zod 4 also offers z.flattenError(error) and z.treeifyError(error) for the same job.',
        },
        {
          title: 'useActionState + useFormStatus',
          code: c`
            // app/signup/SignupForm.tsx
            'use client'
            import { useActionState } from 'react'
            import { useFormStatus } from 'react-dom'
            import { signup, type State } from './actions'

            function SubmitButton() {
              const { pending } = useFormStatus()          // must be inside the <form>
              return <button disabled={pending}>{pending ? 'Creating…' : 'Sign up'}</button>
            }

            export function SignupForm() {
              const [state, formAction, isPending] = useActionState(signup, {} as State)
              return (
                <form action={formAction}>
                  <input name="email" type="email" />
                  {state.errors?.email && <p>{state.errors.email[0]}</p>}
                  <input name="password" type="password" />
                  {state.errors?.password && <p>{state.errors.password[0]}</p>}
                  {state.message && <p role="alert">{state.message}</p>}
                  <SubmitButton />
                </form>
              )
            }
            `,
          note: 'useActionState comes from react (React 19); it was useFormState from react-dom in Next.js 14.',
        },
      ],
    },
    {
      id: 'actions-after',
      title: 'After a mutation: revalidate, redirect, optimistic UI',
      group: 'Mutations',
      items: [
        {
          title: 'Revalidate then redirect',
          lang: 'ts',
          code: c`
            'use server'
            export async function createPost(formData: FormData) {
              const post = await db.post.create({ data: { title: String(formData.get('title')) } })
              revalidatePath('/blog')            // refresh the list
              redirect('/blog/' + post.slug)     // last: it throws to stop execution
            }
            `,
        },
        {
          title: 'useOptimistic',
          code: c`
            'use client'
            import { useOptimistic } from 'react'
            import { addComment } from './actions'

            export function Comments({ comments }: { comments: { id: string; text: string }[] }) {
              const [optimistic, addOptimistic] = useOptimistic(
                comments,
                (state, text: string) => [...state, { id: 'temp-' + Date.now(), text }],
              )

              async function action(formData: FormData) {
                addOptimistic(String(formData.get('text')))
                await addComment(formData)       // server revalidates; real list replaces the optimistic one
              }

              return (
                <form action={action}>
                  <ul>{optimistic.map(c => <li key={c.id}>{c.text}</li>)}</ul>
                  <input name="text" /><button>Post</button>
                </form>
              )
            }
            `,
        },
        {
          title: 'Security: every action is a public endpoint',
          lang: 'ts',
          code: c`
            'use server'
            export async function deleteOrder(orderId: number) {
              const session = await auth()                                  // 1. authenticate
              if (!session?.user) throw new Error('Unauthorized')

              const id = z.number().int().positive().parse(orderId)        // 2. validate input
              const order = await db.order.findUnique({ where: { id } })
              if (order?.userId !== session.user.id) throw new Error('Forbidden')   // 3. authorize

              await db.order.delete({ where: { id } })
              revalidatePath('/orders')
            }
            `,
          note: 'Hiding a button or protecting the page in proxy.ts does not protect the action, because anyone can POST to it. Return only the fields the client needs.',
        },
      ],
    },

    // ───────────────────────── API ─────────────────────────
    {
      id: 'api-routes',
      title: 'Route handlers',
      group: 'API',
      items: [
        {
          title: 'GET and POST (app/api/products/route.ts)',
          lang: 'ts',
          code: c`
            import { NextResponse, type NextRequest } from 'next/server'
            import { z } from 'zod'
            import { db } from '@/lib/db'

            export async function GET(request: NextRequest) {
              const q = request.nextUrl.searchParams.get('q') ?? ''
              const products = await db.product.findMany({ where: { name: { contains: q } } })
              return NextResponse.json(products)
            }

            const Product = z.object({ name: z.string().min(1), price: z.number().positive() })

            export async function POST(request: NextRequest) {
              const parsed = Product.safeParse(await request.json())
              if (!parsed.success) return NextResponse.json({ errors: parsed.error.issues }, { status: 422 })
              const product = await db.product.create({ data: parsed.data })
              return NextResponse.json(product, { status: 201 })
            }
            `,
          note: 'GET handlers are not cached by default since Next.js 15 (add export const dynamic = "force-static" to cache one). A route.ts cannot live in the same folder as a page.tsx.',
        },
        {
          title: 'Dynamic segment: app/api/products/[id]/route.ts',
          lang: 'ts',
          code: c`
            import { NextResponse } from 'next/server'

            export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
              const { id } = await params
              const product = await db.product.findUnique({ where: { id: Number(id) } })
              if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
              return NextResponse.json(product)
            }

            export async function DELETE(_req: Request, ctx: RouteContext<'/api/products/[id]'>) {
              const { id } = await ctx.params
              await db.product.delete({ where: { id: Number(id) } })
              return new Response(null, { status: 204 })
            }
            `,
          note: 'RouteContext is a global type helper generated by next dev / next build / next typegen (Next.js 15.5+); the inline Promise type works everywhere.',
        },
        {
          title: 'CORS for another origin',
          lang: 'ts',
          code: c`
            const cors = {
              'Access-Control-Allow-Origin': 'https://app.example.com',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }

            export function OPTIONS() {
              return new Response(null, { status: 204, headers: cors })
            }

            export async function GET() {
              return Response.json({ ok: true }, { headers: cors })
            }
            `,
        },
        {
          title: 'Cookies, headers and redirects in a handler',
          lang: 'ts',
          code: c`
            import { cookies } from 'next/headers'
            import { NextResponse } from 'next/server'

            export async function POST(request: Request) {
              const store = await cookies()
              store.set('theme', 'dark', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 })
              return NextResponse.redirect(new URL('/settings', request.url), 303)
            }
            `,
        },
        {
          title: 'Try it with curl',
          lang: 'bash',
          code: c`
            # macOS / Linux
            curl -s http://localhost:3000/api/products?q=shirt
            curl -i -X POST http://localhost:3000/api/products -H "Content-Type: application/json" -d '{"name":"Shirt","price":19.9}'
            `,
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                Invoke-RestMethod "http://localhost:3000/api/products?q=shirt"
                Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/products ${BT}
                  -ContentType "application/json" -Body '{"name":"Shirt","price":19.9}'
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'api-webhooks',
      title: 'Webhooks & runtime options',
      group: 'API',
      items: [
        {
          title: 'Webhook with signature check (Stripe example)',
          lang: 'ts',
          code: c`
            // app/api/webhooks/stripe/route.ts
            import Stripe from 'stripe'

            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

            export async function POST(request: Request) {
              const body = await request.text()                       // raw body, needed for the signature
              const signature = request.headers.get('stripe-signature')!

              let event: Stripe.Event
              try {
                event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
              } catch {
                return new Response('Invalid signature', { status: 400 })
              }

              if (event.type === 'checkout.session.completed') {
                await markOrderPaid(event.data.object.id)
              }
              return new Response(null, { status: 200 })
            }
            `,
          note: 'Read the body with request.text(), not request.json(), because re-serialized JSON no longer matches the signature. No bodyParser config is needed in the App Router.',
        },
        {
          title: 'Runtime and segment options',
          lang: 'ts',
          code: c`
            export const runtime = 'nodejs'          // default; 'edge' for the Edge runtime
            export const maxDuration = 60            // seconds, on hosts that support it (Vercel)
            export const dynamic = 'force-dynamic'   // never cache this handler
            `,
          note: 'Stay on nodejs unless you need the Edge runtime: many npm packages (Prisma with native drivers, bcrypt, fs) do not run on Edge.',
        },
        {
          title: 'Run work after the response with after()',
          lang: 'ts',
          code: c`
            import { after } from 'next/server'

            export async function POST(request: Request) {
              const order = await createOrder(await request.json())
              after(async () => {
                await sendConfirmationEmail(order)     // does not delay the response
              })
              return Response.json(order, { status: 201 })
            }
            `,
          note: 'after() is stable since Next.js 15.1 and also works in server components and Server Actions.',
        },
      ],
    },

    // ───────────────────────── Auth & proxy ─────────────────────────
    {
      id: 'auth-proxy',
      title: 'proxy.ts (formerly middleware.ts)',
      group: 'Auth & proxy',
      items: [
        {
          title: 'Redirect signed-out users (proxy.ts at the project root or in src/)',
          lang: 'ts',
          code: c`
            import { NextResponse, type NextRequest } from 'next/server'

            export function proxy(request: NextRequest) {
              const session = request.cookies.get('session')?.value
              if (!session) {
                const url = new URL('/login', request.url)
                url.searchParams.set('next', request.nextUrl.pathname)
                return NextResponse.redirect(url)
              }
              return NextResponse.next()
            }

            export const config = {
              matcher: ['/dashboard/:path*', '/account/:path*'],
            }
            `,
          note: 'Next.js 16 renamed middleware.ts to proxy.ts and the exported function from middleware to proxy; it runs on the Node.js runtime. middleware.ts still works for the Edge runtime but is deprecated.',
        },
        {
          title: 'Match everything except static files',
          lang: 'ts',
          code: c`
            export const config = {
              matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|webp)$).*)'],
            }
            `,
        },
        {
          title: 'Rewrite and add headers',
          lang: 'ts',
          code: c`
            export function proxy(request: NextRequest) {
              if (request.nextUrl.pathname.startsWith('/old-shop')) {
                return NextResponse.rewrite(new URL('/shop', request.url))   // URL in the browser stays the same
              }
              const response = NextResponse.next()
              response.headers.set('x-request-id', crypto.randomUUID())
              return response
            }
            `,
          note: 'Keep proxy logic cheap: it runs on every matched request. Use it for an optimistic cookie check and redirects, and do the real authorization next to the data.',
        },
        {
          title: 'Migrate an existing middleware.ts',
          lang: 'bash',
          code: c`
            # same on every OS
            npx @next/codemod@latest middleware-to-proxy .
            npx @next/codemod@latest upgrade latest       # full upgrade helper
            `,
          note: 'If the codemod name has changed, rename the file to proxy.ts and the function to proxy by hand; config.matcher stays the same.',
        },
      ],
    },
    {
      id: 'auth-authjs',
      title: 'Auth.js (NextAuth v5)',
      group: 'Auth & proxy',
      items: [
        {
          title: '1. Install and create a secret',
          lang: 'bash',
          code: c`
            # same on every OS
            npm install next-auth@beta
            npx auth secret          # writes AUTH_SECRET to .env.local
            `,
          note: 'v5 is still published under the beta tag; check authjs.dev for the current install command. GitHub OAuth needs AUTH_GITHUB_ID and AUTH_GITHUB_SECRET in .env.local.',
        },
        {
          title: '2. auth.ts at the project root',
          lang: 'ts',
          code: c`
            import NextAuth from 'next-auth'
            import GitHub from 'next-auth/providers/github'
            import Credentials from 'next-auth/providers/credentials'
            import bcrypt from 'bcryptjs'
            import { db } from '@/lib/db'

            export const { handlers, auth, signIn, signOut } = NextAuth({
              providers: [
                GitHub,
                Credentials({
                  credentials: { email: {}, password: {} },
                  async authorize(credentials) {
                    const user = await db.user.findUnique({ where: { email: String(credentials.email) } })
                    if (!user || !(await bcrypt.compare(String(credentials.password), user.passwordHash))) return null
                    return { id: String(user.id), email: user.email, name: user.name }
                  },
                }),
              ],
              pages: { signIn: '/login' },
            })
            `,
        },
        {
          title: '3. Route handler (app/api/auth/[...nextauth]/route.ts)',
          lang: 'ts',
          code: c`
            import { handlers } from '@/auth'
            export const { GET, POST } = handlers
            `,
        },
        {
          title: '4. Session in server components, sign in and out',
          code: c`
            import { auth, signIn, signOut } from '@/auth'

            export default async function UserMenu() {
              const session = await auth()
              if (!session?.user) {
                return (
                  <form action={async () => { 'use server'; await signIn('github') }}>
                    <button>Sign in with GitHub</button>
                  </form>
                )
              }
              return (
                <form action={async () => { 'use server'; await signOut() }}>
                  <span>{session.user.email}</span> <button>Sign out</button>
                </form>
              )
            }
            `,
          note: 'In client components use useSession() from next-auth/react inside a SessionProvider, or pass the session down as a prop.',
        },
        {
          title: '5. Protect pages, actions and proxy',
          lang: 'ts',
          code: c`
            // page or layout
            const session = await auth()
            if (!session) redirect('/login')

            // server action
            const session = await auth()
            if (!session?.user) throw new Error('Unauthorized')

            // proxy.ts: run Auth.js on matched routes
            export { auth as proxy } from '@/auth'
            export const config = { matcher: ['/dashboard/:path*'] }
            `,
          note: 'The Auth.js docs show export { auth as middleware } for middleware.ts; the proxy alias above follows the Next.js 16 rename, so confirm it in the current Auth.js docs.',
        },
        {
          title: 'Alternatives',
          lang: 'text',
          code: c`
            Better Auth   self-hosted library, DB sessions, plugins (2FA, orgs); Auth.js is now maintained by the Better Auth team
            Clerk         hosted auth with prebuilt UI components, free tier
            Supabase Auth if you already use Supabase
            DIY           jose + httpOnly cookie (below)
            `,
        },
      ],
    },
    {
      id: 'auth-diy',
      title: 'DIY cookie session with jose',
      group: 'Auth & proxy',
      items: [
        {
          title: 'lib/session.ts',
          lang: 'ts',
          code: c`
            // npm i jose
            import 'server-only'
            import { SignJWT, jwtVerify } from 'jose'
            import { cookies } from 'next/headers'

            const key = new TextEncoder().encode(process.env.SESSION_SECRET)

            export async function createSession(userId: string) {
              const token = await new SignJWT({ userId })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('7d')
                .sign(key)
              const store = await cookies()
              store.set('session', token, {
                httpOnly: true, secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
              })
            }

            export async function getSession() {
              const token = (await cookies()).get('session')?.value
              if (!token) return null
              try {
                const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
                return payload as { userId: string }
              } catch {
                return null
              }
            }

            export async function deleteSession() {
              (await cookies()).delete('session')
            }
            `,
          note: 'jose works in every runtime, including proxy.ts. The Node sheet explains JWT access and refresh tokens in more depth.',
        },
      ],
    },

    // ───────────────────────── Database ─────────────────────────
    {
      id: 'db-prisma',
      title: 'Prisma',
      group: 'Database',
      items: [
        {
          title: '1. Install and init',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i -D prisma
            npm i @prisma/client @prisma/adapter-pg dotenv
            npx prisma init --datasource-provider postgresql --output ../app/generated/prisma
            `,
          note: 'This is the Prisma 7 setup (new prisma-client generator and a driver adapter). For MySQL use --datasource-provider mysql and @prisma/adapter-mariadb; see the PostgreSQL and MySQL sheets for creating the database and user.',
        },
        {
          title: '2. Schema and config',
          lang: 'prisma',
          code: c`
            // prisma/schema.prisma
            generator client {
              provider = "prisma-client"
              output   = "../app/generated/prisma"
            }

            datasource db {
              provider = "postgresql"
            }

            model Product {
              id        Int      @id @default(autoincrement())
              name      String
              price     Decimal  @db.Decimal(10, 2)
              createdAt DateTime @default(now())
            }
            `,
          then: [
            {
              label: 'prisma.config.ts (Prisma 7 reads the connection URL here)',
              lang: 'ts',
              code: c`
                import 'dotenv/config'
                import { defineConfig, env } from 'prisma/config'

                export default defineConfig({
                  schema: 'prisma/schema.prisma',
                  migrations: { path: 'prisma/migrations' },
                  datasource: { url: env('DATABASE_URL') },
                })
                `,
            },
          ],
        },
        {
          title: '3. Migrate and generate',
          lang: 'bash',
          code: c`
            # same on every OS
            npx prisma migrate dev --name init     # create + apply a migration in development
            npx prisma generate                    # regenerate the client after schema changes
            npx prisma migrate deploy              # production / CI: apply pending migrations
            npx prisma studio                      # browse data in the browser
            `,
          note: 'Prisma 7 no longer runs generate automatically after migrate dev. Add app/generated to .gitignore and run prisma generate in postinstall or before next build.',
        },
        {
          title: '4. One client for the whole app (lib/db.ts)',
          lang: 'ts',
          code: c`
            import 'server-only'
            import { PrismaClient } from '@/app/generated/prisma/client'
            import { PrismaPg } from '@prisma/adapter-pg'

            const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

            export const db =
              globalForPrisma.prisma ??
              new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

            if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
            `,
          note: 'Hot reload re-imports modules, and a new PrismaClient each time exhausts database connections; the global keeps one. With Prisma 6 and older, import PrismaClient from @prisma/client and drop the adapter.',
        },
        {
          title: '5. Query in a server component and a Server Action',
          code: c`
            // app/products/page.tsx
            import { db } from '@/lib/db'
            export default async function Products() {
              const products = await db.product.findMany({ orderBy: { createdAt: 'desc' }, take: 20 })
              return <ul>{products.map(p => <li key={p.id}>{p.name}: {p.price.toString()}</li>)}</ul>
            }

            // app/products/actions.ts
            'use server'
            export async function addProduct(formData: FormData) {
              await db.product.create({ data: { name: String(formData.get('name')), price: String(formData.get('price')) } })
              revalidatePath('/products')
            }
            `,
          note: 'Never import lib/db.ts into a client component; the server-only import turns that mistake into a build error.',
        },
        {
          title: 'Drizzle ORM (alternative)',
          lang: 'ts',
          code: c`
            // npm i drizzle-orm postgres   &&   npm i -D drizzle-kit
            // lib/schema.ts
            import { pgTable, serial, text, numeric, timestamp } from 'drizzle-orm/pg-core'
            export const products = pgTable('products', {
              id: serial('id').primaryKey(),
              name: text('name').notNull(),
              price: numeric('price', { precision: 10, scale: 2 }).notNull(),
              createdAt: timestamp('created_at').defaultNow(),
            })

            // lib/db.ts
            import { drizzle } from 'drizzle-orm/postgres-js'
            import postgres from 'postgres'
            export const db = drizzle(postgres(process.env.DATABASE_URL!))

            // usage
            const rows = await db.select().from(products).where(eq(products.id, 1))
            `,
          then: [
            {
              label: 'Migrations (same on every OS)',
              lang: 'bash',
              code: c`
                npx drizzle-kit generate     # SQL migration files from the schema (needs drizzle.config.ts)
                npx drizzle-kit migrate      # apply them
                npx drizzle-kit push         # dev shortcut: sync schema without migration files
                `,
            },
          ],
        },
      ],
    },

    // ───────────────────────── Styling & assets ─────────────────────────
    {
      id: 'style-css',
      title: 'Tailwind, CSS Modules & fonts',
      group: 'Styling & assets',
      items: [
        {
          title: 'Tailwind CSS v4 (as set up by create-next-app)',
          lang: 'css',
          code: c`
            /* app/globals.css */
            @import "tailwindcss";

            @theme {
              --color-brand: #4f46e5;
              --font-sans: var(--font-inter);
            }
            `,
          note: 'Imported once in app/layout.tsx. Tailwind v4 has no tailwind.config.js by default; theme tokens live in CSS.',
          then: [
            {
              label: 'Adding it to an existing project',
              lang: 'bash',
              code: c`
                # same on every OS
                npm i -D tailwindcss @tailwindcss/postcss
                # postcss.config.mjs:  export default { plugins: { '@tailwindcss/postcss': {} } }
                `,
            },
          ],
        },
        {
          title: 'CSS Modules',
          code: c`
            // app/components/Button.module.css → .primary { background: #4f46e5; color: white; }
            import styles from './Button.module.css'

            export function Button(props: React.ComponentProps<'button'>) {
              return <button className={styles.primary} {...props} />
            }
            `,
          note: 'Class names are scoped to the component automatically. Global styles may only be imported from layouts or pages, not from arbitrary components (unless they are modules).',
        },
        {
          title: 'next/font: Google font, self-hosted automatically',
          code: c`
            // app/layout.tsx
            import { Inter } from 'next/font/google'

            const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })

            export default function RootLayout({ children }: { children: React.ReactNode }) {
              return (
                <html lang="en" className={inter.variable}>
                  <body className="font-sans">{children}</body>
                </html>
              )
            }
            `,
          note: 'The font files are downloaded at build time and served from your domain, so there is no request to Google and no layout shift.',
        },
        {
          title: 'Local font files',
          code: c`
            import localFont from 'next/font/local'

            const brand = localFont({
              src: [
                { path: './fonts/Brand-Regular.woff2', weight: '400', style: 'normal' },
                { path: './fonts/Brand-Bold.woff2', weight: '700', style: 'normal' },
              ],
              variable: '--font-brand',
            })
            `,
        },
      ],
    },
    {
      id: 'style-media',
      title: 'Images & scripts',
      group: 'Styling & assets',
      items: [
        {
          title: 'next/image with known size',
          code: c`
            import Image from 'next/image'
            import hero from '@/public/hero.jpg'        // static import: width/height/blur read automatically

            <Image src={hero} alt="Workshop" placeholder="blur" />
            <Image src="/logo.png" alt="Shop" width={120} height={40} />
            `,
          note: 'Images are resized, converted to WebP/AVIF and lazy-loaded. alt is required; use alt="" for decorative images.',
        },
        {
          title: 'Fill the parent (responsive cards, banners)',
          code: c`
            <div className="relative aspect-video">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            `,
          note: 'With fill the parent needs position: relative and a size. sizes tells the browser which width to download; without it, full-width images are fetched.',
        },
        {
          title: 'Load the LCP image early',
          code: c`
            <Image src={hero} alt="Workshop" preload />        // Next 16
            <Image src={hero} alt="Workshop" priority />       // Next 15 and older
            `,
          note: 'Next.js 16 deprecated priority in favour of preload (fetchPriority="high" is another option); check the next/image docs if your version rejects either prop.',
        },
        {
          title: 'Allow remote image hosts',
          lang: 'ts',
          code: c`
            // next.config.ts
            images: {
              remotePatterns: [
                { protocol: 'https', hostname: 'images.unsplash.com' },
                new URL('https://my-bucket.s3.amazonaws.com/products/**'),
              ],
            },
            `,
          note: 'images.domains is deprecated; remotePatterns limits which URLs your server will optimize. Restart next dev after the change.',
        },
        {
          title: 'next/script',
          code: c`
            import Script from 'next/script'

            <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXX" strategy="afterInteractive" />
            <Script src="https://widget.example.com/chat.js" strategy="lazyOnload" />
            <Script id="init" strategy="afterInteractive">
              {"window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments)} gtag('js', new Date()); gtag('config', 'G-XXXX');"}
            </Script>
            `,
          note: 'Strategies: beforeInteractive (root layout only, critical scripts), afterInteractive (default), lazyOnload (idle time), worker (experimental, Partytown).',
        },
      ],
    },

    // ───────────────────────── Metadata & SEO ─────────────────────────
    {
      id: 'seo-metadata',
      title: 'Metadata',
      group: 'Metadata & SEO',
      items: [
        {
          title: 'Static metadata',
          code: c`
            // app/about/page.tsx
            import type { Metadata } from 'next'

            export const metadata: Metadata = {
              title: 'About',                         // "About | Shop" via the root template
              description: 'Who we are and how we work.',
              alternates: { canonical: '/about' },
              openGraph: { images: ['/og/about.png'] },
            }
            `,
          note: 'Set metadataBase: new URL("https://example.com") in the root layout so relative URLs become absolute.',
        },
        {
          title: 'generateMetadata with async params',
          code: c`
            import type { Metadata } from 'next'

            export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
              const { slug } = await params
              const post = await getPost(slug)        // wrap in React cache() to share with the page
              if (!post) return { title: 'Not found' }
              return { title: post.title, description: post.excerpt }
            }
            `,
        },
        {
          title: 'File conventions: OG image, sitemap, robots',
          lang: 'text',
          code: c`
            app/opengraph-image.tsx   generated OG image (ImageResponse from next/og)
            app/icon.png, app/apple-icon.png, app/favicon.ico
            app/sitemap.ts            → /sitemap.xml (MetadataRoute.Sitemap)
            app/robots.ts             → /robots.txt  (MetadataRoute.Robots)
            app/manifest.ts           → /manifest.webmanifest
            `,
          note: 'The SEO sheet has full Next.js recipes for sitemap.ts, robots.ts, OG images, canonicals and JSON-LD.',
        },
      ],
    },

    // ───────────────────────── Testing ─────────────────────────
    {
      id: 'testing',
      title: 'Vitest & Playwright',
      group: 'Testing',
      items: [
        {
          title: '1. Install Vitest and Testing Library',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i -D vitest @vitejs/plugin-react jsdom vite-tsconfig-paths
            npm i -D @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
            `,
        },
        {
          title: '2. vitest.config.mts',
          lang: 'ts',
          code: c`
            import { defineConfig } from 'vitest/config'
            import react from '@vitejs/plugin-react'
            import tsconfigPaths from 'vite-tsconfig-paths'

            export default defineConfig({
              plugins: [tsconfigPaths(), react()],
              test: {
                environment: 'jsdom',
                setupFiles: ['./vitest.setup.ts'],     // import '@testing-library/jest-dom/vitest'
              },
            })
            `,
          note: 'Add "test": "vitest" to package.json scripts and run npm test.',
        },
        {
          title: '3. A component test',
          code: c`
            // components/Counter.test.tsx
            import { render, screen } from '@testing-library/react'
            import userEvent from '@testing-library/user-event'
            import { expect, test } from 'vitest'
            import { Counter } from './Counter'

            test('increments', async () => {
              render(<Counter />)
              await userEvent.click(screen.getByRole('button', { name: /add/i }))
              expect(screen.getByText('Count: 1')).toBeInTheDocument()
            })
            `,
          note: 'Vitest cannot render async server components yet; test their logic as plain functions and cover the page with Playwright.',
        },
        {
          title: 'Playwright end-to-end',
          lang: 'ts',
          code: c`
            // npm init playwright@latest   (same on every OS)
            // playwright.config.ts
            import { defineConfig } from '@playwright/test'

            export default defineConfig({
              testDir: './e2e',
              use: { baseURL: 'http://localhost:3000' },
              webServer: {
                command: 'npm run dev',          // or 'npm run build && npm run start' in CI
                url: 'http://localhost:3000',
                reuseExistingServer: !process.env.CI,
              },
            })
            `,
          note: 'See the Playwright sheet for locators, auth state and CI. Testing against a production build catches caching bugs that next dev hides.',
        },
        {
          title: 'Testing Server Actions',
          lang: 'ts',
          code: c`
            // actions are async functions: call them directly in Vitest
            import { vi, test, expect } from 'vitest'
            vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
            vi.mock('server-only', () => ({}))

            test('rejects an empty title', async () => {
              const fd = new FormData()
              fd.set('title', '')
              expect(await createTodo(fd)).toBeUndefined()
            })
            `,
          note: 'Mock next/cache, next/navigation and your auth helper; redirect() throws, so assert with rejects.toThrow when testing redirects.',
        },
      ],
    },

    // ───────────────────────── Deployment ─────────────────────────
    {
      id: 'deploy-vercel',
      title: 'Vercel',
      group: 'Deployment',
      items: [
        {
          title: 'Deploy with the CLI',
          lang: 'bash',
          code: c`
            # same on every OS
            npm i -g vercel
            vercel login
            vercel              # preview deployment (links the project on first run)
            vercel --prod       # production deployment
            `,
          note: 'Easier still: import the Git repository at vercel.com; every push then gets a preview URL and main deploys to production.',
        },
        {
          title: 'Environment variables',
          lang: 'bash',
          code: c`
            # same on every OS
            vercel env add DATABASE_URL production
            vercel env ls
            vercel env pull .env.local      # download development values
            `,
          note: 'Redeploy after changing variables, especially NEXT_PUBLIC_ ones, which are baked in at build time.',
        },
      ],
    },
    {
      id: 'deploy-self',
      title: 'Self-hosting on a Linux server',
      group: 'Deployment',
      items: [
        {
          title: '1. Standalone output',
          lang: 'ts',
          code: c`
            // next.config.ts
            const nextConfig: NextConfig = {
              output: 'standalone',     // .next/standalone with server.js and only the needed node_modules
            }
            `,
        },
        {
          title: '2. Build and copy static files',
          lang: 'bash',
          code: c`
            # on the server (or in CI), Linux
            npm ci
            npm run build
            cp -r public .next/standalone/
            cp -r .next/static .next/standalone/.next/
            `,
          note: 'The standalone folder does not include public/ or .next/static on its own; without these copies CSS, JS and images return 404.',
        },
        {
          title: '3. Run it with PM2',
          lang: 'bash',
          code: c`
            sudo npm i -g pm2
            cd .next/standalone
            PORT=3000 HOSTNAME=127.0.0.1 pm2 start server.js --name shop --update-env
            pm2 save
            pm2 startup systemd        # run the printed command so PM2 starts on boot
            pm2 logs shop
            `,
          note: 'Put runtime secrets in the environment (or an ecosystem.config.js), not in the repository.',
        },
        {
          title: '4. Nginx reverse proxy',
          lang: 'nginx',
          code: c`
            # /etc/nginx/sites-available/shop
            server {
              listen 80;
              server_name shop.example.com;

              location /_next/static/ {
                alias /var/www/shop/.next/standalone/.next/static/;
                expires 1y;
                add_header Cache-Control "public, max-age=31536000, immutable";
              }

              location / {
                proxy_pass http://127.0.0.1:3000;
                proxy_http_version 1.1;
                proxy_set_header Host $host;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_buffering off;          # let streamed (Suspense) responses flush
              }
            }
            `,
          then: [
            {
              label: 'Enable it and add HTTPS',
              lang: 'bash',
              code: c`
                sudo ln -s /etc/nginx/sites-available/shop /etc/nginx/sites-enabled/
                sudo nginx -t && sudo systemctl reload nginx
                sudo apt install -y certbot python3-certbot-nginx
                sudo certbot --nginx -d shop.example.com
                `,
            },
          ],
          note: 'The AWS, GCP and Azure sheets cover creating the server, firewall rules and DNS.',
        },
      ],
    },
    {
      id: 'deploy-docker',
      title: 'Docker',
      group: 'Deployment',
      items: [
        {
          title: 'Multi-stage Dockerfile (needs output: standalone)',
          lang: 'dockerfile',
          code: c`
            FROM node:24-alpine AS deps
            WORKDIR /app
            COPY package.json package-lock.json ./
            RUN npm ci

            FROM node:24-alpine AS build
            WORKDIR /app
            COPY --from=deps /app/node_modules ./node_modules
            COPY . .
            ENV NEXT_TELEMETRY_DISABLED=1
            RUN npm run build

            FROM node:24-alpine AS runner
            WORKDIR /app
            ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
            RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
            COPY --from=build /app/public ./public
            COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
            COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
            USER nextjs
            EXPOSE 3000
            CMD ["node", "server.js"]
            `,
          note: 'Add node_modules, .next and .env* to .dockerignore. NEXT_PUBLIC_ values must be present at build time (ARG + ENV in the build stage).',
        },
        {
          title: 'Build and run',
          lang: 'bash',
          code: c`
            # same on every OS
            docker build -t shop .
            docker run --rm -p 3000:3000 --env-file .env.production shop
            `,
          note: 'See the Docker sheet for Compose with a database.',
        },
      ],
    },
    {
      id: 'deploy-static-ci',
      title: 'Static export & CI',
      group: 'Deployment',
      items: [
        {
          title: "Static export (output: 'export')",
          lang: 'ts',
          code: c`
            // next.config.ts
            const nextConfig: NextConfig = {
              output: 'export',          // next build writes plain HTML/CSS/JS to out/
              trailingSlash: true,       // /about/index.html, friendlier for static hosts
              images: { unoptimized: true },
            }
            `,
          note: 'Not available in an export: Server Actions, route handlers other than static GET, proxy.ts, cookies()/headers(), ISR and the default image optimizer. Dynamic routes need generateStaticParams.',
        },
        {
          title: 'GitHub Actions: lint, type-check, build',
          lang: 'yaml',
          code: c`
            # .github/workflows/ci.yml
            name: CI
            on:
              push: { branches: [main] }
              pull_request:

            jobs:
              build:
                runs-on: ubuntu-latest
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm
                  - uses: actions/cache@v4
                    with:
                      path: .next/cache
                      key: nextjs-${GH} runner.os }}-${GH} hashFiles('package-lock.json') }}
                  - run: npm ci
                  - run: npx eslint .
                  - run: npx tsc --noEmit
                  - run: npm run build
                    env:
                      NEXT_TELEMETRY_DISABLED: 1
            `,
          note: 'Caching .next/cache speeds up repeated builds. The CI/CD sheet shows deploy jobs for SSH, Docker and cloud hosts.',
        },
      ],
    },

    // ───────────────────────── Troubleshooting ─────────────────────────
    {
      id: 'troubleshooting',
      title: 'Common errors & fixes',
      group: 'Troubleshooting',
      items: [
        {
          title: 'Error table',
          lang: 'text',
          code: c`
            Hydration failed / text content did not match   server and browser rendered different HTML:
                                                            Date.now(), Math.random(), toLocaleString(), window checks,
                                                            invalid nesting (<div> in <p>) → move to useEffect
            "You're importing a component that needs useState"   add 'use client' at the top of that file
            "Functions cannot be passed directly to Client Components"
                                                            pass data, or make the function a Server Action
            Dynamic server usage / "used cookies() inside"  route forced static but reads request data
                                                            → remove force-static or move the read into Suspense
            Uncached data was accessed outside of <Suspense>  (cacheComponents) wrap it in Suspense or "use cache"
            process.env.X is undefined in the browser       rename to NEXT_PUBLIC_X and rebuild
            Module not found right after npm install        stop dev, delete .next, start again
            Invalid src prop … hostname is not configured   add the host to images.remotePatterns, restart
            404 on refresh with output: 'export'            host must serve /about/index.html → trailingSlash: true
            Old data after a mutation                       revalidatePath / revalidateTag / updateTag in the action
            Slow dev server                                 Turbopack is default in 16; check you did not add --webpack
            params.slug is undefined / Promise warnings     await params (and searchParams) since Next 15
            `,
        },
        {
          title: 'Fix a hydration mismatch',
          code: c`
            'use client'
            import { useEffect, useState } from 'react'

            export function LocalTime({ iso }: { iso: string }) {
              const [text, setText] = useState('')                  // same on server and first client render
              useEffect(() => { setText(new Date(iso).toLocaleString()) }, [iso])
              return <time dateTime={iso}>{text}</time>
            }

            // one unavoidable difference only:
            <time suppressHydrationWarning>{new Date().toLocaleTimeString()}</time>
            `,
          note: 'suppressHydrationWarning only silences one level of text; use it sparingly. For browser-only widgets, next/dynamic with ssr: false (inside a client component) is another option.',
        },
        {
          title: 'Clear the build cache',
          lang: 'bash',
          code: c`
            # macOS / Linux (Ubuntu / Debian)
            rm -rf .next node_modules/.cache
            npm run dev
            `,
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                Remove-Item -Recurse -Force .next
                npm run dev
                `,
            },
          ],
        },
        {
          title: 'See what is cached',
          lang: 'ts',
          code: c`
            // next.config.ts: log fetch requests and cache hits/misses in the terminal
            const nextConfig: NextConfig = {
              logging: { fetches: { fullUrl: true } },
            }
            `,
          note: 'Always check caching with npm run build && npm run start; next dev renders every request fresh.',
        },
      ],
    },
  ],
}
