import { c, step, BT } from './shared/code.js'
import { baseline, laravel, node, python, react, https, deploy, cicd, ops } from './shared/server-setup.js'

export default {
  slug: 'gcp',
  title: 'GCP',
  tech: 'GCP',
  category: 'cloud',
  minutes: 80,
  lang: 'bash',
  description: 'Step by step from an empty Google Cloud project to production: gcloud setup on Windows, macOS or Linux, a Compute Engine VM, deploying Laravel, Node, Python or React behind Nginx with HTTPS, then Cloud SQL, Cloud Storage and Pub/Sub wired into your app.',
  sections: [
    {
      id: 'overview',
      title: '0. What you will build',
      group: 'Setup',
      items: [
        {
          title: 'Architecture',
          lang: 'text',
          code: c`
            Browser ──HTTPS──▶ Cloud DNS ──▶ static external IP
                                                    │
                                       Compute Engine VM (Ubuntu 24.04)
                                       ├─ Nginx  :80/:443
                                       ├─ PHP-FPM │ PM2 (Node) │ Gunicorn/Uvicorn (Python)
                                       └─ queue worker (systemd)
                                                    │  service account (no key files)
                                     ┌──────────────┼──────────────┐
                                Cloud SQL     Cloud Storage      Pub/Sub
            `,
          note: 'Steps 0–11 take you from an empty project to a live server. Steps 12–21 add Cloud SQL, Cloud Storage and Pub/Sub.',
        },
        {
          title: 'AWS → GCP name map',
          lang: 'text',
          code: c`
            EC2              → Compute Engine
            Elastic IP       → Static external IP address
            Security group   → VPC firewall rule (+ network tags)
            IAM role (EC2)   → Service account attached to the VM
            RDS              → Cloud SQL
            S3               → Cloud Storage (GCS)
            SQS              → Pub/Sub (or Cloud Tasks)
            Route 53         → Cloud DNS
            CloudWatch       → Cloud Logging / Cloud Monitoring
            CloudShell       → Cloud Shell
            `,
        },
        {
          title: 'Which shell to use',
          lang: 'text',
          code: c`
            macOS / Linux  → Terminal (bash / zsh). Use the "macOS / Linux" lines.
            Windows        → PowerShell. Use the "Windows (PowerShell)" lines.
            Any OS         → Cloud Shell (">_" icon in the Google Cloud console) is a Linux shell
                             with gcloud pre-installed and logged in. Use the bash lines.

            Steps that run ON the VM are always Linux.
            `,
        },
      ],
    },
    {
      id: 'cli',
      title: '1. Project & gcloud CLI on your computer',
      group: 'Setup',
      items: [
        {
          title: 'Install the gcloud CLI',
          code: c`
            # macOS
            brew install --cask gcloud-cli          # older Homebrew: brew install --cask google-cloud-sdk

            # Linux (Debian / Ubuntu)
            sudo apt-get install -y apt-transport-https ca-certificates gnupg curl
            curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
            echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" \
              | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list
            sudo apt-get update && sudo apt-get install -y google-cloud-cli

            # Linux (any distro)
            curl https://sdk.cloud.google.com | bash && exec -l $SHELL

            # Windows (PowerShell)
            winget install -e --id Google.CloudSDK
            # or download GoogleCloudSDKInstaller.exe from cloud.google.com/sdk; then open a NEW terminal

            # all OS
            gcloud --version
            `,
        },
        {
          title: 'Log in',
          code: c`
            # all OS
            gcloud init                                   # log in + pick defaults interactively
            gcloud auth login
            gcloud auth application-default login         # credentials for SDKs in local development
            `,
        },
        {
          title: 'Create a project and link billing',
          code: c`
            # all OS
            gcloud projects create my-app-prod-123 --name="My App"
            gcloud config set project my-app-prod-123
            gcloud billing accounts list
            gcloud billing projects link my-app-prod-123 --billing-account=XXXXXX-XXXXXX-XXXXXX
            `,
          note: 'Project IDs are globally unique and permanent. Set a budget alert in Billing → Budgets & alerts.',
        },
        {
          title: 'Defaults and APIs',
          code: c`
            # all OS
            gcloud config set compute/region asia-southeast1
            gcloud config set compute/zone asia-southeast1-b
            gcloud services enable compute.googleapis.com sqladmin.googleapis.com storage.googleapis.com \
              pubsub.googleapis.com dns.googleapis.com iap.googleapis.com
            `,
          note: 'On Windows, put the services enable command on one line or replace \\ with `.',
        },
        {
          title: 'Shell variables used below',
          code: c`
            # macOS / Linux
            PROJECT=$(gcloud config get-value project)
            REGION=asia-southeast1
            ZONE=asia-southeast1-b
            SA=app-vm@$PROJECT.iam.gserviceaccount.com

            # Windows (PowerShell)
            $PROJECT = gcloud config get-value project
            $REGION = "asia-southeast1"
            $ZONE = "asia-southeast1-b"
            $SA = "app-vm@$PROJECT.iam.gserviceaccount.com"
            `,
        },
      ],
    },
    {
      id: 'sa',
      title: '2. Service account for the VM',
      group: 'Setup',
      items: [
        {
          title: 'Why',
          note: 'The VM runs as this account. Client libraries (Laravel packages, Node, Python) get credentials from the metadata server automatically, so there are no JSON key files on disk. Don\'t use the default Compute Engine account, which has broad Editor rights.',
        },
        {
          title: 'Create it with logging & monitoring rights',
          code: c`
            # all OS (variables from step 1)
            gcloud iam service-accounts create app-vm --display-name="App VM"
            gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$SA --role=roles/logging.logWriter
            gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$SA --role=roles/monitoring.metricWriter
            `,
          note: 'Access to Cloud SQL, Storage and Pub/Sub is granted in step 13.',
        },
      ],
    },
    {
      id: 'network',
      title: '3. Static IP & firewall',
      group: 'Setup',
      items: [
        {
          title: 'Reserve a static external IP',
          code: c`
            # macOS / Linux
            gcloud compute addresses create app-ip --region=$REGION
            IP=$(gcloud compute addresses describe app-ip --region=$REGION --format='value(address)')
            echo $IP

            # Windows (PowerShell)
            gcloud compute addresses create app-ip --region=$REGION
            $IP = gcloud compute addresses describe app-ip --region=$REGION --format='value(address)'
            $IP
            `,
        },
        {
          title: 'Allow HTTP / HTTPS to VMs tagged "web"',
          code: c`
            # all OS
            gcloud compute firewall-rules create allow-web --network=default \
              --allow=tcp:80,tcp:443 --target-tags=web --source-ranges=0.0.0.0/0
            `,
        },
        {
          title: 'Lock SSH down to Google IAP only',
          code: c`
            # all OS
            gcloud compute firewall-rules create allow-ssh-iap --network=default \
              --allow=tcp:22 --target-tags=web --source-ranges=35.235.240.0/20
            gcloud compute firewall-rules delete default-allow-ssh
            `,
          note: 'The default network lets anyone on the internet try SSH. 35.235.240.0/20 is Identity-Aware Proxy, so you SSH through Google with your Google login and port 22 is never exposed. To deploy from GitHub Actions over plain SSH, also allow that runner\'s IP, or deploy through IAP.',
        },
      ],
    },
    {
      id: 'launch',
      title: '4. Create the VM',
      group: 'Setup',
      items: [
        {
          title: 'Create an Ubuntu 24.04 VM',
          code: c`
            # macOS / Linux
            gcloud compute instances create app-vm \
              --zone=$ZONE \
              --machine-type=e2-small \
              --image-family=ubuntu-2404-lts-amd64 --image-project=ubuntu-os-cloud \
              --boot-disk-size=20GB --boot-disk-type=pd-balanced \
              --address=app-ip \
              --tags=web \
              --service-account=$SA --scopes=cloud-platform \
              --shielded-secure-boot

            # Windows (PowerShell)
            gcloud compute instances create app-vm ${BT}
              --zone=$ZONE ${BT}
              --machine-type=e2-small ${BT}
              --image-family=ubuntu-2404-lts-amd64 --image-project=ubuntu-os-cloud ${BT}
              --boot-disk-size=20GB --boot-disk-type=pd-balanced ${BT}
              --address=app-ip ${BT}
              --tags=web ${BT}
              --service-account=$SA --scopes=cloud-platform ${BT}
              --shielded-secure-boot
            `,
          note: 'e2-small has 2 GB RAM. --scopes=cloud-platform plus the service account\'s IAM roles decide what the VM can access.',
        },
        {
          title: 'Prefer the console?',
          note: 'Compute Engine → VM instances → Create instance → e2-small → Boot disk: Ubuntu 24.04 LTS, 20 GB → Identity: service account "app-vm", Allow full access to all Cloud APIs → Networking: network tag "web", External IPv4: app-ip → Create.',
        },
        {
          title: 'SSH in through gcloud',
          code: c`
            # all OS (Windows: gcloud uses its bundled PuTTY tools automatically)
            gcloud compute ssh app-vm --zone=asia-southeast1-b --tunnel-through-iap

            # copy files
            gcloud compute scp ./backup.sql app-vm:/tmp/ --zone=asia-southeast1-b --tunnel-through-iap
            `,
          note: 'The first run creates an SSH key for you (~/.ssh/google_compute_engine, or %USERPROFILE%\\.ssh on Windows) and logs you in as your local username.',
        },
        {
          title: 'Plain SSH (for the deploy user / CI)',
          code: c`
            # macOS / Linux / Windows PowerShell
            ssh -i ~/.ssh/google_compute_engine deploy@203.0.113.10
            `,
          note: 'Works after step 5 copies your key to the deploy user, and only if port 22 is allowed from your IP.',
        },
      ],
    },
    {
      ...step(5, baseline),
      group: 'Set up the server',
    },
    {
      ...step('6a', laravel),
      group: 'Deploy your app',
    },
    {
      ...step('6b', node),
      group: 'Deploy your app',
    },
    {
      ...step('6c', python),
      group: 'Deploy your app',
    },
    {
      ...step('6d', react),
      group: 'Deploy your app',
      items: [
        ...react.items,
        {
          title: 'GCP alternative: Firebase Hosting (no server)',
          code: c`
            # all OS
            npm install -g firebase-tools
            firebase login
            firebase init hosting
            #   project: your GCP project · public directory: dist · single-page app: Yes · GitHub deploys: optional

            npm run build
            firebase deploy --only hosting
            `,
          note: 'Firebase Hosting runs on Google Cloud and gives you a global CDN, free SSL and SPA rewrites with no Nginx to manage. Connect your domain under Hosting → Add custom domain.',
        },
        {
          title: 'firebase.json for a React app',
          lang: 'json',
          code: c`
            {
              "hosting": {
                "public": "dist",
                "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
                "rewrites": [{ "source": "**", "destination": "/index.html" }],
                "headers": [
                  { "source": "/assets/**", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
                  { "source": "/index.html", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] }
                ]
              }
            }
            `,
        },
      ],
    },
    {
      id: 'dns',
      title: '7. Point your domain (Cloud DNS)',
      group: 'Go live',
      items: [
        {
          title: 'Any DNS provider works',
          note: 'Create A records for example.com and www pointing at the static IP. If your domain already uses Cloudflare, Namecheap or similar, add them there and skip the rest of this step.',
        },
        {
          title: 'Create the zone and records',
          code: c`
            # macOS / Linux
            gcloud dns managed-zones create app-zone --dns-name="example.com." --description="App"
            gcloud dns record-sets create example.com.     --zone=app-zone --type=A --ttl=300 --rrdatas=$IP
            gcloud dns record-sets create www.example.com. --zone=app-zone --type=A --ttl=300 --rrdatas=$IP
            gcloud dns managed-zones describe app-zone --format='value(nameServers)'

            # Windows (PowerShell) — identical commands, $IP set in step 3
            gcloud dns managed-zones create app-zone --dns-name="example.com." --description="App"
            gcloud dns record-sets create example.com.     --zone=app-zone --type=A --ttl=300 --rrdatas=$IP
            gcloud dns record-sets create www.example.com. --zone=app-zone --type=A --ttl=300 --rrdatas=$IP
            gcloud dns managed-zones describe app-zone --format='value(nameServers)'
            `,
          note: 'Set the printed name servers at your domain registrar.',
        },
      ],
    },
    {
      ...step(8, https),
      group: 'Go live',
    },
    {
      ...step('9a', deploy),
      group: 'Go live',
    },
    {
      ...step('9b', cicd),
      group: 'Go live',
      items: [
        ...cicd.items,
        {
          title: 'GCP: let GitHub Actions log in without key files (Workload Identity Federation)',
          code: c`
            # macOS / Linux (Windows: same commands, replace the trailing \ with ${BT} and use $PROJECT / $PROJECT_NUMBER from PowerShell)
            PROJECT=$(gcloud config get-value project)
            PROJECT_NUMBER=$(gcloud projects describe $PROJECT --format='value(projectNumber)')

            gcloud iam workload-identity-pools create github --location=global --display-name="GitHub"
            gcloud iam workload-identity-pools providers create-oidc github-provider \
              --location=global --workload-identity-pool=github \
              --issuer-uri=https://token.actions.githubusercontent.com \
              --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
              --attribute-condition="assertion.repository=='your-org/your-app'"

            gcloud iam service-accounts create github-deployer
            gcloud iam service-accounts add-iam-policy-binding github-deployer@$PROJECT.iam.gserviceaccount.com \
              --role=roles/iam.workloadIdentityUser \
              --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/your-org/your-app"
            `,
          note: 'Only workflows from your-org/your-app can use the github-deployer account. Grant it just what it needs: for the IAP SSH deploy below, roles/compute.instanceAdmin.v1, roles/iap.tunnelResourceAccessor and roles/iam.serviceAccountUser on the VM\'s service account. For Firebase, roles/firebasehosting.admin.',
        },
        {
          title: 'GCP: deploy to the VM through IAP (port 22 stays closed)',
          lang: 'yaml',
          code: c`
              deploy:
                needs: test
                runs-on: ubuntu-latest
                environment: production
                permissions:
                  id-token: write                  # required for Workload Identity Federation
                  contents: read
                steps:
                  - uses: google-github-actions/auth@v2
                    with:
                      workload_identity_provider: projects/123456789/locations/global/workloadIdentityPools/github/providers/github-provider
                      service_account: github-deployer@my-app-prod-123.iam.gserviceaccount.com
                  - uses: google-github-actions/setup-gcloud@v2
                  - name: Run deploy.sh on the VM
                    run: |
                      gcloud compute ssh deploy@app-vm --zone=asia-southeast1-b --tunnel-through-iap \
                        --command="bash /var/www/app/deploy.sh"
            `,
          note: 'Matches the IAP-only SSH firewall from step 3.',
        },
        {
          title: 'GCP: deploy React to Firebase Hosting from CI',
          lang: 'yaml',
          code: c`
                  - uses: google-github-actions/auth@v2
                    with:
                      workload_identity_provider: projects/123456789/locations/global/workloadIdentityPools/github/providers/github-provider
                      service_account: github-deployer@my-app-prod-123.iam.gserviceaccount.com
                  - uses: actions/download-artifact@v4
                    with: { name: dist, path: dist }
                  - run: npx firebase-tools deploy --only hosting --project my-app-prod-123 --non-interactive
            `,
          note: 'firebase-tools picks up the credentials from the auth step. Keep firebase.json (from step 6d) in the repo.',
        },
      ],
    },
    {
      ...step(10, ops),
      group: 'Go live',
    },
    {
      id: 'production',
      title: '11. Production hardening & cleanup',
      group: 'Go live',
      items: [
        {
          title: 'Daily disk snapshots',
          code: c`
            # all OS
            gcloud compute resource-policies create snapshot-schedule daily-backup \
              --region=asia-southeast1 --daily-schedule --start-time=03:00 --max-retention-days=14
            gcloud compute disks add-resource-policies app-vm --resource-policies=daily-backup --zone=asia-southeast1-b
            `,
          note: 'Windows: replace the trailing \\ with `.',
        },
        {
          title: 'Logs and metrics (Ops Agent, on the VM)',
          code: c`
            curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
            sudo bash add-google-cloud-ops-agent-repo.sh --also-install
            `,
          note: 'Sends syslog and metrics to Cloud Logging / Monitoring. The VM\'s service account already has logWriter and metricWriter.',
        },
        {
          title: 'Automatic security updates (on the VM)',
          code: c`
            sudo dpkg-reconfigure -plow unattended-upgrades
            `,
        },
        {
          title: 'Scaling beyond one VM',
          note: 'Use an instance template + managed instance group behind an HTTPS Load Balancer with a Google-managed certificate. Or containerise the app and use Cloud Run, which removes server management entirely and pairs well with Cloud SQL and Pub/Sub.',
        },
        {
          title: 'Tear everything down',
          code: c`
            # all OS
            gcloud compute instances delete app-vm --zone=asia-southeast1-b
            gcloud compute addresses delete app-ip --region=asia-southeast1
            gcloud compute firewall-rules delete allow-web allow-ssh-iap
            gcloud dns record-sets delete www.example.com. --zone=app-zone --type=A
            gcloud dns record-sets delete example.com. --zone=app-zone --type=A
            gcloud dns managed-zones delete app-zone

            # or remove the whole project and everything in it:
            gcloud projects delete my-app-prod-123
            `,
        },
      ],
    },
    {
      id: 'services-before',
      title: '12. Before adding services',
      group: 'Connect services',
      items: [
        {
          title: 'Prerequisites',
          note: 'Do steps 0–11 first. These steps reuse the project, region and the VM service account "app-vm".',
        },
        {
          title: 'Equivalents if you know AWS',
          lang: 'text',
          code: c`
            RDS  → Cloud SQL        (connect through the Cloud SQL Auth Proxy)
            S3   → Cloud Storage    (gs://bucket, signed URLs, S3-compatible XML API)
            SQS  → Pub/Sub          (topic = where you publish, subscription = the queue you pull from,
                                     ack = delete, ack deadline = visibility timeout)
            `,
        },
        {
          title: 'Set variables',
          code: c`
            # macOS / Linux (or Cloud Shell)
            PROJECT=$(gcloud config get-value project)
            REGION=asia-southeast1
            SA=app-vm@$PROJECT.iam.gserviceaccount.com
            BUCKET=my-app-uploads-prod

            # Windows (PowerShell)
            $PROJECT = gcloud config get-value project
            $REGION = "asia-southeast1"
            $SA = "app-vm@$PROJECT.iam.gserviceaccount.com"
            $BUCKET = "my-app-uploads-prod"
            `,
          note: 'Most gcloud commands below are identical in bash and PowerShell once these variables exist. Where a command spans lines with \\, use ` on Windows or join it into one line.',
        },
      ],
    },
    {
      id: 'services-iam',
      title: '13. Grant the VM\'s service account access',
      group: 'Connect services',
      items: [
        {
          title: 'Project-level roles',
          code: c`
            gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$SA --role=roles/cloudsql.client
            gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$SA --role=roles/pubsub.publisher
            gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$SA --role=roles/pubsub.subscriber
            `,
          note: 'Bucket access is granted on the bucket itself in step 5, so the app can only reach its own bucket.',
        },
        {
          title: 'Allow the VM to sign URLs (no key file needed)',
          code: c`
            gcloud iam service-accounts add-iam-policy-binding $SA --member=serviceAccount:$SA --role=roles/iam.serviceAccountTokenCreator
            `,
          note: 'Signed URLs on a VM are signed through the IAM API ("signBlob"), which needs this role on the account itself.',
        },
        {
          title: 'Credentials for local development',
          code: c`
            # all OS
            gcloud auth application-default login
            `,
          note: 'Client libraries use your own login locally and the VM\'s service account in production. Same code, no key files.',
        },
      ],
    },
    {
      id: 'sql-create',
      title: '14. Cloud SQL: create the instance',
      group: 'Cloud SQL (database)',
      items: [
        {
          title: 'Create a MySQL 8.4 instance',
          code: c`
            # macOS / Linux
            read -s -p "DB root password: " DB_ROOT_PASSWORD; echo
            gcloud sql instances create app-db \
              --database-version=MYSQL_8_4 \
              --edition=enterprise \
              --tier=db-g1-small \
              --region=$REGION \
              --storage-size=20GB --storage-auto-increase \
              --backup-start-time=03:00 --enable-bin-log \
              --deletion-protection \
              --root-password="$DB_ROOT_PASSWORD"

            # Windows (PowerShell)
            $DB_ROOT_PASSWORD = Read-Host "DB root password" -MaskInput
            gcloud sql instances create app-db ${BT}
              --database-version=MYSQL_8_4 ${BT}
              --edition=enterprise ${BT}
              --tier=db-g1-small ${BT}
              --region=$REGION ${BT}
              --storage-size=20GB --storage-auto-increase ${BT}
              --backup-start-time=03:00 --enable-bin-log ${BT}
              --deletion-protection ${BT}
              --root-password="$DB_ROOT_PASSWORD"
            `,
          note: 'Takes a few minutes. db-g1-small is shared-core (fine to start, no SLA). For production use a dedicated tier such as db-custom-2-7680. --enable-bin-log enables point-in-time recovery. Turn on high availability later:',
          then: [
            {
              label: 'High availability',
              lang: 'bash',
              code: c`
                gcloud sql instances patch app-db --availability-type=REGIONAL
                `,
            },
          ],
        },
        {
          title: 'PostgreSQL instead',
          code: c`
            --database-version=POSTGRES_17       # app connects on port 5432
            `,
        },
        {
          title: 'Create the database and app user',
          code: c`
            gcloud sql databases create app --instance=app-db
            gcloud sql users create app --instance=app-db --password="another-strong-password"
            gcloud sql instances describe app-db --format='value(connectionName)'
            # → my-app-prod-123:asia-southeast1:app-db   (needed by the proxy)
            `,
        },
      ],
    },
    {
      id: 'sql-connect',
      title: '15. Cloud SQL: connect via the Auth Proxy',
      group: 'Cloud SQL (database)',
      items: [
        {
          title: 'Why the proxy',
          note: 'The Cloud SQL Auth Proxy runs on the VM, encrypts traffic and authorises with the VM\'s service account. There are no IP allow-lists or SSL certificates to manage, and your app just connects to 127.0.0.1.',
        },
        {
          title: 'Install the proxy (on the VM)',
          code: c`
            sudo curl -o /usr/local/bin/cloud-sql-proxy \
              https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.1/cloud-sql-proxy.linux.amd64
            sudo chmod +x /usr/local/bin/cloud-sql-proxy
            cloud-sql-proxy --version
            `,
          note: 'Check github.com/GoogleCloudPlatform/cloud-sql-proxy/releases for the newest v2 release and swap the version in the URL.',
        },
        {
          title: 'Run it as a systemd service (on the VM)',
          lang: 'ini',
          code: c`
            # /etc/systemd/system/cloud-sql-proxy.service
            [Unit]
            Description=Cloud SQL Auth Proxy
            After=network-online.target
            Wants=network-online.target

            [Service]
            ExecStart=/usr/local/bin/cloud-sql-proxy --address 127.0.0.1 --port 3306 my-app-prod-123:asia-southeast1:app-db
            Restart=always
            DynamicUser=yes

            [Install]
            WantedBy=multi-user.target
            `,
        },
        {
          title: 'Start and test (on the VM)',
          code: c`
            sudo systemctl daemon-reload
            sudo systemctl enable --now cloud-sql-proxy
            sudo apt install -y mysql-client
            mysql -h 127.0.0.1 -u app -p app
            `,
          note: 'Make your app services start after the proxy:',
          then: [
            {
              label: 'In app.service and app-worker.service',
              lang: 'ini',
              code: c`
                [Unit]
                After=network.target cloud-sql-proxy.service
                Wants=cloud-sql-proxy.service
                `,
            },
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                sudo systemctl daemon-reload
                sudo systemctl restart app app-worker
                `,
            },
          ],
        },
        {
          title: 'Connect from your laptop (for a GUI client)',
          code: c`
            # macOS (Apple Silicon: use darwin.arm64)
            curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.1/cloud-sql-proxy.darwin.amd64
            chmod +x cloud-sql-proxy && ./cloud-sql-proxy my-app-prod-123:asia-southeast1:app-db

            # Linux
            curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.1/cloud-sql-proxy.linux.amd64
            chmod +x cloud-sql-proxy && ./cloud-sql-proxy my-app-prod-123:asia-southeast1:app-db

            # Windows (PowerShell)
            Invoke-WebRequest https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.1/cloud-sql-proxy.x64.exe -OutFile cloud-sql-proxy.exe
            .\cloud-sql-proxy.exe my-app-prod-123:asia-southeast1:app-db
            `,
          note: 'Uses your gcloud application-default login. Then point TablePlus / DBeaver / MySQL Workbench at 127.0.0.1:3306.',
        },
        {
          title: 'Laravel (.env)',
          lang: 'env',
          code: c`
            DB_CONNECTION=mysql
            DB_HOST=127.0.0.1
            DB_PORT=3306
            DB_DATABASE=app
            DB_USERNAME=app
            DB_PASSWORD=another-strong-password
            `,
          note: 'The proxy handles encryption, so no SSL options are needed.',
          then: [
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                php artisan optimize
                php artisan migrate --force
                `,
            },
          ],
        },
        {
          title: 'Node.js (mysql2)',
          lang: 'js',
          code: c`
            import mysql from 'mysql2/promise'

            export const db = mysql.createPool({
              host: '127.0.0.1',
              port: 3306,
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME,
              connectionLimit: 10,
            })
            `,
        },
        {
          title: 'Django / FastAPI',
          lang: 'python',
          code: c`
            # Django settings.py
            DATABASES = {
                "default": {
                    "ENGINE": "django.db.backends.mysql",     # or django.db.backends.postgresql
                    "HOST": "127.0.0.1",
                    "PORT": "3306",
                    "NAME": os.environ["DB_NAME"],
                    "USER": os.environ["DB_USER"],
                    "PASSWORD": os.environ["DB_PASSWORD"],
                    "CONN_MAX_AGE": 60,
                }
            }

            # FastAPI / SQLAlchemy
            engine = create_engine("mysql+pymysql://app:another-strong-password@127.0.0.1:3306/app", pool_pre_ping=True)
            `,
        },
        {
          title: 'Keep the password in Secret Manager',
          code: c`
            # store once — macOS / Linux
            gcloud services enable secretmanager.googleapis.com
            printf "another-strong-password" | gcloud secrets create db-password --data-file=-

            # store once — Windows (PowerShell)
            gcloud services enable secretmanager.googleapis.com
            "another-strong-password" | Out-File -NoNewline -Encoding ascii pw.txt
            gcloud secrets create db-password --data-file=pw.txt; Remove-Item pw.txt

            # allow the VM to read it
            gcloud secrets add-iam-policy-binding db-password --member=serviceAccount:$SA --role=roles/secretmanager.secretAccessor

            # on the VM, e.g. in deploy.sh
            DB_PASSWORD=$(gcloud secrets versions access latest --secret=db-password)
            `,
        },
      ],
    },
    {
      id: 'sql-ops',
      title: '16. Cloud SQL: backups & maintenance',
      group: 'Cloud SQL (database)',
      items: [
        {
          title: 'On-demand backup and restore',
          code: c`
            gcloud sql backups create --instance=app-db
            gcloud sql backups list --instance=app-db
            gcloud sql backups restore BACKUP_ID --restore-instance=app-db
            `,
          note: 'Restoring overwrites the instance. Automatic daily backups run at --backup-start-time.',
        },
        {
          title: 'Point-in-time clone (safe restore)',
          code: c`
            gcloud sql instances clone app-db app-db-restore --point-in-time=2026-10-17T03:00:00Z
            `,
          note: 'Creates a new instance as it was at that moment. Check it, then point the proxy at it.',
        },
        {
          title: 'Export to a bucket',
          code: c`
            gcloud sql export sql app-db gs://my-app-backups/app-2026-10-17.sql.gz --database=app
            `,
          note: 'The Cloud SQL instance has its own service account, which needs write access to the bucket:',
          then: [
            {
              label: 'macOS / Linux',
              lang: 'bash',
              code: c`
                SQL_SA=$(gcloud sql instances describe app-db --format='value(serviceAccountEmailAddress)')
                gcloud storage buckets add-iam-policy-binding gs://my-app-backups --member=serviceAccount:$SQL_SA --role=roles/storage.objectCreator
                `,
            },
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                $SQL_SA = gcloud sql instances describe app-db --format='value(serviceAccountEmailAddress)'
                gcloud storage buckets add-iam-policy-binding gs://my-app-backups --member=serviceAccount:$SQL_SA --role=roles/storage.objectCreator
                `,
            },
          ],
        },
        {
          title: 'Resize',
          code: c`
            gcloud sql instances patch app-db --tier=db-custom-2-7680
            `,
          note: 'Restarts the instance (a few minutes of downtime).',
        },
      ],
    },
    {
      id: 'gcs-create',
      title: '17. Cloud Storage: create a private bucket',
      group: 'Cloud Storage (files)',
      items: [
        {
          title: 'Create the bucket',
          code: c`
            gcloud storage buckets create gs://my-app-uploads-prod --location=asia-southeast1 \
              --uniform-bucket-level-access --public-access-prevention
            gcloud storage buckets add-iam-policy-binding gs://my-app-uploads-prod \
              --member=serviceAccount:$SA --role=roles/storage.objectUser
            `,
          note: 'roles/storage.objectUser = read, write and delete objects in this bucket only. Bucket names are globally unique.',
        },
        {
          title: 'Everyday CLI',
          code: c`
            gcloud storage cp invoice.pdf gs://my-app-uploads-prod/invoices/
            gcloud storage ls gs://my-app-uploads-prod/invoices/
            gcloud storage rsync ./public/build gs://my-app-uploads-prod/build --recursive --delete-unmatched-destination-objects
            gcloud storage rm gs://my-app-uploads-prod/invoices/invoice.pdf
            gcloud storage sign-url gs://my-app-uploads-prod/invoices/invoice.pdf --duration=10m --impersonate-service-account=$SA
            `,
          note: 'Identical on macOS, Linux and Windows (Windows paths like .\\public\\build work too).',
        },
        {
          title: 'CORS for direct browser uploads',
          lang: 'json',
          code: c`
            [
              {
                "origin": ["https://example.com"],
                "method": ["GET", "PUT", "POST"],
                "responseHeader": ["Content-Type"],
                "maxAgeSeconds": 3600
              }
            ]
            `,
          note: 'Save as cors.json, then apply it:',
          then: [
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                gcloud storage buckets update gs://my-app-uploads-prod --cors-file=cors.json
                `,
            },
          ],
        },
        {
          title: 'Auto-delete temporary files',
          lang: 'json',
          code: c`
            {
              "rule": [
                { "action": { "type": "Delete" }, "condition": { "age": 7, "matchesPrefix": ["tmp/"] } }
              ]
            }
            `,
          note: 'Save as lifecycle.json, then apply it:',
          then: [
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                gcloud storage buckets update gs://my-app-uploads-prod --lifecycle-file=lifecycle.json
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'gcs-app',
      title: '18. Cloud Storage: use it from your app',
      group: 'Cloud Storage (files)',
      items: [
        {
          title: 'Laravel: use the S3 driver against GCS',
          code: c`
            composer require league/flysystem-aws-s3-v3 "^3.0" --with-all-dependencies
            gcloud storage hmac create $SA       # prints an access ID and secret, save them now
            `,
          note: 'Cloud Storage speaks the S3 XML API with HMAC keys, so Laravel\'s built-in s3 driver works without extra packages.',
        },
        {
          title: 'Laravel: config/filesystems.php',
          lang: 'php',
          code: c`
            'disks' => [
                // ...
                'gcs' => [
                    'driver' => 's3',
                    'key' => env('GCS_HMAC_KEY'),
                    'secret' => env('GCS_HMAC_SECRET'),
                    'region' => 'auto',
                    'bucket' => env('GCS_BUCKET'),
                    'endpoint' => 'https://storage.googleapis.com',
                    'use_path_style_endpoint' => true,
                    // newer AWS SDKs add checksum headers GCS does not accept
                    'request_checksum_calculation' => 'when_required',
                    'response_checksum_validation' => 'when_required',
                    'throw' => true,
                ],
            ],
            `,
        },
        {
          title: 'Laravel (.env) and usage',
          lang: 'php',
          code: c`
            // .env
            // FILESYSTEM_DISK=gcs
            // GCS_BUCKET=my-app-uploads-prod
            // GCS_HMAC_KEY=GOOG1E...
            // GCS_HMAC_SECRET=...

            $path = $request->file('avatar')->store('avatars', 'gcs');
            $url  = Storage::disk('gcs')->temporaryUrl($path, now()->addMinutes(10));
            Storage::disk('gcs')->delete($path);
            `,
        },
        {
          title: 'Node.js: @google-cloud/storage',
          lang: 'js',
          code: c`
            // npm i @google-cloud/storage
            import { Storage } from '@google-cloud/storage'

            const bucket = new Storage().bucket(process.env.GCS_BUCKET)
            const file = bucket.file('avatars/42.png')

            await file.save(buffer, { contentType: 'image/png' })

            const [downloadUrl] = await file.getSignedUrl({
              version: 'v4', action: 'read', expires: Date.now() + 10 * 60 * 1000,
            })

            // let the browser upload directly (needs the CORS rule)
            const [uploadUrl] = await bucket.file('uploads/abc.png').getSignedUrl({
              version: 'v4', action: 'write', contentType: 'image/png', expires: Date.now() + 5 * 60 * 1000,
            })

            await file.delete()
            `,
          note: 'On the VM, signing goes through the IAM API automatically (step 1 granted the role).',
        },
        {
          title: 'Python: google-cloud-storage',
          lang: 'python',
          code: c`
            # pip install google-cloud-storage
            from datetime import timedelta
            import google.auth
            from google.auth.transport.requests import Request
            from google.cloud import storage

            client = storage.Client()
            bucket = client.bucket("my-app-uploads-prod")
            blob = bucket.blob("avatars/42.png")

            blob.upload_from_file(file_obj, content_type="image/png")
            blob.upload_from_filename("report.pdf")

            # signed URL on a VM (no key file): sign through the IAM API
            creds, _ = google.auth.default()
            creds.refresh(Request())
            url = blob.generate_signed_url(
                version="v4", expiration=timedelta(minutes=10),
                service_account_email=creds.service_account_email, access_token=creds.token,
            )

            blob.delete()
            `,
        },
        {
          title: 'Django: django-storages',
          lang: 'python',
          code: c`
            # pip install "django-storages[google]"
            STORAGES = {
                "default": {
                    "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
                    "OPTIONS": {
                        "bucket_name": "my-app-uploads-prod",
                        "querystring_auth": True,     # FileField.url returns a signed URL
                        "iam_sign_blob": True,        # sign via IAM on the VM (no key file)
                        "file_overwrite": False,
                    },
                },
                "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
            }
            `,
          note: 'iam_sign_blob needs a recent django-storages (1.14.4+). Upgrade if Django complains about the option.',
        },
      ],
    },
    {
      id: 'pubsub-create',
      title: '19. Pub/Sub: topic, subscription & dead-letter',
      group: 'Pub/Sub (queues)',
      items: [
        {
          title: 'How Pub/Sub works',
          lang: 'text',
          code: c`
            producer ──publish──▶ (topic: app-jobs) ──▶ [subscription: app-jobs-worker] ──pull──▶ worker
                                                                 │                           │ success → ack
                                                                 │                           │ failure → nack / no ack:
                                                                 │                           │   redelivered after a backoff
                                                                 └─ after 5 failed deliveries ─▶ (topic: app-jobs-dlq)
            `,
        },
        {
          title: 'Create topics and subscriptions',
          code: c`
            gcloud pubsub topics create app-jobs
            gcloud pubsub topics create app-jobs-dlq
            gcloud pubsub subscriptions create app-jobs-dlq-sub --topic=app-jobs-dlq

            gcloud pubsub subscriptions create app-jobs-worker --topic=app-jobs \
              --ack-deadline=120 \
              --dead-letter-topic=app-jobs-dlq --max-delivery-attempts=5 \
              --min-retry-delay=10s --max-retry-delay=600s
            `,
          note: '--ack-deadline is like SQS VisibilityTimeout: set it longer than your slowest job.',
        },
        {
          title: 'Let Pub/Sub move messages to the dead-letter topic',
          code: c`
            # macOS / Linux
            PROJECT_NUMBER=$(gcloud projects describe $PROJECT --format='value(projectNumber)')
            PUBSUB_SA=service-$PROJECT_NUMBER@gcp-sa-pubsub.iam.gserviceaccount.com

            # Windows (PowerShell)
            $PROJECT_NUMBER = gcloud projects describe $PROJECT --format='value(projectNumber)'
            $PUBSUB_SA = "service-$PROJECT_NUMBER@gcp-sa-pubsub.iam.gserviceaccount.com"

            # all OS
            gcloud pubsub topics add-iam-policy-binding app-jobs-dlq --member=serviceAccount:$PUBSUB_SA --role=roles/pubsub.publisher
            gcloud pubsub subscriptions add-iam-policy-binding app-jobs-worker --member=serviceAccount:$PUBSUB_SA --role=roles/pubsub.subscriber
            `,
          note: 'Without these two bindings, dead-lettering silently does nothing.',
        },
        {
          title: 'Try it from the CLI',
          code: c`
            # macOS / Linux
            gcloud pubsub topics publish app-jobs --message='{"type":"invoice.created","id":42}'

            # Windows (PowerShell)
            gcloud pubsub topics publish app-jobs --message='{\"type\":\"invoice.created\",\"id\":42}'

            # all OS
            gcloud pubsub subscriptions pull app-jobs-worker --auto-ack --limit=5
            `,
          note: 'PowerShell 5 strips inner double quotes when calling gcloud, so escape them as shown. PowerShell 7.3+ accepts the macOS / Linux form.',
        },
      ],
    },
    {
      id: 'pubsub-app',
      title: '20. Pub/Sub: publish & process',
      group: 'Pub/Sub (queues)',
      items: [
        {
          title: 'Node.js: publish',
          lang: 'js',
          code: c`
            // npm i @google-cloud/pubsub
            import { PubSub } from '@google-cloud/pubsub'

            const pubsub = new PubSub()
            await pubsub.topic('app-jobs').publishMessage({ json: { type: 'invoice.created', id: 42 } })
            `,
        },
        {
          title: 'Node.js: worker',
          lang: 'js',
          code: c`
            // src/worker.js
            import { PubSub } from '@google-cloud/pubsub'

            const sub = new PubSub().subscription('app-jobs-worker', { flowControl: { maxMessages: 10 } })

            sub.on('message', async message => {
              try {
                await handle(JSON.parse(message.data.toString()))
                message.ack()
              } catch (err) {
                console.error('job failed, will be redelivered', err)
                message.nack()
              }
            })

            sub.on('error', err => {
              console.error(err)
              process.exit(1)          // let PM2 restart the worker
            })
            `,
          note: 'Run it under PM2 as a second app next to the API.',
        },
        {
          title: 'Python: publish',
          lang: 'python',
          code: c`
            # pip install google-cloud-pubsub
            import json
            from google.cloud import pubsub_v1

            publisher = pubsub_v1.PublisherClient()
            topic = publisher.topic_path("my-app-prod-123", "app-jobs")
            publisher.publish(topic, json.dumps({"type": "invoice.created", "id": 42}).encode()).result()
            `,
        },
        {
          title: 'Python: worker',
          lang: 'python',
          code: c`
            import json, logging
            from google.cloud import pubsub_v1

            subscriber = pubsub_v1.SubscriberClient()
            path = subscriber.subscription_path("my-app-prod-123", "app-jobs-worker")

            def callback(message):
                try:
                    handle(json.loads(message.data))
                    message.ack()
                except Exception:
                    logging.exception("job failed, will be redelivered")
                    message.nack()

            future = subscriber.subscribe(path, callback=callback,
                                          flow_control=pubsub_v1.types.FlowControl(max_messages=10))
            with subscriber:
                future.result()      # blocks forever; run under systemd
            `,
        },
        {
          title: 'Laravel: publish',
          lang: 'php',
          code: c`
            // composer require google/cloud-pubsub
            use Google\Cloud\PubSub\PubSubClient;

            $pubsub = new PubSubClient(['projectId' => config('services.gcp.project')]);

            $pubsub->topic('app-jobs')->publish([
                'data' => json_encode(['type' => 'invoice.created', 'id' => $invoice->id]),
            ]);
            `,
        },
        {
          title: 'Laravel: worker command',
          lang: 'php',
          code: c`
            // app/Console/Commands/PubSubWork.php
            namespace App\Console\Commands;

            use App\Jobs\ProcessInvoice;
            use App\Models\Invoice;
            use Google\Cloud\PubSub\PubSubClient;
            use Illuminate\Console\Command;

            class PubSubWork extends Command
            {
                protected $signature = 'pubsub:work';
                protected $description = 'Process messages from the app-jobs-worker subscription';

                public function handle(): void
                {
                    $sub = (new PubSubClient(['projectId' => config('services.gcp.project')]))
                        ->subscription('app-jobs-worker');

                    while (true) {
                        foreach ($sub->pull(['maxMessages' => 10]) as $message) {
                            try {
                                $payload = json_decode($message->data(), true);
                                ProcessInvoice::dispatchSync(Invoice::findOrFail($payload['id']));
                                $sub->acknowledge($message);
                            } catch (\Throwable $e) {
                                report($e);   // not acked → redelivered after the ack deadline
                            }
                        }
                    }
                }
            }
            `,
          note: 'Laravel\'s own queue (dispatch()) has no built-in Pub/Sub driver. On GCP, use the database or Redis (Memorystore) queue driver for it, and Pub/Sub for events between services. Run this command as a service, like the queue worker:',
          then: [{
            label: '/etc/systemd/system/app-pubsub.service',
            lang: 'ini',
            code: c`
              [Unit]
              Description=Pub/Sub worker
              After=network.target

              [Service]
              User=www-data
              WorkingDirectory=/var/www/app
              ExecStart=/usr/bin/php artisan pubsub:work
              Restart=always

              [Install]
              WantedBy=multi-user.target
              `,
          }, {
            label: 'Then run',
            lang: 'bash',
            code: c`
              sudo systemctl daemon-reload
              sudo systemctl enable --now app-pubsub
              `,
          }],
        },
      ],
    },
    {
      id: 'cleanup',
      title: '21. Costs & cleanup',
      group: 'Costs & cleanup',
      items: [
        {
          title: 'What costs money',
          lang: 'text',
          code: c`
            Cloud SQL      → per instance-hour (even when idle) + storage + backups (biggest item)
            Cloud Storage  → storage per GB-month + operations + egress
            Pub/Sub        → per TiB of messages (first 10 GiB/month free)
            Compute Engine → VM + disk + static IP
            `,
        },
        {
          title: 'Delete the services from steps 12–20',
          code: c`
            gcloud sql instances patch app-db --no-deletion-protection
            gcloud sql instances delete app-db
            gcloud storage rm --recursive gs://my-app-uploads-prod
            gcloud pubsub subscriptions delete app-jobs-worker app-jobs-dlq-sub
            gcloud pubsub topics delete app-jobs app-jobs-dlq
            gcloud secrets delete db-password
            `,
          note: 'Same on every OS. Or remove the whole project and everything in it at once:',
          then: [
            {
              label: 'Delete the project',
              lang: 'bash',
              code: c`
                gcloud projects delete my-app-prod-123
                `,
            },
          ],
        },
      ],
    },
  ],
}
