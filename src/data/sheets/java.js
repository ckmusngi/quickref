import { c, BT } from './shared/code.js'

const GH = '${{' // GitHub Actions expression opener (avoids template interpolation)
const PH = '${' // Spring property placeholder opener, e.g. ${PH}DB_URL} renders as the real placeholder

export default {
  slug: 'java',
  title: 'Java',
  tech: 'Java',
  category: 'backend',
  minutes: 60,
  lang: 'java',
  description: 'Modern Java 21 (with Java 25 notes) from JDK setup to production: records, pattern matching, collections, streams, virtual threads, Maven and Gradle, then REST APIs with Spring Boot 3.5 (validation, ProblemDetail errors, Spring Data JPA, Flyway, Spring Security with JWT, testing with Testcontainers) and deployment with systemd, Nginx, Docker and GitHub Actions.',
  sections: [
    // ───────────────────────── Setup ─────────────────────────
    {
      id: 'install-jdk',
      title: 'Install the JDK',
      group: 'Setup',
      items: [
        {
          title: 'Install Java 21 (LTS)',
          lang: 'bash',
          code: c`
            # macOS (Homebrew)
            brew install openjdk@21
            # let /usr/libexec/java_home and IDEs find it:
            sudo ln -sfn "$(brew --prefix)/opt/openjdk@21/libexec/openjdk.jdk" /Library/Java/JavaVirtualMachines/openjdk-21.jdk
            # or the Eclipse Temurin build:  brew install --cask temurin@21

            # Linux (Ubuntu / Debian)
            sudo apt update && sudo apt install -y openjdk-21-jdk

            # Windows (PowerShell)
            winget install -e --id EclipseAdoptium.Temurin.21.JDK
            # or: winget install -e --id Microsoft.OpenJDK.21
            `,
          note: 'Java 21 and Java 25 are both LTS releases. Spring Boot 3.5 needs Java 17 or newer, so 21 is a safe default and 25 also works.',
        },
        {
          title: 'SDKMAN: several JDKs side by side (macOS / Linux)',
          lang: 'bash',
          code: c`
            curl -s "https://get.sdkman.io" | bash
            # open a new terminal, then:
            sdk list java                    # copy an exact identifier, e.g. 21.0.8-tem
            sdk install java 21.0.8-tem
            sdk install java 25-tem          # optional second JDK (use an id from the list)
            sdk use java 21.0.8-tem          # this shell only
            sdk default java 21.0.8-tem      # every new shell
            `,
          note: 'Identifiers change with every update, so always copy one from sdk list java. SDKMAN also sets JAVA_HOME for you.',
        },
        {
          title: 'Verify',
          lang: 'bash',
          code: c`
            # same on every OS
            java -version
            javac -version
            `,
          note: 'Both should print 21 (or 25). If javac is missing you installed a JRE, not a JDK.',
        },
        {
          title: 'Switch the default JDK on Linux',
          lang: 'bash',
          code: c`
            sudo update-alternatives --config java
            sudo update-alternatives --config javac
            ls /usr/lib/jvm/                  # installed JDKs
            `,
        },
      ],
    },
    {
      id: 'java-home',
      title: 'JAVA_HOME and PATH',
      group: 'Setup',
      items: [
        {
          title: 'Set JAVA_HOME permanently',
          lang: 'bash',
          code: c`
            # macOS: add to ~/.zshrc
            export JAVA_HOME=$(/usr/libexec/java_home -v 21)
            export PATH="$JAVA_HOME/bin:$PATH"

            # Linux (Ubuntu / Debian): add to ~/.bashrc
            export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64     # -arm64 on ARM machines
            export PATH="$JAVA_HOME/bin:$PATH"

            # reload
            source ~/.zshrc      # or: source ~/.bashrc
            `,
          then: [
            {
              label: 'Windows (PowerShell) — current user, then open a new terminal',
              lang: 'powershell',
              code: c`
                [Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot', 'User')
                # or with setx (also needs a new terminal):
                setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
                `,
            },
          ],
          note: 'On Windows, use the real folder name from C:\\Program Files\\Eclipse Adoptium (or Microsoft). The Temurin installer can also set JAVA_HOME for you if you tick that option.',
        },
        {
          title: 'Check it',
          lang: 'bash',
          code: c`
            # macOS / Linux
            echo $JAVA_HOME
            /usr/libexec/java_home -V          # macOS: list every installed JDK

            # Windows (PowerShell)
            $env:JAVA_HOME
            Get-Command java | Select-Object Source
            `,
        },
      ],
    },
    {
      id: 'build-tool-setup',
      title: 'Maven, Gradle & IDE',
      group: 'Setup',
      items: [
        {
          title: 'Maven or Gradle?',
          lang: 'text',
          code: c`
            Maven   pom.xml (XML), very common in Spring projects, predictable lifecycle
            Gradle  build.gradle.kts (Kotlin DSL), faster incremental builds, more flexible
            Both    Spring Initializr generates a wrapper (mvnw / gradlew) — use that
            `,
          note: 'The wrapper downloads the exact build-tool version the project expects, so nobody has to install Maven or Gradle globally.',
        },
        {
          title: 'Run the wrapper',
          lang: 'bash',
          code: c`
            # macOS / Linux
            ./mvnw -v
            ./gradlew -v

            # Windows (PowerShell)
            .\mvnw.cmd -v
            .\gradlew.bat -v
            `,
          note: 'If macOS / Linux says "permission denied", run chmod +x mvnw gradlew once (and commit it).',
        },
        {
          title: 'Install Maven / Gradle globally (optional)',
          lang: 'bash',
          code: c`
            # macOS
            brew install maven gradle

            # Linux (Ubuntu / Debian) — apt Gradle is often old; prefer SDKMAN
            sudo apt install -y maven
            sdk install gradle

            # Windows (PowerShell)
            winget install -e --id Apache.Maven
            winget install -e --id Gradle.Gradle
            `,
          note: 'Only needed to create a wrapper in a project that has none (mvn wrapper:wrapper or gradle wrapper).',
        },
        {
          title: 'IDE',
          note: 'IntelliJ IDEA (Community is free and handles Maven, Gradle and Spring Boot well) or VS Code with the "Extension Pack for Java" plus "Spring Boot Extension Pack". Open the folder that contains pom.xml or build.gradle.kts and let the IDE import it.',
        },
      ],
    },
    {
      id: 'first-program',
      title: 'First program & project layout',
      group: 'Setup',
      items: [
        {
          title: 'Hello.java',
          code: c`
            public class Hello {
                public static void main(String[] args) {
                    System.out.println("Hello, " + (args.length > 0 ? args[0] : "world"));
                }
            }
            `,
        },
        {
          title: 'Run a single file (no build tool)',
          lang: 'bash',
          code: c`
            # same on every OS (Java 11+ compiles in memory)
            java Hello.java Kiel

            # classic two steps
            javac Hello.java
            java Hello Kiel
            `,
          note: 'Java 22+ can also run a program spread over several source files with the same java Main.java command.',
        },
        {
          title: 'Java 25: compact source file',
          code: c`
            // Hello.java — no class, no static, no String[] (final in Java 25)
            void main() {
                IO.println("Hello from Java 25");
            }
            `,
          note: 'Great for scripts and learning. Real applications still use normal classes in packages.',
        },
        {
          title: 'Standard project layout',
          lang: 'text',
          code: c`
            demo/
              pom.xml                     # or build.gradle.kts + settings.gradle.kts
              mvnw, mvnw.cmd, .mvn/       # Maven wrapper (gradlew, gradlew.bat, gradle/ for Gradle)
              src/main/java/com/example/demo/
                DemoApplication.java
                product/                  # package by feature: controller, service, repository, DTOs
              src/main/resources/
                application.yml
                db/migration/             # Flyway SQL files
                static/  templates/
              src/test/java/com/example/demo/
              target/  or  build/         # build output (not committed)
            `,
          note: 'The package (com.example.demo) must match the folder path. Group code by feature rather than by layer once the app grows.',
        },
        {
          title: '.gitignore',
          lang: 'text',
          code: c`
            target/
            build/
            .gradle/
            .idea/
            *.iml
            .vscode/
            .env
            `,
        },
      ],
    },

    // ───────────────────────── Java language ─────────────────────────
    {
      id: 'lang-basics',
      title: 'Types, variables & strings',
      group: 'Java language',
      items: [
        {
          title: 'Primitive and common types',
          code: c`
            int count = 42;            // 32-bit; long for bigger: 42L
            double ratio = 0.75;       // never use double for money
            boolean active = true;
            char grade = 'A';
            String name = "Kiel";
            BigDecimal price = new BigDecimal("19.99");   // money: always from a String
            Integer boxed = null;      // wrapper types can be null, primitives cannot
            `,
        },
        {
          title: 'var (local type inference)',
          code: c`
            var users = new ArrayList<User>();      // type is ArrayList<User>
            var total = BigDecimal.ZERO;
            for (var entry : map.entrySet()) { ... }
            `,
          note: 'Only for local variables with an initializer. Fields, parameters and return types still need explicit types.',
        },
        {
          title: 'Strings',
          code: c`
            String s = "  Hello World  ";
            s.strip();                    // "Hello World" (Unicode-aware trim)
            s.isBlank();                  // false
            s.toLowerCase().contains("world");
            "a,b,c".split(",");           // ["a", "b", "c"]
            String.join(", ", List.of("x", "y"));
            "ab".repeat(3);               // "ababab"
            a.equals(b);                  // compare content — never a == b for strings
            "Total: %.2f %s".formatted(total, currency);   // String.format as a method
            `,
        },
        {
          title: 'Text blocks',
          code: c`
            String json = """
                {
                  "name": "%s",
                  "active": true
                }
                """.formatted(name);

            String sql = """
                SELECT id, email
                FROM users
                WHERE active = true
                """;
            `,
          note: 'The closing """ sets the indentation that gets stripped. String templates were a preview in Java 21–22 and were withdrawn, so use formatted() instead.',
        },
        {
          title: 'StringBuilder for loops',
          code: c`
            var sb = new StringBuilder();
            for (var item : items) {
                sb.append(item.name()).append('\n');
            }
            String out = sb.toString();
            `,
        },
      ],
    },
    {
      id: 'lang-control',
      title: 'Control flow & pattern matching',
      group: 'Java language',
      items: [
        {
          title: 'if, loops, ternary',
          code: c`
            if (amount.compareTo(LIMIT) > 0) { ... } else if (amount.signum() == 0) { ... } else { ... }

            for (int i = 0; i < items.size(); i++) { ... }
            for (var item : items) { ... }
            while (it.hasNext()) { ... }

            String label = paid ? "paid" : "due";
            `,
        },
        {
          title: 'switch expressions',
          code: c`
            int days = switch (month) {
                case FEBRUARY -> leap ? 29 : 28;
                case APRIL, JUNE, SEPTEMBER, NOVEMBER -> 30;
                default -> 31;
            };

            String msg = switch (status) {
                case "NEW" -> "Created";
                case "PAID" -> {
                    log.info("paid");
                    yield "Paid";          // yield returns a value from a block
                }
                default -> throw new IllegalArgumentException("Unknown " + status);
            };
            `,
          note: 'Arrow cases never fall through. A switch over an enum or sealed type with every case covered needs no default.',
        },
        {
          title: 'Pattern matching for instanceof',
          code: c`
            if (obj instanceof String s && !s.isBlank()) {
                System.out.println(s.length());     // s is already a String
            }
            `,
        },
        {
          title: 'Pattern matching in switch (Java 21)',
          code: c`
            String describe(Object o) {
                return switch (o) {
                    case null -> "null";
                    case Integer i when i > 100 -> "big int " + i;
                    case Integer i -> "int " + i;
                    case String s -> "string of length " + s.length();
                    case List<?> list -> "list of " + list.size();
                    default -> "something else";
                };
            }
            `,
        },
        {
          title: 'Record patterns',
          code: c`
            record Point(int x, int y) {}
            record Line(Point from, Point to) {}

            if (shape instanceof Line(Point(var x1, var y1), Point p2)) {
                System.out.println(x1 + "," + y1 + " → " + p2);
            }

            // unnamed pattern _ (Java 22+)
            case Line(Point from, _) -> "starts at " + from;
            `,
        },
      ],
    },
    {
      id: 'lang-oop',
      title: 'Classes, records, enums & sealed types',
      group: 'Java language',
      items: [
        {
          title: 'Class',
          code: c`
            public class Account {
                private final String id;
                private BigDecimal balance = BigDecimal.ZERO;

                public Account(String id) {
                    this.id = Objects.requireNonNull(id);
                }

                public void deposit(BigDecimal amount) {
                    if (amount.signum() <= 0) throw new IllegalArgumentException("amount must be positive");
                    balance = balance.add(amount);
                }

                public BigDecimal getBalance() { return balance; }
            }
            `,
          note: 'Keep fields private and final where possible; expose behaviour, not setters for everything.',
        },
        {
          title: 'Records (immutable data carriers)',
          code: c`
            public record Money(BigDecimal amount, String currency) {
                public Money {                          // compact constructor: validate
                    Objects.requireNonNull(amount);
                    if (currency.length() != 3) throw new IllegalArgumentException("ISO code");
                }
                public Money plus(Money other) {
                    return new Money(amount.add(other.amount), currency);
                }
            }

            var m = new Money(new BigDecimal("10.00"), "EUR");
            m.amount();        // accessor (no "get" prefix)
            `,
          note: 'Records get equals, hashCode and toString for free. Use them for DTOs, value objects and API requests/responses, not for JPA entities.',
        },
        {
          title: 'Interfaces',
          code: c`
            public interface PaymentGateway {
                PaymentResult charge(Money amount, String token);

                default boolean supports(String currency) {     // default method
                    return true;
                }

                static PaymentGateway noop() {                  // static factory
                    return (amount, token) -> PaymentResult.ok();
                }
            }
            `,
        },
        {
          title: 'Enums with fields',
          code: c`
            public enum OrderStatus {
                NEW("New"), PAID("Paid"), SHIPPED("Shipped");

                private final String label;
                OrderStatus(String label) { this.label = label; }
                public String label() { return label; }
            }

            OrderStatus.valueOf("PAID");     // IllegalArgumentException if unknown
            OrderStatus.values();
            `,
        },
        {
          title: 'Sealed interfaces + exhaustive switch',
          code: c`
            public sealed interface PaymentEvent permits Succeeded, Failed, Refunded {}
            public record Succeeded(String id, BigDecimal amount) implements PaymentEvent {}
            public record Failed(String id, String reason) implements PaymentEvent {}
            public record Refunded(String id) implements PaymentEvent {}

            String handle(PaymentEvent e) {
                return switch (e) {                     // no default: compiler checks every case
                    case Succeeded s -> "ok " + s.amount();
                    case Failed f -> "failed: " + f.reason();
                    case Refunded r -> "refunded";
                };
            }
            `,
          note: 'Adding a new permitted type makes every non-exhaustive switch fail to compile, which is exactly what you want.',
        },
      ],
    },
    {
      id: 'lang-generics',
      title: 'Generics',
      group: 'Java language',
      items: [
        {
          title: 'Generic class and method',
          code: c`
            public record Page<T>(List<T> items, long total) {}

            public static <T> T firstOrDefault(List<T> list, T fallback) {
                return list.isEmpty() ? fallback : list.getFirst();
            }
            `,
        },
        {
          title: 'Bounded types & wildcards',
          code: c`
            <T extends Comparable<T>> T max(List<T> list) { ... }

            double sum(List<? extends Number> nums) { ... }   // read from it (producer)
            void fill(List<? super Integer> out) { ... }      // write into it (consumer)
            `,
          note: 'Rule of thumb, PECS: Producer Extends, Consumer Super.',
        },
      ],
    },
    {
      id: 'lang-collections',
      title: 'Collections',
      group: 'Java language',
      items: [
        {
          title: 'Immutable factories',
          code: c`
            List<String> roles = List.of("USER", "ADMIN");
            Set<String> tags = Set.of("new", "sale");
            Map<String, Integer> stock = Map.of("apple", 3, "pear", 5);
            Map<String, Integer> big = Map.ofEntries(Map.entry("a", 1), Map.entry("b", 2));
            List<String> copy = List.copyOf(mutableList);
            `,
          note: 'These throw on add/put and reject null elements. Wrap in new ArrayList<>(...) when you need to modify.',
        },
        {
          title: 'Mutable collections',
          code: c`
            List<String> names = new ArrayList<>();
            names.add("Ana");
            names.remove("Ana");
            names.removeIf(n -> n.isBlank());

            Map<String, Integer> counts = new HashMap<>();
            counts.put("a", 1);
            counts.getOrDefault("b", 0);
            counts.merge("a", 1, Integer::sum);                 // increment
            counts.computeIfAbsent("list", k -> new ArrayList<>());

            Set<String> seen = new HashSet<>();
            Map<String, Integer> ordered = new LinkedHashMap<>();   // keeps insertion order
            Map<String, Integer> sorted = new TreeMap<>();          // sorted by key
            Deque<Task> queue = new ArrayDeque<>();
            `,
        },
        {
          title: 'Iterate',
          code: c`
            for (String n : names) { ... }
            names.forEach(System.out::println);
            map.forEach((key, value) -> System.out.println(key + "=" + value));
            for (var e : map.entrySet()) { e.getKey(); e.getValue(); }
            `,
          note: 'Removing elements inside a for-each loop throws ConcurrentModificationException; use removeIf or an Iterator.',
        },
        {
          title: 'Sort with Comparator',
          code: c`
            users.sort(Comparator.comparing(User::lastName)
                    .thenComparing(User::firstName)
                    .thenComparing(User::createdAt, Comparator.reverseOrder()));

            List<User> sorted = users.stream()
                    .sorted(Comparator.comparingInt(User::age).reversed())
                    .toList();
            `,
        },
        {
          title: 'Sequenced collections (Java 21)',
          code: c`
            list.getFirst();
            list.getLast();
            list.reversed();          // reversed view
            linkedHashMap.firstEntry();
            linkedHashSet.addFirst("x");
            `,
        },
      ],
    },
    {
      id: 'lang-streams',
      title: 'Streams',
      group: 'Java language',
      items: [
        {
          title: 'map / filter / collect',
          code: c`
            List<String> emails = users.stream()
                    .filter(User::active)
                    .map(User::email)
                    .map(String::toLowerCase)
                    .distinct()
                    .toList();                    // Java 16+, unmodifiable

            BigDecimal total = orders.stream()
                    .map(Order::amount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long count = users.stream().filter(u -> u.age() >= 18).count();
            boolean anyAdmin = users.stream().anyMatch(User::isAdmin);
            Optional<User> first = users.stream().filter(u -> u.email().equals(email)).findFirst();
            `,
        },
        {
          title: 'Collectors: groupingBy, toMap, joining',
          code: c`
            Map<OrderStatus, List<Order>> byStatus =
                    orders.stream().collect(Collectors.groupingBy(Order::status));

            Map<String, Long> countByCountry =
                    users.stream().collect(Collectors.groupingBy(User::country, Collectors.counting()));

            Map<Long, User> byId =
                    users.stream().collect(Collectors.toMap(User::id, Function.identity()));

            Map<Boolean, List<User>> split =
                    users.stream().collect(Collectors.partitioningBy(User::active));

            String csv = names.stream().collect(Collectors.joining(", ", "[", "]"));
            `,
          note: 'toMap throws on duplicate keys; pass a merge function as the third argument if keys can repeat.',
        },
        {
          title: 'Numbers, ranges, flatMap',
          code: c`
            IntStream.rangeClosed(1, 5).sum();                          // 15
            int maxAge = users.stream().mapToInt(User::age).max().orElse(0);
            double avg = users.stream().mapToInt(User::age).average().orElse(0);

            List<String> allTags = posts.stream()
                    .flatMap(p -> p.tags().stream())
                    .toList();
            `,
        },
      ],
    },
    {
      id: 'lang-optional',
      title: 'Optional & null-safety',
      group: 'Java language',
      items: [
        {
          title: 'Optional',
          code: c`
            Optional<User> user = repo.findByEmail(email);

            User u = user.orElseThrow(() -> new NotFoundException("No user " + email));
            String name = user.map(User::name).orElse("guest");
            user.ifPresent(x -> log.info("found {}", x.id()));
            user.ifPresentOrElse(this::greet, this::signUp);
            Optional.ofNullable(maybeNull).filter(s -> !s.isBlank());
            `,
          note: 'Use Optional as a return type for "may be missing". Avoid it for fields and parameters, and never call get() without checking.',
        },
        {
          title: 'Null-safety habits',
          code: c`
            this.name = Objects.requireNonNull(name, "name");          // fail fast in constructors
            Objects.requireNonNullElse(input, "default");
            "ADMIN".equals(role);                                       // constant first: no NPE when role is null
            List<String> safe = items == null ? List.of() : items;      // return empty collections, not null
            `,
          note: 'Spring Framework 7 / Boot 4 annotate their APIs with JSpecify @Nullable / @NonNull, so IDEs and tools like NullAway can warn you at compile time.',
        },
      ],
    },
    {
      id: 'lang-exceptions',
      title: 'Exceptions',
      group: 'Java language',
      items: [
        {
          title: 'try / catch / finally',
          code: c`
            try {
                process(file);
            } catch (FileNotFoundException e) {
                log.warn("missing {}", file);
            } catch (IOException | ParseException e) {          // multi-catch
                throw new ImportFailedException("could not import " + file, e);   // keep the cause
            } finally {
                cleanup();
            }
            `,
          note: 'Checked exceptions (IOException) must be caught or declared with throws; unchecked ones (RuntimeException subclasses) need not. Modern code mostly wraps checked exceptions in unchecked ones at the boundary.',
        },
        {
          title: 'try-with-resources',
          code: c`
            try (var reader = Files.newBufferedReader(Path.of("data.csv"));
                 var writer = Files.newBufferedWriter(Path.of("out.csv"))) {
                reader.lines().map(String::toUpperCase).forEach(line -> write(writer, line));
            }   // both are closed automatically, even on exceptions
            `,
          note: 'Works with anything that implements AutoCloseable: streams, JDBC connections, HTTP clients, executors.',
        },
        {
          title: 'Custom exception',
          code: c`
            public class NotFoundException extends RuntimeException {
                public NotFoundException(String message) {
                    super(message);
                }
            }

            throw new NotFoundException("Product " + id + " not found");
            `,
        },
      ],
    },
    {
      id: 'lang-lambdas',
      title: 'Lambdas & method references',
      group: 'Java language',
      items: [
        {
          title: 'Lambdas',
          code: c`
            Runnable task = () -> System.out.println("run");
            Function<String, Integer> length = s -> s.length();
            BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
            Predicate<User> isAdult = u -> u.age() >= 18;
            Supplier<List<String>> newList = ArrayList::new;
            Consumer<String> printer = System.out::println;
            UnaryOperator<String> upper = String::toUpperCase;
            `,
        },
        {
          title: 'Method reference kinds',
          code: c`
            Integer::parseInt          // static method          s -> Integer.parseInt(s)
            String::toLowerCase        // instance method of arg s -> s.toLowerCase()
            service::save              // method of an object    x -> service.save(x)
            User::new                  // constructor            args -> new User(args)
            `,
        },
        {
          title: 'Your own functional interface',
          code: c`
            @FunctionalInterface
            public interface Validator<T> {
                List<String> validate(T value);
            }

            Validator<String> notBlank = s -> s.isBlank() ? List.of("required") : List.of();
            `,
          note: 'Variables used inside a lambda must be effectively final.',
        },
      ],
    },
    {
      id: 'lang-datetime',
      title: 'Date & time (java.time)',
      group: 'Java language',
      items: [
        {
          title: 'Which type?',
          lang: 'text',
          code: c`
            Instant         a point on the UTC timeline   → timestamps, createdAt columns
            LocalDate       date without time or zone     → birthdays, due dates
            LocalDateTime   date + time, no zone          → rarely right for stored events
            ZonedDateTime   date + time + zone            → display, scheduling in a city
            Duration        time-based amount (seconds)   → timeouts, TTLs
            Period          date-based amount (days)      → "3 months later"
            `,
          note: 'Store Instant (or OffsetDateTime) in the database and convert to a zone only when displaying. Avoid java.util.Date and Calendar.',
        },
        {
          title: 'Create & calculate',
          code: c`
            Instant now = Instant.now();
            LocalDate today = LocalDate.now();
            LocalDate due = LocalDate.of(2026, 3, 31).plusDays(14);
            ZonedDateTime berlin = now.atZone(ZoneId.of("Europe/Berlin"));
            Instant expires = now.plus(Duration.ofMinutes(15));

            boolean late = today.isAfter(due);
            long days = ChronoUnit.DAYS.between(start, end);
            Duration took = Duration.between(t0, Instant.now());
            `,
        },
        {
          title: 'Format & parse',
          code: c`
            var fmt = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
            String s = berlin.format(fmt);
            LocalDate d = LocalDate.parse("2026-03-31");                 // ISO-8601 by default
            Instant i = Instant.parse("2026-03-31T10:15:30Z");
            DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(OffsetDateTime.now());
            `,
          note: 'Use a Clock parameter (Clock.systemUTC() in production, Clock.fixed(...) in tests) to make time-dependent code testable.',
        },
      ],
    },
    {
      id: 'lang-concurrency',
      title: 'Concurrency & virtual threads',
      group: 'Java language',
      items: [
        {
          title: 'Virtual threads (Java 21)',
          code: c`
            try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
                List<Future<String>> results = urls.stream()
                        .map(url -> executor.submit(() -> fetch(url)))     // one cheap thread per task
                        .toList();
                for (var f : results) {
                    System.out.println(f.get());
                }
            }   // close() waits for all tasks

            Thread.startVirtualThread(() -> sendEmail(user));
            `,
          note: 'Virtual threads make blocking I/O cheap, so simple blocking code scales. They do not speed up CPU-bound work. Java 24+ no longer pins them inside synchronized blocks.',
        },
        {
          title: 'CompletableFuture',
          code: c`
            CompletableFuture<Price> price = CompletableFuture.supplyAsync(() -> pricing.get(id), executor);
            CompletableFuture<Stock> stock = CompletableFuture.supplyAsync(() -> inventory.get(id), executor);

            ProductView view = price.thenCombine(stock, ProductView::new)
                    .orTimeout(2, TimeUnit.SECONDS)
                    .exceptionally(ex -> ProductView.unavailable())
                    .join();

            CompletableFuture.allOf(price, stock).join();
            `,
        },
        {
          title: 'Thread-safe building blocks',
          code: c`
            var counts = new ConcurrentHashMap<String, Integer>();
            counts.merge(key, 1, Integer::sum);

            var hits = new AtomicLong();
            hits.incrementAndGet();

            private final ReentrantLock lock = new ReentrantLock();
            lock.lock();
            try { ... } finally { lock.unlock(); }
            `,
          note: 'Prefer immutable objects and concurrent collections over manual locking. Spring beans are singletons, so never keep per-request state in their fields.',
        },
      ],
    },

    // ───────────────────────── Build tools ─────────────────────────
    {
      id: 'maven',
      title: 'Maven',
      group: 'Build tools',
      items: [
        {
          title: 'pom.xml essentials (Spring Boot)',
          lang: 'xml',
          code: c`
            <project xmlns="http://maven.apache.org/POM/4.0.0">
              <modelVersion>4.0.0</modelVersion>
              <parent>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-parent</artifactId>
                <version>3.5.6</version>            <!-- use the latest 3.5.x -->
                <relativePath/>
              </parent>
              <groupId>com.example</groupId>
              <artifactId>demo</artifactId>
              <version>0.0.1-SNAPSHOT</version>
              <properties>
                <java.version>21</java.version>
              </properties>
              <dependencies>
                <dependency>
                  <groupId>org.springframework.boot</groupId>
                  <artifactId>spring-boot-starter-web</artifactId>
                </dependency>
                <dependency>
                  <groupId>org.springframework.boot</groupId>
                  <artifactId>spring-boot-starter-test</artifactId>
                  <scope>test</scope>
                </dependency>
              </dependencies>
              <build>
                <finalName>app</finalName>           <!-- target/app.jar -->
                <plugins>
                  <plugin>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-maven-plugin</artifactId>
                  </plugin>
                </plugins>
              </build>
            </project>
            `,
          note: 'The parent manages versions of every Spring-supported library, so most dependencies need no <version>. It also compiles with -parameters, which @PathVariable and @RequestParam rely on.',
        },
        {
          title: 'Add a dependency',
          lang: 'xml',
          code: c`
            <dependency>
              <groupId>org.postgresql</groupId>
              <artifactId>postgresql</artifactId>
              <scope>runtime</scope>        <!-- compile (default), runtime, test, provided -->
            </dependency>
            `,
        },
        {
          title: 'Everyday commands',
          lang: 'bash',
          code: c`
            # macOS / Linux
            ./mvnw clean package              # compile, test, build target/*.jar
            ./mvnw clean package -DskipTests
            ./mvnw test
            ./mvnw test -Dtest=ProductServiceTest
            ./mvnw verify                     # package + integration tests (CI)
            ./mvnw spring-boot:run
            ./mvnw dependency:tree
            ./mvnw versions:display-dependency-updates

            # Windows (PowerShell): same goals with .\mvnw.cmd; quote -D arguments
            .\mvnw.cmd clean package "-DskipTests"
            .\mvnw.cmd spring-boot:run
            .\mvnw.cmd dependency:tree
            `,
          note: 'PowerShell splits unquoted arguments containing dots, so wrap -Dname=value in quotes on Windows.',
        },
      ],
    },
    {
      id: 'gradle',
      title: 'Gradle (Kotlin DSL)',
      group: 'Build tools',
      items: [
        {
          title: 'build.gradle.kts',
          lang: 'kotlin',
          code: c`
            plugins {
                java
                id("org.springframework.boot") version "3.5.6"
                id("io.spring.dependency-management") version "1.1.7"
            }

            group = "com.example"
            version = "0.0.1-SNAPSHOT"

            java {
                toolchain { languageVersion = JavaLanguageVersion.of(21) }
            }

            repositories { mavenCentral() }

            dependencies {
                implementation("org.springframework.boot:spring-boot-starter-web")
                runtimeOnly("org.postgresql:postgresql")
                testImplementation("org.springframework.boot:spring-boot-starter-test")
                testRuntimeOnly("org.junit.platform:junit-platform-launcher")
            }

            tasks.withType<Test> { useJUnitPlatform() }
            `,
          note: 'The toolchain block lets Gradle find or download JDK 21 even if a different java is on your PATH.',
        },
        {
          title: 'Everyday commands',
          lang: 'bash',
          code: c`
            # macOS / Linux
            ./gradlew build                   # compile, test, build/libs/*.jar
            ./gradlew build -x test           # skip tests
            ./gradlew test --tests "*ProductServiceTest"
            ./gradlew bootRun
            ./gradlew bootRun --args="--spring.profiles.active=dev"
            ./gradlew dependencies --configuration runtimeClasspath

            # Windows (PowerShell)
            .\gradlew.bat build
            .\gradlew.bat bootRun --args="--spring.profiles.active=dev"
            `,
          note: 'Gradle builds two jars: app-0.0.1-SNAPSHOT.jar (runnable) and ...-plain.jar (classes only). Deploy the one without -plain.',
        },
      ],
    },

    // ───────────────────────── Spring Boot ─────────────────────────
    {
      id: 'boot-create',
      title: 'Create & run a Spring Boot project',
      group: 'Spring Boot',
      items: [
        {
          title: 'start.spring.io (web UI)',
          note: 'Open start.spring.io, pick Maven or Gradle - Kotlin, Java 21, Spring Boot 3.5.x, then add Spring Web, Validation, Spring Data JPA, PostgreSQL Driver, Flyway, Spring Security, Actuator and DevTools. Generate, unzip and open the folder in your IDE.',
        },
        {
          title: 'Same thing from the terminal',
          lang: 'bash',
          code: c`
            # macOS / Linux
            curl https://start.spring.io/starter.zip \
              -d type=maven-project -d javaVersion=21 \
              -d groupId=com.example -d artifactId=demo -d packageName=com.example.demo \
              -d dependencies=web,data-jpa,validation,postgresql,flyway,actuator,security,devtools \
              -o demo.zip
            unzip demo.zip -d demo && cd demo
            `,
          then: [
            {
              label: 'Windows (PowerShell) — use curl.exe, not the curl alias',
              lang: 'powershell',
              code: c`
                curl.exe https://start.spring.io/starter.zip ${BT}
                  -d type=maven-project -d javaVersion=21 ${BT}
                  -d groupId=com.example -d artifactId=demo -d packageName=com.example.demo ${BT}
                  -d dependencies=web,data-jpa,validation,postgresql,flyway,actuator,security,devtools ${BT}
                  -o demo.zip
                Expand-Archive demo.zip -DestinationPath demo; cd demo
                `,
            },
          ],
          note: 'Use type=gradle-project-kotlin for Gradle. Add -d bootVersion=... to pin a version; leaving it out gives the current default.',
        },
        {
          title: 'Main class',
          code: c`
            package com.example.demo;

            import org.springframework.boot.SpringApplication;
            import org.springframework.boot.autoconfigure.SpringBootApplication;

            @SpringBootApplication          // = @Configuration + @EnableAutoConfiguration + @ComponentScan
            public class DemoApplication {
                public static void main(String[] args) {
                    SpringApplication.run(DemoApplication.class, args);
                }
            }
            `,
          note: 'Component scanning starts at this class\'s package, so put every controller, service and repository in com.example.demo or a sub-package.',
        },
        {
          title: 'Run in development',
          lang: 'bash',
          code: c`
            # macOS / Linux
            ./mvnw spring-boot:run
            ./gradlew bootRun

            # Windows (PowerShell)
            .\mvnw.cmd spring-boot:run
            .\gradlew.bat bootRun

            # then, same on every OS
            curl http://localhost:8080/actuator/health
            `,
        },
        {
          title: 'Env vars / profile for one run',
          lang: 'bash',
          code: c`
            # macOS / Linux
            SPRING_PROFILES_ACTIVE=dev SERVER_PORT=8081 ./mvnw spring-boot:run
            ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

            # Windows (PowerShell) — lasts for this terminal session
            $env:SPRING_PROFILES_ACTIVE = "dev"; $env:SERVER_PORT = "8081"
            .\mvnw.cmd spring-boot:run
            .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
            `,
          note: 'Relaxed binding maps env var SERVER_PORT to server.port and SPRING_DATASOURCE_URL to spring.datasource.url.',
        },
        {
          title: 'DevTools hot restart',
          lang: 'xml',
          code: c`
            <dependency>
              <groupId>org.springframework.boot</groupId>
              <artifactId>spring-boot-devtools</artifactId>
              <scope>runtime</scope>
              <optional>true</optional>
            </dependency>
            `,
          note: 'The app restarts when compiled classes change: in IntelliJ enable "Build project automatically" (or press Ctrl+F9 / Cmd+F9). DevTools is disabled automatically when running from java -jar.',
        },
      ],
    },
    {
      id: 'boot-config',
      title: 'Configuration & profiles',
      group: 'Spring Boot',
      items: [
        {
          title: 'application.yml',
          lang: 'yaml',
          code: c`
            spring:
              application:
                name: demo
              profiles:
                active: dev                      # default for local runs; override in prod
            server:
              port: 8080
              shutdown: graceful
            app:
              cors-origins: http://localhost:5173
              jwt:
                secret: ${PH}JWT_SECRET}
                ttl: 15m
            `,
          note: 'Use either application.yml or application.properties, not both. Precedence (highest first): command-line args, env vars, profile files, application.yml.',
        },
        {
          title: 'Profile-specific files',
          lang: 'yaml',
          code: c`
            # src/main/resources/application-dev.yml
            spring:
              datasource:
                url: jdbc:postgresql://localhost:5432/app
                username: app
                password: secret
            logging:
              level:
                com.example: debug
            `,
          then: [
            {
              label: 'src/main/resources/application-prod.yml',
              lang: 'yaml',
              code: c`
                spring:
                  datasource:
                    url: ${PH}DB_URL}
                    username: ${PH}DB_USER}
                    password: ${PH}DB_PASSWORD}
                `,
            },
          ],
          note: 'application-prod.yml only references env vars, so no secret is ever committed. Activate it with SPRING_PROFILES_ACTIVE=prod.',
        },
        {
          title: 'Placeholders with defaults',
          lang: 'yaml',
          code: c`
            spring:
              datasource:
                url: ${PH}DB_URL:jdbc:postgresql://localhost:5432/app}
            app:
              base-url: ${PH}APP_BASE_URL:http://localhost:8080}
            `,
          note: 'The value after the colon is used when the env var is missing.',
        },
        {
          title: 'Type-safe @ConfigurationProperties record',
          code: c`
            @ConfigurationProperties(prefix = "app.jwt")
            @Validated
            public record JwtProperties(@NotBlank String secret, @NotNull Duration ttl) {}

            // register once, e.g. on the main class
            @SpringBootApplication
            @ConfigurationPropertiesScan
            public class DemoApplication { ... }

            // inject like any bean
            public TokenService(JwtProperties props) { this.ttl = props.ttl(); }
            `,
          note: 'Values like 15m, 30s or 2h bind straight to Duration. With @Validated the app refuses to start if a required value is missing.',
        },
        {
          title: 'Load a local .env file',
          lang: 'yaml',
          code: c`
            spring:
              config:
                import: optional:file:.env[.properties]     # KEY=value lines, ignored if the file is missing
            `,
          note: 'Spring Boot does not read .env files on its own. In production use real environment variables (systemd EnvironmentFile=, Docker -e, your platform\'s secret store).',
        },
      ],
    },
    {
      id: 'boot-di',
      title: 'Beans, DI & logging',
      group: 'Spring Boot',
      items: [
        {
          title: 'Constructor injection',
          code: c`
            @Service
            public class OrderService {
                private final OrderRepository orders;
                private final PaymentGateway payments;

                public OrderService(OrderRepository orders, PaymentGateway payments) {   // no @Autowired needed
                    this.orders = orders;
                    this.payments = payments;
                }
            }
            `,
          note: 'Prefer constructor injection over field @Autowired: dependencies are final, explicit and easy to pass in unit tests.',
        },
        {
          title: 'Stereotypes',
          lang: 'text',
          code: c`
            @Component        generic bean
            @Service          business logic
            @Repository       data access (adds exception translation)
            @RestController   HTTP endpoints returning JSON
            @Configuration    class with @Bean factory methods
            `,
        },
        {
          title: '@Configuration and @Bean',
          code: c`
            @Configuration
            public class AppConfig {

                @Bean
                Clock clock() {
                    return Clock.systemUTC();
                }

                @Bean
                @Profile("dev")
                PaymentGateway fakeGateway() {
                    return new FakeGateway();
                }

                @Bean
                @Profile("prod")
                PaymentGateway stripeGateway(StripeProperties props) {
                    return new StripeGateway(props.apiKey());
                }
            }
            `,
          note: 'Use @Bean for third-party classes you cannot annotate, or when you need to choose an implementation by profile.',
        },
        {
          title: 'Logging with SLF4J',
          code: c`
            import org.slf4j.Logger;
            import org.slf4j.LoggerFactory;

            @Service
            public class OrderService {
                private static final Logger log = LoggerFactory.getLogger(OrderService.class);

                public void place(Order order) {
                    log.info("Placing order {} for {}", order.id(), order.customerId());   // {} placeholders, no string concat
                    log.debug("Payload: {}", order);
                    log.error("Payment failed for {}", order.id(), exception);            // exception last
                }
            }
            `,
        },
        {
          title: 'Log levels & JSON logs',
          lang: 'yaml',
          code: c`
            logging:
              level:
                root: info
                com.example: debug
                org.hibernate.SQL: debug                 # print SQL statements
                org.springframework.security: debug      # explain 401 / 403
              structured:
                format:
                  console: ecs                           # JSON logs (Boot 3.4+): ecs, logstash or gelf
              file:
                name: logs/app.log                       # optional, rotates automatically
            `,
        },
      ],
    },

    // ───────────────────────── REST APIs ─────────────────────────
    {
      id: 'rest-dtos',
      title: 'DTOs as records',
      group: 'REST APIs',
      items: [
        {
          title: 'Request and response records',
          code: c`
            public record ProductRequest(
                    @NotBlank @Size(max = 200) String name,
                    @NotNull @Positive @Digits(integer = 10, fraction = 2) BigDecimal price,
                    @Size(max = 2000) String description,
                    @NotNull Long categoryId) {}

            public record ProductResponse(Long id, String name, BigDecimal price, String category, Instant createdAt) {
                public static ProductResponse from(Product p) {
                    return new ProductResponse(p.getId(), p.getName(), p.getPrice(),
                            p.getCategory().getName(), p.getCreatedAt());
                }
            }
            `,
          note: 'Never return JPA entities directly: DTOs stop you leaking fields like passwordHash, avoid lazy-loading errors and infinite JSON recursion, and keep the API stable when the table changes.',
        },
        {
          title: 'Jackson tweaks',
          code: c`
            public record UserResponse(
                    Long id,
                    @JsonProperty("display_name") String displayName,
                    @JsonInclude(JsonInclude.Include.NON_NULL) String avatarUrl,
                    @JsonFormat(pattern = "yyyy-MM-dd") LocalDate birthday) {}
            `,
          then: [
            {
              label: 'Global settings (application.yml)',
              lang: 'yaml',
              code: c`
                spring:
                  jackson:
                    property-naming-strategy: SNAKE_CASE
                    default-property-inclusion: non_null
                    deserialization:
                      fail-on-unknown-properties: false
                `,
            },
          ],
          note: 'Spring Boot 4 moves to Jackson 3 (Maven group tools.jackson, packages tools.jackson.*); the com.fasterxml.jackson.annotation annotations stay the same. Check the Boot 4 migration guide for renamed spring.jackson.* properties.',
        },
      ],
    },
    {
      id: 'rest-controller',
      title: 'CRUD controller',
      group: 'REST APIs',
      items: [
        {
          title: 'Full CRUD @RestController',
          code: c`
            @RestController
            @RequestMapping("/api/products")
            public class ProductController {
                private final ProductService service;

                public ProductController(ProductService service) {
                    this.service = service;
                }

                @GetMapping
                public PagedModel<ProductResponse> list(@RequestParam(defaultValue = "") String q, Pageable pageable) {
                    return new PagedModel<>(service.search(q, pageable));
                }

                @GetMapping("/{id}")
                public ProductResponse get(@PathVariable Long id) {
                    return service.get(id);                          // 404 via NotFoundException + advice
                }

                @PostMapping
                public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest req,
                                                              UriComponentsBuilder uri) {
                    ProductResponse created = service.create(req);
                    URI location = uri.path("/api/products/{id}").buildAndExpand(created.id()).toUri();
                    return ResponseEntity.created(location).body(created);     // 201 + Location header
                }

                @PutMapping("/{id}")
                public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {
                    return service.update(id, req);
                }

                @DeleteMapping("/{id}")
                @ResponseStatus(HttpStatus.NO_CONTENT)               // 204
                public void delete(@PathVariable Long id) {
                    service.delete(id);
                }
            }
            `,
        },
        {
          title: 'Request parameters',
          code: c`
            @GetMapping("/search")
            public List<ProductResponse> search(
                    @RequestParam String q,                                   // required → 400 if missing
                    @RequestParam(defaultValue = "20") int limit,
                    @RequestParam(required = false) Long categoryId,
                    @RequestParam(defaultValue = "") List<String> tags,       // ?tags=a&tags=b or ?tags=a,b
                    @RequestHeader(name = "X-Request-Id", required = false) String requestId) { ... }
            `,
        },
        {
          title: 'ResponseEntity status shortcuts',
          code: c`
            return ResponseEntity.ok(body);                                   // 200
            return ResponseEntity.created(location).body(body);               // 201
            return ResponseEntity.accepted().build();                         // 202
            return ResponseEntity.noContent().build();                        // 204
            return ResponseEntity.notFound().build();                         // 404
            return ResponseEntity.status(HttpStatus.CONFLICT).body(problem);  // any status
            return ResponseEntity.ok().header("Cache-Control", "max-age=60").body(body);
            `,
        },
        {
          title: 'Try it with curl',
          lang: 'bash',
          code: c`
            # macOS / Linux
            curl -i "http://localhost:8080/api/products?page=0&size=10"
            curl -i -X POST http://localhost:8080/api/products \
              -H "Content-Type: application/json" \
              -d '{"name":"Mug","price":9.90,"categoryId":1}'
            `,
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                Invoke-RestMethod http://localhost:8080/api/products
                Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/products ${BT}
                  -ContentType 'application/json' ${BT}
                  -Body '{"name":"Mug","price":9.90,"categoryId":1}'
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'rest-errors',
      title: 'Validation & error handling',
      group: 'REST APIs',
      items: [
        {
          title: 'Bean Validation annotations',
          lang: 'text',
          code: c`
            @NotNull          not null              @NotBlank     not null, not empty, not only spaces
            @NotEmpty         collection/string     @Size(min, max)
            @Email            email format          @Pattern(regexp = "^[A-Z]{3}$")
            @Positive         > 0                   @PositiveOrZero / @Min(1) / @Max(100)
            @Past / @Future   dates                 @Valid       cascade into nested objects / list items
            `,
          note: 'Needs spring-boot-starter-validation. Put @Valid on the @RequestBody parameter or nothing is checked; add @Validated on the controller class to validate @RequestParam / @PathVariable constraints.',
        },
        {
          title: 'Global handler with ProblemDetail (RFC 9457)',
          code: c`
            @RestControllerAdvice
            public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

                @ExceptionHandler(NotFoundException.class)
                ProblemDetail notFound(NotFoundException ex) {
                    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
                    pd.setTitle("Resource not found");
                    return pd;
                }

                @ExceptionHandler(DataIntegrityViolationException.class)
                ProblemDetail conflict(DataIntegrityViolationException ex) {
                    return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Duplicate or invalid reference");
                }

                @Override   // 400 for @Valid failures, with field errors
                protected ResponseEntity<Object> handleMethodArgumentNotValid(
                        MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
                    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed");
                    Map<String, String> errors = new LinkedHashMap<>();
                    ex.getBindingResult().getFieldErrors()
                            .forEach(fe -> errors.putIfAbsent(fe.getField(), fe.getDefaultMessage()));
                    pd.setProperty("errors", errors);
                    return ResponseEntity.badRequest().body(pd);
                }
            }
            `,
          note: 'Responses use Content-Type application/problem+json. Extending ResponseEntityExceptionHandler gives you ProblemDetail bodies for Spring\'s built-in errors too (405, 415, missing parameters).',
        },
        {
          title: 'Resulting error body',
          lang: 'json',
          code: c`
            {
              "type": "about:blank",
              "title": "Bad Request",
              "status": 400,
              "detail": "Validation failed",
              "instance": "/api/products",
              "errors": { "name": "must not be blank", "price": "must be greater than 0" }
            }
            `,
        },
        {
          title: 'ProblemDetail without a custom advice',
          lang: 'yaml',
          code: c`
            spring:
              mvc:
                problemdetails:
                  enabled: true
            `,
          note: 'Turns on RFC 9457 bodies for Spring MVC\'s own exceptions only. Your exceptions still need an @ExceptionHandler, or extend ErrorResponseException.',
        },
      ],
    },
    {
      id: 'rest-paging-cors',
      title: 'Pagination & CORS',
      group: 'REST APIs',
      items: [
        {
          title: 'Pageable from the query string',
          code: c`
            // GET /api/products?page=0&size=20&sort=price,desc&sort=name
            @GetMapping
            public PagedModel<ProductResponse> list(
                    @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
                return new PagedModel<>(repo.findAll(pageable).map(ProductResponse::from));
            }
            `,
          note: 'Return PagedModel (or your own record) instead of a raw Page: it gives a stable JSON shape with content and page metadata, and avoids the PageImpl serialization warning.',
        },
        {
          title: 'Page settings',
          lang: 'yaml',
          code: c`
            spring:
              data:
                web:
                  pageable:
                    default-page-size: 20
                    max-page-size: 100        # caps ?size=100000
            `,
          then: [
            {
              label: 'Or serialize every Page as a DTO automatically',
              lang: 'java',
              code: c`
                @Configuration
                @EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
                public class WebConfig {}
                `,
            },
          ],
        },
        {
          title: 'CORS for the whole API',
          code: c`
            @Configuration
            public class CorsConfig implements WebMvcConfigurer {
                @Override
                public void addCorsMappings(CorsRegistry registry) {
                    registry.addMapping("/api/**")
                            .allowedOrigins("http://localhost:5173", "https://app.example.com")
                            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
                            .allowCredentials(true)
                            .maxAge(3600);
                }
            }
            `,
          note: 'With Spring Security on the classpath, configure CORS in the security chain instead (see Security), or preflight OPTIONS requests are rejected with 401/403.',
        },
        {
          title: 'CORS for one controller',
          code: c`
            @CrossOrigin(origins = "http://localhost:5173")
            @RestController
            @RequestMapping("/api/public")
            public class PublicController { ... }
            `,
        },
      ],
    },
    {
      id: 'rest-client',
      title: 'Calling other APIs & OpenAPI docs',
      group: 'REST APIs',
      items: [
        {
          title: 'RestClient bean (Spring 6.1+)',
          code: c`
            @Configuration
            public class HttpClients {
                @Bean
                RestClient ratesClient(RestClient.Builder builder, RatesProperties props) {
                    var http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
                    var factory = new JdkClientHttpRequestFactory(http);
                    factory.setReadTimeout(Duration.ofSeconds(10));
                    return builder
                            .baseUrl(props.baseUrl())
                            .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + props.apiKey())
                            .requestFactory(factory)
                            .build();
                }
            }
            `,
          note: 'Always set timeouts on outgoing calls. Inject the auto-configured RestClient.Builder so tracing and message converters are applied.',
        },
        {
          title: 'GET, POST and error handling',
          code: c`
            Rate rate = ratesClient.get()
                    .uri("/rates/{currency}?date={date}", "EUR", LocalDate.now())
                    .retrieve()
                    .body(Rate.class);

            List<Rate> all = ratesClient.get().uri("/rates")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Rate>>() {});

            ResponseEntity<Void> res = ratesClient.post()
                    .uri("/alerts")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new AlertRequest("EUR", 1.10))
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, resp) -> {
                        throw new RatesApiException("rejected: " + resp.getStatusCode());
                    })
                    .toBodilessEntity();
            `,
          note: 'Without onStatus, 4xx/5xx responses throw RestClientResponseException subclasses. WebClient is only needed for reactive (WebFlux) code.',
        },
        {
          title: 'OpenAPI / Swagger UI with springdoc',
          lang: 'xml',
          code: c`
            <dependency>
              <groupId>org.springdoc</groupId>
              <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
              <version>2.8.13</version>     <!-- 2.8.x for Boot 3.5; 3.x for Boot 4 -->
            </dependency>
            `,
          then: [
            {
              label: 'Open (and permit these paths in Spring Security)',
              lang: 'text',
              code: c`
                http://localhost:8080/swagger-ui.html
                http://localhost:8080/v3/api-docs
                `,
            },
            {
              label: 'application-prod.yml: hide the docs for a private API',
              lang: 'yaml',
              code: c`
                springdoc:
                  api-docs:
                    enabled: false
                  swagger-ui:
                    enabled: false
                `,
            },
          ],
          note: 'springdoc is not managed by the Boot parent, so its version must match your Boot generation; check the springdoc compatibility table before upgrading Boot.',
        },
        {
          title: 'Document an endpoint',
          code: c`
            @Tag(name = "Products")
            @RestController
            public class ProductController {

                @Operation(summary = "Get one product")
                @ApiResponse(responseCode = "404", description = "Not found")
                @GetMapping("/api/products/{id}")
                public ProductResponse get(@PathVariable Long id) { ... }
            }
            `,
        },
      ],
    },

    // ───────────────────────── Data (JPA) ─────────────────────────
    {
      id: 'jpa-setup',
      title: 'Datasource setup',
      group: 'Data (JPA)',
      items: [
        {
          title: 'Dependencies',
          lang: 'xml',
          code: c`
            <dependency>
              <groupId>org.springframework.boot</groupId>
              <artifactId>spring-boot-starter-data-jpa</artifactId>
            </dependency>
            <dependency>
              <groupId>org.postgresql</groupId>
              <artifactId>postgresql</artifactId>
              <scope>runtime</scope>
            </dependency>
            <!-- MySQL instead: com.mysql:mysql-connector-j (runtime) -->
            `,
        },
        {
          title: 'PostgreSQL',
          lang: 'yaml',
          code: c`
            spring:
              datasource:
                url: ${PH}DB_URL:jdbc:postgresql://localhost:5432/app}
                username: ${PH}DB_USER:app}
                password: ${PH}DB_PASSWORD:secret}
                hikari:
                  maximum-pool-size: 10
              jpa:
                hibernate:
                  ddl-auto: validate          # Flyway owns the schema
                open-in-view: false           # no lazy loading in controllers
                properties:
                  hibernate:
                    jdbc:
                      time_zone: UTC
            `,
          note: 'Create the database and user first (see the SQL sheet). Turning off open-in-view also removes the startup warning and surfaces lazy-loading bugs early.',
        },
        {
          title: 'MySQL',
          lang: 'yaml',
          code: c`
            spring:
              datasource:
                url: ${PH}DB_URL:jdbc:mysql://localhost:3306/app?serverTimezone=UTC}
                username: ${PH}DB_USER:app}
                password: ${PH}DB_PASSWORD:secret}
            `,
        },
        {
          title: 'Local database with Docker',
          lang: 'bash',
          code: c`
            # macOS / Linux (Docker Desktop on macOS)
            docker run -d --name app-db -p 5432:5432 \
              -e POSTGRES_DB=app -e POSTGRES_USER=app -e POSTGRES_PASSWORD=secret \
              postgres:17
            `,
          then: [
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                docker run -d --name app-db -p 5432:5432 ${BT}
                  -e POSTGRES_DB=app -e POSTGRES_USER=app -e POSTGRES_PASSWORD=secret ${BT}
                  postgres:17
                `,
            },
          ],
          note: 'Alternatively add the spring-boot-docker-compose dependency and a compose.yaml: Boot then starts the containers and wires the connection on spring-boot:run.',
        },
        {
          title: 'ddl-auto values',
          lang: 'text',
          code: c`
            none         do nothing
            validate     check entities match the tables, fail on startup otherwise  → production
            update       add missing columns/tables, never drops                     → quick prototypes only
            create       drop + create on startup                                    → throwaway demos
            create-drop  create on startup, drop on shutdown                         → embedded test DBs
            `,
          note: 'Use migrations (Flyway) for every real schema change, and validate in production.',
        },
      ],
    },
    {
      id: 'jpa-entities',
      title: 'Entities & relationships',
      group: 'Data (JPA)',
      items: [
        {
          title: '@Entity',
          code: c`
            import jakarta.persistence.*;

            @Entity
            @Table(name = "products")
            public class Product {
                @Id
                @GeneratedValue(strategy = GenerationType.IDENTITY)
                private Long id;

                @Column(nullable = false, length = 200)
                private String name;

                @Column(nullable = false, precision = 12, scale = 2)
                private BigDecimal price;

                @Enumerated(EnumType.STRING)                 // never ORDINAL
                private ProductStatus status = ProductStatus.ACTIVE;

                @ManyToOne(fetch = FetchType.LAZY, optional = false)
                @JoinColumn(name = "category_id")
                private Category category;

                @Version
                private long version;                        // optimistic locking

                protected Product() {}                       // required by JPA

                public Product(String name, BigDecimal price, Category category) {
                    this.name = name;
                    this.price = price;
                    this.category = category;
                }

                // getters, plus intention-revealing methods instead of blanket setters
                public void rename(String name) { this.name = name; }
                public Long getId() { return id; }
                public String getName() { return name; }
            }
            `,
          note: 'Entities must be classes with a no-arg constructor, not records. Spring Boot 3 uses jakarta.persistence, not javax.persistence.',
        },
        {
          title: 'One-to-many (bidirectional)',
          code: c`
            @Entity
            public class Category {
                @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
                private Long id;
                private String name;

                @OneToMany(mappedBy = "category")            // the Product side owns the foreign key
                private List<Product> products = new ArrayList<>();
            }

            @Entity
            public class Order {
                @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
                private List<OrderLine> lines = new ArrayList<>();

                public void addLine(OrderLine line) {        // keep both sides in sync
                    lines.add(line);
                    line.setOrder(this);
                }
            }
            `,
          note: 'Make @ManyToOne and @OneToOne LAZY explicitly (they default to EAGER). Only cascade from a true parent to its children.',
        },
        {
          title: 'Auditing timestamps',
          code: c`
            @Configuration
            @EnableJpaAuditing
            public class JpaConfig {}

            @MappedSuperclass
            @EntityListeners(AuditingEntityListener.class)
            public abstract class Auditable {
                @CreatedDate
                @Column(nullable = false, updatable = false)
                private Instant createdAt;

                @LastModifiedDate
                private Instant updatedAt;

                public Instant getCreatedAt() { return createdAt; }
            }

            @Entity
            public class Product extends Auditable { ... }
            `,
          note: 'For @CreatedBy / @LastModifiedBy also provide an AuditorAware bean that returns the current username.',
        },
      ],
    },
    {
      id: 'jpa-repos',
      title: 'Repositories & queries',
      group: 'Data (JPA)',
      items: [
        {
          title: 'JpaRepository with derived queries',
          code: c`
            public interface ProductRepository extends JpaRepository<Product, Long> {
                Optional<Product> findBySku(String sku);
                boolean existsBySku(String sku);
                List<Product> findByCategoryIdAndPriceLessThan(Long categoryId, BigDecimal max);
                Page<Product> findByNameContainingIgnoreCase(String q, Pageable pageable);
                List<Product> findTop10ByOrderByCreatedAtDesc();
                long countByStatus(ProductStatus status);
            }
            `,
          note: 'Built in: save, saveAll, findById, findAll(Pageable), existsById, deleteById, count. Method names are parsed at startup, so typos fail fast.',
        },
        {
          title: '@Query (JPQL and native)',
          code: c`
            @Query("select p from Product p where p.price between :min and :max order by p.price")
            List<Product> priceBetween(BigDecimal min, BigDecimal max);

            @Query(value = "select * from products where to_tsvector(name) @@ plainto_tsquery(:q)", nativeQuery = true)
            List<Product> fullText(String q);

            @Modifying
            @Transactional
            @Query("update Product p set p.status = :status where p.category.id = :categoryId")
            int setStatusForCategory(Long categoryId, ProductStatus status);
            `,
          note: 'Named parameters bind by method parameter name thanks to -parameters; otherwise add @Param("min"). Never build JPQL by concatenating user input.',
        },
        {
          title: 'Projections (read only what you need)',
          code: c`
            public record ProductSummary(Long id, String name, BigDecimal price) {}

            public interface ProductRepository extends JpaRepository<Product, Long> {
                List<ProductSummary> findByCategoryId(Long categoryId);          // DTO projection

                @Query("select new com.example.demo.product.ProductSummary(p.id, p.name, p.price) from Product p where p.status = :status")
                List<ProductSummary> summaries(ProductStatus status);
            }
            `,
        },
        {
          title: 'Service layer with transactions',
          code: c`
            @Service
            @Transactional(readOnly = true)                  // default for every method
            public class ProductService {
                private final ProductRepository products;
                private final CategoryRepository categories;

                public ProductService(ProductRepository products, CategoryRepository categories) {
                    this.products = products;
                    this.categories = categories;
                }

                public ProductResponse get(Long id) {
                    return products.findById(id).map(ProductResponse::from)
                            .orElseThrow(() -> new NotFoundException("Product " + id + " not found"));
                }

                @Transactional
                public ProductResponse create(ProductRequest req) {
                    Category cat = categories.getReferenceById(req.categoryId());   // no SELECT needed
                    return ProductResponse.from(products.save(new Product(req.name(), req.price(), cat)));
                }

                @Transactional
                public ProductResponse update(Long id, ProductRequest req) {
                    Product p = products.findById(id).orElseThrow(() -> new NotFoundException("Product " + id));
                    p.rename(req.name());                    // dirty checking: UPDATE on commit, no save() needed
                    return ProductResponse.from(p);
                }
            }
            `,
          note: '@Transactional only works on public methods called from another bean (through the proxy); a call from inside the same class skips it. Runtime exceptions roll back, checked ones do not unless you add rollbackFor.',
        },
      ],
    },
    {
      id: 'jpa-performance',
      title: 'N+1 queries & fetching',
      group: 'Data (JPA)',
      items: [
        {
          title: 'Spot N+1',
          lang: 'yaml',
          code: c`
            logging:
              level:
                org.hibernate.SQL: debug
                org.hibernate.orm.jdbc.bind: trace     # bound parameter values (Hibernate 6+)
            `,
          note: 'One SELECT for the list followed by one SELECT per row (to load each category) is the N+1 problem.',
        },
        {
          title: 'Fix with a fetch join or @EntityGraph',
          code: c`
            @Query("select p from Product p join fetch p.category where p.status = :status")
            List<Product> findActiveWithCategory(ProductStatus status);

            @EntityGraph(attributePaths = {"category"})
            Page<Product> findByStatus(ProductStatus status, Pageable pageable);
            `,
          note: 'Do not join fetch a collection together with pagination: Hibernate paginates in memory. Page the ids first, or use a DTO projection.',
        },
        {
          title: 'Batch fetching for collections',
          lang: 'yaml',
          code: c`
            spring:
              jpa:
                properties:
                  hibernate:
                    default_batch_fetch_size: 50     # loads lazy collections 50 parents at a time
            `,
        },
      ],
    },
    {
      id: 'flyway',
      title: 'Flyway migrations',
      group: 'Data (JPA)',
      items: [
        {
          title: 'Dependencies',
          lang: 'xml',
          code: c`
            <dependency>
              <groupId>org.flywaydb</groupId>
              <artifactId>flyway-core</artifactId>
            </dependency>
            <dependency>
              <groupId>org.flywaydb</groupId>
              <artifactId>flyway-database-postgresql</artifactId>   <!-- or flyway-mysql -->
              <scope>runtime</scope>
            </dependency>
            `,
          note: 'Flyway 10+ ships database support as separate modules. In Spring Boot 4 the auto-configuration moved to its own module, so add spring-boot-starter-flyway there.',
        },
        {
          title: 'src/main/resources/db/migration/V1__init.sql',
          lang: 'sql',
          code: c`
            CREATE TABLE categories (
                id   BIGSERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE
            );

            CREATE TABLE products (
                id          BIGSERIAL PRIMARY KEY,
                name        VARCHAR(200)   NOT NULL,
                price       NUMERIC(12, 2) NOT NULL CHECK (price > 0),
                status      VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE',
                category_id BIGINT         NOT NULL REFERENCES categories (id),
                version     BIGINT         NOT NULL DEFAULT 0,
                created_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
                updated_at  TIMESTAMPTZ
            );
            CREATE INDEX idx_products_category ON products (category_id);
            `,
        },
        {
          title: 'Naming rules',
          lang: 'text',
          code: c`
            V1__init.sql                 versioned, runs once, in order
            V2__add_sku_to_products.sql  two underscores between version and description
            V2_1__backfill_sku.sql       2.1 sorts between 2 and 3
            R__views.sql                 repeatable, re-runs when its checksum changes
            `,
          note: 'Never edit a migration that has already run anywhere; add a new one. Flyway runs pending migrations automatically on application startup.',
        },
        {
          title: 'Useful settings',
          lang: 'yaml',
          code: c`
            spring:
              flyway:
                baseline-on-migrate: true     # adopting an existing database
                locations: classpath:db/migration
                clean-disabled: true          # never wipe a real database
            `,
        },
      ],
    },

    // ───────────────────────── Security ─────────────────────────
    {
      id: 'sec-basics',
      title: 'Spring Security basics',
      group: 'Security',
      items: [
        {
          title: 'What happens when you add the starter',
          note: 'Every endpoint requires login, a user named "user" gets a random password printed in the log ("Using generated security password"), and CSRF protection is on. Defining your own SecurityFilterChain and UserDetailsService replaces those defaults.',
        },
        {
          title: 'SecurityFilterChain (session-based, server-rendered app)',
          code: c`
            @Configuration
            @EnableWebSecurity
            public class SecurityConfig {

                @Bean
                SecurityFilterChain web(HttpSecurity http) throws Exception {
                    http
                        .authorizeHttpRequests(auth -> auth
                            .requestMatchers("/", "/login", "/css/**", "/js/**").permitAll()
                            .requestMatchers("/admin/**").hasRole("ADMIN")
                            .anyRequest().authenticated())
                        .formLogin(form -> form.loginPage("/login").permitAll())
                        .logout(Customizer.withDefaults());
                    return http.build();
                }
            }
            `,
          note: 'Keep CSRF enabled for cookie/session apps; Thymeleaf forms include the token automatically. Rules are checked top to bottom, so put specific matchers first.',
        },
        {
          title: 'Password encoding',
          code: c`
            @Bean
            PasswordEncoder passwordEncoder() {
                return PasswordEncoderFactories.createDelegatingPasswordEncoder();   // bcrypt, stored as {bcrypt}$2a$...
            }

            // or plain BCrypt
            @Bean
            PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder(12);
            }

            String hash = passwordEncoder.encode(rawPassword);       // on sign-up
            boolean ok = passwordEncoder.matches(rawPassword, hash);
            `,
          note: 'The delegating encoder prefixes the algorithm id, so you can upgrade algorithms later without breaking old hashes.',
        },
        {
          title: 'Load users from the database',
          code: c`
            @Bean
            UserDetailsService userDetailsService(AppUserRepository users) {
                return email -> users.findByEmailIgnoreCase(email)
                        .map(u -> User.withUsername(u.getEmail())
                                .password(u.getPasswordHash())
                                .roles(u.getRole().name())           // "ADMIN" → authority ROLE_ADMIN
                                .disabled(!u.isActive())
                                .build())
                        .orElseThrow(() -> new UsernameNotFoundException(email));
            }
            `,
          note: 'User here is org.springframework.security.core.userdetails.User; name your entity AppUser to avoid the clash.',
        },
      ],
    },
    {
      id: 'sec-jwt',
      title: 'Stateless JWT API (resource server)',
      group: 'Security',
      items: [
        {
          title: '1. Dependencies',
          lang: 'xml',
          code: c`
            <dependency>
              <groupId>org.springframework.boot</groupId>
              <artifactId>spring-boot-starter-security</artifactId>
            </dependency>
            <dependency>
              <groupId>org.springframework.boot</groupId>
              <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
            </dependency>
            `,
          note: 'The resource server starter brings Nimbus JOSE, which both validates and signs JWTs, so no extra JWT library is needed.',
        },
        {
          title: '2. Generate a secret (at least 32 bytes for HS256)',
          lang: 'bash',
          code: c`
            # macOS / Linux
            openssl rand -base64 32

            # Windows (PowerShell)
            $b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)
            `,
          then: [
            {
              label: 'application.yml (value comes from the JWT_SECRET env var)',
              lang: 'yaml',
              code: c`
                app:
                  jwt:
                    secret: ${PH}JWT_SECRET}
                    ttl: 15m
                    issuer: demo-api
                `,
            },
          ],
        },
        {
          title: '3. Encoder, decoder and role mapping',
          code: c`
            @ConfigurationProperties(prefix = "app.jwt")
            public record JwtProperties(String secret, Duration ttl, String issuer) {}

            @Configuration
            public class JwtConfig {

                @Bean
                SecretKey jwtKey(JwtProperties props) {
                    return new SecretKeySpec(Base64.getDecoder().decode(props.secret()), "HmacSHA256");
                }

                @Bean
                JwtEncoder jwtEncoder(SecretKey jwtKey) {
                    return new NimbusJwtEncoder(new ImmutableSecret<>(jwtKey));
                }

                @Bean
                JwtDecoder jwtDecoder(SecretKey jwtKey) {
                    return NimbusJwtDecoder.withSecretKey(jwtKey).macAlgorithm(MacAlgorithm.HS256).build();
                }

                @Bean
                JwtAuthenticationConverter jwtAuthenticationConverter() {
                    var authorities = new JwtGrantedAuthoritiesConverter();
                    authorities.setAuthoritiesClaimName("roles");        // read the "roles" claim
                    authorities.setAuthorityPrefix("ROLE_");             // so hasRole("ADMIN") works
                    var converter = new JwtAuthenticationConverter();
                    converter.setJwtGrantedAuthoritiesConverter(authorities);
                    return converter;
                }
            }
            `,
          note: 'ImmutableSecret is com.nimbusds.jose.jwk.source.ImmutableSecret. By default the converter maps the "scope" claim to SCOPE_ authorities, which is why the custom converter is needed for roles.',
        },
        {
          title: '4. Security chain for the API',
          code: c`
            @Configuration
            @EnableWebSecurity
            @EnableMethodSecurity
            public class ApiSecurityConfig {

                @Bean
                SecurityFilterChain api(HttpSecurity http, JwtAuthenticationConverter jwtConverter) throws Exception {
                    http
                        .csrf(csrf -> csrf.disable())                    // OK: no cookies, token in a header
                        .cors(Customizer.withDefaults())
                        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                        .authorizeHttpRequests(auth -> auth
                            .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                            .requestMatchers("/actuator/health/**", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                            .requestMatchers("/api/admin/**").hasRole("ADMIN")
                            .anyRequest().authenticated())
                        .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter)));
                    return http.build();
                }

                @Bean
                AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                    return config.getAuthenticationManager();     // uses your UserDetailsService + PasswordEncoder
                }
            }
            `,
          note: 'Invalid or missing tokens get 401 with a WWW-Authenticate header; valid tokens without the role get 403.',
        },
        {
          title: '5. Login endpoint that issues the token',
          code: c`
            public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
            public record TokenResponse(String accessToken, String tokenType, long expiresIn) {}

            @RestController
            @RequestMapping("/auth")
            public class AuthController {
                private final AuthenticationManager authManager;
                private final JwtEncoder encoder;
                private final JwtProperties props;

                public AuthController(AuthenticationManager authManager, JwtEncoder encoder, JwtProperties props) {
                    this.authManager = authManager;
                    this.encoder = encoder;
                    this.props = props;
                }

                @PostMapping("/login")
                public TokenResponse login(@Valid @RequestBody LoginRequest req) {
                    Authentication auth = authManager.authenticate(
                            UsernamePasswordAuthenticationToken.unauthenticated(req.email(), req.password()));

                    List<String> roles = auth.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .filter(a -> a.startsWith("ROLE_"))
                            .map(a -> a.substring("ROLE_".length()))
                            .toList();

                    Instant now = Instant.now();
                    JwtClaimsSet claims = JwtClaimsSet.builder()
                            .issuer(props.issuer())
                            .subject(auth.getName())
                            .issuedAt(now)
                            .expiresAt(now.plus(props.ttl()))
                            .claim("roles", roles)
                            .build();
                    JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();   // required: default is RS256
                    String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
                    return new TokenResponse(token, "Bearer", props.ttl().toSeconds());
                }
            }
            `,
          note: 'Wrong credentials throw BadCredentialsException; map it to a 401 ProblemDetail in your @RestControllerAdvice. Add rate limiting on /auth/login and keep the TTL short; refresh tokens need their own stored, revocable token.',
        },
        {
          title: '6. Use the token & read the caller',
          code: c`
            @GetMapping("/api/me")
            public Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {
                return Map.of("email", jwt.getSubject(), "roles", jwt.getClaimAsStringList("roles"));
            }
            `,
          then: [
            {
              label: 'curl (macOS / Linux)',
              lang: 'bash',
              code: c`
                TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
                  -H "Content-Type: application/json" \
                  -d '{"email":"ana@example.com","password":"secret123"}' | jq -r .accessToken)
                curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/me
                `,
            },
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                $login = Invoke-RestMethod -Method Post -Uri http://localhost:8080/auth/login -ContentType 'application/json' -Body '{"email":"ana@example.com","password":"secret123"}'
                Invoke-RestMethod -Uri http://localhost:8080/api/me -Headers @{ Authorization = "Bearer $($login.accessToken)" }
                `,
            },
          ],
        },
      ],
    },
    {
      id: 'sec-method-cors',
      title: 'Method security & CORS',
      group: 'Security',
      items: [
        {
          title: '@PreAuthorize',
          code: c`
            @EnableMethodSecurity            // on any @Configuration class
            public class ApiSecurityConfig { ... }

            @Service
            public class OrderService {
                @PreAuthorize("hasRole('ADMIN')")
                public void refund(Long orderId) { ... }

                @PreAuthorize("hasRole('ADMIN') or #email == authentication.name")
                public List<Order> ordersFor(String email) { ... }
            }
            `,
          note: 'Method security protects the service even if a new endpoint forgets a URL rule. Denied calls return 403.',
        },
        {
          title: 'CORS with Spring Security',
          code: c`
            @Bean
            CorsConfigurationSource corsConfigurationSource() {
                var config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("http://localhost:5173", "https://app.example.com"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
                config.setMaxAge(3600L);
                var source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
            }
            // and in the chain: http.cors(Customizer.withDefaults())
            `,
          note: 'http.cors() picks up this bean and answers preflight OPTIONS requests before authentication. Read the allowed origins from configuration in real apps.',
        },
        {
          title: 'CSRF: when to disable',
          note: 'Disable CSRF only for stateless APIs that authenticate with an Authorization header. If the browser sends a session or auth cookie (including a JWT stored in a cookie), keep CSRF on and use CookieCsrfTokenRepository for SPAs.',
        },
      ],
    },

    // ───────────────────────── Testing ─────────────────────────
    {
      id: 'test-unit',
      title: 'JUnit 5, AssertJ & Mockito',
      group: 'Testing',
      items: [
        {
          title: 'JUnit 5 + AssertJ',
          code: c`
            import static org.assertj.core.api.Assertions.*;

            class MoneyTest {

                @Test
                void addsAmounts() {
                    var sum = new Money(new BigDecimal("1.50"), "EUR").plus(new Money(new BigDecimal("2.00"), "EUR"));
                    assertThat(sum.amount()).isEqualByComparingTo("3.50");
                }

                @Test
                void rejectsBadCurrency() {
                    assertThatThrownBy(() -> new Money(BigDecimal.ONE, "EURO"))
                            .isInstanceOf(IllegalArgumentException.class)
                            .hasMessageContaining("ISO");
                }

                @ParameterizedTest
                @CsvSource({"1,1,2", "2,3,5"})
                void adds(int a, int b, int expected) {
                    assertThat(a + b).isEqualTo(expected);
                }
            }
            `,
          note: 'spring-boot-starter-test already includes JUnit 5, AssertJ, Mockito and Hamcrest. Test classes and methods can be package-private.',
        },
        {
          title: 'Mockito unit test (no Spring context)',
          code: c`
            @ExtendWith(MockitoExtension.class)
            class ProductServiceTest {
                @Mock ProductRepository products;
                @Mock CategoryRepository categories;
                @InjectMocks ProductService service;

                @Test
                void getThrowsWhenMissing() {
                    when(products.findById(42L)).thenReturn(Optional.empty());

                    assertThatThrownBy(() -> service.get(42L)).isInstanceOf(NotFoundException.class);
                    verify(products).findById(42L);
                    verifyNoMoreInteractions(products);
                }
            }
            `,
          note: 'Fast and the first choice for business logic. Constructor injection makes @InjectMocks (or plain new ProductService(mock, mock)) trivial.',
        },
        {
          title: 'Run tests',
          lang: 'bash',
          code: c`
            # macOS / Linux
            ./mvnw test
            ./mvnw test -Dtest=ProductServiceTest#getThrowsWhenMissing
            ./gradlew test --tests "*ProductServiceTest"

            # Windows (PowerShell)
            .\mvnw.cmd test "-Dtest=ProductServiceTest#getThrowsWhenMissing"
            .\gradlew.bat test --tests "*ProductServiceTest"
            `,
          note: 'Reports land in target/surefire-reports (Maven) or build/reports/tests/test/index.html (Gradle).',
        },
      ],
    },
    {
      id: 'test-web',
      title: 'Controller tests with MockMvc',
      group: 'Testing',
      items: [
        {
          title: '@WebMvcTest + @MockitoBean',
          code: c`
            import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
            import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

            @WebMvcTest(ProductController.class)
            class ProductControllerTest {
                @Autowired MockMvc mvc;
                @MockitoBean ProductService service;      // org.springframework.test.context.bean.override.mockito

                @Test
                @WithMockUser
                void returnsProduct() throws Exception {
                    when(service.get(1L)).thenReturn(new ProductResponse(1L, "Mug", new BigDecimal("9.90"), "Kitchen", Instant.now()));

                    mvc.perform(get("/api/products/1"))
                            .andExpect(status().isOk())
                            .andExpect(jsonPath("$.name").value("Mug"));
                }

                @Test
                @WithMockUser
                void rejectsInvalidBody() throws Exception {
                    mvc.perform(post("/api/products").with(csrf())
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content("""
                                        {"name": "", "price": -1}
                                        """))
                            .andExpect(status().isBadRequest())
                            .andExpect(jsonPath("$.errors.name").exists());
                }
            }
            `,
          note: '@MockitoBean replaced @MockBean in Spring Boot 3.4 (@MockBean is removed in Boot 4). @WebMvcTest loads only the web layer plus your security config; csrf() and @WithMockUser come from spring-security-test.',
        },
        {
          title: 'Test JWT-protected endpoints',
          code: c`
            import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

            mvc.perform(get("/api/admin/stats")
                            .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                    .andExpect(status().isOk());

            mvc.perform(get("/api/admin/stats"))
                    .andExpect(status().isUnauthorized());
            `,
          note: 'In Spring Boot 4 the test slices moved into per-technology modules (for example a webmvc test starter), so imports for @WebMvcTest change; check the Boot 4 migration guide for the exact artifact and package names.',
        },
      ],
    },
    {
      id: 'test-data',
      title: 'Repository & integration tests (Testcontainers)',
      group: 'Testing',
      items: [
        {
          title: 'Dependencies',
          lang: 'xml',
          code: c`
            <dependency>
              <groupId>org.springframework.boot</groupId>
              <artifactId>spring-boot-testcontainers</artifactId>
              <scope>test</scope>
            </dependency>
            <dependency>
              <groupId>org.testcontainers</groupId>
              <artifactId>junit-jupiter</artifactId>
              <scope>test</scope>
            </dependency>
            <dependency>
              <groupId>org.testcontainers</groupId>
              <artifactId>postgresql</artifactId>
              <scope>test</scope>
            </dependency>
            `,
          note: 'Testcontainers needs a running Docker (Docker Desktop on macOS / Windows). Start.spring.io adds all three when you pick Testcontainers. Boot 4 uses Testcontainers 2, which renamed these artifacts and packages; check its migration notes.',
        },
        {
          title: 'Shared container config',
          code: c`
            @TestConfiguration(proxyBeanMethods = false)
            public class TestcontainersConfiguration {
                @Bean
                @ServiceConnection                           // sets spring.datasource.* automatically
                PostgreSQLContainer<?> postgres() {
                    return new PostgreSQLContainer<>("postgres:17-alpine");
                }
            }
            `,
        },
        {
          title: '@DataJpaTest against real PostgreSQL',
          code: c`
            @DataJpaTest
            @AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
            @Import(TestcontainersConfiguration.class)
            class ProductRepositoryTest {
                @Autowired ProductRepository products;
                @Autowired TestEntityManager em;

                @Test
                void findsByName() {
                    var cat = em.persist(new Category("Kitchen"));
                    em.persist(new Product("Blue mug", new BigDecimal("9.90"), cat));

                    var page = products.findByNameContainingIgnoreCase("mug", PageRequest.of(0, 10));
                    assertThat(page.getContent()).extracting(Product::getName).containsExactly("Blue mug");
                }
            }
            `,
          note: 'Each test runs in a transaction that is rolled back. Flyway migrations run first, so ddl-auto: validate also checks your mappings.',
        },
        {
          title: 'Full @SpringBootTest',
          code: c`
            @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
            @AutoConfigureMockMvc
            @Import(TestcontainersConfiguration.class)
            class ProductApiIT {
                @Autowired MockMvc mvc;

                @Test
                void healthIsUp() throws Exception {
                    mvc.perform(get("/actuator/health")).andExpect(status().isOk());
                }
            }
            `,
          note: 'Name integration tests *IT and add the maven-failsafe-plugin so ./mvnw verify runs them separately from fast unit tests.',
        },
        {
          title: 'Run the app locally with the same containers',
          code: c`
            // src/test/java/com/example/demo/TestDemoApplication.java
            public class TestDemoApplication {
                public static void main(String[] args) {
                    SpringApplication.from(DemoApplication::main)
                            .with(TestcontainersConfiguration.class)
                            .run(args);
                }
            }
            `,
          then: [
            {
              label: 'Start it',
              lang: 'bash',
              code: c`
                # macOS / Linux
                ./mvnw spring-boot:test-run
                ./gradlew bootTestRun

                # Windows (PowerShell)
                .\mvnw.cmd spring-boot:test-run
                .\gradlew.bat bootTestRun
                `,
            },
          ],
          note: 'A database starts in Docker and is wired in automatically, so nothing needs installing locally.',
        },
      ],
    },

    // ───────────────────────── Production ─────────────────────────
    {
      id: 'prod-actuator',
      title: 'Actuator: health, info & metrics',
      group: 'Production',
      items: [
        {
          title: 'Expose endpoints',
          lang: 'yaml',
          code: c`
            management:
              endpoints:
                web:
                  exposure:
                    include: health,info,metrics,prometheus
              endpoint:
                health:
                  show-details: when-authorized
                  probes:
                    enabled: true          # /actuator/health/liveness and /readiness
              info:
                env:
                  enabled: true
            info:
              app:
                version: '@project.version@'      # filled in by Maven resource filtering
            `,
          note: 'Only health is exposed over HTTP by default. Never expose env, heapdump or loggers publicly; move management to a private port or protect it with Spring Security.',
          then: [
            {
              label: 'Actuator on a separate port (not proxied by Nginx)',
              lang: 'yaml',
              code: c`
                management:
                  server:
                    port: 8081
                `,
            },
          ],
        },
        {
          title: 'Check it',
          lang: 'bash',
          code: c`
            # same on every OS
            curl http://localhost:8080/actuator/health
            curl http://localhost:8080/actuator/health/readiness
            curl http://localhost:8080/actuator/metrics/http.server.requests
            `,
        },
        {
          title: 'Custom health indicator',
          code: c`
            @Component
            public class PaymentGatewayHealth implements HealthIndicator {
                private final PaymentGateway gateway;

                public PaymentGatewayHealth(PaymentGateway gateway) { this.gateway = gateway; }

                @Override
                public Health health() {
                    return gateway.ping() ? Health.up().build() : Health.down().withDetail("gateway", "unreachable").build();
                }
            }
            `,
          note: 'Prometheus scraping needs io.micrometer:micrometer-registry-prometheus on the classpath.',
        },
      ],
    },
    {
      id: 'prod-jar',
      title: 'Build & run the jar',
      group: 'Production',
      items: [
        {
          title: 'Build an executable jar',
          lang: 'bash',
          code: c`
            # macOS / Linux
            ./mvnw clean package -DskipTests          # → target/app.jar (with <finalName>app</finalName>)
            ./gradlew bootJar                         # → build/libs/demo-0.0.1-SNAPSHOT.jar

            # Windows (PowerShell)
            .\mvnw.cmd clean package "-DskipTests"
            .\gradlew.bat bootJar
            `,
          note: 'Run the tests in CI even if you skip them for a quick local build.',
        },
        {
          title: 'Run it',
          lang: 'bash',
          code: c`
            # same on every OS
            java -jar target/app.jar
            java -jar target/app.jar --spring.profiles.active=prod --server.port=9090
            java -Xms256m -Xmx512m -jar target/app.jar
            `,
          then: [
            {
              label: 'With env vars for one run — macOS / Linux',
              lang: 'bash',
              code: c`
                SPRING_PROFILES_ACTIVE=prod DB_URL=jdbc:postgresql://db:5432/app java -jar target/app.jar
                `,
            },
            {
              label: 'Windows (PowerShell)',
              lang: 'powershell',
              code: c`
                $env:SPRING_PROFILES_ACTIVE = "prod"; $env:DB_URL = "jdbc:postgresql://db:5432/app"
                java -jar target\app.jar
                `,
            },
          ],
        },
        {
          title: 'Graceful shutdown & virtual threads',
          lang: 'yaml',
          code: c`
            server:
              shutdown: graceful                       # default since Boot 3.4
            spring:
              lifecycle:
                timeout-per-shutdown-phase: 30s
              threads:
                virtual:
                  enabled: true                        # Tomcat + @Async on virtual threads (Java 21+)
            `,
        },
      ],
    },
    {
      id: 'prod-systemd',
      title: 'Ubuntu server: systemd, Nginx & HTTPS',
      group: 'Production',
      items: [
        {
          title: '1. Install Java and create a user',
          lang: 'bash',
          code: c`
            sudo apt update && sudo apt install -y openjdk-21-jre-headless nginx
            sudo useradd --system --home /opt/app --shell /usr/sbin/nologin app
            sudo mkdir -p /opt/app && sudo chown app:app /opt/app
            `,
          note: 'Creating the server itself (firewall, SSH, static IP) is covered in the AWS, GCP and Azure sheets.',
        },
        {
          title: '2. Copy the jar and the env file',
          lang: 'bash',
          code: c`
            # from your computer (macOS / Linux / Windows PowerShell)
            scp target/app.jar ubuntu@203.0.113.10:/tmp/app.jar

            # on the server
            sudo mv /tmp/app.jar /opt/app/app.jar && sudo chown app:app /opt/app/app.jar
            sudo nano /opt/app/app.env
            sudo chmod 600 /opt/app/app.env && sudo chown app:app /opt/app/app.env
            `,
          then: [
            {
              label: '/opt/app/app.env',
              lang: 'env',
              code: c`
                SPRING_PROFILES_ACTIVE=prod
                DB_URL=jdbc:postgresql://localhost:5432/app
                DB_USER=app
                DB_PASSWORD=change-me
                JWT_SECRET=paste-generated-base64-secret
                `,
            },
          ],
        },
        {
          title: '3. systemd unit',
          lang: 'ini',
          code: c`
            # /etc/systemd/system/app.service
            [Unit]
            Description=Spring Boot app
            After=network.target

            [Service]
            User=app
            Group=app
            WorkingDirectory=/opt/app
            EnvironmentFile=/opt/app/app.env
            ExecStart=/usr/bin/java -Xms256m -Xmx512m -jar /opt/app/app.jar
            SuccessExitStatus=143
            Restart=always
            RestartSec=5

            [Install]
            WantedBy=multi-user.target
            `,
          note: 'SuccessExitStatus=143 tells systemd that the JVM exiting after SIGTERM is a clean stop.',
          then: [
            {
              label: 'Enable, start, follow logs',
              lang: 'bash',
              code: c`
                sudo systemctl daemon-reload
                sudo systemctl enable --now app
                sudo systemctl status app
                journalctl -u app -f
                sudo systemctl restart app          # after each deploy
                `,
            },
          ],
        },
        {
          title: '4. Nginx reverse proxy',
          lang: 'nginx',
          code: c`
            # /etc/nginx/sites-available/app
            server {
                listen 80;
                server_name api.example.com;
                client_max_body_size 10m;

                location / {
                    proxy_pass http://127.0.0.1:8080;
                    proxy_set_header Host $host;
                    proxy_set_header X-Real-IP $remote_addr;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_set_header X-Forwarded-Proto $scheme;
                }
            }
            `,
          then: [
            {
              label: 'Enable the site',
              lang: 'bash',
              code: c`
                sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/
                sudo rm -f /etc/nginx/sites-enabled/default
                sudo nginx -t && sudo systemctl reload nginx
                `,
            },
            {
              label: 'application-prod.yml: trust the forwarded headers, listen locally only',
              lang: 'yaml',
              code: c`
                server:
                  address: 127.0.0.1
                  forward-headers-strategy: framework
                `,
            },
          ],
          note: 'Without forward-headers-strategy, redirects and generated links (like the 201 Location header) use http and the internal port.',
        },
        {
          title: '5. HTTPS with Certbot',
          lang: 'bash',
          code: c`
            sudo apt install -y certbot python3-certbot-nginx
            sudo certbot --nginx -d api.example.com
            sudo certbot renew --dry-run
            `,
          note: 'Point the DNS A record at the server first. A systemd timer renews the certificate automatically.',
        },
      ],
    },
    {
      id: 'prod-docker',
      title: 'Docker images',
      group: 'Production',
      items: [
        {
          title: 'Multi-stage Dockerfile',
          lang: 'dockerfile',
          code: c`
            # build stage
            FROM eclipse-temurin:21-jdk AS build
            WORKDIR /src
            COPY .mvn/ .mvn/
            COPY mvnw pom.xml ./
            RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline
            COPY src/ src/
            RUN ./mvnw -B -q package -DskipTests

            # runtime stage
            FROM eclipse-temurin:21-jre
            RUN useradd --system --uid 10001 app
            WORKDIR /app
            COPY --from=build /src/target/*.jar app.jar
            USER app
            EXPOSE 8080
            ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
            `,
          note: 'Copying pom.xml before src lets Docker cache the dependency download layer. If the build fails with "mvnw: not found" on Windows, the file has CRLF line endings; add *.sh and mvnw as eol=lf in .gitattributes.',
          then: [
            {
              label: '.dockerignore',
              lang: 'text',
              code: c`
                target/
                build/
                .git/
                .idea/
                *.env
                `,
            },
          ],
        },
        {
          title: 'Build & run',
          lang: 'bash',
          code: c`
            # same on every OS
            docker build -t demo-api .
            docker run --rm -p 8080:8080 -e SPRING_PROFILES_ACTIVE=prod -e DB_URL=jdbc:postgresql://host.docker.internal:5432/app -e DB_USER=app -e DB_PASSWORD=secret -e JWT_SECRET=change-me demo-api
            `,
          note: 'host.docker.internal reaches a database on your computer from Docker Desktop. On a Linux host, add --add-host=host.docker.internal:host-gateway.',
        },
        {
          title: 'Cloud Native Buildpacks (no Dockerfile)',
          lang: 'bash',
          code: c`
            # macOS / Linux
            ./mvnw spring-boot:build-image "-Dspring-boot.build-image.imageName=demo-api"
            ./gradlew bootBuildImage --imageName=demo-api

            # Windows (PowerShell)
            .\mvnw.cmd spring-boot:build-image "-Dspring-boot.build-image.imageName=demo-api"
            .\gradlew.bat bootBuildImage --imageName=demo-api
            `,
          note: 'Produces a layered, non-root image with a memory calculator already tuned for containers. Needs a running Docker daemon.',
        },
      ],
    },
    {
      id: 'prod-ci',
      title: 'GitHub Actions CI',
      group: 'Production',
      items: [
        {
          title: '.github/workflows/ci.yml',
          lang: 'yaml',
          code: c`
            name: CI
            on:
              push:
                branches: [main]
              pull_request:

            jobs:
              build:
                runs-on: ubuntu-latest
                steps:
                  - uses: actions/checkout@v4
                  - uses: actions/setup-java@v4
                    with:
                      distribution: temurin
                      java-version: '21'
                      cache: maven
                  - run: chmod +x mvnw
                  - run: ./mvnw -B verify             # unit + Testcontainers tests (Docker is available)
                  - uses: actions/upload-artifact@v4
                    with:
                      name: app-${GH} github.sha }}
                      path: target/app.jar
            `,
          note: 'For Gradle use cache: gradle (or gradle/actions/setup-gradle) and run ./gradlew build. The CI/CD sheet covers deploying the artifact over SSH or to the cloud.',
        },
        {
          title: 'Build and push an image to GHCR',
          lang: 'yaml',
          code: c`
              image:
                needs: build
                if: github.ref == 'refs/heads/main'
                runs-on: ubuntu-latest
                permissions:
                  contents: read
                  packages: write
                steps:
                  - uses: actions/checkout@v4
                  - uses: docker/login-action@v3
                    with:
                      registry: ghcr.io
                      username: ${GH} github.actor }}
                      password: ${GH} secrets.GITHUB_TOKEN }}
                  - uses: docker/build-push-action@v6
                    with:
                      push: true
                      tags: ghcr.io/${GH} github.repository }}:${GH} github.sha }}
            `,
          note: 'Add this job under jobs: in the same workflow. GHCR image names must be lowercase, so lowercase the repository name if it contains capitals.',
        },
      ],
    },
    {
      id: 'prod-jvm',
      title: 'JVM tuning basics',
      group: 'Production',
      items: [
        {
          title: 'Memory flags',
          lang: 'bash',
          code: c`
            # VM / bare metal: fixed heap
            java -Xms512m -Xmx512m -jar app.jar

            # containers: size the heap from the container memory limit
            java -XX:MaxRAMPercentage=75 -jar app.jar

            # write a heap dump if it runs out of memory
            java -Xmx512m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp -jar app.jar
            `,
          note: 'The JVM is container-aware, but its default heap is only 25% of the limit. Leave headroom for metaspace, threads and native memory: heap around 75% of the container limit is a sane start.',
        },
        {
          title: 'Look inside a running JVM',
          lang: 'bash',
          code: c`
            # same on every OS (tools ship with the JDK)
            jps -l                                   # Java process ids
            jcmd <pid> VM.flags
            jcmd <pid> GC.heap_info
            jcmd <pid> Thread.print > threads.txt     # thread dump
            jcmd <pid> GC.heap_dump /tmp/heap.hprof
            jcmd <pid> JFR.start duration=60s filename=/tmp/rec.jfr   # profile with Flight Recorder
            `,
          note: 'Open heap dumps in Eclipse MAT or IntelliJ, and .jfr files in JDK Mission Control.',
        },
        {
          title: 'Faster startup',
          lang: 'yaml',
          code: c`
            spring:
              main:
                lazy-initialization: true     # beans created on first use; errors surface later
            `,
          note: 'Heavier options: class data sharing (AppCDS, extended in Java 24–25 by the ahead-of-time cache) and GraalVM native images via Spring Boot AOT. Measure first; most APIs never need them.',
        },
      ],
    },

    // ───────────────────────── Troubleshooting ─────────────────────────
    {
      id: 'troubleshooting',
      title: 'Common errors & fixes',
      group: 'Troubleshooting',
      items: [
        {
          title: 'Error table',
          lang: 'text',
          code: c`
            JAVA_HOME is not defined correctly            set JAVA_HOME to the JDK folder (not .../bin), open a new terminal
            release version 21 not supported              build runs on an older JDK: java -version, check IDE project SDK
            Port 8080 was already in use                  stop the other process or set server.port / SERVER_PORT
            Failed to configure a DataSource: 'url'       JPA starter present but no spring.datasource.url (or wrong profile)
            Connection refused :5432                      database not running / wrong host; in Docker use the service name
            LazyInitializationException: no Session       lazy relation read outside a transaction → fetch join,
                                                          @EntityGraph or map to a DTO inside the @Transactional service
            The dependencies of some beans form a cycle   circular constructor injection → extract a third bean or use events
            401 on every request after adding Security    default login is on: generated password in the log; define a SecurityFilterChain
            403 on POST / PUT / DELETE                    CSRF token missing (session apps) or role missing (hasRole)
            Whitelabel Error Page 404                     controller outside the main class package, or wrong mapping path
            Name for argument of type [Long] not specified   compile with -parameters (Boot parent / plugin does it) or @PathVariable("id")
            JSON infinite recursion / StackOverflowError  entity ↔ entity references serialized → return DTOs (or @JsonIgnore)
            No serializer found for class ...HibernateProxy   returning a lazy entity proxy → return DTOs
            Validate failed: Migration checksum mismatch  an applied migration file was edited → revert it, or flyway repair
            Schema-validation: missing column             entity and migrations disagree → add a new migration
            java.lang.OutOfMemoryError: Java heap space   raise -Xmx / MaxRAMPercentage, then look for leaks with a heap dump
            UnsupportedClassVersionError (class file 65)  jar built for Java 21 run on an older JRE → upgrade the runtime
            `,
        },
        {
          title: 'Which Java is actually used?',
          lang: 'bash',
          code: c`
            # macOS
            which java && java -version && echo $JAVA_HOME
            /usr/libexec/java_home -V

            # Linux (Ubuntu / Debian)
            which java && java -version && echo $JAVA_HOME
            update-alternatives --list java

            # Windows (PowerShell)
            Get-Command java -All | Select-Object Source
            java -version; $env:JAVA_HOME

            # what Maven uses (same on every OS, with the matching wrapper)
            ./mvnw -v
            `,
          note: 'The IDE has its own setting (Project SDK / java.jdt.ls.java.home) that can differ from the terminal.',
        },
        {
          title: 'Port 8080 already in use',
          lang: 'bash',
          code: c`
            # macOS / Linux
            lsof -i :8080                       # find the PID
            kill <PID>                          # kill -9 <PID> if it ignores SIGTERM
            sudo ss -ltnp | grep 8080           # Linux alternative

            # Windows (PowerShell)
            Get-NetTCPConnection -LocalPort 8080 | Select-Object OwningProcess
            Stop-Process -Id <PID>
            `,
          note: 'Often it is a previous run of the same app still alive in another terminal or the IDE.',
        },
        {
          title: 'Flyway checksum mismatch (dev database only)',
          lang: 'bash',
          code: c`
            # macOS / Linux — needs the flyway-maven-plugin configured with your DB url
            ./mvnw flyway:repair

            # Windows (PowerShell)
            .\mvnw.cmd flyway:repair
            `,
          note: 'repair updates the stored checksums to match the files. On shared or production databases, revert the edited file and add a new migration instead.',
        },
        {
          title: 'Fix LazyInitializationException properly',
          code: c`
            // repository: load what the response needs in one query
            @EntityGraph(attributePaths = {"category"})
            Optional<Product> findWithCategoryById(Long id);

            // service: map inside the transaction
            @Transactional(readOnly = true)
            public ProductResponse get(Long id) {
                return products.findWithCategoryById(id).map(ProductResponse::from).orElseThrow();
            }
            `,
          note: 'Do not "fix" it by turning on open-in-view or switching relations to EAGER; both hide N+1 queries.',
        },
        {
          title: 'See why Spring did or did not configure something',
          lang: 'bash',
          code: c`
            # macOS / Linux
            ./mvnw spring-boot:run "-Dspring-boot.run.arguments=--debug"
            java -jar target/app.jar --debug

            # Windows (PowerShell)
            .\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--debug"
            `,
          note: '--debug prints the condition evaluation report: which auto-configurations matched and why the others did not.',
        },
      ],
    },
  ],
}
