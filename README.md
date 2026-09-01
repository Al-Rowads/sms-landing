# SMS Landing

Arabic Next.js landing pages for recording course interest and approximate
lifetime-unique landing visitors. The production stack uses Next.js standalone
output behind Nginx and persists server data in the host-mounted `data`
directory.

## Course landing pages

- `/` — Emotional Intelligence (`emotional-intelligence`)
- `/sale-eng` — Sales Engineering (`sales-engineering`)
- `/sale-coaching` — Sales Coaching 4 (`sales-coaching-4`)

All routes share one visual template while keeping course copy, metadata,
YouTube video, WhatsApp message, and packages in typed course configuration.
Sales Engineering uses rounded-up selling prices (`500$`, `700$`, `1,400$`)
based on its official variants. Sales Coaching 4 prices (`1,600$`, `1,800$`,
`2,300$`) were verified against its product page on 2026-09-01. Prices are
intentionally stored locally rather than scraped at runtime.

## Run with Docker Compose

The `data` directory must exist before Compose starts because it is mounted into
the container without automatic host-directory creation:

```sh
mkdir -p data
cp .env.example .env
openssl rand -hex 32
```

Paste the generated value into `VISITOR_IP_HASH_KEY` in `.env`, then start the
stack:

```sh
docker compose up --build -d
```

Open <http://localhost:3000>. To use another host port:

```sh
APP_PORT=8080 docker compose up --build -d
```

Operational commands:

```sh
docker compose ps
docker compose logs -f app proxy
docker compose down
```

Nginx is the only service with a published port. It overwrites the trusted
visitor-IP headers before proxying to Next.js and disables raw-IP access logs.
Do not publish the `app` service directly: that would bypass this trust boundary
and allow clients to supply misleading visitor headers.

## Visitor counting

Each valid landing-page IP is normalized and converted to an HMAC-SHA-256 identity.
The raw IP is never written to SQLite. The database stores the first and last
observed UTC timestamps and a landing-page view count for each identity. Shared
networks, VPNs, and rotating mobile addresses mean this is an approximate user
count, and automated visitors are included.

The write is scheduled with Next.js `after()` so it runs after the landing-page
response. APIs, exports, static assets, and health checks are not counted.
Failures are written to the app log and do not change the completed response.

Inspect the current counts from the running container:

```sh
docker compose exec app node --input-type=module -e '
  import { DatabaseSync } from "node:sqlite";
  const database = new DatabaseSync("/app/data/visitors.sqlite", { readOnly: true });
  console.log(database.prepare("SELECT COUNT(*) AS uniqueVisitors, COALESCE(SUM(view_count), 0) AS landingPageViews FROM visitors").get());
  database.close();
'
```

`VISITOR_IP_HASH_KEY` must remain secret and unchanged for the lifetime of the
campaign. Changing it makes returning addresses appear as new visitors. The
keyed identities are retained until the database is manually deleted.

## Export interested leads

Open <http://localhost:3000/export> to download `leads.csv`. The export contains
the `course,phone,name` columns from submitted interest records. Course IDs are
stable values from the route list above. The route is public and exposes names
and phone numbers to anyone who can access the URL.

## Data persistence and backup

Compose mounts the host `./data` directory at `/app/data`. This directory is
excluded from the Docker build context so private data is never embedded in the
image.

- `data/mapping.csv` uses the `code,name,phone` header.
- `data/results.csv` uses the `name,phone,code,course,timestamp` header.
- `data/visitors.sqlite` contains keyed visitor identities and counters. SQLite
  may also create `-wal` and `-shm` companion files while the app is running.

At container startup, missing or empty CSV files are initialized with their
expected headers. Populated files are preserved. The container assigns the
mounted directory and CSV files to the standard Node user with UID and GID
`1000`, then starts the application as that non-root user.

The application atomically migrates an existing four-column `results.csv` on
first access and assigns its historical rows to `emotional-intelligence`. Back
up the mounted `data` directory before the first deployment of this schema.

For a consistent file-level backup, stop the stack before copying the entire
`data` directory. Preserve the matching `VISITOR_IP_HASH_KEY` separately in the
deployment secret store:

```sh
docker compose down
cp -a data data-backup
docker compose up -d
```

The application still uses local storage and must run as a single replica.
Horizontal scaling requires moving both lead and visitor persistence to shared
storage with concurrency control.

## Local development and validation

Local requests sent directly to `next dev` do not include the trusted Nginx
header and therefore are not counted. Use Compose when validating visitor
tracking.

```sh
npm test
npm run build
```
