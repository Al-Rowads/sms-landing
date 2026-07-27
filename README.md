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

## Data persistence

Compose mounts the host `./data` directory at `/app/data`. This directory is
excluded from the Docker build context so private names and phone numbers are
never embedded in the image.

- `data/mapping.csv` is optional and uses the `code,name,phone` header.
- `data/results.csv` is created automatically with the
  `name,phone,code,timestamp` header when the first result is saved.

Do not pre-create an empty `results.csv`; either let the app create it or include
the expected header. Back up the entire `data` directory to preserve mappings
and results.

The image runs as the standard Node user with UID and GID `1000`. On Linux, make
sure that account can write the mounted directory and any existing
`results.csv`. For example:

```sh
sudo chown -R 1000:1000 data
```

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
