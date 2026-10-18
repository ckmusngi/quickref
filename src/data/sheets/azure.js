import { c, BT } from './shared/code.js'

const GH = '${{' // GitHub Actions expression opener (avoids template interpolation)

export default {
  slug: 'azure',
  title: 'Azure',
  tech: 'Azure',
  category: 'cloud',
  minutes: 70,
  lang: 'bash',
  description: 'Step by step from an empty Azure subscription to a production Node.js (Express) API: Azure CLI on Windows, macOS or Linux, App Service (or Container Apps, Functions, a VM), PostgreSQL / MySQL Flexible Server, Blob Storage, Service Bus, Managed Identity, Key Vault, Application Insights and GitHub Actions deploys.',
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
            Browser ──HTTPS──▶ Azure DNS ──▶ App Service (Linux, Node 24 LTS)
                                               ├─ Express API  (process.env.PORT)
                                               ├─ staging slot ⇄ production (swap)
                                               └─ Application Insights (logs, traces)
                                                      │  Managed Identity (no keys in code)
                     ┌─────────────────┬──────────────┼───────────────┬──────────────┐
             PostgreSQL Flexible   Blob Storage   Service Bus      Key Vault
                  Server            (uploads)      (jobs queue)    (secrets)

            GitHub Actions ──OIDC (no stored password)──▶ azure/login ──▶ App Service
            `,
          note: 'Steps 0–5 put a Node API online. Steps 6–8 are alternative hosts. Steps 9–15 add the database, storage, queues and secrets. Steps 16–19 take it live.',
        },
        {
          title: 'AWS / GCP → Azure name map',
          lang: 'text',
          code: c`
            AWS                      GCP                    Azure
            EC2                      Compute Engine         Virtual Machines
            Elastic Beanstalk        App Engine             App Service
            Lambda                   Cloud Functions        Azure Functions
            ECS Fargate / App Runner Cloud Run              Azure Container Apps
            RDS                      Cloud SQL              Azure Database for PostgreSQL / MySQL Flexible Server
            S3                       Cloud Storage          Blob Storage (inside a Storage account)
            SQS                      Pub/Sub / Cloud Tasks  Service Bus (or Storage Queues)
            Secrets Manager          Secret Manager         Key Vault
            IAM role (EC2)           Service account        Managed Identity
            CloudWatch               Cloud Logging/Monit.   Application Insights / Azure Monitor
            Route 53                 Cloud DNS              Azure DNS
            CloudShell               Cloud Shell            Azure Cloud Shell
            Account                  Project                Subscription + Resource group
            `,
        },
        {
          title: 'Which shell to use',
          lang: 'text',
          code: c`
            macOS / Linux  → Terminal (bash / zsh). Use the "macOS / Linux" lines.
            Windows        → PowerShell 7 or Windows Terminal. Use the "Windows (PowerShell)" lines.
                             (Or install WSL — "wsl --install" — and use the Linux lines.)
            Any OS         → Azure Cloud Shell (">_" icon in the Azure portal top bar) is a browser
                             shell with az pre-installed and logged in. Pick "Bash" and use the bash lines.

            Lines marked "# same on every OS" work unchanged in bash and PowerShell.
            Multi-line commands: bash continues lines with \ , PowerShell with a backtick.
            `,
        },
      ],
    },
    {
      id: 'cli',
      title: '1. Account & Azure CLI on your computer',
      group: 'Setup',
      items: [
        {
          title: 'Secure the account first',
          note: 'Sign up at azure.microsoft.com (free account includes credits for 30 days), turn on MFA for your Microsoft account, and create a budget with an email alert in Cost Management → Budgets before you create anything.',
        },
        {
          title: 'Install the Azure CLI',
          code: c`
            # macOS
            brew update && brew install azure-cli

            # Linux (Ubuntu / Debian)
            curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

            # Windows (PowerShell)
            winget install -e --id Microsoft.AzureCLI
            # then open a NEW terminal

            # same on every OS
            az version
            az upgrade                     # later: update the CLI in place
            `,
        },
        {
          title: 'Log in',
          code: c`
            # same on every OS
            az login                       # opens a browser; then pick a subscription
            az login --use-device-code     # no browser on this machine (SSH session, container)
            az account show --output table # who and which subscription you are using
            `,
          note: 'Your az login is also what the Azure SDKs use on your laptop (DefaultAzureCredential), so local code works without keys.',
        },
        {
          title: 'Pick the subscription',
          code: c`
            # same on every OS
            az account list --output table
            az account set --subscription "My Subscription Name or ID"
            `,
        },
        {
          title: 'Pick one region for everything',
          code: c`
            # same on every OS
            az account list-locations --query "[].name" --output tsv     # e.g. southeastasia, westeurope, eastus2
            `,
          note: 'Keep the app, database, storage and queues in the same region for latency and to avoid data transfer charges. Not every service or VM size is available in every region.',
        },
        {
          title: 'Variables used in the rest of this sheet',
          code: c`
            # macOS / Linux
            RG=my-app-rg
            LOCATION=southeastasia
            PLAN=my-app-plan
            APP=my-node-api                    # becomes my-node-api.azurewebsites.net (globally unique)
            SUBSCRIPTION_ID=$(az account show --query id --output tsv)

            # Windows (PowerShell)
            $RG = "my-app-rg"
            $LOCATION = "southeastasia"
            $PLAN = "my-app-plan"
            $APP = "my-node-api"
            $SUBSCRIPTION_ID = az account show --query id --output tsv
            `,
          note: 'Variables vanish when you close the terminal. Re-run this block in each new session.',
        },
        {
          title: 'Optional: CLI defaults so you can skip --resource-group / --location',
          code: c`
            # same on every OS
            az config set defaults.group=my-app-rg defaults.location=southeastasia
            az config unset defaults.group defaults.location      # undo
            `,
          note: 'This sheet passes --resource-group explicitly so every command can be copied on its own.',
        },
        {
          title: 'Register resource providers (first use only)',
          code: c`
            # same on every OS
            az provider register --namespace Microsoft.Web
            az provider register --namespace Microsoft.DBforPostgreSQL
            az provider register --namespace Microsoft.Storage
            az provider register --namespace Microsoft.ServiceBus
            az provider register --namespace Microsoft.KeyVault
            az provider register --namespace Microsoft.Insights
            az provider register --namespace Microsoft.OperationalInsights
            az provider register --namespace Microsoft.App            # only for Container Apps

            az provider show --namespace Microsoft.Web --query registrationState --output tsv   # "Registered"
            `,
          note: 'New subscriptions sometimes fail with "MissingSubscriptionRegistration". Registering is free and takes a minute or two. Most az commands register what they need automatically.',
        },
      ],
    },
    {
      id: 'rg',
      title: '2. Resource group & naming',
      group: 'Setup',
      items: [
        {
          title: 'Create the resource group',
          code: c`
            # same on every OS (variables from step 1)
            az group create --name $RG --location $LOCATION --tags app=my-node-api env=prod
            `,
          note: 'A resource group is a folder for everything this app uses. Deleting it deletes every resource inside (see step 19).',
        },
        {
          title: 'Naming rules that trip people up',
          lang: 'text',
          code: c`
            Resource                 Example            Rules
            Resource group           my-app-rg          unique in the subscription
            Web app / Function app   my-node-api        globally unique → <name>.azurewebsites.net
            Storage account          myappstore123      3–24 chars, lowercase letters + digits only, global
            Key Vault                my-app-kv-123      3–24 chars, letters, digits, hyphens, global
            PostgreSQL server        my-app-pg          global → <name>.postgres.database.azure.com
            Service Bus namespace    my-app-bus         global → <name>.servicebus.windows.net
            `,
          note: 'Add a short suffix (team initials, random digits) to globally unique names. Tag every resource with app and env so cost reports can be filtered.',
        },
        {
          title: 'Separate environments',
          note: 'Use one resource group per environment (my-app-dev-rg, my-app-prod-rg), or separate subscriptions for strict isolation. Everything below uses a single production group.',
        },
      ],
    },
    {
      id: 'express',
      title: '3. Prepare the Express app',
      group: 'Deploy a Node API (App Service)',
      items: [
        {
          title: 'server.js: listen on process.env.PORT',
          lang: 'js',
          code: c`
            import express from 'express'

            const app = express()
            app.set('trust proxy', 1)                   // App Service terminates HTTPS in front of you
            app.use(express.json())

            app.get('/health', (req, res) => res.json({ ok: true }))
            app.get('/api/hello', (req, res) => res.json({ hello: 'Azure' }))

            const port = process.env.PORT || 3000       // App Service sets PORT (8080 on Linux)
            const server = app.listen(port, () => console.log('Listening on ' + port))

            process.on('SIGTERM', () => server.close(() => process.exit(0)))   // graceful restarts and swaps
            `,
          note: 'Never hard-code the port. App Service routes traffic to whatever PORT it gives you.',
        },
        {
          title: 'package.json: start script and Node version',
          lang: 'json',
          code: c`
            {
              "name": "my-node-api",
              "type": "module",
              "scripts": {
                "start": "node server.js",
                "build": "echo \"no build step\""
              },
              "engines": { "node": ">=24" },
              "dependencies": { "express": "^5.1.0" }
            }
            `,
          note: 'App Service runs "npm start" by default. If you use TypeScript, make "build" compile to dist/ and "start" run node dist/server.js. The build runs during deployment (step 4).',
        },
        {
          title: 'Run it locally',
          code: c`
            # same on every OS
            npm install
            npm start
            curl http://localhost:3000/health
            `,
        },
      ],
    },
    {
      id: 'appservice',
      title: '4. Create the App Service and deploy',
      group: 'Deploy a Node API (App Service)',
      items: [
        {
          title: 'Check which Node versions App Service offers',
          code: c`
            # same on every OS
            az webapp list-runtimes --os linux --output table | grep -i node        # PowerShell: | Select-String node
            `,
          note: 'Use the exact string it prints, e.g. NODE:24-lts. If 24 is not listed yet in your CLI or region, use NODE:22-lts.',
        },
        {
          title: 'Quickest path: az webapp up',
          code: c`
            # same on every OS, run in the app folder
            az webapp up --name $APP --resource-group $RG --plan $PLAN --location $LOCATION ${BT}
              --os-type Linux --runtime "NODE:24-lts" --sku B1
            `,
          note: 'The line break above is a PowerShell backtick. In bash, replace it with \\ or put everything on one line. webapp up creates the plan and app, zips the folder and deploys it; re-run "az webapp up" (no flags) in the same folder to redeploy.',
        },
        {
          title: 'Production path: create the plan and the app explicitly',
          code: c`
            # macOS / Linux
            az appservice plan create --name $PLAN --resource-group $RG --location $LOCATION --is-linux --sku B1
            az webapp create --name $APP --resource-group $RG --plan $PLAN --runtime "NODE:24-lts"

            # Windows (PowerShell)
            az appservice plan create --name $PLAN --resource-group $RG --location $LOCATION --is-linux --sku B1
            az webapp create --name $APP --resource-group $RG --plan $PLAN --runtime "NODE:24-lts"
            `,
          note: 'B1 is the cheapest tier with always-on and custom domains with SSL. Deployment slots and autoscale need Standard (S1) or Premium (P0v3 and up). The plan is the server you pay for; several apps can share one plan.',
        },
        {
          title: 'Secure defaults',
          code: c`
            # same on every OS
            az webapp update --name $APP --resource-group $RG --https-only true
            az webapp config set --name $APP --resource-group $RG ${BT}
              --always-on true --min-tls-version 1.2 --ftps-state Disabled --http20-enabled true
            az webapp config set --name $APP --resource-group $RG ${BT}
              --generic-configurations '{"healthCheckPath": "/health"}'
            `,
          note: 'Bash users: replace the backtick line breaks with \\. The health check path lets App Service take unhealthy instances out of rotation once you run more than one.',
        },
        {
          title: 'Build on deploy (npm install on the server)',
          code: c`
            # same on every OS
            az webapp config appsettings set --name $APP --resource-group $RG ${BT}
              --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true NODE_ENV=production
            `,
          note: 'With this setting the zip contains only your source; App Service (Oryx) runs npm install and npm run build if present. Set it to false when CI uploads a zip that already contains node_modules.',
        },
        {
          title: 'Zip deploy',
          code: c`
            # same on every OS (zips tracked files only, so node_modules and .env are left out)
            git archive --format=zip --output app.zip HEAD
            az webapp deploy --name $APP --resource-group $RG --src-path app.zip --type zip

            curl https://$APP.azurewebsites.net/health
            `,
          note: 'Not using git?',
          then: [
            {
              label: 'macOS / Linux',
              lang: 'bash',
              code: c`
                zip -r app.zip . -x "node_modules/*" ".git/*" ".env"
                `,
            },
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                Get-ChildItem -Exclude node_modules,.git,.env | Compress-Archive -DestinationPath app.zip -Force
                `,
            },
          ],
        },
        {
          title: 'Custom startup command (only if not "npm start")',
          code: c`
            # same on every OS
            az webapp config set --name $APP --resource-group $RG --startup-file "node dist/server.js"
            `,
        },
      ],
    },
    {
      id: 'appservice-config',
      title: '5. Settings, logs, domain, slots & scaling',
      group: 'Deploy a Node API (App Service)',
      items: [
        {
          title: 'Environment variables (app settings)',
          code: c`
            # same on every OS
            az webapp config appsettings set --name $APP --resource-group $RG ${BT}
              --settings API_URL=https://api.example.com LOG_LEVEL=info
            az webapp config appsettings list --name $APP --resource-group $RG --output table
            az webapp config appsettings delete --name $APP --resource-group $RG --setting-names LOG_LEVEL
            `,
          note: 'They arrive as process.env.API_URL. Changing settings restarts the app. For secrets use Key Vault references (step 14) instead of plain values.',
        },
        {
          title: 'Live logs',
          code: c`
            # same on every OS
            az webapp log config --name $APP --resource-group $RG --docker-container-logging filesystem
            az webapp log tail --name $APP --resource-group $RG
            az webapp log download --name $APP --resource-group $RG --log-file logs.zip
            `,
          note: 'console.log output shows up here. For search, retention and alerts use Application Insights (step 16).',
        },
        {
          title: 'SSH into the running container',
          code: c`
            # same on every OS
            az webapp ssh --name $APP --resource-group $RG
            `,
          note: 'Or open https://my-node-api.scm.azurewebsites.net (Kudu) in a browser → SSH.',
        },
        {
          title: 'Custom domain: DNS records',
          code: c`
            # macOS / Linux
            VERIFY_ID=$(az webapp show --name $APP --resource-group $RG --query customDomainVerificationId --output tsv)
            echo $VERIFY_ID

            # Windows (PowerShell)
            $VERIFY_ID = az webapp show --name $APP --resource-group $RG --query customDomainVerificationId --output tsv
            $VERIFY_ID
            `,
          note: 'At your DNS provider (or Azure DNS, step 17), create these two records for www.example.com, wait a few minutes, then add the hostname:',
          then: [
            {
              label: 'Records',
              lang: 'text',
              code: c`
                CNAME  www            → my-node-api.azurewebsites.net
                TXT    asuid.www      → <VERIFY_ID value>
                (apex example.com: A @ → the app's inbound IP from "nslookup my-node-api.azurewebsites.net",
                 plus TXT asuid → <VERIFY_ID value>)
                `,
            },
            {
              label: 'Add the hostname',
              lang: 'bash',
              code: c`
                # same on every OS
                az webapp config hostname add --webapp-name $APP --resource-group $RG --hostname www.example.com
                `,
            },
          ],
        },
        {
          title: 'Free managed certificate + SNI binding',
          code: c`
            # macOS / Linux
            THUMB=$(az webapp config ssl create --name $APP --resource-group $RG ${BT}
              --hostname www.example.com --query thumbprint --output tsv)
            az webapp config ssl bind --name $APP --resource-group $RG --certificate-thumbprint $THUMB --ssl-type SNI

            # Windows (PowerShell)
            $THUMB = az webapp config ssl create --name $APP --resource-group $RG ${BT}
              --hostname www.example.com --query thumbprint --output tsv
            az webapp config ssl bind --name $APP --resource-group $RG --certificate-thumbprint $THUMB --ssl-type SNI
            `,
          note: 'In the bash block replace the backtick with \\. App Service managed certificates are free and auto-renew, but need Basic tier or higher and the hostname already added; wildcard certificates are not supported.',
        },
        {
          title: 'Deployment slots: deploy to staging, then swap',
          code: c`
            # same on every OS — slots need Standard (S1) or Premium
            az appservice plan update --name $PLAN --resource-group $RG --sku P0V3

            az webapp deployment slot create --name $APP --resource-group $RG --slot staging --configuration-source $APP
            az webapp deploy --name $APP --resource-group $RG --slot staging --src-path app.zip --type zip
            curl https://$APP-staging.azurewebsites.net/health

            az webapp deployment slot swap --name $APP --resource-group $RG --slot staging --target-slot production
            `,
          note: 'The swap warms up the staging instance first, so there is no downtime; swap again to roll back. Settings that must stay with a slot (e.g. a staging database URL) are set with --slot-settings:',
          then: [
            {
              label: 'Slot-sticky setting',
              lang: 'bash',
              code: c`
                # same on every OS
                az webapp config appsettings set --name $APP --resource-group $RG --slot staging ${BT}
                  --slot-settings DATABASE_URL=postgresql://staging-host/app
                `,
            },
          ],
        },
        {
          title: 'Scale up and out',
          code: c`
            # same on every OS
            az appservice plan update --name $PLAN --resource-group $RG --sku P1V3            # bigger instances
            az appservice plan update --name $PLAN --resource-group $RG --number-of-workers 3 # more instances
            `,
        },
        {
          title: 'Autoscale on CPU',
          code: c`
            # same on every OS (Standard tier or higher)
            az monitor autoscale create --resource-group $RG --name my-app-autoscale ${BT}
              --resource $PLAN --resource-type Microsoft.Web/serverfarms --min-count 1 --max-count 5 --count 1
            az monitor autoscale rule create --resource-group $RG --autoscale-name my-app-autoscale ${BT}
              --condition "CpuPercentage > 70 avg 10m" --scale out 1
            az monitor autoscale rule create --resource-group $RG --autoscale-name my-app-autoscale ${BT}
              --condition "CpuPercentage < 30 avg 10m" --scale in 1
            `,
          note: 'With more than one instance, keep sessions, caches and uploads in Redis, the database or Blob Storage, never on local disk.',
        },
      ],
    },
    {
      id: 'containerapps',
      title: '6. Alternative: Azure Container Apps',
      group: 'Alternatives',
      items: [
        {
          title: 'When to pick it',
          note: 'Container Apps runs any Docker image with HTTPS, revisions and scale to zero (pay nothing when idle). Choose it over App Service if you already ship containers, want background workers that scale on queue length, or want near-zero cost for low traffic.',
        },
        {
          title: 'Dockerfile',
          lang: 'dockerfile',
          code: c`
            FROM node:24-alpine
            WORKDIR /app
            ENV NODE_ENV=production
            COPY package*.json ./
            RUN npm ci --omit=dev
            COPY . .
            USER node
            EXPOSE 3000
            CMD ["node", "server.js"]
            `,
        },
        {
          title: 'Build and deploy from source',
          code: c`
            # same on every OS
            az extension add --name containerapp --upgrade
            az containerapp up --name my-node-api --resource-group $RG --location $LOCATION ${BT}
              --environment my-app-env --source . --ingress external --target-port 3000
            `,
          note: 'This builds the image in the cloud (Dockerfile, or buildpacks if none), creates a container registry, a Container Apps environment and a Log Analytics workspace. Re-run the same command to deploy a new version. Use --image myregistry.azurecr.io/my-node-api:1.0 instead of --source to deploy an existing image.',
        },
        {
          title: 'URL, env vars, secrets and scaling',
          code: c`
            # same on every OS
            az containerapp show --name my-node-api --resource-group $RG ${BT}
              --query properties.configuration.ingress.fqdn --output tsv

            az containerapp secret set --name my-node-api --resource-group $RG --secrets db-password=CHANGE_ME
            az containerapp update --name my-node-api --resource-group $RG ${BT}
              --set-env-vars NODE_ENV=production DB_PASSWORD=secretref:db-password ${BT}
              --min-replicas 0 --max-replicas 5

            az containerapp logs show --name my-node-api --resource-group $RG --follow
            `,
          note: 'min-replicas 0 means scale to zero; the first request after idle has a cold start of a few seconds. Set it to 1 for a always-warm API.',
        },
        {
          title: 'Managed identity and custom domain',
          code: c`
            # same on every OS
            az containerapp identity assign --name my-node-api --resource-group $RG --system-assigned
            az containerapp hostname add --name my-node-api --resource-group $RG --hostname api.example.com
            az containerapp hostname bind --name my-node-api --resource-group $RG ${BT}
              --hostname api.example.com --environment my-app-env --validation-method CNAME
            `,
          note: 'Role assignments for the identity work exactly as in step 13. hostname bind with a managed certificate needs the CNAME and asuid TXT record in place first; check "az containerapp hostname add" output for the exact values.',
        },
      ],
    },
    {
      id: 'functions',
      title: '7. Alternative: Azure Functions (Node v4 model)',
      group: 'Alternatives',
      items: [
        {
          title: 'Install Azure Functions Core Tools',
          code: c`
            # macOS
            brew tap azure/functions
            brew install azure-functions-core-tools@4

            # Linux (Ubuntu)
            curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
            sudo mv microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg
            sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-ubuntu-$(lsb_release -cs)-prod $(lsb_release -cs) main" > /etc/apt/sources.list.d/dotnetdev.list'
            sudo apt-get update && sudo apt-get install -y azure-functions-core-tools-4

            # Windows (PowerShell)
            winget install -e --id Microsoft.Azure.FunctionsCoreTools

            # any OS, via npm (alternative)
            npm install -g azure-functions-core-tools@4

            # same on every OS
            func --version                  # 4.x
            `,
          note: 'On Debian, replace microsoft-ubuntu-<codename> with microsoft-debian-<codename> in the repo line.',
        },
        {
          title: 'Create a project and an HTTP function',
          code: c`
            # same on every OS
            func init my-func --worker-runtime node --language javascript
            cd my-func
            func new --name hello --template "HTTP trigger"
            func start                      # http://localhost:7071/api/hello
            `,
        },
        {
          title: 'src/functions/hello.js',
          lang: 'js',
          code: c`
            const { app } = require('@azure/functions')

            app.http('hello', {
              methods: ['GET', 'POST'],
              authLevel: 'anonymous',            // 'function' requires a key in ?code=...
              route: 'hello/{name?}',
              handler: async (request, context) => {
                const name = request.params.name || request.query.get('name') || 'world'
                context.log('hello called for', name)
                return { status: 200, jsonBody: { hello: name } }
              },
            })
            `,
          note: 'The v4 model registers functions in code (no function.json). Read a JSON body with await request.json().',
        },
        {
          title: 'Create the Function App (Flex Consumption) and publish',
          code: c`
            # same on every OS
            az storage account create --name myfuncstore123 --resource-group $RG --location $LOCATION --sku Standard_LRS
            az functionapp create --name my-func-app --resource-group $RG --storage-account myfuncstore123 ${BT}
              --flexconsumption-location $LOCATION --runtime node --runtime-version 22

            func azure functionapp publish my-func-app
            `,
          note: 'Flex Consumption is the current pay-per-use plan. Check which Node versions it supports with "az functionapp list-flexconsumption-runtimes --location southeastasia --runtime node" and use 24 once listed. App settings and identity commands are the same as App Service with "az functionapp" instead of "az webapp".',
        },
      ],
    },
    {
      id: 'vm',
      title: '8. Alternative: a plain Ubuntu VM',
      group: 'Alternatives',
      items: [
        {
          title: 'Create an Ubuntu 24.04 VM',
          code: c`
            # macOS / Linux
            az vm create --resource-group $RG --name my-app-vm --image Ubuntu2404 --size Standard_B2s \
              --admin-username azureuser --generate-ssh-keys --public-ip-sku Standard --assign-identity
            IP=$(az vm show --resource-group $RG --name my-app-vm --show-details --query publicIps --output tsv)

            # Windows (PowerShell)
            az vm create --resource-group $RG --name my-app-vm --image Ubuntu2404 --size Standard_B2s ${BT}
              --admin-username azureuser --generate-ssh-keys --public-ip-sku Standard --assign-identity
            $IP = az vm show --resource-group $RG --name my-app-vm --show-details --query publicIps --output tsv
            `,
          note: '--generate-ssh-keys uses ~/.ssh/id_rsa.pub (creating it if missing). The public IP is static with the Standard SKU. --assign-identity gives the VM a managed identity for step 13.',
        },
        {
          title: 'Open ports 80 and 443, then connect',
          code: c`
            # same on every OS
            az vm open-port --resource-group $RG --name my-app-vm --port 80 --priority 900
            az vm open-port --resource-group $RG --name my-app-vm --port 443 --priority 910
            ssh azureuser@$IP
            `,
          note: 'Port 22 is open to the internet by default; restrict it in the network security group to your IP, or use Azure Bastion.',
        },
        {
          title: 'Then follow the AWS sheet',
          note: 'The server steps in the AWS sheet (steps 6–11: baseline, deploying Node behind Nginx with PM2, DNS, HTTPS, deploys and operations) work unchanged on an Azure VM. Log in as azureuser instead of ubuntu.',
        },
      ],
    },
    {
      id: 'postgres',
      title: '9. PostgreSQL Flexible Server',
      group: 'Database',
      items: [
        {
          title: 'Create the server',
          code: c`
            # macOS / Linux
            read -s -p "DB admin password: " DB_ADMIN_PASSWORD; echo
            az postgres flexible-server create --resource-group $RG --name my-app-pg --location $LOCATION \
              --tier Burstable --sku-name Standard_B1ms --storage-size 32 --version 16 \
              --admin-user appadmin --admin-password "$DB_ADMIN_PASSWORD" \
              --public-access 0.0.0.0 --backup-retention 7 --yes

            # Windows (PowerShell)
            $DB_ADMIN_PASSWORD = Read-Host "DB admin password" -MaskInput
            az postgres flexible-server create --resource-group $RG --name my-app-pg --location $LOCATION ${BT}
              --tier Burstable --sku-name Standard_B1ms --storage-size 32 --version 16 ${BT}
              --admin-user appadmin --admin-password "$DB_ADMIN_PASSWORD" ${BT}
              --public-access 0.0.0.0 --backup-retention 7 --yes
            `,
          note: 'Takes 5–10 minutes. --public-access 0.0.0.0 allows connections from Azure services only (including other customers\' Azure resources), so a strong password and SSL still matter. Newer PostgreSQL versions (17) may be offered; check the portal.',
        },
        {
          title: 'Allow your own IP (for migrations / psql)',
          code: c`
            # macOS / Linux
            MY_IP=$(curl -s https://api.ipify.org)
            az postgres flexible-server firewall-rule create --resource-group $RG --name my-app-pg \
              --rule-name my-laptop --start-ip-address $MY_IP --end-ip-address $MY_IP

            # Windows (PowerShell)
            $MY_IP = (Invoke-RestMethod https://api.ipify.org).Trim()
            az postgres flexible-server firewall-rule create --resource-group $RG --name my-app-pg ${BT}
              --rule-name my-laptop --start-ip-address $MY_IP --end-ip-address $MY_IP
            `,
          note: 'Delete the rule when done: az postgres flexible-server firewall-rule delete --resource-group my-app-rg --name my-app-pg --rule-name my-laptop --yes.',
        },
        {
          title: 'Private networking instead (most secure)',
          code: c`
            # same on every OS — private access must be chosen at creation time
            az postgres flexible-server create --resource-group $RG --name my-app-pg --location $LOCATION ${BT}
              --tier Burstable --sku-name Standard_B1ms --version 16 ${BT}
              --vnet my-app-vnet --subnet db-subnet --private-dns-zone my-app-pg.private.postgres.database.azure.com ${BT}
              --admin-user appadmin --admin-password "$DB_ADMIN_PASSWORD"

            # let the web app reach the VNet (needs its own empty subnet)
            az network vnet subnet create --resource-group $RG --vnet-name my-app-vnet --name app-subnet --address-prefixes 10.0.2.0/24
            az webapp vnet-integration add --name $APP --resource-group $RG --vnet my-app-vnet --subnet app-subnet
            `,
          note: 'The server then has no public endpoint at all. You cannot switch an existing public server to VNet-injected; recreate it (or add a Private Endpoint).',
        },
        {
          title: 'Create the app database and connect',
          code: c`
            # same on every OS
            az postgres flexible-server db create --resource-group $RG --server-name my-app-pg --database-name app
            psql "host=my-app-pg.postgres.database.azure.com port=5432 dbname=app user=appadmin sslmode=require"
            `,
          note: 'Install psql with brew install libpq (macOS), sudo apt install postgresql-client (Linux) or winget install PostgreSQL.PostgreSQL (Windows). Create a separate, least-privileged app user rather than using appadmin in the app.',
        },
        {
          title: 'Give the app its connection string',
          code: c`
            # same on every OS
            az webapp config appsettings set --name $APP --resource-group $RG ${BT}
              --settings "DATABASE_URL=postgresql://app_user:PASSWORD@my-app-pg.postgres.database.azure.com:5432/app?sslmode=require"
            `,
          note: 'Better: store the password in Key Vault and use a Key Vault reference (step 14). URL-encode special characters in the password.',
        },
        {
          title: 'Node.js (pg): SSL is required',
          lang: 'js',
          code: c`
            // npm i pg
            import pg from 'pg'

            export const db = new pg.Pool({
              connectionString: process.env.DATABASE_URL,
              ssl: { rejectUnauthorized: true },     // Azure's CA (DigiCert / Microsoft root) is in Node's trust store
              max: 10,
            })

            const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [42])
            `,
          note: 'Using Sequelize?',
          then: [
            {
              label: 'Sequelize',
              lang: 'js',
              code: c`
                import { Sequelize } from 'sequelize'

                export const sequelize = new Sequelize(process.env.DATABASE_URL, {
                  dialect: 'postgres',
                  dialectOptions: { ssl: { require: true, rejectUnauthorized: true } },
                  pool: { max: 10, idle: 10000 },
                  logging: false,
                })
                `,
            },
          ],
        },
        {
          title: 'Passwordless with Microsoft Entra ID',
          lang: 'js',
          code: c`
            // npm i pg @azure/identity — the token is the password and lasts about an hour
            import pg from 'pg'
            import { DefaultAzureCredential } from '@azure/identity'

            const credential = new DefaultAzureCredential()
            export const db = new pg.Pool({
              host: 'my-app-pg.postgres.database.azure.com',
              database: 'app',
              user: 'my-node-api',                    // the Entra role name you created for the app's identity
              ssl: { rejectUnauthorized: true },
              password: async () => (await credential.getToken('https://ossrdbms-aad.database.windows.net/.default')).token,
            })
            `,
          note: 'Enable Microsoft Entra authentication on the server (portal → Authentication), set an Entra admin, then create a database role for the web app\'s managed identity. The exact CLI flags have been renamed across az versions, so check "az postgres flexible-server update --help".',
        },
        {
          title: 'Backups and point-in-time restore',
          code: c`
            # same on every OS
            az postgres flexible-server update --resource-group $RG --name my-app-pg --backup-retention 14
            az postgres flexible-server backup list --resource-group $RG --name my-app-pg --output table

            # restore to a NEW server as of a moment in time (UTC)
            az postgres flexible-server restore --resource-group $RG --name my-app-pg-restored ${BT}
              --source-server my-app-pg --restore-time "2026-10-17T09:30:00Z"
            `,
          note: 'Automatic backups are on by default (7–35 days). A restore always creates a new server; point the app at it, then delete the old one.',
        },
        {
          title: 'Save money while developing',
          code: c`
            # same on every OS
            az postgres flexible-server stop --resource-group $RG --name my-app-pg
            az postgres flexible-server start --resource-group $RG --name my-app-pg
            `,
          note: 'A stopped server still bills storage and starts again automatically after 7 days.',
        },
      ],
    },
    {
      id: 'mysql',
      title: '10. MySQL Flexible Server (if you use MySQL)',
      group: 'Database',
      items: [
        {
          title: 'Create the server and database',
          code: c`
            # macOS / Linux
            az mysql flexible-server create --resource-group $RG --name my-app-mysql --location $LOCATION \
              --tier Burstable --sku-name Standard_B1ms --storage-size 32 --version 8.0.21 \
              --admin-user appadmin --admin-password "$DB_ADMIN_PASSWORD" --public-access 0.0.0.0 --yes
            az mysql flexible-server db create --resource-group $RG --server-name my-app-mysql --database-name app

            # Windows (PowerShell)
            az mysql flexible-server create --resource-group $RG --name my-app-mysql --location $LOCATION ${BT}
              --tier Burstable --sku-name Standard_B1ms --storage-size 32 --version 8.0.21 ${BT}
              --admin-user appadmin --admin-password "$DB_ADMIN_PASSWORD" --public-access 0.0.0.0 --yes
            az mysql flexible-server db create --resource-group $RG --server-name my-app-mysql --database-name app
            `,
          note: 'MySQL 8.4 LTS may also be available in your region. Firewall rules, restore, stop and start use the same subcommands as PostgreSQL with "mysql" in place of "postgres".',
        },
        {
          title: 'Node.js (mysql2) with SSL',
          lang: 'js',
          code: c`
            // npm i mysql2
            import mysql from 'mysql2/promise'

            export const db = mysql.createPool({
              host: 'my-app-mysql.mysql.database.azure.com',
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: 'app',
              ssl: { rejectUnauthorized: true },     // require_secure_transport is ON by default
              connectionLimit: 10,
            })

            const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [42])
            `,
        },
      ],
    },
    {
      id: 'blob',
      title: '11. Blob Storage for uploads',
      group: 'Storage & queues',
      items: [
        {
          title: 'Create a storage account and a private container',
          code: c`
            # macOS / Linux
            STORAGE=myappstore123
            az storage account create --name $STORAGE --resource-group $RG --location $LOCATION \
              --sku Standard_LRS --kind StorageV2 --min-tls-version TLS1_2 --allow-blob-public-access false
            STORAGE_ID=$(az storage account show --name $STORAGE --resource-group $RG --query id --output tsv)

            # Windows (PowerShell)
            $STORAGE = "myappstore123"
            az storage account create --name $STORAGE --resource-group $RG --location $LOCATION ${BT}
              --sku Standard_LRS --kind StorageV2 --min-tls-version TLS1_2 --allow-blob-public-access false
            $STORAGE_ID = az storage account show --name $STORAGE --resource-group $RG --query id --output tsv
            `,
          note: 'Standard_LRS keeps 3 copies in one datacenter; use Standard_ZRS or Standard_GRS for higher durability.',
        },
        {
          title: 'Give yourself data access, then create the container',
          code: c`
            # macOS / Linux
            ME=$(az ad signed-in-user show --query id --output tsv)

            # Windows (PowerShell)
            $ME = az ad signed-in-user show --query id --output tsv

            # same on every OS
            az role assignment create --assignee $ME --role "Storage Blob Data Contributor" --scope $STORAGE_ID
            az storage container create --account-name $STORAGE --name uploads --auth-mode login
            `,
          note: 'Owner of the subscription is not enough to read blob data with --auth-mode login; data roles are separate. Role assignments can take a few minutes to apply.',
        },
        {
          title: 'Node.js: upload, download, list, delete',
          lang: 'js',
          code: c`
            // npm i @azure/storage-blob @azure/identity
            import { BlobServiceClient } from '@azure/storage-blob'
            import { DefaultAzureCredential } from '@azure/identity'

            const blobService = new BlobServiceClient(
              'https://' + process.env.STORAGE_ACCOUNT + '.blob.core.windows.net',
              new DefaultAzureCredential(),             // az login locally, managed identity in Azure
            )
            const container = blobService.getContainerClient('uploads')
            const blob = container.getBlockBlobClient('avatars/42.png')

            await blob.uploadData(buffer, { blobHTTPHeaders: { blobContentType: 'image/png' } })

            const data = await blob.downloadToBuffer()                 // small files
            const res = await blob.download()                           // large files: stream it
            res.readableStreamBody.pipe(httpResponse)

            for await (const item of container.listBlobsFlat({ prefix: 'avatars/' })) console.log(item.name)

            await blob.deleteIfExists()
            `,
          note: 'Set STORAGE_ACCOUNT=myappstore123 as an app setting and give the web app\'s identity "Storage Blob Data Contributor" (step 13). No connection string or key needed.',
        },
        {
          title: 'Node.js: short-lived download link (user delegation SAS)',
          lang: 'js',
          code: c`
            import { generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol } from '@azure/storage-blob'

            const startsOn = new Date(Date.now() - 60 * 1000)           // allow for clock skew
            const expiresOn = new Date(Date.now() + 10 * 60 * 1000)     // 10 minutes
            const key = await blobService.getUserDelegationKey(startsOn, expiresOn)

            const sas = generateBlobSASQueryParameters({
              containerName: 'uploads',
              blobName: 'avatars/42.png',
              permissions: BlobSASPermissions.parse('r'),               // 'cw' for a browser upload URL
              startsOn,
              expiresOn,
              protocol: SASProtocol.Https,
            }, key, process.env.STORAGE_ACCOUNT).toString()

            const url = blob.url + '?' + sas
            `,
          note: 'A user delegation SAS is signed with your managed identity, so no account key exists in the app. blob.generateSasUrl() is simpler but only works with an account key (StorageSharedKeyCredential).',
        },
        {
          title: 'Browser uploads straight to Blob Storage',
          lang: 'js',
          code: c`
            // browser: PUT the file to a write SAS URL returned by your API
            await fetch(uploadUrl, {
              method: 'PUT',
              headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': file.type },
              body: file,
            })
            `,
          note: 'Allow your site\'s origin with CORS first:',
          then: [
            {
              label: 'CORS rule',
              lang: 'bash',
              code: c`
                # same on every OS
                az storage cors add --account-name $STORAGE --services b --methods GET PUT ${BT}
                  --origins https://example.com --allowed-headers "*" --exposed-headers "*" --max-age 3600
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'servicebus',
      title: '12. Service Bus queues for background jobs',
      group: 'Storage & queues',
      items: [
        {
          title: 'Create a namespace and a queue',
          code: c`
            # same on every OS
            az servicebus namespace create --resource-group $RG --name my-app-bus --location $LOCATION --sku Basic
            az servicebus queue create --resource-group $RG --namespace-name my-app-bus --name jobs ${BT}
              --max-delivery-count 5 --lock-duration PT1M --enable-dead-lettering-on-message-expiration true
            `,
          note: 'Basic supports queues only; use Standard for topics/subscriptions (pub/sub) and scheduled or duplicate-detection features. After 5 failed deliveries a message moves to the dead-letter queue.',
        },
        {
          title: 'Grant the app send and receive rights',
          code: c`
            # macOS / Linux
            BUS_ID=$(az servicebus namespace show --resource-group $RG --name my-app-bus --query id --output tsv)

            # Windows (PowerShell)
            $BUS_ID = az servicebus namespace show --resource-group $RG --name my-app-bus --query id --output tsv

            # same on every OS ($PRINCIPAL_ID comes from step 13; $ME from step 11)
            az role assignment create --assignee-object-id $PRINCIPAL_ID --assignee-principal-type ServicePrincipal ${BT}
              --role "Azure Service Bus Data Sender" --scope $BUS_ID
            az role assignment create --assignee-object-id $PRINCIPAL_ID --assignee-principal-type ServicePrincipal ${BT}
              --role "Azure Service Bus Data Receiver" --scope $BUS_ID
            az role assignment create --assignee $ME --role "Azure Service Bus Data Owner" --scope $BUS_ID   # local dev
            `,
        },
        {
          title: 'Node.js: send a job',
          lang: 'js',
          code: c`
            // npm i @azure/service-bus @azure/identity
            import { ServiceBusClient } from '@azure/service-bus'
            import { DefaultAzureCredential } from '@azure/identity'

            export const bus = new ServiceBusClient('my-app-bus.servicebus.windows.net', new DefaultAzureCredential())
            const sender = bus.createSender('jobs')

            await sender.sendMessages({
              body: { type: 'send-welcome-email', userId: 42 },
              contentType: 'application/json',
              messageId: 'welcome-42',                  // used for de-duplication on Standard
            })
            `,
          note: 'Create the sender once at startup and reuse it; opening a connection per request is slow.',
        },
        {
          title: 'Node.js: worker that receives jobs',
          lang: 'js',
          code: c`
            const receiver = bus.createReceiver('jobs')     // default mode: peekLock

            receiver.subscribe({
              processMessage: async (msg) => {
                try {
                  await handleJob(msg.body)
                  await receiver.completeMessage(msg)          // done: remove from queue
                } catch (err) {
                  console.error('job failed', msg.messageId, err)
                  await receiver.abandonMessage(msg)           // retry later (until max delivery count)
                }
              },
              processError: async (args) => console.error('Service Bus error', args.error),
            }, { autoCompleteMessages: false, maxConcurrentCalls: 5 })

            process.on('SIGTERM', async () => { await receiver.close(); await bus.close(); process.exit(0) })
            `,
          note: 'Give up on a poison message immediately with receiver.deadLetterMessage(msg, { deadLetterReason: "BadPayload" }). Run the worker as a separate App Service app, a WebJob, or a Container Apps app that scales on queue length.',
        },
        {
          title: 'Inspect the dead-letter queue',
          lang: 'js',
          code: c`
            const dlq = bus.createReceiver('jobs', { subQueueType: 'deadLetter' })
            const messages = await dlq.receiveMessages(10, { maxWaitTimeInMs: 5000 })
            for (const m of messages) {
              console.log(m.messageId, m.deadLetterReason, m.body)
              await dlq.completeMessage(m)                  // or re-send it to 'jobs' after fixing the bug
            }
            await dlq.close()
            `,
        },
        {
          title: 'Simpler and cheaper: Storage Queues',
          lang: 'js',
          code: c`
            // npm i @azure/storage-queue — role: "Storage Queue Data Contributor"
            import { QueueClient } from '@azure/storage-queue'
            import { DefaultAzureCredential } from '@azure/identity'

            const queue = new QueueClient('https://myappstore123.queue.core.windows.net/jobs', new DefaultAzureCredential())
            await queue.createIfNotExists()
            await queue.sendMessage(Buffer.from(JSON.stringify({ userId: 42 })).toString('base64'))

            const { receivedMessageItems } = await queue.receiveMessages({ numberOfMessages: 10, visibilityTimeout: 60 })
            for (const m of receivedMessageItems) {
              const job = JSON.parse(Buffer.from(m.messageText, 'base64').toString())
              await handleJob(job)
              await queue.deleteMessage(m.messageId, m.popReceipt)
            }
            `,
          note: 'Storage Queues live in the storage account from step 11 and cost almost nothing, but have no built-in dead-lettering, sessions or topics; you poll them yourself.',
        },
      ],
    },
    {
      id: 'identity',
      title: '13. Managed Identity & role assignments',
      group: 'Security',
      items: [
        {
          title: 'Why',
          note: 'A managed identity is an Azure-managed account for your app. DefaultAzureCredential picks it up automatically in App Service, Functions, Container Apps and VMs, so there are no storage keys, connection strings or client secrets in your code or settings.',
        },
        {
          title: 'Turn it on for the web app',
          code: c`
            # macOS / Linux
            PRINCIPAL_ID=$(az webapp identity assign --name $APP --resource-group $RG --query principalId --output tsv)

            # Windows (PowerShell)
            $PRINCIPAL_ID = az webapp identity assign --name $APP --resource-group $RG --query principalId --output tsv
            `,
          note: 'Deployment slots have their own identity; run the command with --slot staging and grant that one too.',
        },
        {
          title: 'Grant it exactly what it needs',
          code: c`
            # same on every OS (scope = one resource, not the whole subscription)
            az role assignment create --assignee-object-id $PRINCIPAL_ID --assignee-principal-type ServicePrincipal ${BT}
              --role "Storage Blob Data Contributor" --scope $STORAGE_ID

            az role assignment list --assignee $PRINCIPAL_ID --all --output table
            `,
          note: 'Common roles: Storage Blob Data Contributor, Storage Queue Data Contributor, Azure Service Bus Data Sender / Receiver, Key Vault Secrets User. Passing --assignee-principal-type avoids a Microsoft Graph lookup that can fail right after the identity is created.',
        },
        {
          title: 'User-assigned identity (shared by several apps)',
          code: c`
            # macOS / Linux
            az identity create --name my-app-id --resource-group $RG
            ID_RESOURCE=$(az identity show --name my-app-id --resource-group $RG --query id --output tsv)
            ID_CLIENT=$(az identity show --name my-app-id --resource-group $RG --query clientId --output tsv)
            az webapp identity assign --name $APP --resource-group $RG --identities $ID_RESOURCE
            az webapp config appsettings set --name $APP --resource-group $RG --settings AZURE_CLIENT_ID=$ID_CLIENT

            # Windows (PowerShell)
            az identity create --name my-app-id --resource-group $RG
            $ID_RESOURCE = az identity show --name my-app-id --resource-group $RG --query id --output tsv
            $ID_CLIENT = az identity show --name my-app-id --resource-group $RG --query clientId --output tsv
            az webapp identity assign --name $APP --resource-group $RG --identities $ID_RESOURCE
            az webapp config appsettings set --name $APP --resource-group $RG --settings AZURE_CLIENT_ID=$ID_CLIENT
            `,
          note: 'AZURE_CLIENT_ID tells DefaultAzureCredential which user-assigned identity to use.',
        },
      ],
    },
    {
      id: 'keyvault',
      title: '14. Key Vault for secrets',
      group: 'Security',
      items: [
        {
          title: 'Create a vault with RBAC permissions',
          code: c`
            # macOS / Linux
            KV=my-app-kv-123
            az keyvault create --name $KV --resource-group $RG --location $LOCATION --enable-rbac-authorization true
            KV_ID=$(az keyvault show --name $KV --query id --output tsv)

            # Windows (PowerShell)
            $KV = "my-app-kv-123"
            az keyvault create --name $KV --resource-group $RG --location $LOCATION --enable-rbac-authorization true
            $KV_ID = az keyvault show --name $KV --query id --output tsv
            `,
          note: 'Soft delete is always on: a deleted vault keeps its name reserved for 90 days unless purged (step 19).',
        },
        {
          title: 'Let yourself write secrets and the app read them',
          code: c`
            # same on every OS ($ME from step 11, $PRINCIPAL_ID from step 13)
            az role assignment create --assignee $ME --role "Key Vault Secrets Officer" --scope $KV_ID
            az role assignment create --assignee-object-id $PRINCIPAL_ID --assignee-principal-type ServicePrincipal ${BT}
              --role "Key Vault Secrets User" --scope $KV_ID
            `,
        },
        {
          title: 'Store a secret',
          code: c`
            # same on every OS
            az keyvault secret set --vault-name $KV --name DbPassword --value "the-real-password"
            az keyvault secret show --vault-name $KV --name DbPassword --query value --output tsv
            `,
          note: 'Secret names allow letters, digits and hyphens only. Typing a secret on the command line leaves it in shell history; use --file secret.txt or a prompt for sensitive values.',
        },
        {
          title: 'Key Vault references in app settings (no code changes)',
          code: c`
            # same on every OS
            az webapp config appsettings set --name $APP --resource-group $RG ${BT}
              --settings "DB_PASSWORD=@Microsoft.KeyVault(SecretUri=https://my-app-kv-123.vault.azure.net/secrets/DbPassword/)"
            `,
          note: 'App Service resolves the reference with the app\'s managed identity and your code just reads process.env.DB_PASSWORD. Leaving off the version picks up new secret versions within about a day, or immediately on restart. Portal → Environment variables shows a green tick when the reference resolves.',
        },
        {
          title: 'Read secrets in code (@azure/keyvault-secrets)',
          lang: 'js',
          code: c`
            // npm i @azure/keyvault-secrets @azure/identity
            import { SecretClient } from '@azure/keyvault-secrets'
            import { DefaultAzureCredential } from '@azure/identity'

            const secrets = new SecretClient('https://my-app-kv-123.vault.azure.net', new DefaultAzureCredential())

            const { value: dbPassword } = await secrets.getSecret('DbPassword')
            `,
          note: 'Load secrets once at startup and cache them; Key Vault throttles high request rates.',
        },
        {
          title: 'Never store keys in code',
          note: 'Keep .env out of git, prefer managed identity over keys, put the remaining secrets in Key Vault, and if a key ever lands in a commit, rotate it (az storage account keys renew, new database password) rather than just deleting the line.',
        },
      ],
    },
    {
      id: 'monitoring',
      title: '15. Application Insights & alerts',
      group: 'Go live',
      items: [
        {
          title: 'Create a workspace-based Application Insights resource',
          code: c`
            # macOS / Linux
            az extension add --name application-insights --upgrade
            az monitor log-analytics workspace create --resource-group $RG --workspace-name my-app-logs --location $LOCATION
            LAW_ID=$(az monitor log-analytics workspace show --resource-group $RG --workspace-name my-app-logs --query id --output tsv)
            az monitor app-insights component create --app my-app-insights --resource-group $RG --location $LOCATION --workspace $LAW_ID
            AI_CONN=$(az monitor app-insights component show --app my-app-insights --resource-group $RG --query connectionString --output tsv)
            az webapp config appsettings set --name $APP --resource-group $RG --settings "APPLICATIONINSIGHTS_CONNECTION_STRING=$AI_CONN"

            # Windows (PowerShell)
            az extension add --name application-insights --upgrade
            az monitor log-analytics workspace create --resource-group $RG --workspace-name my-app-logs --location $LOCATION
            $LAW_ID = az monitor log-analytics workspace show --resource-group $RG --workspace-name my-app-logs --query id --output tsv
            az monitor app-insights component create --app my-app-insights --resource-group $RG --location $LOCATION --workspace $LAW_ID
            $AI_CONN = az monitor app-insights component show --app my-app-insights --resource-group $RG --query connectionString --output tsv
            az webapp config appsettings set --name $APP --resource-group $RG --settings "APPLICATIONINSIGHTS_CONNECTION_STRING=$AI_CONN"
            `,
        },
        {
          title: 'Node.js: Azure Monitor OpenTelemetry',
          lang: 'js',
          code: c`
            // npm i @azure/monitor-opentelemetry
            // instrumentation.js — must load before express, pg, etc.
            import { useAzureMonitor } from '@azure/monitor-opentelemetry'

            useAzureMonitor({
              azureMonitorExporterOptions: { connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING },
            })
            `,
          note: 'Load it first by changing the start script:',
          then: [
            {
              label: 'package.json',
              lang: 'json',
              code: c`
                "scripts": { "start": "node --import ./instrumentation.js server.js" }
                `,
            },
          ],
        },
        {
          title: 'No-code option',
          note: 'App Service on Linux can auto-instrument Node apps: portal → your app → Application Insights → Turn on. The older "applicationinsights" npm package (v3) also works and wraps the same OpenTelemetry distro.',
        },
        {
          title: 'Email alert on server errors',
          code: c`
            # macOS / Linux
            az monitor action-group create --resource-group $RG --name ops --short-name ops ${BT}
              --action email admin admin@example.com
            APP_ID=$(az webapp show --name $APP --resource-group $RG --query id --output tsv)

            # Windows (PowerShell)
            az monitor action-group create --resource-group $RG --name ops --short-name ops ${BT}
              --action email admin admin@example.com
            $APP_ID = az webapp show --name $APP --resource-group $RG --query id --output tsv

            # same on every OS
            az monitor metrics alert create --resource-group $RG --name http-5xx --scopes $APP_ID ${BT}
              --condition "total Http5xx > 10" --window-size 5m --evaluation-frequency 1m --action ops
            `,
          note: 'Bash users: replace the backtick line breaks with \\. Add an availability test (portal → Application Insights → Availability) to get alerted when /health stops answering.',
        },
      ],
    },
    {
      id: 'dns',
      title: '16. Azure DNS',
      group: 'Go live',
      items: [
        {
          title: 'Any DNS provider works',
          note: 'You only need the CNAME and asuid TXT records from step 5. If your domain is managed elsewhere (Cloudflare, Namecheap…), add them there and skip this step.',
        },
        {
          title: 'Create the zone and delegate it',
          code: c`
            # same on every OS
            az network dns zone create --resource-group $RG --name example.com
            az network dns zone show --resource-group $RG --name example.com --query nameServers --output tsv
            `,
          note: 'Copy the four nameservers into your registrar\'s nameserver settings. Propagation can take hours.',
        },
        {
          title: 'Records for App Service',
          code: c`
            # same on every OS ($VERIFY_ID from step 5)
            az network dns record-set cname set-record --resource-group $RG --zone-name example.com ${BT}
              --record-set-name www --cname my-node-api.azurewebsites.net
            az network dns record-set txt add-record --resource-group $RG --zone-name example.com ${BT}
              --record-set-name asuid.www --value $VERIFY_ID

            # apex (example.com): A record to the app's inbound IP + asuid TXT
            az network dns record-set a add-record --resource-group $RG --zone-name example.com ${BT}
              --record-set-name "@" --ipv4-address 20.0.0.10
            az network dns record-set txt add-record --resource-group $RG --zone-name example.com ${BT}
              --record-set-name asuid --value $VERIFY_ID
            `,
          note: 'Replace 20.0.0.10 with the IP from "nslookup my-node-api.azurewebsites.net". Bash users: replace the backtick line breaks with \\.',
        },
        {
          title: 'Check',
          code: c`
            # same on every OS
            nslookup www.example.com
            az network dns record-set list --resource-group $RG --zone-name example.com --output table
            `,
        },
      ],
    },
    {
      id: 'cicd-oidc',
      title: '17. GitHub Actions: log in with OIDC',
      group: 'Go live',
      items: [
        {
          title: 'Why OIDC',
          note: 'GitHub gets a short-lived Azure token for each run through a federated credential, so there is no client secret or publish profile stored in GitHub that could leak.',
        },
        {
          title: 'Create the app registration and service principal',
          code: c`
            # macOS / Linux
            CLIENT_ID=$(az ad app create --display-name github-deploy-my-node-api --query appId --output tsv)
            SP_ID=$(az ad sp create --id $CLIENT_ID --query id --output tsv)
            TENANT_ID=$(az account show --query tenantId --output tsv)
            WEBAPP_ID=$(az webapp show --name $APP --resource-group $RG --query id --output tsv)

            # Windows (PowerShell)
            $CLIENT_ID = az ad app create --display-name github-deploy-my-node-api --query appId --output tsv
            $SP_ID = az ad sp create --id $CLIENT_ID --query id --output tsv
            $TENANT_ID = az account show --query tenantId --output tsv
            $WEBAPP_ID = az webapp show --name $APP --resource-group $RG --query id --output tsv
            `,
        },
        {
          title: 'Trust only your repo\'s production environment',
          lang: 'json',
          code: c`
            {
              "name": "github-production",
              "issuer": "https://token.actions.githubusercontent.com",
              "subject": "repo:your-org/your-app:environment:production",
              "audiences": ["api://AzureADTokenExchange"]
            }
            `,
          note: 'Save as federated.json. The subject must match how the job runs: environment:production for jobs with environment: production, or ref:refs/heads/main for jobs without one.',
          then: [
            {
              label: 'Add it and grant deploy rights on the web app only',
              lang: 'bash',
              code: c`
                # same on every OS
                az ad app federated-credential create --id $CLIENT_ID --parameters federated.json
                az role assignment create --assignee-object-id $SP_ID --assignee-principal-type ServicePrincipal ${BT}
                  --role "Website Contributor" --scope $WEBAPP_ID
                `,
            },
          ],
        },
        {
          title: 'Store the IDs in GitHub',
          code: c`
            # same on every OS (GitHub CLI, in the repo folder)
            gh secret set AZURE_CLIENT_ID --body $CLIENT_ID
            gh secret set AZURE_TENANT_ID --body $TENANT_ID
            gh secret set AZURE_SUBSCRIPTION_ID --body $SUBSCRIPTION_ID
            `,
          note: 'These are identifiers, not passwords, but keeping them as secrets hides them from logs. Create the "production" environment in GitHub → Settings → Environments (add required reviewers if you want a manual approval).',
        },
      ],
    },
    {
      id: 'cicd-workflow',
      title: '18. GitHub Actions: build, test, deploy',
      group: 'Go live',
      items: [
        {
          title: '.github/workflows/deploy.yml',
          lang: 'yaml',
          code: c`
            name: Deploy
            on:
              push:
                branches: [main]

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
                  - run: npm test --if-present
                  - run: npm run build --if-present
                  - run: npm prune --omit=dev
                  - run: zip -r release.zip . -x ".git/*" ".github/*"
                  - uses: actions/upload-artifact@v4
                    with: { name: app, path: release.zip }

              deploy:
                needs: build
                runs-on: ubuntu-latest
                environment: production
                permissions:
                  id-token: write                 # required for OIDC
                  contents: read
                steps:
                  - uses: actions/download-artifact@v4
                    with: { name: app }
                  - uses: azure/login@v2
                    with:
                      client-id: ${GH} secrets.AZURE_CLIENT_ID }}
                      tenant-id: ${GH} secrets.AZURE_TENANT_ID }}
                      subscription-id: ${GH} secrets.AZURE_SUBSCRIPTION_ID }}
                  - uses: azure/webapps-deploy@v3
                    with:
                      app-name: my-node-api
                      package: release.zip
            `,
          note: 'The zip already contains node_modules, so turn off build on deploy: az webapp config appsettings set --name my-node-api --resource-group my-app-rg --settings SCM_DO_BUILD_DURING_DEPLOYMENT=false.',
        },
        {
          title: 'Deploy to staging and swap',
          lang: 'yaml',
          code: c`
                  - uses: azure/webapps-deploy@v3
                    with:
                      app-name: my-node-api
                      slot-name: staging
                      package: release.zip
                  - run: curl --fail --retry 10 --retry-delay 6 https://my-node-api-staging.azurewebsites.net/health
                  - run: az webapp deployment slot swap --name my-node-api --resource-group my-app-rg --slot staging --target-slot production
            `,
          note: 'Replaces the last step of the deploy job. Requires a Standard or Premium plan (step 5).',
        },
        {
          title: 'Container Apps from CI',
          lang: 'yaml',
          code: c`
                  - uses: azure/login@v2
                    with:
                      client-id: ${GH} secrets.AZURE_CLIENT_ID }}
                      tenant-id: ${GH} secrets.AZURE_TENANT_ID }}
                      subscription-id: ${GH} secrets.AZURE_SUBSCRIPTION_ID }}
                  - run: |
                      az extension add --name containerapp --upgrade
                      az containerapp up --name my-node-api --resource-group my-app-rg --source .
            `,
          note: 'The service principal then needs Contributor on the resource group (or the Container App plus its registry) instead of Website Contributor.',
        },
      ],
    },
    {
      id: 'costs',
      title: '19. Costs, hardening & cleanup',
      group: 'Go live',
      items: [
        {
          title: 'What costs money',
          lang: 'text',
          code: c`
            App Service plan          billed per hour while the plan EXISTS (stopping the app does not stop billing)
            PostgreSQL / MySQL        compute per hour + storage + backup storage beyond the free amount
            Container Apps            per vCPU-second / GiB-second while replicas run (zero when scaled to 0)
            Functions (Flex)          per execution + memory time; always-ready instances cost extra
            VM                        compute while running + disk + public IP (deallocate to stop compute)
            Log Analytics             per GB ingested (noisy debug logs add up)
            Storage, Service Bus      cheap at small scale; Service Bus Standard has a base monthly fee
            Key Vault, DNS zone       cents per month at small scale
            `,
          note: 'Check Cost Management → Cost analysis weekly at first, grouped by resource.',
        },
        {
          title: 'Production checklist',
          lang: 'text',
          code: c`
            ✓ https-only, TLS 1.2+, FTPS disabled, always-on, health check path
            ✓ managed identity everywhere; no keys or passwords in code or plain app settings
            ✓ database not open to the internet (VNet or tight firewall), SSL enforced, backups ≥ 7 days
            ✓ Application Insights + alerts on 5xx and availability
            ✓ staging slot + swap for zero-downtime deploys; CI deploys via OIDC
            ✓ resource locks on the production resource group
            ✓ a budget alert in Cost Management
            `,
        },
        {
          title: 'Protect production from accidental deletion',
          code: c`
            # same on every OS
            az lock create --name no-delete --resource-group $RG --lock-type CanNotDelete
            az lock delete --name no-delete --resource-group $RG          # before intentional teardown
            `,
        },
        {
          title: 'Tear everything down',
          code: c`
            # same on every OS
            az group delete --name $RG --yes --no-wait
            az group exists --name $RG                         # false when finished

            # Key Vault names stay reserved after deletion; free the name:
            az keyvault list-deleted --output table
            az keyvault purge --name my-app-kv-123
            `,
          note: 'Deleting the resource group removes every resource in it and stops all charges for them. Also delete the GitHub app registration if you made one: az ad app delete --id <CLIENT_ID>.',
        },
      ],
    },
  ],
}
