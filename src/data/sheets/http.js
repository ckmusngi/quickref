import { c } from './shared/code.js'

export default {
  slug: 'http-apis',
  title: 'HTTP',
  tech: 'HTTP',
  category: 'backend',
  minutes: 10,
  lang: 'text',
  description: 'Methods, status codes, headers, curl, webhooks and the patterns that make integrations reliable.',
  sections: [
    {
      id: 'project-setup',
      title: 'Tools setup',
      group: 'Setup',
      items: [
        {
          title: 'curl on every OS',
          lang: 'bash',
          code: c`
            # macOS / Linux: already installed
            curl --version

            # Windows 10+: curl.exe ships with Windows
            curl.exe --version
            `,
          note: 'In Windows PowerShell 5, "curl" is an alias for Invoke-WebRequest, so type curl.exe to get real curl. PowerShell 7 and cmd use real curl.',
        },
        {
          title: 'Quoting JSON in curl per shell',
          lang: 'bash',
          code: c`
            # macOS / Linux / Git Bash
            curl -X POST https://api.example.com/items -H "Content-Type: application/json" -d '{"name":"Tee","price":299}'

            # Windows cmd
            curl -X POST https://api.example.com/items -H "Content-Type: application/json" -d "{\"name\":\"Tee\",\"price\":299}"

            # Windows PowerShell
            Invoke-RestMethod -Method Post -Uri https://api.example.com/items -ContentType "application/json" -Body '{"name":"Tee","price":299}'
            `,
        },
        {
          title: 'HTTPie (friendlier curl)',
          lang: 'bash',
          code: c`
            brew install httpie                     # macOS
            sudo apt install -y httpie              # Linux
            winget install -e --id HTTPie.HTTPie    # Windows

            http POST localhost:3000/items name=Tee price:=299
            `,
        },
        {
          title: 'VS Code REST Client (.http files)',
          lang: 'text',
          code: c`
            ### List items
            GET http://localhost:3000/items
            Accept: application/json

            ### Create an item
            POST http://localhost:3000/items
            Content-Type: application/json

            { "name": "Tee", "price": 299 }
            `,
          note: 'Install the "REST Client" extension, save as requests.http and click "Send Request". Works the same on every OS and can be committed with the project.',
        },
        {
          title: 'GUI clients',
          note: 'Postman, Insomnia, Bruno (offline, stores collections as files in your repo) and Hoppscotch (browser-based) all run on Windows, macOS and Linux.',
        },
      ],
    },
    {
      id: 'methods',
      title: 'Methods',
      group: 'HTTP basics',
      items: [
        {
          title: 'The common verbs',
          code: c`
            GET     read           safe, idempotent
            POST    create / action
            PUT     replace        idempotent
            PATCH   partial update
            DELETE  remove         idempotent
            `,
        },
        {
          title: 'Resource URLs',
          code: c`
            GET    /invoices
            POST   /invoices
            GET    /invoices/42
            PATCH  /invoices/42
            DELETE /invoices/42
            GET    /customers/7/invoices
            `,
          note: 'Plural nouns for collections; nest only one level deep.',
        },
      ],
    },
    {
      id: 'status',
      title: 'Status codes',
      group: 'HTTP basics',
      items: [
        {
          title: 'Success',
          code: c`
            200 OK
            201 Created          (include a Location header)
            202 Accepted         (queued for later)
            204 No Content
            `,
        },
        {
          title: 'Client errors',
          code: c`
            400 Bad Request
            401 Unauthorized     (not authenticated)
            403 Forbidden        (authenticated, not allowed)
            404 Not Found
            409 Conflict
            422 Unprocessable    (validation failed)
            429 Too Many Requests
            `,
        },
        {
          title: 'Server errors',
          code: c`
            500 Internal Server Error
            502 Bad Gateway
            503 Service Unavailable
            504 Gateway Timeout
            `,
          note: '5xx and 429 are usually worth retrying; most 4xx are not.',
        },
      ],
    },
    {
      id: 'headers',
      title: 'Headers',
      group: 'HTTP basics',
      items: [
        {
          title: 'Auth',
          code: c`
            Authorization: Bearer <access-token>
            Authorization: Basic base64(user:pass)
            X-Api-Key: <key>
            `,
        },
        {
          title: 'Content negotiation',
          code: c`
            Content-Type: application/json
            Accept: application/json
            `,
        },
        {
          title: 'Caching',
          code: c`
            Cache-Control: no-store
            Cache-Control: public, max-age=3600
            ETag: "abc123"  →  If-None-Match: "abc123"  →  304 Not Modified
            `,
        },
        {
          title: 'CORS (response)',
          code: c`
            Access-Control-Allow-Origin: https://app.example.com
            Access-Control-Allow-Methods: GET, POST, PATCH
            Access-Control-Allow-Headers: Authorization, Content-Type
            `,
        },
      ],
    },
    {
      id: 'curl',
      title: 'curl',
      group: 'Calling APIs',
      items: [
        {
          title: 'GET with headers',
          lang: 'bash',
          code: c`
            curl -s https://api.example.com/invoices \
              -H "Authorization: Bearer $TOKEN" \
              -H "Accept: application/json"
            `,
        },
        {
          title: 'POST JSON',
          lang: 'bash',
          code: c`
            curl -X POST https://api.example.com/invoices \
              -H 'Content-Type: application/json' \
              -d '{"amount": 100, "currency": "MXN"}'
            `,
        },
        {
          title: 'Debug a request',
          lang: 'bash',
          code: c`
            curl -v https://api.example.com/health
            curl -i https://api.example.com/health   # headers + body
            curl -w "%{http_code} %{time_total}s\n" -o /dev/null -s https://api.example.com
            `,
        },
      ],
    },
    {
      id: 'patterns',
      title: 'Integration patterns',
      group: 'Calling APIs',
      items: [
        {
          title: 'Idempotency keys',
          code: c`
            POST /payments
            Idempotency-Key: 6f1c2b7e-...
            `,
          note: 'Lets you safely retry a create request without charging twice.',
        },
        {
          title: 'Verify a webhook signature',
          lang: 'php',
          code: c`
            $expected = hash_hmac('sha256', $request->getContent(), $secret);

            if (! hash_equals($expected, $request->header('X-Signature'))) {
                abort(401);
            }
            `,
          note: 'Use the raw body and a constant-time comparison.',
        },
        {
          title: 'Webhook handling',
          note: 'Respond 2xx quickly, queue the real work, and dedupe on the event id because providers resend events.',
        },
        {
          title: 'Pagination styles',
          code: c`
            Offset:  GET /invoices?page=3&per_page=50
            Cursor:  GET /invoices?cursor=eyJpZCI6MTIzfQ&limit=50
            `,
          note: 'Cursor pagination stays consistent while new rows are being added.',
        },
        {
          title: 'Error body',
          lang: 'json',
          code: c`
            {
              "error": {
                "code": "validation_failed",
                "message": "The amount field is required.",
                "fields": { "amount": ["required"] }
              }
            }
            `,
        },
      ],
    },
  ],
}
