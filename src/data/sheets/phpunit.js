import { c } from './shared/code.js'

const GH = '${{' // GitHub Actions expression opener (avoids template interpolation)

export default {
  slug: 'phpunit',
  title: 'PHPUnit',
  tech: 'PHPUnit',
  category: 'testing',
  minutes: 35,
  lang: 'php',
  description: 'Testing PHP with PHPUnit 11/12 on PHP 8.3: setup and phpunit.xml, attributes, assertions, data providers, stubs and mocks, database tests, coverage with Xdebug or PCOV, Laravel feature tests, factories and fakes, a Pest comparison, CI on GitHub Actions and troubleshooting.',
  sections: [
    {
      id: 'project-setup',
      title: 'Project setup, step by step',
      group: 'Setup',
      items: [
        {
          title: '1. Install PHPUnit',
          lang: 'bash',
          code: c`
            # same on every OS (needs PHP + Composer; see the PHP sheet)
            composer require --dev phpunit/phpunit
            # pin a major explicitly if you need to:
            composer require --dev "phpunit/phpunit:^12.0"   # PHP 8.3+
            composer require --dev "phpunit/phpunit:^11.0"   # PHP 8.2+
            `,
          note: 'PHPUnit 12 needs PHP 8.3 and supports only attributes; docblock annotations like @test were deprecated in 11 and removed in 12. Check phpunit.de for the newest major and its PHP requirement before pinning.',
        },
        {
          title: '2. Autoload your tests (composer.json)',
          lang: 'json',
          code: c`
            {
              "autoload": {
                "psr-4": { "App\\": "src/" }
              },
              "autoload-dev": {
                "psr-4": { "Tests\\": "tests/" }
              },
              "scripts": {
                "test": "phpunit",
                "test:coverage": "phpunit --coverage-html coverage"
              }
            }
            `,
          then: [
            {
              label: 'Regenerate the autoloader after editing (same on every OS)',
              lang: 'bash',
              code: c`
                composer dump-autoload
                `,
            },
          ],
          note: 'Composer scripts find vendor/bin automatically, so composer test works the same on every OS.',
        },
        {
          title: '3. Generate phpunit.xml',
          lang: 'bash',
          code: c`
            # macOS / Linux
            ./vendor/bin/phpunit --generate-configuration

            # Windows (PowerShell or cmd)
            vendor\bin\phpunit --generate-configuration
            # or, on any OS:
            php vendor/bin/phpunit --generate-configuration
            `,
          note: 'Commit phpunit.xml.dist; a local phpunit.xml (git-ignored) takes priority when both exist. Old config? Run phpunit --migrate-configuration.',
        },
        {
          title: '4. phpunit.xml.dist',
          lang: 'xml',
          code: c`
            <?xml version="1.0" encoding="UTF-8"?>
            <phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
                     bootstrap="vendor/autoload.php"
                     cacheDirectory=".phpunit.cache"
                     colors="true"
                     executionOrder="depends,defects"
                     failOnRisky="true"
                     failOnWarning="true"
                     displayDetailsOnTestsThatTriggerDeprecations="true">
                <testsuites>
                    <testsuite name="Unit">
                        <directory>tests/Unit</directory>
                    </testsuite>
                    <testsuite name="Integration">
                        <directory>tests/Integration</directory>
                    </testsuite>
                </testsuites>

                <source>
                    <include>
                        <directory>src</directory>
                    </include>
                </source>

                <php>
                    <ini name="memory_limit" value="512M"/>
                    <env name="APP_ENV" value="testing" force="true"/>
                    <env name="DB_DSN" value="sqlite::memory:"/>
                </php>

                <coverage>
                    <report>
                        <html outputDirectory="coverage"/>
                        <text outputFile="php://stdout" showOnlySummary="true"/>
                    </report>
                </coverage>
            </phpunit>
            `,
          note: '<source> decides which files count for coverage and deprecation reporting. Add .phpunit.cache/ and coverage/ to .gitignore.',
        },
        {
          title: '5. First test',
          code: c`
            <?php
            // src/Calculator.php
            namespace App;

            final class Calculator
            {
                public function add(int $a, int $b): int
                {
                    return $a + $b;
                }
            }

            // tests/Unit/CalculatorTest.php
            namespace Tests\Unit;

            use App\Calculator;
            use PHPUnit\Framework\Attributes\CoversClass;
            use PHPUnit\Framework\TestCase;

            #[CoversClass(Calculator::class)]
            final class CalculatorTest extends TestCase
            {
                public function testAddsTwoNumbers(): void
                {
                    $calc = new Calculator();

                    $this->assertSame(5, $calc->add(2, 3));
                }
            }
            `,
          note: 'File name must match the class name and end in Test.php. Methods run as tests when they are public and start with test, or carry #[Test].',
        },
        {
          title: '6. Project layout',
          lang: 'text',
          code: c`
            my-app/
              composer.json
              phpunit.xml.dist
              src/                    # App\...
              tests/
                Unit/                 # Tests\Unit\...  fast, no I/O
                Integration/          # Tests\Integration\...  DB, files, HTTP
                Support/              # shared fakes, factories, base TestCase
              vendor/
            `,
        },
      ],
    },
    {
      id: 'running',
      title: 'Running tests',
      group: 'Setup',
      items: [
        {
          title: 'Run all / one file / one test',
          lang: 'bash',
          code: c`
            # macOS / Linux
            ./vendor/bin/phpunit                                   # everything in phpunit.xml
            ./vendor/bin/phpunit tests/Unit/CalculatorTest.php     # one file
            ./vendor/bin/phpunit tests/Unit                        # one folder
            ./vendor/bin/phpunit --filter testAddsTwoNumbers       # by method name (regex)
            ./vendor/bin/phpunit --filter 'CalculatorTest::testAdds'
            ./vendor/bin/phpunit --testsuite Unit
            `,
          then: [
            {
              label: 'Windows (PowerShell or cmd)',
              lang: 'powershell',
              code: c`
                vendor\bin\phpunit
                vendor\bin\phpunit tests\Unit\CalculatorTest.php
                vendor\bin\phpunit --filter "CalculatorTest::testAdds"
                vendor\bin\phpunit --testsuite Unit
                # or: php vendor/bin/phpunit ...
                `,
            },
          ],
        },
        {
          title: 'Useful flags',
          lang: 'bash',
          code: c`
            # same on every OS (prefix with ./vendor/bin/ or vendor\bin\)
            phpunit --testdox                 # readable list: "Calculator > Adds two numbers"
            phpunit --stop-on-failure         # stop at the first failure (also --stop-on-error, --stop-on-defect)
            phpunit --group slow              # only #[Group('slow')]
            phpunit --exclude-group slow
            phpunit --list-tests              # show what would run
            phpunit --order-by=random         # catch order-dependent tests
            phpunit --display-deprecations --display-warnings --display-notices
            phpunit --fail-on-risky --fail-on-warning
            phpunit --no-coverage             # skip coverage configured in phpunit.xml
            `,
        },
        {
          title: 'Composer scripts (same on every OS)',
          lang: 'bash',
          code: c`
            composer test
            composer test -- --filter CalculatorTest      # pass extra args after --
            composer test:coverage
            `,
        },
        {
          title: 'Re-run only failures',
          lang: 'bash',
          code: c`
            # same on every OS
            phpunit --order-by=defects --stop-on-defect
            `,
          note: 'With cacheDirectory set, PHPUnit remembers which tests failed last time; executionOrder="depends,defects" in phpunit.xml runs them first automatically.',
        },
        {
          title: 'Run in parallel (ParaTest)',
          lang: 'bash',
          code: c`
            # same on every OS
            composer require --dev brianium/paratest
            # macOS / Linux
            ./vendor/bin/paratest --processes=4
            # Windows
            vendor\bin\paratest --processes=4
            `,
          note: 'Each process needs its own database or files, otherwise parallel tests overwrite each other.',
        },
      ],
    },
    {
      id: 'test-anatomy',
      title: 'Test class anatomy',
      group: 'Writing tests',
      items: [
        {
          title: 'Naming and #[Test]',
          code: c`
            use PHPUnit\Framework\Attributes\Test;

            final class CartTest extends TestCase
            {
                public function testTotalIsZeroWhenEmpty(): void { /* ... */ }

                #[Test]
                public function total_includes_shipping(): void { /* ... */ }   // no "test" prefix needed

                #[Test]
                public function it_rejects_negative_quantities(): void { /* ... */ }
            }
            `,
          note: 'Name tests after behaviour, not methods. --testdox turns names into sentences, so testTotalIsZeroWhenEmpty prints as "Total is zero when empty".',
        },
        {
          title: 'Arrange, Act, Assert',
          code: c`
            public function testAppliesTenPercentDiscount(): void
            {
                // Arrange
                $cart = new Cart();
                $cart->add(new Product('Shirt', 1000), quantity: 2);

                // Act
                $cart->applyCoupon(new Coupon('SAVE10', percent: 10));

                // Assert
                $this->assertSame(1800, $cart->total());
            }
            `,
        },
        {
          title: 'setUp / tearDown and class-level hooks',
          code: c`
            final class CartTest extends TestCase
            {
                private Cart $cart;
                private static PDO $pdo;

                public static function setUpBeforeClass(): void   // once, before the first test in the class
                {
                    self::$pdo = new PDO('sqlite::memory:');
                }

                protected function setUp(): void                   // before EVERY test
                {
                    $this->cart = new Cart();
                }

                protected function tearDown(): void                // after every test, even failed ones
                {
                    unset($this->cart);
                }

                public static function tearDownAfterClass(): void  // once, after the last test
                {
                    // close connections, delete temp files
                }
            }
            `,
          note: 'Every test gets a fresh instance of the class, so properties set in setUp never leak between tests; static properties do.',
        },
        {
          title: 'Hook attributes (alternative to overriding)',
          code: c`
            use PHPUnit\Framework\Attributes\After;
            use PHPUnit\Framework\Attributes\Before;

            #[Before]
            protected function createTempDir(): void
            {
                $this->dir = sys_get_temp_dir() . '/test-' . bin2hex(random_bytes(4));
                mkdir($this->dir);
            }

            #[After]
            protected function removeTempDir(): void
            {
                array_map('unlink', glob($this->dir . '/*'));
                rmdir($this->dir);
            }
            `,
          note: 'Also available: #[BeforeClass] and #[AfterClass] on static methods. Useful in traits shared across test classes.',
        },
      ],
    },
    {
      id: 'assertions',
      title: 'Assertions cheat sheet',
      group: 'Writing tests',
      items: [
        {
          title: 'Most used assertions',
          lang: 'text',
          code: c`
            assertSame($expected, $actual)            === (type + value; same object for objects)
            assertEquals($expected, $actual)          == (loose; compares objects by property values)
            assertTrue($x) / assertFalse($x)          strictly true / false
            assertNull($x) / assertNotNull($x)
            assertEmpty($x) / assertNotEmpty($x)
            assertCount(3, $array)                    also Countable objects
            assertContains('red', $array)             strict (===) membership; assertContainsEquals is loose
            assertArrayHasKey('id', $array)
            assertInstanceOf(User::class, $x)
            assertIsArray / assertIsString / assertIsInt / assertIsBool / assertIsCallable
            assertGreaterThan(5, $x) / assertLessThanOrEqual(10, $x)
            assertStringContainsString('ok', $s)      assertStringStartsWith / assertStringEndsWith
            assertMatchesRegularExpression('/^\d{4}$/', $s)
            assertJson($s)                            valid JSON string
            assertJsonStringEqualsJsonString($a, $b)  ignores key order and whitespace
            assertFileExists($path) / assertDirectoryExists($path)
            assertEqualsWithDelta(0.3, $x, 0.0001)    floats
            assertEqualsCanonicalizing([1, 2], $x)    ignores order
            Every assertX has an assertNotX counterpart.
            `,
        },
        {
          title: 'assertSame vs assertEquals',
          code: c`
            $this->assertEquals(1, '1');              // passes: loose comparison
            $this->assertSame(1, '1');                // fails: int vs string

            $this->assertEquals(new Money(100), new Money(100));   // passes: same properties
            $this->assertSame(new Money(100), new Money(100));     // fails: different instances

            $this->assertSame(['a' => 1, 'b' => 2], ['b' => 2, 'a' => 1]);   // fails: key order matters
            $this->assertEquals(['a' => 1, 'b' => 2], ['b' => 2, 'a' => 1]); // passes
            `,
          note: 'Default to assertSame for scalars and arrays; use assertEquals for value objects or when order and types genuinely do not matter.',
        },
        {
          title: 'Arrays and collections',
          code: c`
            $user = ['id' => 7, 'name' => 'Ana', 'roles' => ['admin', 'editor']];

            $this->assertArrayHasKey('roles', $user);
            $this->assertContains('admin', $user['roles']);
            $this->assertCount(2, $user['roles']);
            $this->assertSame(['id' => 7, 'name' => 'Ana'], array_intersect_key($user, ['id' => 0, 'name' => 0]));
            $this->assertContainsOnlyInstancesOf(Product::class, $cart->items());
            `,
        },
        {
          title: 'Strings, regex and JSON',
          code: c`
            $this->assertStringContainsString('Welcome', $html);
            $this->assertStringContainsStringIgnoringCase('welcome', $html);
            $this->assertMatchesRegularExpression('/^INV-\d{6}$/', $invoice->number);
            $this->assertStringEqualsFile(__DIR__ . '/fixtures/email.txt', $body);

            $json = json_encode($api->user(7));
            $this->assertJson($json);
            $this->assertJsonStringEqualsJsonString('{"id":7,"name":"Ana"}', $json);
            `,
        },
        {
          title: 'Custom failure messages',
          code: c`
            $this->assertSame(200, $status, 'Health check should return 200 for ' . $url);
            $this->assertTrue($user->isActive(), "User $user->email should be active after verify()");
            `,
          note: 'Every assertion takes an optional last message argument, shown above the diff when it fails.',
        },
        {
          title: 'Fail explicitly',
          code: c`
            foreach ($rows as $row) {
                if ($row['total'] < 0) {
                    $this->fail('Negative total in row ' . $row['id']);
                }
            }
            $this->assertNotEmpty($rows);
            `,
        },
      ],
    },
    {
      id: 'exceptions',
      title: 'Exceptions, output and deprecations',
      group: 'Writing tests',
      items: [
        {
          title: 'expectException',
          code: c`
            public function testRejectsNegativeAmount(): void
            {
                $this->expectException(InvalidArgumentException::class);
                $this->expectExceptionMessage('Amount must be positive');   // substring match
                $this->expectExceptionCode(422);

                new Money(-5);   // the exception must be thrown AFTER the expectations
            }
            `,
          note: 'Code after the throwing line never runs, so put expectations first and the call last.',
        },
        {
          title: 'Regex message / inspect the exception',
          code: c`
            $this->expectExceptionMessageMatches('/order #\d+ not found/i');

            // need to assert on the exception object itself? catch it:
            try {
                $service->charge($order);
                $this->fail('Expected PaymentFailed');
            } catch (PaymentFailed $e) {
                $this->assertSame('card_declined', $e->reason);
            }
            `,
        },
        {
          title: 'Output and "no assertions" tests',
          code: c`
            public function testPrintsGreeting(): void
            {
                $this->expectOutputString("Hello Ana\n");
                (new Greeter())->greet('Ana');
            }

            public function testDoesNotThrow(): void
            {
                $this->expectNotToPerformAssertions();   // otherwise marked risky
                $this->logger->info('just must not crash');
            }
            `,
        },
        {
          title: 'Expect a deprecation',
          code: c`
            use PHPUnit\Framework\Attributes\IgnoreDeprecations;

            #[IgnoreDeprecations]
            public function testOldApiStillWorks(): void
            {
                $this->expectUserDeprecationMessage('legacyTotal() is deprecated');

                $this->assertSame(10, $cart->legacyTotal());
            }
            `,
          note: 'expectUserDeprecationMessage arrived in PHPUnit 11 and only covers E_USER_DEPRECATED from trigger_error(); verify against your version.',
        },
      ],
    },
    {
      id: 'data-providers',
      title: 'Data providers',
      group: 'Writing tests',
      items: [
        {
          title: '#[DataProvider] with named data sets',
          code: c`
            use PHPUnit\Framework\Attributes\DataProvider;

            final class SlugTest extends TestCase
            {
                public static function slugCases(): array      // must be public static
                {
                    return [
                        'lowercases'        => ['Hello', 'hello'],
                        'spaces to dashes'  => ['Hello World', 'hello-world'],
                        'strips symbols'    => ['C++ & PHP!', 'c-php'],
                        'trims dashes'      => ['  -Hi- ', 'hi'],
                    ];
                }

                #[DataProvider('slugCases')]
                public function testSlugify(string $input, string $expected): void
                {
                    $this->assertSame($expected, Str::slug($input));
                }
            }
            `,
          note: 'Named keys appear in failure output ("with data set "strips symbols"") and can be targeted with --filter "testSlugify@strips symbols".',
        },
        {
          title: 'Generator provider and named arguments',
          code: c`
            public static function invalidEmails(): iterable
            {
                yield 'missing @'    => ['email' => 'ana.example.com'];
                yield 'missing host' => ['email' => 'ana@'];
                yield 'spaces'       => ['email' => 'a na@example.com'];
            }

            #[DataProvider('invalidEmails')]
            public function testRejectsInvalidEmail(string $email): void
            {
                $this->assertFalse(EmailAddress::isValid($email));
            }
            `,
          note: 'String keys inside a data set are matched to parameter names (PHPUnit 11+); keep them in sync with the method signature.',
        },
        {
          title: '#[TestWith] for short inline cases',
          code: c`
            use PHPUnit\Framework\Attributes\TestWith;

            #[TestWith([2, 3, 5])]
            #[TestWith([-1, 1, 0])]
            #[TestWith([0, 0, 0], 'zeros')]          // optional data set name
            public function testAdd(int $a, int $b, int $sum): void
            {
                $this->assertSame($sum, (new Calculator())->add($a, $b));
            }
            `,
          note: 'Named data sets on TestWith are newer than the attribute itself; drop the second argument if your version rejects it.',
        },
        {
          title: 'Provider in another class',
          code: c`
            use PHPUnit\Framework\Attributes\DataProviderExternal;

            #[DataProviderExternal(CountryData::class, 'euCountries')]
            public function testVatApplies(string $countryCode): void
            {
                $this->assertTrue(Vat::appliesTo($countryCode));
            }
            `,
        },
      ],
    },
    {
      id: 'attributes',
      title: 'Groups, dependencies and skipping',
      group: 'Writing tests',
      items: [
        {
          title: '#[Group] and #[Depends]',
          code: c`
            use PHPUnit\Framework\Attributes\Depends;
            use PHPUnit\Framework\Attributes\Group;

            #[Group('slow')]
            #[Group('integration')]
            final class ReportExportTest extends TestCase
            {
                public function testCreatesQueue(): array
                {
                    $queue = [];
                    $this->assertEmpty($queue);
                    return $queue;               // passed to dependents
                }

                #[Depends('testCreatesQueue')]
                public function testPushes(array $queue): void
                {
                    $queue[] = 'job';
                    $this->assertCount(1, $queue);
                }
            }
            `,
          note: 'A dependent test is skipped when the test it depends on fails. Use dependencies sparingly; independent tests are easier to debug and parallelise.',
        },
        {
          title: 'Skip or mark incomplete at runtime',
          code: c`
            protected function setUp(): void
            {
                if (! extension_loaded('redis')) {
                    $this->markTestSkipped('The redis extension is not installed.');
                }
            }

            public function testExportsToPdf(): void
            {
                $this->markTestIncomplete('PDF export not finished yet.');
            }
            `,
        },
        {
          title: 'Requirement attributes',
          code: c`
            use PHPUnit\Framework\Attributes\RequiresOperatingSystemFamily;
            use PHPUnit\Framework\Attributes\RequiresPhp;
            use PHPUnit\Framework\Attributes\RequiresPhpExtension;

            #[RequiresPhp('>= 8.3')]
            #[RequiresPhpExtension('pdo_sqlite')]
            #[RequiresOperatingSystemFamily('Linux')]   // 'Windows', 'Darwin', 'Linux'
            public function testUsesTypedConstants(): void { /* ... */ }
            `,
          note: 'Unmet requirements skip the test with a reason instead of failing it.',
        },
        {
          title: 'Coverage attributes',
          code: c`
            use PHPUnit\Framework\Attributes\CoversClass;
            use PHPUnit\Framework\Attributes\CoversNothing;
            use PHPUnit\Framework\Attributes\UsesClass;

            #[CoversClass(InvoiceService::class)]
            #[UsesClass(Money::class)]          // used but not intentionally covered
            final class InvoiceServiceTest extends TestCase {}

            #[CoversNothing]                    // smoke test: counts for nothing in coverage
            final class SmokeTest extends TestCase {}
            `,
        },
        {
          title: 'Annotations to attributes',
          lang: 'text',
          code: c`
            Old docblock (PHPUnit <= 10)        Attribute (PHPUnit 11 / 12)
            @test                               #[Test]
            @dataProvider cases                 #[DataProvider('cases')]
            @depends testA                      #[Depends('testA')]
            @group slow                         #[Group('slow')]
            @covers \App\Foo                    #[CoversClass(Foo::class)]
            @requires PHP >= 8.3                #[RequiresPhp('>= 8.3')]
            @testWith [1, 2]                    #[TestWith([1, 2])]
            @before / @after                    #[Before] / #[After]
            All attributes live in the PHPUnit\Framework\Attributes namespace.
            `,
          note: 'Rector (rector/rector with its PHPUnit set) can convert annotations to attributes automatically.',
        },
      ],
    },
    {
      id: 'stubs',
      title: 'Stubs: canned answers',
      group: 'Test doubles',
      items: [
        {
          title: 'createStub + willReturn',
          code: c`
            interface ExchangeRates
            {
                public function rate(string $from, string $to): float;
            }

            public function testConvertsCurrency(): void
            {
                $rates = $this->createStub(ExchangeRates::class);
                $rates->method('rate')->willReturn(56.0);

                $converter = new Converter($rates);

                $this->assertSame(5600.0, $converter->convert(100, 'USD', 'PHP'));
            }
            `,
          note: 'A stub only returns values; it never fails a test. Stubbing an interface is the cleanest option because there is no real code underneath.',
        },
        {
          title: 'Return values: list, map, callback, exception',
          code: c`
            $repo = $this->createStub(UserRepository::class);

            // different value on each call
            $repo->method('nextId')->willReturn(1, 2, 3);
            $repo->method('nextId')->willReturnOnConsecutiveCalls(1, 2, 3);   // same thing

            // by arguments: [arg1, arg2, ..., returnValue]
            $repo->method('find')->willReturnMap([
                [1, new User(1, 'Ana')],
                [2, new User(2, 'Ben')],
            ]);

            // computed
            $repo->method('find')->willReturnCallback(fn (int $id) => new User($id, 'User ' . $id));

            // throw
            $repo->method('save')->willThrowException(new RuntimeException('DB down'));

            // fluent APIs
            $builder->method('where')->willReturnSelf();
            $mapper->method('identity')->willReturnArgument(0);
            `,
          note: 'willReturnMap returns null when no row matches the arguments, so include every combination the test triggers.',
        },
        {
          title: 'One-liner configured stub',
          code: c`
            $clock = $this->createConfiguredStub(Clock::class, [
                'now'      => new DateTimeImmutable('2026-01-15 09:00'),
                'timezone' => 'Asia/Manila',
            ]);
            `,
        },
        {
          title: 'Stub a class you cannot change',
          code: c`
            // only some methods replaced, the rest run for real
            $mailer = $this->createPartialMock(Mailer::class, ['transport']);
            $mailer->method('transport')->willReturn(new NullTransport());

            // full control
            $client = $this->getMockBuilder(ApiClient::class)
                ->disableOriginalConstructor()
                ->onlyMethods(['get'])
                ->getMock();
            `,
          note: 'final classes and final methods cannot be doubled; extract an interface or use a fake instead.',
        },
      ],
    },
    {
      id: 'mocks',
      title: 'Mocks: verify calls',
      group: 'Test doubles',
      items: [
        {
          title: 'expects()->method()->with()',
          code: c`
            public function testSendsWelcomeEmail(): void
            {
                $mailer = $this->createMock(Mailer::class);
                $mailer->expects($this->once())
                    ->method('send')
                    ->with('ana@example.com', $this->stringContains('Welcome'));

                (new Registration($mailer))->register('ana@example.com');
            }
            `,
          note: 'Use createMock only when the call itself is the behaviour under test; for return values use createStub. PHPUnit 12 removed expects() on stubs and may warn about mocks with no expectations, so pick deliberately.',
        },
        {
          title: 'Invocation counts and argument matchers',
          lang: 'text',
          code: c`
            $this->once()                      exactly one call
            $this->never()                     must not be called
            $this->exactly(3)                  exactly 3 calls
            $this->atLeastOnce() / atLeast(2) / atMost(2)
            $this->any()                       any number (avoid; use a stub)

            ->with('exact value')              === by default for scalars
            ->with($this->equalTo($obj))       == comparison
            ->with($this->anything())
            ->with($this->isInstanceOf(Order::class))
            ->with($this->stringContains('x'), $this->greaterThan(0))
            ->with($this->callback(fn (Order $o) => $o->total === 1800))
            `,
        },
        {
          title: 'Check a complex argument with callback',
          code: c`
            $gateway = $this->createMock(PaymentGateway::class);
            $gateway->expects($this->once())
                ->method('charge')
                ->with($this->callback(function (Charge $charge): bool {
                    $this->assertSame(1800, $charge->amount);   // asserts give clearer failures than return false
                    $this->assertSame('PHP', $charge->currency);
                    return true;
                }))
                ->willReturn(new Receipt('rcpt_1'));
            `,
        },
        {
          title: 'Consecutive calls with different arguments',
          code: c`
            // withConsecutive() was removed in PHPUnit 10. Alternative:
            $logger = $this->createMock(Logger::class);
            $matcher = $this->exactly(2);

            $logger->expects($matcher)
                ->method('info')
                ->willReturnCallback(function (string $message) use ($matcher): void {
                    match ($matcher->numberOfInvocations()) {
                        1 => $this->assertSame('Order received', $message),
                        2 => $this->assertSame('Order shipped', $message),
                    };
                });

            $service->process($order);
            `,
          note: 'If this gets awkward, a hand-written fake that records calls into an array is usually simpler to read.',
        },
        {
          title: 'Mock several interfaces at once',
          code: c`
            $cache = $this->createMockForIntersectionOfInterfaces([CacheInterface::class, Countable::class]);
            $cache->method('count')->willReturn(0);
            `,
        },
      ],
    },
    {
      id: 'fakes-mockery',
      title: 'Fakes and Mockery',
      group: 'Test doubles',
      items: [
        {
          title: 'Prefer in-memory fakes',
          code: c`
            // tests/Support/InMemoryUserRepository.php
            final class InMemoryUserRepository implements UserRepository
            {
                /** @var array<int, User> */
                private array $users = [];

                public function save(User $user): void
                {
                    $this->users[$user->id] = $user;
                }

                public function find(int $id): ?User
                {
                    return $this->users[$id] ?? null;
                }
            }

            // in a test
            $repo = new InMemoryUserRepository();
            (new RegisterUser($repo))->handle(7, 'ana@example.com');
            $this->assertSame('ana@example.com', $repo->find(7)?->email);
            `,
          note: 'Fakes test outcomes instead of call sequences, so refactoring the code under test does not break them. Reuse one fake across many tests.',
        },
        {
          title: 'Mockery (optional, used by Laravel)',
          lang: 'bash',
          code: c`
            # same on every OS
            composer require --dev mockery/mockery
            `,
          then: [
            {
              label: 'Usage',
              lang: 'php',
              code: c`
                use Mockery;
                use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;

                final class CheckoutTest extends TestCase
                {
                    use MockeryPHPUnitIntegration;   // verifies expectations and closes Mockery

                    public function testCharges(): void
                    {
                        $gateway = Mockery::mock(PaymentGateway::class);
                        $gateway->shouldReceive('charge')->once()->with(1800)->andReturn(true);

                        (new Checkout($gateway))->pay(1800);
                    }
                }
                `,
            },
          ],
        },
        {
          title: 'Which double when',
          lang: 'text',
          code: c`
            Need a return value only          → createStub / createConfiguredStub
            The call IS the behaviour         → createMock + expects()
            Repository, clock, mailer, queue  → in-memory fake you write once
            Third-party HTTP API              → fake client or recorded responses (Laravel: Http::fake)
            Value objects, DTOs               → use the real thing; never mock
            `,
        },
      ],
    },
    {
      id: 'db-tests',
      title: 'Database and integration tests',
      group: 'Database',
      items: [
        {
          title: 'SQLite in-memory PDO per test',
          code: c`
            namespace Tests\Integration;

            use PDO;
            use PHPUnit\Framework\Attributes\RequiresPhpExtension;
            use PHPUnit\Framework\TestCase;

            #[RequiresPhpExtension('pdo_sqlite')]
            final class PdoUserRepositoryTest extends TestCase
            {
                private PDO $pdo;

                protected function setUp(): void
                {
                    $this->pdo = new PDO('sqlite::memory:', options: [
                        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    ]);
                    $this->pdo->exec(file_get_contents(__DIR__ . '/../../database/schema.sql'));
                }

                public function testSavesAndFindsUser(): void
                {
                    $repo = new PdoUserRepository($this->pdo);
                    $repo->save(new User(null, 'ana@example.com'));

                    $this->assertSame('ana@example.com', $repo->findByEmail('ana@example.com')->email);
                }
            }
            `,
          note: 'A new :memory: database per test is fast and fully isolated. SQLite SQL differs from MySQL/PostgreSQL, so run critical queries against the real engine too.',
        },
        {
          title: 'Real database: roll back after each test',
          code: c`
            abstract class DatabaseTestCase extends TestCase
            {
                protected static PDO $pdo;

                public static function setUpBeforeClass(): void
                {
                    self::$pdo ??= new PDO(getenv('DB_DSN'), getenv('DB_USER'), getenv('DB_PASS'), [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    ]);
                }

                protected function setUp(): void
                {
                    self::$pdo->beginTransaction();
                }

                protected function tearDown(): void
                {
                    if (self::$pdo->inTransaction()) {
                        self::$pdo->rollBack();   // nothing a test writes survives
                    }
                }
            }
            `,
          note: 'Code that commits its own transactions or runs DDL (CREATE/ALTER, which auto-commits in MySQL) escapes the rollback; truncate tables instead for those tests.',
        },
        {
          title: 'Plain PHP factories for test data',
          code: c`
            // tests/Support/UserFactory.php
            final class UserFactory
            {
                private static int $seq = 0;

                public static function make(array $overrides = []): User
                {
                    $n = ++self::$seq;
                    $data = array_merge([
                        'name'  => 'User ' . $n,
                        'email' => "user$n@example.test",
                        'role'  => 'member',
                    ], $overrides);

                    return new User(null, $data['email'], $data['name'], $data['role']);
                }

                public static function create(UserRepository $repo, array $overrides = []): User
                {
                    $user = self::make($overrides);
                    $repo->save($user);
                    return $user;
                }
            }

            // usage
            $admin = UserFactory::create($repo, ['role' => 'admin']);
            `,
          note: 'Defaults keep tests short; overrides show only what matters to that test.',
        },
        {
          title: 'Keep slow tests separate',
          lang: 'bash',
          code: c`
            # same on every OS (prefix with ./vendor/bin/ or vendor\bin\)
            phpunit --testsuite Unit                  # fast feedback while coding
            phpunit --testsuite Integration           # before pushing / in CI
            phpunit --exclude-group slow
            `,
        },
      ],
    },
    {
      id: 'coverage-driver',
      title: 'Coverage drivers (Xdebug or PCOV)',
      group: 'Coverage',
      items: [
        {
          title: 'Check what is installed',
          lang: 'bash',
          code: c`
            # same on every OS
            php -v                        # shows "with Xdebug" when loaded
            php -m | grep -iE "xdebug|pcov"     # macOS / Linux
            php -m | findstr /i "xdebug pcov"   # Windows
            `,
          note: 'PCOV is much faster and only does line coverage. Xdebug also gives path/branch coverage and step debugging but slows every test run.',
        },
        {
          title: 'Install PCOV',
          lang: 'bash',
          code: c`
            # macOS (Homebrew PHP)
            pecl install pcov
            `,
          then: [
            {
              label: 'Linux (Ubuntu / Debian)',
              lang: 'bash',
              code: c`
                sudo apt install -y php-pcov
                # or for a specific version: sudo apt install -y php8.3-pcov
                `,
            },
            {
              label: 'Windows: download the DLL matching your PHP (version, TS/NTS, x64) from pecl.php.net/package/pcov into ext\\, then php.ini',
              lang: 'ini',
              code: c`
                extension=pcov
                pcov.enabled=1
                `,
            },
          ],
        },
        {
          title: 'Install Xdebug',
          lang: 'bash',
          code: c`
            # macOS (Homebrew PHP)
            pecl install xdebug
            `,
          then: [
            {
              label: 'Linux (Ubuntu / Debian)',
              lang: 'bash',
              code: c`
                sudo apt install -y php-xdebug
                `,
            },
            {
              label: 'Windows: paste php -i output into xdebug.org/wizard, download the DLL into ext\\, then php.ini',
              lang: 'ini',
              code: c`
                zend_extension=xdebug
                xdebug.mode=debug,coverage
                `,
            },
          ],
          note: 'Local PHP bundles such as Laragon and XAMPP often include php_xdebug.dll already; check php -m before installing.',
        },
        {
          title: 'Turn on Xdebug coverage mode',
          lang: 'bash',
          code: c`
            # macOS / Linux
            XDEBUG_MODE=coverage ./vendor/bin/phpunit --coverage-text

            # Windows (PowerShell)
            $env:XDEBUG_MODE = "coverage"; vendor\bin\phpunit --coverage-text

            # Windows (cmd)
            set XDEBUG_MODE=coverage && vendor\bin\phpunit --coverage-text

            # any OS, one-off
            php -d xdebug.mode=coverage vendor/bin/phpunit --coverage-text
            `,
          note: 'Without coverage in xdebug.mode, PHPUnit reports "No code coverage driver available" even though Xdebug is loaded.',
        },
      ],
    },
    {
      id: 'coverage-reports',
      title: 'Coverage reports',
      group: 'Coverage',
      items: [
        {
          title: 'Report formats',
          lang: 'bash',
          code: c`
            # same on every OS (prefix with ./vendor/bin/ or vendor\bin\)
            phpunit --coverage-text                     # summary in the terminal
            phpunit --coverage-html coverage            # open coverage/index.html
            phpunit --coverage-clover coverage.xml      # for Codecov, Coveralls, SonarQube
            phpunit --coverage-cobertura cobertura.xml  # for GitLab / Azure DevOps
            phpunit --log-junit junit.xml               # test results for CI dashboards
            `,
        },
        {
          title: 'Open the HTML report',
          lang: 'bash',
          code: c`
            # macOS
            open coverage/index.html
            # Linux
            xdg-open coverage/index.html
            # Windows
            start coverage\index.html
            `,
        },
        {
          title: 'Path and branch coverage',
          lang: 'bash',
          code: c`
            # needs Xdebug (PCOV cannot do this); same on every OS apart from setting XDEBUG_MODE
            XDEBUG_MODE=coverage ./vendor/bin/phpunit --path-coverage --coverage-html coverage
            `,
          note: 'Path coverage shows which if/else combinations ran, not just which lines. It is slow, so use it locally on a focused set of tests.',
        },
        {
          title: 'Strict coverage metadata',
          lang: 'xml',
          code: c`
            <phpunit requireCoverageMetadata="true"
                     beStrictAboutCoverageMetadata="true">
                <!-- every test class needs #[CoversClass] or #[CoversNothing] -->
            </phpunit>
            `,
          note: 'Without metadata, every line a test touches counts as covered, which inflates numbers for code that is only run, not tested.',
        },
        {
          title: 'Enforce a minimum in CI',
          lang: 'bash',
          code: c`
            # PHPUnit has no --min flag. Options:
            php artisan test --coverage --min=80        # Laravel
            ./vendor/bin/pest --coverage --min=80       # Pest
            # plain PHPUnit: write clover, then check it
            composer require --dev rregeer/phpunit-coverage-check
            ./vendor/bin/phpunit --coverage-clover clover.xml
            ./vendor/bin/coverage-check clover.xml 80
            `,
          note: 'The coverage-check package is third-party; any tool that reads clover.xml (Codecov status checks, SonarQube quality gates) works the same way.',
        },
      ],
    },
    {
      id: 'laravel-setup',
      title: 'Laravel: setup and running',
      group: 'Laravel',
      items: [
        {
          title: 'Create tests',
          lang: 'bash',
          code: c`
            # same on every OS
            php artisan make:test InvoiceTest              # tests/Feature/InvoiceTest.php (boots the app)
            php artisan make:test MoneyTest --unit         # tests/Unit/MoneyTest.php (plain PHPUnit TestCase)
            php artisan make:test InvoiceTest --pest       # Pest syntax
            `,
          note: 'Feature tests extend Tests\\TestCase and get the full framework (HTTP, DB, fakes). Unit tests extend PHPUnit\\Framework\\TestCase and cannot use facades or config().',
        },
        {
          title: 'php artisan test',
          lang: 'bash',
          code: c`
            # same on every OS
            php artisan test
            php artisan test --filter=InvoiceTest
            php artisan test tests/Feature/InvoiceTest.php
            php artisan test --testsuite=Feature
            php artisan test --stop-on-failure
            php artisan test --group=slow
            php artisan test --profile                    # list the 10 slowest tests
            php artisan test --coverage --min=80          # needs PCOV or Xdebug
            `,
          note: 'Any PHPUnit flag works too; ./vendor/bin/phpunit (vendor\\bin\\phpunit on Windows) runs the same tests without the Laravel output formatting.',
        },
        {
          title: 'Parallel testing',
          lang: 'bash',
          code: c`
            # same on every OS
            composer require --dev brianium/paratest
            php artisan test --parallel
            php artisan test --parallel --processes=4
            php artisan test --parallel --recreate-databases
            `,
          note: 'Laravel creates one test database per process (app_test_1, app_test_2, ...). With SQLite :memory: each process already has its own database.',
        },
        {
          title: 'phpunit.xml env for SQLite in memory',
          lang: 'xml',
          code: c`
            <php>
                <env name="APP_ENV" value="testing"/>
                <env name="APP_MAINTENANCE_DRIVER" value="file"/>
                <env name="BCRYPT_ROUNDS" value="4"/>
                <env name="CACHE_STORE" value="array"/>
                <env name="DB_CONNECTION" value="sqlite"/>
                <env name="DB_DATABASE" value=":memory:"/>
                <env name="MAIL_MAILER" value="array"/>
                <env name="QUEUE_CONNECTION" value="sync"/>
                <env name="SESSION_DRIVER" value="array"/>
                <env name="TELESCOPE_ENABLED" value="false"/>
            </php>
            `,
          note: 'Laravel ships these lines with the DB ones commented out; uncomment them. Real environment variables win over <env> unless you add force="true".',
        },
        {
          title: '.env.testing',
          lang: 'ini',
          code: c`
            # .env.testing (loaded instead of .env when APP_ENV=testing)
            APP_KEY=                    # filled by key:generate --env=testing below
            DB_CONNECTION=mysql
            DB_HOST=127.0.0.1
            DB_DATABASE=app_test
            DB_USERNAME=root
            DB_PASSWORD=
            `,
          then: [
            {
              label: 'Create the key and the test database (same on every OS)',
              lang: 'bash',
              code: c`
                php artisan key:generate --env=testing
                php artisan migrate --env=testing
                `,
            },
          ],
          note: 'Use .env.testing when tests must run against MySQL/PostgreSQL. Never point it at your development database: RefreshDatabase wipes it.',
        },
      ],
    },
    {
      id: 'laravel-http',
      title: 'Laravel: HTTP and feature tests',
      group: 'Laravel',
      items: [
        {
          title: 'Web routes',
          code: c`
            use App\Models\User;
            use Illuminate\Foundation\Testing\RefreshDatabase;
            use Tests\TestCase;

            final class DashboardTest extends TestCase
            {
                use RefreshDatabase;

                public function test_guests_are_redirected_to_login(): void
                {
                    $this->get('/dashboard')->assertRedirect('/login');
                }

                public function test_users_see_their_dashboard(): void
                {
                    $user = User::factory()->create(['name' => 'Ana']);

                    $this->actingAs($user)
                        ->get('/dashboard')
                        ->assertOk()
                        ->assertViewIs('dashboard')
                        ->assertSee('Welcome, Ana');
                }
            }
            `,
        },
        {
          title: 'JSON APIs',
          code: c`
            public function test_creates_an_invoice(): void
            {
                $user = User::factory()->create();

                $this->actingAs($user)
                    ->postJson('/api/invoices', ['amount' => 1800, 'currency' => 'PHP'])
                    ->assertCreated()
                    ->assertJsonPath('data.amount', 1800)
                    ->assertJsonPath('data.status', 'draft')
                    ->assertJsonStructure(['data' => ['id', 'amount', 'currency', 'created_at']]);
            }

            public function test_lists_invoices(): void
            {
                Invoice::factory()->count(3)->create();

                $this->getJson('/api/invoices')
                    ->assertOk()
                    ->assertJsonCount(3, 'data')
                    ->assertJsonFragment(['currency' => 'PHP'])
                    ->assertJsonMissing(['deleted_at' => null]);
            }
            `,
          note: 'getJson/postJson send Accept: application/json, so validation errors come back as 422 JSON instead of a redirect.',
        },
        {
          title: 'Fluent JSON assertions',
          code: c`
            use Illuminate\Testing\Fluent\AssertableJson;

            $this->getJson('/api/users/7')
                ->assertOk()
                ->assertJson(fn (AssertableJson $json) => $json
                    ->where('id', 7)
                    ->where('email', fn (string $email) => str_ends_with($email, '@example.com'))
                    ->has('roles', 2)
                    ->missing('password')
                    ->etc());   // allow other keys
            `,
        },
        {
          title: 'Status assertions',
          lang: 'text',
          code: c`
            assertOk()               200        assertCreated()          201
            assertAccepted()         202        assertNoContent()        204
            assertRedirect('/x')     3xx        assertRedirectToRoute('invoices.show', $invoice)
            assertBadRequest()       400        assertUnauthorized()     401
            assertForbidden()        403        assertNotFound()         404
            assertUnprocessable()    422        assertTooManyRequests()  429
            assertServerError()      5xx        assertStatus(418)        anything
            `,
        },
        {
          title: 'Session, cookies, headers, views',
          code: c`
            $this->withHeaders(['X-Tenant' => 'acme'])
                ->withCookie('locale', 'fil')
                ->post('/settings', ['theme' => 'dark'])
                ->assertRedirect('/settings')
                ->assertSessionHas('status', 'Settings saved')
                ->assertSessionHasNoErrors()
                ->assertCookie('theme', 'dark');

            $this->get('/invoices')
                ->assertViewHas('invoices', fn ($invoices) => $invoices->count() === 3)
                ->assertSeeInOrder(['INV-001', 'INV-002']);
            `,
        },
        {
          title: 'Authentication helpers',
          code: c`
            $this->actingAs($user);                     // web guard
            $this->actingAs($user, 'api');              // a specific guard

            // Sanctum token abilities
            use Laravel\Sanctum\Sanctum;
            Sanctum::actingAs($user, ['invoices:write']);

            $this->assertAuthenticated();
            $this->assertGuest();
            $this->assertAuthenticatedAs($user);
            `,
        },
        {
          title: 'Debug a failing response',
          code: c`
            $this->postJson('/api/invoices', $payload)
                ->dump()           // print the response body and keep going
                ->dumpHeaders()
                ->dumpSession()
                ->assertCreated();

            $this->withoutExceptionHandling();   // see the real exception instead of a 500 page
            `,
        },
      ],
    },
    {
      id: 'laravel-validation',
      title: 'Laravel: validation',
      group: 'Laravel',
      items: [
        {
          title: 'JSON validation errors',
          code: c`
            public function test_email_is_required(): void
            {
                $this->postJson('/api/users', ['name' => 'Ana'])
                    ->assertUnprocessable()
                    ->assertJsonValidationErrors(['email'])
                    ->assertJsonValidationErrorFor('email')
                    ->assertJsonMissingValidationErrors(['name']);
            }
            `,
        },
        {
          title: 'Form (web) validation errors',
          code: c`
            $this->from('/register')
                ->post('/register', ['email' => 'not-an-email'])
                ->assertRedirect('/register')
                ->assertSessionHasErrors(['email' => 'The email field must be a valid email address.'])
                ->assertInvalid(['password'])        // works for both session and JSON responses
                ->assertValid(['name']);
            `,
          note: 'Matching the exact message ties the test to your language files; asserting just the field name is usually enough.',
        },
        {
          title: 'One test, many invalid inputs',
          code: c`
            use PHPUnit\Framework\Attributes\DataProvider;

            public static function invalidPayloads(): array
            {
                return [
                    'missing email' => [['name' => 'Ana'], 'email'],
                    'bad email'     => [['name' => 'Ana', 'email' => 'nope'], 'email'],
                    'short name'    => [['name' => 'A', 'email' => 'a@b.co'], 'name'],
                ];
            }

            #[DataProvider('invalidPayloads')]
            public function test_rejects_invalid_users(array $payload, string $field): void
            {
                $this->postJson('/api/users', $payload)->assertJsonValidationErrors([$field]);
            }
            `,
          note: 'Providers run before the app boots, so do not call factories, config() or facades inside them; build plain arrays.',
        },
      ],
    },
    {
      id: 'laravel-db',
      title: 'Laravel: database and factories',
      group: 'Laravel',
      items: [
        {
          title: 'RefreshDatabase vs DatabaseTransactions',
          lang: 'text',
          code: c`
            RefreshDatabase        migrates once per run, then wraps each test in a transaction
                                   → default choice; works with SQLite :memory: and real DBs
            LazilyRefreshDatabase  same, but only for tests that actually touch the DB
            DatabaseTransactions   only wraps each test in a transaction; never migrates
                                   → when the schema already exists (php artisan migrate --env=testing)
            DatabaseMigrations     migrate:fresh before EVERY test → slow; for code that commits itself
            DatabaseTruncation     truncates tables instead (useful with Dusk / browser tests)
            `,
          then: [
            {
              label: 'Usage',
              lang: 'php',
              code: c`
                use Illuminate\Foundation\Testing\RefreshDatabase;

                final class InvoiceTest extends TestCase
                {
                    use RefreshDatabase;

                    protected $seed = true;                       // run DatabaseSeeder first
                    // protected $seeder = RolesSeeder::class;    // or one seeder
                }
                `,
            },
          ],
        },
        {
          title: 'Factories with states',
          code: c`
            // database/factories/UserFactory.php
            public function definition(): array
            {
                return [
                    'name'     => fake()->name(),
                    'email'    => fake()->unique()->safeEmail(),
                    'password' => 'password',              // hashed by the model cast
                    'role'     => 'member',
                ];
            }

            public function admin(): static
            {
                return $this->state(fn (array $attributes) => ['role' => 'admin']);
            }

            public function unverified(): static
            {
                return $this->state(['email_verified_at' => null]);
            }

            // in tests
            $user  = User::factory()->create();
            $admin = User::factory()->admin()->create(['name' => 'Root']);
            $draft = User::factory()->make();                 // not saved
            $users = User::factory()->count(5)->unverified()->create();
            `,
        },
        {
          title: 'Relationships and sequences',
          code: c`
            // has many: a user with 3 posts
            $user = User::factory()->has(Post::factory()->count(3))->create();
            $user = User::factory()->hasPosts(3)->create();               // magic method, same thing

            // belongs to: a post for a new (or existing) user
            $post = Post::factory()->for(User::factory()->admin())->create();
            $post = Post::factory()->for($user)->create();

            // many to many with pivot data
            $user = User::factory()->hasAttached(Team::factory()->count(2), ['role' => 'owner'])->create();

            // alternate values
            Invoice::factory()->count(4)->sequence(
                ['status' => 'paid'],
                ['status' => 'draft'],
            )->create();
            `,
        },
        {
          title: 'Database assertions',
          code: c`
            $this->assertDatabaseHas('invoices', ['user_id' => $user->id, 'amount' => 1800]);
            $this->assertDatabaseMissing('users', ['email' => 'deleted@example.com']);
            $this->assertDatabaseCount('invoices', 3);
            $this->assertDatabaseEmpty('jobs');

            $this->assertModelExists($invoice);
            $this->assertModelMissing($invoice);
            $this->assertSoftDeleted($invoice);
            $this->assertNotSoftDeleted($invoice);
            `,
        },
        {
          title: 'Count queries (catch N+1)',
          code: c`
            use Illuminate\Support\Facades\DB;

            DB::enableQueryLog();
            $this->getJson('/api/posts')->assertOk();
            $this->assertLessThanOrEqual(3, count(DB::getQueryLog()));
            `,
          note: 'Model::preventLazyLoading() in AppServiceProvider (non-production) also turns N+1 queries into exceptions during tests.',
        },
      ],
    },
    {
      id: 'laravel-fakes',
      title: 'Laravel: fakes',
      group: 'Laravel',
      items: [
        {
          title: 'Mail::fake',
          code: c`
            use App\Mail\OrderShipped;
            use Illuminate\Support\Facades\Mail;

            Mail::fake();

            $this->post('/orders/' . $order->id . '/ship');

            Mail::assertSent(OrderShipped::class, fn (OrderShipped $mail) => $mail->hasTo($order->user->email));
            Mail::assertSent(OrderShipped::class, 1);
            Mail::assertQueued(OrderShipped::class);   // when the mailable implements ShouldQueue
            Mail::assertNothingSent();
            `,
          note: 'Call fake() before the code under test runs; anything sent earlier is not recorded.',
        },
        {
          title: 'Queue::fake and Bus::fake',
          code: c`
            use Illuminate\Support\Facades\Bus;
            use Illuminate\Support\Facades\Queue;

            Queue::fake();
            $this->postJson('/api/reports', ['month' => '2026-09']);
            Queue::assertPushed(GenerateReport::class, fn ($job) => $job->month === '2026-09');
            Queue::assertPushedOn('reports', GenerateReport::class);
            Queue::assertNotPushed(SendInvoice::class);
            Queue::assertCount(1);

            // chains and batches
            Bus::fake();
            Bus::assertChained([ImportCsv::class, NotifyAdmin::class]);
            Bus::assertBatched(fn ($batch) => $batch->jobs->count() === 10);
            `,
          note: 'Test the job itself separately: (new GenerateReport("2026-09"))->handle(...) in its own test.',
        },
        {
          title: 'Event::fake',
          code: c`
            use Illuminate\Support\Facades\Event;

            Event::fake([OrderPlaced::class]);     // fake only these; other events still fire

            $this->postJson('/api/orders', $payload);

            Event::assertDispatched(OrderPlaced::class, fn ($e) => $e->order->total === 1800);
            Event::assertDispatchedTimes(OrderPlaced::class, 1);
            Event::assertNotDispatched(OrderCancelled::class);
            Event::assertListening(OrderPlaced::class, SendReceipt::class);
            `,
          note: 'A bare Event::fake() also stops model events (creating, saving), which breaks factories that rely on observers; pass a list of events instead.',
        },
        {
          title: 'Notification::fake',
          code: c`
            use Illuminate\Support\Facades\Notification;

            Notification::fake();

            $this->actingAs($user)->post('/invoices/' . $invoice->id . '/send');

            Notification::assertSentTo($invoice->customer, InvoiceSent::class,
                fn (InvoiceSent $n, array $channels) => in_array('mail', $channels));
            Notification::assertNotSentTo($user, InvoiceSent::class);
            Notification::assertCount(1);
            `,
        },
        {
          title: 'Storage::fake + UploadedFile::fake',
          code: c`
            use Illuminate\Http\UploadedFile;
            use Illuminate\Support\Facades\Storage;

            public function test_uploads_avatar(): void
            {
                Storage::fake('public');
                $file = UploadedFile::fake()->image('avatar.jpg', 400, 400)->size(300);   // KB

                $this->actingAs($user)
                    ->post('/profile/avatar', ['avatar' => $file])
                    ->assertRedirect();

                Storage::disk('public')->assertExists('avatars/' . $file->hashName());
            }

            // other files
            UploadedFile::fake()->create('report.pdf', 2048, 'application/pdf');
            `,
          note: 'image() needs the GD extension. Storage::fake writes to storage/framework/testing and clears it on the next fake.',
        },
        {
          title: 'Http::fake',
          code: c`
            use Illuminate\Http\Client\Request;
            use Illuminate\Support\Facades\Http;

            Http::preventStrayRequests();            // any un-faked URL throws instead of hitting the internet

            Http::fake([
                'api.github.com/users/*' => Http::response(['login' => 'ana', 'id' => 7], 200),
                'api.stripe.com/*'       => Http::response(['error' => 'card_declined'], 402),
            ]);

            $this->getJson('/api/github/ana')->assertOk()->assertJsonPath('login', 'ana');

            Http::assertSent(fn (Request $r) =>
                $r->url() === 'https://api.github.com/users/ana' && $r->hasHeader('Authorization'));
            Http::assertSentCount(1);
            `,
        },
        {
          title: 'Http::sequence and failures',
          code: c`
            Http::fake([
                'api.example.com/*' => Http::sequence()
                    ->push(['status' => 'pending'], 200)
                    ->push(['status' => 'pending'], 200)
                    ->push(['status' => 'done'], 200)
                    ->whenEmpty(Http::response(status: 500)),
            ]);

            // simulate a timeout / connection error
            Http::fake(['api.example.com/*' => Http::failedConnection()]);
            `,
          note: 'Good for testing retries and polling loops. Http::failedConnection is in recent Laravel versions only; older ones throw a ConnectionException from a closure instead.',
        },
        {
          title: 'Swap a service in the container',
          code: c`
            use Mockery\MockInterface;

            $this->mock(PaymentGateway::class, function (MockInterface $mock) {
                $mock->shouldReceive('charge')->once()->with(1800)->andReturn(new Receipt('rcpt_1'));
            });

            // or bind your own fake
            $this->app->instance(PaymentGateway::class, new FakePaymentGateway());

            // spy: assert afterwards
            $spy = $this->spy(AuditLog::class);
            $this->post('/orders', $payload);
            $spy->shouldHaveReceived('record')->once();
            `,
        },
      ],
    },
    {
      id: 'laravel-time-console',
      title: 'Laravel: time and console',
      group: 'Laravel',
      items: [
        {
          title: 'Time travel',
          code: c`
            public function test_trial_expires_after_14_days(): void
            {
                $user = User::factory()->create(['trial_ends_at' => now()->addDays(14)]);

                $this->travel(13)->days();
                $this->assertTrue($user->fresh()->onTrial());

                $this->travel(2)->days();
                $this->assertFalse($user->fresh()->onTrial());

                $this->travelTo(now()->setDate(2026, 12, 25)->setTime(9, 0));
                $this->travelBack();                  // back to real time
            }
            `,
          note: 'Laravel resets time after each test. Works for now(), Carbon::now() and today(), not for PHP time() or new DateTime().',
        },
        {
          title: 'Freeze time',
          code: c`
            $this->freezeTime();                      // now() stops moving
            $this->freezeSecond();                    // frozen at the start of the current second

            $this->freezeTime(function ($now) {
                $this->postJson('/api/posts', $payload);
                $this->assertDatabaseHas('posts', ['published_at' => $now]);
            });
            `,
        },
        {
          title: 'Artisan commands',
          code: c`
            public function test_sends_overdue_reminders(): void
            {
                Invoice::factory()->count(2)->overdue()->create();

                $this->artisan('invoices:remind', ['--dry-run' => true])
                    ->expectsQuestion('Which customers?', 'all')
                    ->expectsConfirmation('Send 2 reminders?', 'yes')
                    ->expectsOutput('Sent 2 reminders')
                    ->expectsOutputToContain('reminders')
                    ->doesntExpectOutput('Error')
                    ->assertSuccessful();             // or ->assertExitCode(0) / ->assertFailed()
            }
            `,
          note: 'Expectations run when the pending command is destroyed, so chain them all in one statement.',
        },
        {
          title: 'Scheduled tasks',
          lang: 'bash',
          code: c`
            # same on every OS
            php artisan schedule:list           # check what is scheduled and when
            php artisan schedule:test           # pick a scheduled command and run it now
            `,
          note: 'Test the command itself with $this->artisan(); the scheduler only decides when it runs.',
        },
      ],
    },
    {
      id: 'pest',
      title: 'Pest comparison',
      group: 'Pest',
      items: [
        {
          title: 'Install',
          lang: 'bash',
          code: c`
            # same on every OS
            composer remove phpunit/phpunit
            composer require pestphp/pest --dev --with-all-dependencies
            composer require pestphp/pest-plugin-laravel --dev     # Laravel helpers (optional)

            # macOS / Linux
            ./vendor/bin/pest --init
            ./vendor/bin/pest
            # Windows
            vendor\bin\pest --init
            vendor\bin\pest
            `,
          note: 'Pest is built on PHPUnit (Pest 3 on PHPUnit 11, Pest 4 on PHPUnit 12 with PHP 8.3+, as far as I know); check pestphp.com for the current pairing. New Laravel apps can choose Pest at install time.',
        },
        {
          title: 'Same test, both styles',
          code: c`
            // Pest: tests/Unit/CalculatorTest.php
            it('adds two numbers', function () {
                expect((new Calculator())->add(2, 3))->toBe(5);
            });

            test('division by zero throws', function () {
                (new Calculator())->divide(1, 0);
            })->throws(DivisionByZeroError::class);
            `,
          then: [
            {
              label: 'PHPUnit equivalent',
              lang: 'php',
              code: c`
                final class CalculatorTest extends TestCase
                {
                    public function testAddsTwoNumbers(): void
                    {
                        $this->assertSame(5, (new Calculator())->add(2, 3));
                    }

                    public function testDivisionByZeroThrows(): void
                    {
                        $this->expectException(DivisionByZeroError::class);
                        (new Calculator())->divide(1, 0);
                    }
                }
                `,
            },
          ],
        },
        {
          title: 'expect() API vs assertions',
          lang: 'text',
          code: c`
            expect($x)->toBe(5)                     assertSame(5, $x)
            expect($x)->toEqual($y)                 assertEquals($y, $x)
            expect($x)->toBeTrue() / toBeNull()     assertTrue / assertNull
            expect($list)->toHaveCount(3)           assertCount(3, $list)
            expect($list)->toContain('red')         assertContains('red', $list)
            expect($arr)->toHaveKey('id')           assertArrayHasKey('id', $arr)
            expect($u)->toBeInstanceOf(User::class) assertInstanceOf(User::class, $u)
            expect($s)->toMatch('/^\d+$/')          assertMatchesRegularExpression
            expect($s)->toBeJson()                  assertJson
            expect(fn () => f())->toThrow(E::class) expectException(E::class)
            expect($x)->not->toBeEmpty()            assertNotEmpty
            expect($a)->toBe(1)->and($b)->toBe(2)   chain several values
            `,
        },
        {
          title: 'Datasets',
          code: c`
            it('slugifies', function (string $input, string $expected) {
                expect(Str::slug($input))->toBe($expected);
            })->with([
                'lowercases'       => ['Hello', 'hello'],
                'spaces to dashes' => ['Hello World', 'hello-world'],
            ]);

            // shared dataset: tests/Datasets/Emails.php
            dataset('invalid emails', ['ana.example.com', 'ana@', 'a na@example.com']);

            it('rejects invalid emails', function (string $email) {
                expect(EmailAddress::isValid($email))->toBeFalse();
            })->with('invalid emails');
            `,
        },
        {
          title: 'Hooks, Laravel base class, filters',
          code: c`
            // tests/Pest.php
            pest()->extend(Tests\TestCase::class)
                ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
                ->in('Feature');
            // (Pest 2 style: uses(TestCase::class, RefreshDatabase::class)->in('Feature');)

            // in a test file
            beforeEach(function () {
                $this->user = User::factory()->create();
            });

            it('shows the dashboard', function () {
                $this->actingAs($this->user)->get('/dashboard')->assertOk();
            })->group('smoke');

            it('exports pdf')->todo();
            it('runs on linux only', fn () => expect(true)->toBeTrue())->skipOnWindows();
            `,
        },
        {
          title: 'Running and mixing with PHPUnit',
          lang: 'bash',
          code: c`
            # same on every OS (prefix with ./vendor/bin/ or vendor\bin\)
            pest --filter "slugifies"
            pest --group smoke
            pest --parallel
            pest --coverage --min=80
            pest --profile                     # slowest tests
            pest --dirty                       # only tests changed since the last commit
            php artisan test                   # Laravel runs Pest automatically when it is installed
            `,
          note: 'Existing PHPUnit test classes keep working under Pest, so you can migrate one file at a time. Do not run both phpunit and pest in CI; pest already runs everything.',
        },
        {
          title: 'Architecture tests (Pest only)',
          code: c`
            arch('no debugging leftovers')
                ->expect(['dd', 'dump', 'var_dump', 'ray'])
                ->not->toBeUsed();

            arch('controllers')
                ->expect('App\Http\Controllers')
                ->toHaveSuffix('Controller')
                ->not->toUse('Illuminate\Support\Facades\DB');

            arch()->preset()->laravel();
            `,
        },
      ],
    },
    {
      id: 'ci-php',
      title: 'CI: plain PHP project',
      group: 'CI',
      items: [
        {
          title: '.github/workflows/tests.yml',
          lang: 'yaml',
          code: c`
            name: Tests
            on:
              push:
                branches: [main]
              pull_request:

            permissions:
              contents: read

            jobs:
              phpunit:
                runs-on: ubuntu-latest
                strategy:
                  fail-fast: false
                  matrix:
                    php: ['8.3', '8.4']
                steps:
                  - uses: actions/checkout@v4

                  - uses: shivammathur/setup-php@v2
                    with:
                      php-version: ${GH} matrix.php }}
                      extensions: mbstring, pdo_sqlite
                      coverage: pcov            # or xdebug, or none (fastest)
                      tools: composer:v2

                  - name: Get Composer cache dir
                    id: composer-cache
                    run: echo "dir=$(composer config cache-files-dir)" >> $GITHUB_OUTPUT

                  - uses: actions/cache@v4
                    with:
                      path: ${GH} steps.composer-cache.outputs.dir }}
                      key: ${GH} runner.os }}-php${GH} matrix.php }}-composer-${GH} hashFiles('**/composer.lock') }}
                      restore-keys: ${GH} runner.os }}-php${GH} matrix.php }}-composer-

                  - run: composer install --no-interaction --prefer-dist --no-progress

                  - run: vendor/bin/phpunit --coverage-clover coverage.xml --log-junit junit.xml
            `,
          note: 'setup-php enables the chosen coverage driver for you, so no XDEBUG_MODE is needed with coverage: pcov.',
        },
        {
          title: 'Run on Windows and macOS runners too',
          lang: 'yaml',
          code: c`
            strategy:
              matrix:
                os: [ubuntu-latest, windows-latest, macos-latest]
                php: ['8.3']
            runs-on: ${GH} matrix.os }}
            steps:
              # ... same steps; on Windows use: php vendor/bin/phpunit
              - run: php vendor/bin/phpunit
            `,
          note: 'php vendor/bin/phpunit works on every runner, including Windows where the shell would not run vendor/bin/phpunit directly.',
        },
      ],
    },
    {
      id: 'ci-laravel',
      title: 'CI: Laravel with MySQL',
      group: 'CI',
      items: [
        {
          title: '.github/workflows/laravel.yml',
          lang: 'yaml',
          code: c`
            name: Laravel tests
            on: [push, pull_request]

            jobs:
              tests:
                runs-on: ubuntu-latest

                services:
                  mysql:
                    image: mysql:8.4
                    env:
                      MYSQL_ROOT_PASSWORD: password
                      MYSQL_DATABASE: app_test
                    ports: ['3306:3306']
                    options: >-
                      --health-cmd="mysqladmin ping -h 127.0.0.1 -ppassword"
                      --health-interval=10s --health-timeout=5s --health-retries=5

                env:
                  APP_ENV: testing
                  DB_CONNECTION: mysql
                  DB_HOST: 127.0.0.1
                  DB_PORT: 3306
                  DB_DATABASE: app_test
                  DB_USERNAME: root
                  DB_PASSWORD: password

                steps:
                  - uses: actions/checkout@v4

                  - uses: shivammathur/setup-php@v2
                    with:
                      php-version: '8.3'
                      extensions: mbstring, pdo_mysql, gd, bcmath
                      coverage: pcov

                  - name: Get Composer cache dir
                    id: composer-cache
                    run: echo "dir=$(composer config cache-files-dir)" >> $GITHUB_OUTPUT

                  - uses: actions/cache@v4
                    with:
                      path: ${GH} steps.composer-cache.outputs.dir }}
                      key: ${GH} runner.os }}-composer-${GH} hashFiles('**/composer.lock') }}
                      restore-keys: ${GH} runner.os }}-composer-

                  - run: composer install --no-interaction --prefer-dist --no-progress
                  - run: cp .env.example .env && php artisan key:generate

                  # assets, if any view tests render @vite:
                  # - run: npm ci && npm run build

                  - run: php artisan test --parallel --coverage --min=80
            `,
          note: 'Job-level env vars override phpunit.xml <env> values (unless those use force="true"), so the SQLite settings in phpunit.xml do not get in the way.',
        },
        {
          title: 'Faster: SQLite in CI',
          lang: 'yaml',
          code: c`
            # drop the mysql service and env block, keep phpunit.xml's sqlite :memory: settings
            - run: php artisan test --parallel
            `,
          note: 'Fine for most apps; keep a MySQL job if you use MySQL-only features (JSON columns, full-text search, specific collations).',
        },
      ],
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      group: 'Troubleshooting',
      items: [
        {
          title: 'Common errors',
          lang: 'text',
          code: c`
            Class "Tests\Unit\FooTest" not found  → autoload-dev "Tests\\": "tests/" + composer dump-autoload; check namespace and file name
            Class "App\Foo" not found             → bootstrap="vendor/autoload.php" in phpunit.xml; composer dump-autoload
            No code coverage driver available     → install PCOV or Xdebug; for Xdebug set XDEBUG_MODE=coverage
            This test did not perform any assertions (risky) → add an assertion or expectNotToPerformAssertions()
            Test passes alone, fails in the suite → shared state: statics, singletons, env vars, files, DB rows
            Deprecations / notices fail the run   → failOnDeprecation / failOnNotice in phpunit.xml; fix or --display-deprecations
            SQLSTATE: database is locked          → SQLite file shared by parallel runs; use :memory: or one file per process
            Allowed memory size exhausted         → memory_limit ini in phpunit.xml, or php -d memory_limit=1G
            Laravel tests hit the dev database    → php artisan config:clear (cached config ignores phpunit.xml env)
            Mock method not found / cannot double → class or method is final; double an interface instead
            Data provider "x" does not exist      → provider must be public static and named exactly in #[DataProvider('x')]
            Annotations ignored (@test, @dataProvider) → PHPUnit 12 reads attributes only; convert them
            `,
        },
        {
          title: 'Class not found',
          lang: 'bash',
          code: c`
            # same on every OS
            composer dump-autoload
            composer validate                    # catches broken composer.json
            php -r "require 'vendor/autoload.php'; var_dump(class_exists('Tests\Unit\CalculatorTest'));"
            `,
          note: 'PSR-4 is case-sensitive on Linux (and in CI) but not on macOS or Windows, so tests/unit vs Tests\\Unit can pass locally and fail on GitHub Actions.',
        },
        {
          title: 'Deprecations, notices and warnings',
          lang: 'xml',
          code: c`
            <phpunit failOnDeprecation="false"
                     failOnNotice="true"
                     failOnWarning="true"
                     displayDetailsOnTestsThatTriggerDeprecations="true"
                     displayDetailsOnTestsThatTriggerNotices="true"
                     displayDetailsOnTestsThatTriggerWarnings="true">
                <source ignoreIndirectDeprecations="true">   <!-- ignore deprecations raised inside vendor/ -->
                    <include><directory>src</directory></include>
                </source>
            </phpunit>
            `,
          note: 'Since PHPUnit 10, PHP errors no longer become exceptions; they are collected and reported, and these flags decide whether they fail the run.',
        },
        {
          title: 'Tests interfering with each other',
          code: c`
            protected function tearDown(): void
            {
                Registry::reset();                 // static caches / singletons
                putenv('FEATURE_X');               // unset env vars you changed
                date_default_timezone_set('UTC');
                restore_error_handler();           // PHPUnit 11 flags tests that leave handlers behind
                parent::tearDown();
            }
            `,
          then: [
            {
              label: 'Find order dependence (same on every OS)',
              lang: 'bash',
              code: c`
                ./vendor/bin/phpunit --order-by=random
                ./vendor/bin/phpunit --order-by=random --random-order-seed=1234   # reproduce a failing order
                `,
            },
          ],
        },
        {
          title: 'Slow test suite',
          lang: 'text',
          code: c`
            Use PCOV, or disable Xdebug when not measuring coverage (xdebug.mode=off)
            Skip coverage locally: --no-coverage
            SQLite :memory: + RefreshDatabase instead of migrating per test
            BCRYPT_ROUNDS=4 in phpunit.xml (Laravel) — hashing is slow by design
            Fake Mail, Queue, Http, Storage instead of real I/O
            Run in parallel: paratest / php artisan test --parallel / pest --parallel
            Find the slowest: php artisan test --profile, pest --profile, or --log-junit and sort by time
            `,
        },
        {
          title: 'Memory limit',
          lang: 'bash',
          code: c`
            # macOS / Linux
            php -d memory_limit=1G ./vendor/bin/phpunit
            # Windows
            php -d memory_limit=1G vendor\bin\phpunit
            `,
          note: 'For a permanent fix add <ini name="memory_limit" value="1G"/> inside <php> in phpunit.xml, and look for tests that keep large objects in static properties.',
        },
        {
          title: 'Laravel: stale config and caches',
          lang: 'bash',
          code: c`
            # same on every OS
            php artisan config:clear
            php artisan route:clear
            php artisan optimize:clear      # all of the above and more
            `,
          note: 'A cached config (bootstrap/cache/config.php) makes Laravel ignore phpunit.xml env values, which can point tests at your real database.',
        },
      ],
    },
  ],
}
