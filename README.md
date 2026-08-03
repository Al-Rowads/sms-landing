# SMS Landing

Arabic Next.js landing page for recording course interest. The production
container uses Next.js standalone output and stores lead data in CSV files
mounted from the host.

## Run with Docker Compose

The `data` directory must exist before Compose starts because it is mounted into
the container without automatic host-directory creation:

```sh
mkdir -p data
docker compose up --build -d
```

Open <http://localhost:3000>. To use another host port:

```sh
APP_PORT=8080 docker compose up --build -d
```

Operational commands:

```sh
docker compose ps
docker compose logs -f app
docker compose down
```

## Export interested leads

Open <http://localhost:3000/export> to download `leads.csv`. The export contains
only the `phone,name` columns from submitted interest records. The route is
public and exposes names and phone numbers to anyone who can access the URL.

## Data persistence

Compose mounts the host `./data` directory at `/app/data`. This directory is
excluded from the Docker build context so private names and phone numbers are
never embedded in the image.

- `data/mapping.csv` uses the `code,name,phone` header.
- `data/results.csv` uses the `name,phone,code,timestamp` header.

At container startup, missing or empty CSV files are initialized with their
expected headers. Populated files are preserved. The container also assigns the
mounted directory and these two files to the standard Node user with UID and GID
`1000`, then starts the application as that non-root user.

Because this updates ownership on the bind mount, the two CSV files and the
`data` directory appear on the host as owned by UID and GID `1000`. Back up the
entire directory to preserve mappings and results.

## Run without Compose

Build and start the image directly:

```sh
docker build -t sms-landing:local .
docker run --rm \
  --publish 3000:3000 \
  --mount type=bind,source="$(pwd)/data",target=/app/data \
  sms-landing:local
```

The application uses local CSV files and must run as a single replica.
Horizontal scaling requires replacing CSV persistence with shared storage that
provides concurrency control.
