// Server steps shared by the AWS EC2 and GCP Compute Engine guides.
// Everything here runs ON the server (Ubuntu 24.04 LTS), whichever OS your laptop uses.
import { c } from './code.js'

export const connect = {
  id: 'connect',
  title: 'Connect to the server from your computer',
  items: [
    {
      title: 'Protect the private key file',
      code: c`
        # macOS / Linux
        chmod 400 ~/.ssh/app-key.pem

        # Windows (PowerShell) — remove inherited permissions, grant only yourself read
        icacls $env:USERPROFILE\.ssh\app-key.pem /inheritance:r
        icacls $env:USERPROFILE\.ssh\app-key.pem /grant:r "$($env:USERNAME):(R)"
        `,
      note: 'SSH refuses to use a key file that other users can read ("UNPROTECTED PRIVATE KEY FILE").',
    },
    {
      title: 'SSH in',
      code: c`
        # macOS / Linux (Terminal)
        ssh -i ~/.ssh/app-key.pem ubuntu@203.0.113.10

        # Windows (PowerShell / Windows Terminal — OpenSSH is built into Windows 10+)
        ssh -i $env:USERPROFILE\.ssh\app-key.pem ubuntu@203.0.113.10
        `,
      note: 'Replace the IP with your server\'s static IP. On Windows you can also use PuTTY or WSL (then follow the Linux commands).',
    },
    {
      title: 'Save a shortcut in ~/.ssh/config',
      lang: 'text',
      code: c`
        # macOS / Linux: ~/.ssh/config
        # Windows:       C:\Users\<you>\.ssh\config
        Host app
            HostName 203.0.113.10
            User ubuntu
            IdentityFile ~/.ssh/app-key.pem

        # then on any OS:
        ssh app
        `,
      note: 'Windows OpenSSH understands ~ in this file too.',
    },
    {
      title: 'Copy files to / from the server',
      code: c`
        # macOS / Linux / Windows PowerShell (same syntax)
        scp ./backup.sql app:/tmp/backup.sql
        scp app:/var/www/app/storage/logs/laravel.log .
        `,
    },
  ],
}

export const baseline = {
  id: 'baseline',
  title: 'Prepare the server (Linux)',
  items: [
    {
      title: 'Update and install essentials',
      code: c`
        sudo apt update && sudo apt upgrade -y
        sudo apt install -y git curl unzip nginx ufw unattended-upgrades
        sudo timedatectl set-timezone UTC
        `,
      note: 'All commands in this section run on the Ubuntu server, no matter which OS your own computer runs.',
    },
    {
      title: 'Add swap (small instances)',
      code: c`
        sudo fallocate -l 2G /swapfile
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile && sudo swapon /swapfile
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
        free -h
        `,
      note: 'Stops composer / npm builds from being killed for running out of memory on 1–2 GB machines.',
    },
    {
      title: 'Create a deploy user',
      code: c`
        sudo adduser --disabled-password --gecos "" deploy
        sudo usermod -aG www-data deploy
        sudo mkdir -p /home/deploy/.ssh
        sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
        sudo chown -R deploy:deploy /home/deploy/.ssh
        sudo chmod 700 /home/deploy/.ssh && sudo chmod 600 /home/deploy/.ssh/authorized_keys
        `,
      note: 'The app is owned and deployed by "deploy"; web processes run as "www-data". You can now SSH in as deploy@your-ip with the same key.',
    },
    {
      title: 'Host firewall',
      code: c`
        sudo ufw allow OpenSSH
        sudo ufw allow 'Nginx Full'
        sudo ufw enable
        sudo ufw status
        `,
      note: 'A second layer behind the cloud firewall / security group.',
    },
    {
      title: 'Deploy key for a private Git repo',
      code: c`
        sudo -iu deploy
        ssh-keygen -t ed25519 -C "deploy@app-server" -f ~/.ssh/id_ed25519 -N ""
        cat ~/.ssh/id_ed25519.pub
        # GitHub → repo → Settings → Deploy keys → Add key (read-only), paste the line above
        ssh -T git@github.com
        exit
        `,
    },
    {
      title: 'Clone the app',
      code: c`
        sudo mkdir -p /var/www/app
        sudo chown deploy:www-data /var/www/app
        sudo -iu deploy git clone git@github.com:your-org/your-app.git /var/www/app
        `,
    },
  ],
}

export const laravel = {
  id: 'laravel',
  title: 'Laravel / PHP app (PHP-FPM + Nginx)',
  items: [
    {
      title: 'Install PHP 8.3 and extensions',
      code: c`
        sudo apt install -y php8.3-fpm php8.3-cli php8.3-mysql php8.3-pgsql php8.3-sqlite3 \
          php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip php8.3-bcmath php8.3-intl php8.3-gd php8.3-redis
        php -v
        `,
      note: 'Ubuntu 24.04 ships PHP 8.3. For PHP 8.4:',
      then: [
        {
          label: 'PHP 8.4 instead',
          lang: 'bash',
          code: c`
            sudo add-apt-repository -y ppa:ondrej/php
            sudo apt update
            sudo apt install -y php8.4-fpm php8.4-cli php8.4-mysql php8.4-mbstring php8.4-xml php8.4-curl php8.4-zip php8.4-bcmath php8.4-intl
            # then use php8.4-fpm.sock in Nginx and php8.4-fpm in systemctl commands
            `,
        },
      ],
    },
    {
      title: 'Install Composer',
      code: c`
        cd /tmp
        php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
        sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer
        rm composer-setup.php
        composer --version
        `,
      note: 'getcomposer.org/download lists a checksum you can verify before running the installer.',
    },
    {
      title: 'Install dependencies and configure',
      code: c`
        sudo -iu deploy
        cd /var/www/app
        composer install --no-dev --optimize-autoloader
        cp .env.example .env
        php artisan key:generate
        nano .env
        `,
    },
    {
      title: 'Production .env essentials',
      lang: 'env',
      code: c`
        APP_NAME="My App"
        APP_ENV=production
        APP_DEBUG=false
        APP_URL=https://example.com

        LOG_CHANNEL=daily
        LOG_LEVEL=warning

        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_DATABASE=app
        DB_USERNAME=app
        DB_PASSWORD=change-me

        SESSION_DRIVER=database
        CACHE_STORE=database
        QUEUE_CONNECTION=database
        `,
      note: 'Database, storage and queue settings for RDS / S3 / SQS (or Cloud SQL / GCS / Pub/Sub) are covered in the later steps of the AWS and GCP sheets. Keep the file private:',
      then: [
        {
          label: 'Then run',
          lang: 'bash',
          code: c`
            chmod 600 .env
            `,
        },
      ],
    },
    {
      title: 'Build frontend assets (Vite)',
      code: c`
        # install Node first — see the Node.js step
        npm ci
        npm run build
        `,
      note: 'Skip if the app is API-only.',
    },
    {
      title: 'File permissions',
      code: c`
        cd /var/www/app
        sudo chown -R deploy:www-data .
        sudo find . -type f -exec chmod 644 {} \;
        sudo find . -type d -exec chmod 755 {} \;
        sudo chmod -R ug+rwx storage bootstrap/cache
        chmod 600 .env
        `,
      note: 'storage/ and bootstrap/cache/ must be writable by www-data (PHP-FPM, queue workers).',
    },
    {
      title: 'Migrate and cache',
      code: c`
        php artisan migrate --force
        php artisan storage:link
        php artisan optimize        # caches config, routes, views and events
        `,
    },
    {
      title: 'Nginx site',
      lang: 'nginx',
      code: c`
        # /etc/nginx/sites-available/app
        server {
            listen 80;
            server_name example.com www.example.com;
            root /var/www/app/public;
            index index.php;
            client_max_body_size 20M;

            add_header X-Frame-Options "SAMEORIGIN";
            add_header X-Content-Type-Options "nosniff";

            location / {
                try_files $uri $uri/ /index.php?$query_string;
            }

            location ~ \.php$ {
                include snippets/fastcgi-php.conf;
                fastcgi_pass unix:/run/php/php8.3-fpm.sock;
                fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
            }

            location ~ /\.(?!well-known).* {
                deny all;
            }
        }
        `,
    },
    {
      title: 'Enable the site',
      code: c`
        sudo nano /etc/nginx/sites-available/app      # paste the config above
        sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/
        sudo rm /etc/nginx/sites-enabled/default
        sudo nginx -t && sudo systemctl reload nginx
        `,
      note: 'Visit http://your-ip — you should see the app.',
    },
    {
      title: 'Queue worker as a systemd service',
      lang: 'ini',
      code: c`
        # /etc/systemd/system/app-worker.service
        [Unit]
        Description=Laravel queue worker
        After=network.target

        [Service]
        User=www-data
        Group=www-data
        WorkingDirectory=/var/www/app
        ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=3 --max-time=3600
        Restart=always
        RestartSec=5

        [Install]
        WantedBy=multi-user.target
        `,
    },
    {
      title: 'Start the worker',
      code: c`
        sudo systemctl daemon-reload
        sudo systemctl enable --now app-worker
        sudo systemctl status app-worker
        journalctl -u app-worker -f
        `,
      note: 'After each deploy, restart the worker so it loads the new code (systemd starts a fresh one):',
      then: [
        {
          label: 'After each deploy',
          lang: 'bash',
          code: c`
            php artisan queue:restart
            `,
        },
      ],
    },
    {
      title: 'Scheduler (cron)',
      code: c`
        sudo crontab -u www-data -e
        # add this line:
        * * * * * cd /var/www/app && php artisan schedule:run >> /dev/null 2>&1
        `,
    },
    {
      title: 'OPcache for production',
      lang: 'ini',
      code: c`
        ; /etc/php/8.3/fpm/conf.d/99-production.ini
        opcache.enable=1
        opcache.memory_consumption=192
        opcache.max_accelerated_files=20000
        opcache.validate_timestamps=0
        `,
      note: 'With validate_timestamps=0 PHP never re-reads changed files, so reload PHP-FPM on every deploy (the deploy script does this):',
      then: [
        {
          label: 'After each deploy',
          lang: 'bash',
          code: c`
            sudo systemctl reload php8.3-fpm
            `,
        },
      ],
    },
  ],
}

export const node = {
  id: 'node',
  title: 'Node.js app (PM2 + Nginx)',
  items: [
    {
      title: 'Install Node.js 24 LTS',
      code: c`
        curl -fsSL https://deb.nodesource.com/setup_24.x -o /tmp/nodesource_setup.sh
        sudo bash /tmp/nodesource_setup.sh
        sudo apt install -y nodejs
        node -v && npm -v
        `,
    },
    {
      title: 'Install dependencies and build',
      code: c`
        sudo -iu deploy
        cd /var/www/app
        npm ci
        npm run build --if-present
        npm prune --omit=dev
        `,
    },
    {
      title: 'Environment file',
      lang: 'env',
      code: c`
        # /var/www/app/.env   (chmod 600 .env)
        NODE_ENV=production
        PORT=3000
        DATABASE_URL=mysql://app:change-me@127.0.0.1:3306/app
        `,
      note: 'Make sure the app listens on process.env.PORT and calls app.set("trust proxy", 1) in Express since it sits behind Nginx.',
    },
    {
      title: 'PM2 process file',
      lang: 'js',
      code: c`
        // /var/www/app/ecosystem.config.cjs
        module.exports = {
          apps: [
            {
              name: 'api',
              script: 'src/server.js',
              instances: 'max',          // one per CPU core
              exec_mode: 'cluster',
              node_args: '--env-file=.env',
              max_memory_restart: '400M',
            },
          ],
        }
        `,
    },
    {
      title: 'Start with PM2 and survive reboots',
      code: c`
        sudo npm install -g pm2
        cd /var/www/app
        pm2 start ecosystem.config.cjs
        pm2 save
        pm2 startup systemd -u deploy --hp /home/deploy
        # PM2 prints a "sudo env PATH=..." command — copy and run it
        `,
    },
    {
      title: 'Nginx reverse proxy',
      lang: 'nginx',
      code: c`
        # /etc/nginx/sites-available/app
        server {
            listen 80;
            server_name api.example.com;
            client_max_body_size 20M;

            location / {
                proxy_pass http://127.0.0.1:3000;
                proxy_http_version 1.1;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
                proxy_set_header Upgrade $http_upgrade;     # WebSockets
                proxy_set_header Connection "upgrade";
            }
        }
        `,
      then: [{
        label: 'Enable it',
        lang: 'bash',
        code: c`
          sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/
          sudo rm -f /etc/nginx/sites-enabled/default
          sudo nginx -t && sudo systemctl reload nginx
          `,
      }],
    },
    {
      title: 'Static frontend (React / Vite build)',
      lang: 'nginx',
      code: c`
        server {
            listen 80;
            server_name example.com;
            root /var/www/app/dist;

            location / {
                try_files $uri /index.html;     # client-side routing
            }

            location /assets/ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }
        `,
    },
    {
      title: 'Everyday PM2',
      code: c`
        pm2 status
        pm2 logs api --lines 100
        pm2 reload api            # zero-downtime restart in cluster mode
        pm2 monit
        `,
    },
  ],
}

export const python = {
  id: 'python',
  title: 'Python app — Django or FastAPI (Gunicorn / Uvicorn + Nginx)',
  items: [
    {
      title: 'Install Python tooling',
      code: c`
        sudo apt install -y python3 python3-venv python3-dev build-essential pkg-config \
          libpq-dev default-libmysqlclient-dev
        python3 --version
        `,
      note: 'Ubuntu 24.04 ships Python 3.12. The -dev libraries let mysqlclient / psycopg compile.',
    },
    {
      title: 'Virtual environment and dependencies',
      code: c`
        sudo -iu deploy
        cd /var/www/app
        python3 -m venv .venv
        source .venv/bin/activate
        pip install --upgrade pip
        pip install -r requirements.txt
        pip install gunicorn               # Django
        pip install "uvicorn[standard]"    # FastAPI
        `,
      note: 'On the server this is always the Linux command. Windows/macOS equivalents for your own machine are in the Python sheet.',
    },
    {
      title: 'Environment file',
      lang: 'env',
      code: c`
        # /var/www/app/.env   (chmod 600 .env)
        DJANGO_SETTINGS_MODULE=config.settings
        SECRET_KEY=generate-a-long-random-string
        DEBUG=False
        ALLOWED_HOSTS=example.com,www.example.com
        DB_HOST=127.0.0.1
        DB_NAME=app
        DB_USER=app
        DB_PASSWORD=change-me
        `,
      note: 'systemd loads this file with EnvironmentFile=, so values are available via os.environ.',
    },
    {
      title: 'Django production settings',
      lang: 'python',
      code: c`
        import os

        DEBUG = os.environ.get("DEBUG") == "True"
        SECRET_KEY = os.environ["SECRET_KEY"]
        ALLOWED_HOSTS = os.environ["ALLOWED_HOSTS"].split(",")
        CSRF_TRUSTED_ORIGINS = ["https://" + h for h in ALLOWED_HOSTS]

        STATIC_ROOT = BASE_DIR / "staticfiles"
        MEDIA_ROOT = BASE_DIR / "media"

        SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
        SESSION_COOKIE_SECURE = True
        CSRF_COOKIE_SECURE = True
        `,
    },
    {
      title: 'Django: migrate and collect static',
      code: c`
        source .venv/bin/activate
        set -a && source .env && set +a      # load .env into this shell
        python manage.py migrate
        python manage.py collectstatic --noinput
        python manage.py check --deploy
        `,
    },
    {
      title: 'systemd service — Django (Gunicorn)',
      lang: 'ini',
      code: c`
        # /etc/systemd/system/app.service
        [Unit]
        Description=Django app (gunicorn)
        After=network.target

        [Service]
        User=deploy
        Group=www-data
        WorkingDirectory=/var/www/app
        EnvironmentFile=/var/www/app/.env
        ExecStart=/var/www/app/.venv/bin/gunicorn config.wsgi:application --workers 3 --bind 127.0.0.1:8000 --access-logfile -
        Restart=always

        [Install]
        WantedBy=multi-user.target
        `,
      note: 'Rule of thumb: workers = 2 × CPU cores + 1. Replace config.wsgi with your project\'s module.',
    },
    {
      title: 'systemd service — FastAPI (Uvicorn)',
      lang: 'ini',
      code: c`
        # /etc/systemd/system/app.service
        [Unit]
        Description=FastAPI app (uvicorn)
        After=network.target

        [Service]
        User=deploy
        Group=www-data
        WorkingDirectory=/var/www/app
        EnvironmentFile=/var/www/app/.env
        ExecStart=/var/www/app/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2 --proxy-headers --forwarded-allow-ips=127.0.0.1
        Restart=always

        [Install]
        WantedBy=multi-user.target
        `,
    },
    {
      title: 'Start the service',
      code: c`
        sudo systemctl daemon-reload
        sudo systemctl enable --now app
        sudo systemctl status app
        journalctl -u app -f
        curl -I http://127.0.0.1:8000
        `,
    },
    {
      title: 'Nginx reverse proxy',
      lang: 'nginx',
      code: c`
        # /etc/nginx/sites-available/app
        server {
            listen 80;
            server_name example.com www.example.com;
            client_max_body_size 20M;

            location /static/ { alias /var/www/app/staticfiles/; }   # Django
            location /media/  { alias /var/www/app/media/; }         # Django uploads

            location / {
                proxy_pass http://127.0.0.1:8000;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }
        }
        `,
      then: [{
        label: 'Enable it',
        lang: 'bash',
        code: c`
          sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/
          sudo rm -f /etc/nginx/sites-enabled/default
          sudo nginx -t && sudo systemctl reload nginx
          `,
      }],
    },
    {
      title: 'Background worker (Celery)',
      lang: 'ini',
      code: c`
        # /etc/systemd/system/app-worker.service
        [Unit]
        Description=Celery worker
        After=network.target

        [Service]
        User=deploy
        WorkingDirectory=/var/www/app
        EnvironmentFile=/var/www/app/.env
        ExecStart=/var/www/app/.venv/bin/celery -A config worker --loglevel=info --concurrency=2
        Restart=always

        [Install]
        WantedBy=multi-user.target
        `,
      then: [
        {
          label: 'Start it',
          lang: 'bash',
          code: c`
            sudo systemctl daemon-reload
            sudo systemctl enable --now app-worker
            `,
        },
      ],
    },
  ],
}

export const react = {
  id: 'react',
  title: 'React app (static build + Nginx)',
  items: [
    {
      title: 'How a React app is served',
      lang: 'text',
      code: c`
        npm run build  →  dist/index.html + dist/assets/index-[hash].js / .css
        Nginx serves those files directly: no Node process runs in production.

        Browser ──▶ Nginx ──▶ /var/www/app/dist/            (the React app)
                         └──▶ /api/* → 127.0.0.1:3000/8000   (optional: your backend)
        `,
      note: 'This covers Vite apps (React, Vue, Svelte…) and Create React App. Next.js with server rendering is a Node app: use the Node.js step with PM2 instead.',
    },
    {
      title: 'Production environment variables',
      lang: 'env',
      code: c`
        # /var/www/app/.env.production   (read by "npm run build")
        VITE_API_URL=https://example.com/api
        VITE_APP_NAME="My App"
        `,
      note: 'VITE_ variables are baked into the JavaScript at build time, so rebuild after changing them. Never put secrets here, because anyone can read them in the browser.',
    },
    {
      title: 'Option A: build on the server',
      code: c`
        # install Node.js 24 LTS once (on the server)
        curl -fsSL https://deb.nodesource.com/setup_24.x -o /tmp/nodesource_setup.sh
        sudo bash /tmp/nodesource_setup.sh
        sudo apt install -y nodejs

        # build
        sudo -iu deploy
        cd /var/www/app
        npm ci
        npm run build          # creates /var/www/app/dist
        ls dist
        `,
      note: 'Simple, but the build needs RAM. On 1–2 GB servers, add swap (step "Prepare the server") or use option B.',
    },
    {
      title: 'Option B: build on your computer (or CI) and upload',
      code: c`
        npm ci
        npm run build

        # macOS / Linux / WSL: rsync uploads only changed files and removes old ones
        rsync -avz --delete dist/ deploy@203.0.113.10:/var/www/app/dist/

        # Windows (PowerShell): scp is built in (no rsync)
        ssh deploy@203.0.113.10 "rm -rf /var/www/app/dist && mkdir -p /var/www/app/dist"
        scp -r .\dist\* deploy@203.0.113.10:/var/www/app/dist/
        `,
      note: 'The server then only needs Nginx, with no Node.js and no node_modules.',
    },
    {
      title: 'Folder and permissions (on the server)',
      code: c`
        sudo mkdir -p /var/www/app/dist
        sudo chown -R deploy:www-data /var/www/app
        sudo find /var/www/app/dist -type d -exec chmod 755 {} \;
        sudo find /var/www/app/dist -type f -exec chmod 644 {} \;
        `,
      note: 'Nginx (www-data) only needs to read the files.',
    },
    {
      title: 'Shared security headers snippet',
      lang: 'nginx',
      code: c`
        # /etc/nginx/snippets/security-headers.conf
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
        `,
      note: 'Nginx drops server-level add_header lines inside any location that has its own add_header, so the config below includes this file in every location.',
    },
    {
      title: 'Nginx site for a React app',
      lang: 'nginx',
      code: c`
        # /etc/nginx/sites-available/react-app
        server {
            listen 80;
            listen [::]:80;
            server_name example.com www.example.com;

            root /var/www/app/dist;
            index index.html;

            access_log /var/log/nginx/react-app.access.log;
            error_log  /var/log/nginx/react-app.error.log;

            # compress text assets
            gzip on;
            gzip_comp_level 6;
            gzip_min_length 1024;
            gzip_types text/plain text/css application/javascript application/json image/svg+xml;

            include snippets/security-headers.conf;

            # React Router (BrowserRouter): unknown paths load index.html, so /products/42 works on refresh
            location / {
                try_files $uri $uri/ /index.html;
            }

            # hashed build files never change, so cache them for a year
            location /assets/ {
                expires 1y;
                add_header Cache-Control "public, immutable";
                include snippets/security-headers.conf;
                try_files $uri =404;
            }

            # always fetch the latest index.html so users get new deploys immediately
            location = /index.html {
                add_header Cache-Control "no-cache";
                include snippets/security-headers.conf;
            }

            # never serve dotfiles (.env, .git)
            location ~ /\.(?!well-known) {
                deny all;
            }
        }
        `,
    },
    {
      title: 'Enable the site and test',
      code: c`
        sudo nano /etc/nginx/snippets/security-headers.conf      # paste the snippet
        sudo nano /etc/nginx/sites-available/react-app           # paste the site config
        sudo ln -s /etc/nginx/sites-available/react-app /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        sudo nginx -t && sudo systemctl reload nginx

        curl -I http://localhost/                    # 200, Cache-Control: no-cache
        curl -I http://localhost/products/42         # 200 (served by index.html)
        curl -I http://localhost/assets/index-abc123.js   # use a real file from dist/assets: Cache-Control immutable
        `,
      note: 'Then add HTTPS with Certbot, exactly as in the HTTPS step:',
      then: [
        {
          label: 'HTTPS',
          lang: 'bash',
          code: c`
            sudo certbot --nginx -d example.com -d www.example.com
            `,
        },
      ],
    },
    {
      title: 'React + API on the same domain',
      lang: 'nginx',
      code: c`
        # inside the same server { } block, next to location /
        location /api/ {
            proxy_pass http://127.0.0.1:3000;          # Node (PM2) — or :8000 for Django / FastAPI
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Upgrade $http_upgrade;     # WebSockets
            proxy_set_header Connection "upgrade";
        }
        `,
      note: 'The browser calls /api/... on the same origin, so there is no CORS to configure. proxy_pass without a trailing slash keeps the /api prefix. Use http://127.0.0.1:3000/ to strip it. Point the React build at it:',
      then: [
        {
          label: '.env.production',
          lang: 'env',
          code: c`
            VITE_API_URL=/api
            `,
        },
      ],
    },
    {
      title: 'React + Laravel API on one domain',
      lang: 'nginx',
      code: c`
        server {
            listen 80;
            server_name example.com;
            root /var/www/app/dist;                    # React build
            index index.html;

            location / {
                try_files $uri $uri/ /index.html;
            }

            # Laravel lives in /var/www/api; its routes/api.php answers under /api
            location /api {
                root /var/www/api/public;
                try_files $uri /index.php?$query_string;
            }

            location ~ ^/index\.php$ {
                root /var/www/api/public;
                include snippets/fastcgi-php.conf;
                fastcgi_pass unix:/run/php/php8.3-fpm.sock;
                fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
            }
        }
        `,
      note: 'Simpler alternative: put the API on its own subdomain (api.example.com) with the Laravel site config from step "Laravel / PHP app", and allow https://example.com in config/cors.php.',
    },
    {
      title: 'Serve under a subpath (example.com/app/)',
      code: c`
        // vite.config.js — build with the subpath
        export default defineConfig({ base: '/app/', plugins: [react()] })

        // React Router
        <BrowserRouter basename="/app">

        # Nginx
        location /app/ {
            alias /var/www/app/dist/;
            try_files $uri $uri/ /app/index.html;
        }
        `,
      lang: 'text',
    },
    {
      title: 'Troubleshooting',
      lang: 'text',
      code: c`
        404 when refreshing /some/page   → missing "try_files $uri $uri/ /index.html"
        Blank page, 404 on /assets/...   → wrong "base" in vite.config.js, or dist/ not uploaded
        Old version after deploy         → index.html cached: check the no-cache location
        API calls go to localhost        → VITE_API_URL was wrong at build time: fix .env.production, rebuild
        Mixed content errors             → API URL is http:// on an https:// site
        403 Forbidden                    → permissions: Nginx (www-data) cannot read dist/

        sudo tail -f /var/log/nginx/react-app.error.log
        `,
    },
  ],
}

export const https = {
  id: 'https',
  title: 'HTTPS with Let\'s Encrypt',
  items: [
    {
      title: 'Check DNS points at the server',
      code: c`
        # macOS / Linux
        dig +short example.com

        # Windows (PowerShell)
        Resolve-DnsName example.com -Type A
        `,
      note: 'Must print your static IP before requesting a certificate.',
    },
    {
      title: 'Get a certificate (on the server)',
      code: c`
        sudo apt install -y certbot python3-certbot-nginx
        sudo certbot --nginx -d example.com -d www.example.com \
          --redirect --agree-tos -m you@example.com
        `,
      note: 'Certbot edits your Nginx config to listen on 443 and redirect HTTP to HTTPS.',
    },
    {
      title: 'Auto-renewal',
      code: c`
        sudo certbot renew --dry-run
        systemctl list-timers | grep certbot
        `,
      note: 'A systemd timer renews certificates automatically before they expire.',
    },
    {
      title: 'Tell the app it is on HTTPS',
      lang: 'text',
      code: c`
        Laravel  → APP_URL=https://example.com, then php artisan optimize
        Django   → SECURE_PROXY_SSL_HEADER + *_COOKIE_SECURE (see Python step)
        Express  → app.set('trust proxy', 1) so req.secure / req.ip are correct
        `,
    },
  ],
}

const GH = '${{' // GitHub Actions expression opener (avoids template interpolation)

export const deploy = {
  id: 'deploy',
  title: 'Deploy updates',
  items: [
    {
      title: 'Let deploy restart services without a password',
      code: c`
        sudo visudo -f /etc/sudoers.d/deploy
        # add (adjust to the services you actually use):
        deploy ALL=(root) NOPASSWD: /usr/bin/systemctl reload php8.3-fpm, /usr/bin/systemctl restart app, /usr/bin/systemctl restart app-worker, /usr/bin/systemctl reload nginx
        `,
    },
    {
      title: 'Laravel deploy script',
      code: c`
        #!/usr/bin/env bash
        # /var/www/app/deploy.sh   (chmod +x deploy.sh)
        set -euo pipefail
        cd /var/www/app

        php artisan down --retry=60 || true
        trap 'php artisan up' EXIT          # always bring the site back up

        git pull --ff-only origin main
        composer install --no-dev --optimize-autoloader --no-interaction
        npm ci && npm run build             # remove if you don't use Vite
        php artisan migrate --force
        php artisan optimize
        php artisan queue:restart
        sudo systemctl reload php8.3-fpm
        `,
    },
    {
      title: 'Node deploy script',
      code: c`
        #!/usr/bin/env bash
        set -euo pipefail
        cd /var/www/app

        git pull --ff-only origin main
        npm ci
        npm run build --if-present
        npm prune --omit=dev
        pm2 reload ecosystem.config.cjs --update-env
        `,
    },
    {
      title: 'Python deploy script',
      code: c`
        #!/usr/bin/env bash
        set -euo pipefail
        cd /var/www/app

        git pull --ff-only origin main
        .venv/bin/pip install -r requirements.txt
        set -a && source .env && set +a
        .venv/bin/python manage.py migrate --noinput          # Django only
        .venv/bin/python manage.py collectstatic --noinput    # Django only
        sudo systemctl restart app
        `,
    },
    {
      title: 'React deploy script (zero downtime)',
      code: c`
        #!/usr/bin/env bash
        set -euo pipefail
        cd /var/www/app

        git pull --ff-only origin main
        npm ci
        npm run build -- --outDir dist-new      # build next to the live site

        rm -rf dist-old
        [ -d dist ] && mv dist dist-old         # keep the previous build for rollback
        mv dist-new dist                        # switch: Nginx serves the new files at once
        `,
      note: 'No restart needed, because Nginx just reads the new files. Roll back with: rm -rf dist && mv dist-old dist.',
    },
    {
      title: 'Run a deploy from your computer',
      code: c`
        # macOS / Linux / Windows PowerShell
        ssh deploy@203.0.113.10 "bash /var/www/app/deploy.sh"
        `,
    },
    {
      title: 'Zero-downtime releases',
      note: 'For larger apps, deploy each release into its own folder (releases/2026-10-17-1200) and switch a "current" symlink once it is ready. Tools like Deployer (PHP), Laravel Envoy or PM2 deploy do this for you.',
    },
  ],
}

export const cicd = {
  id: 'cicd',
  title: 'CI/CD with GitHub Actions',
  items: [
    {
      title: 'The pipeline',
      lang: 'text',
      code: c`
        pull request / push ──▶ CI: install → lint → test → build        (every branch)
                                           │ all green
        merge to main ─────────▶ CD: deploy to staging ──▶ approve ──▶ deploy to production
                                                                           │
                                                             smoke test (curl /health) → done
        `,
      note: 'Workflows live in .github/workflows/*.yml in your repo. GitHub runs them on its own Linux machines, so they work the same whatever OS you develop on.',
    },
    {
      title: '1. SSH key for the pipeline',
      code: c`
        # macOS / Linux
        ssh-keygen -t ed25519 -f ./gh-deploy -N "" -C "github-actions"

        # Windows (PowerShell)
        ssh-keygen -t ed25519 -f .\gh-deploy -C "github-actions"   # press Enter twice for no passphrase

        # allow it on the server (any OS, appends the public key for the deploy user)
        ssh deploy@203.0.113.10 "cat >> ~/.ssh/authorized_keys" < gh-deploy.pub          # macOS / Linux / cmd
        Get-Content gh-deploy.pub | ssh deploy@203.0.113.10 "cat >> ~/.ssh/authorized_keys"   # PowerShell
        `,
      note: 'Use a dedicated key for CI only, so you can revoke it without touching your own access.',
    },
    {
      title: '2. Store secrets in GitHub',
      code: c`
        # install the GitHub CLI: brew install gh | sudo apt install gh | winget install -e --id GitHub.cli
        gh auth login

        # macOS / Linux
        gh secret set DEPLOY_SSH_KEY < gh-deploy
        ssh-keyscan -H 203.0.113.10 | gh secret set DEPLOY_KNOWN_HOSTS
        gh secret set DEPLOY_HOST --body "203.0.113.10"

        # Windows (PowerShell)
        Get-Content gh-deploy -Raw | gh secret set DEPLOY_SSH_KEY
        ssh-keyscan -H 203.0.113.10 | gh secret set DEPLOY_KNOWN_HOSTS
        gh secret set DEPLOY_HOST --body "203.0.113.10"

        # then delete the local key files
        `,
      note: 'Or use the web UI: repo → Settings → Secrets and variables → Actions. Storing known_hosts as a secret means CI verifies the server instead of trusting whatever answers.',
    },
    {
      title: 'CI: Laravel',
      lang: 'yaml',
      code: c`
        # .github/workflows/ci.yml
        name: CI
        on:
          pull_request:
          push:
            branches: [main]

        jobs:
          test:
            runs-on: ubuntu-latest
            services:
              mysql:
                image: mysql:8.4
                env:
                  MYSQL_ROOT_PASSWORD: secret
                  MYSQL_DATABASE: testing
                ports: ['3306:3306']
                options: >-
                  --health-cmd="mysqladmin ping -h 127.0.0.1" --health-interval=10s --health-timeout=5s --health-retries=5
            env:
              DB_CONNECTION: mysql
              DB_HOST: 127.0.0.1
              DB_DATABASE: testing
              DB_USERNAME: root
              DB_PASSWORD: secret
            steps:
              - uses: actions/checkout@v4
              - uses: shivammathur/setup-php@v2
                with:
                  php-version: '8.3'
                  extensions: mbstring, pdo_mysql, intl, bcmath
                  coverage: none
              - uses: actions/setup-node@v4
                with:
                  node-version: 24
                  cache: npm
              - name: Cache Composer packages
                uses: actions/cache@v4
                with:
                  path: vendor
                  key: composer-${GH} hashFiles('composer.lock') }}
              - run: composer install --no-interaction --prefer-dist
              - run: cp .env.example .env && php artisan key:generate
              - run: npm ci && npm run build
              - run: ./vendor/bin/pint --test          # code style
              - run: php artisan test
        `,
    },
    {
      title: 'CI: Node.js + Sequelize',
      lang: 'yaml',
      code: c`
        # .github/workflows/ci.yml
        name: CI
        on:
          pull_request:
          push:
            branches: [main]

        jobs:
          test:
            runs-on: ubuntu-latest
            strategy:
              matrix:
                node: [22, 24]                       # test on both LTS lines
            services:
              mysql:
                image: mysql:8.4
                env:
                  MYSQL_ROOT_PASSWORD: secret
                  MYSQL_DATABASE: app_test
                ports: ['3306:3306']
                options: >-
                  --health-cmd="mysqladmin ping -h 127.0.0.1" --health-interval=10s --health-timeout=5s --health-retries=5
            env:
              DATABASE_URL: mysql://root:secret@127.0.0.1:3306/app_test
              NODE_ENV: test
            steps:
              - uses: actions/checkout@v4
              - uses: actions/setup-node@v4
                with:
                  node-version: ${GH} matrix.node }}
                  cache: npm
              - run: npm ci
              - run: npm run lint
              - run: npx sequelize-cli db:migrate --env test
              - run: npm test
        `,
    },
    {
      title: 'CI: Python (Django / FastAPI)',
      lang: 'yaml',
      code: c`
        # .github/workflows/ci.yml
        name: CI
        on:
          pull_request:
          push:
            branches: [main]

        jobs:
          test:
            runs-on: ubuntu-latest
            services:
              postgres:
                image: postgres:17
                env:
                  POSTGRES_PASSWORD: secret
                  POSTGRES_DB: app_test
                ports: ['5432:5432']
                options: >-
                  --health-cmd="pg_isready" --health-interval=10s --health-timeout=5s --health-retries=5
            env:
              DATABASE_URL: postgres://postgres:secret@127.0.0.1:5432/app_test
              SECRET_KEY: ci-only-secret
            steps:
              - uses: actions/checkout@v4
              - uses: actions/setup-python@v5
                with:
                  python-version: '3.12'
                  cache: pip
              - run: pip install -r requirements.txt ruff pytest
              - run: ruff check .
              - run: python manage.py migrate      # Django only
              - run: pytest -q
        `,
    },
    {
      title: 'CI: React (Vite)',
      lang: 'yaml',
      code: c`
        # .github/workflows/ci.yml
        name: CI
        on:
          pull_request:
          push:
            branches: [main]

        jobs:
          build:
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@v4
              - uses: actions/setup-node@v4
                with:
                  node-version: 24
                  cache: npm
              - run: npm ci
              - run: npm run lint
              - run: npx tsc --noEmit --pretty         # TypeScript projects
              - run: npx vitest run                    # if you have tests
              - run: npm run build
                env:
                  VITE_API_URL: ${GH} vars.VITE_API_URL }}
              - uses: actions/upload-artifact@v4
                with:
                  name: dist
                  path: dist
        `,
      note: 'vars.* are non-secret "variables" (Settings → Secrets and variables → Actions → Variables). The dist artifact can be downloaded from the run page or by a deploy job.',
    },
    {
      title: 'CD: deploy over SSH after tests pass',
      lang: 'yaml',
      code: c`
        # .github/workflows/deploy.yml
        name: Deploy
        on:
          push:
            branches: [main]

        concurrency:
          group: deploy-production            # never run two deploys at once
          cancel-in-progress: false

        jobs:
          test:
            uses: ./.github/workflows/ci.yml   # reuse CI (add "workflow_call:" to ci.yml's "on:")

          deploy:
            needs: test
            runs-on: ubuntu-latest
            environment:
              name: production
              url: https://example.com
            steps:
              - name: Set up SSH
                run: |
                  mkdir -p ~/.ssh
                  echo "${GH} secrets.DEPLOY_SSH_KEY }}" > ~/.ssh/id_ed25519
                  chmod 600 ~/.ssh/id_ed25519
                  echo "${GH} secrets.DEPLOY_KNOWN_HOSTS }}" > ~/.ssh/known_hosts
              - name: Run deploy script
                run: ssh deploy@${GH} secrets.DEPLOY_HOST }} "bash /var/www/app/deploy.sh"
              - name: Smoke test
                run: curl --fail --retry 5 --retry-delay 3 https://example.com/health
        `,
      note: 'deploy.sh is the script from the "Deploy updates" step (Laravel, Node, Python or React). If the smoke test fails, the run turns red and GitHub emails you.',
    },
    {
      title: 'CD: build React in CI, upload to the server',
      lang: 'yaml',
      code: c`
          deploy:
            needs: build                       # the React CI job above
            runs-on: ubuntu-latest
            environment: production
            steps:
              - uses: actions/download-artifact@v4
                with:
                  name: dist
                  path: dist
              - name: Set up SSH
                run: |
                  mkdir -p ~/.ssh
                  echo "${GH} secrets.DEPLOY_SSH_KEY }}" > ~/.ssh/id_ed25519
                  chmod 600 ~/.ssh/id_ed25519
                  echo "${GH} secrets.DEPLOY_KNOWN_HOSTS }}" > ~/.ssh/known_hosts
              - name: Upload and switch atomically
                run: |
                  rsync -az --delete dist/ deploy@${GH} secrets.DEPLOY_HOST }}:/var/www/app/dist-new/
                  ssh deploy@${GH} secrets.DEPLOY_HOST }} "cd /var/www/app && rm -rf dist-old && mv dist dist-old && mv dist-new dist"
        `,
      note: 'The server needs only Nginx: no Node.js, no npm install, no build memory.',
    },
    {
      title: 'Staging → approval → production',
      lang: 'yaml',
      code: c`
        jobs:
          deploy-staging:
            runs-on: ubuntu-latest
            environment: staging
            steps:
              - run: echo "deploy to staging (same steps, staging secrets)"

          deploy-production:
            needs: deploy-staging
            runs-on: ubuntu-latest
            environment: production            # waits for a reviewer to click "Approve"
            steps:
              - run: echo "deploy to production"
        `,
      note: 'Create the environments in repo → Settings → Environments. On "production" add Required reviewers and limit it to the main branch. Secrets set on an environment (DEPLOY_HOST etc.) override repo secrets, so staging and production can point at different servers.',
    },
    {
      title: 'Protect main: require CI before merging',
      note: 'Repo → Settings → Branches (or Rules → Rulesets) → add a rule for main → Require a pull request → Require status checks to pass → pick the CI job(s). Nobody can merge red code, and every deploy started from main has passed tests.',
    },
    {
      title: 'Rollback',
      lang: 'bash',
      code: c`
        # fastest: revert the bad commit; the pipeline deploys the fix like any other change
        git revert <bad-commit-sha>
        git push origin main

        # or re-run the last good deploy: Actions tab → Deploy → pick the green run → "Re-run all jobs"

        # React builds: switch back to the previous build on the server
        ssh deploy@203.0.113.10 "cd /var/www/app && rm -rf dist && mv dist-old dist"
        `,
      note: 'Database migrations do not roll back by themselves. Write reversible migrations and avoid destructive changes in the same release as the code that needs them.',
    },
    {
      title: 'Keep actions and dependencies updated (Dependabot)',
      lang: 'yaml',
      code: c`
        # .github/dependabot.yml
        version: 2
        updates:
          - package-ecosystem: github-actions
            directory: /
            schedule: { interval: weekly }
          - package-ecosystem: npm          # composer | pip as needed
            directory: /
            schedule: { interval: weekly }
        `,
      note: 'Dependabot opens pull requests for new versions, and your CI tests them before you merge. It also bumps the action versions used above (actions/checkout@v4 → newer) for you.',
    },
    {
      title: 'Same idea on GitLab CI',
      lang: 'yaml',
      code: c`
        # .gitlab-ci.yml
        stages: [test, deploy]

        test:
          stage: test
          image: node:24
          script:
            - npm ci
            - npm run lint
            - npm test

        deploy:
          stage: deploy
          image: alpine:3.20
          environment: production
          rules:
            - if: $CI_COMMIT_BRANCH == "main"
          before_script:
            - apk add --no-cache openssh-client
            - mkdir -p ~/.ssh && echo "$DEPLOY_SSH_KEY" > ~/.ssh/id_ed25519 && chmod 600 ~/.ssh/id_ed25519
            - echo "$DEPLOY_KNOWN_HOSTS" > ~/.ssh/known_hosts
          script:
            - ssh deploy@$DEPLOY_HOST "bash /var/www/app/deploy.sh"
        `,
      note: 'Add the variables in GitLab → Settings → CI/CD → Variables (mark DEPLOY_SSH_KEY as masked and protected).',
    },
  ],
}

export const ops = {
  id: 'ops',
  title: 'Logs & troubleshooting',
  items: [
    {
      title: 'Where the logs are',
      code: c`
        sudo tail -f /var/log/nginx/error.log
        sudo tail -f /var/log/nginx/access.log
        tail -f /var/www/app/storage/logs/laravel-*.log     # Laravel
        journalctl -u app -f                                # Python / systemd apps
        journalctl -u app-worker -f
        pm2 logs                                            # Node
        `,
    },
    {
      title: '502 Bad Gateway',
      code: c`
        sudo systemctl status php8.3-fpm     # Laravel: is PHP-FPM running?
        ls /run/php/                         # socket name must match fastcgi_pass
        sudo systemctl status app            # Python
        pm2 status                           # Node
        curl -I http://127.0.0.1:3000        # is the app answering locally?
        `,
      note: 'Nginx is up but cannot reach the app behind it.',
    },
    {
      title: 'Permission denied in storage/',
      code: c`
        cd /var/www/app
        sudo chown -R deploy:www-data storage bootstrap/cache
        sudo chmod -R ug+rwx storage bootstrap/cache
        `,
    },
    {
      title: 'Server health',
      code: c`
        df -h          # disk
        free -h        # memory / swap
        htop           # CPU and processes (sudo apt install htop)
        sudo ss -tlnp  # what is listening on which port
        `,
    },
  ],
}
