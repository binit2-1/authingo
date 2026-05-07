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

## Deploy to Render with Docker

Create a Render Web Service from the repository root and set the service
language to `Docker`. The root `Dockerfile` builds only this demo server while
keeping access to the root AuthInGo module and Postgres adapter.

If Render asks for a health check path, use `/healthz`.

Set these environment variables on the Render service:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@INTERNAL_HOST:5432/DATABASE
AUTHINGO_CROSS_SITE_COOKIES=true
AUTHINGO_ALLOWED_ORIGINS=https://your-docs-domain.com
```

Use origins only, not full URLs with paths. A trailing slash is OK, but the
canonical value should look like `https://authingo.vercel.app`.

`PORT` is optional. Render provides `PORT=10000` by default for web services,
and the server reads it automatically. For local Docker runs, the image defaults
to `PORT=8080`.

Use the Render Postgres internal database URL for `DATABASE_URL` when the
database and service are in the same Render region. Initialize that database
with `adapters/postgres/schema.sql` before using the playground.

After deployment, point the docs playground endpoint at the deployed backend
URL plus `/api/auth`, for example:

```ts
const demoEndpoint = "https://your-demo-server.onrender.com/api/auth";
```

If you use a custom API domain like `https://demo-api.authingo.dev`, add that
domain to the Render service and keep the playground endpoint as
`https://demo-api.authingo.dev/api/auth`.

## Reset Demo Data

```bash
pnpm db:demo:reset
```
