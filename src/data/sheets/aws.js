import { c, step, BT } from './shared/code.js'
import { connect, baseline, laravel, node, python, react, https, deploy, cicd, ops } from './shared/server-setup.js'

export default {
  slug: 'aws',
  title: 'AWS',
  tech: 'AWS',
  category: 'cloud',
  minutes: 80,
  lang: 'bash',
  description: 'Step by step from an empty AWS account to production: CLI setup on Windows, macOS or Linux, an Ubuntu EC2 server, deploying Laravel, Node, Python or React behind Nginx with HTTPS, then RDS databases, S3 file storage and SQS queues wired into your app.',
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
            Browser ──HTTPS──▶ Route 53 (DNS) ──▶ Elastic IP
                                                    │
                                              EC2 (Ubuntu 24.04)
                                              ├─ Nginx  :80/:443
                                              ├─ PHP-FPM │ PM2 (Node) │ Gunicorn/Uvicorn (Python)
                                              └─ queue worker (systemd)
                                                    │  IAM role (no keys on disk)
                                     ┌──────────────┼──────────────┐
                                    RDS            S3             SQS
            `,
          note: 'Steps 0–12 take you from an empty account to a live server. Steps 13–23 add RDS, S3 and SQS.',
        },
        {
          title: 'Which shell to use',
          lang: 'text',
          code: c`
            macOS / Linux  → Terminal (bash / zsh). Use the "macOS / Linux" lines.
            Windows        → PowerShell 7 or Windows Terminal. Use the "Windows (PowerShell)" lines.
                             (Or install WSL — "wsl --install" — and use the Linux lines.)
            Any OS         → AWS CloudShell (icon in the AWS console top bar) is a browser-based
                             Linux shell with the AWS CLI pre-installed and already logged in.

            Steps that run ON the server are always Linux.
            `,
        },
      ],
    },
    {
      id: 'cli',
      title: '1. AWS account & CLI on your computer',
      group: 'Setup',
      items: [
        {
          title: 'Secure the account first',
          note: 'Turn on MFA for the root user, then create an admin user in IAM Identity Center (or IAM) and use that from now on. In Billing → Budgets, create a monthly cost budget with an email alert.',
        },
        {
          title: 'Install the AWS CLI v2',
          code: c`
            # macOS
            brew install awscli
            # or: curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o AWSCLIV2.pkg && sudo installer -pkg AWSCLIV2.pkg -target /

            # Linux (x86_64)
            curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
            unzip awscliv2.zip && sudo ./aws/install

            # Windows (PowerShell)
            winget install -e --id Amazon.AWSCLI
            # or: msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
            # then open a NEW terminal

            # all OS
            aws --version
            `,
        },
        {
          title: 'Log in',
          code: c`
            # All OS — IAM Identity Center (recommended)
            aws configure sso
            aws sso login

            # All OS — access keys of an IAM user (simpler, less secure)
            aws configure
            # AWS Access Key ID / Secret / default region (e.g. ap-southeast-1) / output: json

            aws sts get-caller-identity      # confirms who you are
            `,
        },
        {
          title: 'Pick one region for everything',
          code: c`
            # macOS / Linux
            export AWS_REGION=ap-southeast-1
            aws configure set region $AWS_REGION

            # Windows (PowerShell)
            $env:AWS_REGION = "ap-southeast-1"
            aws configure set region $env:AWS_REGION
            `,
          note: 'Keep EC2, RDS, S3 and SQS in the same region: lower latency and no cross-region data charges.',
        },
      ],
    },
    {
      id: 'network',
      title: '2. Key pair & security group',
      group: 'Setup',
      items: [
        {
          title: 'Create an SSH key pair',
          code: c`
            # macOS / Linux
            mkdir -p ~/.ssh
            aws ec2 create-key-pair --key-name app-key --key-type ed25519 \
              --query KeyMaterial --output text > ~/.ssh/app-key.pem
            chmod 400 ~/.ssh/app-key.pem

            # Windows (PowerShell)
            New-Item -ItemType Directory -Force $env:USERPROFILE\.ssh | Out-Null
            aws ec2 create-key-pair --key-name app-key --key-type ed25519 ${BT}
              --query KeyMaterial --output text | Out-File -Encoding ascii $env:USERPROFILE\.ssh\app-key.pem
            icacls $env:USERPROFILE\.ssh\app-key.pem /inheritance:r
            icacls $env:USERPROFILE\.ssh\app-key.pem /grant:r "$($env:USERNAME):(R)"
            `,
          note: 'AWS shows the private key only once. Back it up somewhere safe.',
        },
        {
          title: 'Find the default VPC',
          code: c`
            # macOS / Linux
            VPC_ID=$(aws ec2 describe-vpcs --filters Name=is-default,Values=true --query 'Vpcs[0].VpcId' --output text)
            echo $VPC_ID

            # Windows (PowerShell)
            $VPC_ID = aws ec2 describe-vpcs --filters Name=is-default,Values=true --query 'Vpcs[0].VpcId' --output text
            $VPC_ID
            `,
        },
        {
          title: 'Create the web security group',
          code: c`
            # macOS / Linux
            SG_ID=$(aws ec2 create-security-group --group-name app-web \
              --description "App web server" --vpc-id $VPC_ID --query GroupId --output text)
            MY_IP=$(curl -s https://checkip.amazonaws.com)
            aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22  --cidr $MY_IP/32
            aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80  --cidr 0.0.0.0/0
            aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0

            # Windows (PowerShell)
            $SG_ID = aws ec2 create-security-group --group-name app-web ${BT}
              --description "App web server" --vpc-id $VPC_ID --query GroupId --output text
            $MY_IP = (Invoke-RestMethod https://checkip.amazonaws.com).Trim()
            aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22  --cidr "$MY_IP/32"
            aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80  --cidr 0.0.0.0/0
            aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0
            `,
          note: 'SSH (22) is open only to your current IP. If your IP changes, add the new one, or use Session Manager instead of SSH.',
        },
      ],
    },
    {
      id: 'iam',
      title: '3. IAM role for the instance',
      group: 'Setup',
      items: [
        {
          title: 'Why a role',
          note: 'An instance role gives the server short-lived credentials automatically. Laravel, the Node SDK and boto3 all pick them up, so you never put AWS access keys in .env on the server.',
        },
        {
          title: 'Create the role and instance profile',
          code: c`
            # macOS / Linux
            cat > ec2-trust.json <<'EOF'
            {
              "Version": "2012-10-17",
              "Statement": [{ "Effect": "Allow", "Principal": { "Service": "ec2.amazonaws.com" }, "Action": "sts:AssumeRole" }]
            }
            EOF

            # Windows (PowerShell)
            @'
            {
              "Version": "2012-10-17",
              "Statement": [{ "Effect": "Allow", "Principal": { "Service": "ec2.amazonaws.com" }, "Action": "sts:AssumeRole" }]
            }
            '@ | Set-Content -Encoding ascii ec2-trust.json

            # all OS
            aws iam create-role --role-name app-ec2-role --assume-role-policy-document file://ec2-trust.json
            aws iam attach-role-policy --role-name app-ec2-role \
              --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
            aws iam create-instance-profile --instance-profile-name app-ec2-profile
            aws iam add-role-to-instance-profile --instance-profile-name app-ec2-profile --role-name app-ec2-role
            `,
          note: 'On Windows, replace the trailing \\ line breaks with a backtick ` or put the command on one line. S3 / SQS permissions get added to this role in step 14.',
        },
      ],
    },
    {
      id: 'launch',
      title: '4. Launch the EC2 instance',
      group: 'Setup',
      items: [
        {
          title: 'Launch Ubuntu 24.04',
          code: c`
            # macOS / Linux
            INSTANCE_ID=$(aws ec2 run-instances \
              --image-id resolve:ssm:/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id \
              --instance-type t3.small \
              --key-name app-key \
              --security-group-ids $SG_ID \
              --iam-instance-profile Name=app-ec2-profile \
              --block-device-mappings 'DeviceName=/dev/sda1,Ebs={VolumeSize=20,VolumeType=gp3,Encrypted=true}' \
              --metadata-options HttpTokens=required \
              --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=app-web}]' \
              --query 'Instances[0].InstanceId' --output text)
            aws ec2 wait instance-running --instance-ids $INSTANCE_ID

            # Windows (PowerShell)
            $INSTANCE_ID = aws ec2 run-instances ${BT}
              --image-id resolve:ssm:/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id ${BT}
              --instance-type t3.small ${BT}
              --key-name app-key ${BT}
              --security-group-ids $SG_ID ${BT}
              --iam-instance-profile Name=app-ec2-profile ${BT}
              --block-device-mappings 'DeviceName=/dev/sda1,Ebs={VolumeSize=20,VolumeType=gp3,Encrypted=true}' ${BT}
              --metadata-options HttpTokens=required ${BT}
              --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=app-web}]' ${BT}
              --query 'Instances[0].InstanceId' --output text
            aws ec2 wait instance-running --instance-ids $INSTANCE_ID
            `,
          note: 'If you get "Invalid IAM Instance Profile", the profile is still propagating. Wait 10–20 seconds and retry. t3.small (2 GB RAM) is a comfortable minimum. For cheaper ARM (t4g), use the arm64 AMI path.',
        },
        {
          title: 'Prefer the console?',
          note: 'EC2 → Launch instance → Ubuntu Server 24.04 LTS → t3.small → key pair "app-key" → existing security group "app-web" → storage 20 GB gp3 → Advanced details → IAM instance profile "app-ec2-profile" → Launch.',
        },
        {
          title: 'Attach a static Elastic IP',
          code: c`
            # macOS / Linux
            ALLOC_ID=$(aws ec2 allocate-address --domain vpc --query AllocationId --output text)
            aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id $ALLOC_ID
            PUBLIC_IP=$(aws ec2 describe-addresses --allocation-ids $ALLOC_ID --query 'Addresses[0].PublicIp' --output text)
            echo $PUBLIC_IP

            # Windows (PowerShell)
            $ALLOC_ID = aws ec2 allocate-address --domain vpc --query AllocationId --output text
            aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id $ALLOC_ID
            $PUBLIC_IP = aws ec2 describe-addresses --allocation-ids $ALLOC_ID --query 'Addresses[0].PublicIp' --output text
            $PUBLIC_IP
            `,
          note: 'Without an Elastic IP, the public IP changes whenever the instance stops. Public IPv4 addresses are billed hourly.',
        },
        {
          title: 'SSH without opening port 22 (Session Manager)',
          code: c`
            # Install the Session Manager plugin first:
            #   macOS:   brew install --cask session-manager-plugin
            #   Linux:   see AWS docs "Install the Session Manager plugin" (.deb / .rpm)
            #   Windows: download and run SessionManagerPluginSetup.exe from AWS docs

            aws ssm start-session --target $INSTANCE_ID     # bash and PowerShell
            `,
          note: 'Works because the role has AmazonSSMManagedInstanceCore. You can then remove the port 22 rule entirely.',
        },
      ],
    },
    {
      ...step(5, connect, 'Connect to the server (user: ubuntu)'),
      group: 'Set up the server',
    },
    {
      ...step(6, baseline),
      group: 'Set up the server',
    },
    {
      ...step('7a', laravel),
      group: 'Deploy your app',
    },
    {
      ...step('7b', node),
      group: 'Deploy your app',
    },
    {
      ...step('7c', python),
      group: 'Deploy your app',
    },
    {
      ...step('7d', react),
      group: 'Deploy your app',
      items: [
        ...react.items,
        {
          title: 'AWS alternative: S3 + CloudFront (no server)',
          code: c`
            # 1. bucket for the build (stays private; CloudFront reads it)
            aws s3 mb s3://my-react-site-prod --region $AWS_REGION        # PowerShell: $env:AWS_REGION

            # 2. upload (all OS)
            npm run build
            aws s3 sync dist/ s3://my-react-site-prod --delete \
              --cache-control "public, max-age=31536000, immutable" --exclude index.html
            aws s3 cp dist/index.html s3://my-react-site-prod/index.html --cache-control "no-cache"

            # 3. after each deploy, refresh the CDN copy of index.html
            aws cloudfront create-invalidation --distribution-id E123EXAMPLE --paths "/index.html"
            `,
          note: 'Create the distribution once in the console: CloudFront → Create distribution → origin = the S3 bucket with Origin Access Control → default root object index.html → Error pages: 403 and 404 → /index.html with response 200 (React Router) → attach an ACM certificate from us-east-1 for your domain. On Windows, replace the trailing \\ with `.',
        },
      ],
    },
    {
      id: 'dns',
      title: '8. Point your domain (Route 53)',
      group: 'Go live',
      items: [
        {
          title: 'Any DNS provider works',
          note: 'All you need is an A record for example.com (and www) pointing at the Elastic IP. If your domain is already elsewhere (Cloudflare, Namecheap…), add the record there and skip the rest of this step.',
        },
        {
          title: 'Create a hosted zone',
          code: c`
            # macOS / Linux
            aws route53 create-hosted-zone --name example.com --caller-reference app-$(date +%s)

            # Windows (PowerShell)
            aws route53 create-hosted-zone --name example.com --caller-reference "app-$(Get-Date -UFormat %s)"

            # all OS
            aws route53 list-hosted-zones-by-name --dns-name example.com
            `,
          note: 'Copy the 4 NS records from the output into your domain registrar\'s nameserver settings.',
        },
        {
          title: 'Add the A records',
          code: c`
            # macOS / Linux
            ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name example.com --query 'HostedZones[0].Id' --output text)
            cat > dns.json <<EOF
            { "Changes": [
              { "Action": "UPSERT", "ResourceRecordSet": { "Name": "example.com", "Type": "A", "TTL": 300, "ResourceRecords": [{ "Value": "$PUBLIC_IP" }] } },
              { "Action": "UPSERT", "ResourceRecordSet": { "Name": "www.example.com", "Type": "A", "TTL": 300, "ResourceRecords": [{ "Value": "$PUBLIC_IP" }] } }
            ] }
            EOF
            aws route53 change-resource-record-sets --hosted-zone-id $ZONE_ID --change-batch file://dns.json

            # Windows (PowerShell)
            $ZONE_ID = aws route53 list-hosted-zones-by-name --dns-name example.com --query 'HostedZones[0].Id' --output text
            @"
            { "Changes": [
              { "Action": "UPSERT", "ResourceRecordSet": { "Name": "example.com", "Type": "A", "TTL": 300, "ResourceRecords": [{ "Value": "$PUBLIC_IP" }] } },
              { "Action": "UPSERT", "ResourceRecordSet": { "Name": "www.example.com", "Type": "A", "TTL": 300, "ResourceRecords": [{ "Value": "$PUBLIC_IP" }] } }
            ] }
            "@ | Set-Content -Encoding ascii dns.json
            aws route53 change-resource-record-sets --hosted-zone-id $ZONE_ID --change-batch file://dns.json
            `,
        },
      ],
    },
    {
      ...step(9, https),
      group: 'Go live',
    },
    {
      ...step('10a', deploy),
      group: 'Go live',
    },
    {
      ...step('10b', cicd),
      group: 'Go live',
      items: [
        ...cicd.items,
        {
          title: 'AWS: let GitHub Actions log in without access keys (OIDC)',
          code: c`
            # one-time: trust GitHub's identity provider (all OS)
            aws iam create-open-id-connect-provider \
              --url https://token.actions.githubusercontent.com \
              --client-id-list sts.amazonaws.com
            `,
          note: 'Windows: replace the trailing \\ with ` or use one line. GitHub then gets short-lived AWS credentials for each run, so there are no AWS keys stored in GitHub secrets.',
        },
        {
          title: 'AWS: role that only your repo can use',
          lang: 'json',
          code: c`
            {
              "Version": "2012-10-17",
              "Statement": [{
                "Effect": "Allow",
                "Principal": { "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com" },
                "Action": "sts:AssumeRoleWithWebIdentity",
                "Condition": {
                  "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
                  "StringLike": { "token.actions.githubusercontent.com:sub": "repo:your-org/your-app:environment:production" }
                }
              }]
            }
            `,
          note: 'The "sub" must match how the job runs: environment:production for jobs with environment: production, or ref:refs/heads/main for jobs without one. Save the JSON above as github-trust.json, then create the role and give it only what the pipeline needs:',
          then: [
            {
              label: 'github-deploy-policy.json (example)',
              lang: 'json',
              code: c`
                {
                  "Version": "2012-10-17",
                  "Statement": [
                    { "Effect": "Allow", "Action": ["ssm:SendCommand", "ssm:GetCommandInvocation"], "Resource": "*" },
                    { "Effect": "Allow", "Action": ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
                      "Resource": ["arn:aws:s3:::my-react-site-prod", "arn:aws:s3:::my-react-site-prod/*"] },
                    { "Effect": "Allow", "Action": "cloudfront:CreateInvalidation", "Resource": "*" }
                  ]
                }
                `,
            },
            {
              label: 'Create the role',
              lang: 'bash',
              code: c`
                aws iam create-role --role-name github-deploy --assume-role-policy-document file://github-trust.json
                aws iam put-role-policy --role-name github-deploy --policy-name deploy --policy-document file://github-deploy-policy.json
                `,
            },
          ],
        },
        {
          title: 'AWS: deploy to EC2 without SSH (SSM Run Command)',
          lang: 'yaml',
          code: c`
              deploy:
                needs: test
                runs-on: ubuntu-latest
                environment: production
                permissions:
                  id-token: write                  # required for OIDC
                  contents: read
                steps:
                  - uses: aws-actions/configure-aws-credentials@v4
                    with:
                      role-to-assume: arn:aws:iam::123456789012:role/github-deploy
                      aws-region: ap-southeast-1
                  - name: Run deploy.sh on the instance
                    run: |
                      CMD_ID=$(aws ssm send-command \
                        --instance-ids i-0123456789abcdef0 \
                        --document-name AWS-RunShellScript \
                        --parameters 'commands=["sudo -iu deploy bash /var/www/app/deploy.sh"]' \
                        --query Command.CommandId --output text)
                      aws ssm wait command-executed --command-id $CMD_ID --instance-id i-0123456789abcdef0
            `,
          note: 'Works with port 22 closed: the instance already has AmazonSSMManagedInstanceCore (step 3). The role needs ssm:SendCommand and ssm:GetCommandInvocation.',
        },
        {
          title: 'AWS: deploy React to S3 + CloudFront from CI',
          lang: 'yaml',
          code: c`
                  - uses: aws-actions/configure-aws-credentials@v4
                    with:
                      role-to-assume: arn:aws:iam::123456789012:role/github-deploy
                      aws-region: ap-southeast-1
                  - uses: actions/download-artifact@v4
                    with: { name: dist, path: dist }
                  - run: |
                      aws s3 sync dist/ s3://my-react-site-prod --delete \
                        --cache-control "public, max-age=31536000, immutable" --exclude index.html
                      aws s3 cp dist/index.html s3://my-react-site-prod/index.html --cache-control "no-cache"
                      aws cloudfront create-invalidation --distribution-id E123EXAMPLE --paths "/index.html"
            `,
          note: 'Add permissions: id-token: write to this job as in the SSM example.',
        },
      ],
    },
    {
      ...step(11, ops),
      group: 'Go live',
    },
    {
      id: 'production',
      title: '12. Production hardening & cleanup',
      group: 'Go live',
      items: [
        {
          title: 'Automatic security updates (server)',
          code: c`
            sudo dpkg-reconfigure -plow unattended-upgrades
            `,
        },
        {
          title: 'Back up the disk',
          code: c`
            # macOS / Linux
            VOLUME_ID=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID \
              --query 'Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId' --output text)
            aws ec2 create-snapshot --volume-id $VOLUME_ID --description "app-web before upgrade"

            # Windows (PowerShell)
            $VOLUME_ID = aws ec2 describe-instances --instance-ids $INSTANCE_ID ${BT}
              --query 'Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId' --output text
            aws ec2 create-snapshot --volume-id $VOLUME_ID --description "app-web before upgrade"
            `,
          note: 'For scheduled backups use AWS Backup or Data Lifecycle Manager in the console.',
        },
        {
          title: 'Ship logs and metrics to CloudWatch',
          code: c`
            # on the server
            wget https://amazoncloudwatch-agent.s3.amazonaws.com/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
            sudo dpkg -i amazon-cloudwatch-agent.deb
            sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
            `,
          note: 'The instance role also needs the CloudWatchAgentServerPolicy managed policy.',
        },
        {
          title: 'Scaling beyond one server',
          note: 'Put an Application Load Balancer (with a free ACM certificate) in front, bake an AMI or use a launch template with user-data, and run instances in an Auto Scaling Group across 2+ AZs. Sessions, cache and uploads must then live in the DB / Redis (ElastiCache) / S3, not on local disk.',
        },
        {
          title: 'Tear everything down',
          code: c`
            aws ec2 terminate-instances --instance-ids $INSTANCE_ID
            aws ec2 wait instance-terminated --instance-ids $INSTANCE_ID
            aws ec2 release-address --allocation-id $ALLOC_ID
            aws ec2 delete-security-group --group-id $SG_ID
            aws ec2 delete-key-pair --key-name app-key
            `,
          note: 'Same commands in bash and PowerShell (variables are set in earlier steps). Unused Elastic IPs keep costing money until released.',
        },
      ],
    },
    {
      id: 'services-before',
      title: '13. Before adding services',
      group: 'Connect services',
      items: [
        {
          title: 'Prerequisites',
          note: 'Do steps 0–12 first. These steps reuse their variables: $AWS_REGION, $VPC_ID, $SG_ID (web security group) and the IAM role "app-ec2-role".',
        },
        {
          title: 'Where to run these commands',
          lang: 'text',
          code: c`
            macOS / Linux   → your terminal (bash / zsh lines)
            Windows         → PowerShell (the "Windows (PowerShell)" lines)
            Any OS          → AWS CloudShell in the browser, which is Linux, so use the bash lines.
                              The AWS CLI there is already logged in.

            Commands marked "on the server" run on the EC2 instance (Linux).
            `,
        },
        {
          title: 'Re-load variables in a new terminal',
          code: c`
            # macOS / Linux
            export AWS_REGION=ap-southeast-1
            VPC_ID=$(aws ec2 describe-vpcs --filters Name=is-default,Values=true --query 'Vpcs[0].VpcId' --output text)
            SG_ID=$(aws ec2 describe-security-groups --filters Name=group-name,Values=app-web --query 'SecurityGroups[0].GroupId' --output text)
            ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

            # Windows (PowerShell)
            $env:AWS_REGION = "ap-southeast-1"
            $VPC_ID = aws ec2 describe-vpcs --filters Name=is-default,Values=true --query 'Vpcs[0].VpcId' --output text
            $SG_ID = aws ec2 describe-security-groups --filters Name=group-name,Values=app-web --query 'SecurityGroups[0].GroupId' --output text
            $ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
            `,
        },
      ],
    },
    {
      id: 'services-iam',
      title: '14. Give the EC2 role access to S3 & SQS',
      group: 'Connect services',
      items: [
        {
          title: 'Permission policy',
          lang: 'json',
          code: c`
            {
              "Version": "2012-10-17",
              "Statement": [
                { "Effect": "Allow", "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
                  "Resource": "arn:aws:s3:::my-app-uploads-prod/*" },
                { "Effect": "Allow", "Action": ["s3:ListBucket"],
                  "Resource": "arn:aws:s3:::my-app-uploads-prod" },
                { "Effect": "Allow",
                  "Action": ["sqs:SendMessage", "sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:ChangeMessageVisibility",
                             "sqs:GetQueueAttributes", "sqs:GetQueueUrl"],
                  "Resource": "arn:aws:sqs:*:*:app-jobs*" },
                { "Effect": "Allow", "Action": ["ssm:GetParameter", "ssm:GetParametersByPath"],
                  "Resource": "arn:aws:ssm:*:*:parameter/app/prod/*" }
              ]
            }
            `,
          note: 'Save as app-policy.json. Replace my-app-uploads-prod with your bucket name (bucket names are globally unique).',
        },
        {
          title: 'Attach it to the role',
          code: c`
            # all OS (bash and PowerShell)
            aws iam put-role-policy --role-name app-ec2-role --policy-name app-access --policy-document file://app-policy.json
            `,
        },
        {
          title: 'Verify on the server',
          code: c`
            # on the server
            sudo snap install aws-cli --classic
            aws sts get-caller-identity       # should show assumed-role/app-ec2-role/...
            `,
          note: 'Leave AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY empty in the app\'s .env on EC2. The SDKs fall back to the instance role automatically.',
        },
        {
          title: 'Credentials for local development',
          code: c`
            # All OS: use your own CLI login; SDKs read ~/.aws (Windows: %USERPROFILE%\.aws)
            aws configure --profile app-dev

            # macOS / Linux
            export AWS_PROFILE=app-dev

            # Windows (PowerShell)
            $env:AWS_PROFILE = "app-dev"
            `,
        },
      ],
    },
    {
      id: 'rds-network',
      title: '15. RDS: network & security group',
      group: 'RDS (database)',
      items: [
        {
          title: 'Database security group (only the web server may connect)',
          code: c`
            # macOS / Linux
            DB_SG=$(aws ec2 create-security-group --group-name app-db --description "App database" \
              --vpc-id $VPC_ID --query GroupId --output text)
            aws ec2 authorize-security-group-ingress --group-id $DB_SG --protocol tcp --port 3306 --source-group $SG_ID

            # Windows (PowerShell)
            $DB_SG = aws ec2 create-security-group --group-name app-db --description "App database" ${BT}
              --vpc-id $VPC_ID --query GroupId --output text
            aws ec2 authorize-security-group-ingress --group-id $DB_SG --protocol tcp --port 3306 --source-group $SG_ID
            `,
          note: 'PostgreSQL uses port 5432. --source-group means "anything in the web security group". No IP addresses needed.',
        },
        {
          title: 'DB subnet group',
          code: c`
            # macOS / Linux
            SUBNETS=$(aws ec2 describe-subnets --filters Name=vpc-id,Values=$VPC_ID --query 'Subnets[].SubnetId' --output text)
            aws rds create-db-subnet-group --db-subnet-group-name app-db-subnets \
              --db-subnet-group-description "App DB" --subnet-ids $SUBNETS

            # Windows (PowerShell)
            $SUBNETS = (aws ec2 describe-subnets --filters Name=vpc-id,Values=$VPC_ID --query 'Subnets[].SubnetId' --output text) -split '\s+'
            aws rds create-db-subnet-group --db-subnet-group-name app-db-subnets ${BT}
              --db-subnet-group-description "App DB" --subnet-ids $SUBNETS
            `,
          note: 'RDS needs subnets in at least two Availability Zones.',
        },
      ],
    },
    {
      id: 'rds-create',
      title: '16. RDS: create the database',
      group: 'RDS (database)',
      items: [
        {
          title: 'Create a MySQL 8.4 instance',
          code: c`
            # macOS / Linux
            read -s -p "DB admin password: " DB_ADMIN_PASSWORD; echo
            aws rds create-db-instance \
              --db-instance-identifier app-db \
              --engine mysql --engine-version 8.4 \
              --db-instance-class db.t4g.micro \
              --allocated-storage 20 --storage-type gp3 --storage-encrypted \
              --master-username appadmin --master-user-password "$DB_ADMIN_PASSWORD" \
              --db-name app \
              --vpc-security-group-ids $DB_SG \
              --db-subnet-group-name app-db-subnets \
              --no-publicly-accessible \
              --backup-retention-period 7 \
              --deletion-protection
            aws rds wait db-instance-available --db-instance-identifier app-db

            # Windows (PowerShell)
            $DB_ADMIN_PASSWORD = Read-Host "DB admin password" -MaskInput
            aws rds create-db-instance ${BT}
              --db-instance-identifier app-db ${BT}
              --engine mysql --engine-version 8.4 ${BT}
              --db-instance-class db.t4g.micro ${BT}
              --allocated-storage 20 --storage-type gp3 --storage-encrypted ${BT}
              --master-username appadmin --master-user-password "$DB_ADMIN_PASSWORD" ${BT}
              --db-name app ${BT}
              --vpc-security-group-ids $DB_SG ${BT}
              --db-subnet-group-name app-db-subnets ${BT}
              --no-publicly-accessible ${BT}
              --backup-retention-period 7 ${BT}
              --deletion-protection
            aws rds wait db-instance-available --db-instance-identifier app-db
            `,
          note: 'Takes 5–15 minutes. Add --multi-az for a standby replica in production (about double the cost). -MaskInput needs PowerShell 7+. On Windows PowerShell 5, use -AsSecureString or just Read-Host.',
        },
        {
          title: 'PostgreSQL instead',
          code: c`
            --engine postgres --engine-version 17     # and use port 5432 in the security group
            `,
        },
        {
          title: 'Get the endpoint',
          code: c`
            # macOS / Linux
            DB_HOST=$(aws rds describe-db-instances --db-instance-identifier app-db --query 'DBInstances[0].Endpoint.Address' --output text)
            echo $DB_HOST

            # Windows (PowerShell)
            $DB_HOST = aws rds describe-db-instances --db-instance-identifier app-db --query 'DBInstances[0].Endpoint.Address' --output text
            $DB_HOST
            `,
          note: 'Looks like app-db.abc123xyz.ap-southeast-1.rds.amazonaws.com.',
        },
      ],
    },
    {
      id: 'rds-connect',
      title: '17. RDS: connect from the app',
      group: 'RDS (database)',
      items: [
        {
          title: 'Test from the server and create an app user',
          code: c`
            # on the server
            sudo apt install -y mysql-client          # PostgreSQL: postgresql-client
            mysql -h app-db.abc123xyz.ap-southeast-1.rds.amazonaws.com -u appadmin -p
            `,
        },
        {
          title: 'App user with limited rights',
          lang: 'sql',
          code: c`
            CREATE USER 'app'@'%' IDENTIFIED BY 'another-strong-password';
            GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES ON app.* TO 'app'@'%';
            FLUSH PRIVILEGES;
            `,
        },
        {
          title: 'Download the RDS TLS certificate bundle',
          code: c`
            # on the server
            sudo curl -o /etc/ssl/certs/rds-global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
            `,
          note: 'Lets the app verify it is really talking to RDS over an encrypted connection.',
        },
        {
          title: 'Laravel (.env)',
          lang: 'env',
          code: c`
            DB_CONNECTION=mysql
            DB_HOST=app-db.abc123xyz.ap-southeast-1.rds.amazonaws.com
            DB_PORT=3306
            DB_DATABASE=app
            DB_USERNAME=app
            DB_PASSWORD=another-strong-password
            MYSQL_ATTR_SSL_CA=/etc/ssl/certs/rds-global-bundle.pem
            `,
          note: 'Laravel\'s default config/database.php already reads MYSQL_ATTR_SSL_CA.',
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
            // npm i mysql2
            import fs from 'node:fs'
            import mysql from 'mysql2/promise'

            export const db = mysql.createPool({
              host: process.env.DB_HOST,
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME,
              connectionLimit: 10,
              ssl: { ca: fs.readFileSync('/etc/ssl/certs/rds-global-bundle.pem') },
            })

            const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [42])
            `,
          note: 'Using PostgreSQL instead?',
          then: [
            {
              label: 'PostgreSQL (pg)',
              lang: 'js',
              code: c`
                // npm i pg
                import fs from 'node:fs'
                import pg from 'pg'

                export const db = new pg.Pool({
                  connectionString: process.env.DATABASE_URL,
                  ssl: { ca: fs.readFileSync('/etc/ssl/certs/rds-global-bundle.pem') },
                })
                `,
            },
          ],
        },
        {
          title: 'Django (settings.py)',
          lang: 'python',
          code: c`
            # pip install mysqlclient        (PostgreSQL: pip install "psycopg[binary]")
            DATABASES = {
                "default": {
                    "ENGINE": "django.db.backends.mysql",
                    "HOST": os.environ["DB_HOST"],
                    "PORT": "3306",
                    "NAME": os.environ["DB_NAME"],
                    "USER": os.environ["DB_USER"],
                    "PASSWORD": os.environ["DB_PASSWORD"],
                    "CONN_MAX_AGE": 60,
                    "OPTIONS": {"ssl": {"ca": "/etc/ssl/certs/rds-global-bundle.pem"}},
                    # PostgreSQL: "OPTIONS": {"sslmode": "verify-full", "sslrootcert": "/etc/ssl/certs/rds-global-bundle.pem"}
                }
            }
            `,
        },
        {
          title: 'FastAPI / SQLAlchemy',
          lang: 'python',
          code: c`
            # pip install sqlalchemy pymysql
            import os
            from sqlalchemy import create_engine
            from sqlalchemy.orm import sessionmaker

            url = "mysql+pymysql://{u}:{p}@{h}:3306/{d}".format(
                u=os.environ["DB_USER"], p=os.environ["DB_PASSWORD"], h=os.environ["DB_HOST"], d=os.environ["DB_NAME"])

            engine = create_engine(url, pool_pre_ping=True,
                                   connect_args={"ssl": {"ca": "/etc/ssl/certs/rds-global-bundle.pem"}})
            SessionLocal = sessionmaker(bind=engine)
            `,
        },
        {
          title: 'Keep the password out of Git (SSM Parameter Store)',
          code: c`
            # store once (bash and PowerShell)
            aws ssm put-parameter --name /app/prod/DB_PASSWORD --type SecureString --value "another-strong-password"

            # on the server, e.g. in deploy.sh
            DB_PASSWORD=$(aws ssm get-parameter --name /app/prod/DB_PASSWORD --with-decryption --query Parameter.Value --output text)
            `,
          note: 'The IAM policy in step 1 already allows reading /app/prod/*.',
        },
      ],
    },
    {
      id: 'rds-ops',
      title: '18. RDS: backups & maintenance',
      group: 'RDS (database)',
      items: [
        {
          title: 'Manual snapshot before risky changes',
          code: c`
            aws rds create-db-snapshot --db-instance-identifier app-db --db-snapshot-identifier app-db-before-v2
            `,
          note: 'Same command in bash and PowerShell. Automatic daily backups are kept for --backup-retention-period days.',
        },
        {
          title: 'Point-in-time restore (creates a new instance)',
          code: c`
            aws rds restore-db-instance-to-point-in-time \
              --source-db-instance-identifier app-db \
              --target-db-instance-identifier app-db-restored \
              --restore-time 2026-10-17T03:00:00Z
            `,
          note: 'Windows: replace the trailing \\ with `. Point the app at the new endpoint once you have checked it.',
        },
        {
          title: 'Logical dump / import (on the server)',
          code: c`
            mysqldump -h $DB_HOST -u app -p --single-transaction --routines app > app-$(date +%F).sql
            mysql -h $DB_HOST -u app -p app < app-2026-10-17.sql
            `,
        },
        {
          title: 'Scale up',
          code: c`
            aws rds modify-db-instance --db-instance-identifier app-db --db-instance-class db.t4g.small --apply-immediately
            `,
          note: 'Causes a short outage (or a failover with Multi-AZ).',
        },
      ],
    },
    {
      id: 's3-create',
      title: '19. S3: create a private bucket',
      group: 'S3 (file storage)',
      items: [
        {
          title: 'Create the bucket',
          code: c`
            # macOS / Linux
            aws s3api create-bucket --bucket my-app-uploads-prod --region $AWS_REGION \
              --create-bucket-configuration LocationConstraint=$AWS_REGION

            # Windows (PowerShell)
            aws s3api create-bucket --bucket my-app-uploads-prod --region $env:AWS_REGION ${BT}
              --create-bucket-configuration LocationConstraint=$env:AWS_REGION
            `,
          note: 'In us-east-1, leave out --create-bucket-configuration. New buckets block public access and encrypt objects by default.',
        },
        {
          title: 'Keep it private and versioned',
          code: c`
            aws s3api put-public-access-block --bucket my-app-uploads-prod \
              --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
            aws s3api put-bucket-versioning --bucket my-app-uploads-prod --versioning-configuration Status=Enabled
            `,
          note: 'Windows: use ` instead of \\ for line breaks. Serve private files with signed URLs. For public assets, put CloudFront in front instead of making the bucket public.',
        },
        {
          title: 'Everyday CLI',
          code: c`
            aws s3 cp invoice.pdf s3://my-app-uploads-prod/invoices/
            aws s3 ls s3://my-app-uploads-prod/invoices/
            aws s3 sync ./public/build s3://my-app-uploads-prod/build --delete
            aws s3 rm s3://my-app-uploads-prod/invoices/invoice.pdf
            aws s3 presign s3://my-app-uploads-prod/invoices/invoice.pdf --expires-in 600
            `,
          note: 'Identical on macOS, Linux and Windows.',
        },
        {
          title: 'CORS for direct browser uploads',
          lang: 'json',
          code: c`
            {
              "CORSRules": [{
                "AllowedOrigins": ["https://example.com"],
                "AllowedMethods": ["GET", "PUT", "POST"],
                "AllowedHeaders": ["*"],
                "ExposeHeaders": ["ETag"],
                "MaxAgeSeconds": 3000
              }]
            }
            `,
          note: 'Save as cors.json, then apply it:',
          then: [
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                aws s3api put-bucket-cors --bucket my-app-uploads-prod --cors-configuration file://cors.json
                `,
            },
          ],
        },
        {
          title: 'Auto-delete temporary files',
          lang: 'json',
          code: c`
            {
              "Rules": [{
                "ID": "expire-tmp",
                "Status": "Enabled",
                "Filter": { "Prefix": "tmp/" },
                "Expiration": { "Days": 7 }
              }]
            }
            `,
          note: 'Save as lifecycle.json, then apply it:',
          then: [
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                aws s3api put-bucket-lifecycle-configuration --bucket my-app-uploads-prod --lifecycle-configuration file://lifecycle.json
                `,
            },
          ],
        },
      ],
    },
    {
      id: 's3-app',
      title: '20. S3: use it from your app',
      group: 'S3 (file storage)',
      items: [
        {
          title: 'Laravel: install and configure',
          code: c`
            composer require league/flysystem-aws-s3-v3 "^3.0" --with-all-dependencies
            `,
        },
        {
          title: 'Laravel (.env)',
          lang: 'env',
          code: c`
            FILESYSTEM_DISK=s3
            AWS_DEFAULT_REGION=ap-southeast-1
            AWS_BUCKET=my-app-uploads-prod
            AWS_ACCESS_KEY_ID=          # empty on EC2: the instance role is used
            AWS_SECRET_ACCESS_KEY=
            `,
        },
        {
          title: 'Laravel: upload, signed URL, delete',
          lang: 'php',
          code: c`
            use Illuminate\Support\Facades\Storage;

            $path = $request->file('avatar')->store('avatars', 's3');     // private by default
            Storage::disk('s3')->put('reports/q3.csv', $csv);

            $url = Storage::disk('s3')->temporaryUrl($path, now()->addMinutes(10));
            $exists = Storage::disk('s3')->exists($path);
            Storage::disk('s3')->delete($path);
            `,
        },
        {
          title: 'Node.js: AWS SDK v3',
          lang: 'js',
          code: c`
            // npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
            import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
            import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

            const s3 = new S3Client({ region: process.env.AWS_REGION })
            const Bucket = process.env.S3_BUCKET

            await s3.send(new PutObjectCommand({ Bucket, Key: 'avatars/42.png', Body: buffer, ContentType: 'image/png' }))

            const downloadUrl = await getSignedUrl(s3, new GetObjectCommand({ Bucket, Key: 'avatars/42.png' }), { expiresIn: 600 })

            await s3.send(new DeleteObjectCommand({ Bucket, Key: 'avatars/42.png' }))
            `,
        },
        {
          title: 'Node.js: let the browser upload directly',
          lang: 'js',
          code: c`
            // server: hand out a short-lived upload URL
            app.post('/uploads', async (req, res) => {
              const Key = 'uploads/' + crypto.randomUUID() + '-' + req.body.filename
              const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket, Key, ContentType: req.body.type }), { expiresIn: 300 })
              res.json({ url, key: Key })
            })

            // browser
            const { url, key } = await (await fetch('/uploads', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filename: file.name, type: file.type }),
            })).json()
            await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
            `,
          note: 'The file never passes through your server. Requires the CORS rule from step 6.',
        },
        {
          title: 'Python: boto3',
          lang: 'python',
          code: c`
            # pip install boto3
            import boto3

            s3 = boto3.client("s3")
            BUCKET = "my-app-uploads-prod"

            s3.upload_file("report.pdf", BUCKET, "reports/report.pdf")
            s3.upload_fileobj(file_obj, BUCKET, "avatars/42.png", ExtraArgs={"ContentType": "image/png"})

            url = s3.generate_presigned_url("get_object", Params={"Bucket": BUCKET, "Key": "reports/report.pdf"}, ExpiresIn=600)
            s3.delete_object(Bucket=BUCKET, Key="reports/report.pdf")
            `,
        },
        {
          title: 'Django: django-storages',
          lang: 'python',
          code: c`
            # pip install "django-storages[s3]"
            STORAGES = {
                "default": {
                    "BACKEND": "storages.backends.s3.S3Storage",
                    "OPTIONS": {
                        "bucket_name": "my-app-uploads-prod",
                        "region_name": "ap-southeast-1",
                        "querystring_auth": True,      # FileField.url returns a signed URL
                        "file_overwrite": False,
                    },
                },
                "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
            }
            `,
          note: 'Every FileField / ImageField now saves to S3 automatically.',
        },
      ],
    },
    {
      id: 'sqs-create',
      title: '21. SQS: create a queue with a dead-letter queue',
      group: 'SQS (queues)',
      items: [
        {
          title: 'How SQS works',
          lang: 'text',
          code: c`
            producer ──SendMessage──▶ [ app-jobs ] ──ReceiveMessage──▶ worker
                                           │                             │ success → DeleteMessage
                                           │                             │ failure → do nothing; message becomes
                                           │                             │           visible again after VisibilityTimeout
                                           └── after 5 failed receives ─▶ [ app-jobs-dlq ]  (inspect / replay later)
            `,
        },
        {
          title: 'Create the dead-letter queue',
          code: c`
            # macOS / Linux
            DLQ_URL=$(aws sqs create-queue --queue-name app-jobs-dlq --attributes MessageRetentionPeriod=1209600 --query QueueUrl --output text)
            DLQ_ARN=$(aws sqs get-queue-attributes --queue-url $DLQ_URL --attribute-names QueueArn --query Attributes.QueueArn --output text)

            # Windows (PowerShell)
            $DLQ_URL = aws sqs create-queue --queue-name app-jobs-dlq --attributes MessageRetentionPeriod=1209600 --query QueueUrl --output text
            $DLQ_ARN = aws sqs get-queue-attributes --queue-url $DLQ_URL --attribute-names QueueArn --query Attributes.QueueArn --output text
            `,
        },
        {
          title: 'Create the main queue',
          code: c`
            # macOS / Linux
            cat > queue-attrs.json <<EOF
            {
              "VisibilityTimeout": "120",
              "ReceiveMessageWaitTimeSeconds": "20",
              "RedrivePolicy": "{\"deadLetterTargetArn\":\"$DLQ_ARN\",\"maxReceiveCount\":\"5\"}"
            }
            EOF
            aws sqs create-queue --queue-name app-jobs --attributes file://queue-attrs.json

            # Windows (PowerShell)
            @{
              VisibilityTimeout             = "120"
              ReceiveMessageWaitTimeSeconds = "20"
              RedrivePolicy                 = (@{ deadLetterTargetArn = $DLQ_ARN; maxReceiveCount = "5" } | ConvertTo-Json -Compress)
            } | ConvertTo-Json | Set-Content -Encoding ascii queue-attrs.json
            aws sqs create-queue --queue-name app-jobs --attributes file://queue-attrs.json
            `,
          note: 'VisibilityTimeout must be longer than your slowest job. ReceiveMessageWaitTimeSeconds=20 turns on long polling, which means fewer empty (billed) requests. For strict ordering, use a FIFO queue named app-jobs.fifo with FifoQueue=true.',
        },
        {
          title: 'Try it from the CLI',
          code: c`
            aws sqs get-queue-url --queue-name app-jobs
            aws sqs send-message --queue-url https://sqs.ap-southeast-1.amazonaws.com/123456789012/app-jobs --message-body "hello"
            aws sqs receive-message --queue-url https://sqs.ap-southeast-1.amazonaws.com/123456789012/app-jobs --wait-time-seconds 10
            aws sqs purge-queue --queue-url https://sqs.ap-southeast-1.amazonaws.com/123456789012/app-jobs
            `,
          note: 'Same on every OS. On Windows PowerShell, wrap a JSON message body in single quotes.',
        },
        {
          title: 'Replay messages from the DLQ',
          code: c`
            aws sqs start-message-move-task --source-arn arn:aws:sqs:ap-southeast-1:123456789012:app-jobs-dlq
            `,
          note: 'Moves messages back to their original queue once you have fixed the bug.',
        },
      ],
    },
    {
      id: 'sqs-app',
      title: '22. SQS: send & process jobs',
      group: 'SQS (queues)',
      items: [
        {
          title: 'Laravel: use SQS as the queue driver',
          code: c`
            composer require aws/aws-sdk-php
            `,
        },
        {
          title: 'Laravel (.env)',
          lang: 'env',
          code: c`
            QUEUE_CONNECTION=sqs
            AWS_DEFAULT_REGION=ap-southeast-1
            SQS_PREFIX=https://sqs.ap-southeast-1.amazonaws.com/123456789012
            SQS_QUEUE=app-jobs
            `,
        },
        {
          title: 'Laravel: dispatch and work',
          lang: 'php',
          code: c`
            // anywhere in your app
            ProcessInvoice::dispatch($invoice);
            ProcessInvoice::dispatch($invoice)->delay(now()->addMinutes(5));   // SQS max delay: 15 min

            // app/Jobs/ProcessInvoice.php
            class ProcessInvoice implements ShouldQueue
            {
                use Queueable;

                public int $tries = 3;
                public int $timeout = 90;      // keep below the queue's VisibilityTimeout (120)

                public function __construct(public Invoice $invoice) {}

                public function handle(): void { /* ... */ }
            }
            `,
          note: 'Point the worker service at the SQS connection. Keep --timeout below the queue\'s VisibilityTimeout:',
          then: [
            {
              label: '/etc/systemd/system/app-worker.service',
              lang: 'ini',
              code: c`
                ExecStart=/usr/bin/php artisan queue:work sqs --tries=3 --timeout=90
                `,
            },
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                sudo systemctl daemon-reload
                sudo systemctl restart app-worker
                `,
            },
          ],
        },
        {
          title: 'Node.js: send a message',
          lang: 'js',
          code: c`
            // npm i @aws-sdk/client-sqs
            import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

            const sqs = new SQSClient({ region: process.env.AWS_REGION })

            await sqs.send(new SendMessageCommand({
              QueueUrl: process.env.SQS_URL,
              MessageBody: JSON.stringify({ type: 'invoice.created', id: 42 }),
            }))
            `,
        },
        {
          title: 'Node.js: worker',
          lang: 'js',
          code: c`
            // src/worker.js
            import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs'

            const sqs = new SQSClient({ region: process.env.AWS_REGION })
            const QueueUrl = process.env.SQS_URL

            while (true) {
              const { Messages = [] } = await sqs.send(new ReceiveMessageCommand({
                QueueUrl, MaxNumberOfMessages: 10, WaitTimeSeconds: 20,
              }))

              for (const msg of Messages) {
                try {
                  await handle(JSON.parse(msg.Body))
                  await sqs.send(new DeleteMessageCommand({ QueueUrl, ReceiptHandle: msg.ReceiptHandle }))
                } catch (err) {
                  console.error('job failed, SQS will retry it', err)
                }
              }
            }
            `,
          note: 'Run it next to the API with PM2:',
          then: [
            {
              label: 'ecosystem.config.cjs',
              lang: 'js',
              code: c`
                module.exports = {
                  apps: [
                    { name: 'api', script: 'src/server.js', node_args: '--env-file=.env' },
                    { name: 'worker', script: 'src/worker.js', node_args: '--env-file=.env' },
                  ],
                }
                `,
            },
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                pm2 reload ecosystem.config.cjs --update-env
                pm2 save
                `,
            },
          ],
        },
        {
          title: 'Python: send and work (boto3)',
          lang: 'python',
          code: c`
            import json, logging, os
            import boto3

            sqs = boto3.client("sqs")
            QUEUE_URL = os.environ["SQS_URL"]

            # producer
            sqs.send_message(QueueUrl=QUEUE_URL, MessageBody=json.dumps({"type": "invoice.created", "id": 42}))

            # worker (run it with a systemd service like app-worker)
            while True:
                resp = sqs.receive_message(QueueUrl=QUEUE_URL, MaxNumberOfMessages=10, WaitTimeSeconds=20)
                for msg in resp.get("Messages", []):
                    try:
                        handle(json.loads(msg["Body"]))
                        sqs.delete_message(QueueUrl=QUEUE_URL, ReceiptHandle=msg["ReceiptHandle"])
                    except Exception:
                        logging.exception("job failed, SQS will retry it")
            `,
        },
        {
          title: 'Python: Celery with SQS as the broker',
          lang: 'python',
          code: c`
            # pip install "celery[sqs]"
            # config/celery.py
            import os
            from celery import Celery

            app = Celery("config")
            app.conf.update(
                broker_url="sqs://",                  # credentials come from the instance role
                task_default_queue="app-jobs",
                broker_transport_options={
                    "region": "ap-southeast-1",
                    "visibility_timeout": 120,
                    "predefined_queues": {"app-jobs": {"url": os.environ["SQS_URL"]}},
                },
            )
            app.autodiscover_tasks()
            `,
          note: 'Start it with the Celery systemd unit from step 7c.',
        },
      ],
    },
    {
      id: 'cleanup',
      title: '23. Costs & cleanup',
      group: 'Costs & cleanup',
      items: [
        {
          title: 'What costs money',
          lang: 'text',
          code: c`
            RDS     → per instance-hour + storage + backups beyond DB size (biggest item)
            S3      → storage per GB-month + requests + data transfer out
            SQS     → first 1M requests/month free, then per million
            EC2     → per instance-hour + EBS + public IPv4
            `,
        },
        {
          title: 'Delete the services from steps 13–22',
          code: c`
            aws rds modify-db-instance --db-instance-identifier app-db --no-deletion-protection --apply-immediately
            aws rds delete-db-instance --db-instance-identifier app-db --final-db-snapshot-identifier app-db-final
            aws s3 rb s3://my-app-uploads-prod --force
            aws sqs delete-queue --queue-url https://sqs.ap-southeast-1.amazonaws.com/123456789012/app-jobs
            aws sqs delete-queue --queue-url https://sqs.ap-southeast-1.amazonaws.com/123456789012/app-jobs-dlq
            `,
          note: 'Same on every OS. With versioning on, rb --force cannot remove old object versions, so empty the bucket in the console ("Empty") first.',
        },
      ],
    },
  ],
}
