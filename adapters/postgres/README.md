# AuthInGo PostgreSQL Adapter

This adapter owns its own local PostgreSQL test database.

## Start Postgres

From the repository root:

```bash
pnpm db:postgres:up
```

The compose file mounts `schema.sql` into `/docker-entrypoint-initdb.d`, so all
tables and indexes are created when the Docker volume is initialized.

## Run Integration Tests

```bash
TEST_URL_DB="postgres://authingo:authingo_password@localhost:5432/authingo_postgres_adapter?sslmode=disable" go test ./...
```

If `TEST_URL_DB` is not set, the adapter tests use that same local Docker URL.

## Reset the Database

Schema changes only run automatically on first volume creation. Recreate the
volume after editing `schema.sql`:

```bash
pnpm db:postgres:reset
```
