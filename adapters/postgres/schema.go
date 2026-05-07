package postgres

import (
	"context"
	"database/sql"
	_ "embed"
	"strings"
)

// SchemaSQL contains the adapter's idempotent PostgreSQL schema.
//
//go:embed schema.sql
var SchemaSQL string

// ApplySchema runs the adapter's idempotent table/index setup statements.
func ApplySchema(ctx context.Context, db *sql.DB) error {
	for _, statement := range strings.Split(SchemaSQL, ";") {
		statement = strings.TrimSpace(statement)
		if statement == "" {
			continue
		}

		if _, err := db.ExecContext(ctx, statement); err != nil {
			return err
		}
	}

	return nil
}
