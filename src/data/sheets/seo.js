import { c } from './shared/code.js'

const GH = '${{' // GitHub Actions expression opener (avoids template interpolation)

export default {
  slug: 'seo',
  title: 'SEO',
  tech: 'SEO',
  category: 'frontend',
  minutes: 40,
  lang: 'html',
  description: 'Technical SEO for developers: Search Console and Lighthouse setup, the essential head tags, redirects, robots.txt, sitemaps, canonicals and hreflang, JSON-LD structured data, Open Graph, Core Web Vitals fixes and field measurement, JavaScript and SPA rendering, and recipes for Laravel, Django, Express and Next.js.',
  sections: [
    {
      id: 'how-search-works',
      title: 'How search works, for developers',
      group: 'Setup',
      items: [
        {
          title: 'Crawl → render → index → rank',
          lang: 'text',
          code: c`
            1. Discover   URLs found via links, sitemaps, redirects, IndexNow (Bing/Yandex)
            2. Crawl      Googlebot fetches the HTML (obeys robots.txt, reads the status code)
            3. Render     the Web Rendering Service runs your JavaScript in headless Chromium
            4. Index      content, links, canonical, structured data are processed and stored
            5. Rank       a query is matched against the index; many signals, none fully public

            Your job:  make every page reachable (links) → fetchable (200, not blocked)
                       → understandable (real HTML, titles, structured data)
                       → fast and usable (Core Web Vitals, mobile-friendly)
            `,
          note: 'Google indexes the mobile version of your pages (mobile-first indexing), so the mobile HTML must contain the same content, links and metadata as desktop. Nobody outside Google knows the exact ranking factors; focus on the parts you control.',
        },
        {
          title: 'What a developer owns vs what content owns',
          lang: 'text',
          code: c`
            Developer                              Content / marketing
            ─────────────────────────────────      ─────────────────────────────
            status codes, redirects                 topics, keyword research
            robots.txt, sitemaps, canonicals        writing and updating pages
            server-rendered HTML, real links        titles and descriptions copy
            structured data, Open Graph             images and alt text wording
            Core Web Vitals, HTTPS, mobile          backlinks, PR
            `,
        },
      ],
    },
    {
      id: 'tools-setup',
      title: 'Tools setup, step by step',
      group: 'Setup',
      items: [
        {
          title: '1. Google Search Console: add a property',
          lang: 'text',
          code: c`
            https://search.google.com/search-console
            → Add property
              Domain         example.com       (all subdomains + http/https, needs DNS)
              URL prefix     https://example.com/  (one exact origin, more verification options)
            `,
          note: 'Prefer a Domain property so www, non-www, http and https all report in one place.',
        },
        {
          title: '2. Verify with a DNS TXT record',
          lang: 'text',
          code: c`
            Type   Host / Name   Value
            TXT    @             google-site-verification=AbC123...your-token
            `,
          then: [
            {
              label: 'Check the record is live (macOS / Linux)',
              lang: 'bash',
              code: c`
                dig +short TXT example.com
                `,
            },
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                Resolve-DnsName example.com -Type TXT
                `,
            },
          ],
          note: 'Add the record at your DNS provider, wait for it to appear, then click Verify. Keep the record forever; removing it un-verifies the property.',
        },
        {
          title: '3. Submit your sitemap',
          lang: 'text',
          code: c`
            Search Console → Indexing → Sitemaps → Add a new sitemap
            https://example.com/sitemap.xml   → Submit
            `,
          note: 'Status should become "Success" with a discovered URL count. Also list the sitemap in robots.txt so other engines find it.',
        },
        {
          title: '4. Bing Webmaster Tools',
          lang: 'text',
          code: c`
            https://www.bing.com/webmasters
            → Import your sites from Google Search Console   (verifies + imports sitemaps)
            `,
          note: 'Bing also powers several other search and AI products, so it is worth the two minutes.',
        },
        {
          title: '5. Lighthouse in Chrome DevTools',
          lang: 'text',
          code: c`
            Open the page in an Incognito window (extensions skew results)
            F12 (Cmd+Opt+I on macOS) → Lighthouse tab
            Mode: Navigation   Device: Mobile   Categories: Performance, SEO, Accessibility, Best practices
            → Analyze page load
            `,
          then: [
            {
              label: 'Lighthouse CLI (needs Chrome installed) — same on every OS',
              lang: 'bash',
              code: c`
                npx lighthouse https://example.com --only-categories=performance,seo --view
                npx lighthouse https://example.com --output=html --output-path=./lighthouse.html
                npx lighthouse https://example.com --preset=desktop --output=json --output-path=./lh.json
                `,
            },
          ],
          note: 'Lighthouse is lab data from one simulated load; it cannot measure INP and its SEO score only checks basics.',
        },
        {
          title: '6. PageSpeed Insights (field + lab data)',
          lang: 'text',
          code: c`
            https://pagespeed.web.dev/   → paste URL → Analyze
            Top:    "Discover what your real users are experiencing" = CrUX field data (28 days)
            Bottom: Lighthouse lab run
            `,
          then: [
            {
              label: 'PageSpeed Insights API — same on every OS (use curl.exe in Windows PowerShell)',
              lang: 'bash',
              code: c`
                curl "https://www.googleapis.com/pagespeedonline/v5/runPagePerformance?url=https://example.com&strategy=mobile&category=performance&category=seo"
                `,
            },
          ],
          note: 'Field data is what Search Console Core Web Vitals uses; pages with little traffic have no field data.',
        },
        {
          title: '7. Rich Results Test and URL Inspection',
          lang: 'text',
          code: c`
            Rich Results Test        https://search.google.com/test/rich-results
                                     → paste URL or code → see detected items + errors
            Schema Markup Validator  https://validator.schema.org   (any schema.org type)

            URL Inspection (Search Console top bar) → paste a URL
              → "URL is on Google?"   index status, chosen canonical, last crawl
              → Test live URL → View tested page   rendered HTML, screenshot, JS console errors
              → Request indexing      after fixing or publishing an important page
            `,
        },
      ],
    },
    {
      id: 'quick-audit',
      title: 'Quick audit checklist',
      group: 'Setup',
      items: [
        {
          title: 'Five-minute audit',
          lang: 'text',
          code: c`
            [ ] https://example.com/robots.txt loads and does not Disallow: / in production
            [ ] https://example.com/sitemap.xml loads, lists only 200 canonical URLs
            [ ] http:// and www variants 301 to one canonical origin
            [ ] View source (not DevTools Elements): title, description, canonical, content present
            [ ] One h1 per page; meaningful title per page (no duplicates)
            [ ] Unknown URL returns a real 404 status
            [ ] No noindex meta / X-Robots-Tag on pages that should rank
            [ ] Lighthouse mobile: SEO ≥ 90, no huge LCP image, CLS near 0
            [ ] Search Console → Pages: no spike in "Not indexed"
            `,
        },
        {
          title: 'Check status, headers and redirects from the terminal',
          lang: 'bash',
          code: c`
            # macOS / Linux
            curl -sI https://example.com/page                      # status + headers
            curl -sIL http://example.com | grep -iE "^(HTTP|location)"   # follow redirect chain
            curl -s https://example.com/page | grep -iE "<title>|canonical|robots"
            curl -sI https://example.com/ | grep -i x-robots-tag
            `,
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                curl.exe -sI https://example.com/page
                curl.exe -sIL http://example.com | Select-String -Pattern "^(HTTP|location)"
                curl.exe -s https://example.com/page | Select-String -Pattern "<title>|canonical|robots"
                curl.exe -sI https://example.com/ | Select-String -Pattern "x-robots-tag"
                `,
            },
            {
              label: 'Fetch as Googlebot (user agent only; real Googlebot also renders JS)',
              lang: 'bash',
              code: c`
                # same on every OS (curl.exe in Windows PowerShell)
                curl -s -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" https://example.com/ -o page.html
                `,
            },
          ],
          note: 'curl shows the raw HTML before JavaScript runs, which is roughly what non-rendering crawlers see.',
        },
      ],
    },

    {
      id: 'essential-head',
      title: 'The essential <head>',
      group: 'On-page',
      items: [
        {
          title: 'Minimal SEO-ready document',
          code: c`
            <!doctype html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Blue Running Shoes for Flat Feet | Acme Store</title>
              <meta name="description" content="Lightweight running shoes with arch support. Free returns within 60 days.">
              <link rel="canonical" href="https://example.com/shoes/blue-running-shoes">
              <meta name="robots" content="index, follow, max-image-preview:large">
              <link rel="icon" href="/favicon.ico" sizes="32x32">
              <link rel="icon" href="/icon.svg" type="image/svg+xml">
              <link rel="apple-touch-icon" href="/apple-touch-icon.png">
            </head>
            `,
          note: 'Every page needs its own title, description and absolute canonical URL. Google ignores meta keywords, so leave it out.',
        },
        {
          title: 'Title and description guidance',
          lang: 'text',
          code: c`
            <title>        ~50–60 characters (Google truncates by pixel width, ~600px)
                           unique per page; main topic first, brand last: "Topic | Brand"
            description    ~120–160 characters; a summary that earns the click
                           not a ranking factor; Google rewrites it when it finds a better snippet
            Avoid          "Home", "Untitled", the same title on every page, keyword stuffing
            `,
          note: 'These are display guidelines, not hard limits. A title Google considers unhelpful may be replaced with text from the h1 or links.',
        },
        {
          title: 'Robots meta values',
          code: c`
            <meta name="robots" content="noindex">              <!-- keep out of results -->
            <meta name="robots" content="noindex, nofollow">    <!-- also don't follow links -->
            <meta name="robots" content="nosnippet">            <!-- no text snippet -->
            <meta name="robots" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1">
            <meta name="googlebot" content="noindex">           <!-- Google only -->
            <span data-nosnippet>Not shown in snippets</span>
            `,
          note: 'Omitting the robots meta is the same as "index, follow". A noindex only works if the page is not blocked in robots.txt, because Google must crawl it to see the tag.',
        },
      ],
    },
    {
      id: 'content-structure',
      title: 'Headings and semantic HTML',
      group: 'On-page',
      items: [
        {
          title: 'One h1, logical heading levels',
          code: c`
            <h1>Blue Running Shoes</h1>
              <h2>Features</h2>
                <h3>Arch support</h3>
                <h3>Materials</h3>
              <h2>Sizing</h2>
              <h2>Reviews</h2>
            `,
          note: 'Use headings for structure, not for font size. One clear h1 that matches the page topic is the safe convention.',
        },
        {
          title: 'Semantic page skeleton',
          code: c`
            <body>
              <header>
                <nav aria-label="Main">
                  <a href="/">Home</a> <a href="/shoes">Shoes</a> <a href="/blog">Blog</a>
                </nav>
              </header>
              <main>
                <article>
                  <h1>How to choose running shoes</h1>
                  <p>Published <time datetime="2026-09-14">14 Sep 2026</time></p>
                  <section><h2>Know your foot type</h2> ...</section>
                </article>
                <aside>Related articles</aside>
              </main>
              <footer>...</footer>
            </body>
            `,
          note: 'Landmarks and real elements (button, a, time, table) help both screen readers and parsers understand the page.',
        },
      ],
    },
    {
      id: 'images',
      title: 'Images',
      group: 'On-page',
      items: [
        {
          title: 'alt, dimensions and lazy loading',
          code: c`
            <!-- content image: describe it -->
            <img src="/img/blue-shoe-side.webp" alt="Blue running shoe, side view with mesh upper"
                 width="800" height="600" loading="lazy" decoding="async">

            <!-- decorative image: empty alt -->
            <img src="/img/divider.svg" alt="" width="400" height="8">

            <!-- the LCP / hero image: never lazy -->
            <img src="/img/hero.avif" alt="Runner on a mountain trail" width="1600" height="900" fetchpriority="high">
            `,
          note: 'width and height let the browser reserve space (no layout shift). Use descriptive file names; lazy-load only images below the fold.',
        },
        {
          title: 'AVIF / WebP with <picture> and responsive sizes',
          code: c`
            <picture>
              <source type="image/avif" srcset="/img/hero-800.avif 800w, /img/hero-1600.avif 1600w" sizes="(max-width: 800px) 100vw, 800px">
              <source type="image/webp" srcset="/img/hero-800.webp 800w, /img/hero-1600.webp 1600w" sizes="(max-width: 800px) 100vw, 800px">
              <img src="/img/hero-1600.jpg" alt="Runner on a mountain trail" width="1600" height="900">
            </picture>
            `,
          then: [
            {
              label: 'Convert images (sharp-cli) — same on every OS',
              lang: 'bash',
              code: c`
                npx sharp-cli -i hero.jpg -o hero.avif -f avif -q 50
                npx sharp-cli -i hero.jpg -o hero.webp -f webp -q 75
                `,
            },
          ],
          note: 'The browser picks the first source it supports; the img element carries alt, width and height for all of them.',
        },
      ],
    },
    {
      id: 'links-urls',
      title: 'Internal links and URL design',
      group: 'On-page',
      items: [
        {
          title: 'Descriptive anchor text, crawlable links',
          code: c`
            <!-- good -->
            <a href="/guides/running-shoe-sizing">running shoe sizing guide</a>

            <!-- weak: no context -->
            <a href="/guides/running-shoe-sizing">click here</a>

            <!-- not crawlable: no href -->
            <span onclick="go('/guides/sizing')">sizing</span>

            <!-- paid / user-generated outbound links -->
            <a href="https://partner.example" rel="sponsored">Partner</a>
            <a href="https://user-site.example" rel="ugc nofollow">user link</a>
            `,
          note: 'Google follows links in a elements with an href. Link important pages from the navigation and from related content so no page is an orphan.',
        },
        {
          title: 'URL rules of thumb',
          lang: 'text',
          code: c`
            Good   https://example.com/shoes/blue-running-shoes
                   https://example.com/blog/how-to-choose-running-shoes
            Avoid  https://example.com/Shoes/Blue_Running_Shoes        (mixed case, underscores)
                   https://example.com/product.php?id=4821&cat=7        (opaque IDs in query strings)
                   https://example.com/#/shoes                          (hash routes are not indexed)

            - lowercase, words separated by hyphens
            - short, readable, stable (changing URLs costs time; redirect when you must)
            - one URL per piece of content; filters/sort/tracking params → canonical to the clean URL
            `,
        },
      ],
    },
    {
      id: 'status-redirects',
      title: '404s and redirects',
      group: 'On-page',
      items: [
        {
          title: 'Which status code',
          lang: 'text',
          code: c`
            200  OK                     normal page
            301  Moved Permanently      URL changed for good (passes signals; GET may replace POST)
            308  Permanent Redirect     like 301 but keeps the method/body; treated the same by Google
            302  Found                  temporary (A/B test, geo, maintenance); old URL stays indexed
            307  Temporary Redirect     like 302, keeps the method
            404  Not Found              page doesn't exist
            410  Gone                   removed on purpose; dropped slightly faster than 404
            503  Service Unavailable    maintenance; add Retry-After; don't keep it for days

            Soft 404 = a "not found" or empty page that returns 200. Return a real 404 instead.
            Redirect chains (A → B → C) and loops: point every old URL straight to the final one.
            `,
        },
        {
          title: 'Nginx',
          lang: 'nginx',
          code: c`
            location = /old-page { return 301 /new-page; }
            location /old-blog/  { rewrite ^/old-blog/(.*)$ /blog/$1 permanent; }

            # custom 404 page that keeps the 404 status
            error_page 404 /404.html;
            location = /404.html { internal; }
            `,
        },
        {
          title: 'Apache .htaccess',
          lang: 'apache',
          code: c`
            Redirect 301 /old-page /new-page
            RedirectMatch 301 ^/old-blog/(.*)$ /blog/$1

            RewriteEngine On
            RewriteRule ^products/(\d+)$ /shop/item/$1 [R=301,L]

            ErrorDocument 404 /404.html
            `,
        },
        {
          title: 'Laravel',
          lang: 'php',
          code: c`
            // routes/web.php
            Route::permanentRedirect('/old-page', '/new-page');      // 301
            Route::redirect('/promo', '/sale', 302);                 // temporary

            // in a controller
            return redirect()->route('posts.show', $post, 301);
            abort(404);                                              // real 404, never a 200 "not found" view
            `,
        },
        {
          title: 'Express',
          lang: 'js',
          code: c`
            app.get('/old-page', (req, res) => res.redirect(301, '/new-page'))

            // redirect map
            const moved = { '/about-us': '/about', '/shop': '/products' }
            app.use((req, res, next) => {
              const to = moved[req.path]
              if (to) return res.redirect(301, to)
              next()
            })

            // last middleware: real 404
            app.use((req, res) => res.status(404).send('Not found'))
            `,
        },
      ],
    },

    {
      id: 'robots-txt',
      title: 'robots.txt',
      group: 'Crawling & indexing',
      items: [
        {
          title: 'Typical production robots.txt',
          lang: 'text',
          code: c`
            # https://example.com/robots.txt  (Vite: public/robots.txt)
            User-agent: *
            Disallow: /admin/
            Disallow: /cart
            Disallow: /search?        # internal search result pages
            Allow: /admin/public-docs/

            Sitemap: https://example.com/sitemap.xml
            `,
          note: 'robots.txt must live at the root of each host and protocol. Paths are case-sensitive prefixes; * and $ wildcards are supported by Google.',
        },
        {
          title: 'Disallow vs noindex',
          lang: 'text',
          code: c`
            Disallow (robots.txt)   stops crawling. The URL can STILL be indexed (without content)
                                    if other pages link to it.
            noindex (meta/header)   stops indexing. Google must be ALLOWED to crawl the page to see it.

            To remove a page from Google: allow crawling + noindex (or 404/410), then wait for recrawl.
            Never Disallow and noindex the same URL.
            `,
        },
        {
          title: 'Block a staging site',
          lang: 'text',
          code: c`
            User-agent: *
            Disallow: /
            `,
          note: 'Better still, put staging behind HTTP basic auth or send X-Robots-Tag: noindex. Make sure this file never ships to production.',
        },
        {
          title: 'AI crawlers (opt out of training)',
          lang: 'text',
          code: c`
            User-agent: GPTBot            # OpenAI
            Disallow: /

            User-agent: ClaudeBot         # Anthropic
            Disallow: /

            User-agent: Google-Extended   # Gemini training/grounding; does NOT affect Google Search
            Disallow: /

            User-agent: CCBot             # Common Crawl
            Disallow: /
            `,
          note: 'These tokens are honoured voluntarily by the listed companies. Blocking Googlebot itself would remove you from Search, so target only the AI tokens.',
        },
      ],
    },
    {
      id: 'x-robots-tag',
      title: 'Meta robots and X-Robots-Tag',
      group: 'Crawling & indexing',
      items: [
        {
          title: 'X-Robots-Tag for non-HTML files (Nginx)',
          lang: 'nginx',
          code: c`
            # keep PDFs and internal files out of results
            location ~* \.(pdf|docx?|xlsx?)$ {
              add_header X-Robots-Tag "noindex, nofollow" always;
            }

            # whole staging server
            server {
              server_name staging.example.com;
              add_header X-Robots-Tag "noindex, nofollow" always;
            }
            `,
          note: 'The header works like the robots meta tag but also applies to PDFs, images and other files that have no head.',
        },
        {
          title: 'Express',
          lang: 'js',
          code: c`
            // noindex everything outside production
            if (process.env.NODE_ENV !== 'production') {
              app.use((req, res, next) => {
                res.set('X-Robots-Tag', 'noindex, nofollow')
                next()
              })
            }

            // single route
            app.get('/thank-you', (req, res) => {
              res.set('X-Robots-Tag', 'noindex')
              res.render('thank-you')
            })
            `,
        },
      ],
    },
    {
      id: 'sitemaps',
      title: 'sitemap.xml',
      group: 'Crawling & indexing',
      items: [
        {
          title: 'Sitemap format',
          lang: 'xml',
          code: c`
            <?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
              <url>
                <loc>https://example.com/</loc>
                <lastmod>2026-10-01</lastmod>
              </url>
              <url>
                <loc>https://example.com/blog/how-to-choose-running-shoes</loc>
                <lastmod>2026-09-14T10:30:00+00:00</lastmod>
              </url>
            </urlset>
            `,
          note: 'List only canonical, indexable URLs that return 200. Google ignores priority and changefreq, and uses lastmod only when it is consistently accurate.',
        },
        {
          title: 'Sitemap index (over 50,000 URLs or 50 MB)',
          lang: 'xml',
          code: c`
            <?xml version="1.0" encoding="UTF-8"?>
            <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
              <sitemap>
                <loc>https://example.com/sitemaps/pages.xml</loc>
                <lastmod>2026-10-01</lastmod>
              </sitemap>
              <sitemap>
                <loc>https://example.com/sitemaps/products-1.xml.gz</loc>
              </sitemap>
            </sitemapindex>
            `,
          note: 'Each sitemap file holds at most 50,000 URLs and 50 MB uncompressed. Submit only the index in Search Console.',
        },
        {
          title: 'Laravel: spatie/laravel-sitemap',
          lang: 'bash',
          code: c`
            composer require spatie/laravel-sitemap
            `,
          then: [
            {
              label: 'Build it in a command (schedule it daily)',
              lang: 'php',
              code: c`
                use Spatie\Sitemap\Sitemap;
                use Spatie\Sitemap\Tags\Url;

                $sitemap = Sitemap::create()
                    ->add(Url::create('/'))
                    ->add(Url::create('/about'));

                Post::published()->each(function (Post $post) use ($sitemap) {
                    $sitemap->add(
                        Url::create(route('posts.show', $post))->setLastModificationDate($post->updated_at)
                    );
                });

                $sitemap->writeToFile(public_path('sitemap.xml'));
                `,
            },
            {
              label: 'Or crawl the running site',
              lang: 'php',
              code: c`
                use Spatie\Sitemap\SitemapGenerator;

                SitemapGenerator::create(config('app.url'))->writeToFile(public_path('sitemap.xml'));
                `,
            },
          ],
        },
        {
          title: 'Node script for a Vite build',
          lang: 'js',
          code: c`
            // scripts/sitemap.mjs  — run after vite build
            import { writeFileSync } from 'node:fs'

            const SITE = 'https://example.com'
            const routes = ['/', '/about', '/pricing', '/blog/how-to-choose-running-shoes']
            const today = new Date().toISOString().slice(0, 10)

            const urls = routes
              .map(path => '  <url><loc>' + SITE + path + '</loc><lastmod>' + today + '</lastmod></url>')
              .join('\n')

            const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
              + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '\n</urlset>\n'

            writeFileSync('dist/sitemap.xml', xml)
            console.log('sitemap.xml: ' + routes.length + ' URLs')
            `,
          then: [
            {
              label: 'package.json',
              lang: 'json',
              code: c`
                {
                  "scripts": {
                    "build": "vite build",
                    "postbuild": "node scripts/sitemap.mjs"
                  }
                }
                `,
            },
          ],
          note: 'In a real app, load the routes from your CMS or API and use each item\'s real updated date instead of today.',
        },
        {
          title: 'Next.js: app/sitemap.ts',
          lang: 'ts',
          code: c`
            import type { MetadataRoute } from 'next'

            export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
              const posts = await getPosts()
              return [
                { url: 'https://example.com', lastModified: new Date() },
                ...posts.map(p => ({
                  url: 'https://example.com/blog/' + p.slug,
                  lastModified: p.updatedAt,
                })),
              ]
            }
            `,
          note: 'Next.js serves this at /sitemap.xml automatically.',
        },
      ],
    },
    {
      id: 'canonicals',
      title: 'Canonicals and duplicate content',
      group: 'Crawling & indexing',
      items: [
        {
          title: 'rel=canonical',
          code: c`
            <!-- on https://example.com/shoes?sort=price&utm_source=newsletter -->
            <link rel="canonical" href="https://example.com/shoes">

            <!-- every indexable page: self-referencing, absolute URL -->
            <link rel="canonical" href="https://example.com/shoes/blue-running-shoes">
            `,
          note: 'Canonical is a strong hint, not a command; redirects, internal links and sitemaps should all point to the same URL. Use one canonical tag per page.',
        },
        {
          title: 'Common sources of duplicates',
          lang: 'text',
          code: c`
            http://  vs  https://                → 301 to https
            www.     vs  bare domain             → 301 to one
            /page    vs  /page/                  → pick one, 301 the other
            /Page    vs  /page                   → lowercase, 301
            ?utm_*, ?ref=, ?sort=, ?sessionid=    → canonical to the clean URL
            /index.html vs /                     → 301 to /
            print / AMP / staging copies         → noindex or canonical
            `,
        },
        {
          title: 'Nginx: force https + bare domain + no trailing slash',
          lang: 'nginx',
          code: c`
            # http (both hosts) → https bare domain
            server {
              listen 80;
              listen [::]:80;
              server_name example.com www.example.com;
              return 301 https://example.com$request_uri;
            }

            # https www → https bare domain
            server {
              listen 443 ssl;
              listen [::]:443 ssl;
              http2 on;
              server_name www.example.com;
              ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
              ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
              return 301 https://example.com$request_uri;
            }

            # inside the main example.com server block: strip trailing slash (not on /)
            rewrite ^/(.+)/$ /$1 permanent;
            `,
          then: [
            {
              label: 'Apache .htaccess equivalent',
              lang: 'apache',
              code: c`
                RewriteEngine On
                RewriteCond %{HTTPS} off [OR]
                RewriteCond %{HTTP_HOST} ^www\. [NC]
                RewriteRule ^ https://example.com%{REQUEST_URI} [L,R=301]
                `,
            },
          ],
        },
        {
          title: 'Pagination',
          code: c`
            <!-- https://example.com/blog?page=2 -->
            <link rel="canonical" href="https://example.com/blog?page=2">

            <nav aria-label="Pagination">
              <a href="/blog?page=1">1</a>
              <a href="/blog?page=2" aria-current="page">2</a>
              <a href="/blog?page=3">3</a>
            </nav>
            `,
          note: 'Each page canonicalises to itself, not to page 1, and links with real a href. Google no longer uses rel="prev"/"next" (harmless to keep for other engines).',
        },
      ],
    },
    {
      id: 'hreflang',
      title: 'hreflang (multilingual / multi-region)',
      group: 'Crawling & indexing',
      items: [
        {
          title: 'hreflang tags',
          code: c`
            <!-- identical block on EVERY language version -->
            <link rel="alternate" hreflang="en"    href="https://example.com/en/pricing">
            <link rel="alternate" hreflang="en-GB" href="https://example.com/uk/pricing">
            <link rel="alternate" hreflang="de"    href="https://example.com/de/preise">
            <link rel="alternate" hreflang="x-default" href="https://example.com/pricing">

            <!-- plus a self canonical on each version -->
            <link rel="canonical" href="https://example.com/de/preise">
            `,
          note: 'Tags must be reciprocal (every version lists all others and itself) and use absolute URLs. x-default is the fallback, often a language picker.',
        },
        {
          title: 'hreflang in the sitemap instead',
          lang: 'xml',
          code: c`
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                    xmlns:xhtml="http://www.w3.org/1999/xhtml">
              <url>
                <loc>https://example.com/en/pricing</loc>
                <xhtml:link rel="alternate" hreflang="en" href="https://example.com/en/pricing"/>
                <xhtml:link rel="alternate" hreflang="de" href="https://example.com/de/preise"/>
                <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/pricing"/>
              </url>
              <!-- repeat a <url> entry for /de/preise with the same three links -->
            </urlset>
            `,
          note: 'Use either head tags or the sitemap, not a mix. Codes are ISO 639-1 language plus optional ISO 3166-1 region (en-GB, not en-UK).',
        },
      ],
    },
    {
      id: 'indexnow',
      title: 'IndexNow',
      group: 'Crawling & indexing',
      items: [
        {
          title: '1. Host your key file',
          lang: 'text',
          code: c`
            Generate a key (8–128 hex chars), e.g. 3f9a1c0b7e2d4a6f8b1c2d3e4f5a6b7c
            Serve it as plain text at:
            https://example.com/3f9a1c0b7e2d4a6f8b1c2d3e4f5a6b7c.txt   (content = the key)
            `,
          note: 'IndexNow notifies Bing, Yandex, Seznam, Naver and others instantly when a URL changes. Google does not use it.',
        },
        {
          title: '2. Ping a changed URL',
          lang: 'bash',
          code: c`
            # same on every OS (use curl.exe in Windows PowerShell)
            curl "https://api.indexnow.org/indexnow?url=https://example.com/blog/new-post&key=3f9a1c0b7e2d4a6f8b1c2d3e4f5a6b7c"
            `,
          then: [
            {
              label: 'Many URLs at once (macOS / Linux)',
              lang: 'bash',
              code: c`
                curl -X POST https://api.indexnow.org/indexnow \
                  -H "Content-Type: application/json; charset=utf-8" \
                  -d '{"host":"example.com","key":"3f9a1c0b7e2d4a6f8b1c2d3e4f5a6b7c","urlList":["https://example.com/a","https://example.com/b"]}'
                `,
            },
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                $body = @{ host = "example.com"; key = "3f9a1c0b7e2d4a6f8b1c2d3e4f5a6b7c"; urlList = @("https://example.com/a", "https://example.com/b") } | ConvertTo-Json
                Invoke-RestMethod -Method Post -Uri https://api.indexnow.org/indexnow -ContentType "application/json; charset=utf-8" -Body $body
                `,
            },
          ],
          note: 'A 200 or 202 response means the ping was accepted, not that the page will be indexed.',
        },
      ],
    },

    {
      id: 'jsonld-basics',
      title: 'JSON-LD essentials',
      group: 'Structured data',
      items: [
        {
          title: 'How JSON-LD works',
          code: c`
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Acme Store",
              "url": "https://example.com",
              "logo": "https://example.com/logo-512.png",
              "sameAs": [
                "https://www.linkedin.com/company/acme",
                "https://github.com/acme"
              ]
            }
            </script>
            `,
          note: 'Put JSON-LD anywhere in the head or body; Google recommends it over microdata. Markup must describe content visible on the page, and it makes you eligible for rich results, not guaranteed to get them.',
        },
        {
          title: 'WebSite (site name)',
          lang: 'json',
          code: c`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Acme Store",
              "alternateName": ["Acme", "acme.com"],
              "url": "https://example.com/"
            }
            `,
          note: 'Put this on the home page to influence the site name shown in results. Google retired the sitelinks search box in late 2024, so a SearchAction is no longer needed for Google.',
        },
        {
          title: 'BreadcrumbList',
          lang: 'json',
          code: c`
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Shoes", "item": "https://example.com/shoes" },
                { "@type": "ListItem", "position": 2, "name": "Running", "item": "https://example.com/shoes/running" },
                { "@type": "ListItem", "position": 3, "name": "Blue Running Shoes" }
              ]
            }
            `,
          note: 'The last item (the current page) may omit item. Match the breadcrumb trail visible on the page.',
        },
      ],
    },
    {
      id: 'jsonld-types',
      title: 'Common schema types',
      group: 'Structured data',
      items: [
        {
          title: 'Article / BlogPosting',
          lang: 'json',
          code: c`
            {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": "How to choose running shoes",
              "image": ["https://example.com/img/choose-shoes-1200x675.jpg"],
              "datePublished": "2026-09-14T08:00:00+00:00",
              "dateModified": "2026-10-02T12:15:00+00:00",
              "author": [{ "@type": "Person", "name": "Jane Doe", "url": "https://example.com/authors/jane" }],
              "publisher": { "@type": "Organization", "name": "Acme Store", "logo": { "@type": "ImageObject", "url": "https://example.com/logo-512.png" } }
            }
            `,
          note: 'Use ISO 8601 dates with a timezone, and only update dateModified for meaningful changes.',
        },
        {
          title: 'Product with Offer and AggregateRating',
          lang: 'json',
          code: c`
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Blue Running Shoes",
              "image": ["https://example.com/img/blue-shoe-1x1.jpg", "https://example.com/img/blue-shoe-16x9.jpg"],
              "description": "Lightweight running shoe with arch support.",
              "sku": "BRS-042",
              "brand": { "@type": "Brand", "name": "Acme" },
              "offers": {
                "@type": "Offer",
                "url": "https://example.com/shoes/blue-running-shoes",
                "price": "89.99",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock",
                "itemCondition": "https://schema.org/NewCondition"
              },
              "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.6", "reviewCount": "128" }
            }
            `,
          note: 'Price and availability must match what the page shows. Ratings must come from real reviews shown on the page.',
        },
        {
          title: 'LocalBusiness',
          lang: 'json',
          code: c`
            {
              "@context": "https://schema.org",
              "@type": "Restaurant",
              "name": "Acme Bistro",
              "image": "https://example.com/img/bistro.jpg",
              "url": "https://example.com",
              "telephone": "+49-30-1234567",
              "priceRange": "€€",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Hauptstraße 1",
                "addressLocality": "Berlin",
                "postalCode": "10115",
                "addressCountry": "DE"
              },
              "geo": { "@type": "GeoCoordinates", "latitude": 52.5321, "longitude": 13.3849 },
              "openingHoursSpecification": [
                { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "11:00", "closes": "22:00" }
              ]
            }
            `,
          note: 'Use the most specific subtype (Restaurant, Dentist, Store …). Keep it consistent with your Google Business Profile.',
        },
        {
          title: 'FAQPage (limited)',
          lang: 'json',
          code: c`
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Do you ship internationally?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Yes, to 30 countries." }
                }
              ]
            }
            `,
          note: 'Since 2023 Google shows FAQ rich results only for well-known government and health sites, and HowTo rich results were removed. The markup is valid but rarely produces a visual result.',
        },
        {
          title: 'Several entities on one page (@graph)',
          lang: 'json',
          code: c`
            {
              "@context": "https://schema.org",
              "@graph": [
                { "@type": "Organization", "@id": "https://example.com/#org", "name": "Acme Store", "logo": "https://example.com/logo-512.png" },
                { "@type": "WebSite", "@id": "https://example.com/#website", "url": "https://example.com/", "name": "Acme Store", "publisher": { "@id": "https://example.com/#org" } }
              ]
            }
            `,
        },
      ],
    },
    {
      id: 'jsonld-render',
      title: 'Rendering and validating JSON-LD',
      group: 'Structured data',
      items: [
        {
          title: 'Laravel Blade',
          lang: 'php',
          code: c`
            // controller
            $schema = [
                '@context' => 'https://schema.org',
                '@type' => 'BlogPosting',
                'headline' => $post->title,
                'datePublished' => $post->published_at->toIso8601String(),
                'dateModified' => $post->updated_at->toIso8601String(),
                'author' => ['@type' => 'Person', 'name' => $post->author->name],
            ];
            return view('posts.show', compact('post', 'schema'));
            `,
          then: [
            {
              label: 'resources/views/posts/show.blade.php',
              lang: 'blade',
              code: c`
                @push('head')
                  <script type="application/ld+json">@json($schema, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG)</script>
                @endpush
                `,
            },
          ],
          note: 'Build the data as a PHP array so values are escaped by json_encode; JSON_HEX_TAG stops a "</script>" in content from breaking out. If you write raw JSON in a Blade file, escape @context as @@context.',
        },
        {
          title: 'React',
          lang: 'jsx',
          code: c`
            function JsonLd({ data }) {
              // escape "<" so content can't close the script tag
              const json = JSON.stringify(data).replace(/</g, '\\u003c')
              return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
            }

            // usage
            <JsonLd data={{
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.name,
              offers: { '@type': 'Offer', price: String(product.price), priceCurrency: 'EUR' },
            }} />
            `,
          note: 'Google reads JSON-LD injected by JavaScript, but server-rendered markup is picked up faster and by more consumers.',
        },
        {
          title: 'Validate',
          lang: 'text',
          code: c`
            Rich Results Test         https://search.google.com/test/rich-results   (Google features only)
            Schema Markup Validator   https://validator.schema.org                  (any schema.org type)
            Search Console            Enhancements → one report per detected type (errors over time)
            `,
        },
      ],
    },

    {
      id: 'open-graph',
      title: 'Open Graph and X cards',
      group: 'Social sharing',
      items: [
        {
          title: 'Open Graph tags',
          code: c`
            <meta property="og:type" content="article">
            <meta property="og:site_name" content="Acme Store">
            <meta property="og:title" content="How to choose running shoes">
            <meta property="og:description" content="A 5-step guide to finding the right fit.">
            <meta property="og:url" content="https://example.com/blog/how-to-choose-running-shoes">
            <meta property="og:image" content="https://example.com/og/how-to-choose-running-shoes.png">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="630">
            <meta property="og:image:alt" content="Three running shoes side by side">
            <meta property="og:locale" content="en_US">
            `,
          note: 'Used by Facebook, LinkedIn, Slack, Discord, WhatsApp, iMessage and more. All URLs must be absolute and publicly reachable without login.',
        },
        {
          title: 'X (Twitter) card tags',
          code: c`
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:site" content="@acme">
            <meta name="twitter:creator" content="@janedoe">
            <!-- optional: X falls back to og:title, og:description and og:image -->
            <meta name="twitter:title" content="How to choose running shoes">
            <meta name="twitter:image" content="https://example.com/og/how-to-choose-running-shoes.png">
            `,
        },
        {
          title: 'og:image guidance',
          lang: 'text',
          code: c`
            Size     1200 × 630 px (1.91:1); safe minimum 600 × 315
            Format   PNG or JPEG (WebP works in most, not all, apps); keep under ~5 MB, ideally < 300 KB
            Content  big readable text, logo; keep key content centred (some apps crop to square)
            Cache    apps cache previews: change the image URL (e.g. ?v=2) to force a refresh
            `,
        },
        {
          title: 'Generate OG images (Next.js)',
          lang: 'tsx',
          code: c`
            // app/blog/[slug]/opengraph-image.tsx
            import { ImageResponse } from 'next/og'

            export const size = { width: 1200, height: 630 }
            export const contentType = 'image/png'

            export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
              const { slug } = await params
              const post = await getPost(slug)
              return new ImageResponse(
                (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                    padding: 80, fontSize: 64, background: '#0f172a', color: 'white' }}>
                    {post.title}
                  </div>
                ),
                size,
              )
            }
            `,
          note: 'Next.js adds the og:image tags automatically. Outside Next.js, @vercel/og or satori (HTML/JSX to SVG) plus a PNG converter do the same job.',
        },
        {
          title: 'Test previews',
          lang: 'text',
          code: c`
            Facebook Sharing Debugger   https://developers.facebook.com/tools/debug/   (also "Scrape Again" to refresh cache)
            LinkedIn Post Inspector     https://www.linkedin.com/post-inspector/
            X                           paste the link into the post composer to preview
            Any app                     https://www.opengraph.xyz/  (third-party preview of all tags)
            `,
        },
      ],
    },

    {
      id: 'cwv-explained',
      title: 'Core Web Vitals explained',
      group: 'Performance',
      items: [
        {
          title: 'The three metrics and targets',
          lang: 'text',
          code: c`
            Metric   Measures                                   Good        Poor
            LCP      Largest Contentful Paint: main content     ≤ 2.5 s     > 4.0 s
                     visible (hero image, big heading)
            INP      Interaction to Next Paint: delay from      ≤ 200 ms    > 500 ms
                     click/tap/key to the next frame
            CLS      Cumulative Layout Shift: unexpected        ≤ 0.1       > 0.25
                     movement of content

            Assessed at the 75th percentile of real visits, mobile and desktop separately.
            `,
          note: 'INP replaced FID as a Core Web Vital in March 2024. Page experience is one of many signals; great content on a slow page can still rank, but fast pages convert better.',
        },
        {
          title: 'Typical causes',
          lang: 'text',
          code: c`
            LCP   slow server (TTFB), render-blocking CSS/JS, huge or lazy-loaded hero image,
                  hero rendered only after client-side JS + API call
            INP   long JavaScript tasks, heavy re-renders, big third-party scripts, sync work in handlers
            CLS   images/iframes/ads without size, late-loading fonts, banners injected above content
            `,
        },
      ],
    },
    {
      id: 'cwv-fixes',
      title: 'Fixes with code',
      group: 'Performance',
      items: [
        {
          title: 'LCP: prioritise the hero image',
          code: c`
            <head>
              <!-- only needed if the image is discovered late (CSS background, JS-rendered) -->
              <link rel="preload" as="image" href="/img/hero-1600.avif" type="image/avif" fetchpriority="high"
                    imagesrcset="/img/hero-800.avif 800w, /img/hero-1600.avif 1600w" imagesizes="100vw">
            </head>

            <img src="/img/hero-1600.avif" alt="Runner on a trail" width="1600" height="900" fetchpriority="high">
            `,
          note: 'Never put loading="lazy" on the LCP image. Serve it from your own origin or a preconnected CDN.',
        },
        {
          title: 'Fonts: preconnect, preload, font-display',
          code: c`
            <!-- Google Fonts -->
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">

            <!-- self-hosted (preferred) -->
            <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
            `,
          then: [
            {
              label: 'CSS',
              lang: 'css',
              code: c`
                @font-face {
                  font-family: 'Inter';
                  src: url('/fonts/inter-var.woff2') format('woff2');
                  font-weight: 100 900;
                  font-display: swap;            /* show fallback text immediately */
                }
                body { font-family: 'Inter', system-ui, sans-serif; }
                `,
            },
          ],
        },
        {
          title: 'CLS: reserve space',
          lang: 'css',
          code: c`
            img, video { max-width: 100%; height: auto; }      /* with width/height attributes */
            .video-embed { aspect-ratio: 16 / 9; width: 100%; }
            .ad-slot     { min-height: 250px; }                /* reserve the ad's size */
            .cookie-bar  { position: fixed; bottom: 0; }       /* overlay instead of pushing content */
            `,
          note: 'Animate with transform and opacity rather than top, height or margin, which shift layout.',
        },
        {
          title: 'Scripts: defer, async, module',
          code: c`
            <script src="/app.js" defer></script>             <!-- runs after parsing, in order -->
            <script src="https://analytics.example/a.js" async></script>  <!-- independent, any order -->
            <script type="module" src="/main.js"></script>    <!-- deferred by default (Vite) -->
            `,
          note: 'A plain script tag in the head blocks rendering. Load third-party widgets after interaction or on idle where possible.',
        },
        {
          title: 'INP: break up long tasks',
          lang: 'js',
          code: c`
            const yieldToMain = () =>
              globalThis.scheduler?.yield ? scheduler.yield() : new Promise(r => setTimeout(r, 0))

            button.addEventListener('click', async () => {
              showSpinner()              // visual feedback first
              await yieldToMain()        // let the browser paint
              for (const chunk of chunks) {
                process(chunk)
                await yieldToMain()      // keep each task under ~50 ms
              }
            })
            `,
          note: 'In React, startTransition or useDeferredValue keep urgent updates (typing, clicks) responsive during heavy renders.',
        },
        {
          title: 'Code splitting (React + Vite)',
          lang: 'jsx',
          code: c`
            import { lazy, Suspense } from 'react'

            const Chart = lazy(() => import('./Chart.jsx'))   // separate chunk, loaded on demand

            export default function Dashboard() {
              return (
                <Suspense fallback={<div style={{ height: 320 }}>Loading…</div>}>
                  <Chart />
                </Suspense>
              )
            }
            `,
        },
        {
          title: 'Nginx: compression and caching',
          lang: 'nginx',
          code: c`
            gzip on;
            gzip_comp_level 5;
            gzip_types text/css application/javascript application/json image/svg+xml application/xml text/plain;

            # brotli needs the ngx_brotli module
            brotli on;
            brotli_comp_level 5;
            brotli_types text/css application/javascript application/json image/svg+xml application/xml text/plain;

            # Vite hashed assets never change → cache for a year
            location /assets/ {
              add_header Cache-Control "public, max-age=31536000, immutable";
            }
            # HTML must revalidate so new deploys show up
            location = /index.html {
              add_header Cache-Control "no-cache";
            }
            `,
        },
      ],
    },
    {
      id: 'cwv-field',
      title: 'Measuring in the field',
      group: 'Performance',
      items: [
        {
          title: 'web-vitals library',
          lang: 'bash',
          code: c`
            npm install web-vitals
            `,
          then: [
            {
              label: 'src/vitals.js — import once from main.jsx',
              lang: 'js',
              code: c`
                import { onLCP, onINP, onCLS } from 'web-vitals'

                function send(metric) {
                  const body = JSON.stringify({
                    name: metric.name,         // 'LCP' | 'INP' | 'CLS'
                    value: metric.value,
                    rating: metric.rating,     // 'good' | 'needs-improvement' | 'poor'
                    id: metric.id,
                    page: location.pathname,
                  })
                  if (!navigator.sendBeacon('/api/vitals', body)) {
                    fetch('/api/vitals', { method: 'POST', body, keepalive: true })
                  }
                }

                onLCP(send)
                onINP(send)
                onCLS(send)
                `,
            },
          ],
          note: 'sendBeacon still delivers data while the page is being closed, which is when INP and CLS are reported. Aggregate by the 75th percentile, like Google does.',
        },
        {
          title: 'Debug which element is the problem',
          lang: 'js',
          code: c`
            import { onLCP, onINP, onCLS } from 'web-vitals/attribution'

            onLCP(m => console.log('LCP element', m.attribution.target, m.value))
            onINP(m => console.log('INP target', m.attribution.interactionTarget, m.value))
            onCLS(m => console.log('CLS shift', m.attribution.largestShiftTarget, m.value))
            `,
          note: 'Chrome DevTools Performance panel also shows live LCP, INP and CLS values and the elements responsible.',
        },
      ],
    },
    {
      id: 'lighthouse-ci',
      title: 'Lighthouse CI in GitHub Actions',
      group: 'Performance',
      items: [
        {
          title: 'lighthouserc.json',
          lang: 'json',
          code: c`
            {
              "ci": {
                "collect": {
                  "staticDistDir": "./dist",
                  "url": ["http://localhost/index.html"],
                  "numberOfRuns": 3
                },
                "assert": {
                  "assertions": {
                    "categories:seo": ["error", { "minScore": 0.9 }],
                    "categories:performance": ["warn", { "minScore": 0.8 }],
                    "largest-contentful-paint": ["warn", { "maxNumericValue": 2500 }],
                    "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
                    "total-blocking-time": ["warn", { "maxNumericValue": 300 }]
                  }
                },
                "upload": { "target": "temporary-public-storage" }
              }
            }
            `,
          note: 'Lighthouse cannot measure INP in a page-load run, so total blocking time is the usual lab stand-in. For a server app, replace staticDistDir with startServerCommand and real URLs.',
        },
        {
          title: '.github/workflows/lighthouse.yml',
          lang: 'yaml',
          code: c`
            name: Lighthouse
            on: [pull_request]

            jobs:
              lhci:
                runs-on: ubuntu-latest
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: 22
                      cache: npm
                  - run: npm ci
                  - run: npm run build
                  - run: npx @lhci/cli autorun
                    env:
                      LHCI_GITHUB_APP_TOKEN: ${GH} secrets.LHCI_GITHUB_APP_TOKEN }}   # optional: PR status checks
            `,
          then: [
            {
              label: 'Run it locally first — same on every OS',
              lang: 'bash',
              code: c`
                npm run build
                npx @lhci/cli autorun
                `,
            },
          ],
          note: 'autorun collects, asserts and uploads using lighthouserc.json; a failing "error" assertion fails the job. The temporary-public-storage report link is public, so use your own LHCI server for private sites.',
        },
      ],
    },

    {
      id: 'js-rendering',
      title: 'How Google handles JavaScript',
      group: 'JavaScript & SPAs',
      items: [
        {
          title: 'Rendering pipeline',
          lang: 'text',
          code: c`
            Crawl HTML ──▶ index what's in the raw HTML ──▶ render queue
                                                              │  headless evergreen Chromium
                                                              ▼
                                         index the rendered DOM (JS content, links, meta)

            Raw HTML matters: status code, robots meta and canonical are read BEFORE rendering.
            A "noindex" in the raw HTML means the page is never rendered, even if JS removes it.
            `,
          note: 'The "two waves" model is a simplification; Google says the render delay is usually short. Many other crawlers, including most AI crawlers, fetch HTML without running JavaScript at all.',
        },
        {
          title: 'SPA pitfalls',
          lang: 'text',
          code: c`
            Empty HTML          <div id="root"></div> only → nothing for non-rendering crawlers,
                                same title/description on every route
            Hash routing        /#/pricing is one URL to Google → use history routing (/pricing)
            onClick navigation  <div onClick={() => navigate('/x')}> → links are not discovered
            Always 200          unknown routes return index.html with 200 → soft 404s
            Data behind clicks  content loaded only after scroll/click/login is not indexed
            Blocked resources   robots.txt blocking /assets/ or /api/ breaks rendering
            `,
        },
        {
          title: 'Real links in React',
          lang: 'jsx',
          code: c`
            import { Link } from 'react-router-dom'

            <Link to="/pricing">Pricing</Link>               // renders <a href="/pricing"> ✓
            <a href="/pricing">Pricing</a>                    // ✓

            <button onClick={() => navigate('/pricing')}>Pricing</button>   // ✗ not a link
            `,
        },
      ],
    },
    {
      id: 'spa-solutions',
      title: 'Solutions: SSR, SSG, prerendering',
      group: 'JavaScript & SPAs',
      items: [
        {
          title: 'Which approach',
          lang: 'text',
          code: c`
            SSR (server-side rendering)   HTML built per request     Next.js, Nuxt, React Router framework, Laravel, Django
            SSG (static generation)       HTML built at deploy time  Astro, Next.js static, React Router prerender
            Prerendering a Vite SPA       render known routes to HTML files after build
            Client-only SPA               fine for dashboards/apps behind login that don't need SEO
            `,
          note: 'Server-rendered apps such as classic Laravel Blade or Django templates are SEO-friendly by default, because the HTML already contains the content.',
        },
        {
          title: 'Next.js: generateMetadata',
          lang: 'tsx',
          code: c`
            // app/blog/[slug]/page.tsx
            import type { Metadata } from 'next'

            type Props = { params: Promise<{ slug: string }> }

            export async function generateMetadata({ params }: Props): Promise<Metadata> {
              const { slug } = await params
              const post = await getPost(slug)
              return {
                title: post.title,
                description: post.excerpt,
                alternates: { canonical: '/blog/' + slug },
                openGraph: { title: post.title, description: post.excerpt, type: 'article', images: [post.cover] },
              }
            }

            export default async function Page({ params }: Props) {
              const { slug } = await params
              const post = await getPost(slug)
              if (!post) notFound()              // import { notFound } from 'next/navigation' → real 404
              return <article><h1>{post.title}</h1></article>
            }
            `,
          note: 'Relative canonical and image URLs resolve against metadataBase set in the root layout.',
        },
        {
          title: 'Nuxt and Astro',
          lang: 'js',
          code: c`
            // Nuxt: pages/blog/[slug].vue  <script setup>
            const { data: post } = await useFetch('/api/posts/' + useRoute().params.slug)
            useSeoMeta({
              title: post.value.title,
              description: post.value.excerpt,
              ogImage: post.value.cover,
            })
            `,
          then: [
            {
              label: 'Astro layout (static HTML by default)',
              lang: 'html',
              code: c`
                ---
                // src/layouts/Base.astro
                const { title, description } = Astro.props
                const canonical = new URL(Astro.url.pathname, Astro.site)
                ---
                <html lang="en">
                  <head>
                    <title>{title}</title>
                    <meta name="description" content={description}>
                    <link rel="canonical" href={canonical}>
                  </head>
                  <body><slot /></body>
                </html>
                `,
            },
          ],
        },
        {
          title: 'Prerender a React Router app',
          lang: 'ts',
          code: c`
            // react-router.config.ts  (React Router v7 framework mode, built on Vite)
            import type { Config } from '@react-router/dev/config'

            export default {
              ssr: false,                                      // static hosting
              async prerender() {
                const posts = await getPostSlugs()
                return ['/', '/about', '/pricing', ...posts.map(s => '/blog/' + s)]
              },
            } satisfies Config
            `,
          note: 'Each listed route is rendered to its own HTML file at build time. For a plain Vite SPA, the same idea works with a script that loads each route in a headless browser after the build and saves the HTML.',
        },
      ],
    },
    {
      id: 'spa-meta',
      title: 'Per-route title and meta in React',
      group: 'JavaScript & SPAs',
      items: [
        {
          title: 'React 19: native <title> and <meta>',
          lang: 'jsx',
          code: c`
            export default function ProductPage({ product }) {
              return (
                <>
                  <title>{product.name + ' | Acme Store'}</title>
                  <meta name="description" content={product.summary} />
                  <link rel="canonical" href={'https://example.com/shoes/' + product.slug} />
                  <h1>{product.name}</h1>
                </>
              )
            }
            `,
          note: 'React 19 hoists these tags into the document head, client-side and when server rendering. Pass a single string to title, not mixed text and expressions.',
        },
        {
          title: 'react-helmet-async',
          lang: 'bash',
          code: c`
            npm install react-helmet-async
            `,
          then: [
            {
              label: 'Wrap the app, then set tags per route',
              lang: 'jsx',
              code: c`
                // main.jsx
                import { HelmetProvider } from 'react-helmet-async'
                createRoot(document.getElementById('root')).render(
                  <HelmetProvider><App /></HelmetProvider>
                )

                // pages/Pricing.jsx
                import { Helmet } from 'react-helmet-async'
                export default function Pricing() {
                  return (
                    <>
                      <Helmet>
                        <title>Pricing | Acme</title>
                        <meta name="description" content="Simple plans from 9 EUR per month." />
                        <link rel="canonical" href="https://example.com/pricing" />
                      </Helmet>
                      <h1>Pricing</h1>
                    </>
                  )
                }
                `,
            },
          ],
          note: 'Useful on React 18 or when you need deduplication of tags across nested routes. Client-set tags are seen by Google after rendering, but not by crawlers that skip JavaScript.',
        },
        {
          title: 'SPA 404s',
          lang: 'jsx',
          code: c`
            // catch-all route: tell Google not to index the not-found view
            function NotFound() {
              return (
                <>
                  <title>Page not found</title>
                  <meta name="robots" content="noindex" />
                  <h1>Page not found</h1>
                </>
              )
            }
            // <Route path="*" element={<NotFound />} />
            `,
          then: [
            {
              label: 'Better: have the server return a real 404 (Express)',
              lang: 'js',
              code: c`
                const known = [/^\/$/, /^\/pricing$/, /^\/blog\/[a-z0-9-]+$/]

                app.use(express.static('dist', { index: false }))
                app.use((req, res) => {
                  const ok = known.some(re => re.test(req.path))
                  res.status(ok ? 200 : 404).sendFile('index.html', { root: 'dist' })
                })
                `,
            },
          ],
        },
      ],
    },

    {
      id: 'recipe-laravel',
      title: 'Laravel',
      group: 'Framework recipes',
      items: [
        {
          title: 'Meta tags in the layout',
          lang: 'blade',
          code: c`
            {{-- resources/views/layouts/app.blade.php --}}
            <!doctype html>
            <html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>@yield('title', config('app.name'))</title>
              <meta name="description" content="@yield('description', 'Default site description.')">
              <link rel="canonical" href="@yield('canonical', url()->current())">
              @unless (app()->isProduction())
                <meta name="robots" content="noindex, nofollow">
              @endunless
              @stack('head')
            </head>
            <body>@yield('content')</body>
            </html>
            `,
          then: [
            {
              label: 'A page',
              lang: 'blade',
              code: c`
                @extends('layouts.app')
                @section('title', $post->title . ' | ' . config('app.name'))
                @section('description', Str::limit(strip_tags($post->excerpt), 155))
                @section('content')
                  <article><h1>{{ $post->title }}</h1> ...</article>
                @endsection
                `,
            },
          ],
          note: 'url()->current() drops the query string, which is usually what you want for a canonical. With Blade components, pass title and description as props to an x-layout component instead.',
        },
        {
          title: 'robots.txt route per environment',
          lang: 'php',
          code: c`
            // delete public/robots.txt first, otherwise the web server serves it directly
            // routes/web.php
            Route::get('/robots.txt', function () {
                $lines = app()->isProduction()
                    ? ['User-agent: *', 'Disallow: /admin', 'Sitemap: ' . url('sitemap.xml')]
                    : ['User-agent: *', 'Disallow: /'];

                return response(implode("\n", $lines), 200)->header('Content-Type', 'text/plain');
            });
            `,
        },
        {
          title: 'Sitemap',
          lang: 'php',
          code: c`
            // routes/console.php — regenerate daily (see the sitemap section for the full builder)
            use Illuminate\Support\Facades\Schedule;

            Schedule::command('sitemap:generate')->daily();
            `,
          note: 'Create the sitemap:generate command with php artisan make:command and put the spatie/laravel-sitemap code in its handle method.',
        },
      ],
    },
    {
      id: 'recipe-django',
      title: 'Django',
      group: 'Framework recipes',
      items: [
        {
          title: '1. Enable the sitemap framework',
          lang: 'python',
          code: c`
            # settings.py
            INSTALLED_APPS = [
                # ...
                "django.contrib.sitemaps",
            ]
            `,
        },
        {
          title: '2. Define sitemaps',
          lang: 'python',
          code: c`
            # blog/sitemaps.py
            from django.contrib.sitemaps import Sitemap
            from django.urls import reverse
            from .models import Post

            class PostSitemap(Sitemap):
                def items(self):
                    return Post.objects.filter(published=True)

                def lastmod(self, obj):
                    return obj.updated_at          # Post needs get_absolute_url()

            class StaticSitemap(Sitemap):
                def items(self):
                    return ["home", "about", "pricing"]

                def location(self, item):
                    return reverse(item)
            `,
        },
        {
          title: '3. URLs and robots.txt view',
          lang: 'python',
          code: c`
            # urls.py
            from django.conf import settings
            from django.contrib.sitemaps.views import sitemap
            from django.http import HttpResponse
            from django.urls import path
            from blog.sitemaps import PostSitemap, StaticSitemap

            sitemaps = {"posts": PostSitemap, "static": StaticSitemap}

            def robots_txt(request):
                if settings.DEBUG or getattr(settings, "IS_STAGING", False):
                    lines = ["User-agent: *", "Disallow: /"]
                else:
                    lines = ["User-agent: *", "Disallow: /admin/",
                             "Sitemap: " + request.build_absolute_uri("/sitemap.xml")]
                return HttpResponse("\n".join(lines), content_type="text/plain")

            urlpatterns = [
                path("sitemap.xml", sitemap, {"sitemaps": sitemaps},
                     name="django.contrib.sitemaps.views.sitemap"),
                path("robots.txt", robots_txt),
            ]
            `,
          note: 'Without django.contrib.sites the sitemap uses the request host for absolute URLs; behind a proxy set USE_X_FORWARDED_HOST and SECURE_PROXY_SSL_HEADER so it outputs https.',
        },
        {
          title: '4. Meta in base template',
          lang: 'django',
          code: c`
            {# templates/base.html #}
            <title>{% block title %}Acme Store{% endblock %}</title>
            <meta name="description" content="{% block description %}Default description{% endblock %}">
            <link rel="canonical" href="{{ request.scheme }}://{{ request.get_host }}{{ request.path }}">

            {# templates/blog/post_detail.html #}
            {% extends "base.html" %}
            {% block title %}{{ post.title }} | Acme Store{% endblock %}
            {% block description %}{{ post.excerpt|striptags|truncatechars:155 }}{% endblock %}
            `,
        },
      ],
    },
    {
      id: 'recipe-express',
      title: 'Express',
      group: 'Framework recipes',
      items: [
        {
          title: 'Sitemap and robots routes',
          lang: 'js',
          code: c`
            const SITE = 'https://example.com'
            const isProd = process.env.NODE_ENV === 'production'

            app.get('/robots.txt', (req, res) => {
              const body = isProd
                ? 'User-agent: *\nDisallow: /admin\nSitemap: ' + SITE + '/sitemap.xml\n'
                : 'User-agent: *\nDisallow: /\n'
              res.type('text/plain').send(body)
            })

            app.get('/sitemap.xml', async (req, res) => {
              const posts = await db.posts.findPublished()
              const urls = [{ loc: SITE + '/' }]
                .concat(posts.map(p => ({ loc: SITE + '/blog/' + p.slug, lastmod: p.updatedAt.toISOString() })))
                .map(u => '<url><loc>' + u.loc + '</loc>' + (u.lastmod ? '<lastmod>' + u.lastmod + '</lastmod>' : '') + '</url>')
                .join('')
              res.type('application/xml').send(
                '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls + '</urlset>'
              )
            })
            `,
          note: 'Slugs should already be URL-safe; escape &, < and > if any URL can contain them.',
        },
        {
          title: 'Staging noindex and helmet',
          lang: 'js',
          code: c`
            import helmet from 'helmet'

            app.use(helmet())
            if (!isProd) {
              app.use((req, res, next) => { res.set('X-Robots-Tag', 'noindex, nofollow'); next() })
            }
            `,
          note: 'Helmet only adds security headers and does not hurt SEO; JSON-LD blocks are data, not executed scripts, so its default CSP does not block them.',
        },
      ],
    },
    {
      id: 'recipe-nextjs',
      title: 'Next.js (App Router)',
      group: 'Framework recipes',
      items: [
        {
          title: 'Root metadata',
          lang: 'tsx',
          code: c`
            // app/layout.tsx
            import type { Metadata } from 'next'

            export const metadata: Metadata = {
              metadataBase: new URL('https://example.com'),
              title: { default: 'Acme Store', template: '%s | Acme Store' },
              description: 'Running gear for every foot.',
              alternates: { canonical: './' },
              openGraph: { siteName: 'Acme Store', type: 'website', locale: 'en_US' },
              twitter: { card: 'summary_large_image', site: '@acme' },
            }
            `,
          note: 'Child pages export their own metadata or generateMetadata; title.template wraps their titles. canonical "./" resolves to each page\'s own path.',
        },
        {
          title: 'app/robots.ts',
          lang: 'ts',
          code: c`
            import type { MetadataRoute } from 'next'

            export default function robots(): MetadataRoute.Robots {
              if (process.env.VERCEL_ENV !== 'production') {
                return { rules: { userAgent: '*', disallow: '/' } }
              }
              return {
                rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
                sitemap: 'https://example.com/sitemap.xml',
              }
            }
            `,
          note: 'Use your own environment variable if you don\'t deploy on Vercel. app/sitemap.ts is shown in the sitemap section.',
        },
      ],
    },

    {
      id: 'search-console-reports',
      title: 'Search Console reports to watch',
      group: 'Monitoring',
      items: [
        {
          title: 'Weekly check',
          lang: 'text',
          code: c`
            Performance        clicks, impressions, CTR, position by query/page; compare periods
            Indexing → Pages   indexed vs not indexed, with the reason for each group
            Sitemaps           last read date, discovered URLs, errors
            Core Web Vitals    field data per URL group, mobile and desktop
            HTTPS              pages not served over HTTPS
            Enhancements       Breadcrumbs, Products, Review snippets … errors and warnings
            Manual actions / Security issues   should always be empty
            `,
          note: 'After fixing a group of issues, open it in the Pages report and click Validate fix to have Google recheck them.',
        },
        {
          title: 'Common "not indexed" reasons',
          lang: 'text',
          code: c`
            Status                                     Meaning → what to do
            ──────────────────────────────────────     ─────────────────────────────────────────────
            Discovered – currently not indexed         known but not crawled yet → improve internal
                                                       links, server speed; normal for new/huge sites
            Crawled – currently not indexed            fetched but judged not worth indexing → improve
                                                       or merge thin/duplicate content
            Duplicate without user-selected canonical  Google picked another URL → add canonical,
                                                       redirect or consolidate
            Duplicate, Google chose different          your canonical was overruled → align links,
              canonical than user                      sitemap, redirects with the canonical
            Alternate page with proper canonical tag   fine: this URL correctly points elsewhere
            Blocked by robots.txt                      intentional? if not, fix robots.txt
            Excluded by 'noindex' tag                  intentional? check meta + X-Robots-Tag
            Soft 404                                   "not found"/empty page with 200 → return 404
                                                       or add real content
            Not found (404)                            fine if the page is gone; 301 if it moved
            Redirect error                             loop, chain too long, or bad URL → fix target
            Page with redirect                         fine: remove redirecting URLs from sitemap
            Server error (5xx)                         check logs, timeouts, rate limiting of bots
            `,
        },
      ],
    },
    {
      id: 'launch-checklist',
      title: 'Launch checklist',
      group: 'Monitoring',
      items: [
        {
          title: 'Before go-live',
          lang: 'text',
          code: c`
            [ ] Remove staging blocks: robots.txt "Disallow: /", noindex meta, X-Robots-Tag, basic auth
            [ ] HTTPS everywhere; http and www (or non-www) 301 to the canonical origin
            [ ] Unique title, description, canonical, h1 on every indexable page
            [ ] Real 404 status for unknown URLs; custom 404 page with navigation
            [ ] sitemap.xml generated, listed in robots.txt, submitted in Search Console + Bing
            [ ] Structured data validated (Rich Results Test)
            [ ] Open Graph image and tags checked in the sharing debuggers
            [ ] Lighthouse mobile: LCP ≤ 2.5 s, CLS ≤ 0.1, SEO ≥ 90
            [ ] Content visible in View Source (or URL Inspection rendered HTML) for JS apps
            [ ] Analytics + web-vitals reporting installed
            [ ] hreflang reciprocal (multilingual sites)
            `,
        },
      ],
    },
    {
      id: 'migration-checklist',
      title: 'Site migration checklist',
      group: 'Monitoring',
      items: [
        {
          title: 'Redesign, new domain or new URL structure',
          lang: 'text',
          code: c`
            Before
            [ ] Export every current URL (old sitemap, Search Console Pages + Performance, crawler, logs)
            [ ] Keep URLs unchanged wherever possible; if not, build a 1:1 redirect map old → new
            [ ] Keep titles, content, headings and internal links equivalent on the new pages
            [ ] Benchmark: indexed pages, clicks, top queries, Core Web Vitals

            Launch
            [ ] 301 every old URL straight to its closest new equivalent (no chains, no "all to home")
            [ ] Update canonicals, hreflang, internal links, structured data to the new URLs
            [ ] Publish the new sitemap and submit it; remove staging blocks
            [ ] Domain move: verify the new domain and use Settings → Change of address in Search Console

            After
            [ ] Crawl the old URL list and confirm every one returns 301 → 200
            [ ] Watch Pages report, 404s and server logs daily for 2–4 weeks
            [ ] Keep redirects in place for at least a year (ideally permanently)
            `,
          note: 'Expect rankings to fluctuate for a few weeks after a large migration even when everything is done right.',
        },
        {
          title: 'Test a redirect map from a CSV',
          lang: 'bash',
          code: c`
            # redirects.csv: old,new   (macOS / Linux)
            while IFS=, read -r old new; do
              got=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" "$old")
              [ "$got" = "301 $new" ] && echo "OK   $old" || echo "FAIL $old -> $got"
            done < redirects.csv
            `,
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                Import-Csv redirects.csv -Header old,new | ForEach-Object {
                  $got = curl.exe -s -o NUL -w "%{http_code} %{redirect_url}" $_.old
                  if ($got -eq "301 " + $_.new) { "OK   " + $_.old } else { "FAIL " + $_.old + " -> " + $got }
                }
                `,
            },
          ],
        },
      ],
    },
  ],
}
