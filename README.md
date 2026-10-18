# QuickRef

**Find the command. Copy it, ship it.**

QuickRef is a fast, searchable collection of developer cheat sheets: 20+ sheets and 2,000+ copy-ready snippets, from first install on Windows, macOS or Linux to production deploys on AWS, GCP and Azure.

Every sheet starts with a step-by-step **Setup**, shows commands for each operating system where they differ, and gives every snippet its own **Copy** button. Press **⌘K / Ctrl+K** anywhere to search inside every sheet.

## Features

- **20+ cheat sheets** grouped into Frontend, Backend, DevOps & Tools, Testing, and Cloud & Deployment
- **Setup first:** each sheet opens with install → create the project → run it
- **Commands for each OS:** macOS, Linux and Windows (PowerShell / cmd) variants side by side
- **Copy buttons everywhere,** including follow-up blocks ("Then run", "PowerShell", "php.ini"…)
- **Global search (⌘K / Ctrl+K)** across sheet titles, items, notes and code
- **Per-sheet filter** and a grouped, scrollable table of contents
- **Light and dark themes** (opens in light mode; your choice is remembered)
- **Static site:** no backend, works on any static host

## Sheets

| Category | Sheets |
| --- | --- |
| **Frontend** | JavaScript · jQuery · AJAX (fetch, axios and jQuery side by side) · SEO · TypeScript · React (every hook, Zustand, React Router) · Next.js (App Router, Server Actions, caching, auth, deployment) |
| **Backend** | Laravel (Blade, CSRF, jQuery & AJAX, Sanctum, queues…) · PHP (imports, OOP, PDO, session auth) · WordPress (themes, plugins, blocks, REST API, hosting) · Node (Express, Sequelize, JWT auth) · Python (Django, FastAPI) · Java (modern Java, Spring Boot, JPA, Security) · SQL (with MySQL and PostgreSQL) · HTTP |
| **DevOps & Tools** | Git (rebase, checkout) · Docker · Nginx · Bash (with PowerShell equivalents) · CI/CD (GitHub Actions, GitLab CI) |
| **Testing** | Jest (with React Testing Library, Supertest, Vitest) · PHPUnit (with Laravel testing and Pest) · Playwright · Cypress |
| **Cloud & Deployment** | AWS (EC2, RDS, S3, SQS) · GCP (Compute Engine, Cloud SQL, Storage, Pub/Sub) · Azure (App Service, Functions, Flexible Server, Blob, Service Bus) |

The cloud sheets are complete walkthroughs: create the account and server, deploy Laravel, Node, Python or React behind Nginx with HTTPS, set up CI/CD, then connect a managed database, file storage and queues.

## Getting started

Requires **Node.js 20.19+** (or 22.12+), as Vite 8 needs.

```bash
# same on every OS
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Check code style and common bugs (ESLint) |
| `npm run lint:fix` | Auto-fix indentation, quotes, commas… |

## Deploying

`npm run build` produces a static site in `dist/`. Upload it to any static host: Netlify, Vercel, Cloudflare Pages, S3 + CloudFront, Cloud Storage, Firebase Hosting, Azure Static Web Apps, or Nginx.

The app uses clean URLs (`/sheets/react`) with React Router's `BrowserRouter`, so **the host must serve `index.html` for every path**. Otherwise, refreshing a page like `/sheets/react` returns a 404.

| Host | SPA fallback |
| --- | --- |
| Netlify | `public/_redirects` is included (`/*  /index.html  200`) |
| Vercel | `vercel.json` is included (rewrite everything to `/index.html`) |
| Nginx | `try_files $uri $uri/ /index.html;` (see the Nginx sheet) |
| Firebase Hosting | `"rewrites": [{ "source": "**", "destination": "/index.html" }]` in `firebase.json` |
| S3 + CloudFront | Error pages 403/404 → `/index.html` with response 200 |
| GitHub Pages | No rewrites: copy `dist/index.html` to `dist/404.html` after building |

`npm run dev` and `npm run preview` already handle this locally. Old hash links (`/#/sheets/react`) are converted to clean URLs automatically in `src/main.jsx`.

## Project structure

```
src/
  main.jsx              # app entry: BrowserRouter + theme provider (+ old #/ link redirect)
  App.jsx               # routes
  data/
    index.js            # registers sheets, tech badges, categories, popular/recent lists, slug aliases
    sheets/*.js         # one file per cheat sheet
    sheets/shared/
      code.js           # the c`` snippet tag, step() and BT helpers
      server-setup.js   # Linux server steps shared by the AWS, GCP and Azure guides
  components/           # Header, SearchModal, SearchIcon, SheetCard, CodeBlock, TechBadge, Footer, Logo
  hooks/                # useTheme (light / dark)
  pages/                # Home, Sheets, SheetPage, Categories, NotFound
  styles.css            # all styling; theme colours are CSS variables at the top
eslint.config.js        # ESLint 10 flat config (+ @stylistic formatting rules)
```

## Adding or editing a sheet

### 1. Create the file

`src/data/sheets/my-sheet.js`:

```js
import { c } from './shared/code.js'

export default {
  slug: 'my-sheet',           // URL: /sheets/my-sheet
  title: 'MySheet',           // keep it to one word where possible
  tech: 'MySheet',            // must match a key in `techs` in data/index.js
  category: 'backend',        // frontend | backend | devops | testing | cloud
  minutes: 20,
  lang: 'bash',               // default label for code blocks on this sheet
  description: 'One sentence shown on the card (clamped to 3 lines).',
  sections: [
    {
      id: 'project-setup',    // unique within the sheet
      title: 'Project setup, step by step',
      group: 'Setup',         // consecutive sections with the same group share a heading
      items: [
        {
          title: '1. Install',
          code: c`
            # macOS
            brew install something

            # Linux (Ubuntu / Debian)
            sudo apt install -y something

            # Windows (PowerShell)
            winget install -e --id Vendor.Something
            `,
          note: 'One or two plain-English sentences. Never put copyable commands here.',
          then: [
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                something --version
                `,
            },
          ],
        },
      ],
    },
  ],
}
```

### 2. Register it

In `src/data/index.js`: import the file, add it to the `sheets` array, and add a badge to `techs`.

**Badge rule:** single word → first letter (`L` Laravel, `R` React); compound name → initials (`JS`, `TS`, `jQ`, `My`, `PG`); acronym → as-is (`PHP`, `SQL`, `AWS`). Pick something unique; the badge font scales to fit 1–4 characters.

### Item fields

| Field | Purpose |
| --- | --- |
| `title` | Item heading (required) |
| `code` | Main snippet, written with the `c` tag |
| `lang` | Label on the code block (overrides the sheet's `lang`) |
| `note` | Short explanation shown above the code |
| `then` | Follow-up blocks, each `{ label, lang, code }`, each with its own Copy button: "Then run", an OS variant, a config file… |

### Writing snippets with the `c` tag

`c` (from `shared/code.js`) is a `String.raw` tag: backslashes stay literal, so Windows paths and regexes can be pasted as-is. **Indent the snippet under its `code:` line and put the closing backtick at the same indent.** That indentation is removed when the page renders, so the code still shows flush-left.

Two character sequences can't appear raw inside it:

| You need | Write | Why |
| --- | --- | --- |
| PowerShell line-continuation backtick | `${BT}` (import `BT`) | a raw backtick would end the template |
| GitHub Actions / GitLab `${{ … }}` | `${GH} … }}` with `const GH = '${{'` at the top of the file | `${` would start a JS interpolation |
| Shell variables | `$VAR`, never the braced form | same reason |

### Content conventions

- **Every sheet starts with a `Setup` group** (install for each OS → create the project → run it). Keep a group's sections next to each other.
- **Show commands for each OS** wherever they differ: macOS, Linux (Ubuntu / Debian) and Windows (PowerShell, plus cmd when relevant). Mark identical commands with `# same on every OS`. Steps that run *on a server* are always Linux.
- **Anything a reader would copy goes in `code` or `then`,** never inside a `note`.
- **Use placeholders** like `example.com`, `your-org/your-app` and `203.0.113.10`, and never real secrets.
- **Renaming, merging or removing a sheet?** Add the old slug to `slugAliases` in `data/index.js` so existing links redirect.

### Check your work

```bash
npm run lint:fix && npm run lint
npm run build
npm run dev        # open /sheets/my-sheet and try the Copy buttons
```

## Theming

Colours are CSS variables in `:root[data-theme='light']` and `:root[data-theme='dark']` at the top of `src/styles.css`. The site opens in light mode. Switching to dark with the toggle is remembered in `localStorage` (key `qr-theme-choice`).

## Tech stack

React 19 · React Router 7 (`BrowserRouter`) · Vite 8 · ESLint 10 with `@stylistic` · plain CSS.
