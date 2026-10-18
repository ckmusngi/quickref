import { c } from './shared/code.js'

export default {
  slug: 'nginx',
  title: 'Nginx',
  tech: 'Nginx',
  category: 'devops',
  minutes: 40,
  lang: 'nginx',
  description: 'Nginx as a web server and reverse proxy: server blocks, locations, static sites and SPAs, proxying apps, PHP-FPM, HTTPS, caching, load balancing, security and troubleshooting.',
  sections: [
    {
      id: 'install',
      title: 'Install & verify',
      group: 'Setup',
      items: [
        {
          title: 'Install on Linux (Ubuntu / Debian)',
          lang: 'bash',
          code: c`
            sudo apt update
            sudo apt install -y nginx
            sudo systemctl enable --now nginx
            curl -I http://localhost          # Server: nginx

            # Fedora / RHEL / Rocky
            sudo dnf install -y nginx
            sudo systemctl enable --now nginx
            sudo firewall-cmd --permanent --add-service=http --add-service=https && sudo firewall-cmd --reload
            `,
          note: 'Distro packages lag behind; for the current stable (1.28) add the official nginx.org repository, which uses conf.d/ only (no sites-available).',
          then: [
            {
              label: 'Official nginx.org stable repo (Ubuntu)',
              lang: 'bash',
              code: c`
                sudo apt install -y curl gnupg2 ca-certificates lsb-release ubuntu-keyring
                curl -fsSL https://nginx.org/keys/nginx_signing.key | gpg --dearmor | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null
                echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/ubuntu $(lsb_release -cs) nginx" | sudo tee /etc/apt/sources.list.d/nginx.list
                sudo apt update && sudo apt install -y nginx
                `,
            },
          ],
        },
        {
          title: 'Install on macOS (Homebrew)',
          lang: 'bash',
          code: c`
            brew install nginx
            brew services start nginx          # start now and at login
            curl -I http://localhost:8080      # Homebrew's default port is 8080, not 80

            # config:  /opt/homebrew/etc/nginx/nginx.conf   (Apple Silicon)
            #          /usr/local/etc/nginx/nginx.conf      (Intel)
            # sites:   .../etc/nginx/servers/*              (included by nginx.conf)
            `,
          note: 'Homebrew runs Nginx as your user, so it uses port 8080; binding to 80 requires running it with sudo.',
        },
        {
          title: 'Install on Windows (PowerShell, dev only)',
          lang: 'powershell',
          code: c`
            # download the "Stable version" zip for Windows from https://nginx.org/en/download.html
            Expand-Archive .\nginx-1.28.0.zip -DestinationPath C:\
            Rename-Item C:\nginx-1.28.0 C:\nginx
            cd C:\nginx
            start nginx                        # runs in the background
            curl.exe -I http://localhost
            `,
          note: 'Nginx for Windows is a native port with known limitations and is not meant for production; use WSL (then follow the Linux steps) or Docker for anything realistic.',
        },
        {
          title: 'Run with Docker (any OS)',
          lang: 'bash',
          code: c`
            # serve the current folder on http://localhost:8080
            docker run --rm -p 8080:80 -v "$PWD":/usr/share/nginx/html:ro nginx:stable-alpine

            # with your own config (replaces the default site)
            docker run -d --name web -p 8080:80 \
              -v "$PWD/default.conf":/etc/nginx/conf.d/default.conf:ro \
              -v "$PWD/dist":/usr/share/nginx/html:ro \
              nginx:stable-alpine
            `,
          note: 'On Windows PowerShell write the paths as "$PWD\\dist" or use forward slashes; everything else is identical.',
          then: [
            {
              label: 'Reload / test inside the container',
              lang: 'bash',
              code: c`
                docker exec web nginx -t
                docker exec web nginx -s reload
                docker logs -f web            # access + error logs go to stdout / stderr
                `,
            },
          ],
        },
        {
          title: 'Verify version and modules',
          lang: 'bash',
          code: c`
            nginx -v              # nginx version: nginx/1.28.0
            nginx -V              # version + compile flags (--with-http_v2_module, --with-http_ssl_module ...)
            nginx -V 2>&1 | tr ' ' '\n' | grep -E 'http_(v2|v3|ssl|realip|stub_status|gzip_static)'
            `,
          note: 'nginx -V prints to stderr, hence the 2>&1. Use it to check a module exists before using its directives.',
        },
      ],
    },
    {
      id: 'service',
      title: 'Start, stop, reload & test',
      group: 'Setup',
      items: [
        {
          title: 'Always test, then reload',
          lang: 'bash',
          code: c`
            sudo nginx -t                          # syntax + file check
            sudo nginx -t && sudo systemctl reload nginx
            sudo nginx -T | less                   # test AND print the full merged config (all includes)
            sudo nginx -T | grep -n server_name    # which server blocks are really loaded
            `,
          note: 'A reload is graceful: old workers finish their requests while new ones start with the new config. If the config is invalid, Nginx keeps running the old one.',
        },
        {
          title: 'Linux (systemd)',
          lang: 'bash',
          code: c`
            sudo systemctl start nginx
            sudo systemctl stop nginx
            sudo systemctl restart nginx       # full stop/start (drops connections)
            sudo systemctl reload nginx        # apply config without downtime
            sudo systemctl enable nginx        # start on boot
            systemctl status nginx
            journalctl -u nginx -n 50 --no-pager
            `,
        },
        {
          title: 'macOS (Homebrew)',
          lang: 'bash',
          code: c`
            brew services start nginx
            brew services stop nginx
            brew services restart nginx
            brew services list
            nginx -t && nginx -s reload        # reload without restarting the service
            `,
        },
        {
          title: 'Windows (PowerShell, from C:\\nginx)',
          lang: 'powershell',
          code: c`
            start nginx
            .\nginx.exe -t
            .\nginx.exe -s reload      # re-read config
            .\nginx.exe -s quit        # graceful shutdown
            .\nginx.exe -s stop        # fast shutdown
            tasklist /fi "imagename eq nginx.exe"
            taskkill /f /im nginx.exe  # if workers are left behind
            `,
          note: 'The -s signals (reload, quit, stop, reopen) also work on Linux and macOS when you run nginx directly rather than via a service manager.',
        },
      ],
    },
    {
      id: 'layout',
      title: 'File layout',
      group: 'Setup',
      items: [
        {
          title: 'Ubuntu / Debian package',
          lang: 'text',
          code: c`
            /etc/nginx/nginx.conf             main config (http { } includes the rest)
            /etc/nginx/conf.d/*.conf          global http-level snippets and sites
            /etc/nginx/sites-available/       one file per site (not loaded by itself)
            /etc/nginx/sites-enabled/         symlinks to enabled sites (loaded)
            /etc/nginx/snippets/              reusable pieces (fastcgi-php.conf, your headers)
            /etc/nginx/mime.types             file extension → Content-Type
            /var/www/html/                    default site root
            /var/log/nginx/access.log         access log
            /var/log/nginx/error.log          error log
            /run/nginx.pid                    master process id
            worker user: www-data
            `,
          note: 'Fedora/RHEL and the nginx.org packages use only conf.d/*.conf, run workers as the nginx user and serve /usr/share/nginx/html by default.',
        },
        {
          title: 'macOS, Windows and Docker',
          lang: 'text',
          code: c`
            macOS (Homebrew, Apple Silicon — use /usr/local on Intel)
              /opt/homebrew/etc/nginx/nginx.conf
              /opt/homebrew/etc/nginx/servers/       your site files
              /opt/homebrew/var/www/                 default root
              /opt/homebrew/var/log/nginx/           logs

            Windows (zip)
              C:\nginx\conf\nginx.conf
              C:\nginx\html\
              C:\nginx\logs\access.log, error.log

            Docker (nginx:stable-alpine)
              /etc/nginx/nginx.conf
              /etc/nginx/conf.d/default.conf         replace this with your site
              /usr/share/nginx/html/                 default root
              logs → stdout / stderr (docker logs)
            `,
        },
        {
          title: 'Enable / disable a site (Debian / Ubuntu)',
          lang: 'bash',
          code: c`
            sudo nano /etc/nginx/sites-available/example.com
            sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
            sudo nginx -t && sudo systemctl reload nginx

            # disable
            sudo rm /etc/nginx/sites-enabled/example.com
            sudo nginx -t && sudo systemctl reload nginx
            `,
          note: 'Always use the absolute path in ln -s; a relative target creates a broken link that Nginx silently skips or fails on.',
        },
        {
          title: 'Replace the default site',
          lang: 'bash',
          code: c`
            # Debian / Ubuntu
            sudo rm /etc/nginx/sites-enabled/default

            # Fedora / RHEL / nginx.org packages / Docker
            sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.off

            sudo nginx -t && sudo systemctl reload nginx
            `,
          note: 'The default site is marked default_server, so it answers every request whose Host matches nothing else and can hide your own site. Files must end in .conf to be loaded from conf.d/.',
        },
      ],
    },

    {
      id: 'structure',
      title: 'Structure & inheritance',
      group: 'Config basics',
      items: [
        {
          title: 'Contexts',
          code: c`
            # main context: process-wide settings
            user www-data;
            worker_processes auto;
            error_log /var/log/nginx/error.log warn;
            pid /run/nginx.pid;

            events {
                worker_connections 1024;
            }

            http {                                   # everything HTTP
                include mime.types;
                default_type application/octet-stream;
                sendfile on;
                keepalive_timeout 65;

                server {                             # one virtual host
                    listen 80;
                    server_name example.com;
                    root /var/www/example;

                    location / {                     # rules for matching URIs
                        try_files $uri $uri/ =404;
                    }
                }

                include /etc/nginx/conf.d/*.conf;
                include /etc/nginx/sites-enabled/*;
            }
            `,
          note: 'Every directive ends with a semicolon and is only valid in certain contexts; nginx -t tells you when one is in the wrong place ("directive is not allowed here").',
        },
        {
          title: 'Inheritance rules',
          code: c`
            http {
                gzip on;                         # inherited by every server and location
                client_max_body_size 10M;

                server {
                    client_max_body_size 50M;    # overrides http for this server

                    location /upload {
                        client_max_body_size 1G; # overrides again for this location
                    }
                }
            }
            `,
          note: 'Simple directives inherit downwards and the innermost wins. Array-like directives (add_header, proxy_set_header, fastcgi_param) are replaced entirely, not merged, as soon as a level defines one of its own.',
        },
        {
          title: 'include, units and comments',
          code: c`
            include snippets/security-headers.conf;   # relative to the config dir (/etc/nginx)
            include /etc/nginx/conf.d/*.conf;         # globs are allowed

            client_max_body_size 20M;     # sizes: k, m, g (case-insensitive)
            proxy_read_timeout 90s;       # times: ms, s, m, h, d, w, M, y
            expires 1y;
            `,
        },
      ],
    },
    {
      id: 'server-blocks',
      title: 'listen, server_name & default_server',
      group: 'Config basics',
      items: [
        {
          title: 'listen variants',
          code: c`
            listen 80;                        # all IPv4 addresses
            listen [::]:80;                   # all IPv6 addresses
            listen 127.0.0.1:8080;            # localhost only
            listen 443 ssl;                   # TLS (add http2 on; separately)
            listen 80 default_server;         # catch-all for this ip:port
            listen unix:/run/nginx-app.sock;  # unix socket
            `,
        },
        {
          title: 'server_name matching order',
          lang: 'text',
          code: c`
            For each request Nginx picks the server block on the matching ip:port by Host header:
              1. exact name                     server_name example.com;
              2. longest wildcard at the start  server_name *.example.com;
              3. longest wildcard at the end    server_name www.example.*;
              4. first matching regex           server_name ~^(?<sub>.+)\.example\.com$;
              5. otherwise: default_server for that ip:port (or the first server block listed)

            server_name .example.com;   # shorthand for example.com AND *.example.com
            `,
          note: 'Named regex captures (like sub above) become variables you can use as $sub inside that server block.',
        },
        {
          title: 'Catch-all default server',
          code: c`
            # reject requests for unknown hosts / raw IP access
            server {
                listen 80 default_server;
                listen [::]:80 default_server;
                server_name _;
                return 444;                       # close the connection, no response
            }

            server {
                listen 443 ssl default_server;
                listen [::]:443 ssl default_server;
                server_name _;
                ssl_reject_handshake on;          # no certificate needed (1.19.4+)
            }
            `,
          note: 'Stops bots hitting your IP from landing on a real site and keeps your certificate names private. server_name _ is just an invalid name, not a wildcard.',
        },
      ],
    },
    {
      id: 'paths',
      title: 'root, alias, index & try_files',
      group: 'Config basics',
      items: [
        {
          title: 'root appends the full URI',
          code: c`
            server {
                root /var/www/site;
                location /images/ {
                    # /images/logo.png → /var/www/site/images/logo.png
                }
                location /static/ {
                    root /var/www/assets;
                    # /static/app.css → /var/www/assets/static/app.css
                }
            }
            `,
          note: 'Put root at server level so every location inherits it; repeating it in each location is a common source of mistakes.',
        },
        {
          title: 'alias replaces the location prefix',
          code: c`
            location /static/ {
                alias /var/www/assets/;
                # /static/app.css → /var/www/assets/app.css
            }

            # WRONG: missing slash on the location = path traversal
            location /static {
                alias /var/www/assets/;
                # /static../secret.txt → /var/www/assets/../secret.txt
            }
            `,
          note: 'Keep the trailing slash on both the location and the alias, or on neither. Prefer root whenever the folder name matches the URL.',
        },
        {
          title: 'index',
          code: c`
            index index.html index.htm;       # tried in order when the URI ends in /
            index index.php index.html;       # PHP apps
            `,
          note: 'If the URI is a directory and no index file exists (and autoindex is off), Nginx returns 403 Forbidden, not 404.',
        },
        {
          title: 'try_files',
          code: c`
            location / {
                try_files $uri $uri/ =404;               # static site
                # try_files $uri $uri/ /index.html;      # SPA fallback
                # try_files $uri $uri/ /index.php?$query_string;   # PHP front controller
                # try_files $uri @app;                    # file or proxy to a named location
            }

            location @app {
                proxy_pass http://127.0.0.1:3000;
            }
            `,
          note: 'Every argument but the last is checked as a file (or a directory with a trailing slash) under root; the last is an internal redirect URI, a named location or =code.',
        },
      ],
    },
    {
      id: 'locations',
      title: 'Location matching',
      group: 'Config basics',
      items: [
        {
          title: 'Matching order cheat table',
          lang: 'text',
          code: c`
            Modifier   Example                    Meaning
            =          location = /health         exact match only; wins immediately
            ^~         location ^~ /static/       prefix; if it is the longest prefix, skip regexes
            ~          location ~ \.php$          regex, case-sensitive
            ~*         location ~* \.(png|jpg)$   regex, case-insensitive
            (none)     location /api/             plain prefix

            Algorithm:
              1. exact "=" match           → use it, stop
              2. find the longest prefix   → if it has ^~, use it, stop
              3. regexes in file order     → first match wins
              4. no regex matched          → use the longest prefix from step 2
            `,
          note: 'Regex locations beat longer plain prefixes, which surprises people: a ~ \\.php$ location wins over location /uploads/ for /uploads/x.php.',
        },
        {
          title: 'Examples',
          code: c`
            location = / { }                      # only "/"
            location / { }                        # everything (shortest prefix, last resort)
            location /api/ { }                    # /api/users, not /apiv2
            location ^~ /assets/ { }              # /assets/x.png — regexes below never run
            location ~* \.(css|js|png|svg|woff2)$ { }
            location ~ ^/users/(\d+)$ {           # captures become $1, $2 ...
                return 200 "user $1\n";
            }
            `,
          then: [
            {
              label: 'Check which location answers',
              lang: 'bash',
              code: c`
                curl -i http://localhost/users/42
                # temporarily add to a location to see it in the response headers:
                #   add_header X-Debug-Location "users-regex" always;
                `,
            },
          ],
        },
        {
          title: 'Named and internal locations',
          code: c`
            location @backend {                  # only reachable via try_files / error_page
                proxy_pass http://127.0.0.1:3000;
            }

            location /protected/ {
                internal;                        # only via internal redirects (X-Accel-Redirect)
                alias /var/www/private/;
            }
            `,
          note: 'With internal plus an X-Accel-Redirect response header from your app, Nginx serves private downloads after the app has checked permissions.',
        },
      ],
    },
    {
      id: 'rewrites',
      title: 'return vs rewrite',
      group: 'Config basics',
      items: [
        {
          title: 'Prefer return',
          code: c`
            location = /old-page { return 301 /new-page; }
            location /blog/ { return 301 https://blog.example.com$request_uri; }
            location = /health { access_log off; return 200 "ok\n"; }
            location /gone/ { return 410; }
            `,
          note: 'return stops processing immediately and is easier to read; reach for rewrite only when you need regex captures to build a new URI.',
        },
        {
          title: 'rewrite with flags',
          code: c`
            # /product/42 → /products/42 (external 301)
            rewrite ^/product/(\d+)$ /products/$1 permanent;

            # internal rewrite, browser URL stays the same
            rewrite ^/p/(.*)$ /index.php?page=$1 last;

            # flags: last      restart location matching with the new URI
            #        break     stop rewriting, stay in this location
            #        redirect  302    permanent  301
            `,
          note: 'Avoid if inside location for anything but return or rewrite ("if is evil"); use map, try_files or separate locations instead.',
        },
      ],
    },
    {
      id: 'variables',
      title: 'Variables & map',
      group: 'Config basics',
      items: [
        {
          title: 'Common variables',
          lang: 'text',
          code: c`
            $host                 Host header (lowercased, no port) or server_name
            $http_host            Host header as sent, including the port
            $uri                  normalized path, no query string (/products/42)
            $request_uri          original path + query string, unmodified (/products/42?x=1)
            $args / $query_string query string without "?"
            $arg_page             one query parameter (?page=2 → 2)
            $request_method       GET, POST ...
            $scheme               http or https
            $remote_addr          client IP (or the proxy's IP without the realip module)
            $proxy_add_x_forwarded_for   X-Forwarded-For + $remote_addr
            $server_name / $server_port
            $http_user_agent      any request header: $http_ + lowercase name, - becomes _
            $http_x_forwarded_proto
            $cookie_session       one cookie value
            $sent_http_content_type      a response header
            $status / $body_bytes_sent / $request_time / $upstream_response_time
            $realpath_root        root with symlinks resolved (use for PHP)
            `,
        },
        {
          title: 'map: compute a variable from another',
          code: c`
            # http context
            map $http_user_agent $is_mobile {
                default        0;
                ~*iphone|android 1;
            }

            map $uri $cache_control {
                default             "no-cache";
                ~^/assets/          "public, max-age=31536000, immutable";
            }

            server {
                add_header Cache-Control $cache_control;
                add_header X-Mobile $is_mobile;
            }
            `,
          note: 'map is evaluated lazily, only when the variable is used, so it costs nothing elsewhere. It must live in the http context, outside server blocks.',
        },
      ],
    },

    {
      id: 'static',
      title: 'Static sites & SPAs',
      group: 'Static sites & SPAs',
      items: [
        {
          title: 'Static site',
          code: c`
            # /etc/nginx/sites-available/example.com
            server {
                listen 80;
                listen [::]:80;
                server_name example.com www.example.com;

                root /var/www/example.com/public;
                index index.html;

                location / {
                    try_files $uri $uri/ $uri.html =404;   # /about serves about.html
                }
            }
            `,
          then: [
            {
              label: 'Create the folder and permissions (Linux)',
              lang: 'bash',
              code: c`
                sudo mkdir -p /var/www/example.com/public
                sudo chown -R $USER:www-data /var/www/example.com
                sudo find /var/www/example.com -type d -exec chmod 755 {} +
                sudo find /var/www/example.com -type f -exec chmod 644 {} +
                `,
            },
          ],
        },
        {
          title: 'Single-page app (React, Vue, Angular, Svelte)',
          code: c`
            server {
                listen 80;
                server_name app.example.com;
                root /var/www/app/dist;
                index index.html;

                location / {
                    try_files $uri $uri/ /index.html;    # client-side routes load the app
                }

                location /assets/ {                      # hashed build files
                    expires 1y;
                    add_header Cache-Control "public, immutable";
                    try_files $uri =404;                 # missing asset = real 404, not index.html
                }

                location = /index.html {
                    add_header Cache-Control "no-cache";
                }
            }
            `,
          note: 'Without the try_files fallback, refreshing /products/42 returns 404 because no such file exists on disk.',
        },
        {
          title: 'SPA under a subpath (/app/)',
          code: c`
            location /app/ {
                alias /var/www/app/dist/;
                try_files $uri $uri/ /app/index.html;
            }
            location = /app { return 301 /app/; }
            `,
          note: 'The app itself must be built for the subpath too (Vite base: \'/app/\', React Router basename="/app").',
        },
        {
          title: 'Custom error pages',
          code: c`
            server {
                error_page 404 /404.html;
                error_page 500 502 503 504 /50x.html;

                location = /404.html { internal; }
                location = /50x.html {
                    root /var/www/errors;          # keep it outside the app so it works when the app is down
                    internal;
                }
            }

            # also show them for proxied apps
            proxy_intercept_errors on;
            `,
        },
        {
          title: 'Directory listing',
          code: c`
            location /downloads/ {
                alias /srv/files/;
                autoindex on;
                autoindex_exact_size off;     # 1.2M instead of bytes
                autoindex_localtime on;
                # autoindex_format json;      # html (default), json, xml
            }
            `,
          note: 'Leave autoindex off everywhere else; it is off by default.',
        },
        {
          title: 'favicon, robots.txt and hidden files',
          code: c`
            location = /favicon.ico { access_log off; log_not_found off; }
            location = /robots.txt  { access_log off; log_not_found off; }

            # block dotfiles (.git, .env, .htaccess) but keep Let's Encrypt working
            location ~ /\.(?!well-known) {
                deny all;
            }
            `,
          note: 'Put the dotfile block in every server; a missing favicon would otherwise fill the error log with "No such file" lines.',
        },
      ],
    },

    {
      id: 'proxy-basics',
      title: 'Reverse proxy basics',
      group: 'Reverse proxy',
      items: [
        {
          title: 'Proxy to Node, Python or Java',
          code: c`
            server {
                listen 80;
                server_name api.example.com;

                location / {
                    proxy_pass http://127.0.0.1:3000;       # Node 3000, Gunicorn/Uvicorn 8000, Spring 8080
                    proxy_http_version 1.1;
                    proxy_set_header Host $host;
                    proxy_set_header X-Real-IP $remote_addr;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_set_header X-Forwarded-Proto $scheme;
                    proxy_set_header X-Forwarded-Host $host;
                }
            }
            `,
          note: 'Bind the app to 127.0.0.1 so it is only reachable through Nginx, and tell the framework to trust the proxy so it sees the real client IP and https.',
          then: [
            {
              label: 'Trust the proxy in the app',
              lang: 'text',
              code: c`
                Express:  app.set('trust proxy', 1)
                Django:   SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
                FastAPI:  uvicorn main:app --proxy-headers --forwarded-allow-ips=127.0.0.1
                Spring:   server.forward-headers-strategy=native
                Laravel:  ->withMiddleware(fn ($m) => $m->trustProxies(at: '127.0.0.1'))
                `,
            },
          ],
        },
        {
          title: 'Reusable proxy snippet',
          code: c`
            # /etc/nginx/snippets/proxy.conf
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;

            # in a site
            location / {
                proxy_pass http://127.0.0.1:3000;
                include snippets/proxy.conf;
            }
            `,
          note: 'Remember the inheritance rule: one proxy_set_header inside a location discards all inherited ones, so include the snippet in every proxied location. $connection_upgrade comes from the WebSocket map below.',
        },
        {
          title: 'proxy_pass trailing slash',
          lang: 'text',
          code: c`
            location         proxy_pass                    request /api/users → backend gets
            /api/            http://127.0.0.1:3000         /api/users      (no URI: path passed as-is)
            /api/            http://127.0.0.1:3000/        /users          (URI "/": prefix replaced)
            /api/            http://127.0.0.1:3000/v1/     /v1/users
            /api             http://127.0.0.1:3000/        //users         (mismatched slashes: bug)
            ~ ^/api/(.*)$    http://127.0.0.1:3000/$1      /users          (regex: build the URI yourself)
            `,
          note: 'Rule: if proxy_pass has any URI part (even a single /), the matched location prefix is replaced by it; if it has none, the original URI is passed unchanged. Keep slashes consistent on both sides.',
        },
        {
          title: 'Rewrite redirects and cookies from the backend',
          code: c`
            location /app/ {
                proxy_pass http://127.0.0.1:3000/;
                include snippets/proxy.conf;
                proxy_redirect / /app/;              # Location: /login → /app/login
                proxy_cookie_path / /app/;           # Set-Cookie path=/ → path=/app/
            }
            `,
          note: 'Only needed when an app that thinks it lives at / is mounted under a subpath; configuring the app with its base path is cleaner.',
        },
      ],
    },
    {
      id: 'proxy-advanced',
      title: 'Upstreams, WebSockets, timeouts & uploads',
      group: 'Reverse proxy',
      items: [
        {
          title: 'upstream with keepalive',
          code: c`
            upstream api_backend {
                server 127.0.0.1:3000;
                keepalive 32;                         # idle connections kept open per worker
            }

            server {
                location / {
                    proxy_pass http://api_backend;
                    proxy_http_version 1.1;
                    proxy_set_header Connection "";   # required for keepalive
                    proxy_set_header Host $host;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_set_header X-Forwarded-Proto $scheme;
                }
            }
            `,
          note: 'Reusing connections to the backend cuts latency and avoids running out of ephemeral ports under load.',
        },
        {
          title: 'WebSockets (Socket.IO, ws, Laravel Reverb)',
          code: c`
            # http context
            map $http_upgrade $connection_upgrade {
                default upgrade;
                ''      close;        # use '' "" instead when the upstream has keepalive
            }

            server {
                location /socket.io/ {
                    proxy_pass http://127.0.0.1:3000;
                    proxy_http_version 1.1;
                    proxy_set_header Upgrade $http_upgrade;
                    proxy_set_header Connection $connection_upgrade;
                    proxy_set_header Host $host;
                    proxy_read_timeout 1h;            # idle sockets are closed after 60s by default
                }
            }
            `,
        },
        {
          title: 'Timeouts',
          code: c`
            location /reports/ {
                proxy_pass http://127.0.0.1:8000;
                proxy_connect_timeout 5s;      # opening the TCP connection (default 60s)
                proxy_send_timeout 60s;        # between two writes to the backend
                proxy_read_timeout 300s;       # between two reads from the backend (default 60s)
            }

            # client side
            client_body_timeout 30s;
            send_timeout 30s;
            keepalive_timeout 65s;
            `,
          note: 'proxy_read_timeout is the one behind most 504s; raise it only for the slow routes and move truly long work to a background job.',
        },
        {
          title: 'Buffering, streaming and Server-Sent Events',
          code: c`
            location /events {
                proxy_pass http://127.0.0.1:3000;
                proxy_http_version 1.1;
                proxy_set_header Connection "";
                proxy_buffering off;           # send each chunk immediately
                proxy_cache off;
                proxy_read_timeout 24h;
                chunked_transfer_encoding on;
            }
            `,
          note: 'Alternatively the app can send the X-Accel-Buffering: no response header to disable buffering for just that response. Keep buffering on for normal routes; it frees slow clients from tying up the backend.',
        },
        {
          title: 'Large uploads (413 Request Entity Too Large)',
          code: c`
            server {
                client_max_body_size 100M;        # default is 1M; 0 disables the check
                client_body_timeout 120s;

                location /api/upload {
                    client_max_body_size 2G;
                    proxy_request_buffering off;  # stream the body to the app instead of buffering to disk
                    proxy_pass http://127.0.0.1:3000;
                }
            }
            `,
          note: 'The app has its own limit too (PHP upload_max_filesize and post_max_size, Express body parser, Django DATA_UPLOAD_MAX_MEMORY_SIZE).',
        },
      ],
    },
    {
      id: 'multi-apps',
      title: 'Multiple apps & Docker',
      group: 'Reverse proxy',
      items: [
        {
          title: 'Subdomains (recommended)',
          code: c`
            server {
                listen 80;
                server_name app.example.com;
                location / { proxy_pass http://127.0.0.1:3000; include snippets/proxy.conf; }
            }
            server {
                listen 80;
                server_name api.example.com;
                location / { proxy_pass http://127.0.0.1:8000; include snippets/proxy.conf; }
            }
            server {
                listen 80;
                server_name admin.example.com;
                location / { proxy_pass http://127.0.0.1:8080; include snippets/proxy.conf; }
            }
            `,
          note: 'Each app keeps its own root path, cookies and CSP, and certbot can cover them all with one certificate (-d app.example.com -d api.example.com ...).',
        },
        {
          title: 'Subpaths on one domain',
          code: c`
            server {
                listen 80;
                server_name example.com;
                root /var/www/frontend/dist;

                location / { try_files $uri $uri/ /index.html; }

                location /api/ {                    # keeps /api in the path
                    proxy_pass http://127.0.0.1:8000;
                    include snippets/proxy.conf;
                }

                location /grafana/ {                # strips /grafana/
                    proxy_pass http://127.0.0.1:3001/;
                    include snippets/proxy.conf;
                }
            }
            `,
          note: 'Same origin means no CORS, but each app must generate links with its subpath, which many tools only support through a base URL setting.',
        },
        {
          title: 'Docker Compose: service names as upstreams',
          lang: 'yaml',
          code: c`
            # compose.yaml
            services:
              nginx:
                image: nginx:stable-alpine
                ports: ["80:80"]
                volumes:
                  - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
                depends_on: [api, web]
              api:
                build: ./api          # listens on 0.0.0.0:3000 inside the container
              web:
                build: ./web          # listens on 0.0.0.0:80
            `,
          then: [
            {
              label: 'nginx/default.conf',
              lang: 'nginx',
              code: c`
                upstream api { server api:3000; }

                server {
                    listen 80;
                    location /api/ {
                        proxy_pass http://api;
                        proxy_set_header Host $host;
                        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                        proxy_set_header X-Forwarded-Proto $scheme;
                    }
                    location / {
                        proxy_pass http://web:80;
                    }
                }
                `,
            },
          ],
          note: 'Only Nginx publishes a port; apps listen on 0.0.0.0 inside their container (not 127.0.0.1) and are reached by service name on the Compose network.',
        },
        {
          title: 'Re-resolve container names at runtime',
          code: c`
            # Nginx resolves upstream names once at startup; recreated containers get new IPs
            resolver 127.0.0.11 valid=10s ipv6=off;   # Docker's embedded DNS

            location /api/ {
                set $api_upstream http://api:3000;    # a variable forces lookup per request
                proxy_pass $api_upstream;
            }
            `,
          note: 'Symptoms without this: "host not found in upstream" at startup if the app is not up yet, or 502s after the app container is recreated until Nginx is reloaded.',
        },
      ],
    },

    {
      id: 'php-fpm',
      title: 'PHP-FPM (Laravel, WordPress)',
      group: 'PHP-FPM',
      items: [
        {
          title: 'Laravel',
          code: c`
            server {
                listen 80;
                listen [::]:80;
                server_name example.com;
                root /var/www/app/public;          # public/, never the project root
                index index.php;
                charset utf-8;
                client_max_body_size 20M;

                location / {
                    try_files $uri $uri/ /index.php?$query_string;
                }

                location = /favicon.ico { access_log off; log_not_found off; }
                location = /robots.txt  { access_log off; log_not_found off; }

                error_page 404 /index.php;

                location ~ ^/index\.php(/|$) {
                    fastcgi_pass unix:/run/php/php8.3-fpm.sock;
                    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
                    include fastcgi_params;
                    fastcgi_hide_header X-Powered-By;
                }

                location ~ /\.(?!well-known).* {
                    deny all;
                }
            }
            `,
          note: 'Only index.php is executable here, so a stray .php file uploaded to public/ is downloaded or 404s instead of running.',
        },
        {
          title: 'WordPress',
          code: c`
            server {
                listen 80;
                server_name blog.example.com;
                root /var/www/wordpress;
                index index.php;
                client_max_body_size 64M;

                location / {
                    try_files $uri $uri/ /index.php?$args;
                }

                location ~ \.php$ {
                    include snippets/fastcgi-php.conf;
                    fastcgi_pass unix:/run/php/php8.3-fpm.sock;
                    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
                }

                # never execute PHP from uploads
                location ~* ^/wp-content/uploads/.*\.php$ { deny all; }

                # XML-RPC is a brute-force target; remove this if you use Jetpack or the mobile app
                location = /xmlrpc.php { deny all; }

                location ~* \.(css|js|png|jpg|jpeg|gif|webp|svg|woff2)$ {
                    expires 30d;
                    access_log off;
                }

                location ~ /\.(?!well-known) { deny all; }
            }
            `,
        },
        {
          title: 'FastCGI params explained',
          code: c`
            # Debian/Ubuntu snippets/fastcgi-php.conf already contains roughly:
            fastcgi_split_path_info ^(.+?\.php)(/.*)$;
            try_files $fastcgi_script_name =404;      # 404 instead of passing missing files to PHP
            set $path_info $fastcgi_path_info;
            fastcgi_param PATH_INFO $path_info;
            fastcgi_index index.php;
            include fastcgi.conf;                     # sets SCRIPT_FILENAME, QUERY_STRING, REQUEST_METHOD ...

            # on other distros / Docker include the params yourself
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
            `,
          note: 'Use $realpath_root rather than $document_root: with symlinked releases (current → releases/123) PHP opcache otherwise keeps serving the old release after a deploy.',
        },
        {
          title: 'Unix socket vs TCP',
          code: c`
            fastcgi_pass unix:/run/php/php8.3-fpm.sock;   # Ubuntu/Debian, same machine (fastest)
            fastcgi_pass unix:/run/php-fpm/www.sock;      # Fedora / RHEL
            fastcgi_pass 127.0.0.1:9000;                  # TCP, same machine
            fastcgi_pass php:9000;                        # Docker Compose service "php"
            `,
          then: [
            {
              label: 'Find the socket and pool user (Linux)',
              lang: 'bash',
              code: c`
                ls -l /run/php/                                 # php8.3-fpm.sock, php8.4-fpm.sock ...
                grep -E '^(listen|user|group)' /etc/php/8.3/fpm/pool.d/www.conf
                sudo systemctl status php8.3-fpm
                `,
            },
          ],
          note: 'After upgrading PHP, the socket name changes (php8.3 → php8.4) and every site must be updated, or you get 502 Bad Gateway.',
        },
        {
          title: 'PHP-FPM in Docker',
          code: c`
            # Nginx and PHP containers must see the code at the SAME path
            server {
                listen 80;
                root /var/www/html/public;
                index index.php;

                location / { try_files $uri $uri/ /index.php?$query_string; }

                location ~ \.php$ {
                    fastcgi_pass php:9000;
                    include fastcgi_params;
                    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
                }
            }
            `,
          note: 'Mount the project into both the nginx and php services at /var/www/html; "File not found." from PHP means SCRIPT_FILENAME points to a path that does not exist inside the PHP container.',
        },
        {
          title: 'Common PHP pitfalls',
          lang: 'text',
          code: c`
            PHP file downloads instead of running → no ~ \.php$ location, or wrong root
            "File not found." / "Primary script unknown" → SCRIPT_FILENAME wrong (root, Docker path)
            502 Bad Gateway                        → php-fpm stopped or wrong socket path/version
            connect() to unix:... (13: Permission denied) → socket listen.owner/group must be www-data
            504 on long requests                   → fastcgi_read_timeout 300s; plus PHP max_execution_time
            413 on upload                          → client_max_body_size AND upload_max_filesize/post_max_size
            Old code after symlink deploy          → use $realpath_root; reload php-fpm
            `,
        },
      ],
    },

    {
      id: 'https',
      title: 'HTTPS & certificates',
      group: 'HTTPS & redirects',
      items: [
        {
          title: 'Install Certbot (Linux)',
          lang: 'bash',
          code: c`
            # Ubuntu / Debian
            sudo apt install -y certbot python3-certbot-nginx

            # Fedora
            sudo dnf install -y certbot python3-certbot-nginx

            # RHEL / Rocky / Alma (needs EPEL)
            sudo dnf install -y epel-release && sudo dnf install -y certbot python3-certbot-nginx

            # any distro, latest version via snap
            sudo snap install --classic certbot && sudo ln -s /snap/bin/certbot /usr/bin/certbot
            `,
          note: 'DNS for the domain must already point to the server and port 80 must be open, because Let\'s Encrypt validates over HTTP.',
        },
        {
          title: 'Get a certificate and auto-configure Nginx',
          lang: 'bash',
          code: c`
            sudo certbot --nginx -d example.com -d www.example.com
            # edits the matching server block: adds listen 443 ssl, cert paths and an HTTP→HTTPS redirect

            sudo certbot certonly --nginx -d example.com     # only get the cert, edit config yourself
            sudo certbot certificates                        # list certs and expiry dates
            `,
          then: [
            {
              label: 'Renewal (automatic, check it works)',
              lang: 'bash',
              code: c`
                sudo certbot renew --dry-run
                systemctl list-timers | grep certbot           # apt/dnf install a systemd timer
                # reload Nginx after each renewal:
                echo -e '#!/bin/sh\nsystemctl reload nginx' | sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
                sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
                `,
            },
          ],
        },
        {
          title: 'Manual TLS server block',
          code: c`
            server {
                listen 443 ssl;
                listen [::]:443 ssl;
                http2 on;
                server_name example.com;

                ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;  # cert + intermediates
                ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
                include snippets/ssl-params.conf;

                root /var/www/example.com/public;
            }
            `,
          note: 'Always use the full chain file, otherwise browsers may accept the site but curl, Android and API clients fail with "unable to get local issuer certificate".',
        },
        {
          title: 'Modern TLS settings',
          code: c`
            # /etc/nginx/snippets/ssl-params.conf  (Mozilla "intermediate" profile)
            ssl_protocols TLSv1.2 TLSv1.3;
            ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
            ssl_prefer_server_ciphers off;

            ssl_session_cache shared:SSL:10m;     # ~40,000 sessions
            ssl_session_timeout 1d;
            ssl_session_tickets off;
            `,
          note: 'Let\'s Encrypt stopped offering OCSP in 2025, so leave ssl_stapling off for its certificates; enable ssl_stapling on with a resolver only for commercial certificates that still include an OCSP URL.',
        },
        {
          title: 'Local HTTPS for development',
          lang: 'bash',
          code: c`
            # macOS
            brew install mkcert && mkcert -install

            # Linux
            sudo apt install -y mkcert libnss3-tools && mkcert -install

            # Windows (PowerShell)
            winget install FiloSottile.mkcert; mkcert -install

            # any OS: create a trusted cert for local names
            mkcert localhost 127.0.0.1 myapp.test
            # → localhost+2.pem and localhost+2-key.pem: use them as ssl_certificate / ssl_certificate_key
            `,
          note: 'Let\'s Encrypt cannot issue certificates for localhost; mkcert installs a local CA your browsers trust.',
        },
      ],
    },
    {
      id: 'redirects',
      title: 'Redirects, HSTS, HTTP/2 & HTTP/3',
      group: 'HTTPS & redirects',
      items: [
        {
          title: 'HTTP → HTTPS',
          code: c`
            server {
                listen 80;
                listen [::]:80;
                server_name example.com www.example.com;

                location /.well-known/acme-challenge/ { root /var/www/certbot; }   # optional: webroot renewals
                location / { return 301 https://$host$request_uri; }
            }
            `,
        },
        {
          title: 'www ↔ non-www',
          code: c`
            # www → apex (one canonical host)
            server {
                listen 443 ssl;
                http2 on;
                server_name www.example.com;
                ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
                ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
                return 301 https://example.com$request_uri;
            }

            # for apex → www, swap the names
            `,
          note: 'The redirecting HTTPS server still needs a valid certificate for www, so include both names when running certbot.',
        },
        {
          title: 'HSTS (with caution)',
          code: c`
            # start small, raise to a year once everything works over HTTPS
            add_header Strict-Transport-Security "max-age=300" always;
            # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
            # add "; preload" only if you are submitting to hstspreload.org
            `,
          note: 'Browsers cache HSTS for max-age and refuse plain HTTP for the host (and subdomains with includeSubDomains), which is hard to undo. Send it only from the HTTPS server block.',
        },
        {
          title: 'HTTP/2',
          code: c`
            # 1.25.1+ (all current stable releases)
            listen 443 ssl;
            http2 on;

            # older Nginx (deprecated syntax, warns on new versions)
            listen 443 ssl http2;
            `,
          note: 'http2 on applies per server but effectively per ip:port, so turning it on in one server enables it for others on the same address. Browsers only use HTTP/2 over TLS.',
        },
        {
          title: 'HTTP/3 (QUIC)',
          code: c`
            server {
                listen 443 quic reuseport;    # reuseport only once per ip:port across all servers
                listen 443 ssl;
                http2 on;
                http3 on;
                add_header Alt-Svc 'h3=":443"; ma=86400' always;
                # ... ssl_certificate lines as usual (TLSv1.3 required)
            }
            `,
          note: 'Available since 1.25 and included in the nginx.org packages, but distro builds may lack it (check nginx -V for http_v3_module). Open UDP 443 in the firewall too.',
        },
        {
          title: 'Redirect status codes',
          lang: 'text',
          code: c`
            Code  Meaning               Method kept?   Cached?   Use for
            301   Moved Permanently     may become GET yes       old URL → new URL, http → https, www
            302   Found (temporary)     may become GET no        temporary moves, maintenance
            307   Temporary Redirect    yes            no        temporary, POST must stay POST
            308   Permanent Redirect    yes            yes       permanent API moves keeping POST

            return 301 https://example.com$request_uri;
            rewrite ^/old$ /new permanent;    # 301
            rewrite ^/old$ /new redirect;     # 302
            `,
          note: 'Test with 302 first; browsers cache 301 aggressively and keep redirecting even after you fix the config.',
        },
        {
          title: 'Redirect map for a site migration',
          code: c`
            # http context; for hundreds of lines keep them in a file: include redirects.map;
            map $request_uri $redirect_to {
                default                     "";
                /about-us                   /about;
                /contact.html               /contact;
                ~^/blog/(?<slug>[^?]+)      /articles/$slug;
            }

            server {
                if ($redirect_to) {
                    return 301 $redirect_to;
                }
            }
            `,
          note: 'Lookups are a hash, so thousands of exact entries stay fast; raise map_hash_bucket_size if nginx -t complains about it.',
        },
      ],
    },

    {
      id: 'compression',
      title: 'Compression',
      group: 'Performance',
      items: [
        {
          title: 'gzip',
          code: c`
            # http context
            gzip on;
            gzip_vary on;                # Vary: Accept-Encoding for caches
            gzip_comp_level 5;           # 4–6 is the sweet spot
            gzip_min_length 1024;
            gzip_proxied any;            # also compress proxied responses
            gzip_types
                text/plain text/css text/xml text/javascript
                application/javascript application/json application/xml application/rss+xml
                application/manifest+json image/svg+xml font/ttf font/otf;

            gzip_static on;              # serve app.js.gz if your build created it
            `,
          note: 'text/html is always compressed and must not be listed. Do not compress images like PNG, JPEG or WebP; they are already compressed.',
        },
        {
          title: 'Brotli (module required)',
          code: c`
            # Debian 12 / Ubuntu 24.04: sudo apt install libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static
            # elsewhere: build the ngx_brotli dynamic module, then load it in the main context
            # load_module modules/ngx_http_brotli_filter_module.so;
            # load_module modules/ngx_http_brotli_static_module.so;

            brotli on;
            brotli_comp_level 5;
            brotli_static on;            # serve pre-compressed .br files
            brotli_types text/plain text/css text/javascript application/javascript application/json image/svg+xml;
            `,
          note: 'Brotli is not part of stock Nginx; if the module is missing, nginx -t fails with "unknown directive brotli". Keep gzip on as the fallback.',
        },
      ],
    },
    {
      id: 'tuning',
      title: 'Static caching & tuning',
      group: 'Performance',
      items: [
        {
          title: 'Browser caching for assets',
          code: c`
            # hashed files (app.3f9a1c.js) never change: cache forever
            location ~* \.(?:css|js|mjs|woff2?|png|jpe?g|gif|webp|avif|svg|ico)$ {
                expires 1y;
                add_header Cache-Control "public, max-age=31536000, immutable";
                access_log off;
                try_files $uri =404;
            }

            # HTML must be revalidated so new deploys show up immediately
            location = /index.html {
                add_header Cache-Control "no-cache";
            }
            `,
          note: 'Only use immutable for file names that contain a content hash; for unhashed files use a short expires like 1h or 7d.',
        },
        {
          title: 'File handling and open_file_cache',
          code: c`
            # http context
            sendfile on;              # kernel copies files directly to the socket
            tcp_nopush on;            # send headers and file start in one packet (with sendfile)
            tcp_nodelay on;
            keepalive_timeout 65;
            server_tokens off;

            open_file_cache max=10000 inactive=30s;
            open_file_cache_valid 60s;
            open_file_cache_min_uses 2;
            open_file_cache_errors on;
            `,
          note: 'open_file_cache caches file descriptors and metadata, not content; after a deploy, changed files may be served stale for up to open_file_cache_valid.',
        },
        {
          title: 'Workers and connections',
          code: c`
            # main context
            worker_processes auto;            # one per CPU core
            worker_rlimit_nofile 65535;       # open files per worker

            events {
                worker_connections 4096;      # per worker; a proxied request uses 2
                multi_accept on;
            }
            `,
          note: 'Max clients is roughly worker_processes × worker_connections (half that when proxying). The defaults are fine for most sites; tune only after measuring.',
        },
      ],
    },
    {
      id: 'proxy-cache',
      title: 'proxy_cache & microcaching',
      group: 'Performance',
      items: [
        {
          title: 'Cache backend responses',
          code: c`
            # http context
            proxy_cache_path /var/cache/nginx/app levels=1:2 keys_zone=app_cache:10m
                             max_size=1g inactive=60m use_temp_path=off;

            server {
                location / {
                    proxy_pass http://127.0.0.1:3000;
                    include snippets/proxy.conf;

                    proxy_cache app_cache;
                    proxy_cache_key $scheme$request_method$host$request_uri;
                    proxy_cache_valid 200 301 10m;
                    proxy_cache_valid 404 1m;
                    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
                    proxy_cache_background_update on;
                    proxy_cache_lock on;              # one request fills the cache, others wait
                    add_header X-Cache-Status $upstream_cache_status always;  # HIT, MISS, EXPIRED, BYPASS ...
                }
            }
            `,
          note: 'Nginx does not cache responses that set cookies or send Cache-Control: private/no-store by default, which protects you from caching personal pages.',
        },
        {
          title: 'Bypass the cache for logged-in users',
          code: c`
            # http context
            map $http_cookie $skip_cache {
                default                       0;
                ~*session|laravel_session     1;
                ~*wordpress_logged_in         1;
            }

            location / {
                proxy_cache app_cache;
                proxy_cache_bypass $skip_cache $arg_nocache;   # do not serve from cache
                proxy_no_cache     $skip_cache;                # do not store
                proxy_pass http://127.0.0.1:3000;
            }
            `,
        },
        {
          title: 'Microcaching (1 second)',
          code: c`
            proxy_cache_path /var/cache/nginx/micro keys_zone=micro:10m max_size=200m inactive=1m;

            location / {
                proxy_cache micro;
                proxy_cache_valid 200 1s;
                proxy_cache_use_stale updating;
                proxy_cache_lock on;
                proxy_cache_bypass $skip_cache;
                proxy_no_cache $skip_cache;
                proxy_pass http://127.0.0.1:3000;
            }
            `,
          note: 'Caching public pages for even one second turns a traffic spike of 1,000 requests per second into one backend request per second per URL.',
        },
        {
          title: 'fastcgi_cache for WordPress / PHP',
          code: c`
            # http context
            fastcgi_cache_path /var/cache/nginx/wp levels=1:2 keys_zone=wp:50m inactive=60m;
            fastcgi_cache_key $scheme$request_method$host$request_uri;

            location ~ \.php$ {
                include snippets/fastcgi-php.conf;
                fastcgi_pass unix:/run/php/php8.3-fpm.sock;
                fastcgi_cache wp;
                fastcgi_cache_valid 200 10m;
                fastcgi_cache_bypass $skip_cache;
                fastcgi_no_cache $skip_cache;
                add_header X-Cache-Status $upstream_cache_status;
            }
            `,
          note: 'Also bypass for POST requests, /wp-admin and /wp-login.php, and clear the cache when content changes (a purge plugin or deleting the cache folder).',
          then: [
            {
              label: 'Clear a cache (Linux)',
              lang: 'bash',
              code: c`
                sudo rm -rf /var/cache/nginx/wp/*
                curl -sI https://example.com/ | grep -i x-cache-status     # MISS, then HIT
                `,
            },
          ],
        },
      ],
    },

    {
      id: 'load-balancing',
      title: 'Load balancing',
      group: 'Load balancing',
      items: [
        {
          title: 'Round robin (default)',
          code: c`
            upstream app {
                server 10.0.0.11:3000;
                server 10.0.0.12:3000;
                server 10.0.0.13:3000;
                keepalive 32;
            }

            server {
                location / {
                    proxy_pass http://app;
                    proxy_http_version 1.1;
                    proxy_set_header Connection "";
                    proxy_set_header Host $host;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_next_upstream error timeout http_502 http_503;   # retry on another server
                }
            }
            `,
          note: 'proxy_next_upstream never retries non-idempotent requests like POST unless you add non_idempotent, which protects against duplicate orders.',
        },
        {
          title: 'Balancing methods',
          code: c`
            upstream app {
                least_conn;                    # fewest active connections (good for uneven request times)
                # ip_hash;                     # same client IP → same server (sticky-ish sessions)
                # hash $cookie_session consistent;   # stick by any key
                # random two least_conn;       # pick 2 at random, use the less busy
                server 10.0.0.11:3000;
                server 10.0.0.12:3000;
            }
            `,
          note: 'Prefer stateless apps (sessions in Redis or a database) over sticky sessions; ip_hash breaks down when many users share one IP behind a corporate NAT.',
        },
        {
          title: 'Weights, backup and passive health checks',
          code: c`
            upstream app {
                server 10.0.0.11:3000 weight=3;                       # gets 3× the traffic
                server 10.0.0.12:3000 max_fails=3 fail_timeout=30s;   # out for 30s after 3 failures
                server 10.0.0.13:3000 backup;                         # only when the others are down
                server 10.0.0.14:3000 down;                           # temporarily removed
            }
            `,
          note: 'Open source Nginx only has passive checks (real requests failing); active health checks with the health_check directive are an NGINX Plus feature, so expose a /health route and monitor it externally.',
        },
        {
          title: 'Zero-downtime deploy (blue / green)',
          code: c`
            # /etc/nginx/conf.d/app-upstream.conf  — the deploy script rewrites this one line
            upstream app { server 127.0.0.1:3001; }      # blue = 3001, green = 3002

            # site
            location / { proxy_pass http://app; include snippets/proxy.conf; }
            `,
          then: [
            {
              label: 'Deploy script (Linux)',
              lang: 'bash',
              code: c`
                # start the new version on the idle port, wait until healthy
                curl -fsS http://127.0.0.1:3002/health || exit 1
                echo 'upstream app { server 127.0.0.1:3002; }' | sudo tee /etc/nginx/conf.d/app-upstream.conf
                sudo nginx -t && sudo systemctl reload nginx     # graceful: in-flight requests finish on blue
                # stop the old version on 3001 after a short drain period
                `,
            },
          ],
          note: 'Because reload is graceful, switching the upstream and reloading drops no requests; with several servers you can also mark them down one at a time while you deploy.',
        },
        {
          title: 'Sessions across servers and real IPs',
          code: c`
            # each backend sees Nginx as the client: forward the real one
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

            # if Nginx itself sits behind a load balancer / CDN, restore the client IP first
            set_real_ip_from 10.0.0.0/8;          # your load balancer's range
            real_ip_header X-Forwarded-For;
            real_ip_recursive on;
            `,
          note: 'Only trust X-Forwarded-For from addresses you control; otherwise any client can spoof its IP and dodge rate limits.',
        },
      ],
    },

    {
      id: 'headers',
      title: 'Security headers',
      group: 'Security',
      items: [
        {
          title: 'Security headers snippet',
          code: c`
            # /etc/nginx/snippets/security-headers.conf
            add_header X-Frame-Options "SAMEORIGIN" always;
            add_header X-Content-Type-Options "nosniff" always;
            add_header Referrer-Policy "strict-origin-when-cross-origin" always;
            add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
            add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'" always;
            `,
          note: 'always adds the header to error responses too (4xx, 5xx). The CSP is a starter: run it as Content-Security-Policy-Report-Only first and loosen it for the CDNs and analytics you really use.',
        },
        {
          title: 'The add_header inheritance gotcha',
          code: c`
            server {
                include snippets/security-headers.conf;

                location /assets/ {
                    add_header Cache-Control "public, immutable";
                    # ⚠ all server-level add_header lines are now GONE for /assets/
                    include snippets/security-headers.conf;   # so include them again
                }
            }
            `,
          note: 'Any add_header in a level discards every inherited add_header. Recent mainline releases (1.29.x) add an add_header_inherit directive to change this, but the 1.28 stable line does not have it, so keep re-including the snippet.',
        },
        {
          title: 'Hide version and server details',
          code: c`
            # http context
            server_tokens off;                    # "Server: nginx" instead of "nginx/1.28.0", no version on error pages

            # hide headers your backend leaks
            proxy_hide_header X-Powered-By;
            fastcgi_hide_header X-Powered-By;
            `,
          then: [
            {
              label: 'Check',
              lang: 'bash',
              code: c`
                curl -sI https://example.com | grep -iE 'server|x-powered-by|strict|content-security'
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'access',
      title: 'Rate limits, auth & access control',
      group: 'Security',
      items: [
        {
          title: 'Rate limiting (login, API)',
          code: c`
            # http context: zone keyed by client IP, 10 MB holds ~160,000 IPs
            limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
            limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
            limit_req_status 429;

            server {
                location = /login {
                    limit_req zone=login burst=5 nodelay;
                    proxy_pass http://127.0.0.1:3000;
                }
                location /api/ {
                    limit_req zone=api burst=20 nodelay;   # absorb short spikes, reject beyond
                    proxy_pass http://127.0.0.1:3000;
                }
            }
            `,
          note: 'burst lets a queue of extra requests through and nodelay serves them immediately instead of spacing them out. Behind a CDN or load balancer, set up real_ip first or every user shares one limit.',
        },
        {
          title: 'Limit concurrent connections',
          code: c`
            # http context
            limit_conn_zone $binary_remote_addr zone=perip:10m;
            limit_conn_status 429;

            location /downloads/ {
                limit_conn perip 2;        # max 2 simultaneous downloads per IP
                limit_rate 1m;             # 1 MB/s per connection
            }
            `,
        },
        {
          title: 'Basic auth',
          code: c`
            location /admin/ {
                auth_basic "Restricted";
                auth_basic_user_file /etc/nginx/.htpasswd;
                proxy_pass http://127.0.0.1:3000;
            }

            location /.well-known/ { auth_basic off; }
            `,
          note: 'Basic auth sends credentials on every request, so only use it over HTTPS.',
          then: [
            {
              label: 'Create the password file (Linux)',
              lang: 'bash',
              code: c`
                sudo apt install -y apache2-utils          # Fedora/RHEL: sudo dnf install -y httpd-tools
                sudo htpasswd -c -B /etc/nginx/.htpasswd alice     # -c creates the file, -B bcrypt
                sudo htpasswd -B /etc/nginx/.htpasswd bob          # add another user
                sudo chown root:www-data /etc/nginx/.htpasswd && sudo chmod 640 /etc/nginx/.htpasswd
                `,
            },
            {
              label: 'macOS (htpasswd ships with macOS) or openssl anywhere',
              lang: 'bash',
              code: c`
                htpasswd -c -B /opt/homebrew/etc/nginx/.htpasswd alice
                # without htpasswd:
                printf "alice:$(openssl passwd -apr1)\n" | sudo tee -a /etc/nginx/.htpasswd
                `,
            },
            {
              label: 'Windows (PowerShell, via Docker or WSL)',
              lang: 'powershell',
              code: c`
                docker run --rm httpd:2.4-alpine htpasswd -nbB alice "S3cret!" | Out-File -Encoding ascii C:\nginx\conf\.htpasswd
                # or inside WSL: sudo apt install apache2-utils && htpasswd -c -B .htpasswd alice
                `,
            },
          ],
        },
        {
          title: 'IP allow / deny',
          code: c`
            location /admin/ {
                allow 203.0.113.10;          # office
                allow 10.0.0.0/8;            # VPN
                allow 127.0.0.1;
                deny all;                    # rules are checked in order, first match wins
            }

            # IP allowlist OR password
            location /staging/ {
                satisfy any;
                allow 203.0.113.10;
                deny all;
                auth_basic "Staging";
                auth_basic_user_file /etc/nginx/.htpasswd;
            }
            `,
        },
        {
          title: 'Block bad bots and scanners',
          code: c`
            # http context
            map $http_user_agent $bad_bot {
                default                         0;
                ""                              1;     # empty user agent
                ~*(sqlmap|nikto|masscan|zgrab)  1;
                ~*(ahrefsbot|semrushbot|mj12bot) 1;    # SEO crawlers, if you do not want them
            }

            server {
                if ($bad_bot) { return 403; }

                # common exploit probes on non-PHP sites
                location ~* \.(php|asp|aspx|cgi)$ { return 404; }
            }
            `,
          note: 'User agents are trivial to fake, so this only filters noise; rate limiting and a WAF or CDN do the real protection.',
        },
        {
          title: 'Deny .env, .git and backups',
          code: c`
            location ~ /\.(?!well-known) { deny all; }                 # .env, .git, .htaccess
            location ~* \.(sql|bak|old|orig|swp|log|ini|sh)$ { deny all; }
            location ~* (composer\.(json|lock)|package(-lock)?\.json)$ { deny all; }
            `,
          then: [
            {
              label: 'Verify (should be 403 or 404)',
              lang: 'bash',
              code: c`
                curl -I https://example.com/.env
                curl -I https://example.com/.git/config
                `,
            },
          ],
          note: 'Best of all, keep these files outside the web root (Laravel public/ pattern) so they cannot be served even if a rule is missing.',
        },
      ],
    },
    {
      id: 'cors',
      title: 'CORS for an API',
      group: 'Security',
      items: [
        {
          title: 'Allow specific origins with preflight',
          code: c`
            # http context: only echo back origins you trust
            map $http_origin $cors_origin {
                default                         "";
                https://example.com             $http_origin;
                https://admin.example.com       $http_origin;
                ~^http://localhost(:\d+)?$      $http_origin;   # local dev, remove in production
            }

            server {
                server_name api.example.com;

                location / {
                    if ($request_method = OPTIONS) {
                        add_header Access-Control-Allow-Origin $cors_origin always;
                        add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
                        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;
                        add_header Access-Control-Allow-Credentials "true" always;
                        add_header Access-Control-Max-Age 86400 always;
                        add_header Vary Origin always;
                        return 204;
                    }

                    add_header Access-Control-Allow-Origin $cors_origin always;
                    add_header Access-Control-Allow-Credentials "true" always;
                    add_header Vary Origin always;

                    proxy_pass http://127.0.0.1:3000;
                    include snippets/proxy.conf;
                }
            }
            `,
          note: 'When the origin is not in the map the header is empty and Nginx omits it, so the browser blocks the call. Never combine Allow-Credentials true with a literal * origin.',
        },
        {
          title: 'CORS pitfalls',
          lang: 'text',
          code: c`
            Header appears twice ("multiple values")  → set CORS in Nginx OR the app, not both
            Preflight 401/403                         → OPTIONS must not require auth; answer it in Nginx
            Header missing on errors                  → add "always" to every add_header
            Works in curl, fails in browser           → curl ignores CORS; check DevTools → Network
            Same-domain /api proxy                    → no CORS needed at all
            `,
        },
      ],
    },

    {
      id: 'logs',
      title: 'Logs & monitoring',
      group: 'Logs & monitoring',
      items: [
        {
          title: 'Where the logs are',
          lang: 'text',
          code: c`
            Linux (apt / dnf)       /var/log/nginx/access.log, error.log
            macOS (Apple Silicon)   /opt/homebrew/var/log/nginx/
            macOS (Intel)           /usr/local/var/log/nginx/
            Windows (zip)           C:\nginx\logs\
            Docker                  docker logs <container>   (symlinked to stdout / stderr)
            Startup failures        journalctl -u nginx  (Linux systemd)
            `,
        },
        {
          title: 'Per-site logs and levels',
          code: c`
            server {
                server_name example.com;
                access_log /var/log/nginx/example.access.log;
                error_log  /var/log/nginx/example.error.log warn;
            }

            # levels, most to least verbose:
            # debug (needs a --with-debug build) info notice warn error crit alert emerg
            `,
          note: 'error is the default level; raise it to info or debug only while investigating, as it is very chatty.',
        },
        {
          title: 'JSON log format',
          code: c`
            # http context
            log_format json_combined escape=json
              '{'
                '"time":"$time_iso8601",'
                '"remote_addr":"$remote_addr",'
                '"method":"$request_method",'
                '"uri":"$request_uri",'
                '"status":$status,'
                '"bytes":$body_bytes_sent,'
                '"request_time":$request_time,'
                '"upstream_time":"$upstream_response_time",'
                '"host":"$host",'
                '"referer":"$http_referer",'
                '"user_agent":"$http_user_agent",'
                '"xff":"$http_x_forwarded_for"'
              '}';

            access_log /var/log/nginx/access.json json_combined;
            `,
          note: 'JSON logs go straight into Loki, Elasticsearch, Datadog or CloudWatch without parsing rules; request_time and upstream_time show where slowness comes from.',
        },
        {
          title: 'Skip noisy requests',
          code: c`
            location = /health { access_log off; return 200 "ok\n"; }
            location ~* \.(css|js|png|jpg|svg|woff2|ico)$ { access_log off; expires 1y; }

            # conditional logging: only log errors
            map $status $loggable { ~^[23] 0; default 1; }
            access_log /var/log/nginx/errors-only.log combined if=$loggable;
            `,
        },
        {
          title: 'Reading logs (Linux / macOS)',
          lang: 'bash',
          code: c`
            sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
            sudo grep -E '" 5[0-9]{2} ' /var/log/nginx/access.log | tail -20      # recent 5xx
            sudo awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head    # top IPs
            sudo awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn           # status counts
            sudo awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head    # top URLs
            sudo zgrep ' 502 ' /var/log/nginx/access.log.*.gz                     # rotated logs
            `,
          note: 'On Windows read logs with Get-Content C:\\nginx\\logs\\error.log -Wait -Tail 50 in PowerShell.',
        },
        {
          title: 'GoAccess dashboard',
          lang: 'bash',
          code: c`
            sudo apt install -y goaccess            # macOS: brew install goaccess
            sudo goaccess /var/log/nginx/access.log --log-format=COMBINED          # terminal UI
            sudo goaccess /var/log/nginx/access.log --log-format=COMBINED -o /var/www/html/report.html
            `,
          note: 'Protect the generated report with basic auth or an IP allowlist; it reveals your visitors and URLs.',
        },
        {
          title: 'stub_status endpoint',
          code: c`
            server {
                listen 127.0.0.1:8081;
                location = /nginx_status {
                    stub_status;
                    allow 127.0.0.1;
                    deny all;
                }
            }
            `,
          then: [
            {
              label: 'Read it',
              lang: 'bash',
              code: c`
                curl http://127.0.0.1:8081/nginx_status
                # Active connections: 3
                # server accepts handled requests
                #  1024 1024 2048
                # Reading: 0 Writing: 1 Waiting: 2
                `,
            },
          ],
          note: 'Prometheus nginx-prometheus-exporter and most monitoring agents scrape this endpoint.',
        },
        {
          title: 'Log rotation',
          lang: 'bash',
          code: c`
            cat /etc/logrotate.d/nginx                  # installed by the package: daily/weekly, compressed
            sudo logrotate -d /etc/logrotate.d/nginx    # dry run
            sudo logrotate -f /etc/logrotate.d/nginx    # force a rotation now
            sudo nginx -s reopen                        # what postrotate does: reopen log files
            `,
          note: 'Custom log paths outside /var/log/nginx/*.log need their own logrotate rule, or they grow until the disk is full.',
        },
      ],
    },

    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      group: 'Troubleshooting',
      items: [
        {
          title: 'Error → cause → fix',
          lang: 'text',
          code: c`
            502 Bad Gateway          backend down / wrong port / wrong socket path or PHP version
                                     → curl the backend directly, check error.log "connect() failed"
                                     → SELinux (RHEL/Fedora): sudo setsebool -P httpd_can_network_connect 1
            504 Gateway Timeout      backend too slow → proxy_read_timeout / fastcgi_read_timeout
            413 Entity Too Large     client_max_body_size (default 1M) + app upload limits
            403 Forbidden            Nginx user cannot read files or traverse a parent dir (needs x)
                                     / no index file in a directory / allow-deny rule
            404 on SPA refresh       missing try_files $uri $uri/ /index.html
            404 for everything       wrong root, or another server block answers (check server_name)
            Too many redirects       app behind proxy/Cloudflare thinks it is on http
                                     → send X-Forwarded-Proto $scheme; Cloudflare SSL mode "Full (strict)"
            bind() ... Address already in use   another process owns port 80/443
            Changes not applied      forgot reload, edited sites-available without symlink, or nginx -t failed
            conflicting server name  same server_name + port in two files (often a leftover .bak or default)
            Mixed content            app builds http:// URLs → X-Forwarded-Proto + trust proxy in app
            unix:/... (13: Permission denied)   socket owner/group must allow www-data (listen.owner)
            `,
        },
        {
          title: 'Find what is using port 80',
          lang: 'bash',
          code: c`
            # Linux
            sudo ss -ltnp 'sport = :80'
            sudo systemctl stop apache2          # common culprit (httpd on Fedora/RHEL)

            # macOS
            sudo lsof -nP -iTCP:80 -sTCP:LISTEN
            `,
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                Get-NetTCPConnection -LocalPort 80 -State Listen | Select-Object OwningProcess
                Get-Process -Id (Get-NetTCPConnection -LocalPort 80 -State Listen).OwningProcess
                # PID 4 "System" = IIS / http.sys:  net stop http  (or stop the W3SVC service)
                `,
            },
          ],
        },
        {
          title: 'Debugging toolkit',
          lang: 'bash',
          code: c`
            sudo nginx -t                                   # syntax and file errors with line numbers
            sudo nginx -T | grep -nE 'server_name|listen'   # what is really loaded
            sudo tail -n 50 /var/log/nginx/error.log        # the real reason is almost always here
            curl -I http://127.0.0.1:3000                    # is the backend up at all?
            curl -I -H 'Host: example.com' http://127.0.0.1  # test a site before DNS points to it
            curl -vk --resolve example.com:443:127.0.0.1 https://example.com   # TLS + SNI locally
            namei -l /var/www/app/public/index.html          # permissions on every parent folder
            sudo -u www-data cat /var/www/app/public/index.html   # can the Nginx user read it?
            `,
        },
        {
          title: 'Behind Cloudflare or a load balancer',
          code: c`
            # restore real client IPs (keep the list current: cloudflare.com/ips)
            set_real_ip_from 173.245.48.0/20;
            set_real_ip_from 103.21.244.0/22;
            set_real_ip_from 2400:cb00::/32;
            # ... remaining Cloudflare ranges
            real_ip_header CF-Connecting-IP;

            # TLS terminated at the load balancer: pass the original scheme on
            map $http_x_forwarded_proto $forwarded_proto {
                default $http_x_forwarded_proto;
                ""      $scheme;
            }
            proxy_set_header X-Forwarded-Proto $forwarded_proto;
            `,
          note: 'Redirect loops usually mean Cloudflare connects over HTTP (Flexible mode) while Nginx redirects to HTTPS; switch to Full (strict) or redirect based on the forwarded protocol.',
        },
      ],
    },
  ],
}
