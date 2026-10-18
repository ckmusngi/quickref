import { c } from './shared/code.js'

export default {
  slug: 'bash',
  title: 'Bash',
  tech: 'Bash',
  category: 'devops',
  minutes: 9,
  lang: 'bash',
  description: 'Moving around, finding things, working with text and processes, and writing small scripts.',
  sections: [
    {
      id: 'project-setup',
      title: 'Terminal setup',
      group: 'Setup',
      items: [
        {
          title: 'Open a terminal',
          lang: 'text',
          code: c`
            macOS    Terminal (Cmd+Space → "Terminal"), or iTerm2 / Warp. Default shell: zsh
            Linux    Ctrl+Alt+T on Ubuntu. Default shell: bash
            Windows  Windows Terminal + WSL (Ubuntu) for real bash, or Git Bash. See "On Windows" below
            `,
        },
        {
          title: 'Which shell am I using?',
          code: c`
            echo $SHELL          # default login shell
            echo $0              # current shell
            chsh -s /bin/zsh     # change default (macOS / Linux)
            `,
        },
        {
          title: 'Shell config files',
          lang: 'text',
          code: c`
            bash   ~/.bashrc  (interactive)   ~/.bash_profile or ~/.profile  (login)
            zsh    ~/.zshrc
            Git Bash on Windows: ~/.bashrc  (C:\Users\you\.bashrc)

            After editing:  source ~/.zshrc
            `,
        },
        {
          title: 'Aliases and PATH',
          code: c`
            # add to ~/.zshrc or ~/.bashrc
            alias ll='ls -lah'
            alias art='php artisan'
            export PATH="$HOME/.local/bin:$PATH"
            `,
        },
        {
          title: 'Install handy tools',
          code: c`
            brew install jq tree htop ripgrep              # macOS
            sudo apt install -y jq tree htop ripgrep       # Linux / WSL
            winget install -e --id jqlang.jq               # Windows (native)
            `,
        },
        {
          title: 'Run a script',
          code: c`
            chmod +x deploy.sh        # once: make it executable
            ./deploy.sh
            bash deploy.sh            # works without chmod
            `,
        },
      ],
    },
    {
      id: 'windows',
      title: 'On Windows',
      group: 'Setup',
      items: [
        {
          title: 'Get a real bash shell on Windows',
          lang: 'powershell',
          code: c`
            # Option 1 — WSL (full Ubuntu inside Windows, recommended for development)
            wsl --install            # run in PowerShell as Administrator, then reboot
            wsl                      # open the Linux shell

            # Option 2 — Git Bash (comes with Git for Windows)
            winget install -e --id Git.Git
            `,
          note: 'Every command on this sheet then works exactly as shown.',
        },
        {
          title: 'bash → PowerShell cheat table',
          lang: 'text',
          code: c`
            bash                         PowerShell
            pwd                          Get-Location   (alias: pwd)
            ls -lah                      Get-ChildItem -Force   (alias: ls, dir)
            cd ~/projects                cd $HOME\projects
            mkdir -p a/b                 New-Item -ItemType Directory -Force a\b
            cp -r src backup/            Copy-Item src backup -Recurse
            mv old.txt new.txt           Move-Item old.txt new.txt
            rm -rf build/                Remove-Item build -Recurse -Force
            cat file.txt                 Get-Content file.txt   (alias: cat)
            tail -f app.log              Get-Content app.log -Wait -Tail 20
            grep -rn 'TODO' src/         Get-ChildItem src -Recurse -File | Select-String 'TODO'
            find . -name '*.log'         Get-ChildItem -Recurse -Filter *.log
            which php                    Get-Command php
            export KEY=value             $env:KEY = "value"
            echo $KEY                    echo $env:KEY
            curl -s URL                  Invoke-RestMethod URL    (curl.exe also ships with Windows)
            ps aux | grep php            Get-Process php
            kill <pid>                   Stop-Process -Id <pid>
            clear                        Clear-Host   (alias: cls, clear)
            `,
        },
        {
          title: 'File paths',
          lang: 'text',
          code: c`
            macOS / Linux   /Users/you/projects/app       ~/projects/app        separator: /
            Windows         C:\Users\you\projects\app     $HOME\projects\app    separator: \  (PowerShell accepts / too)
            WSL → Windows   /mnt/c/Users/you/projects/app
            Windows → WSL   \\wsl$\Ubuntu\home\you\app
            `,
        },
      ],
    },
    {
      id: 'files',
      title: 'Files & folders',
      group: 'Files & text',
      items: [
        {
          title: 'Navigate',
          code: c`
            pwd
            cd ~/projects/app
            cd -        # previous directory
            ls -lah
            `,
        },
        {
          title: 'Create, copy, move',
          code: c`
            mkdir -p storage/logs
            cp -r src backup/
            mv old.txt new.txt
            rm -rf build/
            `,
        },
        {
          title: 'Permissions',
          code: c`
            chmod +x deploy.sh
            chmod 644 .env
            chown -R www-data:www-data storage
            `,
        },
        {
          title: 'Disk usage',
          code: c`
            df -h
            du -sh * | sort -h
            `,
        },
      ],
    },
    {
      id: 'search',
      title: 'Searching',
      group: 'Files & text',
      items: [
        {
          title: 'Find files',
          code: c`
            find . -name '*.log' -mtime +7
            find . -type f -size +50M
            `,
        },
        {
          title: 'Search contents',
          code: c`
            grep -rn 'TODO' src/
            grep -ri 'stripe' --include='*.php' app/
            `,
        },
        {
          title: 'Search history',
          code: c`
            history | grep docker
            # or press Ctrl+R and type
            `,
        },
      ],
    },
    {
      id: 'text',
      title: 'Text processing',
      group: 'Files & text',
      items: [
        {
          title: 'View files',
          code: c`
            less storage/logs/laravel.log
            tail -f storage/logs/laravel.log
            head -n 20 data.csv
            `,
        },
        {
          title: 'Pipes',
          code: "cat access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head",
        },
        {
          title: 'Replace in place',
          code: c`
            # Linux (GNU sed)
            sed -i 's/old-domain.com/new-domain.com/g' config.php

            # macOS (BSD sed needs an explicit backup suffix, '' = none)
            sed -i '' 's/old-domain.com/new-domain.com/g' config.php

            # Windows PowerShell
            (Get-Content config.php) -replace 'old-domain.com', 'new-domain.com' | Set-Content config.php
            `,
        },
        {
          title: 'JSON with jq',
          code: "curl -s https://api.example.com/users | jq '.[] | {id, email}'",
        },
      ],
    },
    {
      id: 'processes',
      title: 'Processes & networking',
      group: 'System & scripting',
      items: [
        {
          title: 'Find & stop processes',
          code: c`
            ps aux | grep php
            kill <pid>
            kill -9 <pid>   # force
            `,
        },
        {
          title: "What's using a port",
          code: c`
            # macOS / Linux
            lsof -i :8000
            ss -tulpn                 # Linux only

            # Windows (PowerShell)
            Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess
            Stop-Process -Id <pid>

            # Windows (cmd)
            netstat -ano | findstr :8000
            taskkill /PID <pid> /F
            `,
        },
        {
          title: 'Run in background',
          code: c`
            nohup php artisan queue:work > queue.log 2>&1 &
            jobs
            fg %1
            `,
        },
        {
          title: 'Remote copy & shell',
          code: c`
            ssh user@server
            scp backup.sql user@server:/tmp/
            rsync -avz dist/ user@server:/var/www/app/
            `,
        },
      ],
    },
    {
      id: 'scripts',
      title: 'Scripting',
      group: 'System & scripting',
      items: [
        {
          title: 'Script skeleton',
          code: c`
            #!/usr/bin/env bash
            set -euo pipefail

            ENV="${'${'}1:-staging}"
            echo "Deploying to $ENV"
            `,
          note: 'set -euo pipefail stops on errors, unset variables and failed pipes.',
        },
        {
          title: 'Conditions',
          code: c`
            if [[ -f .env ]]; then
              echo "env found"
            elif [[ -d vendor ]]; then
              echo "vendor found"
            fi
            `,
        },
        {
          title: 'Loops',
          code: c`
            for f in *.csv; do
              echo "Processing $f"
            done
            `,
        },
        {
          title: 'Redirects',
          code: c`
            cmd > out.txt       # overwrite
            cmd >> out.txt      # append
            cmd 2>&1 | tee log  # stderr too, and show it
            `,
        },
      ],
    },
  ],
}
