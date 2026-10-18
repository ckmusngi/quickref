import { c } from './shared/code.js'

export default {
  slug: 'ajax',
  title: 'AJAX',
  tech: 'AJAX',
  category: 'frontend',
  minutes: 30,
  lang: 'js',
  description: 'Talking to a server without reloading the page, with fetch, axios and jQuery side by side: GET / POST / JSON / PUT / DELETE, errors and timeouts, loading states, cancelling, CSRF for Laravel / Django / Express, auth tokens, CORS, file uploads with progress, and common patterns.',
  sections: [
    {
      id: 'project-setup',
      title: 'Getting started',
      group: 'Setup',
      items: [
        {
          title: 'What AJAX is',
          lang: 'text',
          code: c`
            Without AJAX:  click → browser loads a whole new page
            With AJAX:     click → JavaScript sends a request in the background → updates part of the page

            Browser JS ──HTTP request──▶ your API (Laravel / Express / Django / FastAPI)
                       ◀──JSON / HTML───
            `,
          note: 'The name means "Asynchronous JavaScript And XML", but today the data is almost always JSON. Every example on this sheet is shown with fetch (built into browsers), axios and jQuery.',
        },
        {
          title: 'Pick a tool',
          lang: 'text',
          code: c`
            fetch    built into every browser and Node 18+; nothing to install; a bit more code
            axios    small library; JSON by default, interceptors, upload progress, rejects on 4xx/5xx
            jQuery   $.ajax / $.get / $.post; natural choice if the page already uses jQuery
            `,
        },
        {
          title: 'Install axios or jQuery',
          lang: 'bash',
          code: c`
            # fetch: nothing to install

            # npm (Vite, React, Node) — same on every OS
            npm install axios
            npm install jquery
            `,
          then: [
            {
              label: 'Or from a CDN (plain HTML pages)',
              lang: 'html',
              code: c`
                <script src="https://cdn.jsdelivr.net/npm/axios@1.7.9/dist/axios.min.js"></script>
                <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
                `,
            },
          ],
        },
        {
          title: 'A shared API client (axios)',
          code: c`
            // src/api.js
            import axios from 'axios'

            export const api = axios.create({
              baseURL: import.meta.env.VITE_API_URL ?? '/api',
              timeout: 10000,
              headers: { Accept: 'application/json' },
            })
            `,
          note: 'Create the client once and import it everywhere, so the base URL, headers and interceptors live in one place.',
        },
        {
          title: 'Serve your page from a local server',
          lang: 'bash',
          code: c`
            npx serve .        # any OS → http://localhost:3000
            npm run dev        # Vite projects
            `,
          note: 'Requests from file:// pages are blocked by the browser. Always open the page through a server.',
        },
      ],
    },
    {
      id: 'requests',
      title: 'fetch vs axios vs jQuery',
      group: 'Requests',
      items: [
        {
          title: 'GET JSON',
          code: c`
            // fetch
            const res = await fetch('/api/products?page=2&q=shirt')
            if (!res.ok) throw new Error('HTTP ' + res.status)
            const products = await res.json()
            `,
          then: [
            {
              label: 'axios',
              lang: 'js',
              code: c`
                const { data: products } = await api.get('/products', { params: { page: 2, q: 'shirt' } })
                `,
            },
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                $.getJSON('/api/products', { page: 2, q: 'shirt' }).done(products => render(products))
                `,
            },
          ],
        },
        {
          title: 'Query strings safely',
          code: c`
            // fetch: build the query with URLSearchParams (encodes spaces, &, ? …)
            const params = new URLSearchParams({ q: 'red & blue', page: 1 })
            const res = await fetch('/api/search?' + params)
            `,
          then: [
            {
              label: 'axios',
              lang: 'js',
              code: c`
                await api.get('/search', { params: { q: 'red & blue', page: 1 } })
                `,
            },
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                $.get('/api/search', { q: 'red & blue', page: 1 })
                `,
            },
          ],
        },
        {
          title: 'POST JSON',
          code: c`
            // fetch
            const res = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ items: [{ id: 42, qty: 2 }], coupon: 'SALE10' }),
            })
            const order = await res.json()
            `,
          then: [
            {
              label: 'axios (JSON by default)',
              lang: 'js',
              code: c`
                const { data: order } = await api.post('/orders', { items: [{ id: 42, qty: 2 }], coupon: 'SALE10' })
                `,
            },
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                $.ajax({
                  url: '/api/orders',
                  method: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({ items: [{ id: 42, qty: 2 }], coupon: 'SALE10' }),
                }).done(order => console.log(order.id))
                `,
            },
          ],
        },
        {
          title: 'POST a form',
          code: c`
            // fetch: send the form as-is (multipart/form-data, includes files and _token)
            const form = document.querySelector('#signup')
            const res = await fetch(form.action, { method: 'POST', body: new FormData(form) })
            `,
          then: [
            {
              label: 'axios',
              lang: 'js',
              code: c`
                await api.post('/signup', new FormData(document.querySelector('#signup')))
                `,
            },
            {
              label: 'jQuery (url-encoded)',
              lang: 'js',
              code: c`
                $.post($('#signup').attr('action'), $('#signup').serialize())
                `,
            },
          ],
          note: 'Do not set Content-Type yourself when sending FormData: the browser adds it with the correct boundary.',
        },
        {
          title: 'PUT, PATCH and DELETE',
          code: c`
            // fetch
            await fetch('/api/products/42', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ price: 349 }),
            })
            await fetch('/api/products/42', { method: 'DELETE' })
            `,
          then: [
            {
              label: 'axios',
              lang: 'js',
              code: c`
                await api.put('/products/42', { name: 'Tee', price: 349 })
                await api.patch('/products/42', { price: 349 })
                await api.delete('/products/42')
                `,
            },
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                $.ajax({ url: '/api/products/42', method: 'PATCH', contentType: 'application/json', data: JSON.stringify({ price: 349 }) })
                $.ajax({ url: '/api/products/42', method: 'DELETE' })
                `,
            },
          ],
        },
        {
          title: 'Custom headers',
          code: c`
            // fetch
            await fetch('/api/me', { headers: { Authorization: 'Bearer ' + token, 'X-Client': 'web' } })
            `,
          then: [
            {
              label: 'axios',
              lang: 'js',
              code: c`
                await api.get('/me', { headers: { 'X-Client': 'web' } })
                `,
            },
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                $.ajax({ url: '/api/me', headers: { 'X-Client': 'web' } })
                `,
            },
          ],
        },
        {
          title: 'Load HTML into the page',
          code: c`
            // fetch
            const html = await (await fetch('/partials/cart')).text()
            document.querySelector('#cart').innerHTML = html          // only for HTML from your own server
            `,
          then: [
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                $('#cart').load('/partials/cart')
                $('#results').load('/products?page=2 #product-list')     // only part of the response
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'responses',
      title: 'Errors & timeouts',
      group: 'Responses & errors',
      items: [
        {
          title: 'fetch does NOT reject on 404 / 500',
          code: c`
            const res = await fetch('/api/products/999')
            console.log(res.ok, res.status)        // false 404: no exception was thrown!

            // a small wrapper that behaves like axios
            export async function http(url, options = {}) {
              const res = await fetch(url, { headers: { Accept: 'application/json' }, ...options })
              const body = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text()
              if (!res.ok) {
                const err = new Error('HTTP ' + res.status)
                err.status = res.status
                err.body = body
                throw err
              }
              return body
            }
            `,
          note: 'fetch only rejects on network failures. axios and jQuery treat 4xx / 5xx as errors.',
        },
        {
          title: 'Handle errors by status code',
          code: c`
            try {
              await api.post('/cart', { product_id: 42 })
            } catch (err) {
              const status = err.response?.status            // axios; with the fetch wrapper use err.status
              if (!status) return alert('Network error, check your connection')
              if (status === 401) return (window.location = '/login')
              if (status === 403) return alert('You are not allowed to do that')
              if (status === 404) return alert('Not found')
              if (status === 419) return alert('Session expired, please refresh')      // Laravel CSRF
              if (status === 422) return showErrors(err.response.data.errors)           // validation
              alert('Server error (' + status + ')')
            }
            `,
          then: [
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                $.post('/api/cart', { product_id: 42 }).fail(function (xhr) {
                  if (xhr.status === 422) showErrors(xhr.responseJSON.errors)
                  else alert('Error ' + xhr.status)
                })
                `,
            },
          ],
        },
        {
          title: 'Show validation errors next to fields',
          code: c`
            // server (422): { "errors": { "email": ["The email is taken."], "name": ["Required"] } }
            function showErrors(errors) {
              document.querySelectorAll('[data-error-for]').forEach(el => (el.textContent = ''))
              for (const [field, messages] of Object.entries(errors)) {
                const el = document.querySelector('[data-error-for="' + field + '"]')
                if (el) el.textContent = messages[0]
              }
            }
            // HTML: <input name="email"> <small data-error-for="email"></small>
            `,
        },
        {
          title: 'Timeouts',
          code: c`
            // fetch: abort after 10 s
            const res = await fetch('/api/report', { signal: AbortSignal.timeout(10000) })
            `,
          then: [
            {
              label: 'axios',
              lang: 'js',
              code: c`
                await api.get('/report', { timeout: 10000 })        // or set it once in axios.create
                `,
            },
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                $.ajax({ url: '/api/report', timeout: 10000 })
                `,
            },
          ],
        },
        {
          title: 'Global handling with axios interceptors',
          code: c`
            api.interceptors.response.use(
              response => response,
              error => {
                if (error.response?.status === 401) window.location = '/login'
                return Promise.reject(error)                     // let the caller handle the rest
              },
            )
            `,
          then: [
            {
              label: 'jQuery equivalent',
              lang: 'js',
              code: c`
                $(document).ajaxError(function (e, xhr) {
                  if (xhr.status === 401) window.location = '/login'
                })
                `,
            },
          ],
        },
        {
          title: 'Retry with backoff',
          code: c`
            async function withRetry(fn, attempts = 3) {
              for (let i = 1; ; i++) {
                try {
                  return await fn()
                } catch (err) {
                  const status = err.response?.status ?? err.status
                  const retryable = !status || status >= 500 || status === 429
                  if (!retryable || i === attempts) throw err
                  await new Promise(r => setTimeout(r, 500 * 2 ** i))     // 1 s, 2 s, 4 s …
                }
              }
            }

            const data = await withRetry(() => api.get('/rates'))
            `,
          note: 'Only retry safe situations: network errors, 5xx and 429. Never blindly retry a POST that may have succeeded.',
        },
      ],
    },
    {
      id: 'loading',
      title: 'Loading states, parallel & cancelling',
      group: 'Responses & errors',
      items: [
        {
          title: 'Loading state and double-submit protection',
          code: c`
            const form = document.querySelector('#order-form')
            form.addEventListener('submit', async e => {
              e.preventDefault()
              const btn = form.querySelector('[type=submit]')
              if (btn.disabled) return
              btn.disabled = true
              btn.textContent = 'Saving…'
              try {
                const res = await http(form.action, { method: 'POST', body: new FormData(form) })
                showFlash(res.message)
              } catch (err) {
                if (err.status === 422) showErrors(err.body.errors)
              } finally {
                btn.disabled = false
                btn.textContent = 'Save'
              }
            })
            `,
        },
        {
          title: 'Run requests in parallel',
          code: c`
            const [user, cart] = await Promise.all([
              http('/api/user'),
              http('/api/cart'),
            ])

            // keep going even if one fails
            const results = await Promise.allSettled([http('/api/a'), http('/api/b')])
            `,
          then: [
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                $.when($.getJSON('/api/user'), $.getJSON('/api/cart')).done(function (u, c) {
                  render(u[0], c[0])           // each result is [data, status, xhr]
                })
                `,
            },
          ],
        },
        {
          title: 'Cancel a request',
          code: c`
            // fetch and axios both accept an AbortController signal
            const controller = new AbortController()
            fetch('/api/search?q=tee', { signal: controller.signal })
            api.get('/search', { params: { q: 'tee' }, signal: controller.signal })
            controller.abort()             // throws AbortError (fetch) / CanceledError (axios)
            `,
          then: [
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                const req = $.getJSON('/api/search', { q: 'tee' })
                req.abort()
                `,
            },
          ],
        },
        {
          title: 'Live search: debounce + cancel the old request',
          code: c`
            let timer
            let controller

            document.querySelector('#search').addEventListener('input', e => {
              clearTimeout(timer)
              timer = setTimeout(async () => {
                controller?.abort()                          // drop the previous, slower request
                controller = new AbortController()
                try {
                  const params = new URLSearchParams({ q: e.target.value })
                  const results = await http('/api/search?' + params, { signal: controller.signal })
                  renderResults(results)
                } catch (err) {
                  if (err.name !== 'AbortError') console.error(err)
                }
              }, 300)                                        // wait until typing pauses
            })
            `,
        },
      ],
    },
    {
      id: 'csrf',
      title: 'CSRF tokens (Laravel, Django, Express)',
      group: 'Security',
      items: [
        {
          title: 'When you need a CSRF token',
          note: 'Only when your API authenticates with session cookies (Laravel web routes, Django views, Express with sessions) and the request changes data (POST, PUT, PATCH, DELETE). APIs that use a Bearer token in the Authorization header do not need CSRF tokens.',
        },
        {
          title: 'Laravel',
          lang: 'html',
          code: c`
            <!-- Blade layout <head> -->
            <meta name="csrf-token" content="{{ csrf_token() }}">
            `,
          then: [
            {
              label: 'fetch',
              lang: 'js',
              code: c`
                const token = document.querySelector('meta[name="csrf-token"]').content
                await fetch('/cart', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': token },
                  body: JSON.stringify({ product_id: 42 }),
                })
                `,
            },
            {
              label: 'axios (automatic)',
              lang: 'js',
              code: c`
                // Laravel sets an XSRF-TOKEN cookie and axios sends it as X-XSRF-TOKEN on same-origin requests
                await axios.post('/cart', { product_id: 42 })
                `,
            },
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                $.ajaxSetup({ headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') } })
                `,
            },
          ],
          note: 'Missing token → 419. See the CSRF section of the Laravel sheet for SPAs on another domain (Sanctum).',
        },
        {
          title: 'Django',
          code: c`
            // Django sets a "csrftoken" cookie; send it back as the X-CSRFToken header
            function getCookie(name) {
              return document.cookie.split('; ').find(c => c.startsWith(name + '='))?.split('=')[1]
            }

            await fetch('/api/cart/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
              body: JSON.stringify({ product_id: 42 }),
            })
            `,
          then: [
            {
              label: 'axios',
              lang: 'js',
              code: c`
                axios.defaults.xsrfCookieName = 'csrftoken'
                axios.defaults.xsrfHeaderName = 'X-CSRFToken'
                `,
            },
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                $.ajaxSetup({ headers: { 'X-CSRFToken': getCookie('csrftoken') } })
                `,
            },
          ],
          note: 'Render a template with {% csrf_token %} (or use @ensure_csrf_cookie) at least once so the cookie exists.',
        },
        {
          title: 'Express (session-based)',
          code: c`
            // server renders <meta name="csrf-token" content="..."> or exposes GET /csrf-token
            const token = document.querySelector('meta[name="csrf-token"]').content
            await fetch('/cart', { method: 'POST', headers: { 'X-CSRF-Token': token }, body: new FormData(form) })
            `,
          note: 'Use a maintained package such as csrf-csrf on the server (the old csurf package is deprecated).',
        },
      ],
    },
    {
      id: 'auth',
      title: 'Auth tokens & cookies',
      group: 'Security',
      items: [
        {
          title: 'Send a Bearer token',
          code: c`
            // fetch
            await fetch('/api/me', { headers: { Authorization: 'Bearer ' + token } })
            `,
          then: [
            {
              label: 'axios: set it once',
              lang: 'js',
              code: c`
                api.interceptors.request.use(config => {
                  const token = localStorage.getItem('token')
                  if (token) config.headers.Authorization = 'Bearer ' + token
                  return config
                })
                `,
            },
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                $.ajaxSetup({ headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } })
                `,
            },
          ],
          note: 'localStorage is readable by any script on the page (XSS risk). Where possible, prefer httpOnly session cookies set by the server.',
        },
        {
          title: 'Send cookies to another domain',
          code: c`
            // fetch
            await fetch('https://api.example.com/me', { credentials: 'include' })
            `,
          then: [
            {
              label: 'axios',
              lang: 'js',
              code: c`
                axios.create({ baseURL: 'https://api.example.com', withCredentials: true, withXSRFToken: true })
                `,
            },
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                $.ajax({ url: 'https://api.example.com/me', xhrFields: { withCredentials: true } })
                `,
            },
          ],
          note: 'The server must allow credentials in its CORS settings (next section).',
        },
        {
          title: 'Refresh an expired token automatically (axios)',
          code: c`
            api.interceptors.response.use(null, async error => {
              const original = error.config
              if (error.response?.status === 401 && !original._retried) {
                original._retried = true
                const { data } = await axios.post('/api/auth/refresh', null, { withCredentials: true })
                localStorage.setItem('token', data.token)
                original.headers.Authorization = 'Bearer ' + data.token
                return api(original)                     // replay the failed request
              }
              return Promise.reject(error)
            })
            `,
        },
      ],
    },
    {
      id: 'cors',
      title: 'CORS (calling another domain)',
      group: 'Security',
      items: [
        {
          title: 'What the error means',
          lang: 'text',
          code: c`
            Access to fetch at 'https://api.example.com' from origin 'http://localhost:5173'
            has been blocked by CORS policy ...

            → The browser blocked the response because the API did not say this origin is allowed.
            → Fix it on the SERVER (or proxy the API through your own domain). Nothing in fetch / axios
              / jQuery can turn it off.
            `,
          note: 'In development, a Vite proxy avoids CORS completely (see the React sheet: "Proxy API calls to your backend in dev").',
        },
        {
          title: 'Laravel',
          code: c`
            // config/cors.php   (php artisan config:publish cors)
            return [
                'paths' => ['api/*', 'sanctum/csrf-cookie'],
                'allowed_methods' => ['*'],
                'allowed_origins' => ['http://localhost:5173', 'https://app.example.com'],
                'allowed_headers' => ['*'],
                'supports_credentials' => true,      // needed for cookies / Sanctum
            ];
            `,
          lang: 'php',
        },
        {
          title: 'Express',
          code: c`
            // npm i cors
            import cors from 'cors'

            app.use(cors({
              origin: ['http://localhost:5173', 'https://app.example.com'],
              credentials: true,
            }))
            `,
        },
        {
          title: 'Django and FastAPI',
          lang: 'python',
          code: c`
            # Django: pip install django-cors-headers
            INSTALLED_APPS += ["corsheaders"]
            MIDDLEWARE.insert(0, "corsheaders.middleware.CorsMiddleware")
            CORS_ALLOWED_ORIGINS = ["http://localhost:5173", "https://app.example.com"]
            CORS_ALLOW_CREDENTIALS = True

            # FastAPI
            from fastapi.middleware.cors import CORSMiddleware
            app.add_middleware(
                CORSMiddleware,
                allow_origins=["http://localhost:5173", "https://app.example.com"],
                allow_credentials=True,
                allow_methods=["*"],
                allow_headers=["*"],
            )
            `,
          note: 'With credentials, the allowed origin must be an exact URL. "*" is rejected by browsers.',
        },
      ],
    },
    {
      id: 'uploads',
      title: 'File uploads',
      group: 'Uploads',
      items: [
        {
          title: 'Upload a file',
          code: c`
            // fetch
            const form = document.querySelector('#upload-form')
            const data = new FormData(form)                 // <input type="file" name="avatar"> + other fields
            data.append('album_id', 7)
            const res = await fetch('/api/photos', { method: 'POST', body: data })
            `,
          then: [
            {
              label: 'axios',
              lang: 'js',
              code: c`
                await api.post('/photos', data)                 // axios sets multipart headers for FormData
                `,
            },
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                $.ajax({ url: '/api/photos', method: 'POST', data, processData: false, contentType: false })
                `,
            },
          ],
          note: 'Laravel update routes: keep POST and add data.append("_method", "PUT"), because PHP cannot read files from a real PUT request.',
        },
        {
          title: 'Upload progress',
          code: c`
            // axios (fetch has no upload progress)
            await api.post('/photos', data, {
              onUploadProgress: e => {
                const pct = Math.round((e.loaded / e.total) * 100)
                document.querySelector('#progress').value = pct
              },
            })
            `,
          then: [
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                $.ajax({
                  url: '/api/photos', method: 'POST', data, processData: false, contentType: false,
                  xhr: function () {
                    const xhr = new XMLHttpRequest()
                    xhr.upload.addEventListener('progress', e => $('#progress').val(Math.round((e.loaded / e.total) * 100)))
                    return xhr
                  },
                })
                `,
            },
          ],
        },
        {
          title: 'Preview and validate before uploading',
          code: c`
            document.querySelector('#avatar').addEventListener('change', e => {
              const file = e.target.files[0]
              if (!file) return
              if (!file.type.startsWith('image/')) return alert('Please choose an image')
              if (file.size > 2 * 1024 * 1024) return alert('Max 2 MB')
              document.querySelector('#preview').src = URL.createObjectURL(file)
            })
            `,
          note: 'Always validate again on the server: client checks are easy to bypass.',
        },
        {
          title: 'Upload straight to S3 / Cloud Storage',
          code: c`
            // 1. ask your backend for a short-lived signed upload URL
            const { url, key } = await http('/api/uploads', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filename: file.name, type: file.type }),
            })
            // 2. PUT the file directly to the bucket
            await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
            `,
          note: 'The file never passes through your server. The AWS and GCP sheets show the backend side and the bucket CORS rule.',
        },
      ],
    },
    {
      id: 'patterns',
      title: 'Common patterns',
      group: 'Patterns',
      items: [
        {
          title: 'Render a list safely',
          code: c`
            const list = document.querySelector('#products')
            list.replaceChildren()
            for (const p of products) {
              const li = document.createElement('li')
              li.textContent = p.name + ' — ₱' + Number(p.price).toFixed(2)    // textContent escapes HTML
              li.dataset.id = p.id
              list.append(li)
            }
            `,
          then: [
            {
              label: 'jQuery',
              lang: 'js',
              code: c`
                const $list = $('#products').empty()
                $.each(products, (i, p) => $list.append($('<li>').attr('data-id', p.id).text(p.name)))
                `,
            },
          ],
          note: 'Never put API data into innerHTML / .html() unescaped: that is how XSS happens.',
        },
        {
          title: '"Load more" pagination',
          code: c`
            let page = 1
            document.querySelector('#load-more').addEventListener('click', async e => {
              const btn = e.currentTarget
              btn.disabled = true
              const res = await http('/api/posts?page=' + ++page)
              res.data.forEach(post => appendPost(post))
              if (!res.next_page_url) btn.remove()       // Laravel paginator field; adjust to your API
              else btn.disabled = false
            })
            `,
        },
        {
          title: 'Optimistic update',
          code: c`
            async function toggleLike(btn, postId) {
              const liked = btn.classList.toggle('liked')            // update the UI immediately
              try {
                await api.post('/posts/' + postId + '/like', { liked })
              } catch {
                btn.classList.toggle('liked')                        // undo if the server failed
                alert('Could not save, please try again')
              }
            }
            `,
        },
        {
          title: 'Polling',
          code: c`
            async function poll() {
              try {
                const { count } = await http('/api/notifications/unread-count')
                document.querySelector('#badge').textContent = count
              } finally {
                setTimeout(poll, 15000)          // next check 15 s after this one finishes
              }
            }
            poll()
            `,
          note: 'For real-time updates at scale, use WebSockets (Laravel Reverb, Socket.IO) or Server-Sent Events instead.',
        },
      ],
    },
    {
      id: 'debugging',
      title: 'Debugging requests',
      group: 'Patterns',
      items: [
        {
          title: 'Browser DevTools → Network tab',
          note: 'Open DevTools (F12, or Cmd+Option+I on macOS) → Network → filter by Fetch/XHR. Click a request to see the URL, method, status, request headers (is the CSRF / Authorization header there?), the payload you sent and the response. Right-click → "Copy as cURL" to replay it in a terminal.',
        },
        {
          title: 'Replay a request with curl',
          lang: 'bash',
          code: c`
            # macOS / Linux / Windows cmd
            curl -i -X POST http://localhost:8000/api/orders -H "Content-Type: application/json" -H "Accept: application/json" -d "{\"product_id\":42}"
            `,
          then: [
            {
              label: 'Windows PowerShell',
              lang: 'powershell',
              code: c`
                Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/orders -ContentType "application/json" -Body '{"product_id":42}'
                `,
            },
          ],
          note: 'If curl works but the browser does not, the problem is CORS, cookies or CSRF, not your API logic.',
        },
        {
          title: 'Quick checklist',
          lang: 'text',
          code: c`
            Status 0 / "Failed to fetch"   → server down, wrong URL, CORS, or mixed content (http API on https page)
            404                            → wrong URL or base path (check /api prefix)
            405                            → wrong method for that route
            419 (Laravel) / 403 (Django)   → missing CSRF token
            422                            → validation failed: read response.errors
            500                            → server error: check the server logs, not the browser
            Response is HTML, not JSON     → missing "Accept: application/json", or a redirect to the login page
            `,
        },
      ],
    },
  ],
}
