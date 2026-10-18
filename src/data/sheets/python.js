import { c } from './shared/code.js'

export default {
  slug: 'python',
  title: 'Python',
  tech: 'Python',
  category: 'backend',
  minutes: 40,
  lang: 'python',
  description: 'Python from setup to web APIs: virtual environments, syntax, data structures, functions, classes and files, then Django (ORM, views, forms, admin, REST Framework) and FastAPI (Pydantic, dependencies, auth, async, testing).',
  sections: [
    {
      id: 'project-setup',
      title: 'Project setup, step by step',
      group: 'Setup',
      items: [
        {
          title: '1. New project, start to finish',
          lang: 'bash',
          code: c`
            # macOS / Linux
            mkdir my-project && cd my-project
            python3 -m venv .venv
            source .venv/bin/activate
            pip install requests python-dotenv
            pip freeze > requirements.txt

            # Windows (PowerShell)
            mkdir my-project; cd my-project
            py -m venv .venv
            .venv\Scripts\Activate.ps1
            pip install requests python-dotenv
            pip freeze > requirements.txt
            `,
        },
        {
          title: '2. .gitignore',
          lang: 'text',
          code: c`
            .venv/
            __pycache__/
            *.pyc
            .env
            .pytest_cache/
            dist/
            `,
        },
        {
          title: '3. Project layout',
          lang: 'text',
          code: c`
            my-project/
              .venv/                # virtual environment (not committed)
              src/my_project/
                __init__.py
                main.py
              tests/
                test_main.py
              requirements.txt      # or pyproject.toml
              .env
            `,
        },
        {
          title: '4. Load settings from .env',
          lang: 'python',
          code: c`
            # .env
            # API_KEY=abc123

            import os
            from dotenv import load_dotenv

            load_dotenv()
            api_key = os.environ["API_KEY"]
            `,
        },
        {
          title: '5. Run your code',
          lang: 'bash',
          code: c`
            python main.py              # inside an active venv, on every OS
            python -m my_project.main   # run a module from the project root
            `,
        },
        {
          title: '6. VS Code: pick the venv interpreter',
          note: 'Install the "Python" extension, press Ctrl+Shift+P (Cmd+Shift+P on macOS) → "Python: Select Interpreter" → choose .venv. New terminals then activate it automatically.',
        },
      ],
    },
    {
      id: 'env',
      title: 'Install, virtual environments & packages',
      group: 'Setup',
      items: [
        {
          title: 'Install Python',
          lang: 'bash',
          code: c`
            # macOS
            brew install python@3.13

            # Linux (Ubuntu / Debian)
            sudo apt update && sudo apt install -y python3 python3-venv python3-pip

            # Windows (PowerShell)
            winget install -e --id Python.Python.3.13
            # or the python.org installer — tick "Add python.exe to PATH"

            # check
            python3 --version     # macOS / Linux
            py --version          # Windows (the "py" launcher)
            `,
          note: 'On macOS / Linux the command is usually python3. On Windows it is python or py.',
        },
        {
          title: 'Create a virtual environment',
          lang: 'bash',
          code: c`
            # macOS / Linux
            python3 -m venv .venv

            # Windows (PowerShell or cmd)
            py -m venv .venv
            `,
          note: 'Creates an isolated .venv folder for this project. Add .venv/ to .gitignore.',
        },
        {
          title: 'Activate / deactivate it',
          lang: 'bash',
          code: c`
            # macOS / Linux (bash / zsh)
            source .venv/bin/activate

            # Windows — PowerShell
            .venv\Scripts\Activate.ps1

            # Windows — Command Prompt (cmd)
            .venv\Scripts\activate.bat

            # Windows — Git Bash
            source .venv/Scripts/activate

            # any OS, when done
            deactivate
            `,
          note: 'Your prompt shows (.venv) while active, and python / pip then point inside the venv.',
        },
        {
          title: 'PowerShell says "running scripts is disabled"',
          lang: 'powershell',
          code: c`
            Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
            `,
          note: 'One-time fix on Windows so Activate.ps1 can run. Or use cmd and activate.bat instead.',
        },
        {
          title: 'Run without activating',
          lang: 'bash',
          code: c`
            # macOS / Linux
            .venv/bin/python main.py
            .venv/bin/pip install requests

            # Windows
            .venv\Scripts\python.exe main.py
            .venv\Scripts\pip.exe install requests
            `,
          note: 'Handy in scripts, cron jobs and systemd services.',
        },
        {
          title: 'Packages',
          lang: 'bash',
          code: c`
            # same on every OS once the venv is active
            pip install requests
            pip install -r requirements.txt
            pip freeze > requirements.txt
            python -m pip install --upgrade pip
            `,
        },
        {
          title: 'Environment variables for one session',
          lang: 'bash',
          code: c`
            # macOS / Linux
            export DATABASE_URL="sqlite:///db.sqlite3"

            # Windows — PowerShell
            $env:DATABASE_URL = "sqlite:///db.sqlite3"

            # Windows — cmd
            set DATABASE_URL=sqlite:///db.sqlite3
            `,
          note: 'Read them with os.environ["DATABASE_URL"] or os.getenv("DATABASE_URL", default). To load a .env file instead:',
          then: [
            {
              label: 'Install',
              lang: 'bash',
              code: c`
                pip install python-dotenv
                `,
            },
          ],
        },
        {
          title: 'Using uv (fast alternative)',
          lang: 'bash',
          code: c`
            uv init my-app
            uv add fastapi
            uv run main.py
            `,
        },
      ],
    },
    {
      id: 'basics',
      title: 'Basics',
      group: 'Language',
      items: [
        {
          title: 'Variables & f-strings',
          code: c`
            name = 'Kiel'
            total = 1234.5
            print(f'{name} owes {total:,.2f}')  # Kiel owes 1,234.50
            `,
        },
        {
          title: 'Conditionals',
          code: c`
            if amount > 1000:
                tier = 'large'
            elif amount > 100:
                tier = 'medium'
            else:
                tier = 'small'

            label = 'paid' if paid else 'due'
            `,
        },
        {
          title: 'Loops',
          code: c`
            for i, item in enumerate(items):
                print(i, item)

            for key, value in data.items():
                ...

            for a, b in zip(names, emails):
                ...
            `,
        },
        {
          title: 'match statement',
          code: c`
            match event['type']:
                case 'payment.succeeded':
                    handle_paid(event)
                case 'payment.failed' | 'payment.canceled':
                    handle_failed(event)
                case _:
                    pass
            `,
        },
      ],
    },
    {
      id: 'data',
      title: 'Data structures',
      group: 'Language',
      items: [
        {
          title: 'Lists',
          code: c`
            nums = [3, 1, 2]
            nums.append(4)
            nums.sort()
            first, *rest = nums
            nums[-1]      # last
            nums[1:3]     # slice
            `,
        },
        {
          title: 'Dicts',
          code: c`
            user = {'id': 1, 'email': 'a@b.com'}
            user.get('name', 'Unknown')
            user |= {'role': 'admin'}   # merge
            for k, v in user.items(): ...
            `,
        },
        {
          title: 'Sets & tuples',
          code: c`
            tags = {'php', 'js'}
            tags.add('py')
            point = (10, 20)  # immutable
            `,
        },
        {
          title: 'Comprehensions',
          code: c`
            squares = [n * n for n in range(10)]
            evens = [n for n in nums if n % 2 == 0]
            by_id = {u['id']: u for u in users}
            unique = {u['country'] for u in users}
            `,
        },
        {
          title: 'Handy helpers',
          code: c`
            from collections import Counter, defaultdict

            Counter(['a', 'b', 'a']).most_common(1)  # [('a', 2)]
            groups = defaultdict(list)
            for inv in invoices:
                groups[inv.status].append(inv)
            `,
        },
      ],
    },
    {
      id: 'functions',
      title: 'Functions',
      group: 'Language',
      items: [
        {
          title: 'Defaults & keyword args',
          code: c`
            def charge(amount: float, currency: str = 'PHP', *, retries: int = 3) -> str:
                ...

            charge(100, retries=5)
            `,
          note: 'Arguments after * must be passed by name.',
        },
        {
          title: '*args & **kwargs',
          code: c`
            def log(*args, **kwargs):
                print(args, kwargs)
            `,
        },
        {
          title: 'Lambdas & sorting',
          code: c`
            users.sort(key=lambda u: u['created_at'], reverse=True)
            sorted(items, key=lambda i: (i.priority, i.name))
            `,
        },
        {
          title: 'Decorator',
          code: c`
            import functools, time

            def timed(fn):
                @functools.wraps(fn)
                def wrapper(*args, **kwargs):
                    start = time.perf_counter()
                    result = fn(*args, **kwargs)
                    print(f'{fn.__name__} took {time.perf_counter() - start:.3f}s')
                    return result
                return wrapper
            `,
        },
      ],
    },
    {
      id: 'classes',
      title: 'Classes & typing',
      group: 'Language',
      items: [
        {
          title: 'Dataclass',
          code: c`
            from dataclasses import dataclass, field

            @dataclass
            class Invoice:
                id: int
                total: float
                tags: list[str] = field(default_factory=list)

                @property
                def with_tax(self) -> float:
                    return self.total * 1.12
            `,
        },
        {
          title: 'Regular class',
          code: c`
            class Gateway:
                def __init__(self, api_key: str):
                    self._api_key = api_key

                def __repr__(self):
                    return f"Gateway(key=***)"
            `,
        },
        {
          title: 'Type hints',
          code: c`
            from typing import Optional

            def find(id: int) -> Optional[dict]: ...
            def find2(id: int) -> dict | None: ...   # 3.10+
            Rates = dict[str, float]
            `,
        },
        {
          title: 'Enum',
          code: c`
            from enum import Enum

            class Status(str, Enum):
                PENDING = 'pending'
                PAID = 'paid'
            `,
        },
      ],
    },
    {
      id: 'io',
      title: 'Errors, files & HTTP',
      group: 'Files, errors & HTTP',
      items: [
        {
          title: 'Exceptions',
          code: c`
            try:
                result = risky()
            except (ValueError, KeyError) as e:
                log.warning('bad input: %s', e)
            except Exception:
                log.exception('unexpected')
                raise
            else:
                save(result)
            finally:
                cleanup()
            `,
        },
        {
          title: 'Files',
          code: c`
            from pathlib import Path

            text = Path('notes.txt').read_text()
            Path('out.txt').write_text('hello')

            with open('data.csv', newline='') as f:
                for row in csv.DictReader(f):
                    ...
            `,
        },
        {
          title: 'JSON',
          code: c`
            import json

            data = json.loads(raw)
            raw = json.dumps(data, indent=2, default=str)
            `,
        },
        {
          title: 'HTTP requests',
          code: c`
            import httpx

            r = httpx.get(url, headers={'Authorization': f'Bearer {token}'}, timeout=10)
            r.raise_for_status()
            data = r.json()
            `,
        },
        {
          title: 'Script entry point',
          code: c`
            def main():
                ...

            if __name__ == '__main__':
                main()
            `,
        },
      ],
    },
    {
      id: 'django-project-setup',
      title: 'Project setup, step by step',
      group: 'Django',
      items: [
        {
          title: '1. Create a folder and virtual environment',
          lang: 'bash',
          code: c`
            mkdir mysite && cd mysite

            # macOS / Linux
            python3 -m venv .venv
            source .venv/bin/activate

            # Windows — PowerShell
            py -m venv .venv
            .venv\Scripts\Activate.ps1

            # Windows — cmd
            py -m venv .venv
            .venv\Scripts\activate.bat
            `,
          note: 'Every python / manage.py command below assumes the venv is active (your prompt shows (.venv)).',
        },
        {
          title: '2. Install Django',
          lang: 'bash',
          code: c`
            pip install django
            pip freeze > requirements.txt
            python -m django --version
            `,
        },
        {
          title: '3. Start the project',
          lang: 'bash',
          code: c`
            django-admin startproject config .     # the dot = use the current folder
            `,
          note: 'Creates manage.py and a config/ package (settings.py, urls.py, wsgi.py, asgi.py).',
        },
        {
          title: '4. Create tables, an admin user, and run',
          lang: 'bash',
          code: c`
            python manage.py migrate
            python manage.py createsuperuser
            python manage.py runserver             # http://127.0.0.1:8000  and  /admin
            `,
        },
        {
          title: '5. Create an app',
          lang: 'bash',
          code: c`
            python manage.py startapp products
            `,
          note: 'Then add "products" to INSTALLED_APPS in config/settings.py.',
        },
        {
          title: '6. First view and URL',
          lang: 'python',
          code: c`
            # products/views.py
            from django.shortcuts import render
            from .models import Product

            def product_list(request):
                products = Product.objects.order_by("-created_at")[:20]
                return render(request, "products/list.html", {"products": products})

            # products/urls.py
            from django.urls import path
            from . import views

            app_name = "products"
            urlpatterns = [path("", views.product_list, name="list")]

            # config/urls.py
            from django.contrib import admin
            from django.urls import include, path

            urlpatterns = [
                path("admin/", admin.site.urls),
                path("products/", include("products.urls")),
            ]
            `,
        },
        {
          title: '7. First template',
          lang: 'html',
          code: c`
            <!-- products/templates/products/list.html -->
            <h1>Products</h1>
            <ul>
              {% for product in products %}
                <li>{{ product.name }} — {{ product.price }}</li>
              {% empty %}
                <li>No products yet.</li>
              {% endfor %}
            </ul>
            `,
        },
        {
          title: '8. Settings from environment variables',
          lang: 'python',
          code: c`
            # pip install django-environ
            # config/settings.py
            import environ

            env = environ.Env(DEBUG=(bool, False))
            environ.Env.read_env(BASE_DIR / ".env")

            SECRET_KEY = env("SECRET_KEY")
            DEBUG = env("DEBUG")
            ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])
            DATABASES = {"default": env.db("DATABASE_URL", default="sqlite:///" + str(BASE_DIR / "db.sqlite3"))}
            `,
          note: 'Generate a new SECRET_KEY:',
          then: [
            {
              label: 'Then run',
              lang: 'bash',
              code: c`
                python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
                `,
            },
          ],
        },
        {
          title: '9. Use MySQL or PostgreSQL',
          lang: 'bash',
          code: c`
            pip install mysqlclient           # MySQL   → DATABASE_URL=mysql://root:pass@127.0.0.1:3306/mysite
            pip install "psycopg[binary]"     # Postgres → DATABASE_URL=postgres://postgres:pass@127.0.0.1:5432/mysite
            `,
          note: 'mysqlclient needs build tools on macOS and Linux. Windows installs a prebuilt wheel, so there is nothing extra to do.',
          then: [
            {
              label: 'macOS',
              lang: 'bash',
              code: c`
                brew install mysql-client pkg-config
                `,
            },
            {
              label: 'Linux (Ubuntu / Debian)',
              lang: 'bash',
              code: c`
                sudo apt install -y default-libmysqlclient-dev build-essential pkg-config
                `,
            },
          ],
        },
        {
          title: '10. Project layout',
          lang: 'text',
          code: c`
            mysite/
              .venv/
              config/              # project settings & root urls
                settings.py  urls.py  wsgi.py  asgi.py
              products/            # an app
                migrations/  templates/products/
                admin.py  apps.py  models.py  views.py  urls.py  tests.py
              manage.py
              requirements.txt
              .env
            `,
        },
      ],
    },
    {
      id: 'django-manage',
      title: 'manage.py commands',
      group: 'Django',
      items: [
        {
          title: 'New project & app',
          lang: 'bash',
          code: c`
            pip install django
            django-admin startproject config .
            python manage.py startapp invoices
            `,
          note: 'Add "invoices" to INSTALLED_APPS in settings.py.',
        },
        {
          title: 'Run & migrate',
          lang: 'bash',
          code: c`
            python manage.py runserver
            python manage.py makemigrations
            python manage.py migrate
            python manage.py showmigrations
            `,
        },
        {
          title: 'Admin user & shell',
          lang: 'bash',
          code: c`
            python manage.py createsuperuser
            python manage.py shell
            python manage.py dbshell
            `,
        },
        {
          title: 'Static & checks',
          lang: 'bash',
          code: c`
            python manage.py collectstatic --noinput
            python manage.py check --deploy
            `,
        },
      ],
    },
    {
      id: 'django-settings',
      title: 'Settings',
      group: 'Django',
      items: [
        {
          title: 'Environment variables',
          code: c`
            import os

            SECRET_KEY = os.environ['DJANGO_SECRET_KEY']
            DEBUG = os.environ.get('DEBUG') == '1'
            ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')
            `,
        },
        {
          title: 'Database URL',
          code: c`
            # pip install dj-database-url
            import dj_database_url
            DATABASES = {'default': dj_database_url.config(default='sqlite:///db.sqlite3')}
            `,
        },
        {
          title: 'Run tests',
          lang: 'bash',
          code: c`
            python manage.py test
            python manage.py test invoices.tests.test_models
            `,
        },
      ],
    },
    {
      id: 'django-models',
      title: 'Models',
      group: 'Django',
      items: [
        {
          title: 'Define a model',
          code: c`
            from django.db import models

            class Invoice(models.Model):
                class Status(models.TextChoices):
                    DRAFT = 'draft'
                    PAID = 'paid'

                customer = models.ForeignKey('Customer', on_delete=models.CASCADE, related_name='invoices')
                total = models.DecimalField(max_digits=12, decimal_places=2)
                status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
                created_at = models.DateTimeField(auto_now_add=True)

                class Meta:
                    ordering = ['-created_at']
                    indexes = [models.Index(fields=['status'])]

                def __str__(self):
                    return f'Invoice #{self.pk}'
            `,
        },
        {
          title: 'Relationships',
          code: c`
            customer = models.ForeignKey(Customer, on_delete=models.PROTECT)
            profile = models.OneToOneField(User, on_delete=models.CASCADE)
            tags = models.ManyToManyField(Tag, blank=True)
            `,
        },
      ],
    },
    {
      id: 'django-orm',
      title: 'QuerySets',
      group: 'Django',
      items: [
        {
          title: 'Basic queries',
          code: c`
            Invoice.objects.all()
            Invoice.objects.filter(status='paid', total__gte=100)
            Invoice.objects.exclude(status='draft')
            Invoice.objects.get(pk=1)          # raises DoesNotExist
            Invoice.objects.filter(pk=1).first()  # or None
            `,
        },
        {
          title: 'Field lookups',
          code: c`
            filter(name__icontains='acme')
            filter(created_at__date=today)
            filter(created_at__year=2026)
            filter(customer__country='MX')   # across relations
            filter(id__in=[1, 2, 3])
            `,
        },
        {
          title: 'Create / update / delete',
          code: c`
            inv = Invoice.objects.create(customer=c, total=100)
            inv.status = 'paid'
            inv.save(update_fields=['status'])
            Invoice.objects.filter(status='draft').update(status='void')
            inv.delete()
            `,
        },
        {
          title: 'get_or_create & update_or_create',
          code: c`
            obj, created = Customer.objects.update_or_create(
                external_id=ext_id,
                defaults={'name': name, 'email': email},
            )
            `,
        },
        {
          title: 'Avoid N+1',
          code: c`
            Invoice.objects.select_related('customer')       # FK / one-to-one
            Customer.objects.prefetch_related('invoices')    # reverse / many-to-many
            `,
        },
        {
          title: 'Aggregates & Q / F',
          code: c`
            from django.db.models import Sum, Count, Q, F

            Invoice.objects.aggregate(total=Sum('total'))
            Customer.objects.annotate(n=Count('invoices')).filter(n__gt=5)
            Invoice.objects.filter(Q(status='paid') | Q(total=0))
            Product.objects.update(stock=F('stock') - 1)
            `,
        },
        {
          title: 'Transactions',
          code: c`
            from django.db import transaction

            with transaction.atomic():
                order.save()
                Payment.objects.create(order=order, amount=order.total)
            `,
        },
      ],
    },
    {
      id: 'django-views',
      title: 'Views & URLs',
      group: 'Django',
      items: [
        {
          title: 'Function view',
          code: c`
            from django.shortcuts import render, get_object_or_404

            def invoice_detail(request, pk):
                invoice = get_object_or_404(Invoice, pk=pk)
                return render(request, 'invoices/detail.html', {'invoice': invoice})
            `,
        },
        {
          title: 'URL patterns',
          code: c`
            # invoices/urls.py
            from django.urls import path
            from . import views

            app_name = 'invoices'
            urlpatterns = [
                path('', views.invoice_list, name='list'),
                path('<int:pk>/', views.invoice_detail, name='detail'),
            ]

            # config/urls.py
            path('invoices/', include('invoices.urls'))
            `,
        },
        {
          title: 'Class-based views',
          code: c`
            from django.views.generic import ListView
            from django.contrib.auth.mixins import LoginRequiredMixin

            class InvoiceList(LoginRequiredMixin, ListView):
                model = Invoice
                paginate_by = 20

                def get_queryset(self):
                    return super().get_queryset().filter(customer__owner=self.request.user)
            `,
        },
        {
          title: 'JSON & redirects',
          code: c`
            from django.http import JsonResponse
            from django.shortcuts import redirect

            return JsonResponse({'ok': True})
            return redirect('invoices:detail', pk=inv.pk)
            `,
        },
        {
          title: 'Templates',
          lang: 'django',
          code: c`
            {% extends 'base.html' %}
            {% block content %}
              {% for inv in invoices %}
                <a href="{% url 'invoices:detail' inv.pk %}">{{ inv }}</a>
              {% empty %}
                <p>No invoices.</p>
              {% endfor %}
            {% endblock %}
            `,
        },
      ],
    },
    {
      id: 'django-forms',
      title: 'Forms & admin',
      group: 'Django',
      items: [
        {
          title: 'ModelForm',
          code: c`
            from django import forms

            class InvoiceForm(forms.ModelForm):
                class Meta:
                    model = Invoice
                    fields = ['customer', 'total']

                def clean_total(self):
                    total = self.cleaned_data['total']
                    if total <= 0:
                        raise forms.ValidationError('Must be positive')
                    return total
            `,
        },
        {
          title: 'Handling a form',
          code: c`
            def create(request):
                form = InvoiceForm(request.POST or None)
                if form.is_valid():
                    form.save()
                    return redirect('invoices:list')
                return render(request, 'invoices/form.html', {'form': form})
            `,
        },
        {
          title: 'Register in admin',
          code: c`
            from django.contrib import admin

            @admin.register(Invoice)
            class InvoiceAdmin(admin.ModelAdmin):
                list_display = ['id', 'customer', 'total', 'status', 'created_at']
                list_filter = ['status']
                search_fields = ['customer__name']
            `,
        },
      ],
    },
    {
      id: 'django-drf',
      title: 'Django REST Framework',
      group: 'Django',
      items: [
        {
          title: 'Install',
          lang: 'bash',
          code: 'pip install djangorestframework',
          note: "Add 'rest_framework' to INSTALLED_APPS.",
        },
        {
          title: 'Serializer',
          code: c`
            from rest_framework import serializers

            class InvoiceSerializer(serializers.ModelSerializer):
                customer_name = serializers.CharField(source='customer.name', read_only=True)

                class Meta:
                    model = Invoice
                    fields = ['id', 'customer', 'customer_name', 'total', 'status']
            `,
        },
        {
          title: 'ViewSet + router',
          code: c`
            from rest_framework import viewsets, permissions
            from rest_framework.routers import DefaultRouter

            class InvoiceViewSet(viewsets.ModelViewSet):
                serializer_class = InvoiceSerializer
                permission_classes = [permissions.IsAuthenticated]

                def get_queryset(self):
                    return Invoice.objects.select_related('customer')

            router = DefaultRouter()
            router.register('invoices', InvoiceViewSet, basename='invoice')
            urlpatterns = router.urls
            `,
        },
        {
          title: 'Custom action',
          code: c`
            from rest_framework.decorators import action
            from rest_framework.response import Response

            @action(detail=True, methods=['post'])
            def mark_paid(self, request, pk=None):
                invoice = self.get_object()
                invoice.status = 'paid'
                invoice.save()
                return Response({'status': 'paid'})
            `,
        },
      ],
    },
    {
      id: 'fastapi-project-setup',
      title: 'Project setup, step by step',
      group: 'FastAPI',
      items: [
        {
          title: '1. Create a folder and virtual environment',
          lang: 'bash',
          code: c`
            mkdir my-api && cd my-api

            # macOS / Linux
            python3 -m venv .venv
            source .venv/bin/activate

            # Windows — PowerShell
            py -m venv .venv
            .venv\Scripts\Activate.ps1

            # Windows — cmd
            py -m venv .venv
            .venv\Scripts\activate.bat
            `,
        },
        {
          title: '2. Install FastAPI',
          lang: 'bash',
          code: c`
            pip install "fastapi[standard]" sqlalchemy pydantic-settings
            pip freeze > requirements.txt
            `,
          note: '"fastapi[standard]" includes Uvicorn, the fastapi CLI and common extras.',
        },
        {
          title: '3. Project layout',
          lang: 'text',
          code: c`
            my-api/
              app/
                __init__.py
                main.py            # create the app, include routers
                config.py          # settings from .env
                db.py              # engine, session, get_db
                models.py          # SQLAlchemy tables
                schemas.py         # Pydantic request / response models
                routers/
                  __init__.py
                  items.py
              tests/
              requirements.txt
              .env
            `,
          note: 'Create the empty __init__.py files so app is a package.',
        },
        {
          title: '4. app/main.py',
          lang: 'python',
          code: c`
            from fastapi import FastAPI
            from fastapi.middleware.cors import CORSMiddleware

            from app.routers import items

            app = FastAPI(title="My API")

            app.add_middleware(
                CORSMiddleware,
                allow_origins=["http://localhost:5173"],     # your frontend
                allow_methods=["*"],
                allow_headers=["*"],
            )

            app.include_router(items.router)

            @app.get("/health")
            def health():
                return {"ok": True}
            `,
        },
        {
          title: '5. Run it',
          lang: 'bash',
          code: c`
            fastapi dev app/main.py        # http://127.0.0.1:8000  (auto-reload)
            # docs: http://127.0.0.1:8000/docs  and  /redoc

            # equivalent with uvicorn
            uvicorn app.main:app --reload
            `,
        },
        {
          title: '6. Settings from .env',
          lang: 'python',
          code: c`
            # app/config.py
            from pydantic_settings import BaseSettings, SettingsConfigDict

            class Settings(BaseSettings):
                database_url: str = "sqlite:///./app.db"
                secret_key: str = "change-me"
                model_config = SettingsConfigDict(env_file=".env")

            settings = Settings()
            `,
        },
        {
          title: '7. Database session',
          lang: 'python',
          code: c`
            # app/db.py
            from sqlalchemy import create_engine
            from sqlalchemy.orm import DeclarativeBase, sessionmaker

            from app.config import settings

            engine = create_engine(settings.database_url, pool_pre_ping=True)
            SessionLocal = sessionmaker(bind=engine)

            class Base(DeclarativeBase):
                pass

            def get_db():
                db = SessionLocal()
                try:
                    yield db
                finally:
                    db.close()

            # create tables once at startup (use Alembic migrations for real projects):
            # Base.metadata.create_all(engine)
            `,
        },
        {
          title: '8. A router',
          lang: 'python',
          code: c`
            # app/routers/items.py
            from fastapi import APIRouter, Depends, HTTPException
            from sqlalchemy.orm import Session

            from app.db import get_db
            from app import models, schemas

            router = APIRouter(prefix="/items", tags=["items"])

            @router.get("/", response_model=list[schemas.ItemOut])
            def list_items(db: Session = Depends(get_db)):
                return db.query(models.Item).limit(50).all()

            @router.post("/", response_model=schemas.ItemOut, status_code=201)
            def create_item(data: schemas.ItemIn, db: Session = Depends(get_db)):
                item = models.Item(**data.model_dump())
                db.add(item)
                db.commit()
                db.refresh(item)
                return item

            @router.get("/{item_id}", response_model=schemas.ItemOut)
            def get_item(item_id: int, db: Session = Depends(get_db)):
                item = db.get(models.Item, item_id)
                if not item:
                    raise HTTPException(404, "Item not found")
                return item
            `,
        },
        {
          title: '9. Migrations with Alembic',
          lang: 'bash',
          code: c`
            pip install alembic
            alembic init migrations
            # set sqlalchemy.url (or read settings) in alembic.ini / migrations/env.py,
            # and target_metadata = Base.metadata in migrations/env.py
            alembic revision --autogenerate -m "create items"
            alembic upgrade head
            `,
        },
        {
          title: '10. Tests',
          lang: 'bash',
          code: c`
            pip install pytest
            pytest -q
            `,
          note: 'Use fastapi.testclient.TestClient(app) in tests (see the Testing section).',
        },
      ],
    },
    {
      id: 'fastapi-params',
      title: 'Parameters',
      group: 'FastAPI',
      items: [
        {
          title: 'Path & query',
          code: c`
            @app.get('/invoices/{invoice_id}')
            def get_invoice(invoice_id: int, expand: bool = False):
                ...
            `,
        },
        {
          title: 'Validation with Annotated',
          code: c`
            from typing import Annotated
            from fastapi import Query, Path

            @app.get('/invoices')
            def list_invoices(
                page: Annotated[int, Query(ge=1)] = 1,
                size: Annotated[int, Query(le=100)] = 20,
                q: Annotated[str | None, Query(max_length=50)] = None,
            ):
                ...
            `,
        },
        {
          title: 'Headers & cookies',
          code: c`
            from fastapi import Header, Cookie

            def endpoint(x_request_id: Annotated[str | None, Header()] = None):
                ...
            `,
          note: 'Underscores become hyphens: x_request_id reads the X-Request-Id header.',
        },
      ],
    },
    {
      id: 'fastapi-models',
      title: 'Pydantic models',
      group: 'FastAPI',
      items: [
        {
          title: 'Request & response schemas',
          code: c`
            from pydantic import BaseModel, Field, EmailStr

            class InvoiceIn(BaseModel):
                customer_email: EmailStr
                amount: float = Field(gt=0)
                currency: str = 'PHP'

            class InvoiceOut(BaseModel):
                id: int
                amount: float
                status: str
            `,
        },
        {
          title: 'Use them',
          code: c`
            @app.post('/invoices', response_model=InvoiceOut, status_code=201)
            def create_invoice(data: InvoiceIn):
                invoice = save(data.model_dump())
                return invoice
            `,
          note: 'response_model filters out any fields not declared on InvoiceOut.',
        },
        {
          title: 'Read from ORM objects',
          code: c`
            from pydantic import ConfigDict

            class InvoiceOut(BaseModel):
                model_config = ConfigDict(from_attributes=True)
                id: int
                amount: float
            `,
        },
        {
          title: 'Custom validator',
          code: c`
            from pydantic import field_validator

            class InvoiceIn(BaseModel):
                currency: str

                @field_validator('currency')
                @classmethod
                def upper(cls, v: str) -> str:
                    return v.upper()
            `,
        },
        {
          title: 'Partial updates',
          code: c`
            @app.patch('/invoices/{id}')
            def update(id: int, data: InvoiceUpdate):
                changes = data.model_dump(exclude_unset=True)
                ...
            `,
        },
      ],
    },
    {
      id: 'fastapi-deps',
      title: 'Dependencies',
      group: 'FastAPI',
      items: [
        {
          title: 'Simple dependency',
          code: c`
            from fastapi import Depends

            def pagination(page: int = 1, size: int = 20):
                return {'offset': (page - 1) * size, 'limit': size}

            @app.get('/items')
            def items(p: Annotated[dict, Depends(pagination)]):
                ...
            `,
        },
        {
          title: 'DB session with yield',
          code: c`
            from sqlalchemy.orm import Session

            def get_db():
                db = SessionLocal()
                try:
                    yield db
                finally:
                    db.close()

            DB = Annotated[Session, Depends(get_db)]

            @app.get('/invoices/{id}')
            def read(id: int, db: DB):
                return db.get(Invoice, id)
            `,
        },
        {
          title: 'Router-wide dependency',
          code: c`
            router = APIRouter(
                prefix='/admin',
                tags=['admin'],
                dependencies=[Depends(require_admin)],
            )
            app.include_router(router)
            `,
        },
      ],
    },
    {
      id: 'fastapi-auth',
      title: 'Errors & auth',
      group: 'FastAPI',
      items: [
        {
          title: 'Raise HTTP errors',
          code: c`
            from fastapi import HTTPException

            if not invoice:
                raise HTTPException(status_code=404, detail='Invoice not found')
            `,
        },
        {
          title: 'Bearer token dependency',
          code: c`
            from fastapi.security import OAuth2PasswordBearer

            oauth2 = OAuth2PasswordBearer(tokenUrl='token')

            def current_user(token: Annotated[str, Depends(oauth2)], db: DB):
                user = decode_and_load(token, db)
                if not user:
                    raise HTTPException(401, 'Invalid token', headers={'WWW-Authenticate': 'Bearer'})
                return user

            CurrentUser = Annotated[User, Depends(current_user)]
            `,
        },
        {
          title: 'Custom exception handler',
          code: c`
            from fastapi.responses import JSONResponse

            @app.exception_handler(GatewayError)
            async def gateway_error(request, exc: GatewayError):
                return JSONResponse(status_code=502, content={'error': str(exc)})
            `,
        },
        {
          title: 'CORS',
          code: c`
            from fastapi.middleware.cors import CORSMiddleware

            app.add_middleware(
                CORSMiddleware,
                allow_origins=['http://localhost:5173'],
                allow_methods=['*'],
                allow_headers=['*'],
            )
            `,
        },
      ],
    },
    {
      id: 'fastapi-async',
      title: 'Async & background work',
      group: 'FastAPI',
      items: [
        {
          title: 'async vs def',
          code: c`
            @app.get('/rates')
            async def rates():
                async with httpx.AsyncClient() as client:
                    r = await client.get(URL)
                return r.json()
            `,
          note: 'Use async def with async libraries; plain def endpoints run in a threadpool, which is fine for blocking code.',
        },
        {
          title: 'Background tasks',
          code: c`
            from fastapi import BackgroundTasks

            @app.post('/invoices')
            def create(data: InvoiceIn, tasks: BackgroundTasks):
                inv = save(data)
                tasks.add_task(send_email, inv.customer_email)
                return inv
            `,
        },
        {
          title: 'Startup & shutdown',
          code: c`
            from contextlib import asynccontextmanager

            @asynccontextmanager
            async def lifespan(app: FastAPI):
                app.state.http = httpx.AsyncClient()
                yield
                await app.state.http.aclose()

            app = FastAPI(lifespan=lifespan)
            `,
        },
        {
          title: 'Settings from env',
          code: c`
            from pydantic_settings import BaseSettings

            class Settings(BaseSettings):
                database_url: str
                stripe_key: str

            settings = Settings()  # reads env vars / .env
            `,
        },
      ],
    },
    {
      id: 'fastapi-testing',
      title: 'Testing',
      group: 'FastAPI',
      items: [
        {
          title: 'TestClient',
          code: c`
            from fastapi.testclient import TestClient
            from app.main import app

            client = TestClient(app)

            def test_health():
                r = client.get('/health')
                assert r.status_code == 200
                assert r.json() == {'ok': True}
            `,
        },
        {
          title: 'Override a dependency',
          code: c`
            def fake_user():
                return User(id=1, email='test@example.com')

            app.dependency_overrides[current_user] = fake_user
            `,
        },
        {
          title: 'Run',
          lang: 'bash',
          code: c`
            pip install pytest
            pytest -q
            `,
        },
      ],
    },
  ],
}
