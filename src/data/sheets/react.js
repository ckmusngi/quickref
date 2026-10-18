import { c, BT } from './shared/code.js'

export default {
  slug: 'react',
  title: 'React',
  tech: 'React',
  category: 'frontend',
  minutes: 43,
  lang: 'jsx',
  description: 'Components, props, rendering, global state with Zustand, every built-in hook (including React 19 useActionState, useOptimistic, use and useEffectEvent), context, memoization, custom hooks, forms, React Router and data fetching.',
  sections: [
    {
      id: 'project-setup',
      title: 'Project setup, step by step',
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

            node -v      # 20.19+ or 22.12+ needed for current Vite
            `,
        },
        {
          title: '2. Create the app with Vite',
          lang: 'bash',
          code: c`
            npm create vite@latest my-app -- --template react       # JavaScript
            npm create vite@latest my-app -- --template react-ts    # TypeScript
            cd my-app
            npm install
            `,
          note: 'Same on every OS. For a full-stack framework with routing and server rendering, use React Router (framework mode) or Next.js instead.',
        },
        {
          title: '3. Run the dev server',
          lang: 'bash',
          code: c`
            npm run dev          # http://localhost:5173 with hot reload
            `,
        },
        {
          title: '4. Folder layout',
          lang: 'text',
          code: c`
            src/
              main.jsx          # createRoot(...).render(<App />)
              App.jsx
              components/       # reusable UI
              pages/            # route-level screens
              hooks/            # custom hooks (useXxx)
              stores/           # Zustand / context
              lib/ or api/      # fetch helpers, API client
              assets/
            public/             # copied as-is (favicon, robots.txt)
            index.html
            vite.config.js
            `,
        },
        {
          title: '5. Add common libraries',
          lang: 'bash',
          code: c`
            npm i react-router-dom             # routing
            npm i @tanstack/react-query        # server state / data fetching
            npm i zustand                      # client state
            npm i -D tailwindcss @tailwindcss/vite   # styling (optional)
            `,
        },
        {
          title: '6. Environment variables',
          lang: 'env',
          code: c`
            # .env (committed defaults)      .env.local (your machine, git-ignored)
            VITE_API_URL=http://localhost:8000/api
            `,
          note: 'Only variables starting with VITE_ reach the browser: import.meta.env.VITE_API_URL. Never put secrets here, because they end up in the bundle.',
        },
        {
          title: '7. Proxy API calls to your backend in dev',
          lang: 'js',
          code: c`
            // vite.config.js
            import { defineConfig } from 'vite'
            import react from '@vitejs/plugin-react'

            export default defineConfig({
              plugins: [react()],
              server: {
                proxy: {
                  '/api': 'http://localhost:8000',     // Laravel / Express / Django / FastAPI
                },
              },
            })
            `,
          note: 'fetch("/api/products") now reaches your backend without CORS problems during development.',
        },
        {
          title: '8. Build and preview',
          lang: 'bash',
          code: c`
            npm run build        # dist/
            npm run preview      # serve the production build locally
            `,
          note: 'Deploy dist/ to any static host (S3 + CloudFront, Cloud Storage, Netlify, Vercel, or Nginx: see the cloud guides).',
        },
      ],
    },
    {
      id: 'components',
      title: 'Components & props',
      group: 'Basics',
      items: [
        {
          title: 'Function component',
          code: c`
            export default function Badge({ label, tone = 'blue' }) {
              return <span className={${BT}badge badge-${'${'}tone}${BT}}>{label}</span>
            }
            `,
        },
        {
          title: 'Typed props',
          lang: 'tsx',
          code: c`
            type ButtonProps = {
              variant?: 'primary' | 'ghost'
              onClick?: () => void
              children: React.ReactNode
            }

            export function Button({ variant = 'primary', children, ...rest }: ButtonProps) {
              return <button className={variant} {...rest}>{children}</button>
            }
            `,
        },
        {
          title: 'children & composition',
          code: c`
            function Card({ title, children }) {
              return (
                <div className="card">
                  <h3>{title}</h3>
                  {children}
                </div>
              )
            }

            <Card title="Totals"><Summary /></Card>
            `,
        },
        {
          title: 'Fragments',
          code: c`
            <>
              <Header />
              <Main />
            </>
            `,
        },
      ],
    },
    {
      id: 'rendering',
      title: 'Rendering',
      group: 'Basics',
      items: [
        {
          title: 'Conditional',
          code: c`
            {loading && <Spinner />}
            {error ? <ErrorBox error={error} /> : <Table rows={rows} />}
            {items.length > 0 && <List items={items} />}
            `,
          note: 'Use items.length > 0, not items.length — otherwise a 0 is rendered.',
        },
        {
          title: 'Lists need keys',
          code: c`
            <ul>
              {users.map(user => (
                <li key={user.id}>{user.name}</li>
              ))}
            </ul>
            `,
          note: 'Use a stable id, not the array index, when items can be reordered.',
        },
        {
          title: 'Classes & styles',
          code: "<div className={`row ${active ? 'active' : ''}`} style={{ width: `${pct}%` }} />",
        },
      ],
    },
    {
      id: 'events',
      title: 'Events & forms',
      group: 'Basics',
      items: [
        {
          title: 'Event handlers',
          code: c`
            <button onClick={() => remove(item.id)}>Delete</button>
            <input onChange={e => setQuery(e.target.value)} />
            `,
        },
        {
          title: 'Controlled form',
          code: c`
            function LoginForm() {
              const [form, setForm] = useState({ email: '', password: '' })

              const update = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

              const submit = e => {
                e.preventDefault()
                login(form)
              }

              return (
                <form onSubmit={submit}>
                  <input name="email" value={form.email} onChange={update} />
                  <input name="password" type="password" value={form.password} onChange={update} />
                  <button>Sign in</button>
                </form>
              )
            }
            `,
        },
        {
          title: 'Uncontrolled with FormData',
          code: c`
            const onSubmit = e => {
              e.preventDefault()
              const data = Object.fromEntries(new FormData(e.currentTarget))
            }
            `,
        },
        {
          title: 'Lifting state up',
          note: 'When two siblings need the same data, keep the state in their closest common parent and pass it down as props.',
        },
      ],
    },
    {
      id: 'hooks-overview',
      title: 'Overview: every built-in hook',
      group: 'Hooks',
      items: [
        {
          title: 'All React hooks at a glance',
          lang: 'text',
          code: c`
            STATE
              useState              local state                       const [v, setV] = useState(0)
              useReducer            state + reducer function          const [s, dispatch] = useReducer(fn, init)
              useActionState  (19)  state driven by a form action     const [state, action, pending] = useActionState(fn, init)
              useOptimistic   (19)  show a result before the server   const [optimistic, add] = useOptimistic(state, fn)

            CONTEXT
              useContext            read a context value              const theme = useContext(ThemeContext)
              use             (19)  read a context or a promise       const theme = use(ThemeContext)

            REFS
              useRef                DOM node / value kept across renders, no re-render
              useImperativeHandle   choose what a parent's ref can call

            EFFECTS
              useEffect             sync with the outside world after paint
              useLayoutEffect       same, but before paint (measure layout)
              useInsertionEffect    inject CSS before layout (CSS-in-JS libraries)
              useEffectEvent (19.2) non-reactive event logic used inside an effect

            PERFORMANCE
              useMemo               cache a computed value
              useCallback           cache a function
              useTransition         mark an update as non-urgent (+ isPending)
              useDeferredValue      show a stale value while a new one renders

            OTHER
              useId                 unique, SSR-safe id for labels / aria
              useSyncExternalStore  subscribe to a store outside React
              useDebugValue         label a custom hook in React DevTools
              useFormStatus   (react-dom 19)  pending state of the parent <form>
            `,
          note: '(19) = React 19 or newer. This project uses React 19, so every hook here is available.',
        },
        {
          title: 'Rules of hooks',
          lang: 'jsx',
          code: c`
            function Profile({ userId }) {
              const [user, setUser] = useState(null)      // ✅ top level of a component

              if (!userId) return null                    // early return AFTER all hooks

              // ❌ never inside conditions, loops, nested functions or after an early return:
              // if (userId) { useEffect(...) }
              // items.forEach(() => useState())
              return <h1>{user?.name}</h1>
            }
            `,
          note: 'React matches hooks by call order on every render. The only exception is use(), which may be called conditionally. The ESLint plugin catches mistakes and missing effect dependencies:',
          then: [
            {
              label: 'Install the lint rules',
              lang: 'bash',
              code: c`
                npm i -D eslint-plugin-react-hooks
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'state',
      title: 'State: useState, useReducer, useActionState, useOptimistic',
      group: 'Hooks',
      items: [
        {
          title: 'useState',
          code: c`
            const [count, setCount] = useState(0)

            setCount(c => c + 1) // updater form when based on previous value
            `,
        },
        {
          title: 'Lazy initial state',
          code: "const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('items')) ?? [])",
        },
        {
          title: 'Updating objects & arrays',
          code: c`
            setUser(u => ({ ...u, name: 'Kiel' }))
            setList(l => [...l, newItem])
            setList(l => l.filter(x => x.id !== id))
            `,
          note: 'Always return a new object/array — never mutate state.',
        },
        {
          title: 'useReducer',
          code: c`
            function reducer(state, action) {
              switch (action.type) {
                case 'add': return { ...state, items: [...state.items, action.item] }
                case 'clear': return { ...state, items: [] }
                default: return state
              }
            }

            const [state, dispatch] = useReducer(reducer, { items: [] })
            `,
        },
        {
          title: 'State updates are batched and asynchronous',
          lang: 'jsx',
          code: c`
            function Counter() {
              const [count, setCount] = useState(0)

              function addThree() {
                setCount(count + 1)        // ❌ all three read the same "count"
                setCount(count + 1)
                setCount(count + 1)        // → count + 1

                setCount(c => c + 1)       // ✅ updater function sees the latest value
                setCount(c => c + 1)
                setCount(c => c + 1)       // → count + 3
              }

              console.log(count)           // still the old value until the next render
              return <button onClick={addThree}>{count}</button>
            }
            `,
        },
        {
          title: 'Reset state with a key',
          lang: 'jsx',
          code: c`
            // switching userId remounts ProfileForm, so all its state starts fresh
            <ProfileForm key={userId} userId={userId} />
            `,
          note: 'Simpler and safer than an effect that resets state when a prop changes.',
        },
        {
          title: 'useReducer with lazy init and typed actions',
          lang: 'jsx',
          code: c`
            const initialCart = { items: [], coupon: null }

            function cartReducer(state, action) {
              switch (action.type) {
                case 'add': {
                  const found = state.items.find(i => i.id === action.item.id)
                  const items = found
                    ? state.items.map(i => (i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i))
                    : [...state.items, { ...action.item, qty: 1 }]
                  return { ...state, items }
                }
                case 'remove':
                  return { ...state, items: state.items.filter(i => i.id !== action.id) }
                case 'clear':
                  return initialCart
                default:
                  throw new Error('Unknown action: ' + action.type)
              }
            }

            function Cart() {
              const [cart, dispatch] = useReducer(cartReducer, initialCart, init =>
                JSON.parse(localStorage.getItem('cart')) ?? init)     // 3rd arg: lazy initializer

              return (
                <>
                  <button onClick={() => dispatch({ type: 'add', item: { id: 1, name: 'Tee', price: 299 } })}>Add</button>
                  <button onClick={() => dispatch({ type: 'clear' })}>Clear</button>
                  <p>{cart.items.length} items</p>
                </>
              )
            }
            `,
          note: 'Reach for useReducer when the next state depends on the previous one in several ways, or many handlers update the same state.',
        },
        {
          title: 'useActionState (React 19): form state from an action',
          lang: 'jsx',
          code: c`
            import { useActionState } from 'react'

            async function subscribe(prevState, formData) {
              const email = formData.get('email')
              const res = await fetch('/api/subscribe', { method: 'POST', body: formData })
              if (!res.ok) return { error: 'Could not subscribe ' + email }
              return { success: true }
            }

            function Newsletter() {
              const [state, formAction, isPending] = useActionState(subscribe, { error: null })

              return (
                <form action={formAction}>
                  <input name="email" type="email" required />
                  <button disabled={isPending}>{isPending ? 'Sending…' : 'Subscribe'}</button>
                  {state.error && <p className="error">{state.error}</p>}
                  {state.success && <p>Thanks!</p>}
                </form>
              )
            }
            `,
          note: 'The action receives the previous state and the FormData. Whatever it returns becomes the new state. isPending is true while it runs.',
        },
        {
          title: 'useOptimistic (React 19): instant UI, confirm later',
          lang: 'jsx',
          code: c`
            import { useOptimistic, startTransition } from 'react'

            function Todos({ todos, saveTodo }) {
              const [optimisticTodos, addOptimistic] = useOptimistic(
                todos,
                (current, newTodo) => [...current, { ...newTodo, sending: true }],
              )

              async function add(formData) {
                const todo = { id: crypto.randomUUID(), text: formData.get('text') }
                addOptimistic(todo)          // shows immediately
                await saveTodo(todo)         // parent updates "todos" when the server answers
              }

              return (
                <>
                  <form action={add}><input name="text" /><button>Add</button></form>
                  <ul>
                    {optimisticTodos.map(t => (
                      <li key={t.id} style={{ opacity: t.sending ? 0.5 : 1 }}>{t.text}</li>
                    ))}
                  </ul>
                </>
              )
            }
            `,
          note: 'Call addOptimistic inside a form action or startTransition. If the save fails, the optimistic item disappears automatically when the action ends.',
        },
      ],
    },
    {
      id: 'effects',
      title: 'Effects: useEffect, useLayoutEffect, useInsertionEffect, useEffectEvent',
      group: 'Hooks',
      items: [
        {
          title: 'Run after render',
          code: c`
            useEffect(() => {
              document.title = ${BT}${'${'}count} new${BT}
            }, [count])
            `,
        },
        {
          title: 'Clean up',
          code: c`
            useEffect(() => {
              const onResize = () => setWidth(window.innerWidth)
              window.addEventListener('resize', onResize)
              return () => window.removeEventListener('resize', onResize)
            }, [])
            `,
        },
        {
          title: 'Fetch with cancellation',
          code: c`
            useEffect(() => {
              const ctrl = new AbortController()
              fetch(${BT}/api/users/${'${'}id}${BT}, { signal: ctrl.signal })
                .then(r => r.json())
                .then(setUser)
                .catch(() => {})
              return () => ctrl.abort()
            }, [id])
            `,
        },
        {
          title: 'Dependency array rules',
          lang: 'jsx',
          code: c`
            useEffect(() => { /* ... */ })              // runs after EVERY render
            useEffect(() => { /* ... */ }, [])          // runs once after mount (twice in StrictMode dev)
            useEffect(() => { /* ... */ }, [a, b])      // runs when a or b change

            useEffect(() => {
              const id = setInterval(tick, 1000)
              return () => clearInterval(id)            // cleanup: before re-running and on unmount
            }, [])
            `,
          note: 'List every prop, state and function from the component that the effect uses. If that causes too many runs, move the value inside the effect, use an updater function, or useEffectEvent.',
        },
        {
          title: 'You might not need an effect',
          lang: 'jsx',
          code: c`
            // ❌ derived state via effect: extra render, can get out of sync
            const [fullName, setFullName] = useState('')
            useEffect(() => setFullName(first + ' ' + last), [first, last])

            // ✅ just compute it during render
            const fullName = first + ' ' + last

            // ❌ reacting to an event inside an effect
            useEffect(() => { if (submitted) post(form) }, [submitted])

            // ✅ do it in the event handler
            function handleSubmit() { post(form) }
            `,
          note: 'Effects are for syncing with things outside React: network, subscriptions, timers, the DOM, third-party widgets.',
        },
        {
          title: 'useLayoutEffect: measure before the browser paints',
          lang: 'jsx',
          code: c`
            import { useLayoutEffect, useRef, useState } from 'react'

            function Tooltip({ anchorRect, children }) {
              const ref = useRef(null)
              const [height, setHeight] = useState(0)

              useLayoutEffect(() => {
                setHeight(ref.current.getBoundingClientRect().height)   // read layout
              }, [])

              const top = anchorRect.top - height - 8                    // place above the anchor
              return <div ref={ref} className="tooltip" style={{ top }}>{children}</div>
            }
            `,
          note: 'Runs synchronously after DOM changes but before paint, so the user never sees the wrong position. It blocks painting, so prefer useEffect unless you see a flicker.',
        },
        {
          title: 'useInsertionEffect: for CSS-in-JS libraries',
          lang: 'jsx',
          code: c`
            import { useInsertionEffect } from 'react'

            function useCss(rule) {
              useInsertionEffect(() => {
                const style = document.createElement('style')
                style.textContent = rule
                document.head.appendChild(style)
                return () => style.remove()
              }, [rule])
            }
            `,
          note: 'Fires before any layout effects, so styles exist before anything measures the DOM. You will rarely write this yourself. It is meant for styling libraries.',
        },
        {
          title: 'useEffectEvent (React 19.2): read latest values without re-running',
          lang: 'jsx',
          code: c`
            import { useEffect, useEffectEvent } from 'react'

            function ChatRoom({ roomId, theme }) {
              const onConnected = useEffectEvent(() => {
                showToast('Connected to ' + roomId, theme)    // always sees the latest theme
              })

              useEffect(() => {
                const conn = createConnection(roomId)
                conn.on('connected', onConnected)
                conn.connect()
                return () => conn.disconnect()
              }, [roomId])          // ✅ changing theme no longer reconnects
            }
            `,
          note: 'Use it for logic that should not trigger the effect. Only call the returned function from inside effects, and do not list it in the dependency array.',
        },
      ],
    },
    {
      id: 'refs',
      title: 'Refs & context: useRef, useImperativeHandle, useContext, use',
      group: 'Hooks',
      items: [
        {
          title: 'DOM ref',
          code: c`
            const inputRef = useRef(null)
            <input ref={inputRef} />
            inputRef.current.focus()
            `,
        },
        {
          title: 'Mutable value without re-render',
          code: c`
            const renders = useRef(0)
            renders.current++
            `,
        },
        {
          title: 'Context',
          code: c`
            const ThemeContext = createContext('light')

            <ThemeContext.Provider value={theme}>
              <App />
            </ThemeContext.Provider>

            const theme = useContext(ThemeContext)
            `,
        },
        {
          title: 'Callback ref: run code when a node mounts',
          lang: 'jsx',
          code: c`
            function AutoMeasure() {
              const [width, setWidth] = useState(0)

              const measure = node => {
                if (!node) return
                const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
                ro.observe(node)
                return () => ro.disconnect()     // React 19: cleanup function for ref callbacks
              }

              return <div ref={measure}>Width: {Math.round(width)}px</div>
            }
            `,
        },
        {
          title: 'Pass a ref to your own component (React 19)',
          lang: 'jsx',
          code: c`
            // React 19: ref is a normal prop, no forwardRef needed
            function TextInput({ ref, ...props }) {
              return <input ref={ref} {...props} />
            }

            function Form() {
              const inputRef = useRef(null)
              return (
                <>
                  <TextInput ref={inputRef} placeholder="Name" />
                  <button onClick={() => inputRef.current.focus()}>Focus</button>
                </>
              )
            }

            // React 18 and older: const TextInput = forwardRef((props, ref) => <input ref={ref} {...props} />)
            `,
        },
        {
          title: 'useImperativeHandle: expose a custom API',
          lang: 'jsx',
          code: c`
            import { useImperativeHandle, useRef } from 'react'

            function VideoPlayer({ ref, src }) {
              const videoRef = useRef(null)

              useImperativeHandle(ref, () => ({
                play: () => videoRef.current.play(),
                pause: () => videoRef.current.pause(),
                restart: () => { videoRef.current.currentTime = 0; videoRef.current.play() },
              }), [])

              return <video ref={videoRef} src={src} />
            }

            // parent
            const player = useRef(null)
            <VideoPlayer ref={player} src="/intro.mp4" />
            <button onClick={() => player.current.restart()}>Restart</button>
            `,
          note: 'The parent only gets play / pause / restart, not the whole DOM node. Use it sparingly: props are usually the better API.',
        },
        {
          title: 'Context the clean way: provider + custom hook',
          lang: 'jsx',
          code: c`
            // AuthContext.jsx
            import { createContext, useContext, useState } from 'react'

            const AuthContext = createContext(null)

            export function AuthProvider({ children }) {
              const [user, setUser] = useState(null)
              const login = async (email, password) => setUser(await api.login(email, password))
              const logout = () => setUser(null)

              return <AuthContext value={{ user, login, logout }}>{children}</AuthContext>   // React 19 (older: AuthContext.Provider)
            }

            export function useAuth() {
              const ctx = useContext(AuthContext)
              if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
              return ctx
            }

            // anywhere below the provider
            const { user, logout } = useAuth()
            `,
          note: 'Every consumer re-renders when the value changes. Split large contexts, or memoize the value with useMemo.',
        },
        {
          title: 'use (React 19): read context or a promise',
          lang: 'jsx',
          code: c`
            import { use, Suspense } from 'react'

            // 1. context, and unlike useContext it may sit inside if / loops
            function Heading({ show }) {
              if (show) {
                const theme = use(ThemeContext)
                return <h1 className={theme}>Hello</h1>
              }
              return null
            }

            // 2. promise: suspends until it resolves
            function Comments({ commentsPromise }) {
              const comments = use(commentsPromise)
              return comments.map(c => <p key={c.id}>{c.text}</p>)
            }

            function Post({ id }) {
              const commentsPromise = useMemo(() => fetch('/api/posts/' + id + '/comments').then(r => r.json()), [id])
              return (
                <Suspense fallback={<p>Loading comments…</p>}>
                  <Comments commentsPromise={commentsPromise} />
                </Suspense>
              )
            }
            `,
          note: 'Create the promise outside the component that calls use() (in a parent, a loader, or a cache). A promise created during the same render would restart on every render. Errors go to the nearest error boundary.',
        },
      ],
    },
    {
      id: 'perf',
      title: 'Performance: useMemo, useCallback, useTransition, useDeferredValue',
      group: 'Hooks',
      items: [
        {
          title: 'useMemo',
          code: c`
            const total = useMemo(
              () => lines.reduce((sum, l) => sum + l.amount, 0),
              [lines]
            )
            `,
        },
        {
          title: 'useCallback',
          code: 'const onSave = useCallback(() => save(form), [form])',
        },
        {
          title: 'memo',
          code: c`
            const Row = memo(function Row({ item }) {
              return <li>{item.name}</li>
            })
            `,
          note: 'Only skips re-rendering when props are shallow-equal.',
        },
        {
          title: 'useTransition',
          code: c`
            const [isPending, startTransition] = useTransition()

            startTransition(() => setFilter(value))
            `,
        },
        {
          title: 'useDeferredValue: keep typing smooth',
          lang: 'jsx',
          code: c`
            import { useDeferredValue, useState, memo } from 'react'

            function Search() {
              const [query, setQuery] = useState('')
              const deferredQuery = useDeferredValue(query)        // lags behind while React is busy
              const isStale = query !== deferredQuery

              return (
                <>
                  <input value={query} onChange={e => setQuery(e.target.value)} />
                  <div style={{ opacity: isStale ? 0.5 : 1 }}>
                    <SlowResults query={deferredQuery} />
                  </div>
                </>
              )
            }

            const SlowResults = memo(function SlowResults({ query }) {
              /* expensive filtering / rendering */
            })
            `,
          note: 'useTransition wraps the state update. useDeferredValue wraps a value you receive. Both keep the input responsive.',
        },
        {
          title: 'useTransition for tabs / navigation',
          lang: 'jsx',
          code: c`
            const [tab, setTab] = useState('about')
            const [isPending, startTransition] = useTransition()

            function selectTab(next) {
              startTransition(() => setTab(next))       // the old tab stays interactive while the new one renders
            }

            <button onClick={() => selectTab('posts')} disabled={isPending}>Posts</button>
            {isPending && <Spinner />}
            `,
        },
        {
          title: 'When to use useMemo / useCallback',
          note: 'Use them when a calculation is noticeably slow, when passing objects or functions to a memo() child, or when a value is an effect dependency. Otherwise skip them, because they add complexity. The React Compiler (babel-plugin-react-compiler) can add this memoization for you automatically.',
        },
      ],
    },
    {
      id: 'hooks-other',
      title: 'Other: useId, useFormStatus, useSyncExternalStore, useDebugValue',
      group: 'Hooks',
      items: [
        {
          title: 'useId: accessible, SSR-safe ids',
          lang: 'jsx',
          code: c`
            import { useId } from 'react'

            function Field({ label, hint, ...props }) {
              const id = useId()
              return (
                <>
                  <label htmlFor={id}>{label}</label>
                  <input id={id} aria-describedby={id + '-hint'} {...props} />
                  <small id={id + '-hint'}>{hint}</small>
                </>
              )
            }
            `,
          note: 'Each Field gets its own id, and server and client produce the same one. Do not use it for list keys.',
        },
        {
          title: 'useFormStatus (react-dom): pending state of the parent form',
          lang: 'jsx',
          code: c`
            import { useFormStatus } from 'react-dom'

            function SubmitButton({ children }) {
              const { pending, data } = useFormStatus()     // reads the <form> this button is inside
              return (
                <button type="submit" disabled={pending}>
                  {pending ? 'Saving ' + (data?.get('name') ?? '') + '…' : children}
                </button>
              )
            }

            <form action={saveProduct}>
              <input name="name" />
              <SubmitButton>Save</SubmitButton>
            </form>
            `,
          note: 'Must be used in a component rendered inside the <form>, not in the component that renders the form.',
        },
        {
          title: 'useSyncExternalStore: subscribe to outside data',
          lang: 'jsx',
          code: c`
            import { useSyncExternalStore } from 'react'

            function subscribe(callback) {
              window.addEventListener('online', callback)
              window.addEventListener('offline', callback)
              return () => {
                window.removeEventListener('online', callback)
                window.removeEventListener('offline', callback)
              }
            }

            export function useOnlineStatus() {
              return useSyncExternalStore(
                subscribe,
                () => navigator.onLine,      // client snapshot
                () => true,                  // server snapshot (SSR)
              )
            }

            const online = useOnlineStatus()
            `,
          note: 'The right way to read browser APIs or a hand-written store without tearing. Zustand and Redux use it internally. getSnapshot must return the same value when nothing changed.',
        },
        {
          title: 'useDebugValue: label custom hooks in DevTools',
          lang: 'jsx',
          code: c`
            import { useDebugValue } from 'react'

            function useOnlineStatus() {
              const online = useSyncExternalStore(subscribe, () => navigator.onLine)
              useDebugValue(online ? 'Online' : 'Offline')
              return online
            }

            // expensive formatting only when DevTools is open:
            useDebugValue(date, d => d.toLocaleString())
            `,
        },
      ],
    },
    {
      id: 'custom',
      title: 'Custom hooks',
      group: 'Hooks',
      items: [
        {
          title: 'useLocalStorage',
          code: c`
            function useLocalStorage(key, initial) {
              const [value, setValue] = useState(() => {
                try { return JSON.parse(localStorage.getItem(key)) ?? initial }
                catch { return initial }
              })
              useEffect(() => {
                localStorage.setItem(key, JSON.stringify(value))
              }, [key, value])
              return [value, setValue]
            }
            `,
        },
        {
          title: 'useDebounce',
          code: c`
            function useDebounce(value, ms = 300) {
              const [debounced, setDebounced] = useState(value)
              useEffect(() => {
                const t = setTimeout(() => setDebounced(value), ms)
                return () => clearTimeout(t)
              }, [value, ms])
              return debounced
            }
            `,
        },
        {
          title: 'Rules of hooks',
          note: 'Call hooks only at the top level of components or other hooks — never inside conditions, loops or nested functions.',
        },
        {
          title: 'useFetch with loading / error / abort',
          lang: 'jsx',
          code: c`
            function useFetch(url) {
              const [state, setState] = useState({ data: null, error: null, loading: true })

              useEffect(() => {
                if (!url) return
                const ctrl = new AbortController()
                setState(s => ({ ...s, loading: true, error: null }))

                fetch(url, { signal: ctrl.signal })
                  .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
                  .then(data => setState({ data, error: null, loading: false }))
                  .catch(error => { if (error.name !== 'AbortError') setState({ data: null, error, loading: false }) })

                return () => ctrl.abort()          // cancel if url changes or component unmounts
              }, [url])

              return state
            }

            const { data, error, loading } = useFetch('/api/products?page=' + page)
            `,
          note: 'Fine for simple cases. For caching, retries and refetching, use TanStack Query (see Data fetching).',
        },
        {
          title: 'useToggle and usePrevious',
          lang: 'jsx',
          code: c`
            function useToggle(initial = false) {
              const [on, setOn] = useState(initial)
              const toggle = useCallback(() => setOn(v => !v), [])
              return [on, toggle, setOn]
            }

            function usePrevious(value) {
              const ref = useRef()
              useEffect(() => { ref.current = value }, [value])
              return ref.current            // value from the previous render
            }

            const [open, toggleOpen] = useToggle()
            const prevCount = usePrevious(count)
            `,
        },
        {
          title: 'useMediaQuery',
          lang: 'jsx',
          code: c`
            function useMediaQuery(query) {
              return useSyncExternalStore(
                cb => {
                  const mql = window.matchMedia(query)
                  mql.addEventListener('change', cb)
                  return () => mql.removeEventListener('change', cb)
                },
                () => window.matchMedia(query).matches,
                () => false,
              )
            }

            const isMobile = useMediaQuery('(max-width: 640px)')
            const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
            `,
        },
        {
          title: 'useOnClickOutside (close menus / modals)',
          lang: 'jsx',
          code: c`
            function useOnClickOutside(ref, handler) {
              useEffect(() => {
                const listener = e => {
                  if (!ref.current || ref.current.contains(e.target)) return
                  handler(e)
                }
                document.addEventListener('pointerdown', listener)
                return () => document.removeEventListener('pointerdown', listener)
              }, [ref, handler])
            }

            function Dropdown() {
              const ref = useRef(null)
              const [open, setOpen] = useState(false)
              useOnClickOutside(ref, () => setOpen(false))
              return <div ref={ref}>{/* ... */}</div>
            }
            `,
        },
        {
          title: 'useInterval (declarative timers)',
          lang: 'jsx',
          code: c`
            function useInterval(callback, delay) {
              const onTick = useEffectEvent(callback)      // always calls the latest callback

              useEffect(() => {
                if (delay === null) return                 // pass null to pause
                const id = setInterval(() => onTick(), delay)
                return () => clearInterval(id)
              }, [delay])
            }

            useInterval(() => setSeconds(s => s + 1), running ? 1000 : null)
            `,
        },
        {
          title: 'useWindowSize',
          lang: 'jsx',
          code: c`
            function useWindowSize() {
              const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })

              useEffect(() => {
                const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
                window.addEventListener('resize', onResize)
                return () => window.removeEventListener('resize', onResize)
              }, [])

              return size
            }
            `,
        },
      ],
    },
    {
      id: 'zustand-project-setup',
      title: 'Setup',
      group: 'State management (Zustand)',
      items: [
        {
          title: '1. Install Zustand',
          lang: 'bash',
          code: c`
            npm i zustand
            `,
        },
        {
          title: '2. Create a store file',
          lang: 'ts',
          code: c`
            // src/stores/useCounterStore.ts
            import { create } from 'zustand'

            type CounterState = {
              count: number
              inc: () => void
              reset: () => void
            }

            export const useCounterStore = create<CounterState>()(set => ({
              count: 0,
              inc: () => set(s => ({ count: s.count + 1 })),
              reset: () => set({ count: 0 }),
            }))
            `,
        },
        {
          title: '3. Use it in any component (no provider needed)',
          lang: 'tsx',
          code: c`
            import { useCounterStore } from './stores/useCounterStore'

            export function Counter() {
              const count = useCounterStore(s => s.count)
              const inc = useCounterStore(s => s.inc)
              return <button onClick={inc}>Clicked {count} times</button>
            }
            `,
        },
        {
          title: '4. Debug with Redux DevTools',
          lang: 'ts',
          code: c`
            import { create } from 'zustand'
            import { devtools } from 'zustand/middleware'

            export const useCounterStore = create<CounterState>()(
              devtools(set => ({ /* ... */ }), { name: 'counter' }),
            )
            `,
          note: 'Install the "Redux DevTools" browser extension to inspect state and time-travel.',
        },
      ],
    },
    {
      id: 'zustand-basics',
      title: 'Creating a store',
      group: 'State management (Zustand)',
      items: [
        {
          title: 'Basic store',
          lang: 'js',
          code: c`
            import { create } from 'zustand'

            export const useCounter = create(set => ({
              count: 0,
              increment: () => set(state => ({ count: state.count + 1 })),
              reset: () => set({ count: 0 }),
            }))
            `,
          note: 'set() shallow-merges into the state, so you only return what changed.',
        },
        {
          title: 'Typed store',
          lang: 'ts',
          code: c`
            type CartItem = { id: number; name: string; qty: number }

            type CartState = {
              items: CartItem[]
              add: (item: CartItem) => void
              remove: (id: number) => void
            }

            export const useCart = create<CartState>()(set => ({
              items: [],
              add: item => set(s => ({ items: [...s.items, item] })),
              remove: id => set(s => ({ items: s.items.filter(i => i.id !== id) })),
            }))
            `,
          note: 'Note the extra () after create<CartState> — needed for type inference.',
        },
      ],
    },
    {
      id: 'zustand-reading',
      title: 'Reading state',
      group: 'State management (Zustand)',
      items: [
        {
          title: 'Select one value',
          lang: 'jsx',
          code: c`
            const count = useCounter(state => state.count)
            const increment = useCounter(state => state.increment)
            `,
          note: 'The component re-renders only when the selected value changes.',
        },
        {
          title: 'Select several with useShallow',
          lang: 'jsx',
          code: c`
            import { useShallow } from 'zustand/react/shallow'

            const { items, remove } = useCart(
              useShallow(s => ({ items: s.items, remove: s.remove }))
            )
            `,
        },
        {
          title: 'Derived values',
          lang: 'jsx',
          code: 'const total = useCart(s => s.items.reduce((n, i) => n + i.qty, 0))',
        },
        {
          title: 'Outside React',
          lang: 'js',
          code: c`
            useCart.getState().items
            useCart.setState({ items: [] })
            const unsub = useCart.subscribe(state => console.log(state.items))
            `,
        },
      ],
    },
    {
      id: 'zustand-actions',
      title: 'Actions',
      group: 'State management (Zustand)',
      items: [
        {
          title: 'Read current state with get',
          lang: 'ts',
          code: c`
            export const useAuth = create<AuthState>()((set, get) => ({
              user: null,
              isAdmin: () => get().user?.role === 'admin',
            }))
            `,
        },
        {
          title: 'Async action',
          lang: 'ts',
          code: c`
            export const useInvoices = create<InvoiceState>()(set => ({
              invoices: [],
              loading: false,
              error: null,
              fetch: async () => {
                set({ loading: true, error: null })
                try {
                  const res = await fetch('/api/invoices')
                  set({ invoices: await res.json(), loading: false })
                } catch (e) {
                  set({ error: String(e), loading: false })
                }
              },
            }))
            `,
        },
        {
          title: 'Update nested state',
          lang: 'ts',
          code: c`
            updateQty: (id, qty) =>
              set(s => ({
                items: s.items.map(i => (i.id === id ? { ...i, qty } : i)),
              }))
            `,
        },
      ],
    },
    {
      id: 'zustand-middleware',
      title: 'Middleware',
      group: 'State management (Zustand)',
      items: [
        {
          title: 'Persist to localStorage',
          lang: 'ts',
          code: c`
            import { persist } from 'zustand/middleware'

            export const useSettings = create<Settings>()(
              persist(
                set => ({
                  theme: 'light',
                  setTheme: theme => set({ theme }),
                }),
                {
                  name: 'settings',
                  partialize: s => ({ theme: s.theme }), // only save these keys
                }
              )
            )
            `,
        },
        {
          title: 'Redux DevTools',
          lang: 'ts',
          code: c`
            import { devtools } from 'zustand/middleware'

            export const useCart = create<CartState>()(
              devtools(set => ({ /* ... */ }), { name: 'cart' })
            )
            `,
        },
        {
          title: 'Immer for mutable-style updates',
          lang: 'ts',
          code: c`
            import { immer } from 'zustand/middleware/immer'

            export const useCart = create<CartState>()(
              immer(set => ({
                items: [],
                add: item => set(s => { s.items.push(item) }),
              }))
            )
            `,
          note: 'Requires the immer package.',
        },
        {
          title: 'Combining middleware',
          lang: 'ts',
          code: 'create<State>()(devtools(persist(immer(creator), { name: \'store\' })))',
        },
      ],
    },
    {
      id: 'zustand-patterns',
      title: 'Patterns',
      group: 'State management (Zustand)',
      items: [
        {
          title: 'Slices for big stores',
          lang: 'ts',
          code: c`
            const createUserSlice = set => ({
              user: null,
              setUser: user => set({ user }),
            })
            const createCartSlice = set => ({
              items: [],
              clear: () => set({ items: [] }),
            })

            export const useStore = create((...a) => ({
              ...createUserSlice(...a),
              ...createCartSlice(...a),
            }))
            `,
        },
        {
          title: 'Reset a store',
          lang: 'ts',
          code: c`
            const initial = { items: [] }

            export const useCart = create(set => ({
              ...initial,
              reset: () => set(initial),
            }))
            `,
        },
        {
          title: 'When to use what',
          lang: 'ts',
          note: 'Server data (lists from an API) fits TanStack Query better; keep Zustand for client state like UI toggles, cart, filters and auth session.',
        },
        {
          title: 'Reset between tests',
          lang: 'ts',
          code: c`
            beforeEach(() => {
              useCart.setState({ items: [] })
            })
            `,
        },
      ],
    },
    {
      id: 'router',
      title: 'React Router',
      group: 'Routing & data',
      items: [
        {
          title: 'Routes',
          code: c`
            import { BrowserRouter, Routes, Route } from 'react-router-dom'

            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/invoices/:id" element={<Invoice />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            `,
        },
        {
          title: 'Links & navigation',
          code: c`
            <Link to="/invoices">Invoices</Link>
            <NavLink to="/settings">Settings</NavLink> // gets .active

            const navigate = useNavigate()
            navigate('/login', { replace: true })
            `,
        },
        {
          title: 'Read the URL',
          code: c`
            const { id } = useParams()
            const [params, setParams] = useSearchParams()
            const page = params.get('page') ?? '1'
            `,
        },
        {
          title: 'Nested layouts',
          code: c`
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Overview />} />
              <Route path="/reports" element={<Reports />} />
            </Route>

            // inside DashboardLayout
            <Outlet />
            `,
        },
        {
          title: 'Every React Router hook',
          lang: 'jsx',
          code: c`
            import {
              useNavigate, useLocation, useParams, useSearchParams, useMatch,
              useOutletContext, useLoaderData, useActionData, useNavigation,
              useFetcher, useRouteError, useBlocker,
            } from 'react-router-dom'

            const navigate = useNavigate()            // navigate('/login', { replace: true }); navigate(-1)
            const location = useLocation()            // { pathname, search, hash, state }
            const { id } = useParams()                // /products/:id
            const [params, setParams] = useSearchParams()   // ?page=2 → params.get('page')
            const match = useMatch('/products/:id')   // null if the URL does not match
            const ctx = useOutletContext()            // value passed via <Outlet context={...} />

            // data routers (createBrowserRouter) only:
            const data = useLoaderData()              // result of the route's loader
            const result = useActionData()            // result of the route's action after a <Form> submit
            const navigation = useNavigation()        // navigation.state: 'idle' | 'loading' | 'submitting'
            const fetcher = useFetcher()              // load / submit without navigating
            const error = useRouteError()             // inside a route's errorElement
            const blocker = useBlocker(isDirty)       // warn before leaving a dirty form
            `,
        },
      ],
    },
    {
      id: 'data',
      title: 'Data fetching',
      group: 'Routing & data',
      items: [
        {
          title: 'Loading / error / data',
          code: c`
            function Invoices() {
              const [state, setState] = useState({ loading: true, error: null, data: [] })

              useEffect(() => {
                fetch('/api/invoices')
                  .then(r => r.json())
                  .then(data => setState({ loading: false, error: null, data }))
                  .catch(error => setState({ loading: false, error, data: [] }))
              }, [])

              if (state.loading) return <Spinner />
              if (state.error) return <p>Something went wrong.</p>
              return <Table rows={state.data} />
            }
            `,
        },
        {
          title: 'TanStack Query',
          code: c`
            const { data, isPending, error } = useQuery({
              queryKey: ['invoices', page],
              queryFn: () => api.get(${BT}/invoices?page=${'${'}page}${BT}),
            })

            const mutation = useMutation({
              mutationFn: createInvoice,
              onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
            })
            `,
          note: 'Handles caching, refetching and retries so you write far less effect code.',
        },
        {
          title: 'Env variables (Vite)',
          code: 'const API = import.meta.env.VITE_API_URL',
          note: 'Only variables prefixed with VITE_ are exposed to the browser.',
        },
      ],
    },
  ],
}
