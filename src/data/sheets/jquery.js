import { c } from './shared/code.js'

export default {
  slug: 'jquery',
  title: 'jQuery',
  tech: 'jQuery',
  category: 'frontend',
  minutes: 15,
  lang: 'js',
  description: 'jQuery for server-rendered pages: setup, selectors, changing the DOM, traversing, events and delegation, effects, forms, an AJAX quick start, plugins and the vanilla JS equivalents.',
  sections: [
    {
      id: 'project-setup',
      title: 'Project setup, step by step',
      group: 'Setup',
      items: [
        {
          title: '1. Add jQuery from a CDN',
          lang: 'html',
          code: c`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <title>My page</title>
            </head>
            <body>
              <button id="hello">Say hello</button>

              <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
              <script src="app.js"></script>
            </body>
            </html>
            `,
          note: 'Load jQuery before any script that uses $. Putting scripts at the end of <body> means the HTML above them already exists.',
        },
        {
          title: '2. Or install with npm (Vite / bundlers)',
          lang: 'bash',
          code: c`
            npm install jquery
            `,
          then: [
            {
              label: 'src/main.js',
              lang: 'js',
              code: c`
                import $ from 'jquery'
                window.$ = window.jQuery = $      // only needed for plugins / inline scripts that expect a global

                $(function () {
                  $('#hello').on('click', () => alert('Hello!'))
                })
                `,
            },
          ],
          note: 'Same command on every OS.',
        },
        {
          title: '3. Run code when the page is ready',
          code: c`
            $(function () {
              // the DOM is ready: safe to select and change elements
              $('#hello').on('click', function () {
                alert('Hello!')
              })
            })

            // same thing, older spelling
            $(document).ready(function () { /* ... */ })
            `,
          note: 'Not needed when your script is at the end of <body> or loaded with type="module", but harmless.',
        },
        {
          title: '4. Serve the page locally',
          lang: 'bash',
          code: c`
            npx serve .          # any OS → http://localhost:3000
            `,
          note: 'AJAX requests do not work from file:// pages. Use a local server (or the VS Code "Live Server" extension).',
        },
        {
          title: '5. Avoid conflicts with other libraries',
          code: c`
            const jq = jQuery.noConflict()     // gives $ back to the other library
            jq('#hello').hide()

            // or keep $ inside a wrapper
            jQuery(function ($) {
              $('#hello').show()
            })
            `,
        },
      ],
    },
    {
      id: 'selectors',
      title: 'Selecting elements',
      group: 'Basics',
      items: [
        {
          title: 'CSS selectors',
          code: c`
            $('#cart')                    // by id
            $('.product')                 // by class
            $('button')                   // by tag
            $('input[name="email"]')      // by attribute
            $('ul.menu > li')             // direct children
            $('.product:first')           // jQuery extras: :first :last :even :odd :visible :hidden
            $('tr:has(td.error)')         // rows containing an error cell
            `,
        },
        {
          title: 'Work with the result',
          code: c`
            const $items = $('.product')

            $items.length                 // how many matched (0 = none, never null)
            $items.eq(0)                  // first as a jQuery object
            $items.get(0)                 // first as a plain DOM element
            $items.first(); $items.last()
            $items.each(function (i, el) {
              console.log(i, $(el).text())
            })
            `,
          note: 'Name variables that hold jQuery objects with a leading $ ($items) so they are easy to spot.',
        },
        {
          title: 'Search inside an element',
          code: c`
            const $form = $('#signup')
            $form.find('input')           // descendants
            $form.children('.row')        // direct children only
            $('input', $form)             // same as $form.find('input')
            `,
        },
      ],
    },
    {
      id: 'dom',
      title: 'Changing the page',
      group: 'Basics',
      items: [
        {
          title: 'Text, HTML and values',
          code: c`
            $('#title').text()                    // read text
            $('#title').text('New title')         // set text (HTML is escaped: safe)
            $('#box').html('<b>Bold</b>')         // set HTML (only with trusted content!)
            $('#email').val()                     // read input value
            $('#email').val('ana@example.com')    // set input value
            `,
          note: 'Use .text() for anything that came from a user or an API. .html() with untrusted data allows XSS.',
        },
        {
          title: 'Attributes, properties and data',
          code: c`
            $('img').attr('src', '/logo.png')
            $('a').attr({ href: '/help', target: '_blank' })
            $('a').removeAttr('target')

            $('#agree').prop('checked')           // true / false (use prop for checked, disabled, selected)
            $('#save').prop('disabled', true)

            // <div id="cart" data-product-id="42" data-price="299">
            $('#cart').data('product-id')         // 42  (converted to a number)
            $('#cart').data('price')              // 299
            `,
        },
        {
          title: 'Classes and styles',
          code: c`
            $('.card').addClass('active')
            $('.card').removeClass('active')
            $('.card').toggleClass('open')
            $('.card').hasClass('open')           // true / false

            $('#box').css('color', 'red')
            $('#box').css({ width: 200, 'background-color': '#eef' })
            $('#box').css('width')                // read: "200px"
            `,
          note: 'Prefer toggling classes over setting styles: keep the look in CSS.',
        },
        {
          title: 'Add, move and remove elements',
          code: c`
            $('#list').append('<li>Last</li>')          // inside, at the end
            $('#list').prepend('<li>First</li>')        // inside, at the start
            $('#title').after('<p>Below the title</p>') // outside, after
            $('#title').before('<p>Above</p>')          // outside, before

            // build safely from data
            const $li = $('<li>').text(user.name).addClass('user').attr('data-id', user.id)
            $('#users').append($li)

            $('.flash').remove()                        // remove element (and its events)
            $('#list').empty()                          // remove all children
            $('.row').clone().appendTo('#table')        // copy
            `,
        },
        {
          title: 'Size and position',
          code: c`
            $('#box').width(); $('#box').height()
            $('#box').outerHeight(true)          // including padding, border and margin
            $('#box').offset()                   // { top, left } relative to the document
            $(window).scrollTop()                // how far the page is scrolled
            $('html, body').animate({ scrollTop: $('#contact').offset().top }, 400)   // smooth scroll
            `,
        },
      ],
    },
    {
      id: 'traversing',
      title: 'Moving around the DOM',
      group: 'Basics',
      items: [
        {
          title: 'Parents, siblings and filters',
          code: c`
            $(this).parent()                     // direct parent
            $(this).closest('tr')                // nearest ancestor matching the selector (most useful!)
            $(this).siblings('.active')
            $(this).next(); $(this).prev()
            $('.product').filter('.on-sale')     // keep matching ones
            $('.product').not('.sold-out')       // drop matching ones
            $('li').is('.active')                // true if any matches
            `,
        },
        {
          title: 'Chaining',
          code: c`
            $('#notice')
              .text('Saved!')
              .addClass('success')
              .fadeIn(200)
              .delay(2000)
              .fadeOut(400)
            `,
          note: 'Most jQuery methods return the same jQuery object, so calls can be chained.',
        },
      ],
    },
    {
      id: 'events',
      title: 'Events',
      group: 'Basics',
      items: [
        {
          title: 'Listen and stop listening',
          code: c`
            $('#save').on('click', function (e) {
              console.log(this)          // the clicked DOM element
              console.log($(this).data('id'))
            })

            $('#search').on('input', e => console.log(e.target.value))
            $('#menu').on('mouseenter mouseleave', () => $('#menu').toggleClass('hover'))

            $('#save').off('click')      // remove click handlers
            $('#once').one('click', () => console.log('only the first click'))
            `,
          note: 'Arrow functions do not get "this" as the element. Use function () {} or e.currentTarget.',
        },
        {
          title: 'Event delegation (elements added later)',
          code: c`
            // ❌ only works for rows that exist right now
            $('.delete').on('click', handler)

            // ✅ works for current AND future rows: listen on a parent that always exists
            $('#table').on('click', '.delete', function () {
              $(this).closest('tr').remove()
            })

            $(document).on('submit', 'form.ajax', handler)   // last resort: document
            `,
          note: 'Always use delegation for content you add with AJAX or .append().',
        },
        {
          title: 'Prevent defaults and bubbling',
          code: c`
            $('a.modal-link').on('click', function (e) {
              e.preventDefault()         // do not follow the link
              e.stopPropagation()        // do not trigger parent handlers
              openModal($(this).attr('href'))
            })

            $('form').on('submit', e => { e.preventDefault() })
            // return false in a jQuery handler does both
            `,
        },
        {
          title: 'Keyboard, change and custom events',
          code: c`
            $('#search').on('keydown', function (e) {
              if (e.key === 'Enter') runSearch($(this).val())
              if (e.key === 'Escape') $(this).val('')
            })

            $('#country').on('change', function () {
              loadCities($(this).val())
            })

            // custom events between components
            $(document).on('cart:updated', (e, count) => $('#cart-count').text(count))
            $(document).trigger('cart:updated', [3])
            `,
        },
      ],
    },
    {
      id: 'effects',
      title: 'Effects & animation',
      group: 'Basics',
      items: [
        {
          title: 'Show, hide, fade and slide',
          code: c`
            $('#panel').show(); $('#panel').hide(); $('#panel').toggle()
            $('#notice').fadeIn(200); $('#notice').fadeOut(400); $('#notice').fadeToggle()
            $('#faq-1').slideDown(); $('#faq-1').slideUp(); $('#faq-1').slideToggle(150)

            $('#notice').fadeOut(300, function () {
              $(this).remove()                 // runs after the animation finishes
            })
            `,
        },
        {
          title: 'Custom animation',
          code: c`
            $('#box').animate({ opacity: 0.5, left: '+=50px', height: 200 }, 400)
            $('#box').stop(true)               // stop running animations (avoid queue build-up on hover)
            `,
          note: 'For anything complex, CSS transitions plus toggleClass() are smoother and easier to maintain.',
        },
        {
          title: 'Accordion example',
          code: c`
            // <div class="faq"><h3 class="q">Question</h3><div class="a">Answer</div></div>
            $('.faq .a').hide()
            $('.faq').on('click', '.q', function () {
              const $answer = $(this).next('.a')
              $('.faq .a').not($answer).slideUp(150)
              $answer.slideToggle(150)
            })
            `,
        },
      ],
    },
    {
      id: 'forms',
      title: 'Forms',
      group: 'Forms',
      items: [
        {
          title: 'Read form values',
          code: c`
            $('#name').val()
            $('input[name="plan"]:checked').val()           // selected radio
            $('#agree').is(':checked')                      // checkbox → true / false
            $('#tags').val()                                // multi-select → array
            $('input[name="colors[]"]:checked').map(function () { return this.value }).get()   // checked boxes → array
            `,
        },
        {
          title: 'Serialize a whole form',
          code: c`
            $('#signup').serialize()        // "name=Ana&email=ana%40example.com"  (for $.post / $.ajax)
            $('#signup').serializeArray()   // [{ name: 'name', value: 'Ana' }, ...]

            // to a plain object
            const data = Object.fromEntries(new FormData($('#signup')[0]))
            `,
          note: 'serialize() skips disabled fields and file inputs. Use FormData for files.',
        },
        {
          title: 'Simple client-side validation',
          code: c`
            $('#signup').on('submit', function (e) {
              const $email = $(this).find('[name="email"]')
              $('.error').text('')

              if (!/^\S+@\S+\.\S+$/.test($email.val())) {
                e.preventDefault()
                $email.next('.error').text('Enter a valid email')
                $email.trigger('focus')
              }
            })
            `,
          note: 'Always validate on the server too: client checks are only for user convenience.',
        },
        {
          title: 'Dependent dropdowns',
          code: c`
            $('#country').on('change', function () {
              const $city = $('#city').prop('disabled', true).empty()
              $.getJSON('/api/cities', { country: $(this).val() }, function (cities) {
                $.each(cities, (i, c) => $city.append($('<option>').val(c.id).text(c.name)))
                $city.prop('disabled', false)
              })
            })
            `,
        },
      ],
    },
    {
      id: 'ajax-basics',
      title: 'AJAX quick start',
      group: 'AJAX',
      items: [
        {
          title: 'More on AJAX',
          note: 'This is the jQuery quick start. The AJAX sheet covers everything else, with fetch, axios and jQuery side by side: error handling, loading states, cancelling, CSRF for Laravel / Django / Express, auth tokens, CORS, file uploads and common patterns.',
        },
        {
          title: '$.ajax: the full version',
          code: c`
            $.ajax({
              url: '/api/products',
              method: 'GET',                    // GET | POST | PUT | PATCH | DELETE
              data: { page: 2, q: 'shirt' },    // query string for GET, body for others
              dataType: 'json',                 // what you expect back
              timeout: 10000,                   // ms
            })
              .done(function (data, textStatus, xhr) {
                console.log(data)
              })
              .fail(function (xhr, textStatus, error) {
                console.error(xhr.status, xhr.responseJSON || xhr.responseText)
              })
              .always(function () {
                console.log('finished either way')
              })
            `,
        },
        {
          title: 'Shortcuts: $.get, $.post, $.getJSON',
          code: c`
            $.get('/api/products', { page: 2 }, data => render(data))
            $.getJSON('/api/products/42', product => show(product))
            $.post('/api/cart', { product_id: 42, qty: 1 }, res => updateCart(res))
            `,
          note: 'Shortcuts return the same promise-like object, so .done / .fail / .always work on them too.',
        },
        {
          title: 'Send JSON instead of form data',
          code: c`
            $.ajax({
              url: '/api/orders',
              method: 'POST',
              contentType: 'application/json',          // tell the server it is JSON
              data: JSON.stringify({ items: [{ id: 42, qty: 2 }], coupon: 'SALE10' }),
              dataType: 'json',
            }).done(order => console.log('created', order.id))
            `,
          note: 'Default jQuery sends application/x-www-form-urlencoded (like a normal form). Nested objects and arrays are easier to send as JSON.',
        },
        {
          title: 'PUT, PATCH and DELETE',
          code: c`
            $.ajax({ url: '/api/products/42', method: 'PUT', contentType: 'application/json', data: JSON.stringify({ price: 349 }) })
            $.ajax({ url: '/api/products/42', method: 'PATCH', data: { status: 'active' } })
            $.ajax({ url: '/api/products/42', method: 'DELETE' })
              .done(() => $('#product-42').fadeOut(200, function () { $(this).remove() }))
            `,
        },
        {
          title: 'Load HTML into an element',
          code: c`
            $('#sidebar').load('/partials/sidebar.html')
            $('#results').load('/products?page=2 #product-list')    // only part of the response

            // with a callback
            $('#table-wrap').load('/products?page=' + page, function (res, status, xhr) {
              if (status === 'error') $(this).text('Could not load (' + xhr.status + ')')
            })
            `,
        },
        {
          title: 'async / await with jQuery',
          code: c`
            async function loadProduct(id) {
              try {
                const product = await $.getJSON('/api/products/' + id)
                show(product)
              } catch (xhr) {
                console.error('failed', xhr.status)
              }
            }
            `,
          note: 'jQuery 3 request objects are thenables, so await works with them.',
        },
      ],
    },
    {
      id: 'utilities',
      title: 'Utilities & plugins',
      group: 'Utilities',
      items: [
        {
          title: 'Handy helpers',
          code: c`
            $.each([1, 2, 3], (i, n) => console.log(i, n))
            $.each({ a: 1, b: 2 }, (key, value) => console.log(key, value))
            $.extend({}, defaults, options)          // shallow merge (true as first arg = deep)
            $.trim('  hi  ')                         // deprecated: use '  hi  '.trim()
            $.isArray([])                            // deprecated: use Array.isArray([])
            $.param({ q: 'tee', page: 2 })           // "q=tee&page=2"
            `,
        },
        {
          title: 'Write a tiny plugin',
          code: c`
            $.fn.highlight = function (color = 'yellow') {
              return this.each(function () {           // return this → keeps chaining working
                $(this).css('background-color', color)
              })
            }

            $('.important').highlight().fadeIn()
            `,
        },
        {
          title: 'Popular plugins',
          note: 'Select2 / Tom Select (searchable dropdowns), jQuery Validation (form rules and messages), DataTables (sortable, searchable, paginated tables with server-side AJAX), Flatpickr (date picker), SweetAlert2 (nicer alerts; works without jQuery too). Load them after jQuery.',
        },
      ],
    },
    {
      id: 'vanilla',
      title: 'jQuery vs vanilla JavaScript',
      group: 'Utilities',
      items: [
        {
          title: 'Equivalents',
          lang: 'text',
          code: c`
            jQuery                                   Vanilla JS
            $('#id') / $('.cls')                     document.querySelector('#id') / querySelectorAll('.cls')
            $(el).text('x') / .html('<b>')           el.textContent = 'x' / el.innerHTML = '<b>'
            $(el).val()                              el.value
            $(el).addClass('a') / toggleClass        el.classList.add('a') / classList.toggle('a')
            $(el).attr('href') / .data('id')         el.getAttribute('href') / el.dataset.id
            $(el).on('click', fn)                    el.addEventListener('click', fn)
            $(parent).on('click', '.x', fn)          parent.addEventListener('click', e => e.target.closest('.x') && fn(e))
            $(el).closest('tr')                      el.closest('tr')
            $(el).append(child)                      el.append(child)
            $(el).remove()                           el.remove()
            $(el).hide() / .show()                   el.hidden = true / false
            $.getJSON(url)                           fetch(url).then(r => r.json())
            $.post(url, data)                        fetch(url, { method: 'POST', body: new FormData(form) })
            $(fn)                                    document.addEventListener('DOMContentLoaded', fn)
            `,
        },
        {
          title: 'When to use jQuery today',
          note: 'Great for server-rendered pages (Laravel Blade, Django templates, WordPress) that need a sprinkle of interactivity, for existing codebases, and when a plugin you need depends on it. For new single-page apps, React or Vue (see the React sheet) handle state and rendering better.',
        },
      ],
    },
  ],
}
