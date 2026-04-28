// Package postgres provides a PostgreSQL storage adapter for the AuthInGo framework.
//
// It implements the authingo.Store interface, allowing the core authentication
// engine to persist users and active sessions securely in a PostgreSQL database.
// This adapter is built on top of the standard database/sql library and is optimized
// for the "pgx" driver.
//
// Key Features:
//
//   - Complete Repository Implementation: Manages both User and Session lifecycles.
//   - Automated Garbage Collection: Fully supports AuthInGo's CleanupExpiredSessions
//     method to automatically scrub dead refresh tokens and prevent database bloat.
//   - Context-Aware: All database operations support context.Context for robust
//     timeouts and query cancellations.
//
// Usage:
//
//	db, _ := sql.Open("pgx", "postgres://user:pass@localhost:5432/mydb")
//	auth := authingo.New(authingo.Options{
//	    Store: postgres.NewAdapter(db),
//	})
package postgres