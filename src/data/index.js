import laravel from './sheets/laravel.js'
import php from './sheets/php.js'
import wordpress from './sheets/wordpress.js'
import javascript from './sheets/javascript.js'
import jquery from './sheets/jquery.js'
import ajax from './sheets/ajax.js'
import seo from './sheets/seo.js'
import typescript from './sheets/typescript.js'
import react from './sheets/react.js'
import nextjs from './sheets/nextjs.js'
import nodeExpress from './sheets/node-express.js'
import python from './sheets/python.js'
import java from './sheets/java.js'
import sql from './sheets/sql.js'
import git from './sheets/git.js'
import docker from './sheets/docker.js'
import bash from './sheets/bash.js'
import http from './sheets/http.js'
import aws from './sheets/aws.js'
import gcp from './sheets/gcp.js'
import azure from './sheets/azure.js'
import cicd from './sheets/cicd.js'
import playwright from './sheets/playwright.js'
import cypress from './sheets/cypress.js'
import jest from './sheets/jest.js'
import phpunit from './sheets/phpunit.js'

// Badges: first letter for single words, initials for compound names, acronyms as-is. Order here = order on the home page.
export const techs = {
  Laravel: { short: 'L' },
  PHP: { short: 'PHP' },
  WordPress: { short: 'W' },
  JavaScript: { short: 'JS' },
  jQuery: { short: 'jQ' },
  AJAX: { short: 'AJAX' },
  SEO: { short: 'SEO' },
  TypeScript: { short: 'TS' },
  React: { short: 'R' },
  'Next.js': { short: 'NJ' },
  Node: { short: 'N' },
  Python: { short: 'P' },
  Java: { short: 'J' },
  SQL: { short: 'SQL' },
  Git: { short: 'G' },
  Docker: { short: 'D' },
  Bash: { short: 'B' },
  HTTP: { short: 'HTTP' },
  AWS: { short: 'AWS' },
  GCP: { short: 'GCP' },
  Azure: { short: 'A' },
  'CI/CD': { short: 'CI' },
  Playwright: { short: 'PW' },
  Cypress: { short: 'C' },
  Jest: { short: 'Je' },
  PHPUnit: { short: 'PU' },
}

export const categories = [
  { id: 'frontend', name: 'Frontend', description: 'JavaScript, TypeScript, React and state management.' },
  { id: 'backend', name: 'Backend', description: 'Laravel, Node.js, Python frameworks, APIs and data.' },
  { id: 'devops', name: 'DevOps & Tools', description: 'Version control, containers and the terminal.' },
  { id: 'testing', name: 'Testing', description: 'Unit, integration and end-to-end tests: Jest, PHPUnit, Cypress and Playwright, with CI recipes.' },
  { id: 'cloud', name: 'Cloud & Deployment', description: 'Step-by-step deploys to AWS, Google Cloud and Azure, plus managed databases, storage and queues.' },
]

// Give every item a stable id derived from its section and position.
const normalize = sheet => ({
  ...sheet,
  sections: sheet.sections.map(sec => ({
    ...sec,
    items: sec.items.map((item, i) => ({ id: `${sec.id}-${i + 1}`, ...item })),
  })),
})

export const sheets = [
  laravel, php, wordpress,
  javascript, jquery, ajax, seo, typescript,
  react, nextjs,
  nodeExpress,
  python, java,
  sql, git, docker, bash, http,
  cicd, playwright, cypress, jest, phpunit, aws, gcp, azure,
].map(normalize)

// Sheets that were merged into others — old links redirect to the new sheet
export const slugAliases = {
  'laravel-advanced': 'laravel',
  'laravel-collections': 'laravel',
  'async-javascript': 'javascript',
  'react-hooks': 'react',
  'node-npm': 'node-express',
  zustand: 'react',
  django: 'python',
  fastapi: 'python',
  'aws-ec2': 'aws',
  'aws-rds-s3-sqs': 'aws',
  'gcp-compute': 'gcp',
  'gcp-cloudsql-storage-pubsub': 'gcp',
  mysql: 'sql',
  postgresql: 'sql',
}

export const popularSlugs = ['laravel', 'git', 'react', 'node-express']
export const recentSlugs = ['aws', 'gcp', 'python', 'react']

export const itemCount = sheet => sheet.sections.reduce((n, s) => n + s.items.length, 0)
