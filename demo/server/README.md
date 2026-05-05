# AuthInGo Demo Server

The demo server uses its own PostgreSQL database. Do not point it at the
Postgres adapter integration-test database.

## Start the Demo Database

From the repository root:

```bash
pnpm db:demo:up
```

The demo compose file mounts `adapters/postgres/schema.sql`, so the AuthInGo
tables and indexes are created when the Docker volume is first initialized.

## Configure Environment

Copy the example file if you want local overrides:

```bash
cp demo/server/.env.example demo/server/.env
```

## Run the Demo Server

```bash
DATABASE_URL="postgres://authingo_demo:authingo_demo_password@localhost:5433/authingo_demo?sslmode=disable" go run .
```

If `DATABASE_URL` is not set, the server uses that same local Docker URL.

For the public Sandpack demo server, also set:

```bash
AUTHINGO_CROSS_SITE_COOKIES=true
AUTHINGO_ALLOWED_ORIGINS=https://your-docs-domain.com
```

## Reset Demo Data

```bash
pnpm db:demo:reset
```
