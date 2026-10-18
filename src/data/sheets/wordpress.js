import { c, BT } from './shared/code.js'

export default {
  slug: 'wordpress',
  title: 'WordPress',
  tech: 'WordPress',
  category: 'backend',
  minutes: 50,
  lang: 'php',
  description: 'WordPress 6.x for developers on PHP 8.3: local setup and WP-CLI, block and classic themes, theme.json, the Loop and WP_Query, plugins and hooks, custom post types and meta, the block editor (create-block, block.json, dynamic blocks), REST API and headless, security, $wpdb, caching and performance, LEMP hosting with Nginx, backups, migrations and troubleshooting.',
  sections: [
    // ───────────────────────── Setup ─────────────────────────
    {
      id: 'local-setup',
      title: 'Run WordPress locally',
      group: 'Setup',
      items: [
        {
          title: 'Pick a local setup',
          lang: 'text',
          code: c`
            LocalWP          desktop app, one click per site, Nginx/Apache + PHP + MySQL + Mailpit built in   → easiest
            wp-env           official @wordpress/env, Docker-based, config in .wp-env.json                   → plugin / block dev, CI
            Manual           PHP + MySQL on your machine + WP-CLI (wp server)                                → full control, no Docker
            Docker Compose   wordpress + mysql images                                                        → match production containers
            `,
          note: 'All of them give you a normal WordPress install, so everything else on this sheet works the same.',
        },
        {
          title: 'LocalWP (Local) app',
          lang: 'bash',
          code: c`
            # macOS
            brew install --cask local

            # Linux (Ubuntu / Debian): download the .deb from localwp.com, then
            sudo apt install ./local-*-linux.deb

            # Windows (PowerShell)
            winget install -e --id Flywheel.Local
            `,
          note: 'Open Local, click "+", pick PHP 8.3 and Nginx, and your site runs at http://my-site.local. Use "Open site shell" to get WP-CLI already pointed at the site.',
        },
        {
          title: 'wp-env (Docker): install',
          lang: 'bash',
          code: c`
            # 1. Docker + Node.js
            # macOS
            brew install --cask docker
            brew install node

            # Linux (Ubuntu / Debian): Docker Engine (docs.docker.com/engine/install/ubuntu), then
            sudo usermod -aG docker $USER      # log out and back in
            sudo apt install -y nodejs npm

            # Windows (PowerShell)
            winget install -e --id Docker.DockerDesktop
            winget install -e --id OpenJS.NodeJS.LTS

            # 2. wp-env — same on every OS
            npm install -g @wordpress/env
            `,
        },
        {
          title: 'wp-env: configure and start',
          lang: 'json',
          code: c`
            // .wp-env.json in your plugin or theme folder
            {
              "core": null,
              "phpVersion": "8.3",
              "plugins": ["."],
              "themes": [],
              "port": 8888,
              "config": {
                "WP_DEBUG": true,
                "WP_DEBUG_LOG": true,
                "SCRIPT_DEBUG": true
              }
            }
            `,
          note: '"core": null means the latest WordPress; "plugins": ["."] mounts the current folder as an active plugin. Start Docker Desktop first.',
          then: [
            {
              label: 'Then run (same on every OS)',
              lang: 'bash',
              code: c`
                wp-env start                        # http://localhost:8888  (admin / password)
                wp-env run cli wp plugin list       # WP-CLI inside the container
                wp-env logs                         # PHP / web server logs
                wp-env stop
                wp-env clean all                    # reset the database
                wp-env destroy                      # remove containers and data
                `,
            },
          ],
        },
        {
          title: 'Manual: PHP + MySQL',
          lang: 'bash',
          code: c`
            # macOS
            brew install php mysql
            brew services start mysql

            # Linux (Ubuntu / Debian)
            sudo apt install -y php-cli php-mysql php-curl php-xml php-mbstring php-zip php-gd php-intl mysql-server
            sudo systemctl enable --now mysql

            # Windows (PowerShell)
            winget install -e --id Oracle.MySQL
            # PHP: Laravel Herd for Windows, or the php.new one-liner (see the PHP sheet)

            # then install WP-CLI (next section) and follow "New site with WP-CLI"
            `,
        },
      ],
    },
    {
      id: 'wp-cli-install',
      title: 'Install WP-CLI',
      group: 'Setup',
      items: [
        {
          title: 'macOS and Linux',
          lang: 'bash',
          code: c`
            # macOS (Homebrew)
            brew install wp-cli

            # macOS / Linux (Ubuntu / Debian): official phar
            curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
            php wp-cli.phar --info
            chmod +x wp-cli.phar
            sudo mv wp-cli.phar /usr/local/bin/wp

            wp --info
            wp cli update          # phar installs only
            `,
        },
        {
          title: 'Windows (PowerShell)',
          lang: 'powershell',
          code: c`
            # needs PHP on PATH (php -v)
            New-Item -ItemType Directory -Force C:\wp-cli | Out-Null
            Invoke-WebRequest https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar -OutFile C:\wp-cli\wp-cli.phar
            Set-Content C:\wp-cli\wp.bat '@ECHO OFF', 'php "%~dp0wp-cli.phar" %*'
            [Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'User') + ';C:\wp-cli', 'User')

            # NEW terminal
            wp --info
            `,
          note: 'The wp.bat wrapper lets you type wp instead of php wp-cli.phar. Alternatively, run WordPress and WP-CLI inside WSL (Ubuntu) and follow the Linux steps.',
        },
        {
          title: 'Useful global flags',
          lang: 'bash',
          code: c`
            wp plugin list --path=/var/www/example.com     # run against another install
            wp option get home --url=https://shop.example.com   # pick a site in multisite
            wp plugin list --format=json                    # table, csv, json, yaml, count, ids
            wp help plugin install                          # docs for any command
            wp --allow-root ...                             # only if you must run as root
            `,
          note: 'Same on every OS. On servers, run WP-CLI as the web user (sudo -u www-data wp ...) so created files get the right owner.',
        },
      ],
    },
    {
      id: 'new-site',
      title: 'New site with WP-CLI, step by step',
      group: 'Setup',
      items: [
        {
          title: '1. Download core',
          lang: 'bash',
          code: c`
            mkdir my-site && cd my-site
            wp core download --locale=en_US        # same on every OS
            `,
        },
        {
          title: '2. Create wp-config.php and the database',
          lang: 'bash',
          code: c`
            wp config create --dbname=my_site --dbuser=root --dbpass=secret --dbhost=127.0.0.1 --dbprefix=ms_
            wp db create
            `,
          note: 'config create fetches fresh salts automatically. A non-default table prefix is a small hardening win and lets two sites share one database.',
        },
        {
          title: '3. Install and log in',
          lang: 'bash',
          code: c`
            wp core install --url=http://localhost:8080 --title="My Site" \
              --admin_user=admin --admin_email=you@example.com --prompt=admin_password
            wp server --port=8080                  # PHP built-in server → http://localhost:8080/wp-admin
            `,
          note: 'The backslash line break works in macOS / Linux shells. In PowerShell put the command on one line (or end lines with a backtick).',
        },
        {
          title: '4. Sensible first settings',
          lang: 'bash',
          code: c`
            wp rewrite structure '/%postname%/' --hard
            wp option update timezone_string 'Europe/Berlin'
            wp option update blog_public 0                     # discourage search engines on dev/staging
            wp plugin delete hello akismet
            wp theme delete twentytwentythree twentytwentyfour
            wp config set WP_DEBUG true --raw
            wp config set WP_ENVIRONMENT_TYPE local
            `,
        },
      ],
    },
    {
      id: 'wp-config',
      title: 'wp-config.php essentials',
      group: 'Setup',
      items: [
        {
          title: 'Debugging',
          code: c`
            // wp-config.php — above the line "That's all, stop editing!"
            define('WP_DEBUG', true);
            define('WP_DEBUG_LOG', true);          // writes to wp-content/debug.log (or a path string)
            define('WP_DEBUG_DISPLAY', false);     // never print errors into pages
            @ini_set('display_errors', '0');
            define('SCRIPT_DEBUG', true);          // load unminified core JS/CSS
            define('SAVEQUERIES', false);          // true only while profiling
            `,
          note: 'In production keep WP_DEBUG false, or true with WP_DEBUG_LOG pointing outside the web root, e.g. /var/log/wordpress/debug.log.',
        },
        {
          title: 'Environment and security constants',
          code: c`
            define('WP_ENVIRONMENT_TYPE', 'production');   // local | development | staging | production
            define('DISALLOW_FILE_EDIT', true);            // no theme/plugin editor in wp-admin
            define('DISALLOW_FILE_MODS', true);            // also no installs/updates from wp-admin (deploy via Git/WP-CLI)
            define('FORCE_SSL_ADMIN', true);
            define('WP_AUTO_UPDATE_CORE', 'minor');        // security releases only
            define('WP_POST_REVISIONS', 10);
            define('WP_MEMORY_LIMIT', '256M');
            define('WP_MAX_MEMORY_LIMIT', '512M');          // admin / image processing
            define('AUTOSAVE_INTERVAL', 120);
            `,
          note: 'Read the environment in code with wp_get_environment_type(), e.g. to disable outgoing email or analytics outside production.',
        },
        {
          title: 'Salts and table prefix',
          lang: 'bash',
          code: c`
            curl -s https://api.wordpress.org/secret-key/1.1/salt/   # paste the 8 define() lines into wp-config.php
            wp config shuffle-salts                                  # or regenerate in place (logs everyone out)
            `,
          then: [
            {
              label: 'wp-config.php',
              lang: 'php',
              code: c`
                $table_prefix = 'ms_';   // letters, numbers, underscore; set BEFORE installing
                `,
            },
          ],
        },
        {
          title: 'Behind a load balancer or proxy (HTTPS)',
          code: c`
            if (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') {
                $_SERVER['HTTPS'] = 'on';
            }
            define('WP_HOME', 'https://example.com');
            define('WP_SITEURL', 'https://example.com');
            `,
          note: 'Without this, WordPress behind Cloudflare, an AWS ALB or a reverse proxy thinks it is on HTTP and redirects forever.',
        },
        {
          title: 'Folder structure',
          lang: 'text',
          code: c`
            my-site/
              wp-admin/  wp-includes/      # core — never edit, replaced on update
              wp-config.php                # credentials + constants (can live one level up)
              wp-content/
                themes/my-theme/           # your theme
                plugins/acme-events/       # your plugins
                mu-plugins/                # "must use": always loaded, no activation, single .php files
                uploads/2026/10/           # media library (writable by PHP)
                languages/  upgrade/  cache/
                debug.log                  # when WP_DEBUG_LOG is on
            `,
          note: 'Only wp-content (and wp-config.php) is yours. Commit your theme and plugins to Git, never core or uploads.',
        },
      ],
    },

    // ───────────────────────── Themes ─────────────────────────
    {
      id: 'block-theme',
      title: 'Block themes vs classic themes',
      group: 'Themes',
      items: [
        {
          title: 'Which kind?',
          lang: 'text',
          code: c`
            Block theme     HTML templates made of blocks + theme.json; edited in Appearance → Editor (Site Editor)
                            → default for new sites since 6.x, e.g. Twenty Twenty-Five
            Classic theme   PHP templates (header.php, single.php …) + the Customizer
                            → still fully supported; easier for heavy custom PHP logic
            Hybrid          classic theme that opts into theme.json and block template parts
            `,
        },
        {
          title: 'Minimal block theme',
          lang: 'text',
          code: c`
            wp-content/themes/my-theme/
              style.css              # theme header (required)
              theme.json             # settings + styles
              functions.php          # optional: enqueue, supports, patterns
              templates/index.html   # required fallback template
              templates/single.html  templates/page.html  templates/404.html
              parts/header.html  parts/footer.html
              patterns/              # PHP pattern files, auto-registered
              screenshot.png         # 1200×900
            `,
        },
        {
          title: 'style.css header',
          lang: 'css',
          code: c`
            /*
            Theme Name:        My Theme
            Theme URI:         https://example.com/my-theme
            Author:            Acme
            Description:       A lean block theme.
            Requires at least: 6.6
            Tested up to:      6.8
            Requires PHP:      8.1
            Version:           1.0.0
            License:           GPL-2.0-or-later
            Text Domain:       my-theme
            */
            `,
        },
        {
          title: 'templates/index.html and parts/header.html',
          lang: 'html',
          code: c`
            <!-- templates/index.html -->
            <!-- wp:template-part {"slug":"header","tagName":"header"} /-->

            <!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
            <main class="wp-block-group">
              <!-- wp:query {"queryId":1,"query":{"inherit":true}} -->
              <div class="wp-block-query">
                <!-- wp:post-template -->
                  <!-- wp:post-title {"isLink":true} /-->
                  <!-- wp:post-excerpt /-->
                <!-- /wp:post-template -->
                <!-- wp:query-pagination -->
                  <!-- wp:query-pagination-previous /-->
                  <!-- wp:query-pagination-next /-->
                <!-- /wp:query-pagination -->
              </div>
              <!-- /wp:query -->
            </main>
            <!-- /wp:group -->

            <!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
            `,
          then: [
            {
              label: 'parts/header.html',
              lang: 'html',
              code: c`
                <!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between"}} -->
                <div class="wp-block-group">
                  <!-- wp:site-title /-->
                  <!-- wp:navigation /-->
                </div>
                <!-- /wp:group -->
                `,
            },
          ],
          note: 'Easiest workflow: build templates visually in the Site Editor, then export them into your theme files with the Create Block Theme plugin.',
        },
        {
          title: 'Classic theme essentials',
          code: c`
            <!-- header.php -->
            <!doctype html>
            <html <?php language_attributes(); ?>>
            <head>
                <meta charset="<?php bloginfo('charset'); ?>">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <?php wp_head(); ?>
            </head>
            <body <?php body_class(); ?>>
            <?php wp_body_open(); ?>
            <?php wp_nav_menu(['theme_location' => 'primary', 'container' => 'nav']); ?>

            <!-- footer.php -->
            <?php wp_footer(); ?>
            </body>
            </html>
            `,
          note: 'wp_head() and wp_footer() are mandatory: plugins and enqueued scripts hook into them. Templates include these with get_header() and get_footer().',
        },
      ],
    },
    {
      id: 'theme-json',
      title: 'theme.json',
      group: 'Themes',
      items: [
        {
          title: 'Settings: palette, fonts, layout',
          lang: 'json',
          code: c`
            {
              "$schema": "https://schemas.wp.org/trunk/theme.json",
              "version": 3,
              "settings": {
                "appearanceTools": true,
                "color": {
                  "defaultPalette": false,
                  "palette": [
                    { "slug": "base", "name": "Base", "color": "#ffffff" },
                    { "slug": "contrast", "name": "Contrast", "color": "#111111" },
                    { "slug": "accent", "name": "Accent", "color": "#2f6fed" }
                  ]
                },
                "typography": {
                  "fluid": true,
                  "fontFamilies": [
                    { "slug": "body", "name": "Body", "fontFamily": "system-ui, sans-serif" }
                  ],
                  "fontSizes": [
                    { "slug": "small", "name": "Small", "size": "0.875rem" },
                    { "slug": "large", "name": "Large", "size": "1.5rem", "fluid": { "min": "1.25rem", "max": "1.75rem" } }
                  ]
                },
                "layout": { "contentSize": "720px", "wideSize": "1200px" },
                "spacing": { "units": ["px", "rem", "%", "vw"] }
              }
            }
            `,
          note: 'Every preset becomes a CSS variable, e.g. var(--wp--preset--color--accent) and var(--wp--preset--font-size--large), and appears in the editor UI.',
        },
        {
          title: 'Styles: global and per block',
          lang: 'json',
          code: c`
            {
              "styles": {
                "color": { "background": "var:preset|color|base", "text": "var:preset|color|contrast" },
                "typography": { "fontFamily": "var:preset|font-family|body", "lineHeight": "1.6" },
                "elements": {
                  "link": { "color": { "text": "var:preset|color|accent" } },
                  "h1": { "typography": { "fontSize": "2.5rem" } }
                },
                "blocks": {
                  "core/button": { "border": { "radius": "999px" } }
                }
              }
            }
            `,
          note: 'Prefer theme.json over hand-written CSS: users can then override the same values in the Site Editor (Styles panel).',
        },
        {
          title: 'Lock down the editor',
          lang: 'json',
          code: c`
            {
              "settings": {
                "color": { "custom": false, "customGradient": false },
                "typography": { "customFontSize": false },
                "blocks": {
                  "core/paragraph": { "color": { "palette": [] } }
                }
              }
            }
            `,
          note: 'Useful for client sites: editors can only pick brand colours and sizes.',
        },
      ],
    },
    {
      id: 'child-theme-hierarchy',
      title: 'Child themes & template hierarchy',
      group: 'Themes',
      items: [
        {
          title: 'Child theme',
          lang: 'css',
          code: c`
            /* wp-content/themes/my-child/style.css */
            /*
            Theme Name: My Child
            Template:   twentytwentyfive
            Version:    1.0.0
            */
            `,
          note: 'Template must be the parent folder name. Any file in the child (templates, parts, PHP templates, theme.json) overrides the parent; theme.json values are merged.',
          then: [
            {
              label: 'functions.php (classic parent: load both stylesheets)',
              lang: 'php',
              code: c`
                <?php
                add_action('wp_enqueue_scripts', function () {
                    wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css', [], wp_get_theme('twentytwentyfive')->get('Version'));
                    wp_enqueue_style('child-style', get_stylesheet_uri(), ['parent-style'], wp_get_theme()->get('Version'));
                });
                `,
            },
            {
              label: 'Or scaffold it (same on every OS)',
              lang: 'bash',
              code: c`
                wp scaffold child-theme my-child --parent_theme=twentytwentyfive --activate
                `,
            },
          ],
        },
        {
          title: 'Template hierarchy (first match wins)',
          lang: 'text',
          code: c`
            Front page      front-page → home (if posts) / page template → index
            Blog index      home → index
            Single post     single-{post_type}-{slug} → single-{post_type} → single → singular → index
            Page            custom template → page-{slug} → page-{id} → page → singular → index
            Category        category-{slug} → category-{id} → category → archive → index
            Custom tax      taxonomy-{tax}-{term} → taxonomy-{tax} → taxonomy → archive → index
            CPT archive     archive-{post_type} → archive → index
            Author / date   author-{nicename} → author → archive  |  date → archive
            Search          search → index
            404             404 → index
            Attachment      {mime}-{subtype} → attachment → single → index
            `,
          note: 'Block themes use the same names as .html files in templates/; classic themes use .php files in the theme root. Query Monitor shows which template was used.',
        },
        {
          title: 'Custom page template',
          code: c`
            <?php
            /**
             * Template Name: Landing page
             * Template Post Type: page, post
             */
            get_header();
            // ...
            get_footer();
            `,
          note: 'Block themes register custom templates in theme.json under "customTemplates" instead.',
        },
      ],
    },
    {
      id: 'functions-php',
      title: 'functions.php: supports, menus, assets',
      group: 'Themes',
      items: [
        {
          title: 'Theme supports, menus, image sizes',
          code: c`
            <?php
            add_action('after_setup_theme', function () {
                load_theme_textdomain('my-theme', get_template_directory() . '/languages');
                add_theme_support('title-tag');
                add_theme_support('post-thumbnails');
                add_theme_support('responsive-embeds');
                add_theme_support('html5', ['search-form', 'comment-form', 'gallery', 'caption', 'style', 'script']);
                add_theme_support('editor-styles');
                add_editor_style('assets/editor.css');

                register_nav_menus([
                    'primary' => __('Primary menu', 'my-theme'),
                    'footer'  => __('Footer menu', 'my-theme'),
                ]);

                add_image_size('card', 600, 400, true);     // hard crop
                add_image_size('hero', 1920, 0);            // width only
            });
            `,
          note: 'New image sizes apply to new uploads only. Regenerate old ones with WP-CLI:',
          then: [
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                wp media regenerate --only-missing --yes
                `,
            },
          ],
        },
        {
          title: 'Enqueue scripts and styles properly',
          code: c`
            <?php
            add_action('wp_enqueue_scripts', function () {
                $ver = wp_get_theme()->get('Version');

                wp_enqueue_style('my-theme', get_stylesheet_uri(), [], $ver);
                wp_enqueue_style('my-theme-main', get_theme_file_uri('assets/main.css'), ['my-theme'], $ver);

                wp_enqueue_script(
                    'my-theme-app',
                    get_theme_file_uri('assets/app.js'),
                    ['wp-dom-ready'],                                   // dependencies
                    $ver,                                               // cache-busting ?ver=
                    ['strategy' => 'defer', 'in_footer' => true]        // WP 6.3+
                );

                wp_add_inline_script('my-theme-app', 'window.MyTheme = ' . wp_json_encode([
                    'restUrl' => esc_url_raw(rest_url('acme/v1/')),
                    'nonce'   => wp_create_nonce('wp_rest'),
                ]) . ';', 'before');

                if (is_singular() && comments_open()) {
                    wp_enqueue_script('comment-reply');
                }
            });
            `,
          note: 'Never print script or link tags by hand: enqueueing lets WordPress de-duplicate, order dependencies and let caching plugins combine files. Admin pages use the admin_enqueue_scripts hook.',
        },
        {
          title: 'jQuery: depend on it, never hardcode it',
          code: c`
            // ✅ use the bundled copy as a dependency
            wp_enqueue_script('my-slider', get_theme_file_uri('assets/slider.js'), ['jquery'], '1.0', true);

            // ❌ don't deregister core jQuery or load it from a CDN
            // wp_deregister_script('jquery');
            `,
          then: [
            {
              label: 'assets/slider.js (no-conflict wrapper)',
              lang: 'js',
              code: c`
                jQuery(function ($) {
                  $('.slider').addClass('is-ready')
                })
                `,
            },
          ],
          note: 'WordPress loads jQuery in no-conflict mode, so $ is not global; the wrapper gives it to you. New code rarely needs jQuery at all.',
        },
      ],
    },

    // ───────────────────────── The Loop & queries ─────────────────────────
    {
      id: 'the-loop',
      title: 'The Loop & template tags',
      group: 'The Loop & queries',
      items: [
        {
          title: 'The Loop',
          code: c`
            <?php if (have_posts()) : ?>
                <?php while (have_posts()) : the_post(); ?>
                    <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                        <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                        <?php the_post_thumbnail('card'); ?>
                        <?php the_excerpt(); ?>
                    </article>
                <?php endwhile; ?>
                <?php the_posts_pagination(); ?>
            <?php else : ?>
                <p><?php esc_html_e('Nothing found.', 'my-theme'); ?></p>
            <?php endif; ?>
            `,
          note: 'the_post() sets up the global $post so template tags know which post they are about.',
        },
        {
          title: 'the_* echoes, get_the_* returns',
          code: c`
            <h2><?php echo esc_html(get_the_title()); ?></h2>
            <a href="<?php echo esc_url(get_permalink()); ?>">Read more</a>
            <?php echo get_the_post_thumbnail(null, 'large', ['class' => 'hero']); ?>
            <time datetime="<?php echo esc_attr(get_the_date('c')); ?>"><?php echo esc_html(get_the_date()); ?></time>
            <span><?php echo esc_html(get_the_author()); ?></span>
            <?php the_terms(get_the_ID(), 'category', '', ', '); ?>
            <?php echo esc_html(get_post_meta(get_the_ID(), 'event_date', true)); ?>
            `,
          note: 'Use get_the_* when you need the value in PHP or want to escape it yourself; the_* functions already apply filters and print.',
        },
        {
          title: 'Conditional tags',
          code: c`
            is_front_page()   is_home()          // static front page vs blog index
            is_single()       is_page('about')   is_singular('event')
            is_archive()      is_category('news')  is_tax('event_type')  is_post_type_archive('event')
            is_search()       is_404()           is_user_logged_in()  is_admin()
            `,
          note: 'Conditional tags only work after the query has run (from the wp hook on), not in plugin bootstrap code.',
        },
      ],
    },
    {
      id: 'wp-query',
      title: 'WP_Query, get_posts & pre_get_posts',
      group: 'The Loop & queries',
      items: [
        {
          title: 'Custom query with WP_Query',
          code: c`
            <?php
            $paged = max(1, (int) get_query_var('paged'));

            $events = new WP_Query([
                'post_type'      => 'event',
                'post_status'    => 'publish',
                'posts_per_page' => 10,
                'paged'          => $paged,
                'meta_key'       => 'event_date',
                'orderby'        => 'meta_value',
                'order'          => 'ASC',
                'tax_query'      => [[
                    'taxonomy' => 'event_type',
                    'field'    => 'slug',
                    'terms'    => ['workshop', 'talk'],
                ]],
                'meta_query'     => [[
                    'key'     => 'event_date',
                    'value'   => current_time('Y-m-d'),
                    'compare' => '>=',
                    'type'    => 'DATE',
                ]],
            ]);

            while ($events->have_posts()) {
                $events->the_post();
                the_title('<h3>', '</h3>');
            }
            wp_reset_postdata();   // restore the main query's $post
            `,
          note: "Always call wp_reset_postdata() after a secondary loop. Add 'no_found_rows' => true when you don't paginate: it skips the expensive row count.",
        },
        {
          title: 'Pagination with paginate_links',
          code: c`
            <?php
            echo paginate_links([
                'total'     => $events->max_num_pages,
                'current'   => $paged,
                'prev_text' => __('« Previous', 'my-theme'),
                'next_text' => __('Next »', 'my-theme'),
            ]);
            `,
          note: "On a static front page the page number is in get_query_var('page'), not 'paged'.",
        },
        {
          title: 'get_posts: simple array, no Loop',
          code: c`
            <?php
            $latest = get_posts([
                'post_type'   => 'post',
                'numberposts' => 5,
                'category_name' => 'news',
            ]);

            foreach ($latest as $p) {
                printf('<a href="%s">%s</a>', esc_url(get_permalink($p)), esc_html(get_the_title($p)));
            }
            `,
          note: 'get_posts sets no_found_rows and ignores sticky posts for you. Pass the post object to template functions instead of calling setup_postdata.',
        },
        {
          title: 'Change the main query with pre_get_posts',
          code: c`
            <?php
            add_action('pre_get_posts', function (WP_Query $query) {
                if (is_admin() || !$query->is_main_query()) {
                    return;
                }
                if ($query->is_post_type_archive('event')) {
                    $query->set('posts_per_page', 12);
                    $query->set('meta_key', 'event_date');
                    $query->set('orderby', 'meta_value');
                    $query->set('order', 'ASC');
                }
                if ($query->is_search()) {
                    $query->set('post_type', ['post', 'page', 'event']);
                }
            });
            `,
          note: 'Never replace the main query with query_posts() or a new WP_Query in archive templates: it breaks pagination and doubles the queries. Modify it here instead.',
        },
      ],
    },

    // ───────────────────────── Plugins ─────────────────────────
    {
      id: 'plugin-basics',
      title: 'Plugin structure & lifecycle',
      group: 'Plugins',
      items: [
        {
          title: 'Main plugin file',
          code: c`
            <?php
            /**
             * Plugin Name:       Acme Events
             * Plugin URI:        https://example.com/acme-events
             * Description:       Events post type, block and REST endpoints.
             * Version:           1.0.0
             * Requires at least: 6.6
             * Requires PHP:      8.1
             * Author:            Acme
             * License:           GPL-2.0-or-later
             * Text Domain:       acme-events
             */

            defined('ABSPATH') || exit;   // block direct access

            define('ACME_EVENTS_VERSION', '1.0.0');
            define('ACME_EVENTS_FILE', __FILE__);
            define('ACME_EVENTS_DIR', plugin_dir_path(__FILE__));
            define('ACME_EVENTS_URL', plugin_dir_url(__FILE__));

            require_once ACME_EVENTS_DIR . 'vendor/autoload.php';   // if you use Composer
            require_once ACME_EVENTS_DIR . 'includes/post-types.php';
            require_once ACME_EVENTS_DIR . 'includes/rest.php';
            `,
          note: 'Prefix everything (functions, options, hooks, CSS classes) or use a PHP namespace: all plugins share one global space.',
        },
        {
          title: 'Folder layout',
          lang: 'text',
          code: c`
            wp-content/plugins/acme-events/
              acme-events.php        # header + bootstrap
              uninstall.php          # cleanup when deleted
              includes/              # PHP (or src/ with PSR-4 namespaces)
              blocks/  build/        # block source and compiled output
              assets/  languages/
              composer.json  package.json  readme.txt
            `,
          then: [
            {
              label: 'Or scaffold it (same on every OS)',
              lang: 'bash',
              code: c`
                wp scaffold plugin acme-events --plugin_name="Acme Events" --activate
                `,
            },
          ],
        },
        {
          title: 'Activation and deactivation hooks',
          code: c`
            <?php
            register_activation_hook(__FILE__, function () {
                acme_register_post_types();     // register first …
                flush_rewrite_rules();          // … then rebuild permalinks once
                acme_install_tables();
                if (!wp_next_scheduled('acme_daily_sync')) {
                    wp_schedule_event(time(), 'daily', 'acme_daily_sync');
                }
            });

            register_deactivation_hook(__FILE__, function () {
                wp_clear_scheduled_hook('acme_daily_sync');
                flush_rewrite_rules();
            });
            `,
          note: 'These must be registered from the main plugin file. Never call flush_rewrite_rules() on every request: it is slow.',
        },
        {
          title: 'uninstall.php',
          code: c`
            <?php
            // runs when the plugin is DELETED in wp-admin (not on deactivate)
            defined('WP_UNINSTALL_PLUGIN') || exit;

            delete_option('acme_events_options');
            delete_option('acme_db_version');

            global $wpdb;
            $wpdb->query('DROP TABLE IF EXISTS ' . $wpdb->prefix . 'acme_bookings');
            `,
          note: 'Remove only data your plugin created. Consider an "erase data on uninstall" setting so users do not lose content by accident.',
        },
      ],
    },
    {
      id: 'hooks',
      title: 'Hooks: actions & filters',
      group: 'Plugins',
      items: [
        {
          title: 'add_action and add_filter',
          code: c`
            <?php
            // action: do something at a point in time
            add_action('init', 'acme_register_post_types');

            // filter: receive a value, return it (changed or not)
            add_filter('the_content', function (string $content): string {
                if (!is_singular('post') || !in_the_loop() || !is_main_query()) {
                    return $content;
                }
                return $content . '<p class="cta">' . esc_html__('Enjoyed this? Subscribe!', 'acme') . '</p>';
            }, 20);   // priority: lower runs earlier, default 10

            // accepted args: the 4th parameter says how many arguments you want
            add_action('save_post_event', function (int $post_id, WP_Post $post, bool $update) {
                // ...
            }, 10, 3);
            `,
          note: 'A filter must always return a value; forgetting the return blanks the content.',
        },
        {
          title: 'Create your own hooks',
          code: c`
            <?php
            // in your plugin: let others extend it
            $per_page = apply_filters('acme_events_per_page', 10, $context);
            do_action('acme_events_before_list', $events);

            // in a theme or another plugin
            add_filter('acme_events_per_page', fn(int $n) => 20);
            add_action('acme_events_before_list', fn(array $events) => print('<p>' . count($events) . ' events</p>'));
            `,
        },
        {
          title: 'Remove a hook',
          code: c`
            <?php
            remove_action('wp_head', 'wp_generator');                            // same priority as added
            remove_filter('the_content', 'wpautop');
            remove_action('init', [Some_Plugin::instance(), 'register'], 20);    // object methods need the instance

            has_action('init', 'acme_register_post_types');                      // false or priority
            did_action('init');                                                  // how many times it ran
            `,
          note: 'Closures cannot be removed by others, so use named functions or static methods for hooks people may want to unhook.',
        },
        {
          title: 'Common hooks, in load order',
          lang: 'text',
          code: c`
            plugins_loaded        all plugins loaded → bootstrap, load text domain
            after_setup_theme     theme supports, menus, image sizes
            init                  register post types, taxonomies, blocks, shortcodes
            admin_menu            add admin pages
            admin_init            Settings API, admin-only logic
            rest_api_init         register_rest_route
            wp_enqueue_scripts    front-end CSS/JS   (admin_enqueue_scripts / enqueue_block_editor_assets)
            pre_get_posts         change the main query
            template_redirect     redirects / access checks before output
            wp_head / wp_footer   output in <head> / before </body>
            save_post(_{type})    after a post is saved
            the_content           filter post content
            wp_mail               filter outgoing email args
            `,
        },
      ],
    },
    {
      id: 'cpt',
      title: 'Custom post types, taxonomies & meta',
      group: 'Plugins',
      items: [
        {
          title: 'register_post_type',
          code: c`
            <?php
            function acme_register_post_types(): void {
                register_post_type('event', [
                    'labels'       => [
                        'name'          => __('Events', 'acme-events'),
                        'singular_name' => __('Event', 'acme-events'),
                        'add_new_item'  => __('Add new event', 'acme-events'),
                    ],
                    'public'       => true,
                    'has_archive'  => true,                      // /events/
                    'show_in_rest' => true,                      // REQUIRED for the block editor + REST API
                    'menu_icon'    => 'dashicons-calendar-alt',
                    'supports'     => ['title', 'editor', 'thumbnail', 'excerpt', 'revisions', 'custom-fields'],
                    'rewrite'      => ['slug' => 'events', 'with_front' => false],
                    'template'     => [['core/paragraph', ['placeholder' => 'Describe the event…']]],
                ]);
            }
            add_action('init', 'acme_register_post_types');
            `,
          note: 'Post type keys: max 20 characters, lowercase, no spaces. After adding or changing rewrite slugs, flush permalinks once (activation hook, wp rewrite flush, or Settings → Permalinks → Save).',
        },
        {
          title: 'register_taxonomy',
          code: c`
            <?php
            add_action('init', function () {
                register_taxonomy('event_type', ['event'], [
                    'labels'            => ['name' => __('Event types', 'acme-events'), 'singular_name' => __('Event type', 'acme-events')],
                    'hierarchical'      => true,       // true = like categories, false = like tags
                    'show_in_rest'      => true,
                    'show_admin_column' => true,
                    'rewrite'           => ['slug' => 'event-type'],
                ]);
            });

            wp_set_object_terms($post_id, ['workshop'], 'event_type');
            $terms = get_the_terms($post_id, 'event_type');   // WP_Term[] | false | WP_Error
            `,
        },
        {
          title: 'Post meta: register, read, write',
          code: c`
            <?php
            add_action('init', function () {
                register_post_meta('event', 'event_date', [
                    'type'              => 'string',
                    'single'            => true,
                    'show_in_rest'      => true,     // editable from blocks / REST
                    'sanitize_callback' => 'sanitize_text_field',
                    'auth_callback'     => fn() => current_user_can('edit_posts'),
                ]);
            });

            update_post_meta($post_id, 'event_date', '2026-11-05');
            $date = get_post_meta($post_id, 'event_date', true);    // true = single value, not array
            delete_post_meta($post_id, 'event_date');
            `,
          note: "Meta exposed to REST needs 'custom-fields' in the post type's supports. Prefix keys with _ (e.g. _acme_secret) to hide them from the Custom Fields panel.",
        },
      ],
    },
    {
      id: 'admin-ui',
      title: 'Admin: meta boxes & Settings API',
      group: 'Plugins',
      items: [
        {
          title: 'Meta box with a nonce',
          code: c`
            <?php
            add_action('add_meta_boxes', function () {
                add_meta_box('acme_event_details', __('Event details', 'acme-events'), 'acme_event_box', 'event', 'side');
            });

            function acme_event_box(WP_Post $post): void {
                wp_nonce_field('acme_save_event', 'acme_event_nonce');
                $date = get_post_meta($post->ID, 'event_date', true);
                echo '<label for="acme-event-date">' . esc_html__('Date', 'acme-events') . '</label>';
                echo '<input type="date" id="acme-event-date" name="acme_event_date" value="' . esc_attr($date) . '">';
            }

            add_action('save_post_event', function (int $post_id): void {
                $nonce = sanitize_text_field(wp_unslash($_POST['acme_event_nonce'] ?? ''));
                if (!wp_verify_nonce($nonce, 'acme_save_event')) return;
                if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
                if (!current_user_can('edit_post', $post_id)) return;

                if (isset($_POST['acme_event_date'])) {
                    update_post_meta($post_id, 'event_date', sanitize_text_field(wp_unslash($_POST['acme_event_date'])));
                }
            });
            `,
          note: 'Classic meta boxes still work in the block editor. For a native look, register the meta with show_in_rest and edit it from a block or sidebar panel instead.',
        },
        {
          title: 'Settings page with the Settings API',
          code: c`
            <?php
            add_action('admin_menu', function () {
                add_options_page('Acme Events', 'Acme Events', 'manage_options', 'acme-events', 'acme_render_settings');
                // top level: add_menu_page(..., 'dashicons-calendar-alt', 30)
            });

            add_action('admin_init', function () {
                register_setting('acme_events', 'acme_events_options', [
                    'type'              => 'array',
                    'sanitize_callback' => 'acme_sanitize_options',
                    'default'           => ['per_page' => 10, 'api_key' => ''],
                ]);
                add_settings_section('acme_main', __('General', 'acme-events'), '__return_false', 'acme-events');
                add_settings_field('acme_per_page', __('Events per page', 'acme-events'), function () {
                    $opts = get_option('acme_events_options');
                    printf('<input type="number" min="1" name="acme_events_options[per_page]" value="%d">', absint($opts['per_page'] ?? 10));
                }, 'acme-events', 'acme_main');
            });

            function acme_sanitize_options(array $input): array {
                return [
                    'per_page' => max(1, absint($input['per_page'] ?? 10)),
                    'api_key'  => sanitize_text_field($input['api_key'] ?? ''),
                ];
            }

            function acme_render_settings(): void {
                if (!current_user_can('manage_options')) return; ?>
                <div class="wrap">
                    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
                    <form action="options.php" method="post">
                        <?php settings_fields('acme_events'); do_settings_sections('acme-events'); submit_button(); ?>
                    </form>
                </div>
            <?php }
            `,
          note: 'settings_fields() prints the nonce and options.php saves, sanitizes and redirects for you, so you never handle $_POST yourself here.',
        },
      ],
    },
    {
      id: 'shortcodes-options-cron',
      title: 'Shortcodes, options, transients & cron',
      group: 'Plugins',
      items: [
        {
          title: 'Shortcode',
          code: c`
            <?php
            add_shortcode('acme_events', function ($atts): string {
                $atts = shortcode_atts(['count' => 5, 'type' => ''], $atts, 'acme_events');

                $events = get_posts([
                    'post_type'   => 'event',
                    'numberposts' => absint($atts['count']),
                    'event_type'  => sanitize_key($atts['type']) ?: null,
                ]);

                ob_start(); ?>
                <ul class="acme-events">
                    <?php foreach ($events as $e) : ?>
                        <li><a href="<?php echo esc_url(get_permalink($e)); ?>"><?php echo esc_html(get_the_title($e)); ?></a></li>
                    <?php endforeach; ?>
                </ul>
                <?php return ob_get_clean();
            });
            `,
          note: 'Shortcodes must RETURN their HTML; echoing prints it at the top of the page. For new features prefer a block.',
          then: [
            {
              label: 'Usage in content',
              lang: 'text',
              code: c`
                [acme_events count="3" type="workshop"]
                `,
            },
          ],
        },
        {
          title: 'Options',
          code: c`
            <?php
            $opts = get_option('acme_events_options', []);           // default if missing
            update_option('acme_events_options', $opts);             // creates if missing
            update_option('acme_big_cache', $data, false);           // false = don't autoload on every request
            delete_option('acme_events_options');
            `,
          note: 'Autoloaded options are loaded on every page; keep large or rarely used data out of them.',
        },
        {
          title: 'Transients: cache expensive work',
          code: c`
            <?php
            function acme_upcoming_count(): int {
                $count = get_transient('acme_upcoming_count');
                if ($count === false) {
                    $count = (new WP_Query(['post_type' => 'event', 'fields' => 'ids', 'posts_per_page' => -1]))->post_count;
                    set_transient('acme_upcoming_count', $count, HOUR_IN_SECONDS);
                }
                return (int) $count;
            }

            add_action('save_post_event', fn() => delete_transient('acme_upcoming_count'));   // invalidate
            `,
          note: 'Transients live in the options table, or in Redis/Memcached when a persistent object cache is installed. They can vanish at any time, so always handle false.',
        },
        {
          title: 'WP-Cron jobs',
          code: c`
            <?php
            add_filter('cron_schedules', function (array $schedules): array {
                $schedules['every_15_min'] = ['interval' => 15 * MINUTE_IN_SECONDS, 'display' => 'Every 15 minutes'];
                return $schedules;
            });

            // schedule on activation (see Plugin structure), unschedule on deactivation
            add_action('acme_daily_sync', 'acme_run_sync');

            wp_schedule_single_event(time() + 300, 'acme_send_reminder', [$post_id]);   // one-off, with args
            `,
          note: 'WP-Cron only runs when someone visits the site. In production trigger it from a real system cron (see Hosting). Inspect jobs with WP-CLI:',
          then: [
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                wp cron event list
                wp cron event run acme_daily_sync
                `,
            },
          ],
        },
      ],
    },

    // ───────────────────────── Block editor ─────────────────────────
    {
      id: 'create-block',
      title: 'Custom blocks with create-block',
      group: 'Block editor',
      items: [
        {
          title: 'Scaffold a block plugin',
          lang: 'bash',
          code: c`
            # same on every OS (Node.js 20+), run inside wp-content/plugins
            npx @wordpress/create-block@latest acme-notice --namespace=acme
            npx @wordpress/create-block@latest acme-latest --namespace=acme --variant=dynamic   # server-rendered

            cd acme-notice
            npm start            # watch + rebuild into build/
            npm run build        # production build (commit build/ or build in CI)
            npm run plugin-zip   # zip for upload
            `,
          note: 'Activate the plugin in wp-admin (or wp plugin activate acme-notice). Add --wp-env to the scaffold command to get a ready .wp-env.json.',
        },
        {
          title: 'Generated files',
          lang: 'text',
          code: c`
            acme-notice/
              acme-notice.php         # registers the block(s) from build/
              src/acme-notice/
                block.json            # metadata: name, attributes, supports, assets
                index.js              # registerBlockType(metadata.name, { edit, save })
                edit.js               # editor UI (React)
                save.js               # static: saved HTML   (or render.php for dynamic)
                style.scss            # front end + editor
                editor.scss           # editor only
                view.js               # optional front-end JS
              build/                  # compiled output — what WordPress loads
            `,
        },
        {
          title: 'block.json',
          lang: 'json',
          code: c`
            {
              "$schema": "https://schemas.wp.org/trunk/block.json",
              "apiVersion": 3,
              "name": "acme/notice",
              "version": "1.0.0",
              "title": "Notice",
              "category": "widgets",
              "icon": "megaphone",
              "description": "A highlighted notice box.",
              "textdomain": "acme-notice",
              "attributes": {
                "message": { "type": "string", "source": "html", "selector": "p" },
                "tone": { "type": "string", "default": "info" }
              },
              "supports": {
                "html": false,
                "align": ["wide", "full"],
                "color": { "background": true, "text": true },
                "spacing": { "padding": true, "margin": true }
              },
              "editorScript": "file:./index.js",
              "editorStyle": "file:./index.css",
              "style": "file:./style-index.css",
              "viewScript": "file:./view.js"
            }
            `,
          note: 'supports gives you colour, spacing, alignment and typography controls for free. Dynamic blocks add "render": "file:./render.php".',
        },
        {
          title: 'Register the block in PHP',
          code: c`
            <?php
            add_action('init', function () {
                register_block_type(__DIR__ . '/build/acme-notice');   // folder containing block.json
            });
            `,
          then: [
            {
              label: 'Many blocks in one plugin (WP 6.8+, current scaffold)',
              lang: 'php',
              code: c`
                add_action('init', function () {
                    wp_register_block_types_from_metadata_collection(__DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php');
                });
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'block-code',
      title: 'Block code: edit, save & dynamic render',
      group: 'Block editor',
      items: [
        {
          title: 'edit.js',
          lang: 'jsx',
          code: c`
            import { __ } from '@wordpress/i18n'
            import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor'
            import { PanelBody, SelectControl } from '@wordpress/components'

            export default function Edit({ attributes, setAttributes }) {
              const { message, tone } = attributes
              return (
                <>
                  <InspectorControls>
                    <PanelBody title={__('Settings', 'acme-notice')}>
                      <SelectControl
                        label={__('Tone', 'acme-notice')}
                        value={tone}
                        options={[{ label: 'Info', value: 'info' }, { label: 'Warning', value: 'warning' }]}
                        onChange={value => setAttributes({ tone: value })}
                      />
                    </PanelBody>
                  </InspectorControls>
                  <div {...useBlockProps({ className: 'is-' + tone })}>
                    <RichText
                      tagName="p"
                      value={message}
                      onChange={value => setAttributes({ message: value })}
                      placeholder={__('Write a notice…', 'acme-notice')}
                    />
                  </div>
                </>
              )
            }
            `,
          note: 'useBlockProps() adds the classes, styles and data attributes the editor needs; always spread it on the outer element.',
        },
        {
          title: 'save.js (static block)',
          lang: 'jsx',
          code: c`
            import { useBlockProps, RichText } from '@wordpress/block-editor'

            export default function save({ attributes }) {
              return (
                <div {...useBlockProps.save({ className: 'is-' + attributes.tone })}>
                  <RichText.Content tagName="p" value={attributes.message} />
                </div>
              )
            }
            `,
          note: 'The HTML is stored in post_content. If you change save() later, existing blocks show "unexpected content" unless you add a deprecated entry, so use a dynamic block for markup that will evolve.',
        },
        {
          title: 'render.php (dynamic block)',
          code: c`
            <?php
            // build/acme-latest/render.php — $attributes, $content and $block are available
            $count = absint($attributes['count'] ?? 3);
            $posts = get_posts(['numberposts' => $count]);
            ?>
            <ul <?php echo get_block_wrapper_attributes(); ?>>
                <?php foreach ($posts as $p) : ?>
                    <li><a href="<?php echo esc_url(get_permalink($p)); ?>"><?php echo esc_html(get_the_title($p)); ?></a></li>
                <?php endforeach; ?>
            </ul>
            `,
          note: 'Dynamic blocks run PHP on every view, so content is always current. save() returns null and the editor previews it with ServerSideRender or its own React UI.',
        },
        {
          title: 'InnerBlocks: blocks inside your block',
          lang: 'jsx',
          code: c`
            import { useBlockProps, InnerBlocks } from '@wordpress/block-editor'

            const TEMPLATE = [['core/heading', { level: 3, placeholder: 'Card title' }], ['core/paragraph']]

            export function Edit() {
              return (
                <div {...useBlockProps()}>
                  <InnerBlocks allowedBlocks={['core/heading', 'core/paragraph', 'core/image']} template={TEMPLATE} />
                </div>
              )
            }

            export function save() {
              return <div {...useBlockProps.save()}><InnerBlocks.Content /></div>
            }
            `,
          note: 'In a dynamic block, the saved inner blocks arrive in render.php as $content.',
        },
      ],
    },
    {
      id: 'patterns-styles',
      title: 'Block patterns & block styles',
      group: 'Block editor',
      items: [
        {
          title: 'Pattern file in a theme (auto-registered)',
          code: c`
            <?php
            /**
             * Title: Hero with button
             * Slug: my-theme/hero
             * Categories: featured, banner
             * Keywords: hero, call to action
             * Viewport Width: 1200
             */
            ?>
            <!-- wp:group {"align":"full","layout":{"type":"constrained"}} -->
            <div class="wp-block-group alignfull">
              <!-- wp:heading {"level":1} -->
              <h1 class="wp-block-heading"><?php esc_html_e('Build faster', 'my-theme'); ?></h1>
              <!-- /wp:heading -->
              <!-- wp:buttons -->
              <div class="wp-block-buttons"><!-- wp:button -->
              <div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/contact">Contact us</a></div>
              <!-- /wp:button --></div>
              <!-- /wp:buttons -->
            </div>
            <!-- /wp:group -->
            `,
          note: 'Save it as patterns/hero.php in the theme. Design the layout in the editor, then copy the block markup (Options → Copy) into the file.',
        },
        {
          title: 'Register a pattern from a plugin',
          code: c`
            <?php
            add_action('init', function () {
                register_block_pattern_category('acme', ['label' => __('Acme', 'acme')]);
                register_block_pattern('acme/event-cta', [
                    'title'      => __('Event call to action', 'acme'),
                    'categories' => ['acme'],
                    'content'    => '<!-- wp:paragraph --><p>Join our next workshop!</p><!-- /wp:paragraph -->',
                ]);
            });
            `,
        },
        {
          title: 'Block styles',
          code: c`
            <?php
            add_action('init', function () {
                register_block_style('core/button', [
                    'name'         => 'pill',                 // adds class is-style-pill
                    'label'        => __('Pill', 'my-theme'),
                    'inline_style' => '.wp-block-button.is-style-pill .wp-block-button__link { border-radius: 999px; }',
                ]);
            });
            `,
          note: 'Block themes can also define style variations as JSON files in styles/blocks/ (WP 6.6+), styled through theme.json syntax.',
        },
      ],
    },

    // ───────────────────────── REST API & headless ─────────────────────────
    {
      id: 'rest-api',
      title: 'REST API: core & custom endpoints',
      group: 'REST API & headless',
      items: [
        {
          title: 'Core endpoints',
          lang: 'bash',
          code: c`
            # same on every OS (PowerShell: use curl.exe)
            curl "https://example.com/wp-json/wp/v2/posts?per_page=5&_embed"
            curl "https://example.com/wp-json/wp/v2/posts?search=launch&categories=3&_fields=id,title,link"
            curl "https://example.com/wp-json/wp/v2/pages?slug=about"
            curl "https://example.com/wp-json/wp/v2/event"          # CPT with show_in_rest
            curl -I "https://example.com/wp-json/wp/v2/posts"         # X-WP-Total, X-WP-TotalPages headers
            `,
          note: '_embed adds the featured image, author and terms in one request; _fields trims the response. per_page maxes out at 100.',
        },
        {
          title: 'register_rest_route',
          code: c`
            <?php
            add_action('rest_api_init', function () {
                register_rest_route('acme/v1', '/events', [
                    [
                        'methods'             => WP_REST_Server::READABLE,
                        'callback'            => 'acme_rest_list_events',
                        'permission_callback' => '__return_true',     // public
                        'args'                => [
                            'per_page' => ['type' => 'integer', 'default' => 10, 'minimum' => 1, 'maximum' => 50],
                            'type'     => ['type' => 'string', 'sanitize_callback' => 'sanitize_key'],
                        ],
                    ],
                    [
                        'methods'             => WP_REST_Server::CREATABLE,
                        'callback'            => 'acme_rest_create_event',
                        'permission_callback' => fn() => current_user_can('publish_posts'),
                        'args'                => [
                            'title' => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
                            'date'  => ['type' => 'string', 'format' => 'date', 'required' => true],
                        ],
                    ],
                ]);
            });
            `,
          note: 'permission_callback is required on every route (WordPress logs a notice without it). The args schema validates and type-casts input before your callback runs.',
        },
        {
          title: 'Route callbacks',
          code: c`
            <?php
            function acme_rest_list_events(WP_REST_Request $request): WP_REST_Response {
                $posts = get_posts(['post_type' => 'event', 'numberposts' => $request['per_page']]);

                return rest_ensure_response(array_map(fn(WP_Post $p) => [
                    'id'    => $p->ID,
                    'title' => get_the_title($p),
                    'date'  => get_post_meta($p->ID, 'event_date', true),
                    'link'  => get_permalink($p),
                ], $posts));
            }

            function acme_rest_create_event(WP_REST_Request $request): WP_REST_Response|WP_Error {
                $id = wp_insert_post(['post_type' => 'event', 'post_title' => $request['title'], 'post_status' => 'publish'], true);
                if (is_wp_error($id)) {
                    return $id;
                }
                update_post_meta($id, 'event_date', $request['date']);
                return new WP_REST_Response(['id' => $id], 201);
            }

            // errors: return new WP_Error('acme_not_found', 'Event not found', ['status' => 404]);
            `,
          note: 'Routes with parameters use a regex: /events/(?P<id>\\d+) and read $request["id"].',
        },
      ],
    },
    {
      id: 'rest-auth',
      title: 'Authentication & admin-ajax',
      group: 'REST API & headless',
      items: [
        {
          title: 'Application Passwords (scripts, apps, CI)',
          lang: 'bash',
          code: c`
            # create one: Users → Profile → Application Passwords, or
            wp user application-password create admin "Deploy script" --porcelain

            # macOS / Linux (Ubuntu / Debian)
            curl -u "admin:abcd efgh ijkl mnop qrst uvwx" \
              -H "Content-Type: application/json" \
              -d '{"title":"Hello from the API","status":"draft"}' \
              https://example.com/wp-json/wp/v2/posts
            `,
          note: 'Application Passwords need HTTPS (or WP_ENVIRONMENT_TYPE local). They can be revoked one by one and never work for wp-admin logins.',
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                $token = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('admin:abcd efgh ijkl mnop qrst uvwx'))
                Invoke-RestMethod -Method Post -Uri https://example.com/wp-json/wp/v2/posts ${BT}
                  -Headers @{ Authorization = "Basic $token" } ${BT}
                  -ContentType 'application/json' ${BT}
                  -Body '{"title":"Hello from the API","status":"draft"}'
                `,
            },
          ],
        },
        {
          title: 'Logged-in users: cookie + X-WP-Nonce',
          code: c`
            <?php
            wp_enqueue_script('acme-app', plugins_url('build/app.js', __FILE__), ['wp-api-fetch'], ACME_EVENTS_VERSION, true);
            wp_localize_script('acme-app', 'AcmeApi', [
                'root'  => esc_url_raw(rest_url()),
                'nonce' => wp_create_nonce('wp_rest'),
            ]);
            `,
          then: [
            {
              label: 'app.js with fetch',
              lang: 'js',
              code: c`
                const res = await fetch(AcmeApi.root + 'acme/v1/events', {
                  method: 'POST',
                  credentials: 'same-origin',
                  headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': AcmeApi.nonce },
                  body: JSON.stringify({ title: 'Launch party', date: '2026-11-05' }),
                })
                if (!res.ok) throw new Error((await res.json()).message)
                `,
            },
            {
              label: 'Or @wordpress/api-fetch (adds the nonce for you)',
              lang: 'js',
              code: c`
                import apiFetch from '@wordpress/api-fetch'

                const event = await apiFetch({ path: '/acme/v1/events', method: 'POST', data: { title: 'Launch party', date: '2026-11-05' } })
                `,
            },
          ],
          note: 'Without the nonce, a logged-in request is treated as anonymous. The wp-api-fetch dependency configures root URL and nonce automatically.',
        },
        {
          title: 'admin-ajax.php (legacy but everywhere)',
          code: c`
            <?php
            add_action('wp_ajax_acme_like', 'acme_like');          // logged-in users
            add_action('wp_ajax_nopriv_acme_like', 'acme_like');   // visitors

            function acme_like(): void {
                check_ajax_referer('acme_like', 'nonce');          // dies with 403 if invalid
                $post_id = absint($_POST['post_id'] ?? 0);
                if (!$post_id || get_post_status($post_id) !== 'publish') {
                    wp_send_json_error(['message' => 'Invalid post'], 400);
                }
                $likes = (int) get_post_meta($post_id, 'likes', true) + 1;
                update_post_meta($post_id, 'likes', $likes);
                wp_send_json_success(['likes' => $likes]);         // sends JSON and exits
            }

            // when enqueueing:
            wp_localize_script('acme-like', 'AcmeLike', ['url' => admin_url('admin-ajax.php'), 'nonce' => wp_create_nonce('acme_like')]);
            `,
          then: [
            {
              label: 'JavaScript',
              lang: 'js',
              code: c`
                const body = new FormData()
                body.append('action', 'acme_like')
                body.append('nonce', AcmeLike.nonce)
                body.append('post_id', button.dataset.postId)

                const { success, data } = await (await fetch(AcmeLike.url, { method: 'POST', body })).json()
                if (success) button.textContent = data.likes + ' likes'
                `,
            },
          ],
          note: 'Prefer the REST API for new code (schemas, proper status codes, caching). See the AJAX sheet for fetch / axios / jQuery details.',
        },
      ],
    },
    {
      id: 'headless',
      title: 'Headless WordPress',
      group: 'REST API & headless',
      items: [
        {
          title: 'Next.js front end (REST)',
          lang: 'tsx',
          code: c`
            // app/blog/page.tsx
            type Post = { id: number; slug: string; title: { rendered: string }; excerpt: { rendered: string } }

            export default async function Blog() {
              const res = await fetch(process.env.WP_URL + '/wp-json/wp/v2/posts?per_page=10&_embed', {
                next: { revalidate: 300, tags: ['posts'] },   // ISR: refresh every 5 min
              })
              if (!res.ok) throw new Error('WordPress API ' + res.status)
              const posts: Post[] = await res.json()

              return posts.map(post => (
                <article key={post.id}>
                  <h2 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                  <div dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                </article>
              ))
            }
            `,
          note: 'WordPress returns rendered, already-sanitized HTML. See the Next.js sheet for caching and revalidation in depth.',
        },
        {
          title: 'Revalidate the front end on publish',
          code: c`
            <?php
            add_action('save_post_post', function (int $post_id) {
                if (wp_is_post_revision($post_id) || get_post_status($post_id) !== 'publish') return;
                wp_remote_post('https://www.example.com/api/revalidate', [
                    'blocking' => false,
                    'headers'  => ['Content-Type' => 'application/json'],
                    'body'     => wp_json_encode(['secret' => ACME_REVALIDATE_SECRET, 'tag' => 'posts']),
                ]);
            });
            `,
          note: 'Define ACME_REVALIDATE_SECRET in wp-config.php and check it in the Next.js route handler before calling revalidateTag.',
        },
        {
          title: 'WPGraphQL',
          lang: 'bash',
          code: c`
            wp plugin install wp-graphql --activate

            # same on every OS (PowerShell: curl.exe and escape the inner quotes)
            curl -X POST https://example.com/graphql -H "Content-Type: application/json" \
              -d '{"query":"{ posts(first: 5) { nodes { id title slug } } }"}'
            `,
          note: 'GraphQL fetches exactly the fields you need in one request; popular with Next.js and Faust.js front ends. Its IDE lives in wp-admin → GraphQL.',
        },
      ],
    },

    // ───────────────────────── Security ─────────────────────────
    {
      id: 'escaping-sanitizing',
      title: 'Escape output, sanitize input',
      group: 'Security',
      items: [
        {
          title: 'Escaping functions (escape late, at output)',
          lang: 'text',
          code: c`
            esc_html($s)          text between tags                  <p><?php echo esc_html($name); ?></p>
            esc_attr($s)          attribute values                   value="<?php echo esc_attr($v); ?>"
            esc_url($url)         href / src (blocks javascript:)    href="<?php echo esc_url($link); ?>"
            esc_url_raw($url)     URLs for redirects, DB, HTTP calls (not HTML)
            esc_textarea($s)      inside <textarea>
            esc_js($s)            inline JS string (prefer wp_json_encode)
            wp_kses_post($html)   HTML allowed in post content
            wp_kses($html, $tags) your own allowlist
            esc_html__() / esc_html_e() / esc_attr__()   translate + escape
            `,
        },
        {
          title: 'Escaping in practice',
          code: c`
            <a href="<?php echo esc_url($event_url); ?>" title="<?php echo esc_attr($title); ?>">
                <?php echo esc_html($title); ?>
            </a>
            <div class="bio"><?php echo wp_kses_post($user_bio_html); ?></div>
            <script>
                const acmeData = <?php echo wp_json_encode($data); ?>;
            </script>
            `,
          note: 'Escape every variable at the moment you print it, even values you think are safe (options, meta, titles). It is the main defence against XSS.',
        },
        {
          title: 'Sanitizing input',
          code: c`
            <?php
            $name    = sanitize_text_field(wp_unslash($_POST['name'] ?? ''));       // strips tags, line breaks
            $bio     = sanitize_textarea_field(wp_unslash($_POST['bio'] ?? ''));     // keeps line breaks
            $email   = sanitize_email(wp_unslash($_POST['email'] ?? ''));
            $id      = absint($_GET['id'] ?? 0);                                     // non-negative int
            $status  = sanitize_key($_GET['status'] ?? '');                          // lowercase a-z0-9_-
            $slug    = sanitize_title($raw);
            $url     = sanitize_url(wp_unslash($_POST['website'] ?? ''));
            $file    = sanitize_file_name($_FILES['doc']['name']);
            $content = wp_kses_post(wp_unslash($_POST['content'] ?? ''));

            // validate against an allowlist when you can
            $order = in_array($_GET['order'] ?? '', ['ASC', 'DESC'], true) ? $_GET['order'] : 'DESC';
            `,
          note: 'WordPress adds slashes to $_POST, $_GET and $_COOKIE, so call wp_unslash() before sanitizing. Sanitize on input, escape on output: you need both.',
        },
      ],
    },
    {
      id: 'nonces-caps-sql',
      title: 'Nonces, capabilities & safe SQL',
      group: 'Security',
      items: [
        {
          title: 'Nonces (CSRF protection)',
          code: c`
            <?php
            // form
            wp_nonce_field('acme_delete_event', 'acme_nonce');
            // handler (admin-post.php / admin page)
            check_admin_referer('acme_delete_event', 'acme_nonce');   // dies if invalid

            // link
            $url = wp_nonce_url(admin_url('admin-post.php?action=acme_delete&id=' . $id), 'acme_delete_' . $id);
            // handler
            check_admin_referer('acme_delete_' . $id);

            // manual check
            if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['acme_nonce'] ?? '')), 'acme_delete_event')) {
                wp_die(esc_html__('Link expired.', 'acme'), 403);
            }
            `,
          note: 'A nonce proves the request came from your form, not who the user is. Always pair it with a current_user_can() check.',
        },
        {
          title: 'Capabilities',
          code: c`
            <?php
            if (!current_user_can('manage_options')) {           // administrators
                wp_die(esc_html__('Not allowed.', 'acme'), 403);
            }
            current_user_can('edit_post', $post_id);              // meta cap: checks ownership + role
            current_user_can('upload_files');

            // custom capability on activation
            get_role('administrator')->add_cap('manage_events');
            get_role('editor')->add_cap('manage_events');
            `,
          note: 'Check capabilities, never role names: roles can be customised, capabilities are what WordPress actually enforces.',
        },
        {
          title: '$wpdb->prepare for raw SQL',
          code: c`
            <?php
            global $wpdb;

            $rows = $wpdb->get_results($wpdb->prepare(
                "SELECT ID, post_title FROM $wpdb->posts WHERE post_type = %s AND post_author = %d LIMIT %d",
                'event', $author_id, 20
            ));

            // LIKE: escape wildcards first
            $like = '%' . $wpdb->esc_like($search) . '%';
            $wpdb->get_col($wpdb->prepare("SELECT ID FROM $wpdb->posts WHERE post_title LIKE %s", $like));

            // table / column names: %i (WP 6.2+)
            $wpdb->get_var($wpdb->prepare('SELECT COUNT(*) FROM %i', $wpdb->prefix . 'acme_bookings'));
            `,
          note: 'Placeholders: %s string, %d integer, %f float, %i identifier. Never concatenate user input into SQL.',
        },
      ],
    },
    {
      id: 'hardening',
      title: 'Hardening checklist',
      group: 'Security',
      items: [
        {
          title: 'Checklist',
          lang: 'text',
          code: c`
            ✔ Keep core, plugins, themes and PHP updated; delete unused plugins/themes
            ✔ DISALLOW_FILE_EDIT (and DISALLOW_FILE_MODS if you deploy via Git)
            ✔ Unique admin username, strong passwords, 2FA (Two Factor plugin)
            ✔ Limit login attempts (Limit Login Attempts Reloaded, or fail2ban on the server)
            ✔ Disable XML-RPC if no app or Jetpack needs it
            ✔ HTTPS everywhere, FORCE_SSL_ADMIN, security headers
            ✔ No PHP execution in uploads; wp-config.php not world-readable
            ✔ Daily off-site backups, tested restores
            ✔ Least privilege: editors are editors, not admins
            `,
        },
        {
          title: 'Updates and XML-RPC in code',
          code: c`
            <?php
            // wp-content/mu-plugins/hardening.php
            add_filter('xmlrpc_enabled', '__return_false');
            remove_action('wp_head', 'wp_generator');                  // hide the version meta tag
            add_filter('auto_update_plugin', '__return_true');         // background plugin updates
            add_filter('auto_update_theme', '__return_true');
            `,
          then: [
            {
              label: 'Update from the command line',
              lang: 'bash',
              code: c`
                wp core update && wp core update-db
                wp plugin update --all
                wp theme update --all
                wp core verify-checksums          # detect modified core files
                wp plugin verify-checksums --all  # wordpress.org plugins only
                `,
            },
          ],
        },
        {
          title: 'File permissions',
          lang: 'bash',
          code: c`
            cd /var/www/example.com
            sudo find . -type d -exec chmod 755 {} \;
            sudo find . -type f -exec chmod 644 {} \;
            sudo chmod 640 wp-config.php
            sudo chown -R www-data:www-data wp-content
            `,
          note: 'Never use 777. Only wp-content (uploads, cache, upgrades) needs to be writable by PHP; with DISALLOW_FILE_MODS you can keep even plugins and themes read-only.',
        },
        {
          title: 'Nginx rules for WordPress security',
          lang: 'nginx',
          code: c`
            # inside the server { } block, ABOVE the generic "location ~ \.php$"
            location ~* /(?:uploads|files)/.*\.php$ { deny all; }
            location = /xmlrpc.php { deny all; access_log off; log_not_found off; }
            location ~* /wp-content/debug\.log$ { deny all; }
            location ~ /\.(?!well-known) { deny all; }

            add_header X-Frame-Options "SAMEORIGIN" always;
            add_header X-Content-Type-Options "nosniff" always;
            add_header Referrer-Policy "strict-origin-when-cross-origin" always;
            add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
            `,
          note: 'Nginx uses the first matching regex location, so the deny rules must come before the PHP handler.',
        },
      ],
    },

    // ───────────────────────── Database ─────────────────────────
    {
      id: 'wpdb',
      title: '$wpdb & custom tables',
      group: 'Database',
      items: [
        {
          title: '$wpdb basics',
          code: c`
            <?php
            global $wpdb;
            $table = $wpdb->prefix . 'acme_bookings';            // wp_acme_bookings (respects $table_prefix)

            $rows  = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table WHERE event_id = %d", $event_id));   // objects
            $row   = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $id), ARRAY_A);
            $count = (int) $wpdb->get_var("SELECT COUNT(*) FROM $table");
            $ids   = $wpdb->get_col("SELECT id FROM $table");

            $wpdb->insert($table, ['event_id' => $event_id, 'email' => $email, 'created_at' => current_time('mysql', true)], ['%d', '%s', '%s']);
            $new_id = $wpdb->insert_id;

            $wpdb->update($table, ['status' => 'confirmed'], ['id' => $new_id], ['%s'], ['%d']);
            $wpdb->delete($table, ['id' => $new_id], ['%d']);

            if ($wpdb->last_error) { error_log($wpdb->last_error); }
            `,
          note: 'insert, update and delete escape values for you; raw queries need prepare(). Core tables are available as $wpdb->posts, $wpdb->postmeta, $wpdb->options, $wpdb->users.',
        },
        {
          title: 'Custom table with dbDelta',
          code: c`
            <?php
            function acme_install_tables(): void {
                global $wpdb;
                $table   = $wpdb->prefix . 'acme_bookings';
                $charset = $wpdb->get_charset_collate();

                $sql = "CREATE TABLE $table (
                  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                  event_id bigint(20) unsigned NOT NULL,
                  email varchar(190) NOT NULL,
                  status varchar(20) NOT NULL DEFAULT 'pending',
                  created_at datetime NOT NULL,
                  PRIMARY KEY  (id),
                  KEY event_id (event_id)
                ) $charset;";

                require_once ABSPATH . 'wp-admin/includes/upgrade.php';
                dbDelta($sql);
                update_option('acme_db_version', '1.1', false);
            }

            // run upgrades when the code version changes
            add_action('plugins_loaded', function () {
                if (get_option('acme_db_version') !== '1.1') {
                    acme_install_tables();
                }
            });
            `,
          note: 'dbDelta is picky: one column per line, two spaces after PRIMARY KEY, KEY instead of INDEX. It creates or alters the table, but never drops columns.',
        },
        {
          title: 'Database with WP-CLI',
          lang: 'bash',
          code: c`
            wp db export backup.sql                 # mysqldump with the right credentials
            wp db import backup.sql
            wp db query "SELECT option_name FROM wp_options WHERE autoload IN ('yes','on') LIMIT 10"
            wp db size --tables --human-readable
            wp db optimize
            wp db cli                               # MySQL shell
            `,
          note: 'Same on every OS. For URL changes use wp search-replace (WP-CLI section), never a plain SQL REPLACE: it breaks serialized data.',
        },
      ],
    },

    // ───────────────────────── Performance ─────────────────────────
    {
      id: 'caching',
      title: 'Caching: object, page & transients',
      group: 'Performance',
      items: [
        {
          title: 'Redis object cache',
          lang: 'bash',
          code: c`
            # server (Ubuntu / Debian)
            sudo apt install -y redis-server php8.3-redis
            sudo systemctl enable --now redis-server
            sudo systemctl reload php8.3-fpm

            # site
            wp plugin install redis-cache --activate
            wp config set WP_REDIS_HOST 127.0.0.1
            wp config set WP_REDIS_PORT 6379 --raw
            wp config set WP_REDIS_PREFIX 'example_com:'
            wp config set WP_REDIS_DATABASE 0 --raw
            wp redis enable                    # installs the object-cache.php drop-in
            wp redis status
            `,
          note: 'A persistent object cache stores query results, options and transients in memory across requests: the biggest single win for logged-in and WooCommerce traffic.',
        },
        {
          title: 'Object cache API in your code',
          code: c`
            <?php
            $stats = wp_cache_get('event_stats', 'acme');
            if ($stats === false) {
                $stats = acme_calculate_stats();               // expensive
                wp_cache_set('event_stats', $stats, 'acme', 10 * MINUTE_IN_SECONDS);
            }
            wp_cache_delete('event_stats', 'acme');
            `,
          note: 'Without a persistent backend this cache lasts only for the current request; use transients when it must survive without Redis.',
        },
        {
          title: 'Page caching options',
          lang: 'text',
          code: c`
            Server level      Nginx FastCGI cache, Varnish, LiteSpeed (LiteSpeed Cache plugin)   → fastest
            Plugin            WP Super Cache, W3 Total Cache, WP Rocket                            → static HTML files
            CDN / edge        Cloudflare (APO / cache rules), Fastly, CloudFront                   → global, offloads origin
            Managed hosts     built-in (Kinsta, WP Engine, Pressable …) — don't stack another page cache plugin

            Always bypass cache for: logged-in users (wordpress_logged_in_ cookie), /wp-admin, cart/checkout, POST requests
            `,
        },
        {
          title: 'Nginx FastCGI page cache',
          lang: 'nginx',
          code: c`
            # /etc/nginx/conf.d/fastcgi-cache.conf  (http level)
            fastcgi_cache_path /var/cache/nginx/wp levels=1:2 keys_zone=WP:100m inactive=60m;
            fastcgi_cache_key "$scheme$request_method$host$request_uri";

            # in the server block
            set $skip_cache 0;
            if ($request_method = POST) { set $skip_cache 1; }
            if ($query_string != "") { set $skip_cache 1; }
            if ($request_uri ~* "/wp-admin/|/wp-json/|/xmlrpc.php|wp-.*\.php|/cart|/checkout") { set $skip_cache 1; }
            if ($http_cookie ~* "wordpress_logged_in|comment_author|woocommerce_items_in_cart") { set $skip_cache 1; }

            # inside "location ~ \.php$"
            fastcgi_cache WP;
            fastcgi_cache_valid 200 301 10m;
            fastcgi_cache_bypass $skip_cache;
            fastcgi_no_cache $skip_cache;
            add_header X-Cache $upstream_cache_status;
            `,
          note: 'Pages can be up to 10 minutes stale; purge on publish with the Nginx Helper plugin, or clear /var/cache/nginx/wp after deploys.',
        },
      ],
    },
    {
      id: 'frontend-perf',
      title: 'Images, assets & profiling',
      group: 'Performance',
      items: [
        {
          title: 'Modern images: WebP and AVIF',
          code: c`
            <?php
            // generate WebP sub-sizes for JPEG/PNG uploads (needs Imagick or GD with WebP)
            add_filter('image_editor_output_format', function (array $formats): array {
                $formats['image/jpeg'] = 'image/webp';
                $formats['image/png']  = 'image/webp';
                return $formats;
            });
            `,
          note: 'Core accepts WebP uploads since 5.8 and AVIF since 6.5 when the server image library supports it. Check support and rebuild sizes with WP-CLI:',
          then: [
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                wp eval "var_dump(wp_image_editor_supports(['mime_type' => 'image/avif']));"
                wp media regenerate --yes
                `,
            },
          ],
        },
        {
          title: 'Lazy loading and LCP image',
          code: c`
            <?php
            // core adds loading="lazy" to images/iframes and fetchpriority="high" to the likely LCP image (6.3+)
            echo wp_get_attachment_image($hero_id, 'hero', false, ['fetchpriority' => 'high', 'loading' => 'eager']);

            add_filter('wp_lazy_loading_enabled', '__return_false');   // opt out entirely (rarely needed)
            `,
          note: 'Always output images with wp_get_attachment_image() or the_post_thumbnail() so you get srcset, sizes, width/height and the loading attributes for free.',
        },
        {
          title: 'Remove what you do not use',
          code: c`
            <?php
            // wp-content/mu-plugins/cleanup.php
            remove_action('wp_head', 'print_emoji_detection_script', 7);
            remove_action('wp_print_styles', 'print_emoji_styles');
            remove_action('admin_print_scripts', 'print_emoji_detection_script');
            remove_action('admin_print_styles', 'print_emoji_styles');
            remove_action('wp_head', 'rsd_link');
            remove_action('wp_head', 'wp_shortlink_wp_head');

            add_action('wp_enqueue_scripts', function () {
                if (!is_singular() || !has_block('core/embed')) {
                    wp_dequeue_script('wp-embed');
                }
            }, 100);
            `,
        },
        {
          title: 'Find slow queries and bloat',
          lang: 'bash',
          code: c`
            wp plugin install query-monitor --activate     # dev/staging: queries, hooks, HTTP calls per page
            wp option list --autoload=on --fields=option_name,size_bytes --orderby=size_bytes --order=desc | head -20
            wp transient delete --expired
            wp post delete $(wp post list --post_type=revision --format=ids) --force   # macOS / Linux
            `,
          note: 'Autoloaded options above ~1 MB in total slow every request. Query Monitor shows duplicate and slow queries with the plugin that caused them.',
        },
        {
          title: 'PHP OPcache',
          lang: 'ini',
          code: c`
            ; /etc/php/8.3/fpm/conf.d/99-wordpress.ini
            opcache.enable=1
            opcache.memory_consumption=256
            opcache.interned_strings_buffer=16
            opcache.max_accelerated_files=20000
            opcache.validate_timestamps=1
            opcache.revalidate_freq=60
            `,
          note: 'Keep validate_timestamps=1 if anyone updates plugins from wp-admin. Set it to 0 only when every change goes through a deploy that reloads PHP-FPM.',
        },
      ],
    },

    // ───────────────────────── WP-CLI ─────────────────────────
    {
      id: 'wpcli-core',
      title: 'WP-CLI: core, plugins, users, content',
      group: 'WP-CLI',
      items: [
        {
          title: 'Core, plugins, themes',
          lang: 'bash',
          code: c`
            wp core version && wp core check-update
            wp core update && wp core update-db

            wp plugin list --status=active
            wp plugin install query-monitor redis-cache --activate
            wp plugin install ./acme-events.zip --activate
            wp plugin activate acme-events
            wp plugin deactivate --all
            wp plugin update --all --dry-run
            wp plugin delete hello

            wp theme list
            wp theme install twentytwentyfive --activate
            wp theme update --all
            `,
          note: 'Every command on this sheet is the same on macOS, Linux and Windows.',
        },
        {
          title: 'Users',
          lang: 'bash',
          code: c`
            wp user list --role=administrator --fields=ID,user_login,user_email
            wp user create jane jane@example.com --role=editor --send-email
            wp user update admin --user_pass='N3w-strong-password!'
            wp user add-role 12 shop_manager
            wp user delete 12 --reassign=1
            wp user session destroy admin --all
            `,
        },
        {
          title: 'Options, posts, rewrites, cache, cron',
          lang: 'bash',
          code: c`
            wp option get siteurl
            wp option update blogname "My Site"
            wp post list --post_type=page --fields=ID,post_title,post_status
            wp post create --post_type=page --post_title="About" --post_status=publish
            wp post meta update 42 event_date 2026-11-05
            wp rewrite flush
            wp cache flush
            wp transient delete --all
            wp cron event list
            wp cron event run --due-now
            `,
        },
      ],
    },
    {
      id: 'wpcli-db',
      title: 'WP-CLI: database, migrations & tools',
      group: 'WP-CLI',
      items: [
        {
          title: 'search-replace (safe URL changes)',
          lang: 'bash',
          code: c`
            wp search-replace 'https://old.example.com' 'https://new.example.com' --all-tables --precise --skip-columns=guid --dry-run
            wp search-replace 'https://old.example.com' 'https://new.example.com' --all-tables --precise --skip-columns=guid
            wp search-replace 'http://example.com' 'https://example.com' --skip-columns=guid    # after enabling HTTPS
            wp cache flush
            `,
          note: 'search-replace unserializes and re-serializes PHP data, so widget and option settings survive. Always run with --dry-run first and take a db export.',
        },
        {
          title: 'Maintenance, shell, eval',
          lang: 'bash',
          code: c`
            wp maintenance-mode activate
            wp maintenance-mode deactivate
            wp shell                                # interactive PHP with WordPress loaded
            wp eval 'echo get_option("home");'
            wp eval-file scripts/import-events.php
            `,
        },
        {
          title: 'Scaffolding and i18n',
          lang: 'bash',
          code: c`
            wp scaffold plugin acme-events
            wp scaffold child-theme my-child --parent_theme=twentytwentyfive
            wp scaffold post-type event --plugin=acme-events
            wp scaffold taxonomy event_type --post_types=event --plugin=acme-events
            wp scaffold plugin-tests acme-events    # PHPUnit setup
            wp i18n make-pot . languages/acme-events.pot
            `,
        },
      ],
    },

    // ───────────────────────── Hosting & deployment ─────────────────────────
    {
      id: 'lemp',
      title: 'LEMP server on Ubuntu 24.04',
      group: 'Hosting & deployment',
      items: [
        {
          title: '1. Install Nginx, PHP 8.3-FPM, MySQL',
          lang: 'bash',
          code: c`
            sudo apt update && sudo apt upgrade -y
            sudo apt install -y nginx mysql-server unzip \
              php8.3-fpm php8.3-mysql php8.3-curl php8.3-xml php8.3-mbstring php8.3-zip \
              php8.3-gd php8.3-intl php8.3-imagick php8.3-bcmath
            sudo mysql_secure_installation
            `,
          note: 'Ubuntu 24.04 ships MySQL 8.0, which is fine for WordPress. For MySQL 8.4 LTS add the official MySQL APT repo, or install mariadb-server instead.',
        },
        {
          title: '2. Create the database and user',
          lang: 'sql',
          code: c`
            -- sudo mysql
            CREATE DATABASE wordpress CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
            CREATE USER 'wp'@'localhost' IDENTIFIED BY 'a-long-random-password';
            GRANT ALL PRIVILEGES ON wordpress.* TO 'wp'@'localhost';
            FLUSH PRIVILEGES;
            `,
        },
        {
          title: '3. PHP limits for WordPress',
          lang: 'ini',
          code: c`
            ; /etc/php/8.3/fpm/conf.d/99-wordpress.ini
            upload_max_filesize = 64M
            post_max_size = 64M
            memory_limit = 256M
            max_execution_time = 120
            max_input_vars = 3000
            `,
          then: [
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                sudo systemctl reload php8.3-fpm
                `,
            },
          ],
        },
        {
          title: '4. Download WordPress as www-data',
          lang: 'bash',
          code: c`
            # install WP-CLI (see "Install WP-CLI", Linux), then:
            sudo mkdir -p /var/www/example.com
            sudo chown www-data:www-data /var/www/example.com
            cd /var/www/example.com

            sudo -u www-data wp core download
            sudo -u www-data wp config create --dbname=wordpress --dbuser=wp --prompt=dbpass
            sudo -u www-data wp config set DISALLOW_FILE_EDIT true --raw
            sudo -u www-data wp config set WP_ENVIRONMENT_TYPE production
            `,
        },
        {
          title: '5. Ownership and permissions',
          lang: 'bash',
          code: c`
            cd /var/www/example.com
            sudo chown -R www-data:www-data .
            sudo find . -type d -exec chmod 755 {} \;
            sudo find . -type f -exec chmod 644 {} \;
            sudo chmod 640 wp-config.php
            `,
          note: 'For Git deploys, a common variant is owner deploy, group www-data, with only wp-content/uploads (and cache folders) writable by www-data.',
        },
      ],
    },
    {
      id: 'nginx-https',
      title: 'Nginx site & HTTPS',
      group: 'Hosting & deployment',
      items: [
        {
          title: '6. WordPress server block',
          lang: 'nginx',
          code: c`
            # /etc/nginx/sites-available/example.com
            server {
                listen 80;
                listen [::]:80;
                server_name example.com www.example.com;
                root /var/www/example.com;
                index index.php;
                client_max_body_size 64M;            # match upload_max_filesize

                access_log /var/log/nginx/example.com.access.log;
                error_log  /var/log/nginx/example.com.error.log;

                # deny rules first (first matching regex wins)
                location ~* /(?:uploads|files)/.*\.php$ { deny all; }
                location = /xmlrpc.php { deny all; access_log off; log_not_found off; }
                location ~* /wp-content/debug\.log$ { deny all; }
                location ~ /\.(?!well-known) { deny all; }

                # pretty permalinks
                location / {
                    try_files $uri $uri/ /index.php?$args;
                }

                location ~ \.php$ {
                    include snippets/fastcgi-php.conf;
                    fastcgi_pass unix:/run/php/php8.3-fpm.sock;
                    fastcgi_read_timeout 120;
                }

                # static assets
                location ~* \.(?:css|js|mjs|jpe?g|png|gif|webp|avif|svg|ico|woff2?)$ {
                    expires 30d;
                    add_header Cache-Control "public";
                    access_log off;
                    try_files $uri =404;
                }

                location = /favicon.ico { log_not_found off; access_log off; }
                location = /robots.txt  { try_files $uri /index.php?$args; access_log off; }
            }
            `,
          note: 'Without the try_files fallback to /index.php every permalink except the home page returns 404.',
        },
        {
          title: '7. Enable the site',
          lang: 'bash',
          code: c`
            sudo nano /etc/nginx/sites-available/example.com      # paste the config above
            sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
            sudo rm -f /etc/nginx/sites-enabled/default
            sudo nginx -t && sudo systemctl reload nginx
            sudo ufw allow 'Nginx Full'
            `,
        },
        {
          title: '8. HTTPS with certbot, then install',
          lang: 'bash',
          code: c`
            sudo apt install -y certbot python3-certbot-nginx
            sudo certbot --nginx -d example.com -d www.example.com --redirect --agree-tos -m you@example.com
            sudo certbot renew --dry-run

            cd /var/www/example.com
            sudo -u www-data wp core install --url=https://example.com --title="My Site" \
              --admin_user=siteadmin --admin_email=you@example.com --prompt=admin_password
            `,
          note: 'Install with the https:// URL so no http links end up in the database. Point DNS to the server before running certbot.',
        },
      ],
    },
    {
      id: 'cron-backups',
      title: 'Real cron & backups',
      group: 'Hosting & deployment',
      items: [
        {
          title: 'Replace WP-Cron with a system cron',
          lang: 'bash',
          code: c`
            cd /var/www/example.com
            sudo -u www-data wp config set DISABLE_WP_CRON true --raw

            sudo crontab -u www-data -e
            # add this line:
            */5 * * * * cd /var/www/example.com && /usr/local/bin/wp cron event run --due-now --quiet > /dev/null 2>&1
            `,
          note: 'Scheduled posts and plugin jobs now run every 5 minutes regardless of traffic, and visitors no longer pay for cron on page loads.',
        },
        {
          title: 'Backup script',
          lang: 'bash',
          code: c`
            #!/usr/bin/env bash
            # /usr/local/bin/wp-backup.sh  (run as root)
            set -euo pipefail
            SITE=/var/www/example.com
            DEST=/var/backups/wordpress
            STAMP=$(date +%F-%H%M)
            mkdir -p "$DEST"

            wp --path="$SITE" --allow-root db export "$DEST/db-$STAMP.sql" --quiet
            tar -czf "$DEST/files-$STAMP.tar.gz" -C "$SITE" wp-content wp-config.php
            find "$DEST" -type f -mtime +14 -delete

            # off-site copy (S3 shown; rclone works for GCS, Azure, Backblaze …)
            aws s3 sync "$DEST" s3://my-backups/example.com/ --only-show-errors
            `,
          then: [
            {
              label: 'Schedule it',
              lang: 'bash',
              code: c`
                sudo chmod 700 /usr/local/bin/wp-backup.sh
                sudo crontab -e
                # add:
                0 3 * * * /usr/local/bin/wp-backup.sh >> /var/log/wp-backup.log 2>&1
                `,
            },
          ],
          note: 'A backup you have never restored is a hope, not a backup: restore to a staging site now and then.',
        },
      ],
    },
    {
      id: 'migrate-deploy',
      title: 'Migrations & deployments',
      group: 'Hosting & deployment',
      items: [
        {
          title: 'Migrate a site to a new server or domain',
          lang: 'bash',
          code: c`
            # old server
            wp db export site.sql
            tar -czf wp-content.tar.gz wp-content

            # copy to the new server (from your machine or server to server)
            scp site.sql wp-content.tar.gz deploy@new-server:/tmp/

            # new server (WordPress downloaded + wp-config.php created as above)
            cd /var/www/example.com
            sudo -u www-data tar -xzf /tmp/wp-content.tar.gz
            sudo -u www-data wp db import /tmp/site.sql
            sudo -u www-data wp search-replace 'https://old.example.com' 'https://example.com' --all-tables --precise --skip-columns=guid
            sudo -u www-data wp rewrite flush
            sudo -u www-data wp cache flush
            `,
          note: 'Keep the same $table_prefix in the new wp-config.php. Pulling production to local works the same way, replacing the live URL with http://my-site.local.',
        },
        {
          title: 'What goes in Git',
          lang: 'text',
          code: c`
            # .gitignore at the WordPress root — track only your own code
            /*
            !/wp-content/
            /wp-content/*
            !/wp-content/themes/
            /wp-content/themes/*
            !/wp-content/themes/my-theme/
            !/wp-content/plugins/
            /wp-content/plugins/*
            !/wp-content/plugins/acme-events/
            !/wp-content/mu-plugins/
            node_modules/
            vendor/
            `,
          note: 'Alternatively version the whole site with Composer (Bedrock + wpackagist) so core and third-party plugins are pinned too.',
        },
        {
          title: 'Deploy theme/plugin code',
          lang: 'bash',
          code: c`
            # build locally or in CI, then sync only your code
            npm ci && npm run build
            composer install --no-dev --optimize-autoloader
            rsync -az --delete --exclude node_modules --exclude .git --exclude src \
              ./ deploy@example.com:/var/www/example.com/wp-content/themes/my-theme/

            # on the server after code changes
            ssh deploy@example.com "cd /var/www/example.com && wp cache flush && wp rewrite flush"
            `,
          note: 'Run this from GitHub Actions on every push to main: see the CI/CD sheet for SSH deploy workflows and secrets.',
        },
        {
          title: 'Where to host',
          lang: 'text',
          code: c`
            Managed WordPress   Kinsta, WP Engine, WordPress.com, Pressable, SiteGround
                                → backups, caching, staging, updates handled; least ops work
            Own VPS / cloud VM  AWS EC2 / Lightsail, GCP Compute Engine, Azure VM, Hetzner, DigitalOcean
                                → full control; you run the LEMP steps above
            Containers          official wordpress image + managed MySQL (RDS / Cloud SQL / Azure Database)
                                → put uploads on shared storage or S3 / GCS (offload plugin)
            `,
          note: 'See the AWS, GCP and Azure sheets for provisioning the server, firewall, managed database and DNS.',
        },
      ],
    },

    // ───────────────────────── Troubleshooting ─────────────────────────
    {
      id: 'troubleshooting',
      title: 'Common problems & fixes',
      group: 'Troubleshooting',
      items: [
        {
          title: 'Symptom → fix',
          lang: 'text',
          code: c`
            White screen / "critical error"     enable WP_DEBUG_LOG, read wp-content/debug.log, deactivate the plugin named there
            Permalinks 404 on Nginx            location / { try_files $uri $uri/ /index.php?$args; } then wp rewrite flush
            Error establishing a DB connection  wrong DB_* in wp-config.php, MySQL down (systemctl status mysql), DB_HOST 127.0.0.1 vs localhost
            Upload exceeds max size             upload_max_filesize + post_max_size in php.ini AND client_max_body_size in Nginx
            Allowed memory size exhausted       WP_MEMORY_LIMIT / WP_MAX_MEMORY_LIMIT, and memory_limit in php.ini
            Mixed content after HTTPS          search-replace http:// → https://, check siteurl and home options
            Too many redirects behind proxy    set $_SERVER['HTTPS'] from HTTP_X_FORWARDED_PROTO in wp-config.php
            Broken after plugin update          wp plugin deactivate --all, then reactivate one by one
            Locked out of wp-admin             wp user update admin --user_pass=...
            Stuck in maintenance mode          delete the .maintenance file in the WordPress root
            Changes not showing                 page cache / CDN / OPcache / object cache: wp cache flush, purge CDN
            `,
        },
        {
          title: 'White screen: find the real error',
          lang: 'bash',
          code: c`
            wp config set WP_DEBUG true --raw
            wp config set WP_DEBUG_LOG true --raw
            wp config set WP_DEBUG_DISPLAY false --raw
            tail -f wp-content/debug.log                       # macOS / Linux
            sudo tail -f /var/log/nginx/example.com.error.log  # PHP-FPM fatal errors show here too
            `,
          note: 'WordPress also emails the admin a recovery-mode link when a plugin or theme causes a fatal error.',
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                Get-Content wp-content\debug.log -Tail 50 -Wait
                `,
            },
          ],
        },
        {
          title: 'Plugin or theme conflict',
          lang: 'bash',
          code: c`
            wp plugin list --status=active --field=name > active-plugins.txt
            wp plugin deactivate --all
            wp theme activate twentytwentyfive
            # site works? reactivate one at a time until it breaks:
            wp plugin activate woocommerce
            # no WP-CLI access: rename wp-content/plugins to plugins.off via SFTP
            `,
        },
        {
          title: 'Wrong URLs, locked out, redirects',
          lang: 'bash',
          code: c`
            wp option get home && wp option get siteurl
            wp option update home 'https://example.com'
            wp option update siteurl 'https://example.com'
            wp search-replace 'http://example.com' 'https://example.com' --skip-columns=guid --dry-run
            wp user update admin --user_pass='N3w-strong-password!'
            wp user create rescue rescue@example.com --role=administrator --prompt=user_pass
            `,
          note: 'WP_HOME and WP_SITEURL constants in wp-config.php override these options, so check there first if changes do not stick.',
        },
      ],
    },
  ],
}
