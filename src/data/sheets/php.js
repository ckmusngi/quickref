import { c } from './shared/code.js'

export default {
  slug: 'php',
  title: 'PHP',
  tech: 'PHP',
  category: 'backend',
  minutes: 40,
  lang: 'php',
  description: 'Modern PHP 8: setup, namespaces and imports (use, require, Composer autoload), syntax, functions and closures, OOP (traits, abstract, static, readonly, property hooks), exceptions, arrays and strings, dates, files and CSV, regex, PDO, requests and sessions, security, session-based authentication (register, login, remember me, password reset) and debugging.',
  sections: [
    {
      id: 'project-setup',
      title: 'Project setup, step by step',
      group: 'Setup',
      items: [
        {
          title: '1. Install PHP & Composer',
          lang: 'bash',
          code: c`
            # macOS
            brew install php composer
            # or Laravel Herd (herd.laravel.com): PHP + Composer in one app

            # Linux (Ubuntu / Debian)
            sudo apt install -y php-cli php-mbstring php-xml php-curl php-zip php-mysql unzip
            curl -sS https://getcomposer.org/installer | php
            sudo mv composer.phar /usr/local/bin/composer

            # Windows (PowerShell)
            # Option 1: Laravel Herd for Windows (easiest)
            # Option 2: php.new one-liner (PHP + Composer):
            Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows'))
            # Option 3: XAMPP / Laragon, then Composer-Setup.exe from getcomposer.org

            # check (all OS, NEW terminal)
            php -v
            composer -V
            `,
        },
        {
          title: '2. Check config and extensions',
          lang: 'bash',
          code: c`
            php --ini          # which php.ini is loaded
            php -m             # installed extensions
            `,
          note: 'Missing an extension? Enable or install it for your OS:',
          then: [
            {
              label: 'Windows: php.ini (remove the leading ;)',
              lang: 'ini',
              code: c`
                extension=mbstring
                extension=openssl
                extension=pdo_mysql
                extension=curl
                `,
            },
            {
              label: 'Linux (Ubuntu / Debian)',
              lang: 'bash',
              code: c`
                sudo apt install -y php-mbstring php-mysql php-curl php-xml php-zip
                `,
            },
            {
              label: 'macOS',
              lang: 'text',
              code: c`
                Homebrew PHP already includes the common extensions.
                `,
            },
          ],
        },
        {
          title: '3. Start a Composer project',
          lang: 'bash',
          code: c`
            mkdir my-app && cd my-app
            composer init --name=me/my-app --type=project --no-interaction
            mkdir src public
            `,
        },
        {
          title: '4. Set up PSR-4 autoloading',
          lang: 'json',
          code: c`
            {
              "name": "me/my-app",
              "type": "project",
              "require": { "php": ">=8.2" },
              "autoload": {
                "psr-4": { "App\\": "src/" }
              }
            }
            `,
          note: 'A class App\\\\Services\\\\Mailer now lives in src/Services/Mailer.php. Regenerate the autoloader after changing composer.json:',
          then: [
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                composer dump-autoload
                `,
            },
          ],
        },
        {
          title: '5. Entry point',
          code: c`
            <?php
            // public/index.php
            declare(strict_types=1);

            require __DIR__ . '/../vendor/autoload.php';

            use App\Greeter;

            echo (new Greeter())->hello('world');
            `,
        },
        {
          title: '6. Run the built-in server',
          lang: 'bash',
          code: c`
            php -S localhost:8000 -t public      # all OS → http://localhost:8000
            php src/script.php                    # run a CLI script
            `,
          note: 'The built-in server is for development only. Use Nginx + PHP-FPM in production (see the cloud deploy guides).',
        },
        {
          title: '7. File structure',
          lang: 'tree',
          code: c`
            my-app/
            ├── public/                 # web root: the ONLY folder the server exposes
            │   ├── index.php           # front controller / home page
            │   ├── login.php  register.php  logout.php
            │   ├── dashboard.php       # protected page
            │   ├── forgot.php  reset.php
            │   └── assets/             # css/  js/  images/
            ├── src/                    # your code (namespace App\)
            │   ├── bootstrap.php       # session, autoload, db, auth: required by every page
            │   ├── config.php          # returns an array of settings
            │   ├── db.php              # returns a PDO connection
            │   ├── auth.php            # current_user(), require_login(), CSRF helpers
            │   ├── helpers.php         # e() and other global functions (autoload "files")
            │   ├── Models/             # App\Models\User → src/Models/User.php
            │   └── Services/           # App\Services\Mailer → src/Services/Mailer.php
            ├── templates/              # HTML views
            │   └── partials/           # header.php  nav.php  footer.php
            ├── database/
            │   └── schema.sql          # CREATE TABLE users, password_resets…
            ├── storage/                # logs/  cache/  uploads/ (writable, not public)
            ├── tests/                  # PHPUnit tests (namespace Tests\)
            ├── vendor/                 # Composer packages (never commit)
            ├── .env                    # secrets (never commit; load with vlucas/phpdotenv)
            ├── .env.example            # committed template of .env
            ├── .gitignore              # vendor/  .env  storage/*
            ├── composer.json
            ├── composer.lock           # commit it: pins exact versions
            └── phpunit.xml
            `,
          note: 'Point the web server at public/ so src/, vendor/, .env and storage/ can never be requested by URL. Pages in public/ start with require __DIR__ . \'/../src/bootstrap.php\';',
        },
        {
          title: '8. Add tests and code style',
          lang: 'bash',
          code: c`
            composer require --dev phpunit/phpunit
            ./vendor/bin/phpunit tests            # macOS / Linux / Git Bash
            vendor\bin\phpunit tests              # Windows cmd / PowerShell

            composer require --dev friendsofphp/php-cs-fixer
            `,
        },
      ],
    },
    {
      id: 'composer',
      title: 'Composer',
      group: 'Setup',
      items: [
        {
          title: 'Install & require',
          lang: 'bash',
          code: c`
            composer install
            composer require guzzlehttp/guzzle
            composer require --dev phpunit/phpunit
            `,
        },
        {
          title: 'Autoload & update',
          lang: 'bash',
          code: c`
            composer dump-autoload -o
            composer update vendor/package
            composer outdated
            `,
        },
      ],
    },
    {
      id: 'imports',
      title: 'Imports: namespaces, use & require',
      group: 'Language',
      items: [
        {
          title: 'Declare a namespace',
          code: c`
            <?php
            // src/Services/Mailer.php
            declare(strict_types=1);

            namespace App\Services;          // must be the first statement (after declare)

            class Mailer
            {
                public function send(string $to): void { /* ... */ }
            }
            `,
          note: 'One class per file. The namespace mirrors the folder: App\\Services\\Mailer lives in src/Services/Mailer.php (PSR-4).',
        },
        {
          title: 'Import classes with use',
          code: c`
            <?php
            namespace App\Http\Controllers;

            use App\Models\User;
            use App\Services\Mailer;
            use App\Services\Mailer as MailService;      // alias
            use App\Models\{Order, Invoice, Payment};    // group import

            $user = new User();
            $mailer = new MailService();
            `,
          note: 'use statements go after the namespace line and before any code. They only create short names: the file still has to be loaded (by the autoloader).',
        },
        {
          title: 'Import functions and constants',
          code: c`
            <?php
            namespace App;

            use function App\Support\money_format_php;
            use function array_map;                        // optional: makes global calls explicit
            use const App\Config\MAX_UPLOAD_MB;

            echo money_format_php(1299.5);
            echo MAX_UPLOAD_MB;
            `,
        },
        {
          title: 'Global classes need a leading backslash',
          code: c`
            <?php
            namespace App\Services;

            $now = new \DateTimeImmutable();      // ✅ global class
            $now = new DateTimeImmutable();       // ❌ looks for App\Services\DateTimeImmutable

            // or import it once at the top
            use DateTimeImmutable;
            use Exception;
            `,
          note: 'Built-in classes (DateTime, Exception, PDO, ArrayObject…) live in the global namespace.',
        },
        {
          title: 'require, include and their _once versions',
          code: c`
            <?php
            require __DIR__ . '/config.php';          // fatal error if missing
            require_once __DIR__ . '/helpers.php';    // load only once, even if called again
            include __DIR__ . '/partials/header.php'; // warning if missing, script continues
            include_once __DIR__ . '/partials/nav.php';

            $config = require __DIR__ . '/config.php';   // a file can return a value: <?php return ['debug' => true];
            `,
          note: 'Always build paths from __DIR__ so they work no matter where the script is run from. In Composer projects you rarely need require for classes: the autoloader does it.',
        },
        {
          title: 'Composer autoloading (the modern way)',
          lang: 'json',
          code: c`
            {
              "autoload": {
                "psr-4": { "App\\": "src/" },
                "files": ["src/helpers.php"]
              },
              "autoload-dev": {
                "psr-4": { "Tests\\": "tests/" }
              }
            }
            `,
          then: [
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
              composer dump-autoload
              `,
            },
            {
              label: 'Load it once in your entry file',
              lang: 'php',
              code: c`
              <?php
              require __DIR__ . '/../vendor/autoload.php';

              use App\Services\Mailer;      // now any class under src/ loads automatically
              (new Mailer())->send('ana@example.com');
              `,
            },
          ],
          note: '"files" is for plain functions (helpers), which cannot be autoloaded like classes.',
        },
        {
          title: 'Use a package from Packagist',
          lang: 'bash',
          code: c`
            composer require guzzlehttp/guzzle
            `,
          then: [
            {
              label: 'Import and use it',
              lang: 'php',
              code: c`
              <?php
              require __DIR__ . '/vendor/autoload.php';

              use GuzzleHttp\Client;

              $client = new Client(['base_uri' => 'https://api.example.com/']);
              $data = json_decode($client->get('rates')->getBody(), true);
              `,
            },
          ],
          note: 'The package README shows its namespace; the autoloader from vendor/autoload.php handles loading.',
        },
      ],
    },
    {
      id: 'basics',
      title: 'Basics',
      group: 'Language',
      items: [
        {
          title: 'Variables, constants and output',
          code: c`
            <?php
            $name = 'Ana';
            $age = 31;
            $price = 299.5;
            $active = true;
            $tags = ['php', 'laravel'];
            $nothing = null;

            const APP_NAME = 'Shop';            // compile-time constant
            define('VERSION', '1.4.0');         // runtime constant

            echo "Hello, $name!\n";             // double quotes interpolate
            echo 'Hello, $name!';               // single quotes do not
            echo "Total: {$price} for {$tags[0]}";
            printf("%s is %d years old\n", $name, $age);
            `,
        },
        {
          title: 'Heredoc and nowdoc',
          code: c`
            <?php
            $html = <<<HTML
                <h1>Hello, {$user->name}</h1>
                <p>You have {$count} new messages.</p>
                HTML;                            // closing marker's indentation is removed

            $sql = <<<'SQL'
                SELECT * FROM users WHERE id = :id
                SQL;                             // nowdoc: no interpolation
            `,
        },
        {
          title: 'Comparison: == vs ===',
          code: c`
            <?php
            0 == 'a'        // false in PHP 8 (was true in PHP 7)
            '1' == 1        // true  (loose: converts types)
            '1' === 1       // false (strict: type AND value)
            null == false   // true
            null === false  // false

            $a <=> $b       // spaceship: -1, 0 or 1 (great for usort)
            `,
          note: 'Use === and !== by default. Loose comparison has surprising conversions.',
        },
        {
          title: 'Loops',
          code: c`
            <?php
            for ($i = 0; $i < 3; $i++) { echo $i; }

            foreach ($users as $user) { echo $user['name']; }
            foreach ($prices as $sku => $price) { echo "$sku: $price"; }

            foreach ($items as &$item) { $item['qty'] *= 2; }   // by reference: modifies $items
            unset($item);                                       // always unset after a by-reference loop

            while ($row = $stmt->fetch()) { /* ... */ }

            foreach ($orders as $order) {
                if ($order->cancelled) continue;
                if ($order->total > 1000) break;
            }
            `,
        },
        {
          title: 'Functions',
          code: c`
            <?php
            function greet(string $name, string $greeting = 'Hello'): string
            {
                return "$greeting, $name!";
            }

            function sum(int ...$numbers): int          // variadic
            {
                return array_sum($numbers);
            }

            function addTax(float &$amount): void       // by reference
            {
                $amount *= 1.12;
            }

            greet('Ana');
            greet(greeting: 'Hi', name: 'Ben');         // named arguments
            sum(1, 2, 3);
            sum(...[1, 2, 3]);                          // spread an array
            `,
        },
        {
          title: 'Closures and callables',
          code: c`
            <?php
            $rate = 1.12;

            $withTax = function (float $amount) use ($rate): float {   // "use" captures by value
                return $amount * $rate;
            };

            $withTax2 = fn (float $amount) => $amount * $rate;          // arrow fn captures automatically

            $counter = 0;
            $inc = function () use (&$counter) { $counter++; };         // capture by reference

            $len = strlen(...);                    // first-class callable (PHP 8.1)
            $method = $mailer->send(...);
            array_map(strtoupper(...), ['a', 'b']);
            `,
        },
      ],
    },
    {
      id: 'types',
      title: 'Types & functions',
      group: 'Language',
      items: [
        {
          title: 'Strict types',
          code: c`
            <?php
            declare(strict_types=1);
            `,
        },
        {
          title: 'Typed signatures',
          code: c`
            function total(array $lines, ?float $tax = null): float
            {
                return array_sum($lines) * (1 + ($tax ?? 0));
            }
            `,
        },
        {
          title: 'Union & nullable types',
          code: 'function find(int|string $id): ?User { /* ... */ }',
        },
        {
          title: 'Named arguments',
          code: "createInvoice(customerId: 7, currency: 'MXN', draft: true);",
        },
        {
          title: 'Arrow functions',
          code: '$paid = array_filter($invoices, fn($i) => $i->status === \'paid\');',
        },
      ],
    },
    {
      id: 'classes',
      title: 'Classes',
      group: 'Language',
      items: [
        {
          title: 'Constructor promotion',
          code: c`
            final class Money
            {
                public function __construct(
                    public readonly int $amount,
                    public readonly string $currency,
                ) {}
            }
            `,
        },
        {
          title: 'Enums',
          code: c`
            enum Status: string
            {
                case Pending = 'pending';
                case Paid = 'paid';

                public function label(): string
                {
                    return ucfirst($this->value);
                }
            }

            Status::from('paid');      // Status::Paid
            Status::tryFrom('bogus');  // null
            `,
        },
        {
          title: 'Interfaces',
          code: c`
            interface PaymentGateway
            {
                public function charge(Money $amount): string;
            }
            `,
        },
      ],
    },
    {
      id: 'oop',
      title: 'OOP: inheritance, traits, static & more',
      group: 'Language',
      items: [
        {
          title: 'Visibility, inheritance and parent::',
          code: c`
            <?php
            class Product
            {
                public function __construct(
                    protected string $name,
                    protected float $price,
                ) {}

                public function label(): string
                {
                    return $this->name . ' — ₱' . number_format($this->price, 2);
                }
            }

            final class DiscountedProduct extends Product      // final: cannot be extended further
            {
                public function __construct(string $name, float $price, private float $discount)
                {
                    parent::__construct($name, $price);
                }

                public function label(): string
                {
                    return parent::label() . " (-{$this->discount}%)";
                }
            }
            `,
          note: 'public: anywhere. protected: this class and children. private: this class only.',
        },
        {
          title: 'Abstract classes',
          code: c`
            <?php
            abstract class PaymentGateway
            {
                abstract public function charge(int $cents): string;      // children must implement

                public function refund(string $id): void { /* shared logic */ }
            }

            class StripeGateway extends PaymentGateway
            {
                public function charge(int $cents): string { return 'ch_123'; }
            }
            `,
          note: 'Use an interface for a pure contract; use an abstract class when you also want shared code.',
        },
        {
          title: 'Traits: reuse code across classes',
          code: c`
            <?php
            trait HasSlug
            {
                public function slug(): string
                {
                    return strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $this->title), '-'));
                }
            }

            class Post
            {
                use HasSlug;
                public function __construct(public string $title) {}
            }

            echo (new Post('Hello World!'))->slug();   // hello-world
            `,
        },
        {
          title: 'Static properties and methods',
          code: c`
            <?php
            class Money
            {
                public static string $currency = 'PHP';

                public static function format(float $amount): string
                {
                    return self::$currency . ' ' . number_format($amount, 2);
                }

                public static function create(): static     // late static binding: returns the child class
                {
                    return new static();
                }
            }

            Money::format(1299);
            Money::$currency = 'USD';
            `,
        },
        {
          title: 'Readonly properties and classes',
          code: c`
            <?php
            final class Address
            {
                public function __construct(
                    public readonly string $street,
                    public readonly string $city,
                ) {}
            }

            readonly class Point                 // PHP 8.2: every property is readonly
            {
                public function __construct(public int $x, public int $y) {}
            }

            $a = new Address('Main St', 'Cebu');
            $a->city = 'Manila';                 // Error: cannot modify readonly property
            `,
        },
        {
          title: 'Magic methods',
          code: c`
            <?php
            class Config
            {
                private array $data = [];

                public function __get(string $key): mixed { return $this->data[$key] ?? null; }
                public function __set(string $key, mixed $value): void { $this->data[$key] = $value; }
                public function __isset(string $key): bool { return isset($this->data[$key]); }
                public function __toString(): string { return json_encode($this->data); }
                public function __invoke(string $key): mixed { return $this->data[$key] ?? null; }
            }

            $config = new Config();
            $config->debug = true;       // __set
            echo $config;                // __toString
            $config('debug');            // __invoke
            `,
        },
        {
          title: 'Property hooks and asymmetric visibility (PHP 8.4)',
          code: c`
            <?php
            class User
            {
                public string $email {
                    set => strtolower(trim($value));        // runs on every assignment
                }

                public string $fullName {
                    get => $this->first . ' ' . $this->last; // computed, no storage
                }

                public private(set) int $loginCount = 0;    // readable everywhere, writable only inside

                public function __construct(public string $first, public string $last) {}
            }
            `,
          note: 'Needs PHP 8.4. Ubuntu 24.04 ships 8.3, so check php -v before using them.',
        },
        {
          title: 'Checking types',
          code: c`
            <?php
            $order instanceof Order          // class or interface check
            get_class($order)                // "App\Models\Order"
            $order::class                    // same, PHP 8
            method_exists($order, 'cancel')
            property_exists($order, 'total')
            gettype($value)                  // "integer", "string", "array"...
            get_debug_type($value)           // "int", "string", "App\Models\Order" (PHP 8)
            `,
        },
      ],
    },
    {
      id: 'control',
      title: 'Control flow',
      group: 'Language',
      items: [
        {
          title: 'match',
          code: c`
            $fee = match ($country) {
                'MX', 'CO' => 0.035,
                'AR'       => 0.045,
                default    => 0.05,
            };
            `,
          note: 'Strict comparison, no fall-through, and it returns a value.',
        },
        {
          title: 'Null-safe & coalescing',
          code: c`
            $city = $user?->address?->city ?? 'Unknown';
            $config['timeout'] ??= 30;
            `,
        },
        {
          title: 'Exceptions',
          code: c`
            try {
                $gateway->charge($money);
            } catch (CardDeclined | Timeout $e) {
                report($e);
            } finally {
                $lock->release();
            }
            `,
        },
      ],
    },
    {
      id: 'errors',
      title: 'Errors & exceptions',
      group: 'Language',
      items: [
        {
          title: 'try / catch / finally',
          code: c`
            <?php
            try {
                $order = $repo->findOrFail($id);
                $gateway->charge($order);
            } catch (NotFoundException $e) {
                http_response_code(404);
            } catch (PaymentFailed | TimeoutException $e) {      // several types
                error_log($e->getMessage());
            } catch (Throwable $e) {                             // anything (Exception and Error)
                error_log((string) $e);
                throw $e;                                        // re-throw
            } finally {
                $lock->release();                                // always runs
            }
            `,
        },
        {
          title: 'Custom exceptions',
          code: c`
            <?php
            class PaymentFailed extends RuntimeException
            {
                public static function declined(string $reason): self
                {
                    return new self("Payment declined: $reason", 402);
                }
            }

            throw PaymentFailed::declined('insufficient funds');

            $user = $repo->find($id) ?? throw new NotFoundException();   // throw is an expression (PHP 8)
            `,
        },
        {
          title: 'Error reporting',
          code: c`
            <?php
            // development
            ini_set('display_errors', '1');
            error_reporting(E_ALL);

            // production: log, never show
            ini_set('display_errors', '0');
            ini_set('log_errors', '1');
            error_log('Something went wrong: ' . $e->getMessage());
            `,
          note: 'Set these in php.ini for real projects (display_errors = Off in production). Frameworks like Laravel configure this for you.',
        },
      ],
    },
    {
      id: 'arrays',
      title: 'Arrays & strings',
      group: 'Language',
      items: [
        {
          title: 'Map / filter / reduce',
          code: c`
            $ids    = array_map(fn($u) => $u->id, $users);
            $active = array_filter($users, fn($u) => $u->active);
            $sum    = array_reduce($lines, fn($c, $l) => $c + $l->amount, 0);
            `,
        },
        {
          title: 'Destructuring & spread',
          code: c`
            [$first, $second] = $pair;
            ['id' => $id, 'name' => $name] = $row;
            $merged = [...$defaults, ...$overrides];
            `,
        },
        {
          title: 'String helpers',
          code: c`
            str_contains($ref, 'INV-');
            str_starts_with($path, '/api');
            sprintf('%s %0.2f', $currency, $amount);
            `,
        },
        {
          title: 'JSON',
          code: c`
            $data = json_decode($body, true, flags: JSON_THROW_ON_ERROR);
            $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            `,
        },
      ],
    },
    {
      id: 'dates',
      title: 'Dates & times',
      group: 'Working with data',
      items: [
        {
          title: 'Create and format',
          code: c`
            <?php
            $now = new DateTimeImmutable();                         // uses date.timezone from php.ini
            $manila = new DateTimeImmutable('now', new DateTimeZone('Asia/Manila'));
            $date = new DateTimeImmutable('2026-10-17 14:30');
            $parsed = DateTimeImmutable::createFromFormat('d/m/Y', '17/10/2026');

            echo $now->format('Y-m-d H:i:s');      // 2026-10-17 14:30:00
            echo $now->format('M j, Y g:i A');     // Oct 17, 2026 2:30 PM
            echo $now->format(DATE_ATOM);          // ISO 8601 for APIs
            echo $now->getTimestamp();
            `,
          note: 'Prefer DateTimeImmutable: methods return a new object instead of changing the original.',
        },
        {
          title: 'Add, subtract and compare',
          code: c`
            <?php
            $due = $now->modify('+30 days');
            $lastMonth = $now->sub(new DateInterval('P1M'));
            $start = $now->setTime(0, 0);

            $diff = $now->diff($due);
            echo $diff->days . ' days left';
            var_dump($due > $now);                 // compare with < > ==
            `,
        },
      ],
    },
    {
      id: 'files',
      title: 'Files, CSV & folders',
      group: 'Working with data',
      items: [
        {
          title: 'Read and write files',
          code: c`
            <?php
            $text = file_get_contents(__DIR__ . '/notes.txt');
            file_put_contents(__DIR__ . '/notes.txt', "New line\n", FILE_APPEND | LOCK_EX);

            $lines = file(__DIR__ . '/list.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

            if (is_file($path) && is_readable($path)) { /* ... */ }
            unlink($path);                          // delete
            `,
        },
        {
          title: 'Large files line by line',
          code: c`
            <?php
            $handle = fopen(__DIR__ . '/access.log', 'r');
            while (($line = fgets($handle)) !== false) {
                if (str_contains($line, ' 500 ')) echo $line;
            }
            fclose($handle);
            `,
          note: 'Uses little memory no matter how big the file is.',
        },
        {
          title: 'CSV import and export',
          code: c`
            <?php
            // read
            $handle = fopen('products.csv', 'r');
            $header = fgetcsv($handle);
            while (($row = fgetcsv($handle)) !== false) {
                $product = array_combine($header, $row);     // ['sku' => ..., 'price' => ...]
            }
            fclose($handle);

            // write (download in the browser)
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="orders.csv"');
            $out = fopen('php://output', 'w');
            fputcsv($out, ['id', 'customer', 'total']);
            foreach ($orders as $o) fputcsv($out, [$o['id'], $o['customer'], $o['total']]);
            fclose($out);
            `,
        },
        {
          title: 'Folders',
          code: c`
            <?php
            if (!is_dir($dir)) mkdir($dir, 0775, true);     // recursive
            $files = glob(__DIR__ . '/uploads/*.jpg');
            foreach (scandir($dir) as $f) { if ($f !== '.' && $f !== '..') echo $f; }
            `,
        },
      ],
    },
    {
      id: 'regex',
      title: 'Regular expressions',
      group: 'Working with data',
      items: [
        {
          title: 'Match, replace and split',
          code: c`
            <?php
            if (preg_match('/^INV-(\d{4})-(\d+)$/', $code, $m)) {
                [$all, $year, $number] = $m;
            }

            preg_match_all('/#(\w+)/', $text, $matches);           // all hashtags → $matches[1]

            $slug = preg_replace('/[^a-z0-9]+/', '-', strtolower($title));
            $clean = preg_replace_callback('/\d+/', fn ($m) => $m[0] * 2, 'a1 b2');

            $parts = preg_split('/[\s,]+/', 'php, laravel  vue', -1, PREG_SPLIT_NO_EMPTY);
            `,
          note: 'Named groups: /(?<year>\\d{4})/ then $m[\'year\']. Add the u flag (/.../u) for UTF-8 text.',
        },
        {
          title: 'Validate common input',
          code: c`
            <?php
            filter_var($email, FILTER_VALIDATE_EMAIL);           // returns the value or false
            filter_var($url, FILTER_VALIDATE_URL);
            filter_var($age, FILTER_VALIDATE_INT, ['options' => ['min_range' => 18]]);
            filter_var('yes', FILTER_VALIDATE_BOOL);             // true
            `,
        },
      ],
    },
    {
      id: 'pdo',
      title: 'Database with PDO',
      group: 'Web & database',
      items: [
        {
          title: 'Connect',
          code: c`
            <?php
            $pdo = new PDO(
                'mysql:host=127.0.0.1;port=3306;dbname=shop;charset=utf8mb4',
                'shop',
                'secret',
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,         // throw on errors
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,    // rows as arrays
                    PDO::ATTR_EMULATE_PREPARES => false,
                ],
            );
            // PostgreSQL: 'pgsql:host=127.0.0.1;port=5432;dbname=shop'
            // SQLite:     'sqlite:' . __DIR__ . '/database.sqlite'
            `,
          note: 'Needs the pdo_mysql (or pdo_pgsql / pdo_sqlite) extension. Check with php -m.',
        },
        {
          title: 'Select with prepared statements',
          code: c`
            <?php
            $stmt = $pdo->prepare('SELECT * FROM products WHERE category_id = :cat AND price < :max');
            $stmt->execute(['cat' => 3, 'max' => 500]);
            $products = $stmt->fetchAll();

            $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
            $stmt->execute([$email]);
            $user = $stmt->fetch();                 // one row or false

            $count = $pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn();
            `,
          note: 'Never put user input directly into SQL strings. Placeholders (:name or ?) prevent SQL injection.',
        },
        {
          title: 'Insert, update, delete',
          code: c`
            <?php
            $stmt = $pdo->prepare('INSERT INTO orders (user_id, total) VALUES (:user, :total)');
            $stmt->execute(['user' => $userId, 'total' => 1299.50]);
            $orderId = $pdo->lastInsertId();

            $stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?');
            $stmt->execute(['paid', $orderId]);
            echo $stmt->rowCount() . ' row(s) updated';
            `,
        },
        {
          title: 'Transactions',
          code: c`
            <?php
            $pdo->beginTransaction();
            try {
                $pdo->prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?')->execute([500, $from]);
                $pdo->prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?')->execute([500, $to]);
                $pdo->commit();
            } catch (Throwable $e) {
                $pdo->rollBack();
                throw $e;
            }
            `,
        },
      ],
    },
    {
      id: 'http',
      title: 'Requests, responses & sessions',
      group: 'Web & database',
      items: [
        {
          title: 'Read the request',
          code: c`
            <?php
            $page = (int) ($_GET['page'] ?? 1);            // query string ?page=2
            $email = trim($_POST['email'] ?? '');          // form fields
            $method = $_SERVER['REQUEST_METHOD'];          // GET, POST...
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $ip = $_SERVER['REMOTE_ADDR'];

            $json = json_decode(file_get_contents('php://input'), true);   // JSON request body
            `,
        },
        {
          title: 'Send responses, headers and redirects',
          code: c`
            <?php
            // JSON API response
            http_response_code(201);
            header('Content-Type: application/json');
            echo json_encode(['id' => $orderId, 'status' => 'created']);
            exit;

            // redirect after a form post
            header('Location: /thank-you', true, 303);
            exit;
            `,
          note: 'Headers must be sent before any output (even a blank line before <?php breaks them).',
        },
        {
          title: 'Sessions and cookies',
          code: c`
            <?php
            session_start();                                  // before any output
            $_SESSION['user_id'] = $user['id'];
            $userId = $_SESSION['user_id'] ?? null;
            session_regenerate_id(true);                      // after login (prevents session fixation)
            session_destroy();                                // logout

            setcookie('theme', 'dark', [
                'expires' => time() + 60 * 60 * 24 * 30,
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
            $theme = $_COOKIE['theme'] ?? 'light';
            `,
        },
        {
          title: 'Handle a file upload',
          code: c`
            <?php
            // <form method="post" enctype="multipart/form-data"><input type="file" name="avatar">
            $file = $_FILES['avatar'] ?? null;

            if ($file && $file['error'] === UPLOAD_ERR_OK) {
                $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
                if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) exit('Invalid type');
                if ($file['size'] > 2 * 1024 * 1024) exit('Max 2 MB');

                $name = bin2hex(random_bytes(16)) . '.' . explode('/', $mime)[1];
                move_uploaded_file($file['tmp_name'], __DIR__ . '/uploads/' . $name);
            }
            `,
          note: 'Check the real MIME type and generate your own file name: never trust the uploaded name or extension.',
        },
        {
          title: 'Call an external API',
          code: c`
            <?php
            // cURL (built in with the curl extension)
            $ch = curl_init('https://api.example.com/orders');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Authorization: Bearer ' . $token],
                CURLOPT_POSTFIELDS => json_encode(['product_id' => 42]),
                CURLOPT_TIMEOUT => 10,
            ]);
            $body = curl_exec($ch);
            $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            $data = json_decode($body, true);
            `,
          then: [
            {
              label: 'Guzzle (composer require guzzlehttp/guzzle)',
              lang: 'php',
              code: c`
              <?php
              use GuzzleHttp\Client;

              $client = new Client(['base_uri' => 'https://api.example.com/', 'timeout' => 10]);
              $res = $client->post('orders', [
                  'json' => ['product_id' => 42],
                  'headers' => ['Authorization' => 'Bearer ' . $token],
              ]);
              $data = json_decode($res->getBody(), true);
              `,
            },
          ],
        },
      ],
    },
    {
      id: 'security',
      title: 'Security essentials',
      group: 'Web & database',
      items: [
        {
          title: 'Passwords',
          code: c`
            <?php
            $hash = password_hash($password, PASSWORD_DEFAULT);       // store this (bcrypt / argon2)

            if (password_verify($input, $hash)) {
                if (password_needs_rehash($hash, PASSWORD_DEFAULT)) {
                    $hash = password_hash($input, PASSWORD_DEFAULT);   // upgrade old hashes on login
                }
            }
            `,
          note: 'Never store plain passwords, md5 or sha1. password_hash adds the salt for you.',
        },
        {
          title: 'Escape output (prevent XSS)',
          code: c`
            <?php
            function e(?string $value): string
            {
                return htmlspecialchars($value ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            }
            ?>
            <p>Hello, <?= e($user['name']) ?></p>
            <input value="<?= e($_GET['q'] ?? '') ?>">
            `,
        },
        {
          title: 'CSRF token for plain PHP forms',
          code: c`
            <?php
            session_start();
            $_SESSION['csrf'] ??= bin2hex(random_bytes(32));

            // in the form
            echo '<input type="hidden" name="csrf" value="' . $_SESSION['csrf'] . '">';

            // when handling the POST
            if (!hash_equals($_SESSION['csrf'], $_POST['csrf'] ?? '')) {
                http_response_code(419);
                exit('Invalid CSRF token');
            }
            `,
          note: 'Frameworks (Laravel @csrf, Symfony forms) do this for you.',
        },
        {
          title: 'Secure random values',
          code: c`
            <?php
            $token = bin2hex(random_bytes(32));       // 64-char hex token
            $code = random_int(100000, 999999);       // 6-digit OTP
            `,
          note: 'rand() and mt_rand() are not safe for tokens or passwords.',
        },
      ],
    },
    {
      id: 'auth-setup',
      title: 'Session login: setup',
      group: 'Authentication',
      items: [
        {
          title: 'How session authentication works',
          lang: 'text',
          code: c`
            1. User submits email + password
            2. PHP checks the password against the stored hash (password_verify)
            3. On success: session_regenerate_id() and $_SESSION['user_id'] = id
            4. Browser keeps the session cookie (PHPSESSID); PHP looks up the session on each request
            5. Protected pages check $_SESSION['user_id'] and redirect to /login if missing
            6. Logout clears the session and the cookie
            `,
          note: 'Only the session id travels in the cookie. The user data stays on the server.',
        },
        {
          title: '1. Users table',
          lang: 'sql',
          code: c`
            CREATE TABLE users (
              id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(100) NOT NULL,
              email VARCHAR(255) NOT NULL UNIQUE,
              password_hash VARCHAR(255) NOT NULL,          -- room for bcrypt / argon2 hashes
              role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `,
        },
        {
          title: '2. Secure session settings (bootstrap.php)',
          code: c`
            <?php
            // src/bootstrap.php: include at the top of every page, before any output
            declare(strict_types=1);

            ini_set('session.use_strict_mode', '1');      // reject session ids the server did not create
            ini_set('session.use_only_cookies', '1');     // never accept ids from the URL
            ini_set('session.gc_maxlifetime', '7200');    // 2 hours

            session_name('app_session');
            session_set_cookie_params([
                'lifetime' => 0,                          // until the browser closes
                'path' => '/',
                'secure' => isset($_SERVER['HTTPS']),     // HTTPS only in production
                'httponly' => true,                       // JavaScript cannot read it
                'samesite' => 'Lax',                      // blocks most cross-site requests
            ]);
            session_start();

            require __DIR__ . '/../vendor/autoload.php';
            $pdo = require __DIR__ . '/db.php';           // returns a PDO (see the PDO section)
            require __DIR__ . '/auth.php';
            `,
        },
        {
          title: '3. Auth helpers (auth.php)',
          code: c`
            <?php
            // src/auth.php
            function current_user(PDO $pdo): ?array
            {
                static $user = false;                     // cache for this request
                if ($user === false) {
                    $user = null;
                    if (isset($_SESSION['user_id'])) {
                        $stmt = $pdo->prepare('SELECT id, name, email, role FROM users WHERE id = ?');
                        $stmt->execute([$_SESSION['user_id']]);
                        $user = $stmt->fetch() ?: null;
                    }
                }
                return $user;
            }

            function require_login(PDO $pdo): array
            {
                $user = current_user($pdo);
                if (!$user) {
                    $_SESSION['intended'] = $_SERVER['REQUEST_URI'];   // come back here after login
                    header('Location: /login.php', true, 303);
                    exit;
                }
                return $user;
            }

            function require_role(PDO $pdo, string $role): array
            {
                $user = require_login($pdo);
                if ($user['role'] !== $role) {
                    http_response_code(403);
                    exit('Forbidden');
                }
                return $user;
            }

            function e(?string $v): string
            {
                return htmlspecialchars($v ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            }

            function csrf_field(): string
            {
                $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
                return '<input type="hidden" name="csrf" value="' . $_SESSION['csrf'] . '">';
            }

            function verify_csrf(): void
            {
                if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) {
                    http_response_code(419);
                    exit('Invalid CSRF token');
                }
            }
            `,
        },
      ],
    },
    {
      id: 'auth-flows',
      title: 'Register, login & logout',
      group: 'Authentication',
      items: [
        {
          title: 'Register (register.php)',
          code: c`
            <?php
            require __DIR__ . '/../src/bootstrap.php';
            $errors = [];

            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                verify_csrf();
                $name = trim($_POST['name'] ?? '');
                $email = strtolower(trim($_POST['email'] ?? ''));
                $password = $_POST['password'] ?? '';

                if ($name === '') $errors['name'] = 'Name is required';
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Enter a valid email';
                if (strlen($password) < 8) $errors['password'] = 'At least 8 characters';

                if (!$errors) {
                    try {
                        $stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
                        $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
                        session_regenerate_id(true);
                        $_SESSION['user_id'] = (int) $pdo->lastInsertId();
                        header('Location: /dashboard.php', true, 303);
                        exit;
                    } catch (PDOException $ex) {
                        if ($ex->errorInfo[1] === 1062) $errors['email'] = 'That email is already registered';   // MySQL duplicate key
                        else throw $ex;
                    }
                }
            }
            ?>
            <form method="post">
              <?= csrf_field() ?>
              <input name="name" value="<?= e($name ?? '') ?>" placeholder="Name"> <?= e($errors['name'] ?? '') ?>
              <input name="email" type="email" value="<?= e($email ?? '') ?>" placeholder="Email"> <?= e($errors['email'] ?? '') ?>
              <input name="password" type="password" placeholder="Password"> <?= e($errors['password'] ?? '') ?>
              <button>Create account</button>
            </form>
            `,
        },
        {
          title: 'Login (login.php)',
          code: c`
            <?php
            require __DIR__ . '/../src/bootstrap.php';
            $error = null;

            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                verify_csrf();
                $email = strtolower(trim($_POST['email'] ?? ''));
                $stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE email = ?');
                $stmt->execute([$email]);
                $user = $stmt->fetch();

                if ($user && password_verify($_POST['password'] ?? '', $user['password_hash'])) {
                    if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
                        $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
                            ->execute([password_hash($_POST['password'], PASSWORD_DEFAULT), $user['id']]);
                    }
                    session_regenerate_id(true);            // new session id: prevents session fixation
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['last_activity'] = time();

                    $to = $_SESSION['intended'] ?? '/dashboard.php';
                    unset($_SESSION['intended']);
                    header('Location: ' . (str_starts_with($to, '/') ? $to : '/dashboard.php'), true, 303);
                    exit;
                }
                $error = 'Wrong email or password';         // same message either way: do not reveal which
            }
            ?>
            <form method="post">
              <?= csrf_field() ?>
              <input name="email" type="email" placeholder="Email">
              <input name="password" type="password" placeholder="Password">
              <button>Log in</button>
              <?= $error ? '<p>' . e($error) . '</p>' : '' ?>
            </form>
            `,
          note: 'The redirect only accepts paths starting with "/" so an attacker cannot send users to another site after login.',
        },
        {
          title: 'Protect a page (dashboard.php)',
          code: c`
            <?php
            require __DIR__ . '/../src/bootstrap.php';
            $user = require_login($pdo);              // redirects to /login.php if not logged in
            ?>
            <h1>Welcome, <?= e($user['name']) ?></h1>
            <form method="post" action="/logout.php"><?= csrf_field() ?><button>Log out</button></form>
            `,
          then: [
            {
              label: 'Admin-only page',
              lang: 'php',
              code: c`
              <?php
              require __DIR__ . '/../src/bootstrap.php';
              $admin = require_role($pdo, 'admin');     // 403 for everyone else
              `,
            },
          ],
        },
        {
          title: 'Logout (logout.php)',
          code: c`
            <?php
            require __DIR__ . '/../src/bootstrap.php';
            verify_csrf();                            // logout via POST + token, not a GET link

            $_SESSION = [];
            $p = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 3600, 'path' => $p['path'], 'domain' => $p['domain'],
                'secure' => $p['secure'], 'httponly' => $p['httponly'], 'samesite' => $p['samesite'],
            ]);
            session_destroy();

            header('Location: /login.php', true, 303);
            exit;
            `,
        },
        {
          title: 'Log out after inactivity',
          code: c`
            <?php
            // in bootstrap.php, after session_start()
            $timeout = 30 * 60;                       // 30 minutes
            if (isset($_SESSION['last_activity']) && time() - $_SESSION['last_activity'] > $timeout) {
                $_SESSION = [];
                session_regenerate_id(true);
            }
            $_SESSION['last_activity'] = time();
            `,
        },
      ],
    },
    {
      id: 'auth-extras',
      title: 'Rate limiting, remember me & password reset',
      group: 'Authentication',
      items: [
        {
          title: 'Limit failed login attempts',
          lang: 'sql',
          code: c`
            CREATE TABLE login_attempts (
              id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              email VARCHAR(255) NOT NULL,
              ip VARCHAR(45) NOT NULL,
              attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX (email, attempted_at),
              INDEX (ip, attempted_at)
            );
            `,
          then: [
            {
              label: 'In login.php, before checking the password',
              lang: 'php',
              code: c`
              <?php
              $stmt = $pdo->prepare('SELECT COUNT(*) FROM login_attempts
                  WHERE (email = ? OR ip = ?) AND attempted_at > NOW() - INTERVAL 15 MINUTE');
              $stmt->execute([$email, $_SERVER['REMOTE_ADDR']]);
              if ($stmt->fetchColumn() >= 5) {
                  http_response_code(429);
                  exit('Too many attempts. Try again in 15 minutes.');
              }

              // after a failed check:
              $pdo->prepare('INSERT INTO login_attempts (email, ip) VALUES (?, ?)')->execute([$email, $_SERVER['REMOTE_ADDR']]);
              // after a successful login:
              $pdo->prepare('DELETE FROM login_attempts WHERE email = ?')->execute([$email]);
              `,
            },
          ],
        },
        {
          title: '"Remember me" with a selector + validator token',
          lang: 'sql',
          code: c`
            CREATE TABLE remember_tokens (
              selector CHAR(24) PRIMARY KEY,
              validator_hash CHAR(64) NOT NULL,           -- sha256 of the secret part
              user_id INT UNSIGNED NOT NULL,
              expires_at DATETIME NOT NULL,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            `,
          then: [
            {
              label: 'Issue it at login (when the box is ticked)',
              lang: 'php',
              code: c`
              <?php
              $selector = bin2hex(random_bytes(12));
              $validator = bin2hex(random_bytes(32));
              $pdo->prepare('INSERT INTO remember_tokens VALUES (?, ?, ?, NOW() + INTERVAL 30 DAY)')
                  ->execute([$selector, hash('sha256', $validator), $user['id']]);
              setcookie('remember', "$selector:$validator", [
                  'expires' => time() + 60 * 60 * 24 * 30, 'path' => '/',
                  'secure' => true, 'httponly' => true, 'samesite' => 'Lax',
              ]);
              `,
            },
            {
              label: 'Log in from it (bootstrap.php, when there is no session)',
              lang: 'php',
              code: c`
              <?php
              if (!isset($_SESSION['user_id']) && isset($_COOKIE['remember'])) {
                  [$selector, $validator] = explode(':', $_COOKIE['remember'], 2) + [null, null];
                  $stmt = $pdo->prepare('SELECT * FROM remember_tokens WHERE selector = ? AND expires_at > NOW()');
                  $stmt->execute([$selector]);
                  $row = $stmt->fetch();
                  if ($row && $validator && hash_equals($row['validator_hash'], hash('sha256', $validator))) {
                      session_regenerate_id(true);
                      $_SESSION['user_id'] = $row['user_id'];
                      // rotate: delete this token and issue a new one (same code as at login)
                      $pdo->prepare('DELETE FROM remember_tokens WHERE selector = ?')->execute([$selector]);
                  }
              }
              `,
            },
          ],
          note: 'Only a hash of the secret is stored, so a leaked database cannot be used to log in. Delete the user\'s tokens on logout and on password change.',
        },
        {
          title: 'Password reset by email',
          lang: 'sql',
          code: c`
            CREATE TABLE password_resets (
              email VARCHAR(255) NOT NULL,
              token_hash CHAR(64) NOT NULL,
              expires_at DATETIME NOT NULL,
              INDEX (email)
            );
            `,
          then: [
            {
              label: 'forgot.php: send the link',
              lang: 'php',
              code: c`
              <?php
              $token = bin2hex(random_bytes(32));
              $pdo->prepare('DELETE FROM password_resets WHERE email = ?')->execute([$email]);
              $pdo->prepare('INSERT INTO password_resets VALUES (?, ?, NOW() + INTERVAL 1 HOUR)')
                  ->execute([$email, hash('sha256', $token)]);
              $link = 'https://example.com/reset.php?email=' . urlencode($email) . '&token=' . $token;
              // send $link by email (PHPMailer / Symfony Mailer)
              echo 'If that email exists, a reset link is on its way.';      // same answer for unknown emails
              `,
            },
            {
              label: 'reset.php: set the new password',
              lang: 'php',
              code: c`
              <?php
              $stmt = $pdo->prepare('SELECT token_hash FROM password_resets WHERE email = ? AND expires_at > NOW()');
              $stmt->execute([$_POST['email']]);
              $row = $stmt->fetch();
              if (!$row || !hash_equals($row['token_hash'], hash('sha256', $_POST['token']))) exit('Invalid or expired link');

              $pdo->prepare('UPDATE users SET password_hash = ? WHERE email = ?')
                  ->execute([password_hash($_POST['password'], PASSWORD_DEFAULT), $_POST['email']]);
              $pdo->prepare('DELETE FROM password_resets WHERE email = ?')->execute([$_POST['email']]);
              `,
            },
          ],
        },
        {
          title: 'Token auth for a PHP JSON API',
          code: c`
            <?php
            // clients send: Authorization: Bearer <token>
            // store only sha256(token) in an api_tokens(user_id, token_hash, expires_at) table
            $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            if (!preg_match('/^Bearer\s+(\S+)$/', $header, $m)) {
                http_response_code(401);
                exit(json_encode(['error' => 'Missing token']));
            }
            $stmt = $pdo->prepare('SELECT user_id FROM api_tokens WHERE token_hash = ? AND expires_at > NOW()');
            $stmt->execute([hash('sha256', $m[1])]);
            $userId = $stmt->fetchColumn();
            if (!$userId) {
                http_response_code(401);
                exit(json_encode(['error' => 'Invalid token']));
            }
            `,
          note: 'For a full API, use a framework: Laravel Sanctum handles tokens, SPA cookies and CSRF for you (see the Laravel sheet). For JWTs in plain PHP, use the firebase/php-jwt package.',
        },
      ],
    },
    {
      id: 'debugging',
      title: 'Running & debugging',
      group: 'Debugging',
      items: [
        {
          title: 'Run code from the terminal',
          lang: 'bash',
          code: c`
            # same on every OS
            php script.php
            php -r "echo PHP_VERSION, PHP_EOL;"
            php -a                  # interactive shell
            php -l src/Mailer.php   # syntax check
            php -S localhost:8000 -t public
            `,
        },
        {
          title: 'Inspect values',
          code: c`
            <?php
            var_dump($order);                    // type + value
            print_r($items);                     // readable arrays
            echo '<pre>' . print_r($items, true) . '</pre>';
            error_log(print_r($payload, true));  // to the server log
            dd($order);                          // Laravel / Symfony VarDumper: dump and die
            `,
        },
        {
          title: 'Step debugging with Xdebug',
          lang: 'bash',
          code: c`
            # macOS (Homebrew PHP)
            pecl install xdebug

            # Linux (Ubuntu / Debian)
            sudo apt install -y php8.3-xdebug

            # Windows: download the DLL matching php -v from xdebug.org/wizard and add it to php.ini
            `,
          then: [
            {
              label: 'php.ini',
              lang: 'ini',
              code: c`
              zend_extension=xdebug
              xdebug.mode=debug
              xdebug.start_with_request=yes
              xdebug.client_port=9003
              `,
            },
          ],
          note: 'In VS Code install the "PHP Debug" extension, add a "Listen for Xdebug" launch config, set a breakpoint and reload the page.',
        },
      ],
    },
  ],
}
