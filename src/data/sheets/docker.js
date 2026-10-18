import { c } from './shared/code.js'

const PS_PWD = '${PWD}' // PowerShell variable, kept out of template interpolation

export default {
  slug: 'docker',
  title: 'Docker',
  tech: 'Docker',
  category: 'devops',
  minutes: 10,
  lang: 'bash',
  description: 'Images, containers, volumes, networks and Compose — the commands you reach for most.',
  sections: [
    {
      id: 'project-setup',
      title: 'Setup, step by step',
      group: 'Setup',
      items: [
        {
          title: '1. Install Docker',
          lang: 'bash',
          code: c`
            # macOS
            brew install --cask docker        # Docker Desktop, then open it once

            # Linux (Ubuntu) — official convenience script
            curl -fsSL https://get.docker.com | sudo sh
            sudo usermod -aG docker $USER     # run docker without sudo (log out and back in)

            # Windows (PowerShell, as Administrator)
            wsl --install                     # Docker Desktop uses WSL 2
            winget install -e --id Docker.DockerDesktop
            `,
        },
        {
          title: '2. Verify',
          lang: 'bash',
          code: c`
            docker version
            docker compose version
            docker run --rm hello-world
            `,
        },
        {
          title: '3. Dockerize an app',
          lang: 'bash',
          code: c`
            # in your project folder: write a Dockerfile (see the Dockerfile section), then
            docker build -t my-app .
            docker run --rm -p 8080:3000 my-app       # host 8080 → container 3000
            `,
          note: 'Add a .dockerignore so builds stay small and secrets stay out of images:',
          then: [
            {
              label: '.dockerignore',
              lang: 'text',
              code: c`
                node_modules
                vendor
                .git
                .env
                storage/logs
                `,
            },
          ],
        },
        {
          title: '4. App + database with Compose',
          lang: 'yaml',
          code: c`
            # compose.yaml
            services:
              app:
                build: .
                ports: ["8080:3000"]
                env_file: .env
                depends_on: [db]
              db:
                image: mysql:8.4
                environment:
                  MYSQL_ROOT_PASSWORD: secret
                  MYSQL_DATABASE: app
                volumes: [dbdata:/var/lib/mysql]
            volumes:
              dbdata:
            `,
          note: 'Inside the app, the database host is "db".',
          then: [
            {
              label: 'Start both',
              lang: 'bash',
              code: c`
                docker compose up -d
                docker compose logs -f app
                `,
            },
          ],
        },
        {
          title: 'OS notes',
          note: 'Windows: keep projects inside the WSL filesystem for fast bind mounts, and give Docker Desktop enough memory in Settings → Resources. Apple Silicon Macs: add --platform linux/amd64 for images that only exist for Intel. Linux: no Desktop app needed, the engine runs natively.',
        },
      ],
    },
    {
      id: 'containers',
      title: 'Containers',
      group: 'Containers & images',
      items: [
        {
          title: 'Run a container',
          code: 'docker run -d --name web -p 8080:80 nginx:alpine',
          note: '-d runs it in the background; -p maps host:container ports.',
        },
        {
          title: 'List & inspect',
          code: c`
            docker ps        # running
            docker ps -a     # all
            docker inspect web
            `,
        },
        {
          title: 'Logs & shell',
          code: c`
            docker logs -f web
            docker exec -it web sh
            `,
        },
        {
          title: 'Stop & remove',
          code: c`
            docker stop web
            docker rm web
            docker rm -f $(docker ps -aq)   # remove everything
            `,
        },
      ],
    },
    {
      id: 'images',
      title: 'Images',
      group: 'Containers & images',
      items: [
        {
          title: 'Build & tag',
          code: c`
            docker build -t myapp:1.0 .
            docker build -f docker/Dockerfile.prod -t myapp:prod .
            `,
        },
        {
          title: 'List & clean',
          code: c`
            docker images
            docker image prune -a
            `,
        },
        {
          title: 'Push to a registry',
          code: c`
            docker tag myapp:1.0 registry.example.com/myapp:1.0
            docker push registry.example.com/myapp:1.0
            `,
        },
      ],
    },
    {
      id: 'dockerfile',
      title: 'Dockerfile',
      group: 'Containers & images',
      items: [
        {
          title: 'PHP app (multi-stage)',
          lang: 'dockerfile',
          code: c`
            FROM composer:2 AS vendor
            WORKDIR /app
            COPY composer.json composer.lock ./
            RUN composer install --no-dev --prefer-dist --no-scripts

            FROM php:8.3-fpm-alpine
            WORKDIR /var/www
            RUN docker-php-ext-install pdo_mysql
            COPY --from=vendor /app/vendor ./vendor
            COPY . .
            CMD ["php-fpm"]
            `,
        },
        {
          title: 'Node app',
          lang: 'dockerfile',
          code: c`
            FROM node:22-alpine
            WORKDIR /app
            COPY package*.json ./
            RUN npm ci --omit=dev
            COPY . .
            EXPOSE 3000
            CMD ["node", "server.js"]
            `,
          note: 'Copy package files first so the install layer is cached between builds.',
        },
        {
          title: '.dockerignore',
          lang: 'text',
          code: c`
            node_modules
            vendor
            .git
            .env
            storage/logs
            `,
        },
      ],
    },
    {
      id: 'data',
      title: 'Volumes & networks',
      group: 'Data & multi-container apps',
      items: [
        {
          title: 'Named volume',
          code: c`
            docker volume create dbdata
            docker run -d -v dbdata:/var/lib/mysql mysql:8
            `,
        },
        {
          title: 'Bind mount for dev',
          code: c`
            # macOS / Linux / Git Bash
            docker run -v "$(pwd)":/app -w /app node:22 npm run dev

            # Windows — PowerShell
            docker run -v "${PS_PWD}:/app" -w /app node:22 npm run dev

            # Windows — cmd
            docker run -v "%cd%":/app -w /app node:22 npm run dev
            `,
          note: 'On Windows, keep projects inside the WSL filesystem (\\\\wsl$\\Ubuntu\\...) for much faster file access with Docker Desktop.',
        },
        {
          title: 'User network',
          code: c`
            docker network create appnet
            docker run -d --network appnet --name db mysql:8
            `,
          note: 'Containers on the same network reach each other by name (e.g. host "db").',
        },
      ],
    },
    {
      id: 'compose',
      title: 'Docker Compose',
      group: 'Data & multi-container apps',
      items: [
        {
          title: 'compose.yaml',
          lang: 'yaml',
          code: c`
            services:
              app:
                build: .
                ports: ["8000:8000"]
                env_file: .env
                depends_on: [db]
              db:
                image: mysql:8
                environment:
                  MYSQL_DATABASE: app
                  MYSQL_ROOT_PASSWORD: secret
                volumes: [dbdata:/var/lib/mysql]
            volumes:
              dbdata:
            `,
        },
        {
          title: 'Lifecycle',
          code: c`
            docker compose up -d --build
            docker compose ps
            docker compose logs -f app
            docker compose down        # keep volumes
            docker compose down -v     # delete volumes too
            `,
        },
        {
          title: 'Run a one-off command',
          code: c`
            docker compose exec app php artisan migrate
            docker compose run --rm app npm test
            `,
        },
      ],
    },
    {
      id: 'cleanup',
      title: 'Clean-up',
      group: 'Maintenance',
      items: [
        {
          title: 'Disk usage',
          code: 'docker system df',
        },
        {
          title: 'Prune everything unused',
          code: 'docker system prune -a --volumes',
          note: 'Removes stopped containers, unused images, networks and volumes.',
        },
      ],
    },
  ],
}
