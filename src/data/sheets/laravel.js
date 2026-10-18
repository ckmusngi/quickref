import { c } from './shared/code.js'

export default {
  slug: 'laravel',
  title: 'Laravel',
  tech: 'Laravel',
  category: 'backend',
  minutes: 50,
  lang: 'php',
  description: 'The complete Laravel reference: Artisan, routing, Eloquent, controllers and Blade views, forms, CSRF protection, jQuery & AJAX, validation, Sanctum auth, policies, API resources, events, queues, caching, scheduling, the container, collections, helpers and testing.',
  sections: [
    {
      id: 'project-setup',
      title: 'Project setup, step by step',
      group: 'Setup',
      items: [
        {
          title: '1. Install PHP, Composer and Node.js',
          lang: 'bash',
          code: c`
            # macOS: Laravel Herd (herd.laravel.com) installs PHP + Composer + the Laravel installer
            # or with Homebrew:
            brew install php composer node

            # Linux (Ubuntu / Debian)
            sudo apt update
            sudo apt install -y php-cli php-mbstring php-xml php-curl php-zip php-sqlite3 php-mysql php-bcmath php-intl unzip
            curl -sS https://getcomposer.org/installer | php && sudo mv composer.phar /usr/local/bin/composer
            # Node.js: see the Node sheet (nvm)

            # Windows (PowerShell): Laravel Herd for Windows, or the php.new one-liner:
            Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows'))
            winget install -e --id OpenJS.NodeJS.LTS

            # check (all OS, in a NEW terminal)
            php -v && composer -V && node -v
            `,
        },
        {
          title: '2. Create the project',
          lang: 'bash',
          code: c`
            # all OS
            composer global require laravel/installer
            laravel new my-app          # asks: starter kit (none / React / Vue / Livewire), database, testing
            cd my-app

            # without the installer:
            composer create-project laravel/laravel my-app
            `,
          note: 'If "laravel" is not found, add Composer\'s global bin folder to PATH: ~/.composer/vendor/bin or ~/.config/composer/vendor/bin (macOS / Linux), %APPDATA%\\Composer\\vendor\\bin (Windows).',
        },
        {
          title: '3. Configure .env and the database',
          lang: 'env',
          code: c`
            APP_NAME="My App"
            APP_URL=http://localhost:8000

            # default: SQLite, no server needed (database/database.sqlite)
            DB_CONNECTION=sqlite

            # or MySQL
            # DB_CONNECTION=mysql
            # DB_HOST=127.0.0.1
            # DB_PORT=3306
            # DB_DATABASE=my_app
            # DB_USERNAME=root
            # DB_PASSWORD=
            `,
          note: 'For MySQL, create the database first (same command on every OS). See the SQL sheet for installing MySQL.',
          then: [
            {
              label: 'Create the MySQL database',
              lang: 'bash',
              code: c`
                mysql -u root -p -e "CREATE DATABASE my_app"
                `,
            },
          ],
        },
        {
          title: '4. Migrate and install frontend packages',
          lang: 'bash',
          code: c`
            php artisan migrate
            npm install
            `,
        },
        {
          title: '5. Run it',
          lang: 'bash',
          code: c`
            composer run dev          # Laravel 11+: server + queue + logs + Vite together

            # or in two terminals
            php artisan serve         # http://localhost:8000
            npm run dev               # Vite hot reload
            `,
          note: 'With Herd, the site is also served automatically at http://my-app.test.',
        },
        {
          title: '6. Project structure',
          lang: 'text',
          code: c`
            app/
              Http/Controllers/     # controllers
              Models/               # Eloquent models
              Providers/
            bootstrap/app.php       # middleware, exceptions, routing setup (Laravel 11+)
            config/                 # config files (read from .env)
            database/
              migrations/  seeders/  factories/
            public/                 # web root: index.php, built assets
            resources/
              views/                # Blade templates
              js/  css/             # Vite entry points
            routes/
              web.php  api.php  console.php
            storage/                # logs, cache, uploaded files
            tests/
            .env                    # secrets & settings (never commit)
            `,
        },
        {
          title: '7. Setting up a project you cloned',
          lang: 'bash',
          code: c`
            composer install
            npm install

            # copy the env file
            cp .env.example .env              # macOS / Linux / Git Bash
            Copy-Item .env.example .env       # Windows PowerShell
            copy .env.example .env            # Windows cmd

            php artisan key:generate
            php artisan migrate --seed
            php artisan storage:link
            composer run dev
            `,
        },
        {
          title: '8. Fix storage permissions (macOS / Linux)',
          lang: 'bash',
          code: c`
            chmod -R ug+rwx storage bootstrap/cache
            `,
          note: 'Not needed on Windows. On Linux servers see the deploy guides for www-data ownership.',
        },
        {
          title: '9. Recommended editor setup',
          note: 'VS Code: install the "Laravel" (official), "PHP Intelephense" and "Laravel Blade formatter" extensions. PhpStorm with the Laravel Idea plugin is the popular paid option. Run ./vendor/bin/pint to format code with Laravel\'s style.',
        },
      ],
    },
    {
      id: 'artisan',
      title: 'Artisan',
      group: 'Getting started',
      items: [
        {
          title: 'Generate files',
          lang: 'bash',
          code: c`
            php artisan make:model Invoice -mfc   # model + migration + factory + controller
            php artisan make:request StoreInvoiceRequest
            php artisan make:job SyncToXero
            `,
        },
        {
          title: 'Migrations',
          lang: 'bash',
          code: c`
            php artisan migrate
            php artisan migrate:rollback --step=1
            php artisan migrate:fresh --seed   # drops everything!
            `,
        },
        {
          title: 'Clear & cache',
          lang: 'bash',
          code: c`
            php artisan optimize:clear
            php artisan config:cache
            php artisan route:cache
            `,
        },
        {
          title: 'Interactive shell',
          lang: 'bash',
          code: 'php artisan tinker',
        },
      ],
    },
    {
      id: 'routing',
      title: 'Routing',
      group: 'Getting started',
      items: [
        {
          title: 'Basic routes',
          code: c`
            Route::get('/invoices', [InvoiceController::class, 'index']);
            Route::post('/invoices', [InvoiceController::class, 'store']);
            `,
        },
        {
          title: 'Resource controller',
          code: c`
            Route::resource('invoices', InvoiceController::class);
            Route::apiResource('payments', PaymentController::class);
            `,
        },
        {
          title: 'Groups with middleware',
          code: c`
            Route::middleware(['auth:sanctum'])
                ->prefix('api/v1')
                ->group(function () {
                    Route::get('/me', MeController::class);
                });
            `,
        },
        {
          title: 'Route model binding',
          code: c`
            Route::get('/invoices/{invoice}', function (Invoice $invoice) {
                return $invoice;
            });
            `,
          note: 'Laravel looks up the model by id and returns 404 if missing.',
        },
      ],
    },
    {
      id: 'views',
      title: 'Controllers → Blade views',
      group: 'Blade & frontend',
      items: [
        {
          title: 'Create a controller and views',
          lang: 'bash',
          code: c`
            php artisan make:controller ProductController --resource
            php artisan make:view products.index      # resources/views/products/index.blade.php
            php artisan make:view products.show
            `,
          note: 'Dots in view names are folders: products.index → resources/views/products/index.blade.php.',
        },
        {
          title: 'Route to the controller (routes/web.php)',
          code: c`
            use App\Http\Controllers\ProductController;

            Route::get('/products', [ProductController::class, 'index'])->name('products.index');
            Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');

            // or all 7 CRUD routes at once (index, create, store, show, edit, update, destroy)
            Route::resource('products', ProductController::class);
            `,
          note: 'See every route name and URL:',
          then: [
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                php artisan route:list
                `,
            },
          ],
        },
        {
          title: 'Pass data from the controller to the view',
          code: c`
            public function index()
            {
                $products = Product::with('category')->latest()->paginate(15);
                $title = 'All products';

                return view('products.index', compact('products', 'title'));

                // identical alternatives:
                // return view('products.index', ['products' => $products, 'title' => $title]);
                // return view('products.index')->with('products', $products)->with('title', $title);
            }

            public function show(Product $product)      // route model binding: 404 if not found
            {
                return view('products.show', [
                    'product' => $product->load('reviews'),
                    'related' => Product::where('category_id', $product->category_id)->whereKeyNot($product->id)->take(4)->get(),
                ]);
            }
            `,
          note: 'Each array key becomes a variable in the view: products → $products, title → $title.',
        },
        {
          title: 'Use the data in Blade',
          lang: 'blade',
          code: c`
            {{-- resources/views/products/index.blade.php --}}
            <h1>{{ $title }}</h1>

            @forelse ($products as $product)
                <div class="product">
                    <a href="{{ route('products.show', $product) }}">{{ $product->name }}</a>
                    <span>{{ $product->category->name }}</span>
                    <strong>₱{{ number_format($product->price, 2) }}</strong>
                </div>
            @empty
                <p>No products yet.</p>
            @endforelse

            {{ $products->links() }}   {{-- pagination links --}}
            `,
        },
        {
          title: 'Echoing values',
          lang: 'blade',
          code: c`
            {{ $product->name }}                 {{-- escaped: safe against XSS --}}
            {{ $user->nickname ?? 'Guest' }}     {{-- default when null / missing --}}
            {!! $post->body_html !!}             {{-- NOT escaped: only for trusted HTML --}}
            @{{ thisStaysLiteral }}              {{-- for Vue / Alpine templates --}}
            {{-- this is a Blade comment, not sent to the browser --}}
            `,
        },
        {
          title: 'Redirect with a flash message',
          code: c`
            // controller
            return redirect()->route('products.index')->with('success', 'Product saved.');
            return back()->with('error', 'Out of stock.');
            return back()->withInput();          // keep the form values (old())
            `,
        },
        {
          title: 'Show the flash message',
          lang: 'blade',
          code: c`
            @if (session('success'))
                <div class="alert alert-success">{{ session('success') }}</div>
            @endif

            @session('error')
                <div class="alert alert-danger">{{ $value }}</div>
            @endsession
            `,
        },
        {
          title: 'Share data with every view',
          code: c`
            // app/Providers/AppServiceProvider.php
            use Illuminate\Support\Facades\View;

            public function boot(): void
            {
                View::share('appName', config('app.name'));

                // only for specific views, computed when that view renders
                View::composer(['layouts.app', 'partials.nav'], function ($view) {
                    $view->with('categories', Category::orderBy('name')->get());
                });
            }
            `,
        },
        {
          title: 'Pass PHP data to JavaScript',
          lang: 'blade',
          code: c`
            <script>
                const product = @json($product);                       // object → JS object
                const updateUrl = @json(route('products.update', $product));
                const categories = {{ Js::from($categories) }};        // same idea, escaped for JS
            </script>

            {{-- or on an element, read later with jQuery: $('#cart').data('product-id') --}}
            <div id="cart" data-product-id="{{ $product->id }}" data-url="{{ route('cart.add') }}"></div>
            `,
        },
      ],
    },
    {
      id: 'blade',
      title: 'Blade templates & layouts',
      group: 'Blade & frontend',
      items: [
        {
          title: 'Control structures',
          lang: 'blade',
          code: c`
            @if ($product->stock > 10)
                In stock
            @elseif ($product->stock > 0)
                Only {{ $product->stock }} left
            @else
                Sold out
            @endif

            @unless ($user->isAdmin()) ... @endunless
            @isset($discount) {{ $discount }}% off @endisset
            @empty($cart) Your cart is empty @endempty
            @auth Hello, {{ auth()->user()->name }} @endauth
            @guest <a href="{{ route('login') }}">Log in</a> @endguest
            `,
        },
        {
          title: 'Loops and $loop',
          lang: 'blade',
          code: c`
            @foreach ($products as $product)
                <tr class="{{ $loop->even ? 'bg-gray' : '' }}">
                    <td>{{ $loop->iteration }}</td>       {{-- 1, 2, 3 … --}}
                    <td>{{ $product->name }}</td>
                </tr>
                @if ($loop->last) <tr><td>End of list</td></tr> @endif
            @endforeach

            @for ($i = 1; $i <= 5; $i++) ★ @endfor
            `,
          note: '$loop also has ->first, ->index (0-based), ->count, ->remaining and ->parent for nested loops.',
        },
        {
          title: 'Layout as a component (Laravel 10+ style)',
          lang: 'blade',
          code: c`
            {{-- resources/views/components/layout.blade.php --}}
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="csrf-token" content="{{ csrf_token() }}">
                <title>{{ $title ?? config('app.name') }}</title>
                @vite(['resources/css/app.css', 'resources/js/app.js'])
            </head>
            <body>
                @include('partials.nav')
                <main>{{ $slot }}</main>
                @stack('scripts')
            </body>
            </html>

            {{-- resources/views/products/index.blade.php --}}
            <x-layout>
                <x-slot:title>Products</x-slot>
                <h1>Products</h1>
            </x-layout>
            `,
        },
        {
          title: 'Classic layout (@extends / @section)',
          lang: 'blade',
          code: c`
            {{-- resources/views/layouts/app.blade.php --}}
            <html>
            <head><title>@yield('title', 'My App')</title></head>
            <body>
                @yield('content')
                @stack('scripts')
            </body>
            </html>

            {{-- resources/views/products/index.blade.php --}}
            @extends('layouts.app')

            @section('title', 'Products')

            @section('content')
                <h1>Products</h1>
            @endsection

            @push('scripts')
                <script>console.log('only on this page');</script>
            @endpush
            `,
        },
        {
          title: 'Partials with data',
          lang: 'blade',
          code: c`
            @include('products._card', ['product' => $product, 'showPrice' => true])
            @includeWhen($user->isAdmin(), 'products._admin-tools')
            @each('products._card', $products, 'product', 'products._empty')
            `,
          note: 'An included view sees all the parent\'s variables plus the ones you pass.',
        },
        {
          title: 'Reusable component with props',
          lang: 'blade',
          code: c`
            {{-- resources/views/components/alert.blade.php --}}
            @props(['type' => 'info', 'dismissible' => false])

            <div {{ $attributes->merge(['class' => 'alert alert-' . $type]) }}>
                {{ $slot }}
                @if ($dismissible) <button class="close">&times;</button> @endif
            </div>

            {{-- usage --}}
            <x-alert type="danger" dismissible class="mt-4">Payment failed.</x-alert>
            <x-alert :type="$status">{{ $message }}</x-alert>    {{-- : passes a PHP expression --}}
            `,
        },
        {
          title: 'Assets',
          lang: 'blade',
          code: c`
            @vite(['resources/css/app.css', 'resources/js/app.js'])   {{-- Vite bundles --}}
            <img src="{{ asset('images/logo.png') }}">                 {{-- public/images/logo.png --}}
            <img src="{{ Storage::url($product->image) }}">            {{-- storage:link uploads --}}
            `,
        },
      ],
    },
    {
      id: 'forms',
      title: 'Blade forms & validation errors',
      group: 'Blade & frontend',
      items: [
        {
          title: 'Create form',
          lang: 'blade',
          code: c`
            <form method="POST" action="{{ route('products.store') }}" enctype="multipart/form-data">
                @csrf

                <label>Name</label>
                <input name="name" value="{{ old('name') }}" class="@error('name') is-invalid @enderror">
                @error('name') <div class="error">{{ $message }}</div> @enderror

                <label>Category</label>
                <select name="category_id">
                    @foreach ($categories as $category)
                        <option value="{{ $category->id }}" @selected(old('category_id') == $category->id)>
                            {{ $category->name }}
                        </option>
                    @endforeach
                </select>

                <label><input type="checkbox" name="active" value="1" @checked(old('active', true))> Active</label>
                <input type="file" name="image" accept="image/*">

                <button type="submit">Save</button>
            </form>
            `,
          note: '@csrf is required on every POST/PUT/DELETE form, or Laravel answers 419 Page Expired.',
        },
        {
          title: 'Edit form (PUT) with current values',
          lang: 'blade',
          code: c`
            <form method="POST" action="{{ route('products.update', $product) }}">
                @csrf
                @method('PUT')
                <input name="name" value="{{ old('name', $product->name) }}">
                <input name="price" type="number" step="0.01" value="{{ old('price', $product->price) }}">
                <button>Update</button>
            </form>

            <form method="POST" action="{{ route('products.destroy', $product) }}" onsubmit="return confirm('Delete?')">
                @csrf
                @method('DELETE')
                <button>Delete</button>
            </form>
            `,
        },
        {
          title: 'Controller: create, store, edit, update, destroy',
          code: c`
            public function create()
            {
                return view('products.create', ['categories' => Category::all()]);
            }

            public function store(Request $request)
            {
                $data = $request->validate([
                    'name'        => ['required', 'string', 'max:255'],
                    'category_id' => ['required', 'exists:categories,id'],
                    'price'       => ['required', 'numeric', 'min:0'],
                    'image'       => ['nullable', 'image', 'max:2048'],
                ]);
                $data['active'] = $request->boolean('active');

                if ($request->hasFile('image')) {
                    $data['image'] = $request->file('image')->store('products', 'public');
                }

                Product::create($data);   // add these fields to $fillable on the model

                return redirect()->route('products.index')->with('success', 'Product created.');
            }

            public function edit(Product $product)
            {
                return view('products.edit', ['product' => $product, 'categories' => Category::all()]);
            }

            public function update(Request $request, Product $product)
            {
                $product->update($request->validate(['name' => 'required', 'price' => 'required|numeric']));
                return redirect()->route('products.show', $product)->with('success', 'Saved.');
            }

            public function destroy(Product $product)
            {
                $product->delete();
                return redirect()->route('products.index')->with('success', 'Deleted.');
            }
            `,
          note: 'When validation fails, Laravel redirects back automatically with $errors and old() input filled in.',
        },
        {
          title: 'List all validation errors',
          lang: 'blade',
          code: c`
            @if ($errors->any())
                <div class="alert alert-danger">
                    <ul>
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif
            `,
        },
      ],
    },
    {
      id: 'csrf',
      title: 'CSRF protection',
      group: 'Blade & frontend',
      items: [
        {
          title: 'What CSRF is and how Laravel stops it',
          lang: 'text',
          code: c`
            Attack: you are logged in to your-app.com. A malicious site makes your browser
                    submit <form action="https://your-app.com/transfer" method="POST">.
                    Your session cookie is sent automatically, so it would look like you.

            Laravel: every session gets a secret token. Every POST / PUT / PATCH / DELETE
                     to a web route must send it back (form field _token or a header).
                     Other sites cannot read the token, so their requests fail with 419.
            `,
          note: 'The check runs in the ValidateCsrfToken middleware (VerifyCsrfToken before Laravel 11) on all routes in routes/web.php. GET requests are not checked, so never change data in a GET route.',
        },
        {
          title: 'Forms: @csrf',
          lang: 'blade',
          code: c`
            <form method="POST" action="{{ route('profile.update') }}">
                @csrf
                {{-- renders: <input type="hidden" name="_token" value="..."> --}}
                <input name="name" value="{{ old('name', $user->name) }}">
                <button>Save</button>
            </form>

            {{-- the same, written by hand --}}
            <input type="hidden" name="_token" value="{{ csrf_token() }}">
            `,
        },
        {
          title: 'PUT / PATCH / DELETE forms',
          lang: 'blade',
          code: c`
            <form method="POST" action="{{ route('posts.destroy', $post) }}">
                @csrf
                @method('DELETE')
                <button onclick="return confirm('Delete?')">Delete</button>
            </form>
            `,
          note: 'HTML forms only send GET/POST, so @method adds a hidden _method field. @csrf is still required.',
        },
        {
          title: 'jQuery AJAX',
          lang: 'blade',
          code: c`
            {{-- layout <head> --}}
            <meta name="csrf-token" content="{{ csrf_token() }}">

            <script>
            $.ajaxSetup({
                headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }
            });

            $.post('/cart', { product_id: 42 });         // token sent automatically
            </script>
            `,
        },
        {
          title: 'fetch and axios',
          lang: 'js',
          code: c`
            // fetch: send the token from the meta tag
            await fetch('/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
              },
              body: JSON.stringify({ product_id: 42 }),
            })

            // axios: Laravel also sets an XSRF-TOKEN cookie, and axios copies it into the
            // X-XSRF-TOKEN header automatically for same-origin requests, so nothing to add
            import axios from 'axios'
            await axios.post('/cart', { product_id: 42 })
            `,
          note: 'Laravel\'s default resources/js/bootstrap.js already configures axios this way.',
        },
        {
          title: 'SPA on another domain/port (React, Vue) with Sanctum',
          lang: 'js',
          code: c`
            // .env (Laravel)
            // SANCTUM_STATEFUL_DOMAINS=localhost:5173,app.example.com
            // SESSION_DOMAIN=.example.com
            // config/cors.php: 'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'], 'supports_credentials' => true

            import axios from 'axios'

            const api = axios.create({
              baseURL: 'https://api.example.com',
              withCredentials: true,     // send the session cookie
              withXSRFToken: true,       // axios 1.6+: also send X-XSRF-TOKEN cross-origin
            })

            await api.get('/sanctum/csrf-cookie')                        // 1. get the CSRF cookie
            await api.post('/login', { email, password })                // 2. log in (session)
            const { data: user } = await api.get('/api/user')            // 3. authenticated requests
            `,
          note: 'The frontend and API must share a top-level domain (app.example.com + api.example.com) for cookies to work. Otherwise use Sanctum API tokens, which need no CSRF.',
        },
        {
          title: 'Exclude routes (webhooks)',
          code: c`
            // Laravel 11+: bootstrap/app.php
            ->withMiddleware(function (Middleware $middleware) {
                $middleware->validateCsrfTokens(except: [
                    'stripe/webhook',
                    'paypal/*',
                ]);
            })

            // Laravel 10: app/Http/Middleware/VerifyCsrfToken.php
            protected $except = ['stripe/webhook'];
            `,
          note: 'Third-party services cannot send your token. Verify their signature instead (e.g. Stripe-Signature header). Routes in routes/api.php are stateless and never CSRF-checked.',
        },
        {
          title: 'Fixing "419 Page Expired"',
          lang: 'text',
          code: c`
            Form has no @csrf                     → add @csrf (and @method for PUT/DELETE)
            AJAX without the header               → add the meta tag + X-CSRF-TOKEN / use axios
            Session expired (page open for hours) → reload the page; raise SESSION_LIFETIME in .env
            Session not saved                     → storage/framework/sessions not writable, or SESSION_DRIVER=database without the sessions table
            Wrong cookie domain                   → SESSION_DOMAIN / APP_URL do not match the site; clear config cache
            HTTPS behind a proxy                  → SESSION_SECURE_COOKIE=true only when the site is really on https
            `,
        },
        {
          title: 'Friendlier handling of expired tokens',
          code: c`
            // bootstrap/app.php (Laravel 11+)
            use Illuminate\Session\TokenMismatchException;

            ->withExceptions(function (Exceptions $exceptions) {
                $exceptions->render(function (TokenMismatchException $e, Request $request) {
                    if ($request->expectsJson()) {
                        return response()->json(['message' => 'Session expired, please refresh.'], 419);
                    }
                    return back()->withInput($request->except('password', '_token'))
                        ->with('error', 'Your session expired. Please submit the form again.');
                });
            })
            `,
        },
        {
          title: 'Rotate the token on login and logout',
          code: c`
            // after a successful login
            $request->session()->regenerate();

            // on logout
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            `,
          note: 'Breeze, Jetstream and the starter kits already do this. Do it yourself in custom auth controllers.',
        },
        {
          title: 'Tests',
          note: 'CSRF checks are skipped automatically while running tests, so feature tests can post to routes without a token.',
          then: [
            {
              label: 'Run the tests',
              lang: 'bash',
              code: c`
                php artisan test
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'ajax',
      title: 'jQuery & AJAX with Laravel',
      group: 'Blade & frontend',
      items: [
        {
          title: 'Add jQuery (CDN)',
          lang: 'blade',
          code: c`
            {{-- in your layout, before @stack('scripts') --}}
            <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
            @stack('scripts')
            `,
          note: 'Simplest option: page scripts pushed with @push(\'scripts\') can use $ right away.',
        },
        {
          title: 'Or add jQuery with npm + Vite',
          lang: 'js',
          code: c`
            // terminal: npm install jquery

            // resources/js/app.js
            import $ from 'jquery'
            window.$ = window.jQuery = $

            $(function () {
              // your jQuery code here (or import page modules)
            })
            `,
          note: 'Vite scripts are modules and run after inline <script> tags, so inline scripts cannot use $ with this setup. Put your jQuery code in app.js (or files it imports).',
        },
        {
          title: 'CSRF token for every AJAX request',
          lang: 'blade',
          code: c`
            {{-- in <head> --}}
            <meta name="csrf-token" content="{{ csrf_token() }}">

            <script>
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    'Accept': 'application/json'      // makes Laravel return JSON errors (422) instead of redirects
                }
            });
            </script>
            `,
          note: 'Without the token, POST / PUT / DELETE requests fail with 419.',
        },
        {
          title: 'Routes and JSON responses',
          code: c`
            // routes/web.php: web routes keep session login working for AJAX
            Route::get('/products/search', [ProductController::class, 'search'])->name('products.search');
            Route::resource('products', ProductController::class);

            // ProductController
            public function search(Request $request)
            {
                $products = Product::where('name', 'like', '%' . $request->input('q') . '%')
                    ->limit(20)->get(['id', 'name', 'price']);

                return response()->json(['data' => $products]);
            }

            public function store(Request $request)
            {
                $data = $request->validate(['name' => 'required|max:255', 'price' => 'required|numeric']);
                $product = Product::create($data);

                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Product saved.', 'product' => $product], 201);
                }
                return redirect()->route('products.index')->with('success', 'Product saved.');
            }
            `,
          note: 'expectsJson() lets one method serve both normal form posts and AJAX.',
        },
        {
          title: 'GET: load data and render it',
          lang: 'js',
          code: c`
            $.get('/products/search', { q: 'shirt' })
              .done(function (res) {
                const $list = $('#product-list').empty();
                $.each(res.data, function (i, p) {
                  $list.append($('<li>').text(p.name + ' — ₱' + p.price));   // .text() escapes HTML
                });
              })
              .fail(function (xhr) {
                alert('Could not load products (' + xhr.status + ')');
              });
            `,
        },
        {
          title: 'Live search with debounce',
          lang: 'js',
          code: c`
            let timer;
            $('#search').on('input', function () {
              clearTimeout(timer);
              const q = $(this).val();
              timer = setTimeout(function () {
                $.get('/products/search', { q: q }, function (res) {
                  $('#results').html(
                    res.data.map(function (p) { return $('<div>').text(p.name).prop('outerHTML'); }).join('')
                  );
                });
              }, 300);
            });
            `,
          note: 'Waits until the user stops typing for 300 ms before calling the server.',
        },
        {
          title: 'POST a form with AJAX + show validation errors',
          lang: 'js',
          code: c`
            // Blade: <form id="product-form" action="{{ route('products.store') }}"> ... 
            //        <input name="name"><span class="error" data-error-for="name"></span>
            $('#product-form').on('submit', function (e) {
              e.preventDefault();
              const $form = $(this);
              const $btn = $form.find('[type=submit]').prop('disabled', true);
              $form.find('.error').text('');

              $.ajax({
                url: $form.attr('action'),
                method: 'POST',
                data: $form.serialize(),          // includes the @csrf _token field too
              })
                .done(function (res) {
                  $('#flash').text(res.message).fadeIn();
                  $form.trigger('reset');
                  $('#product-list').prepend($('<li>').text(res.product.name));
                })
                .fail(function (xhr) {
                  if (xhr.status === 422) {                                // validation failed
                    $.each(xhr.responseJSON.errors, function (field, messages) {
                      $form.find('[data-error-for="' + field + '"]').text(messages[0]);
                    });
                  } else {
                    alert('Something went wrong (' + xhr.status + ')');
                  }
                })
                .always(function () {
                  $btn.prop('disabled', false);
                });
            });
            `,
        },
        {
          title: 'PUT and DELETE',
          lang: 'js',
          code: c`
            // Blade: <button class="btn-delete" data-id="{{ $product->id }}">Delete</button>
            $(document).on('click', '.btn-delete', function () {     // delegated: works for rows added later
              if (!confirm('Delete this product?')) return;
              const $row = $(this).closest('tr');

              $.ajax({ url: '/products/' + $(this).data('id'), method: 'DELETE' })
                .done(function () {
                  $row.fadeOut(200, function () { $(this).remove(); });
                });
            });

            $.ajax({
              url: '/products/' + productId,
              method: 'PUT',
              data: { name: 'New name', price: 199.5 },
            }).done(function (res) { console.log(res.message); });
            `,
          note: 'In the controller, return response()->json([...]) or response()->noContent() for these routes.',
        },
        {
          title: 'Upload a file with progress',
          lang: 'js',
          code: c`
            $('#image-form').on('submit', function (e) {
              e.preventDefault();
              const formData = new FormData(this);          // includes the file and _token
              // for update routes add: formData.append('_method', 'PUT');

              $.ajax({
                url: $(this).attr('action'),
                method: 'POST',
                data: formData,
                processData: false,                          // required for FormData
                contentType: false,                          // let the browser set the boundary
                xhr: function () {
                  const xhr = new XMLHttpRequest();
                  xhr.upload.addEventListener('progress', function (e) {
                    if (e.lengthComputable) $('#progress').val(Math.round(e.loaded / e.total * 100));
                  });
                  return xhr;
                },
              }).done(function (res) {
                $('#preview').attr('src', res.url);
              });
            });
            `,
          note: 'PHP cannot read files sent with a real PUT request, so send POST with _method=PUT.',
        },
        {
          title: 'Load a Blade partial (AJAX pagination / filters)',
          code: c`
            // controller
            public function index(Request $request)
            {
                $products = Product::filter($request->only('category', 'q'))->paginate(10);

                if ($request->ajax()) {
                    return view('products._table', compact('products'));   // just the table HTML
                }
                return view('products.index', compact('products'));
            }

            // resources/views/products/index.blade.php
            // <div id="table-wrap">@include('products._table')</div>

            // JavaScript
            $(document).on('click', '#table-wrap .pagination a', function (e) {
              e.preventDefault();
              $('#table-wrap').load($(this).attr('href'));
            });
            $('#category').on('change', function () {
              $('#table-wrap').load('/products?category=' + encodeURIComponent($(this).val()));
            });
            `,
          note: 'jQuery sends the X-Requested-With header, which is what $request->ajax() checks.',
        },
        {
          title: 'The same without jQuery (fetch)',
          lang: 'js',
          code: c`
            const res = await fetch('/products', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
              },
              body: JSON.stringify({ name: 'Shirt', price: 299 }),
            });
            const data = await res.json();
            if (res.status === 422) console.log(data.errors);
            `,
        },
      ],
    },
    {
      id: 'eloquent',
      title: 'Eloquent',
      group: 'Database & validation',
      items: [
        {
          title: 'Querying',
          code: c`
            Invoice::where('status', 'paid')
                ->whereDate('created_at', '>=', now()->subMonth())
                ->orderByDesc('total')
                ->paginate(20);
            `,
        },
        {
          title: 'Create & update',
          code: c`
            $invoice = Invoice::create($validated);
            $invoice->update(['status' => 'sent']);
            Invoice::updateOrCreate(['external_id' => $id], $data);
            `,
        },
        {
          title: 'Relationships',
          code: c`
            public function customer(): BelongsTo
            {
                return $this->belongsTo(Customer::class);
            }

            public function lines(): HasMany
            {
                return $this->hasMany(InvoiceLine::class);
            }
            `,
        },
        {
          title: 'Avoid N+1 queries',
          code: c`
            Invoice::with(['customer', 'lines'])->get();
            Invoice::withCount('lines')->get();
            `,
          note: 'Make Laravel throw an error on lazy loading during development, so N+1 problems show up immediately:',
          then: [
            {
              label: 'app/Providers/AppServiceProvider.php',
              lang: 'php',
              code: c`
                use Illuminate\Database\Eloquent\Model;

                public function boot(): void
                {
                    Model::preventLazyLoading(! app()->isProduction());
                }
                `,
            },
          ],
        },
        {
          title: 'Casts',
          code: c`
            protected function casts(): array
            {
                return [
                    'paid_at' => 'datetime',
                    'meta'    => 'array',
                    'status'  => InvoiceStatus::class,
                ];
            }
            `,
        },
        {
          title: 'Chunk large tables',
          code: c`
            Invoice::where('synced', false)->chunkById(500, function ($invoices) {
                foreach ($invoices as $invoice) {
                    SyncToXero::dispatch($invoice);
                }
            });
            `,
        },
      ],
    },
    {
      id: 'validation',
      title: 'Validation',
      group: 'Database & validation',
      items: [
        {
          title: 'Inline validation',
          code: c`
            $data = $request->validate([
                'email'  => ['required', 'email'],
                'amount' => ['required', 'numeric', 'min:1'],
            ]);
            `,
        },
        {
          title: 'Form request rules',
          code: c`
            public function rules(): array
            {
                return [
                    'customer_id' => ['required', 'exists:customers,id'],
                    'currency'    => ['required', Rule::in(['USD', 'MXN', 'ARS'])],
                ];
            }
            `,
        },
      ],
    },
    {
      id: 'auth',
      title: 'Auth with Sanctum',
      group: 'Auth & APIs',
      items: [
        {
          title: 'Install API scaffolding',
          lang: 'bash',
          code: 'php artisan install:api',
          note: 'Adds Sanctum, routes/api.php and the personal_access_tokens migration.',
        },
        {
          title: 'Issue a token',
          code: c`
            public function login(Request $request)
            {
                $credentials = $request->validate([
                    'email'    => ['required', 'email'],
                    'password' => ['required'],
                ]);

                if (! Auth::attempt($credentials)) {
                    return response()->json(['message' => 'Invalid credentials'], 401);
                }

                $token = $request->user()->createToken('api', ['invoices:read'])->plainTextToken;

                return ['token' => $token];
            }
            `,
        },
        {
          title: 'Protect routes',
          code: c`
            Route::middleware('auth:sanctum')->group(function () {
                Route::get('/me', fn (Request $r) => $r->user());
            });
            `,
        },
        {
          title: 'Check token abilities',
          code: c`
            if ($request->user()->tokenCan('invoices:write')) {
                // ...
            }
            `,
        },
        {
          title: 'Revoke tokens',
          code: c`
            $request->user()->currentAccessToken()->delete(); // logout this device
            $request->user()->tokens()->delete();             // all devices
            `,
        },
      ],
    },
    {
      id: 'policies',
      title: 'Authorization',
      group: 'Auth & APIs',
      items: [
        {
          title: 'Generate a policy',
          lang: 'bash',
          code: 'php artisan make:policy InvoicePolicy --model=Invoice',
        },
        {
          title: 'Policy method',
          code: c`
            public function update(User $user, Invoice $invoice): bool
            {
                return $user->id === $invoice->user_id;
            }
            `,
        },
        {
          title: 'Use it',
          code: c`
            Gate::authorize('update', $invoice);        // throws 403

            if ($request->user()->can('update', $invoice)) { /* ... */ }

            // Blade
            @can('update', $invoice) ... @endcan
            `,
        },
        {
          title: 'Simple gate',
          code: c`
            // AppServiceProvider::boot()
            Gate::define('view-reports', fn (User $user) => $user->is_admin);
            `,
        },
      ],
    },
    {
      id: 'resources',
      title: 'API resources',
      group: 'Auth & APIs',
      items: [
        {
          title: 'Generate',
          lang: 'bash',
          code: 'php artisan make:resource InvoiceResource',
        },
        {
          title: 'Shape the JSON',
          code: c`
            public function toArray(Request $request): array
            {
                return [
                    'id'       => $this->id,
                    'total'    => $this->total,
                    'status'   => $this->status,
                    'customer' => new CustomerResource($this->whenLoaded('customer')),
                    'paid_at'  => $this->paid_at?->toIso8601String(),
                ];
            }
            `,
        },
        {
          title: 'Return single & collection',
          code: c`
            return new InvoiceResource($invoice);
            return InvoiceResource::collection(Invoice::paginate(20));
            `,
          note: 'Paginated collections automatically include links and meta.',
        },
      ],
    },
    {
      id: 'events',
      title: 'Events & observers',
      group: 'Events, queues & caching',
      items: [
        {
          title: 'Event + listener',
          lang: 'bash',
          code: c`
            php artisan make:event PaymentReceived
            php artisan make:listener SendReceipt --event=PaymentReceived
            `,
        },
        {
          title: 'Dispatch',
          code: 'PaymentReceived::dispatch($payment);',
          note: 'Listeners are auto-discovered; implement ShouldQueue on a listener to run it on the queue.',
        },
        {
          title: 'Model observer',
          code: c`
            #[ObservedBy(InvoiceObserver::class)]
            class Invoice extends Model {}

            class InvoiceObserver
            {
                public function created(Invoice $invoice): void
                {
                    SyncToXero::dispatch($invoice);
                }
            }
            `,
        },
      ],
    },
    {
      id: 'queues',
      title: 'Queues & HTTP client',
      group: 'Events, queues & caching',
      items: [
        {
          title: 'Dispatch a job',
          code: c`
            SyncToXero::dispatch($invoice)->onQueue('integrations');
            SyncToXero::dispatch($invoice)->delay(now()->addMinutes(5));
            `,
        },
        {
          title: 'Retries & backoff',
          code: c`
            public $tries = 5;

            public function backoff(): array
            {
                return [10, 60, 300];
            }
            `,
        },
        {
          title: 'Run workers',
          lang: 'bash',
          code: c`
            php artisan queue:work --queue=integrations,default
            php artisan queue:failed
            php artisan queue:retry all
            `,
        },
        {
          title: 'HTTP client',
          code: c`
            $response = Http::withToken($token)
                ->timeout(15)
                ->retry(3, 200)
                ->post($url, $payload)
                ->throw();

            $data = $response->json();
            `,
        },
      ],
    },
    {
      id: 'cache',
      title: 'Cache & rate limiting',
      group: 'Events, queues & caching',
      items: [
        {
          title: 'Remember',
          code: c`
            $rates = Cache::remember('fx-rates', now()->addMinutes(30), function () {
                return Http::get($url)->json();
            });
            `,
        },
        {
          title: 'Read, write, forget',
          code: c`
            Cache::put('key', $value, 600);
            Cache::get('key', 'default');
            Cache::forget('key');
            `,
        },
        {
          title: 'Atomic lock',
          code: c`
            Cache::lock('sync-invoice-'.$id, 30)->block(5, function () use ($id) {
                // only one worker runs this at a time
            });
            `,
        },
        {
          title: 'Rate limiter',
          code: c`
            // AppServiceProvider::boot()
            RateLimiter::for('api', fn (Request $r) =>
                Limit::perMinute(60)->by($r->user()?->id ?: $r->ip())
            );

            Route::middleware('throttle:api')->group(/* ... */);
            `,
        },
      ],
    },
    {
      id: 'schedule',
      title: 'Scheduling & commands',
      group: 'Events, queues & caching',
      items: [
        {
          title: 'Define schedules',
          code: c`
            // routes/console.php
            Schedule::command('invoices:sync')->everyFifteenMinutes()->withoutOverlapping();
            Schedule::job(new PruneLogs)->dailyAt('02:00');
            `,
        },
        {
          title: 'Run the scheduler',
          lang: 'bash',
          code: c`
            # cron on the server
            * * * * * cd /var/www/app && php artisan schedule:run >> /dev/null 2>&1

            # locally
            php artisan schedule:work
            php artisan schedule:list
            `,
        },
        {
          title: 'Custom command',
          code: c`
            class SyncInvoices extends Command
            {
                protected $signature = 'invoices:sync {--since=}';

                public function handle(): int
                {
                    $this->info('Syncing...');
                    return self::SUCCESS;
                }
            }
            `,
        },
      ],
    },
    {
      id: 'container',
      title: 'Service container & DB',
      group: 'Architecture',
      items: [
        {
          title: 'Bind an interface',
          code: c`
            // AppServiceProvider::register()
            $this->app->bind(PaymentGateway::class, StripeGateway::class);
            $this->app->singleton(XeroClient::class, fn () => new XeroClient(config('services.xero')));
            `,
        },
        {
          title: 'Inject it',
          code: 'public function __construct(private PaymentGateway $gateway) {}',
        },
        {
          title: 'Transactions',
          code: c`
            DB::transaction(function () use ($order) {
                $order->update(['status' => 'paid']);
                $order->payments()->create([...]);
            }, attempts: 3);
            `,
        },
        {
          title: 'Pessimistic lock',
          code: c`
            DB::transaction(function () use ($id) {
                $wallet = Wallet::lockForUpdate()->find($id);
                $wallet->decrement('balance', 100);
            });
            `,
        },
        {
          title: 'Log queries while debugging',
          code: 'DB::listen(fn ($q) => logger($q->sql, $q->bindings));',
        },
      ],
    },
    {
      id: 'transform',
      title: 'Transforming',
      group: 'Collections & helpers',
      items: [
        {
          title: 'map, filter, reject',
          code: c`
            $names  = $users->map(fn ($u) => $u->name);
            $active = $users->filter(fn ($u) => $u->active);
            $others = $users->reject(fn ($u) => $u->is_admin);
            `,
        },
        {
          title: 'pluck & keyBy',
          code: c`
            $emails = $users->pluck('email');
            $byId   = $users->keyBy('id');
            $lookup = $users->pluck('name', 'id'); // [id => name]
            `,
        },
        {
          title: 'groupBy',
          code: c`
            $byStatus = $invoices->groupBy('status');
            $byMonth  = $invoices->groupBy(fn ($i) => $i->created_at->format('Y-m'));
            `,
        },
        {
          title: 'mapWithKeys',
          code: '$map = $rates->mapWithKeys(fn ($r) => [$r->code => $r->value]);',
        },
        {
          title: 'flatMap & flatten',
          code: '$lines = $orders->flatMap(fn ($o) => $o->lines);',
        },
      ],
    },
    {
      id: 'aggregate',
      title: 'Aggregating',
      group: 'Collections & helpers',
      items: [
        {
          title: 'Sums & averages',
          code: c`
            $invoices->sum('total');
            $invoices->avg('total');
            $invoices->max('total');
            $invoices->count();
            `,
        },
        {
          title: 'Totals per group',
          code: c`
            $revenue = $invoices
                ->groupBy('currency')
                ->map(fn ($group) => $group->sum('total'));
            `,
        },
        {
          title: 'Find items',
          code: c`
            $invoices->first(fn ($i) => $i->overdue);
            $invoices->firstWhere('status', 'draft');
            $invoices->contains('status', 'failed');
            `,
        },
      ],
    },
    {
      id: 'ordering',
      title: 'Ordering & slicing',
      group: 'Collections & helpers',
      items: [
        {
          title: 'Sort',
          code: c`
            $users->sortBy('name');
            $users->sortByDesc('created_at');
            $users->sortBy([['country', 'asc'], ['name', 'asc']]);
            `,
        },
        {
          title: 'Unique, chunk, take',
          code: c`
            $users->unique('email');
            $users->chunk(100);
            $users->take(5);
            $users->skip(10)->take(10);
            `,
        },
        {
          title: 'Partition',
          code: '[$paid, $unpaid] = $invoices->partition(fn ($i) => $i->paid_at !== null);',
        },
        {
          title: 'Lazy collections',
          code: c`
            Invoice::lazy()->each(function ($invoice) {
                // streams rows without loading all into memory
            });
            `,
        },
      ],
    },
    {
      id: 'strings',
      title: 'String helpers',
      group: 'Collections & helpers',
      items: [
        {
          title: 'Str methods',
          code: c`
            Str::slug('Hello World');        // hello-world
            Str::limit($text, 80);
            Str::uuid();
            Str::random(32);
            Str::mask('4111111111111111', '*', 0, -4);
            `,
        },
        {
          title: 'Fluent strings',
          code: "Str::of($ref)->after('INV-')->upper()->padLeft(6, '0');",
        },
        {
          title: 'Array helpers',
          code: c`
            Arr::get($payload, 'data.customer.email');
            Arr::only($input, ['name', 'email']);
            Arr::except($input, ['password']);
            data_get($payload, 'items.*.sku');
            `,
        },
      ],
    },
    {
      id: 'dates',
      title: 'Dates (Carbon)',
      group: 'Collections & helpers',
      items: [
        {
          title: 'Create & format',
          code: c`
            now();
            today();
            Carbon::parse('2026-10-17')->format('M d, Y');
            now()->toIso8601String();
            `,
        },
        {
          title: 'Arithmetic',
          code: c`
            now()->addDays(30);
            now()->subMonth()->startOfMonth();
            $due->diffInDays(now());
            $date->isPast();
            `,
        },
        {
          title: 'Timezones',
          code: c`
            now('America/Mexico_City');
            $date->setTimezone('Asia/Manila');
            `,
          note: 'Store in UTC, convert only for display.',
        },
      ],
    },
    {
      id: 'testing',
      title: 'Testing',
      group: 'Testing',
      items: [
        {
          title: 'Run tests',
          lang: 'bash',
          code: c`
            php artisan test
            php artisan test --filter=InvoiceTest
            `,
        },
        {
          title: 'Feature test',
          code: c`
            public function test_user_can_create_invoice(): void
            {
                $user = User::factory()->create();

                $this->actingAs($user)
                    ->postJson('/api/invoices', ['amount' => 100])
                    ->assertCreated();
            }
            `,
        },
        {
          title: 'Fake external calls',
          code: c`
            Http::fake(['api.xero.com/*' => Http::response(['ok' => true], 200)]);
            Queue::fake();
            Queue::assertPushed(SyncToXero::class);
            `,
        },
      ],
    },
  ],
}
